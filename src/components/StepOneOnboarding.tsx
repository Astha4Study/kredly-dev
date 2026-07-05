import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';

interface StepOneOnboardingProps {
  fullName: string;
  username: string;
  setFullName: (name: string) => void;
  setUsername: (username: string) => void;
  onNext: () => void;
}

export function StepOneOnboarding({
  fullName,
  username,
  setFullName,
  setUsername,
  onNext,
}: StepOneOnboardingProps) {
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');

  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/check-username?username=${encodeURIComponent(username)}`,
        );
        setUsernameStatus(res.status === 409 ? 'taken' : 'available');
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) return;

    if (usernameStatus === 'taken') {
      toast.error('Username sudah digunakan');
      return;
    }

    if (usernameStatus !== 'available') {
      const res = await fetch(
        `/api/check-username?username=${encodeURIComponent(username)}`,
      );
      if (res.status === 409) {
        setUsernameStatus('taken');
        toast.error('Username sudah digunakan');
        return;
      }
      setUsernameStatus('available');
    }

    onNext();
  };

  return (
    <>
      <div className="mt-6 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Lengkapi profil Anda
        </h1>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Informasi ini akan digunakan pada credential dan profil publik Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nama Lengkap</Label>

          <Input
            id="fullName"
            className="bg-white"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>

          <div className="relative">
            <Input
              id="username"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .replace(/[^a-z0-9._]/g, ''),
                )
              }
              placeholder="username"
              required
              className={
                usernameStatus === 'taken'
                  ? 'border-destructive pr-10'
                  : usernameStatus === 'available'
                    ? 'border-green-500 pr-10 bg-white'
                    : undefined
              }
            />
            {username.trim() && usernameStatus !== 'idle' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {usernameStatus === 'available' && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {usernameStatus === 'taken' && (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </span>
            )}
          </div>

          {usernameStatus === 'taken' && (
            <p className="text-xs text-destructive">Username sudah digunakan</p>
          )}

          <div className="rounded-lg border border-dashed border-border px-3 py-3 bg-white">
            <p className="text-xs text-muted-foreground">Public profile URL</p>

            <p className="mt-1 text-sm font-medium">
              kredly.com/@{username || 'username'}
            </p>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={
            !fullName.trim() ||
            !username.trim() ||
            usernameStatus === 'checking' ||
            usernameStatus === 'taken'
          }
        >
          Simpan dan Lanjutkan
        </Button>
      </form>
    </>
  );
}
