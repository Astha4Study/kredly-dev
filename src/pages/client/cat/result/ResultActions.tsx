import * as React from 'react';
import { Download, RefreshCw, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultActionsProps {
  onDownload: () => void;
  onNewTest: () => void;
  onHome: () => void;
}

export default function ResultActions({
  onDownload,
  onNewTest,
  onHome,
}: ResultActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
      <Button
        size="lg"
        onClick={onDownload}
        className="w-full sm:w-auto font-medium shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]"
      >
        <Download className="mr-2 size-4" /> Unduh Sertifikat
      </Button>

      <Button
        size="lg"
        variant="outline"
        onClick={onNewTest}
        className="w-full sm:w-auto border-foreground/10 hover:bg-foreground/5"
      >
        <RefreshCw className="mr-2 size-4" /> Tes Baru
      </Button>

      <Button
        size="lg"
        variant="ghost"
        onClick={onHome}
        className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
      >
        <Home className="mr-2 size-4" /> Beranda
      </Button>
    </div>
  );
}
