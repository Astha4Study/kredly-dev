import * as React from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '@/contexts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Briefcase,
  ArrowRight,
  Plus,
  Pencil,
  Check,
  Loader2,
  AlertCircle,
  BookOpen,
  Clock,
  Award,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { sessionService } from '@/services/sessionService';
import { toast } from 'sonner';

export const Route = createFileRoute('/_app/app/test-overview')({
  component: TestOverviewPage,
});

function TestOverviewPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // States
  const [role, setRole] = React.useState('');
  const [level, setLevel] = React.useState('Junior');
  const [skills, setSkills] = React.useState<string[]>([]);
  const [allSkills, setAllSkills] = React.useState<string[]>([]);
  const [summary, setSummary] = React.useState('');
  const [isEditingRole, setIsEditingRole] = React.useState(false);
  const [newSkill, setNewSkill] = React.useState('');
  const [isCreatingSession, setIsCreatingSession] = React.useState(false);
  const [sessionError, setSessionError] = React.useState<string | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);

  const roleInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch profile dynamically
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
  }, []);

  // Initialize values from user profile fallback if profile fetch resolves without profile
  React.useEffect(() => {
    if (user && !profileLoading && !role && allSkills.length === 0) {
      const userRole = user.cvRole || 'Software Engineer';
      const userLevel = user.cvLevel || 'Junior';
      const userSkills = user.cvSkills || [];
      const userSummary = user.cvSummary || '';

      setRole(userRole);
      setLevel(userLevel);
      setAllSkills(userSkills);
      setSkills(userSkills.slice(0, 5));
      setSummary(userSummary);
    }
  }, [user, profileLoading, role, allSkills]);

  // Focus role input on edit
  React.useEffect(() => {
    if (isEditingRole && roleInputRef.current) {
      roleInputRef.current.focus();
      const len = roleInputRef.current.value.length;
      roleInputRef.current.setSelectionRange(len, len);
    }
  }, [isEditingRole]);

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
          user.cvSummary ||
          `${role}, level ${level}, skills: ${skills.join(', ')}`,
      });

      toast.success('Sesi ujian berhasil dibuat!');
      navigate({
        to: '/quiz/$sessionId',
        params: { sessionId: response.session_id },
      } as any);
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-background/60 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/app"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-lg leading-none text-foreground">
                Persiapan Ujian
              </h1>
              <span className="text-xs text-muted-foreground">
                Tinjau skill dan informasi ujian sebelum memulai
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-10 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Skill Configuration (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-card/50 backdrop-blur-md border-border rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Kustomisasi Profil Ujian
                </CardTitle>
                <CardDescription>
                  Sesuaikan role, tingkat pengalaman, dan skill yang ingin Anda
                  buktikan dalam ujian ini.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Role Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="role-input"
                    className="text-sm font-medium text-foreground"
                  >
                    Role Pekerjaan yang Diuji
                  </Label>
                  <div className="flex items-center gap-2 pb-1 border-b border-border">
                    <h1>{role}</h1>
                  </div>
                </div>

                {/* Level Selection */}
                {/* <div className="space-y-2">
                  <Label
                    htmlFor="level-select"
                    className="text-sm font-medium text-foreground"
                  >
                    Tingkat Pengalaman
                  </Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger
                      id="level-select"
                      className="w-full bg-background border-border"
                    >
                      <SelectValue placeholder="Pilih Tingkat Pengalaman" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Junior">
                        Junior (1-2 tahun pengalaman)
                      </SelectItem>
                      <SelectItem value="Mid">
                        Mid-Level (3-5 tahun pengalaman)
                      </SelectItem>
                      <SelectItem value="Senior">
                        Senior (&gt; 5 tahun pengalaman)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                {/* Skills Checkbox Grid */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">
                      Pilih Skill untuk Diuji
                    </Label>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {skills.length}/5 terpilih
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
                    {allSkills.map((s) => {
                      const isSelected = skills.includes(s);
                      const isDisabled = !isSelected && skills.length >= 5;

                      return (
                        <label
                          key={s}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all cursor-pointer select-none text-left ${
                            isSelected
                              ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                              : isDisabled
                                ? 'opacity-40 border-border bg-muted/20 cursor-not-allowed text-muted-foreground'
                                : 'border-border hover:border-border/85 hover:bg-muted/35 text-foreground'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => toggleSkill(s)}
                            className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30 cursor-pointer disabled:cursor-not-allowed accent-primary"
                          />
                          <span
                            className="text-sm font-medium truncate max-w-[150px]"
                            title={s}
                          >
                            {s}
                          </span>
                        </label>
                      );
                    })}

                    {allSkills.length === 0 && (
                      <p className="text-sm text-muted-foreground italic text-center py-4 w-full">
                        Belum ada skill yang tersimpan di profil Anda.
                      </p>
                    )}
                  </div>

                  {/* Add Custom Skill Form */}
                  <form
                    onSubmit={handleAddCustomSkill}
                    className="flex gap-2 pt-2 border-t border-border/40"
                  >
                    <Input
                      placeholder="Tambahkan skill lain jika tidak terdaftar..."
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Test Overview Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-card/50 backdrop-blur-md border-border rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Ringkasan Ujian
                </CardTitle>
                <CardDescription>
                  Harap baca petunjuk ujian dengan saksama sebelum memulai.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Guidelines Checklist */}
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                      <Zap className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        Computer Adaptive Testing (CAT)
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tingkat kesulitan soal akan menyesuaikan dengan
                        kemampuan Anda secara real-time. Jawablah sebaik
                        mungkin.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        Durasi & Jumlah Soal
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Estimasi pengerjaan adalah 15-20 menit dengan total 10
                        hingga 15 soal (termasuk pilihan ganda dan essay).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                      <Award className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        Verifikasi & Penilaian
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Setelah selesai, sistem AI akan langsung memproses hasil
                        pengerjaan Anda dan memberikan skor serta feedback.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {sessionError && (
                  <div className="flex items-center gap-3 p-3.5 border border-rose-500/20 bg-rose-500/5 rounded-xl text-rose-300 text-xs">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{sessionError}</span>
                  </div>
                )}

                {/* Start Button */}
                <Button
                  size="lg"
                  onClick={handleStartExam}
                  disabled={skills.length === 0 || isCreatingSession}
                  className="w-full group text-base font-semibold"
                >
                  {isCreatingSession ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Membuat Ujian...
                    </>
                  ) : (
                    <>
                      Mulai Ujian Sekarang
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
