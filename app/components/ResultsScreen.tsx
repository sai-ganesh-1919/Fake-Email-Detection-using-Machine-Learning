import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, XCircle, Mail, TrendingUp, Brain } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Badge } from "@/app/components/ui/badge";

export function ResultsScreen() {
  const navigate = useNavigate();
  const [scanData, setScanData] = useState<any>(null);

  useEffect(() => {
    const currentScan = localStorage.getItem("currentScan");
    if (!currentScan) {
      navigate("/input");
      return;
    }

    const data = JSON.parse(currentScan);
    setScanData(data);

    // Clear current scan after loading
    localStorage.removeItem("currentScan");
  }, [navigate]);

  if (!scanData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  // Data comes from Azure ML model response
  const isFake = scanData.isFake;
  const confidence = scanData.confidence * 100;
  const threatLevel = scanData.threatLevel;
  const indicators = scanData.indicators || [];
  const recommendations = scanData.recommendations || [];

  // Get threat level color
  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-300';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-300';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-300';
      case 'low': return 'text-green-600 bg-green-50 border-green-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/home")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button onClick={() => navigate("/input")}>
              New Analysis
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl">Azure ML Analysis Results</h1>
          </div>
          <p className="text-gray-600">Prediction from Microsoft Azure Machine Learning model</p>
        </div>

        {/* Main Result Card */}
        <Card className={`mb-6 border-2 ${getThreatColor(threatLevel)}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {isFake ? (
                  <XCircle className="w-16 h-16 text-red-600 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-16 h-16 text-green-600 flex-shrink-0" />
                )}
                <div>
                  <h2 className="text-3xl mb-2">
                    {isFake ? "⚠️ Fake Email Detected" : "✓ Email Appears Safe"}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-lg">
                      Model Confidence: <span className="font-semibold">{confidence.toFixed(1)}%</span>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(threatLevel)}>
                      {threatLevel.toUpperCase()} THREAT
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-sm text-gray-600 mb-2">Risk Level</div>
                <Progress 
                  value={isFake ? confidence : 100 - confidence} 
                  className="w-full md:w-40 h-3"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {isFake ? `${confidence.toFixed(0)}% Fake` : `${(100 - confidence).toFixed(0)}% Safe`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Email Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Sender</div>
                <div className="font-mono text-sm">{scanData.emailSender || scanData.senderEmail || "Not provided"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Subject</div>
                <div>{scanData.emailSubject || scanData.subject || "No subject"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Analyzed At</div>
                <div>{new Date(scanData.timestamp || scanData.analysisTimestamp).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Analysis ID</div>
                <div className="font-mono text-xs text-gray-600">{scanData.id}</div>
              </div>
            </CardContent>
          </Card>

          {/* Threat Indicators from Azure ML */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                ML Model Indicators ({indicators.length})
              </CardTitle>
              <CardDescription>Detected by Azure ML model</CardDescription>
            </CardHeader>
            <CardContent>
              {indicators.length > 0 ? (
                <div className="space-y-3">
                  {indicators.map((indicator: any, index: number) => (
                    <div key={index} className="border-l-2 border-red-400 pl-3 py-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{indicator.type}</span>
                        <Badge variant="outline" className={getSeverityColor(indicator.severity)}>
                          {indicator.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{indicator.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No specific threats detected</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations from Azure */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Security Recommendations
            </CardTitle>
            <CardDescription>Powered by Azure ML security analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-3">
              {recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm p-3 bg-gray-50 rounded-lg">
                  <span className="text-indigo-500 mt-0.5 text-lg">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Email Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Email Content Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700 max-h-64 overflow-y-auto">
                {scanData.emailBody || "No content available"}
              </pre>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/history")}
          >
            View History
          </Button>
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => navigate("/input")}
          >
            Analyze Another Email
          </Button>
        </div>
      </main>
    </div>
  );
}