import { createFileRoute, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Award, FileText, Briefcase, Target } from 'lucide-react';
import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';

export const Route = createFileRoute('/_app/app/profile/$profileId/')({
  component: RouteComponent,
});

interface PublicProfile {
  id: string;
  name: string;
  username: string;
  image?: string;
  headline?: string;
  bio?: string;
  cvRole?: string;
  cvLevel?: string;
  cvSkills?: string[];
  certificates?: any[];
  assessments?: any[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
  };
}

function RouteComponent() {
  const { profileId } = useParams({ from: '/_app/app/profile/$profileId/' });
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/profile/public/${profileId}`);

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data.profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [profileId]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Profil tidak ditemukan
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            User @{profileId} tidak ada atau profil belum diatur sebagai publik
          </p>
          <Button asChild>
            <a href="/app">Kembali ke Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  const certificateCount = profile.certificates?.length || 0;
  const assessmentCount = profile.assessments?.length || 0;
  const skillCount = profile.cvSkills?.length || 0;

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Header Section */}
            <div className="p-6 bg-linear-to-br from-background to-muted/20">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-lg">
                  <AvatarImage src={profile.image} alt={profile.name} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">
                    {profile.name}
                  </h1>
                  <p className="text-muted-foreground mb-3">
                    @{profile.username}
                  </p>

                  {profile.headline && (
                    <p className="text-base font-medium text-foreground mb-3">
                      {profile.headline}
                    </p>
                  )}

                  {profile.bio && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {profile.socialLinks &&
                (profile.socialLinks.linkedin ||
                  profile.socialLinks.github ||
                  profile.socialLinks.portfolio ||
                  profile.socialLinks.twitter) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.socialLinks.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                          <ExternalLink className="ml-1.5 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {profile.socialLinks.github && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={profile.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GitHub
                          <ExternalLink className="ml-1.5 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {profile.socialLinks.portfolio && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={profile.socialLinks.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Portfolio
                          <ExternalLink className="ml-1.5 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {profile.socialLinks.twitter && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={profile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Twitter
                          <ExternalLink className="ml-1.5 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
            </div>

            <Separator />

            {/* Stats Overview */}
            <div className="px-6 py-4 bg-linear-to-br from-muted/20 to-background">
              <div className="grid grid-cols-3 gap-3">
                <div className="group relative overflow-hidden rounded-lg border bg-background p-3 transition-all hover:shadow-sm hover:border-primary/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/10 to-primary/5">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold leading-none mb-1">
                        {certificateCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sertifikat
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-lg border bg-background p-3 transition-all hover:shadow-sm hover:border-primary/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/10 to-primary/5">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold leading-none mb-1">
                        {assessmentCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Assessment
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-lg border bg-background p-3 transition-all hover:shadow-sm hover:border-primary/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/10 to-primary/5">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold leading-none mb-1">
                        {skillCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Skills</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Assessments */}
            {profile.assessments && profile.assessments.length > 0 && (
              <>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Assessment Selesai
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {profile.assessments.map((assessment: any) => (
                      <div
                        key={assessment.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-9 w-9 bg-primary/10 flex items-center justify-center rounded shrink-0">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {assessment.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                assessment.completedAt,
                              ).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        {assessment.score !== undefined && (
                          <Badge variant="default" className="ml-2 shrink-0">
                            {assessment.score}%
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Professional Info */}
            {(profile.cvRole || profile.cvLevel) && (
              <>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Informasi Profesional
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.cvRole && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">
                          Role
                        </p>
                        <p className="text-sm font-semibold">
                          {profile.cvRole}
                        </p>
                      </div>
                    )}
                    {profile.cvLevel && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">
                          Level
                        </p>
                        <p className="text-sm font-semibold">
                          {profile.cvLevel}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Skills */}
            {profile.cvSkills && profile.cvSkills.length > 0 && (
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Skills
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.cvSkills.map((skill, idx) => (
                    <Badge key={idx} variant="default" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
