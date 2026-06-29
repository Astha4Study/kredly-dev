import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import AsideProfile from '@/components/AsideProfile';
import { useAuth } from '@/contexts/auth';
import { useEffect, useState } from 'react';
import { Clock, FileText, ArrowRight, Layers, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import AsideProfileSkeleton from '@/components/skeletons/AsideProfileSkeleton';

export const Route = createFileRoute('/_app/app/')({
  component: RouteComponent,
});

interface Credential {
  id: string;
  role: string;
  level: string;
  skills: string[];
  thetaCurrent: number;
  totalItems: number;
  maxItems: number;
  minItems: number;
  completed: boolean;
  createdAt: string;
}

interface CVAssessment {
  id: string;
  type: 'general' | 'skill' | 'related_skill';
  title: string;
  description?: string;
  estimatedTime: string;
  questionCount: number;
  topics?: string[];
  isRecommended: boolean;
  category?: string;
  status: string;
}

interface DashboardStats {
  totalCredentials: number;
  averageScore: number;
  activeAssessments: number;
}

function RouteComponent() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCredentials: 0,
    averageScore: 0,
    activeAssessments: 0,
  });
  const [recentCredentials] = useState<Credential[]>([]);
  const [availableAssessments, setAvailableAssessments] = useState<
    CVAssessment[]
  >([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);

        // Fetch user profile which contains assessments
        const profileResponse = await fetch('/api/profile', {
          credentials: 'include',
        });

        if (profileResponse.ok) {
          const data = await profileResponse.json();

          // Extract available assessments from profile
          if (data.profile?.cvAssessments) {
            const assessments = data.profile.cvAssessments as CVAssessment[];

            // Separate by type
            const generalAssessments = assessments.filter(
              (a) => a.type === 'general',
            );
            const skillAssessments = assessments.filter(
              (a) => a.type === 'skill' || a.type === 'related_skill',
            );

            const selected: CVAssessment[] = [];

            // Add 1 general if available
            if (generalAssessments.length > 0) {
              selected.push(generalAssessments[0]);
            }

            // Add 1 skill (or 2 if no general)
            const skillsNeeded = generalAssessments.length > 0 ? 1 : 2;
            selected.push(...skillAssessments.slice(0, skillsNeeded));

            setAvailableAssessments(selected);

            // Update stats with total available assessments
            setStats({
              totalCredentials: 0,
              averageScore: 0,
              activeAssessments: assessments.length,
            });
          } else {
            setStats({
              totalCredentials: 0,
              averageScore: 0,
              activeAssessments: 0,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
      <div className="flex items-start gap-4 lg:gap-6">
        <div className="min-w-0 flex-1">
          <div className="border-b border-border px-1 pb-3 sm:pb-4 md:pb-5">
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
              Selamat datang kembali, {user?.name?.split(' ')[0]}
            </h1>

            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Lanjutkan asesmen Anda dan bangun kredensial yang dapat
              diverifikasi.
            </p>
          </div>

          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              {/* Hero Stats */}
              <section className="border-b border-border">
                <div className="grid grid-cols-1 sm:grid-cols-3">
                  {[
                    {
                      value: stats.totalCredentials.toString(),
                      label: 'Kredensial',
                      description: 'Terverifikasi blockchain',
                    },
                    {
                      value: `${stats.averageScore}%`,
                      label: 'Rata-rata skor',
                      description: 'Dari seluruh asesmen',
                    },
                    {
                      value: stats.activeAssessments.toString(),
                      label: 'Asesmen tersedia',
                      description: 'Siap dikerjakan',
                    },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className={`p-4 sm:p-6 ${
                        index !== 2 ? 'border-b sm:border-b-0 sm:border-r border-border' : ''
                      }`}
                    >
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {item.label}
                      </p>

                      <p className="mt-1.5 sm:mt-2 text-3xl sm:text-4xl font-bold">{item.value}</p>

                      <p className="mt-1.5 sm:mt-2 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Available Assessments */}
              <section className="border-b border-border">
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold">Asesmen tersedia</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Pilih asesmen untuk memulai validasi skill Anda
                    </p>
                  </div>

                  {availableAssessments.length > 0 ? (
                    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                      {availableAssessments.map((assessment) => (
                        <Link
                          key={assessment.id}
                          to="/app/assessment/$assessmentId"
                          params={{ assessmentId: assessment.id }}
                          className="block h-full"
                        >
                          <div className="group space-y-3 sm:space-y-4 relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-linear-to-br from-background to-muted/20 p-2.5 shadow-xs transition-all hover:shadow-sm hover:border-primary/50">
                            {/* Type badge */}
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant="default" className="text-xs">
                                {assessment.type === 'general' ? (
                                  <>
                                    <Layers className="h-3 w-3" />
                                    General
                                  </>
                                ) : assessment.type === 'related_skill' ? (
                                  <>
                                    <Zap className="h-3 w-3" />
                                    Related Skill
                                  </>
                                ) : (
                                  <>
                                    <Zap className="h-3 w-3" />
                                    Skill
                                  </>
                                )}
                              </Badge>
                              {assessment.category && (
                                <Badge variant="outline" className="text-xs">
                                  <p className="text-xs font-medium text-muted-foreground/80">
                                    {assessment.category}
                                  </p>
                                </Badge>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-1.5 sm:space-y-2">
                              <h3 className="text-base sm:text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                                {assessment.title}
                              </h3>
                              <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground">
                                {assessment.description ||
                                  'Uji kemampuan Anda dalam topik ini'}
                              </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between border-t border-border/50 pt-3 sm:pt-4">
                              <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  <span className="text-xs">{assessment.estimatedTime}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  <span className="text-xs">{assessment.questionCount} soal</span>
                                </div>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-muted/20 p-4 sm:p-6 text-center">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Unggah CV Anda untuk mendapatkan rekomendasi asesmen
                        yang sesuai dengan profil Anda.
                      </p>
                      <Link to="/app/parse-cv" className="mt-3 inline-block">
                        <Button size="sm" className="sm:text-sm">Unggah CV</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              {/* Credentials */}
              <section>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border p-4 sm:p-5 md:p-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold">
                      Kredensial terbaru
                    </h2>

                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Pencapaian yang telah diverifikasi
                    </p>
                  </div>

                  <Link to="/app/credentials" preload="intent">
                    <Button variant="ghost" size="sm" className="sm:text-sm">Lihat semua</Button>
                  </Link>
                </div>

                <div className="divide-y divide-border">
                  {recentCredentials.length > 0 ? (
                    recentCredentials.map((cred) => {
                      const score = Math.round((cred.thetaCurrent + 3) * 16.67);
                      const date = new Date(cred.createdAt).toLocaleDateString(
                        'id-ID',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        },
                      );

                      return (
                        <div
                          key={cred.id}
                          className="p-4 sm:p-5 md:p-6 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">
                                {cred.level}
                              </p>

                              <h3 className="mt-1 text-sm sm:text-base font-semibold">
                                {cred.role}
                              </h3>

                              <p className="mt-2 sm:mt-3 text-xs text-muted-foreground">
                                {date}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-2xl sm:text-3xl font-bold">{score}</p>

                              <p className="text-xs text-muted-foreground">
                                skor akhir
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-primary/10 px-2.5 sm:px-3 py-1 text-xs font-medium text-primary">
                            <svg
                              className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Blockchain verified
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 sm:p-5 md:p-6 text-center text-xs sm:text-sm text-muted-foreground">
                      Belum ada kredensial. Selesaikan asesmen pertama Anda
                      untuk mendapatkan kredensial.
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
        <div className="hidden shrink-0 md:block">
          {isLoading ? <AsideProfileSkeleton /> : <AsideProfile />}
        </div>
      </div>
    </main>
  );
}
