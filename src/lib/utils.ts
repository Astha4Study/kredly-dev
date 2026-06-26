import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFriendlyErrorMessage(err: any): string {
  if (!err) return 'Terjadi kesalahan yang tidak diketahui.';

  let message: string;

  if (typeof err === 'string') {
    message = err;
  } else if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === 'object') {
    message = err.error || err.message || JSON.stringify(err);
  } else {
    message = String(err);
  }

  // Check if message is a JSON string itself
  if (
    typeof message === 'string' &&
    (message.trim().startsWith('{') || message.trim().startsWith('['))
  ) {
    try {
      const parsed = JSON.parse(message);
      if (parsed.error) {
        message =
          typeof parsed.error === 'string'
            ? parsed.error
            : parsed.error.message || JSON.stringify(parsed.error);
      } else if (parsed.message) {
        message = parsed.message;
      }
    } catch {
      // Not a valid JSON, keep as is
    }
  }

  const lowerMsg = message.toLowerCase();

  if (
    lowerMsg.includes('failed to fetch') ||
    lowerMsg.includes('network') ||
    lowerMsg.includes('load failed')
  ) {
    return 'Koneksi internet terganggu. Silakan periksa jaringan Anda dan coba lagi.';
  }
  if (
    lowerMsg.includes('json') ||
    lowerMsg.includes('unmarshal') ||
    lowerMsg.includes('request body') ||
    lowerMsg.includes('payload')
  ) {
    return 'Format data tidak valid. Silakan coba kirim ulang jawaban Anda.';
  }
  if (
    lowerMsg.includes('mongo') ||
    lowerMsg.includes('database') ||
    lowerMsg.includes('connection refused') ||
    lowerMsg.includes('dial tcp')
  ) {
    return 'Terjadi masalah pada server database. Silakan coba beberapa saat lagi.';
  }
  if (
    lowerMsg.includes('groq') ||
    lowerMsg.includes('rate limit') ||
    lowerMsg.includes('openai') ||
    lowerMsg.includes('gradeessay')
  ) {
    return 'Layanan penilaian AI sedang sibuk. Silakan tunggu beberapa saat dan coba lagi.';
  }
  if (lowerMsg.includes('timeout') || lowerMsg.includes('deadline exceeded')) {
    return 'Waktu permintaan habis (timeout). Silakan coba lagi.';
  }
  if (
    lowerMsg.includes('502') ||
    lowerMsg.includes('bad gateway') ||
    lowerMsg.includes('504') ||
    lowerMsg.includes('gateway timeout')
  ) {
    return 'Server sedang tidak merespons (Bad Gateway). Silakan coba sesaat lagi.';
  }
  if (lowerMsg.includes('500') || lowerMsg.includes('internal server error')) {
    return 'Terjadi kesalahan internal pada server kami. Tim kami sedang menanganinya.';
  }
  if (lowerMsg.includes('404') || lowerMsg.includes('not found')) {
    return 'Halaman atau data tidak ditemukan.';
  }
  if (
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('session expired') ||
    lowerMsg.includes('token')
  ) {
    return 'Sesi Anda telah berakhir. Silakan masuk kembali.';
  }

  // Default clean message if it's too technical
  if (
    message.length > 120 ||
    /[{}[\]:"]/g.test(message) ||
    lowerMsg.includes('error') ||
    lowerMsg.includes('failed')
  ) {
    return 'Terjadi kesalahan sistem saat memproses permintaan Anda. Silakan coba kembali.';
  }

  return message;
}
