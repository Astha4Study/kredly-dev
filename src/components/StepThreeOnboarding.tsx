import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StepThreeOnboardingProps {
  experience: string;
  isStudent: boolean | null;
  degree: string;
  setExperience: (experience: string) => void;
  setIsStudent: (isStudent: boolean) => void;
  setDegree: (degree: string) => void;
  onSubmit: () => void;
  isValid: boolean;
}

export function StepThreeOnboarding({
  experience,
  isStudent,
  degree,
  setExperience,
  setIsStudent,
  setDegree,
  onSubmit,
  isValid,
}: StepThreeOnboardingProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <>
      <div className="mt-6 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Informasi Pengalaman
        </h1>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Bantu kami memahami latar belakang dan pengalaman Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div className="space-y-2">
          <Label>Berapa lama pengalaman kerja Anda?</Label>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={experience === 'below-1' ? 'default' : 'outline'}
              className="h-auto py-4"
              onClick={() => setExperience('below-1')}
            >
              Di bawah 1 tahun
            </Button>
            <Button
              type="button"
              variant={experience === '1-2' ? 'default' : 'outline'}
              className="h-auto py-4"
              onClick={() => setExperience('1-2')}
            >
              1-2 tahun
            </Button>
            <Button
              type="button"
              variant={experience === '3-5' ? 'default' : 'outline'}
              className="h-auto py-4"
              onClick={() => setExperience('3-5')}
            >
              3-5 tahun
            </Button>
            <Button
              type="button"
              variant={experience === 'not-working' ? 'default' : 'outline'}
              className="h-auto py-4"
              onClick={() => setExperience('not-working')}
            >
              Belum bekerja
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Apakah Anda seorang student?</Label>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={isStudent === true ? 'default' : 'outline'}
              className="h-auto py-4"
              onClick={() => setIsStudent(true)}
            >
              Ya
            </Button>
            <Button
              type="button"
              variant={isStudent === false ? 'default' : 'outline'}
              className="h-auto py-4"
              onClick={() => setIsStudent(false)}
            >
              Tidak
            </Button>
          </div>
        </div>

        {isStudent === true && (
          <div className="space-y-2">
            <Label htmlFor="degree">Jurusan / Degree</Label>

            <Input
              id="degree"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="Contoh: Teknik Informatika"
              required
            />
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={!isValid}>
          Selesai
        </Button>
      </form>
    </>
  );
}
