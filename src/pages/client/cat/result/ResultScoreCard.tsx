import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ResultScoreCardProps {
  displayedScore: number;
  level: string;
}

export default function ResultScoreCard({
  displayedScore,
  level,
}: ResultScoreCardProps) {
  // Level Styling Mapping
  const getLevelBadgeStyles = (levelStr: string) => {
    const l = levelStr.toLowerCase();
    if (l.includes('expert')) {
      return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
    }
    if (l.includes('advanced') || l.includes('senior')) {
      return 'bg-primary/10 border-primary/30 text-primary-400';
    }
    if (l.includes('intermediate') || l.includes('mid')) {
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    }
    return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  };

  // Circular progress calculations
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (Math.min(displayedScore, 1000) / 1000) * circumference;

  return (
    <Card className="border border-foreground/10 bg-card/40 backdrop-blur-md flex flex-col justify-center items-center p-6 text-center">
      <div className="relative size-36 flex items-center justify-center">
        <svg className="size-full -rotate-90">
          {/* Background Ring */}
          <circle
            className="text-foreground/5"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx={radius + stroke}
            cy={radius + stroke}
          />
          {/* Active Colored Ring */}
          <circle
            className="text-primary transition-all duration-300 ease-out"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx={radius + stroke}
            cy={radius + stroke}
          />
        </svg>
        {/* Centered Score */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight tabular-nums">
            {displayedScore}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
            Skor IRT
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              'px-2.5 py-0.5 text-xs font-semibold',
              getLevelBadgeStyles(level),
            )}
          >
            {level}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
