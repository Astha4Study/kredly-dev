import { createFileRoute, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Award, FileText, Loader2 } from 'lucide-react';

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
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

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b">
              <div className="flex items-start mb-4">
                <Avatar className="h-24 w-24 border-2 border-primary/20 mr-6">
                  <AvatarImage src={profile.image} alt={profile.name} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                  <p className="text-muted-foreground mb-2">@{profile.username}</p>
                  {profile.headline && (
                    <p className="text-base font-medium text-foreground">
                      {profile.headline}
                    </p>
                  )}
                </div>
              </div>

              {profile.bio && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>

            {profile.assessments && profile.assessments.length > 0 && (
              <div className="p-6 border-b space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Assessments yang Diselesaikan
                </p>
                <div className="space-y-2">
                  {profile.assessments.map((assessment: any) => (
                    <div key={assessment.id} className="flex items-center justify-between border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{assessment.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Diselesaikan {new Date(assessment.completedAt).toLocaleDateString('id-ID')}
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

            {(profile.cvRole || profile.cvLevel) && (
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

            {profile.cvSkills && profile.cvSkills.length > 0 && (
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

            {profile.socialLinks &&
              (profile.socialLinks.linkedin ||
                profile.socialLinks.github ||
                profile.socialLinks.portfolio ||
                profile.socialLinks.twitter) && (
                <div className="p-6 border-b space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Social Links
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.socialLinks.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                          <ExternalLink className="ml-2 h-3 w-3" />
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
                          <ExternalLink className="ml-2 h-3 w-3" />
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
                          <ExternalLink className="ml-2 h-3 w-3" />
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
                      {profile.certificates?.length || 0}
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
