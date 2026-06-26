import * as React from 'react';
import { Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import certificationTemplate from '@/assets/certification/certification-template.png';

interface ResultCertModalProps {
  show: boolean;
  onClose: () => void;
  userName: string;
  role: string;
  level: string;
  score: number;
  verificationId: string;
  totalItems: number;
  durationSeconds: number;
  onReady?: (url: string) => void;
  sessionId?: string;
}

export default function ResultCertModal({
  show,
  onClose,
  userName,
  role,
  level,
  score,
  verificationId,
  totalItems,
  durationSeconds,
  onReady,
  sessionId,
}: ResultCertModalProps) {
  const [certImageUrl, setCertImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
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

        // Name
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 90px Arial';
        ctx.fillText(userName, leftMargin, startY + 70);

        // Assessment Name
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 90px Arial';
        ctx.fillText(role, leftMargin, startY + 310);

        // Level
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 90px Arial';
        ctx.fillText(level, leftMargin, startY + 530);

        // Score
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 80px Arial';
        ctx.fillText(`${score}/1000`, leftMargin, startY + 770);

        // Total Questions and Duration
        ctx.font = '38px Arial';
        ctx.fillStyle = '#000957';

        const y = startY + 880;

        const questionsText = `${totalItems} Soal`;
        ctx.fillText(questionsText, leftMargin, y);

        const qWidth = ctx.measureText(questionsText).width;

        const dot1 = ' · ';
        ctx.fillText(dot1, leftMargin + qWidth, y);

        const dot1Width = ctx.measureText(dot1).width;

        const durationMinutes = Math.ceil((durationSeconds || 0) / 60);
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
              row * 31 + col + getHashCharValue(verificationId, row + col);
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
        ctx.fillText(verificationId, qrX + qrSize / 2, qrY + qrSize + 20);

        const url = canvas.toDataURL('image/png');
        setCertImageUrl(url);
        if (onReady) {
          onReady(url);
        }
      } catch (err) {
        console.error('Failed to generate preview certificate:', err);
      }
    };
  }, [
    userName,
    role,
    level,
    score,
    verificationId,
    totalItems,
    durationSeconds,
    onReady,
  ]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-xl border border-foreground/10 bg-card rounded-2xl p-6 shadow-2xl space-y-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">
                Selamat, Sertifikat Anda Sudah Siap!
              </h3>
              <p className="text-sm text-muted-foreground">
                Pencapaian Anda berhasil dicatat. Sertifikat digital ini telah diamankan dan siap untuk Anda bagikan atau unduh.
              </p>
            </div>

            {/* Certificate Preview Image */}
            <div className="flex justify-center">
              {certImageUrl ? (
                <img
                  src={certImageUrl}
                  alt="Pratinjau Sertifikat Kredly"
                  className="w-full max-w-lg h-auto rounded-xl border border-primary/20 shadow-lg object-contain"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center border border-dashed border-muted-foreground/30 rounded-xl bg-muted/5">
                  <span className="text-sm text-muted-foreground">
                    Memuat pratinjau sertifikat...
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {sessionId && (
                <Button
                  onClick={() => {
                    window.open(
                      `/statement-of-accomplishment/${sessionId}`,
                      '_blank',
                    );
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Unduh PDF
                </Button>
              )}
              <Button
                onClick={onClose}
                className={sessionId ? 'flex-1' : 'w-full'}
              >
                Selesai
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
