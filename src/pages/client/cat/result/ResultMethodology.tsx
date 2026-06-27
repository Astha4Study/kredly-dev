import * as React from 'react';
import { HelpCircle, Check, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ResultMethodologyProps {
  verificationId: string;
  onCopy: () => void;
  copied: boolean;
}

export default function ResultMethodology({
  verificationId,
  onCopy,
  copied,
}: ResultMethodologyProps) {
  return (
    <Card className="border border-foreground/5 bg-foreground/[0.01] p-4 text-xs text-muted-foreground flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex gap-3">
        <HelpCircle className="size-5 shrink-0 text-muted-foreground/60 mt-0.5 md:mt-0" />
        <p className="leading-relaxed">
          <strong>Info Metodologi:</strong> Penilaian kredensial Kredly diproses
          menggunakan model matematika{' '}
          <strong>Item Response Theory (IRT) Rasch 1PL</strong>. Level kesulitan
          soal disesuaikan secara real-time berdasarkan probabilitas respon
          jawaban Anda untuk mengukur kemampuan laten (
          <span className="font-mono">&theta;</span>) secara akurat.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 border border-foreground/10 px-2 py-1 rounded bg-background/50">
        <span className="font-mono font-medium tracking-tight">
          ID: {verificationId.substring(0, 16)}...
        </span>
        <button
          onClick={onCopy}
          className="text-foreground hover:text-primary transition-colors cursor-pointer"
          title="Salin ID Verifikasi"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-400" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>
    </Card>
  );
}
