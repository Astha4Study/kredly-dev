import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/_auth/verification')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    email: (search.email as string) || '',
    type: (search.type as string) || 'sign-in',
  }),
});

function RouteComponent() {
  const navigate = useNavigate();
  const { email, type } = useSearch({
    from: '/_auth/verification',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleVerify() {
    if (otp.length !== 6) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const authServerUrl = import.meta.env.VITE_AUTH_SERVER_URL || 'http://localhost:3001';
      const response = await fetch(`${authServerUrl}/api/auth/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          otp,
          type,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      // Ambil redirect URL dari sessionStorage atau default ke /app
      const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/app';
      sessionStorage.removeItem('redirectAfterLogin');

      navigate({
        to: redirectTo as any,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Kode OTP tidak valid',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    setErrorMessage('');

    try {
      const authServerUrl = import.meta.env.VITE_AUTH_SERVER_URL || 'http://localhost:3001';
      const response = await fetch(`${authServerUrl}/api/auth/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      setErrorMessage('Kode OTP baru telah dikirim ke email Anda.');
    } catch {
      setErrorMessage('Gagal mengirim kode OTP.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-8 py-12">
      <div className="w-full max-w-sm">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Verifikasi Email
            </h1>
            <p className="text-sm text-muted-foreground">
              Kami telah mengirim kode 6 digit ke <strong>{email}</strong>
            </p>
          </div>

          {/* OTP Input */}
          <div className="flex flex-col items-center space-y-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              onComplete={handleVerify}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi'}
            </Button>

            {errorMessage && (
              <p className="text-sm text-center text-muted-foreground">
                {errorMessage}
              </p>
            )}

            {/* Resend */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Kirim ulang kode
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
