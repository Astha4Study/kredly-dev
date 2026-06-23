import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentQuestion: number;
  maxQuestions: number;
  minQuestions: number;
}

export default function ProgressBar({
  currentQuestion,
  maxQuestions,
  minQuestions,
}: ProgressBarProps) {
  // Progress up to current question (not including current, as it's not answered yet)
  const percentage = Math.min(
    ((currentQuestion - 1) / maxQuestions) * 100,
    100,
  );

  // Minimum required percentage marker
  const minRequiredPercentage = (minQuestions / maxQuestions) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
        <span>
          Soal <strong className="text-foreground">{currentQuestion}</strong>{' '}
          dari <span className="text-foreground">~{maxQuestions}</span>
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-foreground/5 border border-foreground/5">
        {/* Progress Fill */}
        <div
          style={{ width: `${percentage}%` }}
          className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500 ease-out"
        />

        {/* Min Questions Target Threshold Marker Line */}
        <div
          style={{ left: `${minRequiredPercentage}%` }}
          className={cn(
            'absolute top-0 bottom-0 w-[2px] transition-colors',
            currentQuestion > minQuestions
              ? 'bg-emerald-500/50'
              : 'bg-primary/30',
          )}
          title={`Minimum required questions: ${minQuestions}`}
        />
      </div>
    </div>
  );
}
