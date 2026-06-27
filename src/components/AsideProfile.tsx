import { useAuth } from '@/contexts/auth';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Link } from '@tanstack/react-router';
import { Award, BookOpen } from 'lucide-react';
import AsideCredentialProgress from './AsideCredentialProgress';

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
                value: userProfile?.cvAssessments?.length.toString() || '0',
                label: 'Asesmen',
                icon: BookOpen,
                to: '/app/assessment' as const,
              },
              {
                value: '0',
                label: 'Kredensial',
                icon: Award,
                to: '/app/credentials' as const,
              },
            ].map((stat, index) => (
              <Link
                key={stat.label}
                to={stat.to}
                className={`group block p-4 transition-colors hover:bg-muted/50 ${
                  index === 0 ? 'border-r border-border' : ''
                }`}
              >
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </Link>
            ))}
          </div>

          {/* Profile */}
          <div className="px-4 pt-2 pb-4">
            <h3 className="mb-4 text-sm font-semibold">Profil</h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Status
                </p>
                <p className="mt-1.5 text-sm font-medium">
                  {profileLoading
                    ? '—'
                    : userProfile?.isStudent
                      ? 'Mahasiswa'
                      : 'Profesional'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Pengalaman
                </p>
                <p className="mt-1.5 text-sm font-medium">
                  {profileLoading
                    ? '—'
                    : userProfile?.experience || 'Belum diatur'}
                </p>
              </div>

              {userProfile?.degree && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Pendidikan
                  </p>
                  <p className="mt-1.5 text-sm font-medium">
                    {userProfile.degree}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Kredensial */}
        <AsideCredentialProgress />
      </div>
    </aside>
  );
}
