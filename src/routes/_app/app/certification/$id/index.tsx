import * as React from 'react';
import {
  createFileRoute,
  useParams,
  useNavigate,
} from '@tanstack/react-router';
import { sessionService } from '@/services/sessionService';
import type { ResultResponse } from '@/pages/client/cat/types';
import { generateCertificateCanvas } from '@/lib/certificateGenerator';
import { jsPDF } from 'jspdf';
import { useAuth } from '@/contexts/auth';

// Section components - reuse dari result page
import ResultErrorView from '@/pages/client/cat/result/ResultErrorView';
import ResultScoreCard from '@/pages/client/cat/result/ResultScoreCard';
import ResultInsights from '@/pages/client/cat/result/ResultInsights';
import ResultCertModal from '@/pages/client/cat/result/ResultCertModal';
import ResultHeader from '@/pages/client/cat/result/ResultHeader';
import { SparkleIcon } from 'lucide-react';

export const Route = createFileRoute('/_app/app/certification/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({ strict: false });
  const certId = (params as any).id || '';
  const navigate = useNavigate();
  const { user } = useAuth();

  // States
  const [result, setResult] = React.useState<ResultResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadingMessage, setLoadingMessage] = React.useState(
    'Memuat data sertifikat...',
  );
  const [error, setError] = React.useState<string | null>(null);
  const [showCertModal, setShowCertModal] = React.useState(false);
  const [certificateMetadata, setCertificateMetadata] = React.useState<
    any | null
  >(null);

  // Animated displayed score
  const [displayedScore, setDisplayedScore] = React.useState(0);

  // Ref to prevent duplicate calls in React StrictMode (dev mode)
  const isInitialized = React.useRef(false);

  React.useEffect(() => {
    // Skip if already initialized (prevents duplicate in StrictMode)
    if (isInitialized.current) return;
    isInitialized.current = true;

    if (!certId) {
      setError('ID Sertifikat tidak ditemukan.');
      setIsLoading(false);
      return;
    }

    const checkMetadata = async (): Promise<boolean> => {
      try {
        setLoadingMessage('Memeriksa sertifikat di database...');
        const response = await fetch(`/api/certificates/metadata/${certId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.exists && data.metadata) {
            // Metadata found! Use existing, skip generate
            setCertificateMetadata(data.metadata);
            setLoadingMessage('Sertifikat sudah diterbitkan sebelumnya');
            console.log('[Certificate Metadata Loaded]', data.metadata);
            return true;
          }
        }
        return false;
      } catch (err) {
        console.error('Error checking metadata:', err);
        return false;
      }
    };

    const verifyAndIssueCertificate = async (data: ResultResponse) => {
      try {
        // Check if certificate exists on blockchain
        const checkResponse = await fetch(
          `/api/blockchain/verify?certificateId=${data.verification_id}`,
          { credentials: 'include' },
        );

        if (checkResponse.ok) {
          const checkData = await checkResponse.json();

          // If certificate already exists and valid, skip issuing
          if (checkData.isValid) {
            setLoadingMessage('Sertifikat sudah terverifikasi di blockchain');
            return;
          }
        }

        // Certificate not found, generate PDF buffer
        setLoadingMessage('Membuat sertifikat PDF...');

        const estimatedDuration = Math.ceil(data.total_items * 2);

        const canvas = await generateCertificateCanvas({
          recipientName: user?.name || 'User',
          assessmentName: data.role,
          level: data.level,
          score: data.score.toString(),
          maxScore: '100',
          totalQuestions: data.total_items.toString(),
          duration: estimatedDuration.toString(),
          certificateId: data.verification_id,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.85);

        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
          compress: true,
        });

        pdf.setCreationDate(new Date('2026-01-01T00:00:00Z'));

        // Add image to PDF
        const pdfWidth = 297;
        const pdfHeight = 210;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;

        let imgWidth = pdfWidth;
        let imgHeight = pdfWidth / ratio;

        if (imgHeight > pdfHeight) {
          imgHeight = pdfHeight;
          imgWidth = pdfHeight * ratio;
        }

        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight - imgHeight) / 2;

        pdf.addImage(
          imgData,
          'JPEG',
          x,
          y,
          imgWidth,
          imgHeight,
          undefined,
          'FAST',
        );

        // Get PDF bytes ONCE (single pdf.output() call)
        const pdfArrayBuffer = pdf.output('arraybuffer');

        // Calculate SHA256 hash from PDF bytes
        const hashBuffer = await crypto.subtle.digest(
          'SHA-256',
          pdfArrayBuffer,
        );
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const pdfHash =
          '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

        console.log('[Issue] PDF Hash calculated in frontend:', pdfHash);

        // Convert from the SAME ArrayBuffer to base64 for upload
        const pdfBytes = new Uint8Array(pdfArrayBuffer);
        let binary = '';
        for (let i = 0; i < pdfBytes.length; i++) {
          binary += String.fromCharCode(pdfBytes[i]);
        }
        const pdfBase64 = btoa(binary);

        // Upload to backend (backend will upload to Pinata + issue to blockchain)
        setLoadingMessage('Mengupload ke IPFS dan blockchain...');

        const issueResponse = await fetch('/api/blockchain/issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            certificateId: data.verification_id,
            sessionId: certId,
            pdfBuffer: pdfBase64,
            pdfHash: pdfHash, // Send hash calculated in frontend
            recipientName: user?.name || 'User',
            assessmentName: data.role,
            score: data.score,
          }),
        });

        if (!issueResponse.ok) {
          throw new Error('Gagal menerbitkan sertifikat ke blockchain');
        }

        const issueData = await issueResponse.json();

        // Check if certificate already exists on blockchain
        if (issueData.alreadyExists) {
          console.log('[Certificate Already Exists]', {
            certificateId: issueData.certificateId,
            pdfHash: issueData.pdfHash,
            ipfsCID: issueData.ipfsCID,
            ipfsUrl: issueData.ipfsUrl,
            message: issueData.message,
          });

          // Update metadata state so download can use IPFS URL
          setCertificateMetadata({
            certificateId: issueData.certificateId,
            pdfHash: issueData.pdfHash,
            ipfsCID: issueData.ipfsCID,
            ipfsURL: issueData.ipfsUrl,
            txHash: issueData.txHash || '',
          });

          setLoadingMessage('Sertifikat sudah ada di blockchain (recovered)');
          return; // Exit early, certificate already exists
        }

        console.log('[Certificate Issued]', {
          certificateId: issueData.certificateId,
          pdfHash: issueData.pdfHash,
          ipfsCID: issueData.ipfsCID,
          ipfsUrl: issueData.ipfsUrl,
          txHash: issueData.txHash,
        });

        // Update metadata state so download can use IPFS URL
        setCertificateMetadata({
          certificateId: issueData.certificateId,
          pdfHash: issueData.pdfHash,
          ipfsCID: issueData.ipfsCID,
          ipfsURL: issueData.ipfsUrl,
          txHash: issueData.txHash,
        });

        setLoadingMessage('Sertifikat berhasil diterbitkan ke blockchain!');
      } catch (err: any) {
        console.error('Blockchain verification error:', err);
        setError(
          err.message ||
          'Gagal menerbitkan sertifikat ke blockchain. Silakan coba lagi.',
        );
        setIsLoading(false);
      }
    };

    const fetchResult = async () => {
      try {
        setLoadingMessage('Memuat data sertifikat...');
        const data = await sessionService.getResult(certId);
        setResult(data);

        // Check if certificate metadata already exists
        const metadataExists = await checkMetadata();

        if (!metadataExists) {
          // Metadata not found, proceed with generate and issue
          setLoadingMessage('Memeriksa verifikasi blockchain...');
          await verifyAndIssueCertificate(data);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Gagal mengambil hasil sertifikat.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [certId]);

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

  const handleDownloadCertificate = async () => {
    if (!result) return;

    // Download directly from IPFS (Pinata Cloud)
    if (certificateMetadata?.ipfsURL) {
      window.open(certificateMetadata.ipfsURL, '_blank');
      setShowCertModal(true);
      return;
    }

    // If no IPFS URL, show error (shouldn't happen after issue)
    alert('Certificate belum tersedia. Silakan tunggu proses issue selesai.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{loadingMessage}</h3>
            <p className="text-sm text-muted-foreground">
              Mohon tunggu, proses ini mungkin membutuhkan beberapa saat...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <ResultErrorView
        error={error || 'Data hasil sertifikat kosong.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8">

        <ResultHeader role={result.role} level={result.level} />
        {/* Score & Evaluation Summary Card */}
        <ResultScoreCard
          displayedScore={displayedScore}
          level={result.level}
          feedback={result.feedback}
          verificationId={result.verification_id}
          totalItems={result.total_items}
          durationSeconds={result.duration_seconds}
          role={result.role}
          onDownload={handleDownloadCertificate}
          onNewTest={() => navigate({ to: '/app/assessment' })}
          onHome={() => navigate({ to: '/app' })}
        />

        <div className="relative border border-foreground/10 p-6 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md">
          {/* Top Gradient Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-primary to-amber-300" />
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-medium text-foreground leading-normal select-none">Analisa mendalam dari sesi ujianmu</h1>
            <SparkleIcon className="text-primary size-5" />
          </div>
          <p className="text-sm md:text-base text-muted-foreground mt-3 leading-relaxed font-normal text-justify">
            {result.feedback}
          </p>
        </div>

        {/* AI Recommendations & Detailed Insights */}
        <ResultInsights
          strengths={result.strengths}
          weaknesses={result.weaknesses}
          recommendations={result.recommendations}
        />
      </div>

      {/* Certificate Modal Dialog */}
      <ResultCertModal
        show={showCertModal}
        onClose={() => setShowCertModal(false)}
        userName={user?.name || 'Pengguna Kredly'}
        role={result.role}
        level={result.level}
        score={result.score}
        verificationId={result.verification_id}
        totalItems={result.total_items}
        durationSeconds={result.duration_seconds}
      />
    </div>
  );
}
