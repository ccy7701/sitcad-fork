
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { getStudentsByRole } from '../data/mockData';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { LogOut, Heart, Calendar, TrendingUp, MessageSquare } from 'lucide-react';
import Duckpit from './Duckpit';

export function ParentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const students = getStudentsByRole(user.id, 'parent');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Duckpit count={15} interactive={false} className="h-full w-full opacity-100" />
      </div>
      <div className="absolute inset-0 z-0 bg-linear-to-b from-white/72 via-white/58 to-emerald-50/72" />

      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white/80 border-b shadow-sm sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Parent Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, {user.name}!
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Message */}
        <Card className="bg-linear-to-r bg-slate-50 shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="text-black">Your Child's Learning Journey</CardTitle>
            <CardDescription className="text-muted-foreground">
              Track progress, view activities, and celebrate achievements together
            </CardDescription>
            <div className="pb-3"></div>
          </CardHeader>
        </Card>

        {/* Children */}
        <Card className="bg-linear-to-r bg-slate-50 shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="text-black">No student profiles linked to your account</CardTitle>
            <CardDescription className="text-muted-foreground">
            </CardDescription>
            <div className="pb-3"></div>
          </CardHeader>
        </Card>
          <div className="space-y-6">
            {students.map(student => (
              <Card key={student.id} className="overflow-hidden">
                <CardHeader className="bg-linear-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center gap-4">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{student.name}</CardTitle>
                      <CardDescription className="text-base">
                        Age {student.age} • {student.classroom}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Progress Overview */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Overall Progress</h3>
                      <span className="text-2xl font-semibold text-purple-600">
                        {student.overallProgress}%
                      </span>
                    </div>
                    <Progress value={student.overallProgress} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {student.name} is making great progress in their learning journey!
                    </p>
                  </div>

                  {/* Developmental Stage */}
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Developmental Stage</p>
                      <p className="font-medium text-lg capitalize">{student.developmentalStage}</p>
                    </div>
                    <Badge className="text-base px-4 py-2">
                      {student.developmentalStage === 'advanced' && '🌟 Advanced'}
                      {student.developmentalStage === 'proficient' && '✨ Proficient'}
                      {student.developmentalStage === 'developing' && '🌱 Developing'}
                      {student.developmentalStage === 'emerging' && '🌸 Emerging'}
                    </Badge>
                  </div>

                  {/* Recent Activity */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Recent Activity</span>
                    </div>
                    <p className="text-sm">{student.recentActivity}</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/parent/student/${student.id}`)}
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/parent/student/${student.id}/activities`)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Activities
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/parent/student/${student.id}/progress`)}
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        {/* Tips for Parents */}
        <Card className="bg-linear-to-r bg-slate-50 shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle>Tips for Supporting Learning at Home</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-lime-600">•</span>
                <span>Read together for at least 15 minutes each day</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lime-600">•</span>
                <span>Practice counting objects during everyday activities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lime-600">•</span>
                <span>Encourage drawing and creative expression</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lime-600">•</span>
                <span>Celebrate small achievements and effort</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
      </div>
    </div>
  );
}
