import { useNavigate } from "react-router";
import { Shield, Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useState } from "react";
import { loginUser } from "@/app/services/azureApi";

export function WelcomeScreen() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // This calls your Azure Python backend authentication endpoint
      const response = await loginUser({ email, password });
      
      if (response.success) {
        localStorage.setItem('user_email', email);
        if (response.userId) {
          localStorage.setItem('user_id', response.userId);
        }
        navigate("/home");
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStart = () => {
    // Demo mode without login
    localStorage.setItem('user_email', 'demo@example.com');
    localStorage.setItem('user_id', 'demo_user');
    navigate("/home");
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-600 p-3 rounded-full">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to access Fake Email Detector</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowLogin(false)}
                disabled={loading}
              >
                Back to Welcome
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-4 rounded-full">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl mb-2">Fake Email Detector</h1>
          <p className="text-xl text-gray-600">Powered by AI to protect you from phishing and scam emails</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <Mail className="w-8 h-8 text-indigo-600 mb-2" />
              <CardTitle className="text-lg">Email Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Advanced AI scans email content, headers, and patterns to detect suspicious activity
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <AlertTriangle className="w-8 h-8 text-amber-600 mb-2" />
              <CardTitle className="text-lg">Threat Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Identifies phishing attempts, malicious links, and fraudulent sender information
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Real-Time Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get instant results with detailed analysis and security recommendations
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-6 text-lg"
            onClick={() => setShowLogin(true)}
          >
            Sign In
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-12 py-6 text-lg border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            onClick={handleQuickStart}
          >
            Try Demo
          </Button>
        </div>
      </div>
    </div>
  );
}