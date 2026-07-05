import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getFriendlyErrorMessage } from '@/lib/utils';

interface QuizErrorViewProps {
  error: string;
  onRetry: () => void;
  retryAttempt?: number;
  autoRetrying?: boolean;
}

export default function QuizErrorView({ error, onRetry, retryAttempt = 0, autoRetrying = false }: QuizErrorViewProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6">
      <Card className="max-w-md w-full border-rose-500/20 bg-rose-500/5 backdrop-blur-md">
        <CardContent className="p-6 text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="size-12 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-rose-400">
              Terjadi Kesalahan
            </h3>
            <p className="text-sm text-muted-foreground">
              {getFriendlyErrorMessage(error)}
            </p>
            {retryAttempt > 0 && !autoRetrying && (
              <p className="text-xs text-muted-foreground mt-2">
                Percobaan ke-{retryAttempt} gagal
              </p>
            )}
            {autoRetrying && (
              <p className="text-xs text-primary mt-2 animate-pulse">
                Mencoba menghubungkan kembali...
              </p>
            )}
          </div>
          <Button
            onClick={onRetry}
            variant="outline"
            className="w-full border-rose-500/30 hover:bg-rose-500/10"
            disabled={autoRetrying}
          >
            {autoRetrying ? 'Menghubungkan...' : 'Coba Lagi'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
