import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, Form, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { AuditDashboard } from "@audit/ui/components/audit/AuditDashboard";
import { Button } from "@audit/ui/components/ui/button";
import { Input } from "@audit/ui/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@audit/ui/components/ui/card";
import { Badge } from "@audit/ui/components/ui/badge";
import { Play, FolderOpen, History, Settings, Zap, Search, BarChart3 } from "lucide-react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // În implementarea reală, aceste date ar veni din baza de date
  return json({
    recentAudits: [
      {
        id: "1",
        projectName: "example-project",
        timestamp: new Date().toISOString(),
        healthScore: 8,
        maxScore: 10,
        auditType: "quick"
      }
    ],
    stats: {
      totalAudits: 42,
      avgHealthScore: 75,
      projectsTracked: 8,
      lastAudit: new Date().toISOString()
    }
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const projectPath = formData.get("projectPath");
  
  if (!projectPath) {
    return json({ error: "Project path is required" }, { status: 400 });
  }
  
  try {
    // API call către serverul de audit
    const auditType = intent === "quick" ? "quick" : 
                     intent === "detailed" ? "detailed" : "complete";
    
    const response = await fetch("http://localhost:3001/api/audit/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectPath: projectPath.toString(),
        auditType
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      return json({ error: error.message || "Audit failed" }, { status: 500 });
    }
    
    const result = await response.json();
    return json({ result });
    
  } catch (error: any) {
    console.error("Audit request failed:", error);
    return json({ 
      error: "Failed to connect to audit service. Make sure the API server is running." 
    }, { status: 500 });
  }
};

export default function Index() {
  const { recentAudits, stats } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigation = useNavigation();
  const [projectPath, setProjectPath] = useState("/path/to/your/project");
  
  const isRunning = navigation.state === "submitting" || fetcher.state === "submitting";
  const auditResult = fetcher.data?.result || null;
  const error = fetcher.data?.error || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DevOps Audit
                </h1>
              </div>
              <Badge variant="secondary">v1.0.0</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-4xl font-bold text-gray-900">
            Comprehensive DevOps Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Automated quality assessment for your development projects with actionable insights and recommendations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Audits</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.totalAudits}</div>
              <p className="text-xs text-blue-600">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Avg Health Score</CardTitle>
              <Zap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.avgHealthScore}%</div>
              <p className="text-xs text-green-600">+5% from last week</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Projects Tracked</CardTitle>
              <FolderOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.projectsTracked}</div>
              <p className="text-xs text-purple-600">2 added this week</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Last Audit</CardTitle>
              <History className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {stats.lastAudit ? new Date(stats.lastAudit).toLocaleDateString() : "N/A"}
              </div>
              <p className="text-xs text-orange-600">2 hours ago</p>
            </CardContent>
          </Card>
        </div>

        {/* Audit Interface */}
        <Card className="bg-white/50 backdrop-blur-sm border-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Run DevOps Audit</span>
            </CardTitle>
            <CardDescription>
              Analyze your project's DevOps practices and get actionable insights in seconds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}
            
            <Form method="post" className="space-y-4">
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <Input
                  name="projectPath"
                  placeholder="/path/to/your/project"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                  className="flex-1"
                  disabled={isRunning}
                />
              </div>
              
              <div className="grid gap-3 md:grid-cols-3">
                <Button 
                  type="submit"
                  name="intent"
                  value="quick"
                  disabled={isRunning || !projectPath.trim()}
                  className="flex items-center space-x-2"
                  variant={isRunning ? "secondary" : "default"}
                >
                  <Play className="h-4 w-4" />
                  <span>Quick Check</span>
                  <Badge variant="outline" className="ml-2">10s</Badge>
                </Button>
                
                <Button 
                  type="submit"
                  name="intent"
                  value="detailed"
                  disabled={isRunning || !projectPath.trim()}
                  className="flex items-center space-x-2"
                  variant="outline"
                >
                  <Search className="h-4 w-4" />
                  <span>Detailed Analysis</span>
                  <Badge variant="outline" className="ml-2">30s</Badge>
                </Button>
                
                <Button 
                  type="submit"
                  name="intent"
                  value="complete"
                  disabled={isRunning || !projectPath.trim()}
                  className="flex items-center space-x-2"
                  variant="outline"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Complete Audit</span>
                  <Badge variant="outline" className="ml-2">2min</Badge>
                </Button>
              </div>
            </Form>
            
            {/* Quick Tips */}
            <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg">
              <strong>💡 Pro Tips:</strong>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Use Quick Check for rapid CI/CD pipeline validation</li>
                <li>Detailed Analysis provides comprehensive metrics and recommendations</li>
                <li>Complete Audit includes security scanning and performance analysis</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <AuditDashboard 
          auditResult={auditResult} 
          isLoading={isRunning}
          className="transition-all duration-500"
        />

        {/* Recent Audits Preview */}
        {recentAudits.length > 0 && !auditResult && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Audits</CardTitle>
              <CardDescription>
                Quick overview of your latest project assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAudits.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{audit.projectName}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(audit.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {audit.auditType}
                      </Badge>
                      <div className="text-sm font-medium">
                        {audit.healthScore}/{audit.maxScore}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}