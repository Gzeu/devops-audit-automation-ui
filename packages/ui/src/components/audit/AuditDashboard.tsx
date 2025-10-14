import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import { cn, getHealthScoreColor, getHealthScoreStatus, formatNumber, formatDuration } from "../../lib/utils";

// Import types from API package
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

interface AuditDashboardProps {
  auditResult: AuditResult | null;
  isLoading: boolean;
  className?: string;
}

export function AuditDashboard({ auditResult, isLoading, className }: AuditDashboardProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <Clock className="animate-spin h-8 w-8 text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Running audit...</span>
      </div>
    );
  }

  if (!auditResult) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No audit results available</p>
            <p className="text-sm text-muted-foreground">Run an audit to see results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scorePercentage = (auditResult.healthScore / auditResult.maxScore) * 100;
  const status = getHealthScoreStatus(auditResult.healthScore, auditResult.maxScore);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                {auditResult.projectName}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>Audited on {new Date(auditResult.timestamp).toLocaleString()}</span>
                {auditResult.duration && (
                  <>
                    <span>•</span>
                    <span>Duration: {formatDuration(auditResult.duration)}</span>
                  </>
                )}
                <span>•</span>
                <Badge variant="outline" className="capitalize">
                  {auditResult.auditType} audit
                </Badge>
              </CardDescription>
            </div>
            <Badge variant={status.variant} className="text-lg px-4 py-2">
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Health Score</span>
                <span className={cn("text-2xl font-bold", getHealthScoreColor(auditResult.healthScore, auditResult.maxScore))}>
                  {auditResult.healthScore}/{auditResult.maxScore}
                </span>
              </div>
              <Progress value={scorePercentage} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {auditResult.findings.filter(f => f.type === 'pass').length}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {auditResult.findings.filter(f => f.type === 'fail').length}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {auditResult.warnings.length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(auditResult.metrics.linesOfCode)}
                </div>
                <div className="text-sm text-muted-foreground">Lines of Code</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Findings and Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <FindingsByCategory 
          findings={auditResult.findings} 
          title="Audit Results by Category"
        />
        <MetricsCard metrics={auditResult.metrics} />
      </div>

      {/* Detailed Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Findings</CardTitle>
          <CardDescription>
            Complete breakdown of all audit checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditResult.findings.map((finding, index) => (
              <FindingItem key={index} finding={finding} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface FindingsByCategoryProps {
  findings: Finding[];
  title: string;
}

function FindingsByCategory({ findings, title }: FindingsByCategoryProps) {
  const categories = ['git', 'docs', 'deps', 'testing', 'cicd', 'docker', 'security'] as const;
  
  const categoryStats = categories.map(category => {
    const categoryFindings = findings.filter(f => f.category === category);
    return {
      category,
      passed: categoryFindings.filter(f => f.type === 'pass').length,
      failed: categoryFindings.filter(f => f.type === 'fail').length,
      warnings: categoryFindings.filter(f => f.type === 'warn').length,
      total: categoryFindings.length
    };
  }).filter(stat => stat.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryStats.map(stat => (
            <div key={stat.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">{stat.category}</span>
                <span className="text-sm text-muted-foreground">
                  {stat.passed}/{stat.total}
                </span>
              </div>
              <div className="flex space-x-1 h-2">
                {Array.from({ length: stat.total }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex-1 rounded-sm",
                      index < stat.passed 
                        ? "bg-green-500" 
                        : index < stat.passed + stat.warnings
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricsCardProps {
  metrics: ProjectMetrics;
}

function MetricsCard({ metrics }: MetricsCardProps) {
  const metricItems = [
    { label: "Lines of Code", value: formatNumber(metrics.linesOfCode), color: "text-blue-600" },
    { label: "Source Files", value: metrics.fileCount.toString(), color: "text-green-600" },
    { label: "Test Files", value: metrics.testFiles.toString(), color: "text-purple-600" },
    { label: "Code Quality", value: `${Math.round(metrics.codeQuality)}%`, color: "text-orange-600" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metricItems.map((item, index) => (
            <div key={index} className="text-center p-4 bg-muted rounded-lg">
              <div className={cn("text-2xl font-bold", item.color)}>
                {item.value}
              </div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface FindingItemProps {
  finding: Finding;
}

function FindingItem({ finding }: FindingItemProps) {
  const getIcon = () => {
    switch (finding.type) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warn':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg border">
      {getIcon()}
      
      <div className="flex-1 space-y-1">
        <div className="font-medium">{finding.message}</div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs capitalize">
            {finding.category}
          </Badge>
          <Badge variant={getSeverityVariant(finding.severity)} className="text-xs capitalize">
            {finding.severity}
          </Badge>
          {finding.fixable && (
            <Badge variant="outline" className="text-xs">
              Fixable
            </Badge>
          )}
        </div>
        {finding.recommendation && (
          <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded">
            💡 {finding.recommendation}
          </div>
        )}
      </div>
    </div>
  );
}

export { FindingsByCategory, MetricsCard, FindingItem };