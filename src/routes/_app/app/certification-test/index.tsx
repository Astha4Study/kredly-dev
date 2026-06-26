import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import certificationTemplate from '@/assets/certification/certification-template.png';
import { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Upload, ShieldCheck } from 'lucide-react';

export const Route = createFileRoute('/_app/app/certification-test/')({
  component: RouteComponent,
});

interface CertificateData {
  recipientName: string;
  assessmentName: string;
  level: string;
  score: string;
  maxScore: string;
  totalQuestions: string;
  duration: string;
  certificateId: string;
}

function RouteComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [uploadedPDF, setUploadedPDF] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [certificateData, setCertificateData] = useState<CertificateData>({
    recipientName: 'Firman',
    assessmentName: 'React Native',
    level: 'Intermediate',
    score: '753',
    maxScore: '1000',
    totalQuestions: '15',
    duration: '14',
    certificateId: '#123313.21413',
  });

  useEffect(() => {
    const img = new Image();
    img.src = certificationTemplate;
    img.onload = () => {
      setImageLoaded(true);
      drawCertificate(img);
    };
  }, []);

  useEffect(() => {
    if (imageLoaded) {
      const img = new Image();
      img.src = certificationTemplate;
      img.onload = () => drawCertificate(img);
    }
  }, [certificateData, imageLoaded]);

  const drawCertificate = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const leftMargin = 127;
    const startY = 380;

    // Name
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 90px Arial';
    ctx.fillText(certificateData.recipientName, leftMargin, startY + 70);

    // Assessment Name
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 90px Arial';
    ctx.fillText(certificateData.assessmentName, leftMargin, startY + 310);

    // Level
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 90px Arial';
    ctx.fillText(certificateData.level, leftMargin, startY + 530);

    // Score
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 80px Arial';
    ctx.fillText(
      `${certificateData.score}/${certificateData.maxScore}`,
      leftMargin,
      startY + 770,
    );

    // Total Questions and Duration
    ctx.font = '38px Arial';
    ctx.fillStyle = '#000957';

    const y = startY + 880;

    const questionsText = `${certificateData.totalQuestions} Soal`;
    ctx.fillText(questionsText, leftMargin, y);

    const qWidth = ctx.measureText(questionsText).width;

    const dot1 = ' · ';
    ctx.fillText(dot1, leftMargin + qWidth, y);

    const dot1Width = ctx.measureText(dot1).width;

    const durationText = `${certificateData.duration} Menit`;
    ctx.fillText(durationText, leftMargin + qWidth + dot1Width, y);

    const dWidth = ctx.measureText(durationText).width;

    const dot2 = ' · ';
    ctx.fillText(dot2, leftMargin + qWidth + dot1Width + dWidth, y);

    const dot2Width = ctx.measureText(dot2).width;

    ctx.fillText(
      'Computerized Adaptive Testing',
      leftMargin + qWidth + dot1Width + dWidth + dot2Width,
      y,
    );

    const qrSize = 250;
    const modules = 25;
    const moduleSize = qrSize / modules;

    const qrX = canvas.width - qrSize - 175;
    const qrY = 530;

    // Background putih QR
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);

    // Draw QR Code
    ctx.fillStyle = '#000000';

    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (Math.random() > 0.5) {
          ctx.fillRect(
            qrX + col * moduleSize,
            qrY + row * moduleSize,
            moduleSize,
            moduleSize,
          );
        }
      }
    }

    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      certificateData.certificateId,
      qrX + qrSize / 2,
      qrY + qrSize + 20,
    );
  };

  const handleInputChange = (field: keyof CertificateData, value: string) => {
    setCertificateData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `certificate-${certificateData.recipientName.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const generateRandomCertId = () => {
    const random = Math.floor(Math.random() * 1000000);
    return `#${random.toString().padStart(6, '0')}.${Math.floor(Math.random() * 100000)}`;
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedPDF(file);
      setVerificationResult(null);
    }
  };

  const handleVerifyPDF = async () => {
    if (!uploadedPDF) return;

    setVerifying(true);
    setVerificationResult(null);

    try {
      // Calculate PDF hash on client-side
      const arrayBuffer = await uploadedPDF.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Extract certificate ID from filename or use input
      const certId = uploadedPDF.name.replace('.pdf', '').split('_').pop() || '';

      // Send only hash to backend
      const response = await fetch('/api/blockchain/verify-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          certificateId: certId,
          pdfHash: hashHex,
        }),
      });

      const data = await response.json();
      setVerificationResult(data);
    } catch (err: any) {
      setVerificationResult({
        isValid: false,
        status: 'error',
        message: err.message || 'Gagal memverifikasi PDF',
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Certificate Generator
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Input data untuk generate sertifikat dengan template
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Input Data Sertifikat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Nama Penerima</Label>
                <Input
                  id="recipientName"
                  value={certificateData.recipientName}
                  onChange={(e) =>
                    handleInputChange('recipientName', e.target.value)
                  }
                  placeholder="Masukkan nama penerima"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessmentName">Nama Assessment</Label>
                <Input
                  id="assessmentName"
                  value={certificateData.assessmentName}
                  onChange={(e) =>
                    handleInputChange('assessmentName', e.target.value)
                  }
                  placeholder="Contoh: React Native"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Tingkat</Label>
                <Select
                  value={certificateData.level}
                  onValueChange={(value) => handleInputChange('level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Skor</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    value={certificateData.score}
                    onChange={(e) => handleInputChange('score', e.target.value)}
                    placeholder="753"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxScore">Skor Maksimal</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="0"
                    value={certificateData.maxScore}
                    onChange={(e) =>
                      handleInputChange('maxScore', e.target.value)
                    }
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalQuestions">Jumlah Soal</Label>
                  <Input
                    id="totalQuestions"
                    type="number"
                    min="1"
                    value={certificateData.totalQuestions}
                    onChange={(e) =>
                      handleInputChange('totalQuestions', e.target.value)
                    }
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Durasi (Menit)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={certificateData.duration}
                    onChange={(e) =>
                      handleInputChange('duration', e.target.value)
                    }
                    placeholder="14"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="certificateId">ID Sertifikat</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleInputChange('certificateId', generateRandomCertId())
                    }
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  id="certificateId"
                  value={certificateData.certificateId}
                  onChange={(e) =>
                    handleInputChange('certificateId', e.target.value)
                  }
                  placeholder="#123313.21413"
                />
              </div>

              <Button onClick={handleDownload} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Certificate
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Preview Sertifikat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto border-2 border-gray-200 rounded-lg shadow-lg"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PDF Verification Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Verifikasi Sertifikat PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdfUpload">Upload PDF Sertifikat</Label>
              <p className="text-sm text-muted-foreground">
                Upload file PDF sertifikat untuk memverifikasi keasliannya di blockchain
              </p>
              <div className="flex gap-2">
                <Input
                  id="pdfUpload"
                  type="file"
                  accept="application/pdf"
                  onChange={handlePDFUpload}
                  ref={fileInputRef}
                  className="flex-1"
                />
                <Button
                  onClick={handleVerifyPDF}
                  disabled={!uploadedPDF || verifying}
                  className="gap-2"
                >
                  {verifying ? 'Memverifikasi...' : 'Verifikasi'}
                </Button>
              </div>
              {uploadedPDF && (
                <p className="text-sm text-muted-foreground">
                  File: {uploadedPDF.name} ({(uploadedPDF.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {verificationResult && (
              <div
                className={`p-4 rounded-lg border ${
                  verificationResult.isValid
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className={`h-5 w-5 mt-0.5 ${
                      verificationResult.isValid ? 'text-green-600' : 'text-red-600'
                    }`}
                  />
                  <div className="flex-1">
                    <h4
                      className={`font-semibold ${
                        verificationResult.isValid ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {verificationResult.isValid ? 'Sertifikat Valid ✓' : 'Sertifikat Tidak Valid ✗'}
                    </h4>
                    <p
                      className={`text-sm mt-1 ${
                        verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {verificationResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cara Menggunakan</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Isi form input dengan data penerima sertifikat</li>
              <li>Preview akan otomatis update sesuai input</li>
              <li>
                Gunakan tombol refresh untuk generate ID sertifikat random
              </li>
              <li>QR Code akan di-generate otomatis (dummy pattern)</li>
              <li>Klik tombol Download untuk menyimpan sertifikat</li>
              <li>Sertifikat akan tersimpan dalam format PNG</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
