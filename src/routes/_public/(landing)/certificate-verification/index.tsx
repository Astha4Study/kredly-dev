import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Shield,
  Check,
  Copy,
  Clock,
  Database,
  Link as LinkIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  fadeInUp,
  scaleIn,
  blurTransition,
  createStaggerAnimation,
  fadeInUpDelayed,
} from '@/lib/animations';

export const Route = createFileRoute(
  '/_public/(landing)/certificate-verification/',
)({
  component: RouteComponent,
});

interface CertificateMetadata {
  id?: string | { $oid: string };
  sessionId: string;
  certificateId: string;
  recipientName: string;
  assessmentName: string;
  score: number;
  pdfHash: string;
  ipfsCID: string;
  ipfsURL: string;
  txHash: string;
  createdAt: string | { $date: string };
  updatedAt: string | { $date: string };
}

interface VerificationResult {
  isValid: boolean;
  status: string;
  message: string;
  metadata?: CertificateMetadata;
}

function RouteComponent() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getFormattedDate = (dateVal: any) => {
    if (!dateVal) return '-';
    const dString =
      typeof dateVal === 'string'
        ? dateVal
        : dateVal.$date
          ? dateVal.$date
          : String(dateVal);
    try {
      return new Date(dString).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return dString;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setVerificationResult(null);
    }
  };

  const verifyByFile = async () => {
    if (!selectedFile) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Calculate SHA256 hash from UPLOADED PDF (basic FileReader method)
      const reader = new FileReader();
      reader.readAsArrayBuffer(selectedFile);

      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const pdfHash =
            '0x' +
            hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

          console.log('[Verification] PDF Hash:', pdfHash);

          // Send ONLY hash to backend (backend will search database by hash)
          const response = await fetch('/api/blockchain/verify-by-hash', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              pdfHash: pdfHash,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to verify certificate with blockchain');
          }

          const data = await response.json();

          setVerificationResult({
            isValid: data.isValid,
            status: data.status,
            message: data.message,
            metadata: data.metadata,
          });
          setIsVerifying(false);
        } catch (error) {
          console.error('Error verifying certificate:', error);
          setVerificationResult({
            isValid: false,
            status: 'Error',
            message: `Gagal memverifikasi sertifikat: ${error instanceof Error ? error.message : 'Silakan coba lagi.'}`,
          });
          setIsVerifying(false);
        }
      };

      reader.onerror = () => {
        setVerificationResult({
          isValid: false,
          status: 'Error',
          message: 'Gagal membaca file PDF',
        });
        setIsVerifying(false);
      };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setVerificationResult({
        isValid: false,
        status: 'Error',
        message: `Gagal memverifikasi sertifikat: ${error instanceof Error ? error.message : 'Silakan coba lagi.'}`,
      });
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setSelectedFile(null);
    setVerificationResult(null);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div {...fadeInUp}>
          <h1 className="text-2xl font-bold tracking-tight">
            Verifikasi Sertifikat
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verifikasi keaslian sertifikat dengan mengupload file PDF
          </p>
        </motion.div>

        {/* Verification Form */}
        <motion.div {...scaleIn}>
          <Card>
            <CardHeader>
              <CardTitle>Upload Sertifikat</CardTitle>
              <CardDescription>
                Upload file PDF sertifikat untuk memverifikasi keasliannya
                melalui blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="rounded-full bg-primary/10 p-4">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {selectedFile
                          ? selectedFile.name
                          : 'Klik untuk upload sertifikat PDF'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: PDF, Maksimal 5MB
                      </p>
                    </div>
                  </label>
                </div>

                {selectedFile && (
                  <>
                    <div className="flex gap-3">
                      <Button
                        onClick={verifyByFile}
                        disabled={isVerifying}
                        className="flex-1"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memverifikasi...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Verifikasi Sertifikat
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetVerification}
                        disabled={isVerifying}
                      >
                        Reset
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verification Result */}
        <AnimatePresence mode="wait">
          {verificationResult && (
            <motion.div {...blurTransition}>
              <Card
                className={
                  verificationResult.isValid
                    ? 'border-green-200 bg-green-50/50'
                    : 'border-red-200 bg-red-50/50'
                }
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {verificationResult.isValid ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <CardTitle
                        className={
                          verificationResult.isValid
                            ? 'text-green-900'
                            : 'text-red-900'
                        }
                      >
                        {verificationResult.isValid
                          ? 'Sertifikat Valid ✓'
                          : 'Sertifikat Tidak Valid ✗'}
                      </CardTitle>
                      <CardDescription
                        className={
                          verificationResult.isValid
                            ? 'text-green-700'
                            : 'text-red-700'
                        }
                      >
                        {verificationResult.message}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Status Blockchain
                        </p>
                        <p className="text-sm font-semibold mt-1">
                          {verificationResult.status}
                        </p>
                      </div>
                      <Shield
                        className={`h-8 w-8 ${verificationResult.isValid ? 'text-green-600' : 'text-red-600'}`}
                      />
                    </div>
                  </div>

                  {verificationResult.isValid &&
                    verificationResult.metadata && (
                      <div className="rounded-lg border bg-white p-5 space-y-4 shadow-sm text-left">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Database className="h-4.5 w-4.5 text-primary" />
                            Detail Metadata Blockchain
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Informasi verifikasi kriptografis permanen
                          </p>
                        </div>

                        <div className="space-y-3 divide-y divide-slate-100">
                          {/* Recipient Name */}
                          {verificationResult.metadata.recipientName && (
                            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-muted-foreground min-w-[140px]">
                                Nama Lengkap
                              </span>
                              <span className="text-xs font-medium text-slate-800">
                                {verificationResult.metadata.recipientName}
                              </span>
                            </div>
                          )}

                          {/* Assessment Name */}
                          {verificationResult.metadata.assessmentName && (
                            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-muted-foreground min-w-[140px]">
                                Assessment
                              </span>
                              <span className="text-xs font-medium text-slate-800">
                                {verificationResult.metadata.assessmentName}
                              </span>
                            </div>
                          )}

                          {/* Score */}
                          {verificationResult.metadata.score > 0 && (
                            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-muted-foreground min-w-[140px]">
                                Score
                              </span>
                              <span className="text-xs font-semibold text-slate-800">
                                {verificationResult.metadata.score}
                                <span className="text-muted-foreground font-normal">
                                  {' '}
                                  / 100
                                </span>
                              </span>
                            </div>
                          )}

                          {/* Certificate ID */}
                          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-muted-foreground min-w-[140px]">
                              Certificate ID
                            </span>
                            <div className="flex items-center gap-1.5 flex-1 justify-end max-w-full overflow-hidden">
                              <span className="font-mono text-xs text-slate-800 break-all select-all">
                                {verificationResult.metadata.certificateId}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-slate-100 flex-shrink-0"
                                onClick={() =>
                                  handleCopy(
                                    verificationResult.metadata!.certificateId,
                                    'certId',
                                  )
                                }
                              >
                                {copiedField === 'certId' ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Transaction Hash */}
                          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-muted-foreground min-w-[140px]">
                              Transaction Hash
                            </span>
                            <div className="flex items-center gap-1.5 flex-1 justify-end max-w-full overflow-hidden">
                              <span className="font-mono text-xs text-slate-800 break-all select-all">
                                {verificationResult.metadata.txHash || '-'}
                              </span>
                              {verificationResult.metadata.txHash && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-slate-100 flex-shrink-0"
                                  onClick={() =>
                                    handleCopy(
                                      verificationResult.metadata!.txHash,
                                      'txHash',
                                    )
                                  }
                                >
                                  {copiedField === 'txHash' ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* IPFS CID & URL */}
                          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-muted-foreground min-w-[140px]">
                              IPFS CID & URL
                            </span>
                            <div className="flex flex-col items-end gap-1 flex-1 max-w-full overflow-hidden">
                              <div className="flex items-center gap-1.5 max-w-full">
                                <span className="font-mono text-xs text-slate-800 break-all select-all">
                                  {verificationResult.metadata.ipfsCID}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-slate-100 flex-shrink-0"
                                  onClick={() =>
                                    handleCopy(
                                      verificationResult.metadata!.ipfsCID,
                                      'ipfsCID',
                                    )
                                  }
                                >
                                  {copiedField === 'ipfsCID' ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* PDF Hash */}
                          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-muted-foreground min-w-[140px]">
                              PDF Hash (SHA-256)
                            </span>
                            <div className="flex items-center gap-1.5 flex-1 justify-end max-w-full overflow-hidden">
                              <span className="font-mono text-[11px] text-slate-800 break-all select-all">
                                {verificationResult.metadata.pdfHash}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-slate-100 flex-shrink-0"
                                onClick={() =>
                                  handleCopy(
                                    verificationResult.metadata!.pdfHash,
                                    'pdfHash',
                                  )
                                }
                              >
                                {copiedField === 'pdfHash' ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Created At */}
                          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-muted-foreground min-w-[140px]">
                              Waktu Dibuat
                            </span>
                            <div className="flex items-center gap-1.5 text-slate-700 justify-end">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs font-medium">
                                {getFormattedDate(
                                  verificationResult.metadata.createdAt,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-3">
                          <a
                            href={`https://amoy.polygonscan.com/tx/${verificationResult.metadata.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 text-xs h-9">
                              <LinkIcon className="h-3.5 w-3.5" />
                              Buka Link Blockchain
                            </Button>
                          </a>
                          <a
                            href={verificationResult.metadata.ipfsURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              className="w-full flex items-center justify-center gap-1.5 border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs h-9"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Lihat PDF Asli
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={resetVerification}
                      className="flex-1"
                    >
                      Verifikasi Lagi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        <motion.div {...scaleIn}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Tentang Verifikasi Sertifikat
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Setiap sertifikat yang diterbitkan oleh Kredly disimpan di
                blockchain untuk memastikan keaslian dan transparansi.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Upload file PDF sertifikat untuk verifikasi otomatis</li>
                <li>
                  Gunakan hash blockchain yang tertera di sertifikat untuk
                  verifikasi manual
                </li>
                <li>
                  Sertifikat yang valid akan menampilkan detail lengkap dan
                  status verifikasi
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
