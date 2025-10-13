import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { AuditResult, Finding, ProjectMetrics, AuditRequest } from '../types/audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class AuditService {
  private scriptsPath: string;

  constructor() {
    // Path către scripturile din packages/core
    this.scriptsPath = path.resolve(__dirname, '../../../core/scripts');
  }

  async runAudit(request: AuditRequest): Promise<AuditResult> {
    const startTime = Date.now();
    
    try {
      let result: AuditResult;
      
      switch (request.auditType) {
        case 'quick':
          result = await this.runQuickHealthCheck(request.projectPath);
          break;
        case 'detailed':
          result = await this.runPythonAnalyzer(request.projectPath);
          break;
        case 'complete':
          result = await this.runCompleteAudit(request.projectPath);
          break;
        default:
          throw new Error(`Unsupported audit type: ${request.auditType}`);
      }
      
      const duration = Date.now() - startTime;
      result.duration = duration;
      result.auditType = request.auditType;
      
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        timestamp: new Date().toISOString(),
        projectName: path.basename(request.projectPath),
        projectPath: request.projectPath,
        healthScore: 0,
        maxScore: 10,
        findings: [{
          type: 'fail',
          category: 'git',
          message: `Audit failed: ${error.message}`,
          severity: 'critical'
        }],
        warnings: [],
        metrics: this.getEmptyMetrics(),
        status: 'error',
        duration,
        auditType: request.auditType
      };
    }
  }

  async runQuickHealthCheck(projectPath: string): Promise<AuditResult> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.scriptsPath, 'quick-health-check.sh');
      const child = spawn('bash', [scriptPath], {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          const result = this.parseQuickCheckOutput(output, projectPath);
          resolve(result);
        } else {
          reject(new Error(`Quick check failed: ${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to start quick check: ${error.message}`));
      });
    });
  }

  async runPythonAnalyzer(projectPath: string): Promise<AuditResult> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.scriptsPath, 'devops-analyzer.py');
      const child = spawn('python3', [scriptPath], {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          const result = this.parsePythonOutput(output, projectPath);
          resolve(result);
        } else {
          reject(new Error(`Python analyzer failed: ${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to start Python analyzer: ${error.message}`));
      });
    });
  }

  async runCompleteAudit(projectPath: string): Promise<AuditResult> {
    // Pentru now, folosim Python analyzer ca base pentru complete audit
    const result = await this.runPythonAnalyzer(projectPath);
    result.auditType = 'complete';
    result.maxScore = 100; // Complete audit has higher possible score
    return result;
  }

  private parseQuickCheckOutput(output: string, projectPath: string): AuditResult {
    const lines = output.split('\n').filter(line => line.trim());
    const findings: Finding[] = [];
    let healthScore = 0;
    const maxScore = 10;

    lines.forEach(line => {
      const cleanLine = line.trim();
      
      if (cleanLine.includes('✅')) {
        findings.push({
          type: 'pass',
          category: this.categorizeCheck(cleanLine),
          message: cleanLine.replace('✅ ', ''),
          severity: 'low',
          fixable: false
        });
        healthScore++;
      } else if (cleanLine.includes('❌')) {
        findings.push({
          type: 'fail',
          category: this.categorizeCheck(cleanLine),
          message: cleanLine.replace('❌ ', ''),
          severity: 'high',
          fixable: true,
          recommendation: this.getRecommendation(cleanLine)
        });
      } else if (cleanLine.includes('⚠️')) {
        findings.push({
          type: 'warn',
          category: this.categorizeCheck(cleanLine),
          message: cleanLine.replace('⚠️  ', '').replace('⚠️ ', ''),
          severity: 'medium',
          fixable: true,
          recommendation: this.getRecommendation(cleanLine)
        });
      }
    });

    const metrics = this.extractMetricsFromOutput(output);
    metrics.codeQuality = Math.round((healthScore / maxScore) * 100);

    return {
      timestamp: new Date().toISOString(),
      projectName: path.basename(projectPath),
      projectPath,
      healthScore,
      maxScore,
      findings,
      warnings: findings.filter(f => f.type === 'warn') as any[],
      metrics,
      status: 'success',
      auditType: 'quick'
    };
  }

  private parsePythonOutput(output: string, projectPath: string): AuditResult {
    const lines = output.split('\n').filter(line => line.trim());
    const findings: Finding[] = [];
    let healthScore = 0;
    const maxScore = 15;
    const metrics = this.getEmptyMetrics();

    lines.forEach(line => {
      const cleanLine = line.trim();
      
      // Extract score
      const scoreMatch = cleanLine.match(/HEALTH SCORE: (\d+)\/(\d+)/);
      if (scoreMatch) {
        healthScore = parseInt(scoreMatch[1]);
      }
      
      // Extract lines of code
      const locMatch = cleanLine.match(/Total lines of code: ([\d,]+)/);
      if (locMatch) {
        metrics.linesOfCode = parseInt(locMatch[1].replace(/,/g, ''));
      }
      
      // Extract file count
      const fileMatch = cleanLine.match(/Source files analyzed: (\d+)/);
      if (fileMatch) {
        metrics.fileCount = parseInt(fileMatch[1]);
      }

      // Parse findings similar to quick check
      if (cleanLine.includes('✅')) {
        findings.push({
          type: 'pass',
          category: this.categorizeCheck(cleanLine),
          message: cleanLine.replace('✅ ', ''),
          severity: 'low',
          fixable: false
        });
      } else if (cleanLine.includes('❌')) {
        findings.push({
          type: 'fail',
          category: this.categorizeCheck(cleanLine),
          message: cleanLine.replace('❌ ', ''),
          severity: 'high',
          fixable: true,
          recommendation: this.getRecommendation(cleanLine)
        });
      } else if (cleanLine.includes('⚠️')) {
        findings.push({
          type: 'warn',
          category: this.categorizeCheck(cleanLine),
          message: cleanLine.replace('⚠️  ', '').replace('⚠️ ', ''),
          severity: 'medium',
          fixable: true,
          recommendation: this.getRecommendation(cleanLine)
        });
      }
    });

    metrics.codeQuality = Math.round((healthScore / maxScore) * 100);

    return {
      timestamp: new Date().toISOString(),
      projectName: path.basename(projectPath),
      projectPath,
      healthScore,
      maxScore,
      findings,
      warnings: findings.filter(f => f.type === 'warn') as any[],
      metrics,
      status: 'success',
      auditType: 'detailed'
    };
  }

  private categorizeCheck(line: string): 'git' | 'docs' | 'deps' | 'testing' | 'cicd' | 'docker' | 'security' {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('git') || lowerLine.includes('repository')) return 'git';
    if (lowerLine.includes('readme') || lowerLine.includes('doc') || lowerLine.includes('changelog')) return 'docs';
    if (lowerLine.includes('package') || lowerLine.includes('dep') || lowerLine.includes('lock')) return 'deps';
    if (lowerLine.includes('test') || lowerLine.includes('spec')) return 'testing';
    if (lowerLine.includes('ci') || lowerLine.includes('action') || lowerLine.includes('workflow') || lowerLine.includes('pipeline')) return 'cicd';
    if (lowerLine.includes('docker') || lowerLine.includes('container')) return 'docker';
    if (lowerLine.includes('secret') || lowerLine.includes('.env') || lowerLine.includes('security')) return 'security';
    
    return 'git';
  }

  private getRecommendation(line: string): string {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('readme')) return 'Create a comprehensive README.md with project description, installation, and usage instructions';
    if (lowerLine.includes('gitignore')) return 'Add .gitignore file to exclude build artifacts and sensitive files';
    if (lowerLine.includes('test')) return 'Implement automated tests to ensure code quality and reliability';
    if (lowerLine.includes('docker')) return 'Containerize your application with Docker for consistent deployments';
    if (lowerLine.includes('ci') || lowerLine.includes('action')) return 'Set up CI/CD pipeline for automated testing and deployment';
    if (lowerLine.includes('.env')) return 'Remove .env from repository and add to .gitignore for security';
    if (lowerLine.includes('lock')) return 'Generate dependency lock file for reproducible builds';
    
    return 'Review and address this issue to improve project quality';
  }

  private extractMetricsFromOutput(output: string): ProjectMetrics {
    const metrics = this.getEmptyMetrics();
    
    const patterns = {
      linesOfCode: /Total lines of code: ([\d,]+)/,
      fileCount: /Source files analyzed: (\d+)/,
      testFiles: /Test files found \((\d+) files\)/,
      dependencies: /(\d+) dependencies/
    };
    
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = output.match(pattern);
      if (match) {
        const value = parseInt(match[1].replace(/,/g, ''));
        (metrics as any)[key] = value;
      }
    });
    
    return metrics;
  }

  private getEmptyMetrics(): ProjectMetrics {
    return {
      linesOfCode: 0,
      fileCount: 0,
      testFiles: 0,
      dependencies: 0,
      vulnerabilities: 0,
      codeQuality: 0,
      testCoverage: 0,
      duplicateCode: 0
    };
  }
}