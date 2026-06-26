import { jsPDF } from 'jspdf';
import { generateCertificateCanvas, type CertificateData } from './certificateGenerator';

/**
 * Generate deterministic hash from certificate data (NOT from PDF)
 * This ensures hash is consistent regardless of canvas rendering
 * ponytail: Hash data instead of PDF - canvas rendering is non-deterministic
 */
export async function generateCertificatePDFHash(
  data: CertificateData,
): Promise<string> {
  try {
    // Create deterministic string from certificate data
    // Sort keys to ensure consistent order
    const dataString = JSON.stringify({
      assessmentName: data.assessmentName,
      certificateId: data.certificateId,
      duration: data.duration,
      level: data.level,
      maxScore: data.maxScore,
      recipientName: data.recipientName,
      score: data.score,
      totalQuestions: data.totalQuestions,
    });

    // Calculate SHA256 hash from data string
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Debug logging
    console.log('[Certificate Hash Debug - FROM DATA]');
    console.log('Data:', dataString);
    console.log('Hash:', hashHex);

    return hashHex;
  } catch (error) {
    console.error('Failed to generate certificate hash:', error);
    throw error;
  }
}

/**
 * Generate PDF from certificate canvas using jsPDF
 * Creates a high-quality PDF with the certificate image
 */
export async function downloadCertificatePDF(
  data: CertificateData,
  filename?: string,
): Promise<void> {
  try {
    // Generate certificate canvas
    const canvas = await generateCertificateCanvas(data);
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Create PDF in landscape A4 format
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: false, // Disable compression to preserve QR code quality
    });

    // Set fixed creation date for deterministic hash
    // ponytail: Makes PDF generation deterministic by using fixed timestamp
    pdf.setCreationDate(new Date('2026-01-01T00:00:00Z'));

    // A4 landscape dimensions in mm
    const pdfWidth = 297;
    const pdfHeight = 210;

    // Calculate image dimensions to fit PDF page
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    let imgWidth = pdfWidth;
    let imgHeight = pdfWidth / ratio;

    // If image is too tall, scale by height instead
    if (imgHeight > pdfHeight) {
      imgHeight = pdfHeight;
      imgWidth = pdfHeight * ratio;
    }

    // Center the image on the page
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;

    // Add image to PDF with no compression for maximum quality
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'NONE');

    // Save PDF
    const pdfFilename = filename || `certificate-${data.recipientName.replace(/\s+/g, '-')}.pdf`;
    pdf.save(pdfFilename);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
}
