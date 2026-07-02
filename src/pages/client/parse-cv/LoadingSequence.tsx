import { Loader2 } from 'lucide-react';
import type { UseCVParserReturn } from './useCVParser';

type LoadingSequenceProps = Pick<UseCVParserReturn, 'parseStep'>;

export default function LoadingSequence({ parseStep }: LoadingSequenceProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
      <div className="h-8 relative overflow-hidden flex items-center justify-center w-full">
        <p
          key={parseStep}
          className="text-lg font-medium text-foreground absolute animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          {parseStep}
        </p>
      </div>
      <p className="text-xs text-muted-foreground mt-4 max-w-sm text-center">
        Proses ini membutuhkan waktu beberapa detik tergantung pada ukuran CV
        Anda.
      </p>
    </div>
  );
}
