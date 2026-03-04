import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { getStudentById, getDevelopmentalAreas } from '../data/mockData';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Award, Target } from 'lucide-react';

export function ProgressTracking() {
  const { studentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || !studentId) return null;

  const student = getStudentById(studentId);
  const developmentalAreas = getDevelopmentalAreas(studentId);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Student not found</p>
      </div>
    );
  }

  const handleBack = () => {
    navigate(`/${user.role}/student/${studentId}`);
  };

  const getCategoryColor = (category) => {
    const colors = {
      literacy: 'from-blue-500 to-blue-600',
      numeracy: 'from-green-500 to-green-600',
      social: 'from-purple-500 to-purple-600',
      motor: 'from-orange-500 to-orange-600',
      creative: 'from-pink-500 to-pink-600',
      cognitive: 'from-cyan-500 to-cyan-600',
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  // Calculate statistics
  const totalMilestones = developmentalAreas.reduce((acc, area) => acc + area.milestones.length, 0);
  const achievedMilestones = developmentalAreas.reduce(
    (acc, area) => acc + area.milestones.filter(m => m.achieved).length,
    0
  );
  const progressPercentage = totalMilestones > 0 ? Math.round((achievedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
          <div className="flex items-center gap-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-xl font-semibold">{student.name}'s Progress Report</h1>
              <p className="text-sm text-muted-foreground">
                Detailed developmental milestones and achievements
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Overall Progress Card */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-2xl">Overall Development Progress</CardTitle>
            <CardDescription className="text-base">
              Tracking growth across all learning areas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6