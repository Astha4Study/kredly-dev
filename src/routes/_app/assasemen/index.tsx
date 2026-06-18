import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/_app/assasemen/')({
  component: RouteComponent,
});

interface Assessment {
  id: string;
  skillName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  questionCount: number;
  isRecommended: boolean;
  category: string;
  progress?: number;
  status?: 'available' | 'in-progress' | 'completed';
  score?: number;
  completedDate?: string;
  passed?: boolean;
}

function RouteComponent() {
  // Mock data - nanti diganti dengan data dari API
  const availableAssessments: Assessment[] = [
    {
      id: '1',
      skillName: 'TypeScript Fundamentals',
      difficulty: 'Intermediate',
      estimatedTime: '30 menit',
      questionCount: 20,
      isRecommended: true,
      category: 'Frontend',
      status: 'available',
    },
    {
      id: '2',
      skillName: 'Node.js Backend Development',
      difficulty: 'Advanced',
      estimatedTime: '45 menit',
      questionCount: 25,
      isRecommended: true,
      category: 'Backend',
      status: 'available',
    },
    {
      id: '3',
      skillName: 'CSS Advanced Layouts',
      difficulty: 'Intermediate',
      estimatedTime: '25 menit',
      questionCount: 15,
      isRecommended: false,
      category: 'Frontend',
      status: 'available',
    },
    {
      id: '4',
      skillName: 'Database Design & SQL',
      difficulty: 'Intermediate',
      estimatedTime: '40 menit',
      questionCount: 22,
      isRecommended: true,
      category: 'Database',
      status: 'available',
    },
  ];

  const inProgressAssessments: Assessment[] = [
    {
      id: '5',
      skillName: 'React Advanced',
      difficulty: 'Advanced',
      estimatedTime: '45 menit',
      questionCount: 20,
      isRecommended: true,
      category: 'Frontend',
      status: 'in-progress',
      progress: 45,
    },
  ];

  const completedAssessments: Assessment[] = [
    {
      id: '6',
      skillName: 'React Fundamentals',
      difficulty: 'Intermediate',
      estimatedTime: '30 menit',
      questionCount: 20,
      isRecommended: true,
      category: 'Frontend',
      status: 'completed',
      score: 88,
      completedDate: '15 Juni 2026',
      passed: true,
    },
    {
      id: '7',
      skillName: 'JavaScript ES6',
      difficulty: 'Beginner',
      estimatedTime: '25 menit',
      questionCount: 18,
      isRecommended: true,
      category: 'Frontend',
      status: 'completed',
      score: 82,
      completedDate: '10 Juni 2026',
      passed: true,
    },
    {
      id: '8',
      skillName: 'Git Version Control',
      difficulty: 'Beginner',
      estimatedTime: '20 menit',
      questionCount: 15,
      isRecommended: false,
      category: 'Tools',
      status: 'completed',
      score: 65,
      completedDate: '5 Juni 2026',
      passed: false,
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const AssessmentCard = ({ assessment }: { assessment: Assessment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{assessment.skillName}</CardTitle>
            <CardDescription className="mt-1">
              {assessment.category}
            </CardDescription>
          </div>
          {assessment.isRecommended && (
            <Badge variant="default" className="ml-2">
              Recommended
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(assessment.difficulty)}`}
          >
            {assessment.difficulty}
          </span>
          <span>⏱️ {assessment.estimatedTime}</span>
          <span>📝 {assessment.questionCount} soal</span>
        </div>

        {assessment.status === 'in-progress' && assessment.progress !== undefined && (
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{assessment.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${assessment.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {assessment.status === 'completed' && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {assessment.score}/100
              </p>
            </div>
            <Badge variant={assessment.passed ? 'default' : 'destructive'}>
              {assessment.passed ? 'Passed' : 'Failed'}
            </Badge>
          </div>
        )}

        {assessment.status === 'available' && (
          <Button className="w-full">Mulai Assessment</Button>
        )}
        {assessment.status === 'in-progress' && (
          <Button className="w-full" variant="default">
            Lanjutkan Assessment
          </Button>
        )}
        {assessment.status === 'completed' && (
          <div className="flex gap-2">
            <Link to="/kredensial" className="flex-1">
              <Button variant="outline" className="w-full">
                {assessment.passed ? 'Lihat Kredensial' : 'Lihat Detail'}
              </Button>
            </Link>
            <Button variant="ghost" className="flex-1">
              Retake
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Assasemen</h2>
          <p className="text-gray-600 mt-2">
            Ikuti assessment untuk mendapatkan kredensial blockchain
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">
              Tersedia ({availableAssessments.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              Sedang Berjalan ({inProgressAssessments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Selesai ({completedAssessments.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Tersedia */}
          <TabsContent value="available" className="space-y-6 mt-6">
            {/* Info Banner */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 011 1v5a1 1 0 11-2 0V5a1 1 0 011-1z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-900">
                      Assessment di bawah direkomendasikan berdasarkan skill yang
                      terdeteksi dari CV Anda. Selesaikan assessment untuk
                      mendapatkan kredensial blockchain.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {availableAssessments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableAssessments.map((assessment) => (
                  <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
              </div>
            ) : (
              <Card className="py-12">
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Tidak ada assessment tersedia saat ini.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Sedang Berjalan */}
          <TabsContent value="in-progress" className="space-y-6 mt-6">
            {inProgressAssessments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressAssessments.map((assessment) => (
                  <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
              </div>
            ) : (
              <Card className="py-12">
                <CardContent className="text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tidak Ada Assessment Sedang Berjalan
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Mulai assessment baru dari tab "Tersedia"
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Selesai */}
          <TabsContent value="completed" className="space-y-6 mt-6">
            {completedAssessments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedAssessments.map((assessment) => (
                  <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
              </div>
            ) : (
              <Card className="py-12">
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Anda belum menyelesaikan assessment apapun.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
