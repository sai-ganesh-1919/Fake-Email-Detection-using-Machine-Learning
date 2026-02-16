import { useNavigate } from "react-router";
import { Shield, Scan, History, TrendingUp, FileText, Clock, LogOut } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { useState, useEffect } from "react";
import { getAnalysisHistory, logoutUser } from "@/app/services/azureApi";

export function HomeScreen() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem('user_email') || 'User';

  // Fetch history from Azure backend on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const data = await getAnalysisHistory(userId || undefined);
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const totalScans = history.length;
  const threatsDetected = history.filter((scan: any) => scan.isFake).length;
  const safeEmails = totalScans - threatsDetected;

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl">Fake Email Detector</h1>
                <p className="text-sm text-gray-500">{userEmail}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/history")}
              >
                <History className="w-4 h-4 mr-2" />
                View History
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl mb-2">Dashboard</h2>
          <p className="text-gray-600">Monitor your email security and analyze suspicious messages</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Scans</CardTitle>
              <FileText className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{totalScans}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Threats Detected</CardTitle>
              <TrendingUp className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-red-600">{threatsDetected}</div>
              <p className="text-xs text-gray-500 mt-1">Fake emails blocked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Safe Emails</CardTitle>
              <Shield className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-600">{safeEmails}</div>
              <p className="text-xs text-gray-500 mt-1">Legitimate messages</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/input")}>
            <CardHeader>
              <Scan className="w-10 h-10 text-indigo-600 mb-2" />
              <CardTitle className="text-2xl">New Email Scan</CardTitle>
              <CardDescription className="text-base">
                Analyze an email to detect phishing attempts and malicious content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Start Analysis
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="w-10 h-10 text-gray-600 mb-2" />
              <CardTitle className="text-2xl">Recent Activity</CardTitle>
              <CardDescription className="text-base">
                Your latest email security scans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Loading history...</p>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-3">
                  {history.slice(0, 3).map((scan: any) => (
                    <div key={scan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm truncate">{scan.emailSubject || "No subject"}</p>
                        <p className="text-xs text-gray-500">{new Date(scan.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs ${
                        scan.isFake ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                        {scan.isFake ? "Fake" : "Safe"}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => navigate("/history")}>
                    View All
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No scans yet</p>
                  <Button
                    variant="link"
                    className="text-indigo-600"
                    onClick={() => navigate("/input")}
                  >
                    Analyze your first email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}