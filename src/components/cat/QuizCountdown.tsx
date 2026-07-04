import * as React from 'react';
import { cn } from '@/lib/utils';

interface QuizCountdownProps {
  /** Total seconds for the exam. Must be > 0 to render. */
  totalSeconds: number;
  /** Called once when the timer reaches zero. */
  onTimeUp: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function QuizCountdown({ totalSeconds, onTimeUp }: QuizCountdownProps) {
  const [remaining, setRemaining] = React.useState(totalSeconds);
  const onTimeUpRef = React.useRef(onTimeUp);

  // Keep ref up to date without restarting the interval
  React.useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  React.useEffect(() => {
    if (totalSeconds <= 0) return;

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          // defer so state update finishes first
          setTimeout(() => onTimeUpRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
    // Only run once when component mounts with the initial totalSeconds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = remaining / totalSeconds; // 1 → 0
  const isWarning = pct <= 0.25 && pct > 0.1;
  const isDanger = pct <= 0.1;

  // SVG ring params
  const size = 36;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - pct);

  return (
    <div
      className={cn(
        'text-xs font-mono font-semibold tabular-nums select-none border-2 px-3 py-1',
        isDanger
          ? 'text-red-500'
          : isWarning
            ? 'text-amber-500'
            : 'text-muted-foreground',
      )}
      title={`Sisa waktu: ${formatTime(remaining)}`}
    >
      {/* time text */}
      <span
        className={cn(
          'transition-colors duration-500 text-lg',
          isDanger && 'animate-pulse',
        )}
      >
        {formatTime(remaining)}
      </span>
    </div>
  );
}
