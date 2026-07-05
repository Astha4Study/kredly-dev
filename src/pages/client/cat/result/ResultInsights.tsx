import * as React from 'react';
import { CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

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
    <div className="grid grid-cols-1 gap-6">
      {/* Strengths Card */}
      <div className="relative border border-foreground/10 p-6 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md flex flex-col">
        {/* Top Gradient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300" />

        <h2 className="text-sm md:text-base font-semibold flex items-center gap-2 text-emerald-400 mb-4 select-none">
          <CheckCircle className="size-4 shrink-0" /> Kekuatan (Strengths)
        </h2>
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
      </div>

      {/* Weaknesses Card */}
      <div className="relative border border-foreground/10 p-6 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md flex flex-col">
        {/* Top Gradient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-rose-400 to-rose-300" />

        <h2 className="text-sm md:text-base font-semibold flex items-center gap-2 text-rose-400 mb-4 select-none">
          <AlertTriangle className="size-4 shrink-0" /> Perlu Ditingkatkan
        </h2>
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
      </div>

      {/* Recommendations Card */}
      <div className="relative border border-foreground/10 p-6 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md flex flex-col">
        {/* Top Gradient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300" />

        <h2 className="text-sm md:text-base font-semibold flex items-center gap-2 text-amber-400 mb-4 select-none">
          <Lightbulb className="size-4 shrink-0" /> Rekomendasi Karir & Belajar
        </h2>
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
      </div>
    </div>
  );
}
