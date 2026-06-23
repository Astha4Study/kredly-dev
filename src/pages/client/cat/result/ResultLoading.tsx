import * as React from 'react';
import { Loader2 } from 'lucide-react';

export default function ResultLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Menganalisis performa adaptif & mengompilasi feedback AI...
        </p>
      </div>
    </div>
  );
}
