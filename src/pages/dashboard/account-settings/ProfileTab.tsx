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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { Loader2, Upload, FileText } from 'lucide-react';

interface UserProfile {
  id: string;
  userId: string;
  cvFileName: string;
  cvFilePath: string;
  experience: string;
  isStudent: boolean;
  degree?: string;
  cvRole?: string;
  cvLevel?: string;
  cvSkills?: string[];
  cvSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfileTab() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInitializedRef = useRef(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
  });

  // Initialize form once when user data loads
  useEffect(() => {
    if (user && !hasInitializedRef.current) {
      setFormData({
        fullName: user.name || '',
        email: user.email || '',
        username: user.username || '',
      });
      hasInitializedRef.current = true;
    }
  }, [user]);

  // Fetch user profile from backend
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setUserProfile(data.profile);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.fullName,
          username: formData.username,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal memperbarui profil');
      }

      toast.success('Profil berhasil diperbarui');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal memperbarui profil',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('File harus berformat PDF');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setIsUploadingCV(true);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch('/api/user/upload-cv', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal mengupload CV');
      }

      const data = await response.json();

      // Update local profile state
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              cvFileName: data.cvFileName,
              cvFilePath: data.cvFilePath,
              cvRole: data.cvRole,
              cvLevel: data.cvLevel,
              cvSkills: data.cvSkills,
              cvSummary: data.cvSummary,
            }
          : null,
      );

      toast.success('CV berhasil diupload dan diparse');

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal mengupload CV',
      );
    } finally {
      setIsUploadingCV(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profil</h2>
        <p className="text-sm text-muted-foreground">
          Kelola informasi profil dan data Anda
        </p>
      </div>

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Foto Profil</CardTitle>
          <CardDescription>
            Update foto profil Anda yang akan ditampilkan di kredensial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.image} alt={user?.name || 'User'} />
              <AvatarFallback className="text-2xl">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" size="sm" disabled>
                Upload Foto
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG atau GIF. Max 2MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
          <CardDescription>Update informasi dasar profil Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="username"
            />
            <p className="text-xs text-muted-foreground">
              kredly.com/@{formData.username || 'username'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} disabled />
            <p className="text-xs text-muted-foreground">
              Email tidak dapat diubah
            </p>
          </div>

          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* CV Upload/Update */}
      <Card>
        <CardHeader>
          <CardTitle>Curriculum Vitae (CV)</CardTitle>
          <CardDescription>
            Upload atau perbarui CV Anda untuk generate assessment yang sesuai
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingProfile ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {userProfile?.cvFileName && (
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {userProfile.cvFileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          CV Saat Ini
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Parsed CV Data */}
                  {(userProfile.cvRole ||
                    userProfile.cvLevel ||
                    userProfile.cvSkills) && (
                    <div className="pt-3 border-t space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Data dari CV:
                      </p>
                      <div className="space-y-2">
                        {userProfile.cvRole && (
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Role
                            </Label>
                            <p className="text-sm font-medium">
                              {userProfile.cvRole}
                            </p>
                          </div>
                        )}
                        {userProfile.cvLevel && (
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Level
                            </Label>
                            <p className="text-sm font-medium">
                              {userProfile.cvLevel}
                            </p>
                          </div>
                        )}
                        {userProfile.cvSkills &&
                          userProfile.cvSkills.length > 0 && (
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Skills
                              </Label>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {userProfile.cvSkills.map((skill, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleCVUpload}
                  className="hidden"
                />
                <Button
                  variant={userProfile?.cvFileName ? 'outline' : 'default'}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingCV}
                  className="w-full sm:w-auto"
                >
                  {isUploadingCV ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {userProfile?.cvFileName ? 'Upload CV Baru' : 'Upload CV'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Format: PDF • Max 5MB
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Additional Profile Info */}
      {userProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Onboarding</CardTitle>
            <CardDescription>
              Data yang dikumpulkan saat onboarding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Pengalaman</Label>
                <p className="font-medium">{userProfile.experience}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p className="font-medium">
                  {userProfile.isStudent ? 'Mahasiswa' : 'Profesional'}
                </p>
              </div>
              {userProfile.degree && (
                <div>
                  <Label className="text-muted-foreground">Jurusan</Label>
                  <p className="font-medium">{userProfile.degree}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
