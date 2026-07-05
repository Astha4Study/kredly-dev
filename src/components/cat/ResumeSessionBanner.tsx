import * as React from 'react';

interface ResumeSessionBannerProps {
  questionsAnswered: number;
  expiresAt: string; // ISO timestamp
}

function getTimeLeftLabel(expiresAt: string): string {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return 'hampir habis';
  const totalMinutes = Math.floor(diffMs / 60_000);
  if (totalMinutes >= 60) {
    return `${Math.floor(totalMinutes / 60)} jam lagi`;
  }
  return `${totalMinutes} menit lagi`;
}

export default function ResumeSessionBanner({
  questionsAnswered,
  expiresAt,
}: ResumeSessionBannerProps) {
  const [timeLeftLabel, setTimeLeftLabel] = React.useState(() =>
    getTimeLeftLabel(expiresAt),
  );
  const [visible, setVisible] = React.useState(true);
  const [progress, setProgress] = React.useState(100);

  // Refresh label every minute so it stays accurate
  React.useEffect(() => {
    const id = setInterval(() => {
      setTimeLeftLabel(getTimeLeftLabel(expiresAt));
    }, 60_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  // Handle auto-fade and progress indicator
  React.useEffect(() => {
    const duration = 10000; // 4 seconds
    const intervalTime = 16; // ~60fps for smooth transition
    const totalSteps = duration / intervalTime;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const currentProgress = Math.max(0, 100 - (step / totalSteps) * 100);
      setProgress(currentProgress);

      if (step >= totalSteps) {
        clearInterval(timer);
        setVisible(false);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative overflow-hidden flex flex-col gap-1 rounded-lg bg-white border-2  px-4 py-3 text-sm xs transition-opacity duration-300"
    >
      {/* Dynamic progress bar at the top acting as the border-t */}
      <div
        className="absolute top-0 left-0 h-[3px] bg-primary transition-all duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground leading-snug">
          Sesi berhasil dipulihkan
        </p>
      </div>
    </div>
  );
}
