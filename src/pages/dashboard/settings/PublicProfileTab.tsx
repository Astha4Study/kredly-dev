import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Loader2,
  Copy,
  ExternalLink,
  Globe,
} from 'lucide-react';

interface PublicProfileSettings {
  isPublic: boolean;
  headline: string;
  bio: string;
  showCertificates: boolean;
  showAssessments: boolean;
  showSkills: boolean;
  showCVData: boolean;
  socialLinks: {
    linkedin: string;
    github: string;
    portfolio: string;
    twitter: string;
  };
}

export default function PublicProfileTab() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<PublicProfileSettings>({
    isPublic: false,
    headline: '',
    bio: '',
    showCertificates: true,
    showAssessments: true,
    showSkills: true,
    showCVData: false,
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: '',
      twitter: '',
    },
  });

  const profileUrl = user?.username
    ? `${window.location.origin}/app/profile/${user.username}`
    : '';

  useEffect(() => {
    async function fetchPublicProfile() {
      try {
        const response = await fetch('/api/user/public-profile-settings', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (error) {
        console.error('Failed to fetch public profile settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPublicProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/public-profile-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan pengaturan profil publik');
      }

      toast.success('Pengaturan profil publik berhasil disimpan');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menyimpan pengaturan',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success('URL profil berhasil disalin');
    } catch {
      toast.error('Gagal menyalin URL');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profil Publik</h2>
        <p className="text-sm text-muted-foreground">
          Kelola tampilan profil publik dan kredensial Anda
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>URL Profil Publik</CardTitle>
          <CardDescription>
            Link ke profil publik Anda yang dapat dibagikan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={profileUrl} readOnly className="font-mono" />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyUrl}
              disabled={!user?.username}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(profileUrl, '_blank')}
              disabled={!user?.username}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          {!user?.username && (
            <p className="text-xs text-muted-foreground">
              Set username di tab Profil untuk mendapatkan URL publik
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibilitas Profil</CardTitle>
          <CardDescription>
            Kontrol apakah profil Anda dapat diakses oleh publik
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isPublic">Aktifkan Profil Publik</Label>
              <p className="text-sm text-muted-foreground">
                Jika diaktifkan, profil Anda dapat dilihat oleh siapa saja yang mengetahui username Anda
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={settings.isPublic}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, isPublic: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Publik</CardTitle>
              <CardDescription>
                Bio dan headline yang akan ditampilkan di profil publik
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  placeholder="e.g., Full-stack Developer | React & Node.js"
                  value={settings.headline}
                  onChange={(e) =>
                    setSettings({ ...settings, headline: e.target.value })
                  }
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  Tagline singkat tentang diri Anda (maks. 100 karakter)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Ceritakan tentang pengalaman dan keahlian Anda..."
                  value={settings.bio}
                  onChange={(e) =>
                    setSettings({ ...settings, bio: e.target.value })
                  }
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  Deskripsi singkat tentang pengalaman profesional Anda (maks.
                  500 karakter)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tampilan</CardTitle>
              <CardDescription>
                Pilih informasi yang ingin ditampilkan di profil publik
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sertifikat Terverifikasi</Label>
                  <p className="text-sm text-muted-foreground">
                    Tampilkan sertifikat blockchain yang telah diterbitkan
                  </p>
                </div>
                <Switch
                  checked={settings.showCertificates}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showCertificates: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hasil Assessment</Label>
                  <p className="text-sm text-muted-foreground">
                    Tampilkan assessment yang telah diselesaikan dan skornya
                  </p>
                </div>
                <Switch
                  checked={settings.showAssessments}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showAssessments: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Skills Terverifikasi</Label>
                  <p className="text-sm text-muted-foreground">
                    Tampilkan skills yang telah diverifikasi melalui assessment
                  </p>
                </div>
                <Switch
                  checked={settings.showSkills}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showSkills: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data CV</Label>
                  <p className="text-sm text-muted-foreground">
                    Tampilkan role, level, dan summary dari CV Anda
                  </p>
                </div>
                <Switch
                  checked={settings.showCVData}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showCVData: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Tambahkan link ke profil profesional Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">
                  <div className="flex items-center gap-2">
                    LinkedIn
                  </div>
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={settings.socialLinks.linkedin}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: {
                        ...settings.socialLinks,
                        linkedin: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github">
                  <div className="flex items-center gap-2">
                    GitHub
                  </div>
                </Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/username"
                  value={settings.socialLinks.github}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: {
                        ...settings.socialLinks,
                        github: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Portfolio Website
                  </div>
                </Label>
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={settings.socialLinks.portfolio}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: {
                        ...settings.socialLinks,
                        portfolio: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">
                  <div className="flex items-center gap-2">
                    Twitter / X
                  </div>
                </Label>
                <Input
                  id="twitter"
                  type="url"
                  placeholder="https://twitter.com/username"
                  value={settings.socialLinks.twitter}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: {
                        ...settings.socialLinks,
                        twitter: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </Button>
      </div>
    </div>
  );
}
