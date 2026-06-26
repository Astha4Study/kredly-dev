import certificationTemplate from '@/assets/certification/certification-template.png';
import QRCode from 'qrcode';

export interface CertificateData {
  recipientName: string;
  assessmentName: string;
  level: string;
  score: string;
  maxScore: string;
  totalQuestions: string;
  duration: string;
  certificateId: string;
}

export async function generateCertificateCanvas(
  data: CertificateData,
): Promise<HTMLCanvasElement> {
  return new Promise(async (resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    const img = new Image();
    img.src = certificationTemplate;
    
    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const leftMargin = 127;
      const startY = 380;

      // Name
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 90px Arial';
      ctx.fillText(data.recipientName, leftMargin, startY + 70);

      // Assessment Name
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 90px Arial';
      ctx.fillText(data.assessmentName, leftMargin, startY + 310);

      // Level
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 90px Arial';
      ctx.fillText(data.level, leftMargin, startY + 530);

      // Score
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 80px Arial';
      ctx.fillText(
        `${data.score}/${data.maxScore}`,
        leftMargin,
        startY + 770,
      );

      // Total Questions and Duration
      ctx.font = '38px Arial';
      ctx.fillStyle = '#000957';

      const y = startY + 880;

      const questionsText = `${data.totalQuestions} Soal`;
      ctx.fillText(questionsText, leftMargin, y);

      const qWidth = ctx.measureText(questionsText).width;

      const dot1 = ' · ';
      ctx.fillText(dot1, leftMargin + qWidth, y);

      const dot1Width = ctx.measureText(dot1).width;

      const durationText = `${data.duration} Menit`;
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
      const qrX = canvas.width - qrSize - 175;
      const qrY = 530;

      // Background putih QR
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);

      try {
        // Generate real QR code with certificate ID
        const qrDataUrl = await QRCode.toDataURL(data.certificateId, {
          width: qrSize,
          margin: 0,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });

        // Draw QR code image
        const qrImage = new Image();
        qrImage.onload = () => {
          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

          // Draw certificate ID text below QR
          ctx.fillStyle = '#6b7280';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            data.certificateId,
            qrX + qrSize / 2,
            qrY + qrSize + 20,
          );

          resolve(canvas);
        };
        qrImage.onerror = () => {
          reject(new Error('Failed to load QR code'));
        };
        qrImage.src = qrDataUrl;
      } catch (error) {
        reject(new Error('Failed to generate QR code'));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load certificate template'));
    };
  });
}

export async function generateCertificatePNG(
  data: CertificateData,
): Promise<string> {
  const canvas = await generateCertificateCanvas(data);
  return canvas.toDataURL('image/png');
}

export async function downloadCertificatePNG(
  data: CertificateData,
  filename?: string,
): Promise<void> {
  const dataUrl = await generateCertificatePNG(data);
  
  const link = document.createElement('a');
  link.download = filename || `certificate-${data.recipientName.replace(/\s+/g, '-')}.png`;
  link.href = dataUrl;
  link.click();
}
