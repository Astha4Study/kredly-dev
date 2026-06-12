import * as React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
  Award,
  BookOpen,
  CheckCircle,
  Copy,
  Download,
  Lightbulb,
  RefreshCw,
  Home,
  Check,
  AlertTriangle,
  Loader2,
  Sparkles,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { sessionService } from '@/services/sessionService';
import type { ResultResponse } from './types';
import { cn } from '@/lib/utils';

export default function ResultPage() {
  const params = useParams({ strict: false });
  const sessionId = (params as any).sessionId || '';
  const navigate = useNavigate();

  // States
  const [result, setResult] = React.useState<ResultResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [showCertModal, setShowCertModal] = React.useState(false);

  // Animated displayed score
  const [displayedScore, setDisplayedScore] = React.useState(0);

  React.useEffect(() => {
    if (!sessionId) {
      setError('ID Sesi tidak ditemukan.');
      setIsLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const data = await sessionService.getResult(sessionId);
        setResult(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Gagal mengambil hasil evaluasi.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  // Score counter animation
  React.useEffect(() => {
    if (!result) return;

    const start = 0;
    const end = result.score;
    const duration = 1500; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: easeOutQuad
      const easedProgress = progress * (2 - progress);
      setDisplayedScore(Math.floor(start + (end - start) * easedProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [result]);

  const handleCopyVerificationId = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.verification_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCertificate = () => {
    if (!result) return;
    setDownloading(true);

    // Simulate PDF generation/download
    setTimeout(() => {
      const certContent = `
=========================================
          KREDLY CERTIFICATION
=========================================
ID Sertifikat  : ${result.verification_id}
Role           : ${result.role}
Level Hasil    : ${result.level}
Skor Akhir     : ${result.score} (Skor Theta: ${result.theta.toFixed(3)})
Persentil      : P${result.percentile}
Total Soal     : ${result.total_items} Soal

Metodologi     : Rasch 1PL - Item Response Theory
Keabsahan      : Sertifikat ini sah dan terdaftar pada database Kredly.
=========================================
      Terima kasih telah menggunakan Kredly!
      `;

      const blob = new Blob([certContent], {
        type: 'text/plain;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Kredly_Certificate_${result.verification_id}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
      setShowCertModal(true);
    }, 1500);
  };

  // Level Styling Mapping
  const getLevelBadgeStyles = (level: string) => {
    const l = level.toLowerCase();
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

  if (isLoading) {
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

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6">
        <Card className="max-w-md w-full border-rose-500/20 bg-rose-500/5 backdrop-blur-md">
          <CardContent className="p-6 text-center space-y-6">
            <div className="flex justify-center">
              <AlertTriangle className="size-12 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-rose-400">
                Gagal Memuat Hasil
              </h3>
              <p className="text-sm text-muted-foreground">
                {error || 'Data hasil evaluasi kosong.'}
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full border-rose-500/30 hover:bg-rose-500/10"
            >
              Ulangi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Circular progress parameter calculations
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Scale score up to max 1000
  const strokeDashoffset =
    circumference - (Math.min(displayedScore, 1000) / 1000) * circumference;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Title Block */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2"
          >
            <Award className="size-8" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Assessment CAT Selesai
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Hasil evaluasi adaptif komprehensif Anda untuk posisi{' '}
            <strong className="text-foreground">{result.role}</strong>.
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Animated Score Circle Card */}
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
                    getLevelBadgeStyles(result.level),
                  )}
                >
                  {result.level}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Persentil: <strong>{result.percentile}th percentile</strong>
              </p>
            </div>
          </Card>

          {/* AI Assessment Info Card */}
          <Card className="border border-foreground/10 bg-card/40 backdrop-blur-md md:col-span-2 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-foreground/5 pb-3">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" /> Ringkasan
                  Evaluasi AI
                </h3>
                <span className="text-xs text-muted-foreground">
                  Verification ID: #{result.verification_id.substring(0, 8)}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80 font-normal">
                {result.feedback}
              </p>
            </div>

            {/* Verification & Metadata */}
            <div className="mt-6 pt-4 border-t border-foreground/5 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block">
                  Jumlah Soal Dijawab
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {result.total_items} Soal Ujian
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">
                  Status Verifikasi
                </span>
                <span className="font-semibold text-emerald-400 text-sm flex items-center gap-1">
                  <ShieldCheck className="size-3.5" /> Terverifikasi
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Recommendations & Detailed Insights */}
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
                {result.strengths.map((item, idx) => (
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
                {result.weaknesses.map((item, idx) => (
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
                {result.recommendations.map((item, idx) => (
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

        {/* Academic / IRT Methodology Note */}
        <Card className="border border-foreground/5 bg-foreground/[0.01] p-4 text-xs text-muted-foreground flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <HelpCircle className="size-5 shrink-0 text-muted-foreground/60 mt-0.5 md:mt-0" />
            <p className="leading-relaxed">
              <strong>Info Metodologi:</strong> Penilaian kredensial Kredly
              diproses menggunakan model matematika
              <strong> Item Response Theory (IRT) Rasch 1PL</strong>. Level
              kesulitan soal disesuaikan secara real-time berdasarkan
              probabilitas respon jawaban Anda untuk mengukur kemampuan laten (
              <span className="font-mono">&theta;</span>) secara akurat.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 border border-foreground/10 px-2 py-1 rounded bg-background/50">
            <span className="font-mono font-medium tracking-tight">
              ID: {result.verification_id.substring(0, 16)}...
            </span>
            <button
              onClick={handleCopyVerificationId}
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
              title="Salin ID Verifikasi"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-400" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            size="lg"
            onClick={handleDownloadCertificate}
            disabled={downloading}
            className="w-full sm:w-auto font-medium shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]"
          >
            {downloading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Mengunduh...
              </>
            ) : (
              <>
                <Download className="mr-2 size-4" /> Unduh Sertifikat
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate({ to: '/parseCV' })}
            className="w-full sm:w-auto border-foreground/10 hover:bg-foreground/5"
          >
            <RefreshCw className="mr-2 size-4" /> Tes Baru
          </Button>

          <Button
            size="lg"
            variant="ghost"
            onClick={() => navigate({ to: '/' })}
            className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
          >
            <Home className="mr-2 size-4" /> Beranda
          </Button>
        </div>
      </div>

      {/* Certificate Modal Dialog */}
      <AnimatePresence>
        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl border border-foreground/10 bg-card rounded-2xl p-6 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <Award className="size-12 mx-auto text-primary animate-bounce" />
                <h3 className="text-xl font-bold">
                  Kredensial Digital Tersimpan!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sertifikat digital Anda telah berhasil diunduh sebagai
                  metadata kredensial.
                </p>
              </div>

              {/* Certificate Mockup Frame */}
              <div className="border border-primary/20 bg-primary/[0.02] rounded-xl p-6 relative overflow-hidden space-y-6 text-center">
                <div className="absolute top-0 right-0 size-24 bg-primary/5 rounded-full blur-2xl" />
                <div className="border-b border-primary/10 pb-3">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-primary">
                    Kredly Verified Professional
                  </span>
                  <h4 className="text-lg font-bold mt-1">{result.role}</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-left text-xs">
                  <div>
                    <span className="text-muted-foreground block">
                      Kemampuan
                    </span>
                    <span className="font-semibold text-foreground">
                      {result.level}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">
                      Skor Kompetensi
                    </span>
                    <span className="font-semibold text-primary">
                      {result.score} / 1000
                    </span>
                  </div>
                </div>
                <div className="border-t border-primary/10 pt-3 flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>ID: {result.verification_id}</span>
                  <span className="text-emerald-400 font-semibold uppercase">
                    Status: Valid
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setShowCertModal(false)}
                className="w-full"
              >
                Selesai
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
