import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuth } from '@/contexts';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import Illustration1 from '@/assets/images/Illustration1.png';

export const Route = createFileRoute('/_auth/onboarding')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { user, refetch } = useAuth();
  const {
    currentUserId,
    currentStep,
    fullName,
    username,
    cvFile,
    experience,
    isStudent,
    degree,
    setUserId,
    setCurrentStep,
    setFullName,
    setUsername,
    setCvFile,
    setExperience,
    setIsStudent,
    setDegree,
    setCompleted,
    reset,
  } = useOnboardingStore();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form saat component mount atau saat user berubah
  useEffect(() => {
    if (user?.id) {
      // Jika user ID berbeda dari yang tersimpan di store, berarti ganti user
      if (currentUserId !== user.id) {
        // Clear localStorage
        localStorage.clear();

        // Reset semua field di store
        reset();

        // Set user ID baru
        setUserId(user.id);

        // Pre-fill HANYA username dari email dengan delay
        const timer = setTimeout(() => {
          if (user.email) {
            const defaultUsername = user.email
              .split('@')[0]
              .toLowerCase()
              .replace(/[^a-z0-9._]/g, '');
            setUsername(defaultUsername);
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [user?.id, currentUserId, reset, setUserId, setUsername, user?.email]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setCvFile(file);
    }
  };

  const handleStepOneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim() && username.trim()) {
      setCurrentStep(2);
    }
  };

  const handleStepTwoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cvFile) {
      setCurrentStep(3);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Tampilkan dialog konfirmasi
    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);

    // Prepare FormData for multipart upload
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('username', username);
    if (cvFile) {
      formData.append('cvFile', cvFile);
    }
    formData.append('experience', experience);
    formData.append('isStudent', isStudent ? 'true' : 'false');
    if (isStudent && degree) {
      formData.append('degree', degree);
    }

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Onboarding berhasil diselesaikan!');

        // Mark as completed di local storage
        setCompleted(true);

        // Refetch user data untuk update hasCompletedOnboarding
        await refetch();

        // Redirect ke /app dengan smooth navigation
        navigate({ to: '/app' });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Gagal menyimpan data onboarding');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      toast.error('Gagal menyimpan data onboarding');
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  // Validasi step 3 - semua harus terisi
  const isStep3Valid =
    experience !== '' &&
    isStudent !== null &&
    (isStudent === false || (isStudent === true && degree.trim() !== ''));

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      {/* Decorative Glow Left */}
      <div className="pointer-events-none absolute -left-24 top-1/2 hidden h-96 w-96 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl md:block" />

      {/* Decorative Glow Right */}
      <div className="pointer-events-none absolute -right-24 top-1/2 hidden h-96 w-96 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl md:block" />

      {/* Illustration */}
      <div className="pointer-events-none absolute bottom-0 -left-3 hidden lg:block">
        <img
          src={Illustration1}
          alt="Illustration"
          className="w-100 select-none opacity-90 xl:w-125"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-between">
          <Badge variant="default">Step {currentStep} of 3</Badge>

          {currentStep > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep((currentStep - 1) as 1 | 2 | 3);
                }
              }}
            >
              Kembali
            </Button>
          )}
        </div>

        {currentStep === 1 ? (
          <>
            <div className="mt-6 space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                Lengkapi profil Anda
              </h1>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Informasi ini akan digunakan pada credential dan profil publik
                Anda.
              </p>
            </div>

            <form onSubmit={handleStepOneSubmit} className="mt-10 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>

                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>

                <div className="relative">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '')
                          .replace(/[^a-z0-9._]/g, ''),
                      )
                    }
                    placeholder="username"
                    required
                  />
                </div>

                <div className="rounded-lg border border-dashed border-border px-3 py-3">
                  <p className="text-xs text-muted-foreground">
                    Public profile URL
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    kredly.com/@{username || 'username'}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!fullName.trim() || !username.trim()}
              >
                Simpan dan Lanjutkan
              </Button>
            </form>
          </>
        ) : currentStep === 2 ? (
          <>
            <div className="mt-6 space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                Upload CV Anda
              </h1>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Upload CV Anda untuk melengkapi profil dan meningkatkan
                kredibilitas.
              </p>
            </div>

            <form onSubmit={handleStepTwoSubmit} className="mt-10 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cvFile">CV (PDF)</Label>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted p-8">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium">
                        {cvFile ? cvFile.name : 'Pilih file CV'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Format PDF, maksimal 5MB
                      </p>
                    </div>
                  </div>

                  <Input
                    id="cvFile"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!cvFile}
              >
                Simpan dan Lanjutkan
              </Button>
            </form>
          </>
        ) : currentStep === 3 ? (
          <>
            <div className="mt-6 space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                Informasi Pengalaman
              </h1>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Bantu kami memahami latar belakang dan pengalaman Anda.
              </p>
            </div>

            <form onSubmit={handleFinalSubmit} className="mt-10 space-y-6">
              <div className="space-y-2">
                <Label>Berapa lama pengalaman kerja Anda?</Label>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={experience === 'below-1' ? 'default' : 'outline'}
                    onClick={() => setExperience('below-1')}
                  >
                    Di bawah 1 tahun
                  </Button>
                  <Button
                    type="button"
                    variant={experience === '1-2' ? 'default' : 'outline'}
                    onClick={() => setExperience('1-2')}
                  >
                    1-2 tahun
                  </Button>
                  <Button
                    type="button"
                    variant={experience === '3-5' ? 'default' : 'outline'}
                    onClick={() => setExperience('3-5')}
                  >
                    3-5 tahun
                  </Button>
                  <Button
                    type="button"
                    variant={
                      experience === 'not-working' ? 'default' : 'outline'
                    }
                    onClick={() => setExperience('not-working')}
                  >
                    Belum bekerja
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Apakah Anda seorang student?</Label>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={isStudent === true ? 'default' : 'outline'}
                    onClick={() => setIsStudent(true)}
                  >
                    Ya
                  </Button>
                  <Button
                    type="button"
                    variant={isStudent === false ? 'default' : 'outline'}
                    onClick={() => setIsStudent(false)}
                  >
                    Tidak
                  </Button>
                </div>
              </div>

              {isStudent === true && (
                <div className="space-y-2">
                  <Label htmlFor="degree">Jurusan / Degree</Label>

                  <Input
                    id="degree"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="Contoh: Teknik Informatika"
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!isStep3Valid}
              >
                Selesai
              </Button>
            </form>
          </>
        ) : null}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah data sudah benar?</AlertDialogTitle>
            <AlertDialogDescription>
              Pastikan semua informasi yang Anda masukkan sudah benar. Anda
              masih bisa mengubahnya nanti di halaman profil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Ya, Simpan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
