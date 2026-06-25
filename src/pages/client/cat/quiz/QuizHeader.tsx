import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Timer from '@/components/cat/Timer';
import type { QuizItem } from './types';

interface QuizHeaderProps {
  onBack: () => void;
  currentItem: QuizItem | null;
  showResult: boolean;
  isLoading: boolean;
  handleTimeUp: () => void;
  timerKey: number;
}

export default function QuizHeader({
  onBack,
  currentItem,
  showResult,
  isLoading,
  handleTimeUp,
  timerKey,
}: QuizHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="mr-2 size-4" /> Kembali
      </Button>
    </div>
  );
}
