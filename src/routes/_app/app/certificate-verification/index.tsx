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
import { CheckCircle2, XCircle, Loader2, FileText, Shield } from 'lucide-react';

export const Route = createFileRoute('/_app/app/certificate-verification/')({
  component: RouteComponent,
});

interface VerificationResult {
  isValid: boolean;
  status: string;
  message: string;
}

function RouteComponent() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Verifikasi Sertifikat
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verifikasi keaslian sertifikat dengan mengupload file PDF
          </p>
        </div>

        {/* Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Sertifikat</CardTitle>
            <CardDescription>
              Upload file PDF sertifikat untuk memverifikasi keasliannya melalui
              blockchain
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

        {/* Verification Result */}
        {verificationResult && (
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

              {verificationResult.isValid && (
                <div className="rounded-lg border bg-blue-50 p-4">
                  <p className="text-xs font-medium text-blue-900">
                    ℹ️ Informasi
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Sertifikat ini telah terverifikasi di blockchain dan
                    terbukti asli. Hash PDF cocok dengan yang terdaftar untuk ID
                    sertifikat ini.
                  </p>
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
        )}

        {/* Info Section */}
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
                Sertifikat yang valid akan menampilkan detail lengkap dan status
                verifikasi
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
