import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Plus, Upload } from 'lucide-react';
import { AssessmentCard } from '@/pages/dashboard/assessment/AssessmentCard';
import { GeneralAssessmentCard } from '@/pages/dashboard/assessment/GeneralAssessmentCard';
import { AssessmentCardSkeleton } from '@/components/skeletons/AssessmentCardSkeleton';
import { GeneralAssessmentCardSkeleton } from '@/components/skeletons/GeneralAssessmentCardSkeleton';

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
  sessionId?: string;
  level?: string;
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
  status?: string;
  sessionId?: string;
  score?: number;
  level?: string;
}

interface CVAssessmentFromAPI {
  id: string;
  type: 'general' | 'skill' | 'related_skill';
  title: string;
  description?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  questionCount: number;
  topics?: string[];
  isRecommended: boolean;
  category?: string;
  status: string;
  sessionId?: string;
  score?: number;
  level?: string;
}

function RouteComponent() {
  const [availableAssessments, setAvailableAssessments] = React.useState<
    Assessment[]
  >([]);
  const [relatedAssessments, setRelatedAssessments] = React.useState<
    Assessment[]
  >([]);
  const [completedAssessments, setCompletedAssessments] = React.useState<
    Assessment[]
  >([]);
  const [generalAssessments, setGeneralAssessments] = React.useState<
    GeneralAssessment[]
  >([]);
  const [allSkillsCompleted, setAllSkillsCompleted] = React.useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const [profileExists, setProfileExists] = React.useState(true);

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
            const allAssessments = data.profile
              .cvAssessments as CVAssessmentFromAPI[];

            const gen = allAssessments.filter(
              (a: CVAssessmentFromAPI) =>
                a.type === 'general' &&
                a.status !== 'completed' &&
                a.status !== 'in-progress',
            );
            const availableSkills = allAssessments.filter(
              (a: CVAssessmentFromAPI) =>
                a.type === 'skill' && (a.status === 'available' || !a.status),
            );
            const relatedSkills = allAssessments.filter(
              (a: CVAssessmentFromAPI) =>
                a.type === 'related_skill' &&
                (a.status === 'available' || !a.status),
            );
            const completed = allAssessments.filter(
              (a: CVAssessmentFromAPI) => a.status === 'completed',
            );

            setGeneralAssessments(
              gen.map((a: CVAssessmentFromAPI) => ({
                id: a.id,
                title: a.title,
                description:
                  a.description ||
                  'Menguji kompetensi komprehensif terkait role.',
                difficulty: a.difficulty || 'Intermediate',
                estimatedTime: a.estimatedTime || '90 menit',
                questionCount: a.questionCount || 50,
                topics: a.topics || [],
                isRecommended: a.isRecommended,
                status: a.status,
                sessionId: a.sessionId,
                score: a.score,
                level: a.level,
              })),
            );

            setAvailableAssessments(
              availableSkills.map((a: CVAssessmentFromAPI) => ({
                id: a.id,
                skillName: a.title,
                difficulty: a.difficulty || 'Intermediate',
                estimatedTime: a.estimatedTime || '45 menit',
                questionCount: a.questionCount || 30,
                isRecommended: a.isRecommended,
                category: a.category || 'General',
                status: 'available',
              })),
            );

            setRelatedAssessments(
              relatedSkills.map((a: CVAssessmentFromAPI) => ({
                id: a.id,
                skillName: a.title,
                difficulty: a.difficulty || 'Intermediate',
                estimatedTime: a.estimatedTime || '45 menit',
                questionCount: a.questionCount || 30,
                isRecommended: a.isRecommended,
                category: a.category || 'General',
                status: 'available',
              })),
            );

            setCompletedAssessments(
              completed.map((a: CVAssessmentFromAPI) => ({
                id: a.id,
                skillName: a.title,
                difficulty: a.difficulty || 'Intermediate',
                estimatedTime: a.estimatedTime || '45 menit',
                questionCount: a.questionCount || 30,
                isRecommended: a.isRecommended,
                category:
                  a.category || (a.type === 'general' ? 'General' : 'Skill'),
                status: 'completed',
                sessionId: a.sessionId,
                score: a.score,
                level: a.level,
              })),
            );

            const hasUncompletedSkills = allAssessments.some(
              (a: CVAssessmentFromAPI) =>
                a.type === 'skill' && a.status !== 'completed',
            );
            setAllSkillsCompleted(!hasUncompletedSkills);

            setProfileExists(true);
            setIsLoadingProfile(false);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load profile assessments', e);
      }

      // No mock data if user profile or cvAssessments does not exist in MongoDB
      setAvailableAssessments([]);
      setRelatedAssessments([]);
      setCompletedAssessments([]);
      setGeneralAssessments([]);
      setAllSkillsCompleted(false);
      setProfileExists(false);
      setIsLoadingProfile(false);
    }
    fetchAssessments();
  }, []);

  if (isLoadingProfile) {
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

          {/* Tabs Skeleton */}
          <Tabs defaultValue="available" className="w-full space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-muted p-1 h-auto">
              <TabsTrigger
                value="available"
                className="flex items-center gap-2"
              >
                <span>Tersedia</span>
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex items-center gap-2"
              >
                <span>Selesai</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-3">
              {/* General Assessments Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <h3 className="text-lg font-bold">Asesmen Role-based)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <GeneralAssessmentCardSkeleton key={i} />
                  ))}
                </div>
              </div>

              {/* Skill Assessments Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <h3 className="text-lg font-bold">Asesmen Spesifik Skill</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <AssessmentCardSkeleton key={i} />
                  ))}
                </div>
              </div>

              {/* Related Skill Assessments Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <h3 className="text-lg font-bold">
                    Rekomendasi Asesmen Terkait
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <AssessmentCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
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
          <TabsList className="grid w-full grid-cols-2 bg-muted p-1 h-auto">
            <TabsTrigger
              value="available"
              className="flex items-center gap-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm hover:bg-background/50"
            >
              <span>Tersedia</span>
              <span className="rounded-full border px-2 py-0.5 text-xs bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {availableAssessments.length +
                  generalAssessments.length +
                  relatedAssessments.length}
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
            {!profileExists ? (
              <Card className="py-12 border">
                <CardContent className="text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Belum ada data skill
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                      Silakan unggah CV Anda di halaman Parse CV untuk
                      menganalisis skill dan menampilkan rekomendasi asesmen.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* General Assessments Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <h3 className="text-lg font-bold">Asesmen Role-based</h3>
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
                    <h3 className="text-lg font-bold">
                      Asesmen Spesifik Skill
                    </h3>
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

                {/* Related Skill Assessments Section */}
                <div className="space-y-4 pt-6">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <h3 className="text-lg font-bold">
                      Rekomendasi Asesmen Terkait
                    </h3>
                    <span className="text-sm font-medium text-muted-foreground">
                      {relatedAssessments.length} Asesmen
                    </span>
                  </div>
                  {relatedAssessments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {relatedAssessments.map((assessment) => (
                        <AssessmentCard
                          key={assessment.id}
                          assessment={assessment}
                          isLocked={!allSkillsCompleted}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="py-12 border">
                      <CardContent className="text-center">
                        <p className="text-muted-foreground">
                          Tidak ada rekomendasi asesmen terkait saat ini.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Customization & Re-upload Section */}
                <div className="space-y-4 pt-6">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div>
                      <h3 className="text-lg font-bold">
                        Kustomisasi & Pembaruan Asesmen
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tambahkan asesmen mandiri atau perbarui profil
                        kompetensi Anda
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Add Custom Assessment Card */}
                    <Card
                      className={`relative overflow-hidden border transition-all duration-300 flex flex-col justify-between ${!allSkillsCompleted ? 'opacity-65 bg-muted/10' : 'hover:shadow-md'}`}
                    >
                      <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Plus className="h-5 w-5" />
                          </div>
                          {!allSkillsCompleted && (
                            <Badge
                              variant="outline"
                              className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 py-0.5 px-2"
                            >
                              <Lock className="h-3 w-3" /> Terkunci
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg font-bold mt-2">
                          Tambah Asesmen Kustom
                        </CardTitle>
                        <CardDescription>
                          Pilih secara spesifik skill yang ingin Anda uji secara
                          mandiri di luar hasil ekstraksi CV Anda.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button
                          className="w-full gap-2 text-xs font-semibold"
                          disabled={!allSkillsCompleted}
                          variant={
                            !allSkillsCompleted ? 'secondary' : 'default'
                          }
                        >
                          {!allSkillsCompleted ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                          {!allSkillsCompleted
                            ? 'Selesaikan Asesmen Skill'
                            : 'Pilih Skill Baru'}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Re-upload CV Card */}
                    <Card
                      className={`relative overflow-hidden border transition-all duration-300 flex flex-col justify-between ${!allSkillsCompleted ? 'opacity-65 bg-muted/10' : 'hover:shadow-md'}`}
                    >
                      <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Upload className="h-5 w-5" />
                          </div>
                          {!allSkillsCompleted && (
                            <Badge
                              variant="outline"
                              className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 py-0.5 px-2"
                            >
                              <Lock className="h-3 w-3" /> Terkunci
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg font-bold mt-2">
                          Upload Ulang CV
                        </CardTitle>
                        <CardDescription>
                          Ingin memperbarui rekomendasi asesmen? Upload CV
                          terbaru Anda untuk mengekstrak ulang daftar skill dan
                          role Anda.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button
                          className="w-full gap-2 text-xs font-semibold"
                          disabled={!allSkillsCompleted}
                          variant={
                            !allSkillsCompleted ? 'secondary' : 'default'
                          }
                        >
                          {!allSkillsCompleted ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          {!allSkillsCompleted
                            ? 'Selesaikan Asesmen Skill'
                            : 'Upload CV Baru'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Tab: Selesai */}
          <TabsContent value="completed" className="space-y-6 mt-6">
            {!profileExists ? (
              <Card className="py-12 border">
                <CardContent className="text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Belum ada data skill
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                      Silakan unggah CV Anda terlebih dahulu.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : completedAssessments.length > 0 ? (
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
