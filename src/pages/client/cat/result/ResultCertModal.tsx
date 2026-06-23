import * as React from 'react';
import { Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface ResultCertModalProps {
  show: boolean;
  onClose: () => void;
  role: string;
  level: string;
  score: number;
  verificationId: string;
}

export default function ResultCertModal({
  show,
  onClose,
  role,
  level,
  score,
  verificationId,
}: ResultCertModalProps) {
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
              <Award className="size-12 mx-auto text-primary animate-bounce" />
              <h3 className="text-xl font-bold">
                Kredensial Digital Tersimpan!
              </h3>
              <p className="text-sm text-muted-foreground">
                Sertifikat digital Anda telah berhasil diunduh sebagai metadata
                kredensial.
              </p>
            </div>

            {/* Certificate Mockup Frame */}
            <div className="border border-primary/20 bg-primary/[0.02] rounded-xl p-6 relative overflow-hidden space-y-6 text-center">
              <div className="absolute top-0 right-0 size-24 bg-primary/5 rounded-full blur-2xl" />
              <div className="border-b border-primary/10 pb-3">
                <span className="text-[10px] tracking-widest uppercase font-bold text-primary">
                  Kredly Verified Professional
                </span>
                <h4 className="text-lg font-bold mt-1">{role}</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left text-xs">
                <div>
                  <span className="text-muted-foreground block">Kemampuan</span>
                  <span className="font-semibold text-foreground">{level}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">
                    Skor Kompetensi
                  </span>
                  <span className="font-semibold text-primary">
                    {score} / 1000
                  </span>
                </div>
              </div>
              <div className="border-t border-primary/10 pt-3 flex justify-between items-center text-[10px] text-muted-foreground">
                <span>ID: {verificationId}</span>
                <span className="text-emerald-400 font-semibold uppercase">
                  Status: Valid
                </span>
              </div>
            </div>

            <Button onClick={onClose} className="w-full">
              Selesai
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
