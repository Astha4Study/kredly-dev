import * as React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultActionsProps {
  onDownload?: () => void;
  onNewTest: () => void;
  onHome: () => void;
  showDownload?: boolean;
}

export default function ResultActions({
  onDownload,
  onNewTest,
  onHome,
  showDownload = true,
}: ResultActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
      {showDownload && onDownload && (
        <Button
          size="lg"
          onClick={onDownload}
          className="w-full sm:w-auto font-medium shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]"
        >
          <Download className="mr-2 size-4" /> Unduh Sertifikat
        </Button>
      )}

    </div>
  );
}
