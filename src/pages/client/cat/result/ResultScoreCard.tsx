import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth';
import ResultActions from './ResultActions';

interface ResultScoreCardProps {
  displayedScore: number;
  level: string;
  feedback: string;
  verificationId: string;
  totalItems: number;
  durationSeconds: number;
  role: string;
  onDownload: () => void;
  onNewTest: () => void;
  onHome: () => void;
}

export default function ResultScoreCard({
  displayedScore,
  level,
  durationSeconds,
  onDownload,
  onNewTest,
  onHome,
}: ResultScoreCardProps) {
  const { user } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getScoreFeedback = (score: number) => {
    if (score >= 850) {
      return 'Luar biasa! Keahlian Anda sangat menonjol di industri ini.';
    }
    if (score >= 700) {
      return 'Wow menakjubkan! Teruskan fokus Anda untuk terhubung dengan klien baru.';
    }
    if (score >= 500) {
      return 'Kerja bagus! Kompetensi Anda sudah cukup matang, tingkatkan terus.';
    }
    return 'Tetap semangat! Pelajari rekomendasi AI di bawah untuk meningkatkan kemampuan Anda.';
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0 detik';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds} detik`;
  };



  // Circular progress calculations for 280-degree arc
  const radius = 84;
  const strokeWidth = 7;
  const circumference = radius * 2 * Math.PI; // ~527.78
  const trackLength = circumference * (280 / 360); // ~410.49

  // Percentage value (clamp between 0 and 1000)
  const scorePercent = Math.min(Math.max(displayedScore, 0), 1000);
  const activeLength = (scorePercent / 1000) * trackLength;

  return (
    <Card className="border border-foreground/10 bg-card/40 backdrop-blur-md p-6 md:p-8 rounded-3xl flex flex-col md:col-span-3">
      <div className="flex flex-col-reverse md:flex-row items-center justify-between ">
        {/* Left Side: Score, Tier description, and Feedback */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <div>
            <h3 className="text-lg md:text-xl font-medium text-muted-foreground leading-normal select-none">
              Skor yang berhasil kamu raih:
            </h3>
            <div className="flex items-baseline justify-center md:justify-start">
              <span className="text-4xl md:text-7xl font-bold tracking-tight text-foreground select-none">
                {displayedScore}
              </span>
              <span className="text-xl text-muted-foreground ml-2 font-normal select-none">
                pts
              </span>
            </div>
            <p className="text-sm md:text-base text-muted-foreground mt-3 leading-relaxed max-w-xl font-normal select-none">
              {getScoreFeedback(displayedScore)}
            </p>
          </div>

          <div className="pt-2 w-full flex justify-center md:justify-start">
            <ResultActions
              onDownload={onDownload}
              onNewTest={onNewTest}
              onHome={onHome}
            />
          </div>
        </div>

        {/* Right Side: Floating Profile Image with Gradient Ring */}
        <div className="relative size-52 flex items-center justify-center select-none">
          <svg className="size-full">
            <defs>
              <linearGradient
                id="ringGradient"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#f59e0b" /> {/* amber/gold */}
                <stop offset="100%" stopColor="#fdc700" /> {/* primary gold */}
              </linearGradient>
            </defs>

            {/* Background Grey Track */}
            <circle
              className="text-foreground/5 dark:text-foreground/10"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="104"
              cy="104"
              strokeDasharray={`${trackLength} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(130 104 104)"
            />

            {/* Active Colored Ring */}
            <circle
              stroke="url(#ringGradient)"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx="104"
              cy="104"
              strokeDasharray={`${activeLength} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(130 104 104)"
              className="transition-all duration-300 ease-out"
            />
          </svg>

          {/* Centered Avatar Image */}
          <div className="absolute size-[136px] rounded-full overflow-hidden flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 shadow-inner">
            <Avatar className="size-full">
              {user?.image ? (
                <AvatarImage
                  src={user.image}
                  alt={user.name || 'User'}
                  className="object-cover size-full"
                />
              ) : null}
              <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800 text-3xl font-bold text-neutral-600 dark:text-neutral-300">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="w-full border-t border-foreground/10 " />

      {/* Metadata Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-sm w-full select-none">
        <div>
          <span className="text-muted-foreground text-xs block mb-0.5">
            Durasi Ujian
          </span>
          <span className="font-semibold text-foreground text-sm">
            {formatDuration(durationSeconds)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground text-xs block mb-0.5">
            Tingkat Kesulitan
          </span>
          <span className="font-semibold text-foreground text-sm capitalize">
            {level}
          </span>
        </div>
      </div>
    </Card>
  );
}
