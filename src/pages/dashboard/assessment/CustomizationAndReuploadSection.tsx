import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Plus, Upload, Loader2, Coins } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CustomizationAndReuploadSectionProps {
  roleAssessmentCompleted: boolean;
  onRefresh?: () => void;
}

export const CustomizationAndReuploadSection = ({
  roleAssessmentCompleted,
  onRefresh,
}: CustomizationAndReuploadSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<{ current: number } | null>(
    null,
  );
  const navigate = useNavigate();

  const fetchTokenBalance = async () => {
    try {
      const response = await fetch('/api/user/me/token-balance', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTokenBalance(data);
      }
    } catch (error) {
      console.error('Failed to fetch token balance:', error);
    }
  };

  useEffect(() => {
    fetchTokenBalance();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) {
      toast.error('Nama skill tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/profile/custom-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skillName: trimmed }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal membuat asesmen kustom');
      }

      toast.success('Asesmen kustom berhasil ditambahkan');
      setSkillInput('');
      setIsDialogOpen(false);
      fetchTokenBalance();
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between pb-3 border-b">
        <div>
          <h3 className="text-lg font-bold">Kustomisasi & Pembaruan Asesmen</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tambahkan asesmen mandiri atau perbarui profil kompetensi Anda
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Custom Assessment Card */}
        <Card
          className={`relative overflow-hidden border transition-all duration-300 flex flex-col justify-between ${!roleAssessmentCompleted ? 'opacity-65 bg-muted/10' : 'hover:shadow-md'}`}
        >
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Plus className="h-5 w-5" />
              </div>
              <div className="flex gap-1.5 items-center">
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 py-0.5 px-2 font-sans"
                >
                  <Coins className="h-3 w-3" /> 1 Kredit
                </Badge>
                {!roleAssessmentCompleted && (
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 py-0.5 px-2"
                  >
                    <Lock className="h-3 w-3" /> Terkunci
                  </Badge>
                )}
              </div>
            </div>
            <CardTitle className="text-lg font-bold mt-2">
              Tambah Asesmen Kustom
            </CardTitle>
            <CardDescription>
              Pilih secara spesifik skill yang ingin Anda uji secara mandiri di
              luar hasil ekstraksi CV Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              className="w-full gap-2 text-xs font-semibold cursor-pointer"
              disabled={!roleAssessmentCompleted}
              variant={
                !roleAssessmentCompleted
                  ? 'secondary'
                  : tokenBalance && tokenBalance.current < 1
                    ? 'outline'
                    : 'default'
              }
              onClick={() => {
                if (tokenBalance && tokenBalance.current < 1) {
                  toast.warning(
                    'Kredit tidak cukup (butuh 1 kredit). Mengalihkan ke halaman Top Up...',
                  );
                  navigate({ to: '/app/pricing' });
                } else {
                  setIsDialogOpen(true);
                }
              }}
            >
              {!roleAssessmentCompleted ? (
                <Lock className="h-3.5 w-3.5" />
              ) : tokenBalance && tokenBalance.current < 1 ? (
                <Coins className="h-3.5 w-3.5" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {!roleAssessmentCompleted
                ? 'Selesaikan Asesmen Role-based'
                : tokenBalance && tokenBalance.current < 1
                  ? 'Top Up Kredit (Kurang Kredit)'
                  : 'Pilih Skill Baru'}
            </Button>
          </CardContent>
        </Card>

        {/* Re-upload CV Card */}
        <Card
          className={`relative overflow-hidden border transition-all duration-300 flex flex-col justify-between ${!roleAssessmentCompleted ? 'opacity-65 bg-muted/10' : 'hover:shadow-md'}`}
        >
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <div className="flex gap-1.5 items-center">
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 py-0.5 px-2 font-sans"
                >
                  <Coins className="h-3 w-3" /> 3 Kredit
                </Badge>
                {!roleAssessmentCompleted && (
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 py-0.5 px-2"
                  >
                    <Lock className="h-3 w-3" /> Terkunci
                  </Badge>
                )}
              </div>
            </div>
            <CardTitle className="text-lg font-bold mt-2">
              Upload Ulang CV
            </CardTitle>
            <CardDescription>
              Ingin memperbarui rekomendasi asesmen? Upload CV terbaru Anda
              untuk mengekstrak ulang daftar skill dan role Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              to={
                tokenBalance && tokenBalance.current < 3
                  ? '/app/pricing'
                  : '/app/new-assessment/upload-cv'
              }
              disabled={!roleAssessmentCompleted}
              className="w-full block"
              onClick={() => {
                if (!roleAssessmentCompleted) return;
                if (tokenBalance && tokenBalance.current < 3) {
                  toast.warning(
                    'Kredit tidak cukup untuk upload ulang (butuh 3 kredit). Mengalihkan ke halaman Top Up...',
                  );
                }
              }}
            >
              <Button
                className="w-full gap-2 text-xs font-semibold cursor-pointer"
                disabled={!roleAssessmentCompleted}
                variant={
                  !roleAssessmentCompleted
                    ? 'secondary'
                    : tokenBalance && tokenBalance.current < 3
                      ? 'outline'
                      : 'default'
                }
              >
                {!roleAssessmentCompleted ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : tokenBalance && tokenBalance.current < 3 ? (
                  <Coins className="h-3.5 w-3.5" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {!roleAssessmentCompleted
                  ? 'Selesaikan Asesmen Role-based'
                  : tokenBalance && tokenBalance.current < 3
                    ? 'Top Up Kredit (Kurang Kredit)'
                    : 'Upload CV Baru'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Custom Assessment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Tambah Asesmen Kustom</DialogTitle>
              <DialogDescription>
                Masukkan nama skill atau teknologi (misal: React, Go, Docker,
                dll.) untuk membuat asesmen baru.
                <span className="block mt-2 text-xs font-semibold text-primary">
                  Biaya: 1 Kredit
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Nama Skill (contoh: PostgreSQL)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                disabled={isSubmitting}
                className="w-full font-sans"
                autoFocus
              />
            </div>
            <DialogFooter className="flex sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Buat Asesmen'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
