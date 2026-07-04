import { createFileRoute, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import GridBorder from '@/components/GridBorder';
import { Loader2, ExternalLink, Award, CheckCircle2 } from 'lucide-react';

export const Route = createFileRoute('/_public/@$username')({
  component: PublicProfilePage,
});

interface PublicProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  image?: string;
  headline?: string;
  bio?: string;
  cvRole?: string;
  cvLevel?: string;
  cvSkills?: string[];
  certificates?: Certificate[];
  assessments?: Assessment[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
  };
  displaySettings?: {
    showCertificates: boolean;
    showAssessments: boolean;
    showSkills: boolean;
    showCVData: boolean;
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

function PublicProfilePage() {
  const { username } = useParams({ from: '/_public/@$username' });
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/profile/public/${username}`);

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
  }, [username]);

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
            User @{username} tidak ada atau profil belum diatur
          </p>
          <Button asChild>
            <a href="/">Kembali ke Beranda</a>
          </Button>
        </div>
      </div>
    );
  }

  const displaySettings = profile.displaySettings || {
    showCertificates: true,
    showAssessments: true,
    showSkills: true,
    showCVData: false,
  };

  return (
    <div className="min-h-screen pb-20">
      <section className="px-4 sm:px-6 pt-8">
        <div className="mx-auto max-w-5xl">
          <GridBorder className="w-full">
            <div className="border bg-background p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <Avatar className="h-32 w-32 border-2 border-border">
                  <AvatarImage src={profile.image} alt={profile.name} />
                  <AvatarFallback className="text-4xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {profile.name}
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    @{profile.username}
                  </p>

                  {profile.headline && (
                    <p className="text-lg font-medium mb-4">
                      {profile.headline}
                    </p>
                  )}

                  {profile.bio && (
                    <p className="text-muted-foreground mb-6">{profile.bio}</p>
                  )}

                  {profile.socialLinks && (
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
                  )}
                </div>
              </div>
            </div>
          </GridBorder>
        </div>
      </section>

      <section className="px-4 sm:px-6 mt-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {displaySettings.showCVData &&
            (profile.cvRole || profile.cvLevel || profile.cvSkills) && (
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Profesional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.cvRole && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Role
                        </p>
                        <p className="font-medium">{profile.cvRole}</p>
                      </div>
                    )}
                    {profile.cvLevel && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Level
                        </p>
                        <p className="font-medium">{profile.cvLevel}</p>
                      </div>
                    )}
                  </div>
                  {profile.cvSkills && profile.cvSkills.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.cvSkills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {displaySettings.showCertificates &&
            profile.certificates &&
            profile.certificates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sertifikat Terverifikasi</CardTitle>
                  <CardDescription>
                    Sertifikat yang telah diverifikasi melalui blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-start justify-between border p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-primary/10 flex items-center justify-center">
                            <Award className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{cert.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Diterbitkan{' '}
                              {new Date(cert.issuedAt).toLocaleDateString(
                                'id-ID',
                              )}
                            </p>
                          </div>
                        </div>
                        {cert.verificationUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={cert.verificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Verifikasi
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {displaySettings.showAssessments &&
            profile.assessments &&
            profile.assessments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Assessment</CardTitle>
                  <CardDescription>
                    Assessment yang telah diselesaikan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.assessments.map((assessment) => (
                      <div
                        key={assessment.id}
                        className="flex items-center justify-between border p-4"
                      >
                        <div>
                          <h3 className="font-medium">{assessment.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Diselesaikan{' '}
                            {new Date(
                              assessment.completedAt,
                            ).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        {assessment.score !== undefined && (
                          <Badge
                            variant="default"
                            className="text-lg px-3 py-1"
                          >
                            {assessment.score}%
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {displaySettings.showSkills &&
            profile.cvSkills &&
            profile.cvSkills.length > 0 &&
            !displaySettings.showCVData && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.cvSkills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </section>
    </div>
  );
}
