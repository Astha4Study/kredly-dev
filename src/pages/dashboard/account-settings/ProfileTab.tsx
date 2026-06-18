import { useAuth } from '@/contexts';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

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

interface ProfileTabProps {
  userProfile: UserProfile | null;
}

export default function ProfileTab({ userProfile }: ProfileTabProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    username: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    toast.success('Profil berhasil diperbarui');
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
          Kelola informasi profil dan foto Anda
        </p>
      </div>

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
              <Button variant="outline" size="sm">
                Upload Foto
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG atau GIF. Max 2MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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

          <Button onClick={handleSaveProfile}>Simpan Perubahan</Button>
        </CardContent>
      </Card>

      {userProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Tambahan</CardTitle>
            <CardDescription>
              Data yang dikumpulkan saat onboarding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label className="text-muted-foreground">CV</Label>
                <p className="font-medium">{userProfile.cvFileName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
