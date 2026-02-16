import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Trash2, Search, Filter, Shield, AlertTriangle, Database } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { getAnalysisHistory, deleteHistoryItem } from "@/app/services/azureApi";

export function HistoryScreen() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this analysis from Azure database?")) {
      try {
        await deleteHistoryItem(id);
        setHistory(history.filter(scan => scan.id !== id));
      } catch (error) {
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all history? This will remove data from Azure database.")) {
      try {
        // Delete all items
        for (const item of history) {
          await deleteHistoryItem(item.id);
        }
        setHistory([]);
      } catch (error) {
        alert('Failed to clear history. Please try again.');
      }
    }
  };

  const filteredHistory = history.filter(scan => {
    const matchesSearch = 
      (scan.emailSubject?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (scan.emailSender?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "fake" && scan.isFake) ||
      (filterType === "safe" && !scan.isFake);

    return matchesSearch && matchesFilter;
  });

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading history from Azure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/home")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            {history.length > 0 && (
              <Button variant="destructive" onClick={handleClearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl">Analysis History</h1>
          </div>
          <p className="text-gray-600">View and manage your previous email analyses stored in Azure</p>
        </div>

        {history.length > 0 && (
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by subject or sender..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Emails</SelectItem>
                <SelectItem value="fake">Fake Only</SelectItem>
                <SelectItem value="safe">Safe Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl mb-2">
                {history.length === 0 ? "No analyses yet" : "No results found"}
              </h3>
              <p className="text-gray-500 mb-6">
                {history.length === 0
                  ? "Start analyzing emails to build your history"
                  : "Try adjusting your search or filter"}
              </p>
              {history.length === 0 && (
                <Button onClick={() => navigate("/input")} className="bg-indigo-600 hover:bg-indigo-700">
                  Analyze Your First Email
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((scan) => (
              <Card key={scan.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`p-3 rounded-lg ${
                        scan.isFake ? "bg-red-100" : "bg-green-100"
                      }`}>
                        {scan.isFake ? (
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        ) : (
                          <Shield className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="truncate">
                            {scan.emailSubject || "No subject"}
                          </h3>
                          <Badge variant="outline" className={scan.isFake ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                            {scan.isFake ? "Fake" : "Safe"}
                          </Badge>
                          <Badge variant="outline" className={getThreatColor(scan.threatLevel)}>
                            {scan.threatLevel?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="truncate">
                            <span className="font-medium">From:</span>{" "}
                            {scan.emailSender || "Unknown"}
                          </p>
                          <p>
                            <span className="font-medium">Analyzed:</span>{" "}
                            {new Date(scan.timestamp).toLocaleString()}
                          </p>
                          <p>
                            <span className="font-medium">Model Confidence:</span>{" "}
                            {(scan.confidence * 100).toFixed(1)}%
                          </p>
                          <p className="font-mono text-xs text-gray-400">
                            ID: {scan.id}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(scan.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredHistory.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Showing {filteredHistory.length} of {history.length} analyses
          </div>
        )}
      </main>
    </div>
  );
}