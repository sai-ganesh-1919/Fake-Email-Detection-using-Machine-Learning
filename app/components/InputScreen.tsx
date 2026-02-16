import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Mail, User, FileText, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { analyzeEmail, saveAnalysisToHistory } from "@/app/services/azureApi";

export function InputScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    senderEmail: "",
    senderName: "",
    subject: "",
    emailBody: "",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!formData.emailBody.trim()) {
      setError("Please enter email content to analyze");
      return;
    }

    setError("");
    setIsAnalyzing(true);

    try {
      // Call Azure Python backend ML model to analyze the email
      const userId = localStorage.getItem('user_id');
      const result = await analyzeEmail({
        emailContent: formData.emailBody,
        subject: formData.subject || "No Subject",
        sender: formData.senderEmail || formData.senderName || "Unknown",
        userId: userId || undefined,
      });

      // Save result to Azure database (or localStorage in mock mode)
      await saveAnalysisToHistory(result);

      // Store current scan result for Results screen
      localStorage.setItem("currentScan", JSON.stringify({
        ...formData,
        ...result,
        timestamp: result.analysisTimestamp,
      }));
      
      setIsAnalyzing(false);
      navigate("/results");
    } catch (err) {
      console.error('Analysis error:', err);
      setError("Failed to analyze email. Please try again.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Email Analysis</h1>
          <p className="text-gray-600">Enter the email details below to detect potential threats</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-indigo-600" />
              Input Email Information
            </CardTitle>
            <CardDescription>
              Paste the email content you want to analyze for phishing or spam detection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderEmail">Sender Email Address</Label>
                <Input
                  id="senderEmail"
                  type="email"
                  placeholder="sender@example.com"
                  value={formData.senderEmail}
                  onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Enter email subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailBody">Email Content *</Label>
              <Textarea
                id="emailBody"
                placeholder="Paste the entire email content here..."
                className="min-h-[300px] font-mono text-sm"
                value={formData.emailBody}
                onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
              />
              <p className="text-xs text-gray-500">* Required field</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm mb-1 text-blue-900">Azure ML Model Features</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Suspicious keyword and phrase detection</li>
                    <li>• Malicious link and URL pattern analysis</li>
                    <li>• Sender authenticity verification</li>
                    <li>• Urgency and pressure tactics identification</li>
                    <li>• Grammar and spelling anomaly detection</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing with Azure ML...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Run Model Prediction
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}