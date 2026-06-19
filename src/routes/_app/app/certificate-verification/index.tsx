import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Hash,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Shield,
  Calendar,
  User,
  Award,
} from 'lucide-react';

export const Route = createFileRoute('/_app/app/certificate-verification/')({
  component: RouteComponent,
});

interface VerificationResult {
  isValid: boolean;
  certificateData?: {
    recipientName: string;
    skillName: string;
    issueDate: string;
    score: number;
    blockchainHash: string;
    issuer: string;
  };
  message: string;
}

function RouteComponent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashInput, setHashInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
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

    // Simulasi API call
    setTimeout(() => {
      setVerificationResult({
        isValid: true,
        certificateData: {
          recipientName: 'John Doe',
          skillName: 'React Advanced',
          issueDate: '15 Juni 2026',
          score: 88,
          blockchainHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          issuer: 'Kredly Platform',
        },
        message: 'Sertifikat valid dan terverifikasi di blockchain',
      });
      setIsVerifying(false);
    }, 2000);
  };

  const verifyByHash = async () => {
    if (!hashInput.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);

    // Simulasi API call
    setTimeout(() => {
      const isValid = hashInput.startsWith('0x') && hashInput.length > 20;
      setVerificationResult({
        isValid,
        certificateData: isValid
          ? {
              recipientName: 'Jane Smith',
              skillName: 'TypeScript Fundamentals',
              issueDate: '10 Juni 2026',
              score: 91,
              blockchainHash: hashInput,
              issuer: 'Kredly Platform',
            }
          : undefined,
        message: isValid
          ? 'Sertifikat valid dan terverifikasi di blockchain'
          : 'Hash blockchain tidak ditemukan atau tidak valid',
      });
      setIsVerifying(false);
    }, 2000);
  };

  const resetVerification = () => {
    setSelectedFile(null);
    setHashInput('');
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
            Verifikasi keaslian sertifikat dengan upload PDF atau hash
            blockchain
          </p>
        </div>

        {/* Verification Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Metode Verifikasi</CardTitle>
            <CardDescription>
              Pilih salah satu metode untuk memverifikasi sertifikat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload PDF
                </TabsTrigger>
                <TabsTrigger value="hash" className="gap-2">
                  <Hash className="h-4 w-4" />
                  Hash Blockchain
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4 mt-6">
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
                )}
              </TabsContent>

              <TabsContent value="hash" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Hash Blockchain
                  </label>
                  <Input
                    placeholder="Masukkan hash blockchain (0x...)"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Contoh: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={verifyByHash}
                    disabled={!hashInput.trim() || isVerifying}
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
                        Verifikasi Hash
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
              </TabsContent>
            </Tabs>
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
                      ? 'Sertifikat Valid'
                      : 'Sertifikat Tidak Valid'}
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

            {verificationResult.isValid && verificationResult.certificateData && (
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Penerima
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {verificationResult.certificateData.recipientName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
                    <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Skill
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {verificationResult.certificateData.skillName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Tanggal Terbit
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {verificationResult.certificateData.issueDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Score
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {verificationResult.certificateData.score}/100
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-white p-4">
                  <label className="text-xs font-medium text-muted-foreground">
                    Blockchain Transaction Hash
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-xs bg-gray-100 px-3 py-2 rounded flex-1 font-mono break-all">
                      {verificationResult.certificateData.blockchainHash}
                    </code>
                    <Button size="sm" variant="outline">
                      Copy
                    </Button>
                  </div>
                  <a
                    href="#"
                    className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Lihat di Blockchain Explorer →
                  </a>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button className="flex-1">
                    <FileText className="mr-2 h-4 w-4" />
                    Download Sertifikat
                  </Button>
                  <Button variant="outline" onClick={resetVerification}>
                    Verifikasi Lagi
                  </Button>
                </div>
              </CardContent>
            )}
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
