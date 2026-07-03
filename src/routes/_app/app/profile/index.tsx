import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuth } from '@/contexts/auth';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { ExternalLink, Award, ArrowUpRight, FileText, Clock } from 'lucide-react';
import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';

export const Route = createFileRoute('/_app/app/profile/')({
  component: RouteComponent,
});

interface UserProfile {
  id: string;
  cvFileName?: string;
  cvRole?: string;
  cvLevel?: string;
  cvSkills?: string[];
  cvSummary?: string;
  cvAssessments?: any[];
}

interface PublicProfileSettings {
  headline?: string;
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
  };
}

interface Certificate {
  id: string;
  title: string;
  issuedAt: string;
  verificationUrl?: string;
}

interface Assessment {
  id: string;
  title: string;
  score?: number;
  completedAt: string;
  status: string;
}

function RouteComponent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [publicSettings, setPublicSettings] = useState<PublicProfileSettings | null>(null);
  const [certificates] = useState<Certificate[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          fetch('/api/profile', { credentials: 'include' }),
          fetch('/api/user/public-profile-settings', { credentials: 'include' }),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.profile) {
            setProfile(data.profile);

            // Extract completed assessments from cvAssessments
            if (data.profile.cvAssessments) {
              const completedAssessments = data.profile.cvAssessments
                .filter((a: any) => a.status === 'completed')
                .map((a: any) => ({
                  id: a.id,
                  title: a.title,
                  score: a.score,
                  completedAt: a.updatedAt || a.createdAt || new Date().toISOString(),
                  status: a.status,
                }));
              setAssessments(completedAssessments);
            }
          }
        }

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.settings) {
            setPublicSettings(data.settings);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const profileUrl = user?.username
    ? `${window.location.origin}/@${user.username}`
    : '';

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <Avatar className="h-24 w-24 border-2 border-primary/20 mr-6">
                    <AvatarImage src={user?.image} alt={user?.name || 'User'} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
                    {user?.username && (
                      <p className="text-muted-foreground mb-2">@{user.username}</p>
                    )}
                    {user?.email && (
                      <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                    )}
                    {publicSettings?.headline && (
                      <p className="text-base font-medium text-foreground">
                        {publicSettings.headline}
                      </p>
                    )}
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                {user?.username && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                      Lihat Profil Publik
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                  )}
                <Button variant="default" size="sm" asChild>
                    <Link to='/app/settings'>Edit Profil <ArrowUpRight /></Link>
                </Button>
                </div>
              </div>

              {publicSettings?.bio && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {publicSettings.bio}
                  </p>
                </div>
              )}
            </div>

            {assessments.length > 0 && (
              <div className="p-6 border-b space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Recent Assessments
                  </p>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/app/assessment">
                      Lihat Semua
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
                <div className="space-y-2">
                  {assessments.slice(0, 3).map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{assessment.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(assessment.completedAt).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      {assessment.score !== undefined && (
                        <Badge variant="default" className="px-2 py-1">
                          {assessment.score}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {assessments.length === 0 && profile?.cvAssessments && profile.cvAssessments.length > 0 && (
              <div className="p-6 border-b space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Rekomendasi Assessment
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Berdasarkan profil dan keahlian Anda
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/app/assessment">
                      Lihat Semua
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.cvAssessments
                    .filter((a: any) => a.status !== 'completed')
                    .slice(0, 4)
                    .map((assessment: any) => (
                      <div key={assessment.id} className="border p-4 space-y-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{assessment.title}</h4>
                            {assessment.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {assessment.description}
                              </p>
                            )}
                          </div>
                          {assessment.isRecommended && (
                            <Badge variant="default" className="ml-2 text-xs">
                              Rekomendasi
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {assessment.estimatedTime}
                            </span>
                            <span>{assessment.questionCount} soal</span>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/app/assessment/${assessment.id}`}>
                              Mulai
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {profile && (profile.cvRole || profile.cvLevel) && (
              <div className="p-6 border-b space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Informasi Profesional
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.cvRole && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Role</p>
                      <p className="font-semibold">{profile.cvRole}</p>
                    </div>
                  )}
                  {profile.cvLevel && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Level</p>
                      <p className="font-semibold">{profile.cvLevel}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {profile?.cvSkills && profile.cvSkills.length > 0 && (
              <div className="p-6 border-b space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.cvSkills.map((skill, idx) => (
                    <Badge key={idx} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {publicSettings?.socialLinks &&
              (publicSettings.socialLinks.linkedin ||
               publicSettings.socialLinks.github ||
               publicSettings.socialLinks.portfolio ||
               publicSettings.socialLinks.twitter) && (
              <div className="p-6 border-b space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Social Links
                </p>
                <div className="flex flex-wrap gap-2">
                  {publicSettings.socialLinks.linkedin && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={publicSettings.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        LinkedIn
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {publicSettings.socialLinks.github && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={publicSettings.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {publicSettings.socialLinks.portfolio && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={publicSettings.socialLinks.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Portfolio
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {publicSettings.socialLinks.twitter && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={publicSettings.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Twitter
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Total Sertifikat
                  </p>

                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold tracking-tight">
                      {certificates.length}
                    </span>

                    <span className="pb-1 text-sm text-muted-foreground">
                      Sertifikat
                    </span>
                  </div>
                </div>

                <div className="flex h-14 w-14 items-center justify-center border bg-primary/5">
                  <Award className="h-7 w-7 text-primary" />
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Sertifikat yang berhasil diperoleh dan telah diterbitkan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
