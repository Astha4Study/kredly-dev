import * as React from 'react';
import {
  createFileRoute,
  useNavigate,
  Link,
  useParams,
} from '@tanstack/react-router';
import { useAuth } from '@/contexts/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Loader2,
  AlertCircle,
  BookOpen,
  Clock,
  Award,
  Zap,
  X,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { sessionService } from '@/services/sessionService';
import { toast } from 'sonner';

interface CVAssessment {
  id: string;
  type: 'general' | 'skill';
  title: string;
  description?: string;
  estimatedTime: string;
  questionCount: number;
  topics?: string[];
  isRecommended: boolean;
  category?: string;
  status: string;
}

export const Route = createFileRoute('/_app/app/assessment/$assessmentId/')({
  component: TestOverviewPage,
});

function TestOverviewPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { assessmentId } = useParams({
    from: '/_app/app/assessment/$assessmentId/',
  });

  const [role, setRole] = React.useState(() => user?.cvRole || '');
  const [level, setLevel] = React.useState(() => user?.cvLevel || 'Junior');
  const [skills, setSkills] = React.useState<string[]>(() =>
    (user?.cvSkills || []).slice(0, 5),
  );
  const [allSkills, setAllSkills] = React.useState<string[]>(
    () => user?.cvSkills || [],
  );
  const [summary, setSummary] = React.useState(() => user?.cvSummary || '');
  const [newSkill, setNewSkill] = React.useState('');
  const [isCreatingSession, setIsCreatingSession] = React.useState(false);
  const [sessionError, setSessionError] = React.useState<string | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [assessment, setAssessment] = React.useState<CVAssessment | null>(null);

  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            const prof = data.profile;

            if (assessmentId) {
              const cvAssessments = (prof.cvAssessments ||
                []) as CVAssessment[];
              const matched = cvAssessments.find((a) => a.id === assessmentId);
              if (matched) {
                setAssessment(matched);
                setRole(matched.title || 'Software Engineer');
                const matchedSkills =
                  matched.type === 'general'
                    ? matched.topics || []
                    : [matched.title];
                setAllSkills(matchedSkills);
                setSkills(matchedSkills);
                setSummary(matched.description || '');
                setProfileLoading(false);
                return;
              }
            }

            setRole(prof.cvRole || 'Software Engineer');
            setLevel(prof.cvLevel || 'Junior');
            setAllSkills(prof.cvSkills || []);
            setSkills((prof.cvSkills || []).slice(0, 5));
            setSummary(prof.cvSummary || '');
            setProfileLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, [assessmentId]);

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">
            Memuat profil Anda...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Card className="max-w-md w-full border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-destructive">
              Akses Ditolak
            </CardTitle>
            <CardDescription>
              Silakan masuk terlebih dahulu untuk mengakses halaman ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Card className="max-w-md w-full border-border bg-card">
          <CardHeader className="text-center space-y-4">
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
              <CardTitle className="text-xl font-bold">
                Belum Ada Data Skill
              </CardTitle>
              <CardDescription className="mt-1.5">
                Silakan unggah CV Anda terlebih dahulu untuk menganalisis skill
                dan mengakses halaman asesmen.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Link to="/app/assessment">
              <Button variant="outline">Kembali ke Asesmen</Button>
            </Link>
            <Link to="/app/parse-cv">
              <Button>Unggah CV</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleSkill = (skill: string) => {
    setSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((s) => s !== skill);
      }
      if (prev.length >= 5) {
        toast.warning('Maksimal 5 skill yang dapat diuji sekaligus');
        return prev;
      }
      return [...prev, skill];
    });
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;

    if (allSkills.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      toast.info('Skill sudah ada di daftar');
      setNewSkill('');
      return;
    }

    if (skills.length >= 5) {
      toast.warning(
        'Maksimal 5 skill. Hapus salah satu skill untuk menambahkan skill baru.',
      );
      return;
    }

    setAllSkills((prev) => [...prev, trimmed]);
    setSkills((prev) => [...prev, trimmed]);
    setNewSkill('');
  };

  const handleStartExam = async () => {
    if (skills.length === 0) {
      toast.error('Pilih minimal 1 skill untuk diuji');
      return;
    }

    setIsCreatingSession(true);
    setSessionError(null);

    try {
      const response = await sessionService.createSession({
        role: role,
        level: level,
        skills: skills,
        cv_summary:
          summary ||
          user.cvSummary ||
          `${role}, level ${level}, skills: ${skills.join(', ')}`,
        assessment_id: assessmentId,
      });

      toast.success('Sesi ujian berhasil dibuat!');
      navigate({
        to: '/quiz/$sessionId',
        params: { sessionId: response.session_id },
      });
    } catch (err) {
      setSessionError(
        err instanceof Error ? err.message : 'Gagal membuat sesi ujian',
      );
      toast.error('Gagal memulai ujian');
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-5xl">
        <div className="space-y-6">
          {/* Assessment Info Card */}
          {assessment && (
            <Card className="border-border/50 bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      {assessment.title}
                    </h3>

                    {assessment.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-2xl">
                        {assessment.description}
                      </p>
                    )}
                  </div>

                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="gap-1.5 font-normal">
                      <Clock className="h-3.5 w-3.5" />
                      {assessment.estimatedTime}
                    </Badge>

                    <Badge variant="outline" className="gap-1.5 font-normal">
                      <BookOpen className="h-3.5 w-3.5" />
                      {assessment.questionCount} Soal
                    </Badge>
                  </div>
                </div>

                {/* Mobile */}
                <div className="mt-4 flex sm:hidden items-center gap-2">
                  <Badge variant="outline" className="gap-1.5 font-normal">
                    <Clock className="h-3.5 w-3.5" />
                    {assessment.estimatedTime}
                  </Badge>

                  <Badge variant="outline" className="gap-1.5 font-normal">
                    <BookOpen className="h-3.5 w-3.5" />
                    {assessment.questionCount} Soal
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Skill/Topic Selection */}
            <div className="lg:col-span-2 space-y-5">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {assessment
                          ? 'Materi yang Akan Diuji'
                          : 'Pilih Skill untuk Diuji'}
                      </CardTitle>
                      <CardDescription className="mt-1.5">
                        {assessment
                          ? 'Topik dan materi yang akan diujikan dalam assessment ini'
                          : 'Pilih minimal 1 dan maksimal 5 skill yang ingin Anda uji'}
                      </CardDescription>
                    </div>
                    {!assessment && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-xs font-medium"
                      >
                        {skills.length}/5
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assessment ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(assessment.topics && assessment.topics.length > 0
                        ? assessment.topics
                        : [assessment.title]
                      ).map((topic: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border/60 bg-muted/30"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm font-medium text-foreground truncate">
                            {topic}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {/* Selected Skills */}
                      {skills.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-foreground">
                            Skill Terpilih
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="pl-3 pr-2 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                              >
                                {skill}
                                <button
                                  onClick={() => removeSkill(skill)}
                                  className="ml-2 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Available Skills */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground">
                          Skill Tersedia
                        </Label>
                        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
                          {allSkills
                            .filter((s) => !skills.includes(s))
                            .map((skill) => {
                              const isDisabled = skills.length >= 5;
                              return (
                                <button
                                  key={skill}
                                  onClick={() =>
                                    !isDisabled && toggleSkill(skill)
                                  }
                                  disabled={isDisabled}
                                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                    isDisabled
                                      ? 'opacity-40 border-border bg-muted/20 cursor-not-allowed text-muted-foreground'
                                      : 'border-border hover:border-primary/50 hover:bg-muted/50 text-foreground cursor-pointer'
                                  }`}
                                >
                                  {skill}
                                </button>
                              );
                            })}
                        </div>
                      </div>

                      {/* Add Custom Skill */}
                      <form
                        onSubmit={handleAddCustomSkill}
                        className="flex gap-2 pt-2 border-t border-border/40"
                      >
                        <Input
                          placeholder="Tambahkan skill kustom..."
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="bg-background border-border text-sm flex-1"
                        />
                        <Button
                          type="submit"
                          size="icon"
                          disabled={skills.length >= 5}
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Guidelines */}
              <Card className="border-border/50 bg-background">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Petunjuk Asesmen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          Computer Adaptive Testing (CAT)
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Tingkat kesulitan soal akan menyesuaikan dengan
                          kemampuan Anda secara real-time.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          Durasi & Jumlah Soal
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {assessment
                            ? `Estimasi ${assessment.estimatedTime} dengan ${assessment.questionCount} soal.`
                            : 'Estimasi 15-20 menit dengan 10-15 soal.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          Verifikasi Blockchain
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Hasil asesmen akan diverifikasi dan disimpan di
                          blockchain untuk kredensial yang terautentikasi.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Action Card */}
            <div className="lg:col-span-1">
              <Card className="border-border/50 sticky top-20">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-semibold">
                    Siap Memulai?
                  </CardTitle>
                  <CardDescription>
                    Pastikan Anda sudah siap sebelum memulai asesmen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary Stats */}
                  <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Role</span>
                      <span className="font-medium text-foreground">
                        {role || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-medium text-foreground">
                        {level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Skill Diuji</span>
                      <span className="font-medium text-foreground">
                        {skills.length} skill
                      </span>
                    </div>
                  </div>

                  {sessionError && (
                    <div className="flex items-start gap-2 p-3 border border-rose-500/20 bg-rose-500/5 rounded-lg text-xs text-rose-600 dark:text-rose-400">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{sessionError}</span>
                    </div>
                  )}

                  <Button
                    size="lg"
                    onClick={handleStartExam}
                    disabled={skills.length === 0 || isCreatingSession}
                    className="w-full group cursor-pointer"
                  >
                    {isCreatingSession ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Membuat Sesi...
                      </>
                    ) : (
                      <>Mulai Asesmen</>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Dengan memulai asesmen, Anda menyetujui{' '}
                    <a href="#" className="text-primary hover:underline">
                      syarat dan ketentuan
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
