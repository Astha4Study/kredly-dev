import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerProps {
  duration: number; // in seconds
  isActive: boolean;
  onTimeUp: () => void;
  resetKey: number;
}

export default function Timer({
  duration,
  isActive,
  onTimeUp,
  resetKey,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = React.useState(duration);

  // Reset timer on key change or duration change
  React.useEffect(() => {
    setTimeLeft(duration);
  }, [resetKey, duration]);

  React.useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Trigger time up callback asynchronously to prevent state updates during rendering
          setTimeout(() => {
            onTimeUp();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeUp]);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine colors based on time remaining
  let colorClass = 'text-foreground/80 border-foreground/10 bg-background/30';
  if (timeLeft < 10) {
    colorClass =
      'text-rose-400 border-rose-500/20 bg-rose-500/10 animate-pulse';
  } else if (timeLeft < 30) {
    colorClass = 'text-amber-400 border-amber-500/20 bg-amber-500/10';
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 border px-3 py-1.5 rounded-xl font-mono text-sm transition-all duration-300',
        colorClass,
      )}
    >
      <Clock className="size-4" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
}
