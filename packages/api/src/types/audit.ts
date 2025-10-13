export interface AuditResult {
  timestamp: string;
  projectName: string;
  projectPath: string;
  healthScore: number;
  maxScore: number;
  findings: Finding[];
  warnings: Warning[];
  metrics: ProjectMetrics;
  status: 'success' | 'error' | 'running';
  duration?: number;
  auditType: 'quick' | 'detailed' | 'complete';
}

export interface Finding {
  type: 'pass' | 'fail' | 'warn';
  category: 'git' | 'docs' | 'deps' | 'testing' | 'cicd' | 'docker' | 'security';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation?: string;
  fixable?: boolean;
}

export interface Warning extends Omit<Finding, 'type'> {
  type: 'warn';
}

export interface ProjectMetrics {
  linesOfCode: number;
  fileCount: number;
  testFiles: number;
  dependencies: number;
  vulnerabilities: number;
  codeQuality: number;
  testCoverage?: number;
  duplicateCode?: number;
}

export interface AuditHistory {
  id: string;
  projectPath: string;
  results: AuditResult[];
  lastAudit: string;
  trends: {
    healthScore: number[];
    timestamps: string[];
  };
}

export interface AuditRequest {
  projectPath: string;
  auditType: 'quick' | 'detailed' | 'complete';
  options?: {
    includeTests?: boolean;
    includeDependencies?: boolean;
    includeSecurity?: boolean;
  };
}