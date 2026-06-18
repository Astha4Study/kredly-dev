import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim() && username.trim()) {
      onNext();
    }
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
            />
          </div>

          <div className="rounded-lg border border-dashed border-border px-3 py-3">
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
          disabled={!fullName.trim() || !username.trim()}
        >
          Simpan dan Lanjutkan
        </Button>
      </form>
    </>
  );
}
