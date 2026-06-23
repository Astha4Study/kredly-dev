import * as React from 'react';
import { CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ResultInsightsProps {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export default function ResultInsights({
  strengths,
  weaknesses,
  recommendations,
}: ResultInsightsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Strengths Card */}
      <Card className="border border-emerald-500/10 bg-emerald-500/[0.02] backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-emerald-500/5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-400">
            <CheckCircle className="size-4" /> Kekuatan (Strengths)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-3">
            {strengths.map((item, idx) => (
              <li
                key={idx}
                className="text-xs md:text-sm flex items-start gap-2 text-foreground/80"
              >
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Weaknesses Card */}
      <Card className="border border-rose-500/10 bg-rose-500/[0.02] backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-rose-500/5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-400">
            <AlertTriangle className="size-4" /> Perlu Ditingkatkan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-3">
            {weaknesses.map((item, idx) => (
              <li
                key={idx}
                className="text-xs md:text-sm flex items-start gap-2 text-foreground/80"
              >
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">
                  !
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendations Card */}
      <Card className="border border-amber-500/10 bg-amber-500/[0.02] backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-amber-500/5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-400">
            <Lightbulb className="size-4" /> Rekomendasi Karir & Belajar
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-3">
            {recommendations.map((item, idx) => (
              <li
                key={idx}
                className="text-xs md:text-sm flex items-start gap-2 text-foreground/80"
              >
                <span className="text-amber-500 font-bold shrink-0 mt-0.5">
                  💡
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
