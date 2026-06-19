import { useAuth } from '@/contexts';
import { useEffect, useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Link } from '@tanstack/react-router';

interface UserProfile {
  id: string;
  userId: string;
  cvFileName: string;
  cvFilePath: string;
  experience: string;
  isStudent: boolean;
  degree?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AsideProfile() {
  const { user } = useAuth();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

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
        done: true,
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
        done: false,
      },
      {
        label: 'Dapatkan kredensial pertama',
        done: false,
      },
    ],
    [user, userProfile],
  );

  const completedSteps = onboardingSteps.filter((step) => step.done).length;

  const progressPercentage = (completedSteps / onboardingSteps.length) * 100;

  return (
    <aside className="sticky top-20 w-64 shrink-0">
      <div className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          {/* User */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 shrink-0 border border-border">
                <AvatarImage
                  src={user?.image}
                  alt={user?.name || 'Pengguna'}
                  className="object-cover"
                />

                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {user?.name || 'Pengguna'}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 border-y border-border">
            {[
              {
                value: '3',
                label: 'Asesmen',
                to: '/app/assessments' as const,
              },
              {
                value: '2',
                label: 'Kredensial',
                to: '/app/certification' as const,
              },
            ].map((stat, index) => (
              <Link
                key={stat.label}
                to={stat.to}
                className={`block p-4 transition-colors hover:bg-muted ${
                  index === 0 ? 'border-r border-border' : ''
                }`}
              >
                <p className="text-xl font-semibold tabular-nums">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </Link>
            ))}
          </div>

          {/* Profile */}
          <div className="p-4">
            <h3 className="mb-4 text-sm font-medium">Profil</h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>

                <p className="mt-1 text-sm">
                  {profileLoading
                    ? '—'
                    : userProfile?.isStudent
                      ? 'Mahasiswa'
                      : 'Profesional'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Pengalaman</p>

                <p className="mt-1 text-sm">
                  {profileLoading
                    ? '—'
                    : userProfile?.experience || 'Belum diatur'}
                </p>
              </div>

              {userProfile?.degree && (
                <div>
                  <p className="text-xs text-muted-foreground">Pendidikan</p>

                  <p className="mt-1 text-sm">{userProfile.degree}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Kredensial */}
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium">Progress kredensial</h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Lengkapi langkah berikut untuk mendapatkan kredensial pertama
              Anda.
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
      </div>
    </aside>
  );
}
