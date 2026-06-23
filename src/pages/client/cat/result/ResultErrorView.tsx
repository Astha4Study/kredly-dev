import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ResultErrorViewProps {
  error: string;
  onRetry: () => void;
}

export default function ResultErrorView({
  error,
  onRetry,
}: ResultErrorViewProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6">
      <Card className="max-w-md w-full border-rose-500/20 bg-rose-500/5 backdrop-blur-md">
        <CardContent className="p-6 text-center space-y-6">
          <div className="flex justify-center">
            <AlertTriangle className="size-12 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-rose-400">
              Gagal Memuat Hasil
            </h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button
            onClick={onRetry}
            variant="outline"
            className="w-full border-rose-500/30 hover:bg-rose-500/10"
          >
            Ulangi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
