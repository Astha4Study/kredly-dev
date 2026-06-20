import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuth } from '@/contexts';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { StepOneOnboarding } from '@/components/StepOneOnboarding';
import { StepTwoOnboarding } from '@/components/StepTwoOnboarding';
import { StepThreeOnboarding } from '@/components/StepThreeOnboarding';
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

  const handleFinalSubmit = () => {
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
          className="w-100 h-auto aspect-[4/5] object-contain select-none opacity-90 xl:w-125"
          loading="lazy"
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

        {currentStep === 1 && (
          <StepOneOnboarding
            fullName={fullName}
            username={username}
            setFullName={setFullName}
            setUsername={setUsername}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <StepTwoOnboarding
            cvFile={cvFile}
            setCvFile={setCvFile}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <StepThreeOnboarding
            experience={experience}
            isStudent={isStudent}
            degree={degree}
            setExperience={setExperience}
            setIsStudent={setIsStudent}
            setDegree={setDegree}
            onSubmit={handleFinalSubmit}
            isValid={isStep3Valid}
          />
        )}
      </div>

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
