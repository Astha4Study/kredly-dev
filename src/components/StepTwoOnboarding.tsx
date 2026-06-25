import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { extractPDFImages } from '@/lib/pdfRenderer';
import { toast } from 'sonner';

interface StepTwoOnboardingProps {
  cvFile: File | null;
  setCvFile: (file: File | null) => void;
  setCvImages: (images: string[]) => void;
  onNext: () => void;
}

export function StepTwoOnboarding({
  cvFile,
  setCvFile,
  setCvImages,
  onNext,
}: StepTwoOnboardingProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setCvFile(file);

      // Extract images from PDF for vision processing
      setIsProcessing(true);
      try {
        const images = await extractPDFImages(file, { scale: 2, maxPages: 5 });
        setCvImages(images);
      } catch (error) {
        console.error('Failed to extract PDF images:', error);
        toast.error(
          'Gagal memproses PDF. Tetap akan mencoba membaca text dari CV.',
        );
        setCvImages([]);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cvFile) {
      onNext();
    }
  };

  return (
    <>
      <div className="mt-6 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Upload CV Anda
        </h1>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Upload CV Anda untuk melengkapi profil dan meningkatkan kredibilitas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cvFile">CV (PDF)</Label>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted p-8">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  {cvFile ? cvFile.name : 'Pilih file CV'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Format PDF, maksimal 5MB
                </p>
              </div>
            </div>

            <Input
              id="cvFile"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!cvFile || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses PDF...
            </>
          ) : (
            'Simpan dan Lanjutkan'
          )}
        </Button>
      </form>
    </>
  );
}
