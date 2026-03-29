import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { mockStudents } from '../data/mockData';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Play, Pause, CheckCircle2, Users, Clock, Book, Calculator, Palette, Award } from 'lucide-react';
import { toast } from 'sonner';
import Duckpit from './Duckpit';

const classroomActivities = [
  { id: 'ca1', title: 'Morning Circle Time', type: 'social', duration: 15, description: 'Greeting, calendar, weather, and sharing time', icon: Users },
  { id: 'ca2', title: 'Letter of the Day', type: 'literacy', duration: 20, description: 'Interactive letter recognition and phonics', icon: Book },
  { id: 'ca3', title: 'Counting & Numbers', type: 'numeracy', duration: 15, description: 'Hands-on counting with manipulatives', icon: Calculator },
  { id: 'ca4', title: 'Creative Art Time', type: 'creative', duration: 25, description: 'Guided art project with fine motor focus', icon: Palette },
];

export function ClassroomTeachingMode() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeActivityId, setActiveActivityId] = useState(null);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  if (!user || user.role !== 'teacher') {
    navigate('/');
    return null;
  }

  const students = mockStudents;
  const activeActivity = classroomActivities.find(a => a.id === activeActivityId);

  // Helper to format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startActivity = (id) => {
    setActiveActivityId(id);
    setIsTimerRunning(true);
    setTimer(0);
    toast.success('Activity started!');
  };

  const completeActivity = () => {
    setCompletedActivities([...completedActivities, activeActivityId]);
    setActiveActivityId(null);
    setIsTimerRunning(false);
    toast.success('Activity completed!');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Duckpit count={24} gravity={0.5} friction={0.9975} wallBounce={0.9} className="h-full w-full opacity-100" />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/72 via-white/58 to-emerald-50/72" />

      <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold italic">Classroom Teaching Mode</h1>
        <Badge variant="outline" className="text-lg py-1">
          <Clock className="mr-2 h-4 w-4" /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Activities List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Today's Schedule</h2>
          {classroomActivities.map((activity) => {
            const isCompleted = completedActivities.includes(activity.id);
            const isActive = activeActivityId === activity.id;
            const Icon = activity.icon;

            return (
              <Card key={activity.id} className={`${isActive ? 'ring-2 ring-primary' : ''} ${isCompleted ? 'opacity-60' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{activity.title}</CardTitle>
                      <CardDescription>{activity.duration} mins • {activity.description}</CardDescription>
                    </div>
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="text-green-500 h-6 w-6" />
                  ) : isActive ? (
                    <div className="text-2xl font-mono font-bold text-primary">{formatTime(timer)}</div>
                  ) : (
                    <Button onClick={() => startActivity(activity.id)} size="sm">
                      <Play className="mr-2 h-4 w-4" /> Start
                    </Button>
                  )}
                </CardHeader>
                {isActive && (
                  <CardContent className="pt-4">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsTimerRunning(!isTimerRunning)}>
                        {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button className="flex-1" onClick={completeActivity}>
                        Complete Activity
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right: Students/Status Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-2 h-5 w-5" /> Present Students
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {students.slice(0, 5).map(student => (
                <div key={student.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{student.name}</span>
                  <Badge variant="secondary" className="text-[10px]">Attentive</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Award className="mr-2 h-5 w-5" /> Session Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {completedActivities.length} / {classroomActivities.length}
              </div>
              <Progress value={(completedActivities.length / classroomActivities.length) * 100} className="bg-primary-foreground/20" />
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}