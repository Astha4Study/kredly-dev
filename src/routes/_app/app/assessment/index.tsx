import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { AssessmentCard } from '@/pages/dashboard/assessment/AssessmentCard';
import { GeneralAssessmentCard } from '@/pages/dashboard/assessment/GeneralAssessmentCard';

export const Route = createFileRoute('/_app/app/assessment/')({
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

  if (isLoadingProfile) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">
            Memuat daftar assessment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assasemen</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ikuti assessment untuk mendapatkan kredensial blockchain
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="available" className="w-full space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-muted p-1 h-auto">
            <TabsTrigger
              value="available"
              className="flex items-center gap-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm hover:bg-background/50"
            >
              <span>Tersedia</span>
              <span className="rounded-full border px-2 py-0.5 text-xs bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {availableAssessments.length + generalAssessments.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="in-progress"
              className=" flex items-center gap-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm hover:bg-background/50"
            >
              <span>Sedang Berjalan</span>
              <span className="rounded-full border bg-background px-2 py-0.5 text-xs">
                {inProgressAssessments.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="completed"
              className="flex items-center gap-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm hover:bg-background/50"
            >
              <span>Selesai</span>
              <span className="rounded-full border bg-background px-2 py-0.5 text-xs">
                {completedAssessments.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Tersedia */}
          <TabsContent value="available" className="space-y-3">
            {/* General Assessments Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="text-lg font-bold">
                  Asesmen General (Role-based)
                </h3>
                <span className="text-sm font-medium text-muted-foreground">
                  {generalAssessments.length} Asesmen
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="text-lg font-bold">Asesmen Spesifik Skill</h3>
                <span className="text-sm font-medium text-muted-foreground">
                  {availableAssessments.length} Asesmen
                </span>
              </div>
              {availableAssessments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableAssessments.map((assessment) => (
                    <AssessmentCard
                      key={assessment.id}
                      assessment={assessment}
                    />
                  ))}
                </div>
              ) : (
                <Card className="py-12 border">
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressAssessments.map((assessment) => (
                  <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
              </div>
            ) : (
              <Card className="py-12 border">
                <CardContent className="text-center space-y-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-10 h-10 text-muted-foreground"
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
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Tidak Ada Assessment Sedang Berjalan
                    </h3>
                    <p className="text-muted-foreground">
                      Mulai assessment baru dari tab "Tersedia"
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Selesai */}
          <TabsContent value="completed" className="space-y-6 mt-6">
            {completedAssessments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedAssessments.map((assessment) => (
                  <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
              </div>
            ) : (
              <Card className="py-12 border">
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
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
