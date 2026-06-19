import * as React from 'react';
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
import {
  BookOpen,
  Clock,
  FileQuestion,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const Route = createFileRoute('/_app/app/assasemen/')({
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

interface GeneralAssessment {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  questionCount: number;
  topics: string[];
  isRecommended: boolean;
}

interface CVAssessmentFromAPI {
  id: string;
  type: 'general' | 'skill';
  title: string;
  description?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  questionCount: number;
  topics?: string[];
  isRecommended: boolean;
  category?: string;
  status: string;
}

function RouteComponent() {
  const [availableAssessments, setAvailableAssessments] = React.useState<
    Assessment[]
  >([]);
  const [generalAssessments, setGeneralAssessments] = React.useState<
    GeneralAssessment[]
  >([]);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);

  React.useEffect(() => {
    async function fetchAssessments() {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (
            data.profile &&
            data.profile.cvAssessments &&
            data.profile.cvAssessments.length > 0
          ) {
            const gen = data.profile.cvAssessments.filter(
              (a: CVAssessmentFromAPI) => a.type === 'general',
            );
            const skill = data.profile.cvAssessments.filter(
              (a: CVAssessmentFromAPI) => a.type === 'skill',
            );

            setGeneralAssessments(
              gen.map((a: CVAssessmentFromAPI) => ({
                id: a.id,
                title: a.title,
                description:
                  a.description ||
                  'Menguji kompetensi komprehensif terkait role.',
                difficulty: a.difficulty || 'Intermediate',
                estimatedTime: a.estimatedTime || '60 menit',
                questionCount: a.questionCount || 40,
                topics: a.topics || [],
                isRecommended: a.isRecommended,
              })),
            );

            setAvailableAssessments(
              skill.map((a: CVAssessmentFromAPI) => ({
                id: a.id,
                skillName: a.title,
                difficulty: a.difficulty || 'Intermediate',
                estimatedTime: a.estimatedTime || '30 menit',
                questionCount: a.questionCount || 20,
                isRecommended: a.isRecommended,
                category: a.category || 'General',
                status: 'available',
              })),
            );
            setIsLoadingProfile(false);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load profile assessments', e);
      }

      // Default fallback mock data if no CV assessments are found:
      const defaultAvailable: Assessment[] = [
        {
          id: '1',
          skillName: 'TypeScript',
          difficulty: 'Intermediate',
          estimatedTime: '30 menit',
          questionCount: 20,
          isRecommended: true,
          category: 'Frontend',
          status: 'available',
        },
        {
          id: '2',
          skillName: 'Node.js',
          difficulty: 'Advanced',
          estimatedTime: '45 menit',
          questionCount: 25,
          isRecommended: true,
          category: 'Backend',
          status: 'available',
        },
        {
          id: '3',
          skillName: 'CSS',
          difficulty: 'Intermediate',
          estimatedTime: '25 menit',
          questionCount: 15,
          isRecommended: false,
          category: 'Frontend',
          status: 'available',
        },
        {
          id: '4',
          skillName: 'Database SQL',
          difficulty: 'Intermediate',
          estimatedTime: '40 menit',
          questionCount: 22,
          isRecommended: true,
          category: 'Database',
          status: 'available',
        },
      ];

      const defaultGeneral: GeneralAssessment[] = [
        {
          id: 'g1',
          title: 'Front End',
          description:
            'Menguji kompetensi komprehensif dalam pengembangan antarmuka web modern, interaktivitas, dan performa aplikasi client-side.',
          difficulty: 'Intermediate',
          estimatedTime: '60 menit',
          questionCount: 40,
          topics: [
            'HTML5 & Semantic Elements',
            'CSS Layouting (Flexbox, Grid, Custom Properties)',
            'JavaScript Modern (ES6+, Async/Await, Web APIs)',
            'React Framework & State Management (Hooks, Context)',
            'Web Performance & Client-Side Security Basics',
          ],
          isRecommended: true,
        },
        {
          id: 'g2',
          title: 'Back End',
          description:
            'Menguji keahlian arsitektur server, API design, pengelolaan database, keamanan, dan integrasi sistem backend.',
          difficulty: 'Advanced',
          estimatedTime: '75 menit',
          questionCount: 50,
          topics: [
            'Arsitektur RESTful API & GraphQL',
            'Node.js Runtime & Express.js framework',
            'Database Modeling & Query Optimization (SQL/NoSQL)',
            'Authentication & Authorization (JWT, OAuth2)',
            'Server Security, Caching & Background Jobs',
          ],
          isRecommended: false,
        },
        {
          id: 'g3',
          title: 'Full Stack',
          description:
            'Menguji penguasaan end-to-end dari frontend, backend, integrasi database, hingga deployment dasar.',
          difficulty: 'Advanced',
          estimatedTime: '90 menit',
          questionCount: 60,
          topics: [
            'Integrasi Client-Server & CORS management',
            'State Synchronization & Real-time communication',
            'Database design & ORM integration',
            'Full Stack Security & Input Validation',
            'Deployment pipelines, Environment configuration & CI/CD',
          ],
          isRecommended: true,
        },
      ];

      setAvailableAssessments(defaultAvailable);
      setGeneralAssessments(defaultGeneral);
      setIsLoadingProfile(false);
    }
    fetchAssessments();
  }, []);

  const inProgressAssessments: Assessment[] = [
    {
      id: '5',
      skillName: 'React',
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
      skillName: 'React',
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
      skillName: 'JavaScript',
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

        {assessment.status === 'in-progress' &&
          assessment.progress !== undefined && (
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
            <Link to="/app/kredensial" className="flex-1">
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

  const GeneralAssessmentCard = ({
    assessment,
  }: {
    assessment: GeneralAssessment;
  }) => (
    <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-200 bg-gradient-to-br from-indigo-50/20 via-white to-white flex flex-col justify-between h-full">
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Badge
                variant="outline"
                className="mb-2 bg-indigo-50 text-indigo-700 border-indigo-200"
              >
                General Role
              </Badge>
              <CardTitle className="text-xl font-bold text-slate-800">
                {assessment.title}
              </CardTitle>
              <CardDescription className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                {assessment.description}
              </CardDescription>
            </div>
            {assessment.isRecommended && (
              <Badge
                variant="default"
                className="bg-indigo-600 hover:bg-indigo-700 ml-2 text-white border-0"
              >
                Recommended
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" /> Topik/Materi Diujikan:
            </div>
            <ul className="space-y-1.5">
              {assessment.topics.map((topic, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </div>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/50">
          <span
            className={`px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(assessment.difficulty)}`}
          >
            {assessment.difficulty}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />{' '}
            {assessment.estimatedTime}
          </span>
          <span className="flex items-center gap-1">
            <FileQuestion className="w-3.5 h-3.5 text-slate-400" />{' '}
            {assessment.questionCount} Soal
          </span>
        </div>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all duration-200">
          Mulai Asesmen
        </Button>
      </CardContent>
    </Card>
  );

  if (isLoadingProfile) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-muted-foreground text-sm font-medium">
            Memuat daftar assessment...
          </p>
        </div>
      </div>
    );
  }

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
              Tersedia (
              {availableAssessments.length + generalAssessments.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              Sedang Berjalan ({inProgressAssessments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Selesai ({completedAssessments.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Tersedia */}
          <TabsContent value="available" className="space-y-8 mt-6">
            {/* Info Banner */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent >
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-sm text-blue-900">
                      Berdasarkan CV-mu, ini assessment yang tersedia:
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Assessments Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="h-5 w-1 bg-indigo-600 rounded"></span>
                  Asesmen General (Role-based)
                </h3>
                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {generalAssessments.length} Asesmen
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generalAssessments.map((assessment) => (
                  <GeneralAssessmentCard
                    key={assessment.id}
                    assessment={assessment}
                  />
                ))}
              </div>
            </div>

            {/* Skill Assessments Section */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="h-5 w-1 bg-blue-600 rounded"></span>
                  Asesmen Spesifik Skill
                </h3>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {availableAssessments.length} Asesmen
                </span>
              </div>
              {availableAssessments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableAssessments.map((assessment) => (
                    <AssessmentCard
                      key={assessment.id}
                      assessment={assessment}
                    />
                  ))}
                </div>
              ) : (
                <Card className="py-12">
                  <CardContent className="text-center">
                    <p className="text-gray-600">
                      Tidak ada assessment spesifik skill tersedia saat ini.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
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
