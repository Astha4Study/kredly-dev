import * as React from 'react';
import {
  createFileRoute,
  useParams,
  useNavigate,
} from '@tanstack/react-router';
import { sessionService } from '@/services/sessionService';
import type { ResultResponse } from '@/pages/client/cat/types';

// Section components
import ResultLoading from '@/pages/client/cat/result/ResultLoading';
import ResultErrorView from '@/pages/client/cat/result/ResultErrorView';
import ResultHeader from '@/pages/client/cat/result/ResultHeader';
import ResultScoreCard from '@/pages/client/cat/result/ResultScoreCard';
import ResultSummaryCard from '@/pages/client/cat/result/ResultSummaryCard';
import ResultInsights from '@/pages/client/cat/result/ResultInsights';
import ResultActions from '@/pages/client/cat/result/ResultActions';
import ResultCertModal from '@/pages/client/cat/result/ResultCertModal';

export const Route = createFileRoute('/_cat/result/$sessionId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({ strict: false });
  const sessionId = (params as any).sessionId || '';
  const navigate = useNavigate();

  // States
  const [result, setResult] = React.useState<ResultResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
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

  if (isLoading) {
    return <ResultLoading />;
  }

  if (error || !result) {
    return (
      <ResultErrorView
        error={error || 'Data hasil evaluasi kosong.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Title Block */}
        <ResultHeader role={result.role} />

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ResultScoreCard
            displayedScore={displayedScore}
            level={result.level}
          />

          <ResultSummaryCard
            feedback={result.feedback}
            verificationId={result.verification_id}
            totalItems={result.total_items}
          />
        </div>

        {/* AI Recommendations & Detailed Insights */}
        <ResultInsights
          strengths={result.strengths}
          weaknesses={result.weaknesses}
          recommendations={result.recommendations}
        />

        {/* Action Buttons */}
        <ResultActions
          onDownload={handleDownloadCertificate}
          downloading={downloading}
          onNewTest={() => navigate({ to: '/parseCV' })}
          onHome={() => navigate({ to: '/' })}
        />
      </div>

      {/* Certificate Modal Dialog */}
      <ResultCertModal
        show={showCertModal}
        onClose={() => setShowCertModal(false)}
        role={result.role}
        level={result.level}
        score={result.score}
        verificationId={result.verification_id}
      />
    </div>
  );
}
