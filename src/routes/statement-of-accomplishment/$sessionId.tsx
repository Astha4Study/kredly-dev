import { createFileRoute, useParams } from '@tanstack/react-router';
import * as React from 'react';
import { jsPDF } from 'jspdf';
import { sessionService } from '@/services/sessionService';
import type { ResultResponse } from '@/pages/client/cat/types';
import certificationTemplate from '@/assets/certification/certification-template.png';
import { Button } from '@/components/ui/button';
import { Award, Download, ArrowLeft, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/statement-of-accomplishment/$sessionId')(
  {
    component: StatementOfAccomplishment,
  },
);

function StatementOfAccomplishment() {
  const params = useParams({ strict: false });
  const sessionId = (params as any).sessionId || '';

  const [result, setResult] = React.useState<ResultResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);

  React.useEffect(() => {
    // Detect mobile device
    const mobileCheck =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    setIsMobile(mobileCheck);
  }, []);

  React.useEffect(() => {
    if (!sessionId) {
      setError('ID Sesi tidak ditemukan.');
      setIsLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const data = await sessionService.getResult(sessionId);
        setResult(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Gagal mengambil data sertifikat.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  const generatePDF = React.useCallback(async (res: ResultResponse) => {
    setGenerating(true);
    const img = new Image();
    img.src = certificationTemplate;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const leftMargin = 127;
        const startY = 380;

        // Name (Candidate Name from backend, fallback to generic name)
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 90px Arial';
        ctx.fillText(
          res.candidate_name || 'Pengguna Kredly',
          leftMargin,
          startY + 70,
        );

        // Assessment Name
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 90px Arial';
        ctx.fillText(res.role, leftMargin, startY + 310);

        // Level
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 90px Arial';
        ctx.fillText(res.level, leftMargin, startY + 530);

        // Score
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 80px Arial';
        ctx.fillText(`${res.score}/1000`, leftMargin, startY + 770);

        // Total Questions and Duration
        ctx.font = '38px Arial';
        ctx.fillStyle = '#000957';

        const y = startY + 880;

        const questionsText = `${res.total_items} Soal`;
        ctx.fillText(questionsText, leftMargin, y);

        const qWidth = ctx.measureText(questionsText).width;

        const dot1 = ' · ';
        ctx.fillText(dot1, leftMargin + qWidth, y);

        const dot1Width = ctx.measureText(dot1).width;

        const durationMinutes = Math.ceil((res.duration_seconds || 0) / 60);
        const durationText = `${durationMinutes} Menit`;
        ctx.fillText(durationText, leftMargin + qWidth + dot1Width, y);

        const dWidth = ctx.measureText(durationText).width;

        const dot2 = ' · ';
        ctx.fillText(dot2, leftMargin + qWidth + dot1Width + dWidth, y);

        const dot2Width = ctx.measureText(dot2).width;

        ctx.fillText(
          'Computerized Adaptive Testing',
          leftMargin + qWidth + dot1Width + dWidth + dot2Width,
          y,
        );

        const qrSize = 250;
        const modules = 25;
        const moduleSize = qrSize / modules;

        const qrX = canvas.width - qrSize - 175;
        const qrY = 530;

        // Background putih QR
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);

        // Draw QR Code
        ctx.fillStyle = '#000000';

        const getHashCharValue = (str: string, index: number) => {
          if (!str) return 0;
          const code = str.charCodeAt(index % str.length);
          return code;
        };

        for (let row = 0; row < modules; row++) {
          for (let col = 0; col < modules; col++) {
            const seed =
              row * 31 + col + getHashCharValue(res.verification_id, row + col);
            const pseudoRandom = (Math.sin(seed) + 1) / 2;
            if (pseudoRandom > 0.5) {
              ctx.fillRect(
                qrX + col * moduleSize,
                qrY + row * moduleSize,
                moduleSize,
                moduleSize,
              );
            }
          }
        }

        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(res.verification_id, qrX + qrSize / 2, qrY + qrSize + 20);

        // Convert canvas to PDF using jsPDF
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });

        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          0,
          canvas.width,
          canvas.height,
        );

        const pdfBlob = pdf.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);

        // If mobile, auto-download the PDF
        const isMobileDevice =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
          );
        if (isMobileDevice) {
          const link = document.createElement('a');
          link.href = url;
          link.download = `Kredly_Statement_of_Accomplishment_${res.verification_id}.pdf`;
          link.click();
        }
      } catch (err) {
        console.error('Failed to generate PDF:', err);
      } finally {
        setGenerating(false);
      }
    };
  }, []);

  React.useEffect(() => {
    if (result) {
      generatePDF(result);
    }
  }, [result, generatePDF]);

  const handleDownload = () => {
    if (!pdfUrl || !result) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Kredly_Statement_of_Accomplishment_${result.verification_id}.pdf`;
    link.click();
  };

  if (isLoading || generating) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse text-sm">
          Menyiapkan Dokumen Sertifikat Kredensial...
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 text-center">
        <Award className="h-16 w-16 text-destructive/80 mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Gagal Memuat</h1>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          {error ||
            'Dokumen sertifikat tidak dapat ditemukan atau tidak valid.'}
        </p>
        <Button onClick={() => window.history.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full border border-foreground/5 space-y-6">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Award className="h-9 w-9" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Sertifikat Siap!
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Unduhan sertifikat Anda harusnya telah dimulai secara otomatis.
            </p>
          </div>
          <div className="pt-2 space-y-3">
            <Button
              onClick={handleDownload}
              className="w-full gap-2 py-6 text-sm font-semibold rounded-xl"
            >
              <Download className="h-4 w-4" />
              Unduh Ulang PDF
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full py-6 text-sm font-semibold rounded-xl"
            >
              Kembali ke Hasil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout (full-screen PDF viewer)
  return (
    <div className="w-screen h-screen bg-[#525659] overflow-hidden flex flex-col">
      {pdfUrl ? (
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
          className="w-full h-full border-none"
          title="Kredly Statement of Accomplishment"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-white">
          Gagal menampilkan pratinjau sertifikat.
        </div>
      )}
    </div>
  );
}
