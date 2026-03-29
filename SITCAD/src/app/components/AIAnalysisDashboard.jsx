import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { mockStudents } from '../data/mockData';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Brain, TrendingUp, TrendingDown, AlertTriangle, Sparkles, Target, Users, BarChart3 } from 'lucide-react';
import Duckpit from './Duckpit';

export function AIAnalysisDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'teacher') {
    navigate('/');
    return null;
  }

  const students = mockStudents;

  // Mock AI analysis data
  const classAnalytics = {
    overallPerformance: 76,
    trend: 'improving',
    atRiskStudents: students.filter(s => s.needsIntervention).length,
    excellingStudents: students.filter(s => s.developmentalStage === 'advanced' || s.developmentalStage === 'proficient').length,
    engagementScore: 80,
  };

  const learningPatterns = [
    {
      pattern: 'Peak Learning Time',
      insight: 'Students show highest engagement between 9:00 AM - 11:00 AM',
      recommendation: 'Schedule complex learning activities during morning hours',
      confidence: 89,
    },
    {
      pattern: 'Collaborative Learning',
      insight: 'Group activities lead to 23% better comprehension than individual work',
      recommendation: 'Increase peer learning opportunities in literacy activities',
      confidence: 85,
    },
    {
      pattern: 'Visual Learning Preference',
      insight: '68% of students demonstrate strong visual learning preferences',
      recommendation: 'Incorporate more visual aids, diagrams, and picture books',
      confidence: 92,
    },
    {
      pattern: 'Attention Span Patterns',
      insight: 'Average attention span is 12-15 minutes for structured activities',
      recommendation: 'Break longer activities into shorter segments with transitions',
      confidence: 88,
    },
  ];

  const developmentalInsights = [
    {
      area: 'Literacy Development',
      status: 'strong',
      average: 78,
      insights: [
        '4 students ready for advanced phonics',
        '2 students need additional letter recognition support',
        'Storytelling activities showing exceptional engagement',
      ],
    },
    {
      area: 'Numeracy Skills',
      status: 'excellent',
      average: 84,
      insights: [
        'Strong performance in counting and number recognition',
        'Ready to introduce basic addition concepts',
        'Consider more hands-on math manipulatives',
      ],
    },
    {
      area: 'Social-Emotional',
      status: 'developing',
      average: 72,
      insights: [
        'Improved conflict resolution skills observed',
        '1 student may benefit from social skills support',
        'Positive peer interactions during group activities',
      ],
    },
    {
      area: 'Physical Development',
      status: 'strong',
      average: 80,
      insights: [
        'Fine motor skills progressing well',
        'Gross motor activities highly engaging',
        'Consider more outdoor physical activities',
      ],
    },
  ];

  const predictiveInsights = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Advanced Learning Readiness',
      description: '3 students showing readiness for kindergarten transition skills earlier than expected',
      students: ['Little Sprout1', 'Little Sprout2', 'Little Sprout4'],
      action: 'Consider introducing early kindergarten preparation activities',
      priority: 'medium',
    },
    {
      id: '2',
      type: 'concern',
      title: 'Fine Motor Skills Support',
      description: '1 student may benefit from additional fine motor skill development',
      students: ['Little Sprout3'],
      action: 'Implement daily fine motor skill exercises and adaptive tools',
      priority: 'high',
    },
    {
      id: '3',
      type: 'success',
      title: 'Literacy Breakthrough',
      description: 'Class average in letter recognition improved 15% this month',
      students: ['Whole Class'],
      action: 'Continue current literacy curriculum with minor enhancements',
      priority: 'low',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'strong': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'developing': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Duckpit count={26} gravity={0.5} friction={0.9975} wallBounce={0.9} className="h-full w-full opacity-100" />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/72 via-white/58 to-emerald-50/72" />

      <div className="relative z-10">
      <header className="bg-white/80 border-b shadow-sm sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Student Development Analysis By AI</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Insight powered by Artificial intelligent
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => navigate('/teacher')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-1">
              <CardDescription>Class Performance</CardDescription>
              <CardTitle className="text-5xl">{classAnalytics.overallPerformance}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="mr-2 h-5 w-5" />
                Improving
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardDescription>Engagement Score</CardDescription>
              <CardTitle className="text-5xl">{classAnalytics.engagementScore}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={classAnalytics.engagementScore} className="h-2 [&>[data-slot=progress-indicator]]:bg-yellow-300" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardDescription>Excelling</CardDescription>
              <CardTitle className="text-5xl">{classAnalytics.excellingStudents}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <Target className="mr-2 h-5 w-5" />
                On track
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardDescription>Need Support</CardDescription>
              <CardTitle className="text-5xl">{classAnalytics.atRiskStudents}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-yellow-600">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Attention needed
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardDescription>Total Students</CardDescription>
              <CardTitle className="text-5xl">{students.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <Users className="mr-2 h-5 w-5" />
                Total Students
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="patterns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patterns">Learning Insight</TabsTrigger>
            <TabsTrigger value="developmental">Developmental Progress</TabsTrigger>
            <TabsTrigger value="predictive">Predictive Insights</TabsTrigger>
          </TabsList>

          {/* Learning Patterns */}
          <TabsContent value="patterns" className="space-y-4">
            <Card className="border-1 border-green-300 bg-gradient-to-r from-green-200 to-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-1">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  AI-Detected Learning Patterns
                </CardTitle>
                <CardDescription>
                  Patterns identified through analysis of student interaction and performance data
                </CardDescription>
                <div className="pb-3"></div>
              </CardHeader>
            </Card>
            {learningPatterns.map((pattern, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{pattern.pattern}</CardTitle>
                      <CardDescription className="mt-2">{pattern.insight}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {pattern.confidence}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3 p-4 bg-green-200 rounded-lg border border-green-300">
                    <TrendingUp className="h-5 w-5 text-black-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-black-300 mb-1">AI Recommendation:</p>
                      <p className="text-sm text-black-300">{pattern.recommendation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Developmental Areas */}
          <TabsContent value="developmental" className="space-y-4">
            {developmentalInsights.map((area, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{area.area}</CardTitle>
                      <CardDescription>Class Average: {area.average}%</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(area.status)} border`}>
                      {area.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={area.average} className="h-3 [&>[data-slot=progress-indicator]]:bg-yellow-400" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Key Insights:</p>
                    {area.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2" />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Predictive Insights */}
          <TabsContent value="predictive" className="space-y-4">
            <Card className="border-2 border-green-100 bg-gradient-to-r from-green-100 to-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-300" />
                  Predictive Analytics
                </CardTitle>
                <CardDescription>
                  AI predictions based on current development and data
                </CardDescription>
                <div className="pb-3"></div>
              </CardHeader>
            </Card>

            {predictiveInsights.map((insight) => (
              <Card key={insight.id} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {insight.type === 'opportunity' && <Target className="h-5 w-5 text-green-600" />}
                        {insight.type === 'concern' && <AlertTriangle className="h-5 w-5 text-green-600" />}
                        {insight.type === 'success' && <TrendingUp className="h-5 w-5 text-green-600" />}
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <CardDescription>{insight.description}</CardDescription>
                    </div>
                    <Badge className={`${getPriorityColor(insight.priority)} border`}>
                      {insight.priority} priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Affected Students:</p>
                    <div className="flex flex-wrap gap-2">
                      {insight.students.map((student, i) => (
                        <Badge key={i} variant="outline">{student}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-green-200 rounded-lg border border-green-100">
                    <p className="text-sm font-medium text-black-900 mb-1">Recommended Action:</p>
                    <p className="text-sm text-black-700">{insight.action}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
      </div>
    </div>
  );
}