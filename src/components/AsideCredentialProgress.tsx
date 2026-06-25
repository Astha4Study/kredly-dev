import { useEffect, useMemo, useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { useAuth } from '@/contexts/auth';

interface UserProfile {
  id: string;
  userId: string;
  cvFileName: string;
  cvFilePath: string;
  experience: string;
  isStudent: boolean;
  degree?: string;
  cvAssessments?: Array<{ id: string }>;
  createdAt: string;
  updatedAt: string;
}

export default function AsideCredentialProgress() {
  const { user } = useAuth();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [, setProfileLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.profile);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const onboardingSteps = useMemo(
    () => [
      {
        label: 'Lengkapi profil dasar',
        done: Boolean(user?.name),
      },
      {
        label: 'Pilih username',
        done: Boolean(user?.username),
      },
      {
        label: 'Unggah CV',
        done: Boolean(userProfile?.cvFilePath),
      },
      {
        label: 'Tambahkan pengalaman',
        done: Boolean(userProfile?.experience),
      },
      {
        label: 'Ikuti asesmen pertama',
        // TODO: Check if user has any assessments from cvAssessments when available
        done: Boolean(userProfile?.cvAssessments && userProfile.cvAssessments.length > 0),
      },
      {
        label: 'Dapatkan kredensial pertama',
        // TODO: Check if user has completed sessions/credentials when API available
        done: false,
      },
    ],
    [user, userProfile],
  );

  const completedSteps = onboardingSteps.filter((step) => step.done).length;
  const progressPercentage = (completedSteps / onboardingSteps.length) * 100;

  // Hide component when all steps are completed
  if (completedSteps === onboardingSteps.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium">Progress kredensial</h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Lengkapi langkah berikut untuk mendapatkan kredensial pertama Anda.
        </p>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Progress</span>

          <span className="text-xs font-medium">
            {completedSteps}/{onboardingSteps.length}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {onboardingSteps.map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            <Checkbox checked={step.done} disabled />

            <span className="text-sm">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
