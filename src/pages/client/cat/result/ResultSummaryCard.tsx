import * as React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ResultSummaryCardProps {
  feedback: string;
  verificationId: string;
  totalItems: number;
  durationSeconds: number;
}

export default function ResultSummaryCard({
  feedback,
  verificationId,
  totalItems,
  durationSeconds,
}: ResultSummaryCardProps) {
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0 detik';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds} detik`;
  };

  return (
    <Card className="border border-foreground/10 bg-card/40 backdrop-blur-md md:col-span-2 p-6 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-foreground/5 pb-3">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Ringkasan Evaluasi AI
          </h3>
          <span className="text-xs text-muted-foreground">
            Verification ID: #{verificationId.substring(0, 8)}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/80 font-normal">
          {feedback}
        </p>
      </div>

      {/* Verification & Metadata */}
      <div className="mt-6 pt-4 border-t border-foreground/5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-muted-foreground block">Jumlah Soal</span>
          <span className="font-semibold text-foreground text-sm">
            {totalItems} Soal
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">Durasi Ujian</span>
          <span className="font-semibold text-foreground text-sm">
            {formatDuration(durationSeconds)}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-muted-foreground block">Status Verifikasi</span>
          <span className="font-semibold text-emerald-400 text-sm flex items-center gap-1">
            <ShieldCheck className="size-3.5" /> Terverifikasi
          </span>
        </div>
      </div>
    </Card>
  );
}
