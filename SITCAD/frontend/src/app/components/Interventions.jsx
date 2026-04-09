import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../lib/firebase";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Sparkles,
  RefreshCw,
  Lightbulb,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Duckpit from './Duckpit';

const API_BASE = "http://localhost:8000";

async function getIdToken() {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error("Not authenticated");
  return firebaseUser.getIdToken();
}

export function Interventions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [interventions, setInterventions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState(null); // student id currently generating

  if (!user || user.role !== "teacher") {
    navigate("/");
    return null;
  }

  // Fetch all interventions + students on mount
  const fetchData = useCallback(async () => {
    try {
      const idToken = await getIdToken();
      const [interventionsRes, studentsRes] = await Promise.all([
        fetch(`${API_BASE}/ai-integrations/all-interventions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: idToken }),
        }),
        fetch(`${API_BASE}/teachers/my-students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: idToken }),
        }),
      ]);
      if (interventionsRes.ok) {
        setInterventions(await interventionsRes.json());
      }
      if (studentsRes.ok) {
        setStudents(await studentsRes.json());
      }
    } catch (error) {
      console.error("Error fetching interventions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateForStudent = async (studentId) => {
    setGeneratingFor(studentId);
    try {
      const idToken = await getIdToken();
      const res = await fetch(`${API_BASE}/ai-integrations/generate-interventions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken, student_id: studentId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to generate interventions");
      }
      const result = await res.json();
      toast.success(`Analysis complete for ${result.student_name}: ${result.intervention_count} intervention(s) identified`);
      // Refresh data
      await fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleUpdateStatus = async (interventionId, newStatus) => {
    try {
      const idToken = await getIdToken();
      const res = await fetch(`${API_BASE}/ai-integrations/update-intervention-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken, intervention_id: interventionId, status: newStatus }),
      });
      if (res.ok) {
        setInterventions((prev) =>
          prev.map((i) => (i.id === interventionId ? { ...i, status: newStatus } : i))
        );
        toast.success(`Intervention status updated to ${newStatus.replace("_", " ")}`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const pendingInterventions = interventions.filter((i) => i.status === "pending");
  const inProgressInterventions = interventions.filter((i) => i.status === "in_progress");
  const resolvedInterventions = interventions.filter((i) => i.status === "resolved");

  const handleBack = () => {
    navigate("/teacher");
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-base px-8 py-1 bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "text-base px-8 py-1 bg-orange-100 text-orange-700 border-orange-200";
      case "low":
        return "text-base px-8 py-1 bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "text-base px-8 py-1 bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "in_progress":
        return <Target className="h-5 w-5 text-blue-600" />;
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderInterventionCard = (intervention) => (
    <Card key={intervention.id} className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(intervention.status)}
              <CardTitle className="text-xl font-bold">
                {intervention.student_name || "Student"}
              </CardTitle>
            </div>
            <CardDescription className="mt-2 text-lg leading-relaxed">
              {intervention.area}
            </CardDescription>
          </div>
          <Badge
            className={`${getPriorityColor(intervention.priority)} border`}
          >
            {intervention.priority} priority
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Concern */}
        <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
          <p className="text-lg font-medium text-orange-900 mb-1">
            Concern Identified:
          </p>
          <p className="text-base text-muted-foreground">
            {intervention.concern}
          </p>
        </div>

        {/* AI Reasoning */}
        {intervention.ai_reasoning && (
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <p className="text-lg font-medium text-blue-900 mb-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> AI Reasoning:
            </p>
            <p className="text-base text-muted-foreground">
              {intervention.ai_reasoning}
            </p>
          </div>
        )}

        {/* Recommended Actions */}
        {intervention.recommended_actions && intervention.recommended_actions.length > 0 && (
          <div>
            <p className="text-lg font-medium mb-3">Recommended Actions:</p>
            <ul className="space-y-3">
              {intervention.recommended_actions.map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-base">
                  <div className="w-5 h-5 rounded-full bg-green-300 text-black-600 flex items-center justify-center text-xs font-medium shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status actions + date */}
        <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
          <span>
            Created: {intervention.created_at ? new Date(intervention.created_at).toLocaleDateString() : "N/A"}
          </span>
          <div className="flex gap-2">
            {intervention.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                className="px-3 border-2 text-blue-700 border-blue-200 hover:bg-blue-50 cursor-pointer"
                onClick={() => handleUpdateStatus(intervention.id, "in_progress")}
              >
                <Target className="h-3 w-3 mr-1" /> Start Support
              </Button>
            )}
            {intervention.status === "in_progress" && (
              <Button
                variant="outline"
                size="sm"
                className="px-3 border-2 text-green-700 border-green-200 hover:bg-green-50 cursor-pointer"
                onClick={() => handleUpdateStatus(intervention.id, "resolved")}
              >
                <CheckCircle className="h-3 w-3 mr-1" /> Mark Resolved
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="px-3 border-2 cursor-pointer"
              onClick={() => navigate(`/teacher/student/${intervention.student_id}`)}
            >
              View Student
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="pb-2 animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
            </CardHeader>
            <CardContent><div className="h-4 bg-gray-100 rounded w-2/3" /></CardContent>
          </Card>
        ))}
      </div>
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="border-2 animate-pulse">
          <CardHeader><div className="h-6 bg-gray-200 rounded w-1/3" /></CardHeader>
          <CardContent className="space-y-3">
            <div className="h-16 bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded w-4/5" />
            <div className="h-4 bg-gray-100 rounded w-3/5" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Duckpit count={24} gravity={0.5} friction={0.9975} wallBounce={0.9} className="h-full w-full opacity-100" />
      </div>
      <div className="absolute inset-0 z-0 bg-linear-to-b from-white/72 via-white/58 to-emerald-50/72" />

      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white/80 border-b shadow-sm sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-[#bafde0] rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">AI-Powered Student Interventions</h1>
                <p className="text-sm text-muted-foreground mt-1">Identify, review, and take action on students who need extra support based on AI-detected learning gaps and developmental needs.</p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleBack} className="cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {loading ? renderSkeleton() : (
          <>
            {/* Student quick-run section */}
            <div>
              <h2 className="text-2xl font-bold mb-2">Run Intervention Analysis</h2>
              <p className="text-lg text-muted-foreground mb-4 font-medium">
                Select a student to generate or refresh their AI intervention analysis. The AI examines all their activity reports and DSKP scores.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {students.map((student) => (
                <Card
                  key={student.id}
                  className={`cursor-pointer border-2 hover:shadow-lg transition-shadow ${generatingFor === student.id ? "border-blue-300 animate-pulse" : student.needs_intervention ? "border-yellow-300" : "border-white/70"}`}
                  onClick={() => generatingFor ? null : handleGenerateForStudent(student.id)}
                >
                  <CardContent className="pt-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-base font-bold text-green-700 mx-auto mb-2">
                      {student.name.charAt(0)}
                    </div>
                    <p className="text-sm font-medium truncate">{student.name}</p>
                    {generatingFor === student.id ? (
                      <p className="text-xs text-blue-600 mt-1 flex items-center justify-center gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Analysing...
                      </p>
                    ) : student.needs_intervention ? (
                      <p className="text-xs text-yellow-600 mt-1 flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Needs support
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        <Sparkles className="h-3 w-3 inline mr-1" /> Run analysis
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {students.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>No students assigned yet.</p>
                </div>
              )}
            </div>

            {/* Section divider */}
            <div className="border-t my-2" />

            <div>
              <h2 className="text-2xl font-bold mb-2">Intervention Overview</h2>
              <p className="text-lg text-muted-foreground mb-4 font-medium">
                A quick summary of students who need attention, ongoing support, and
                successfully completed interventions.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="pb-2">
                <CardHeader className="pb-2">
                  <CardDescription className="text-lg font-medium">
                    Pending Review
                  </CardDescription>
                  <CardTitle className="text-5xl font-medium">
                    {pendingInterventions.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-lg text-red-600">
                    <Clock className="mr-2 h-5 w-5" />
                    Needs teacher review
                  </div>
                </CardContent>
              </Card>

              <Card className="pb-2">
                <CardHeader className="pb-2">
                  <CardDescription className="text-lg font-medium">
                    Active Interventions
                  </CardDescription>
                  <CardTitle className="text-5xl font-medium">
                    {inProgressInterventions.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-lg text-orange-600">
                    <Target className="mr-2 h-5 w-5" />
                    Support currently ongoing
                  </div>
                </CardContent>
              </Card>

              <Card className="pb-2">
                <CardHeader className="pb-2">
                  <CardDescription className="text-lg font-medium">
                    Successful Interventions
                  </CardDescription>
                  <CardTitle className="text-5xl font-medium">
                    {resolvedInterventions.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-lg text-green-600">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Student progress improved
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Banner */}
            <Card className="border-2 border-yellow-300 bg-linear-to-r from-yellow-100 to-yellow-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Target className="h-5 w-5 text-amber-600" />
                  AI Intervention Insights
                </CardTitle>
                <CardDescription className="mb-4 font-medium text-base">
                  The system analyzes student performance and behavior to detect
                  learning gaps early and generate targeted intervention plans. Each
                  intervention is prioritized to help you focus on students who need
                  the most support. Click on any student above to run or refresh their analysis.
                </CardDescription>
                <div className="pb-3"></div>
              </CardHeader>
            </Card>

            {/* Interventions Tabs */}
            {interventions.length > 0 ? (
              <Tabs defaultValue="pending" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 h-12">
                  <TabsTrigger value="pending" className="text-base gap-2">
                    <Clock className="h-4 w-4" />
                    Needs Review ({pendingInterventions.length})
                  </TabsTrigger>
                  <TabsTrigger value="in_progress" className="text-base gap-2">
                    <Target className="h-4 w-4" />
                    Active Support ({inProgressInterventions.length})
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="text-base gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Completed ({resolvedInterventions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  {pendingInterventions.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No pending interventions — all caught up!
                      </CardContent>
                    </Card>
                  ) : (
                    pendingInterventions.map(renderInterventionCard)
                  )}
                </TabsContent>

                <TabsContent value="in_progress" className="space-y-4">
                  {inProgressInterventions.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No interventions currently in progress
                      </CardContent>
                    </Card>
                  ) : (
                    inProgressInterventions.map(renderInterventionCard)
                  )}
                </TabsContent>

                <TabsContent value="resolved" className="space-y-4">
                  {resolvedInterventions.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No resolved interventions yet
                      </CardContent>
                    </Card>
                  ) : (
                    resolvedInterventions.map(renderInterventionCard)
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="py-16 text-center text-muted-foreground space-y-3">
                  <Lightbulb className="h-10 w-10 mx-auto text-yellow-400" />
                  <p className="text-lg font-medium">No interventions yet</p>
                  <p className="text-base">
                    Click on a student above to run their first AI intervention analysis.
                    The AI will examine their activity reports and DSKP scores to identify areas needing support.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
      </div>
    </div>
  );
}
