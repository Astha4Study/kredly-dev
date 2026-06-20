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
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const Route = createFileRoute('/_auth/verification')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    email: (search.email as string) || '',
    type: (search.type as string) || 'sign-in',
  }),
});

function RouteComponent() {
  const navigate = useNavigate();
  const { verifyEmailOTP, signInWithEmailOTP } = useAuth();
  const { email, type } = useSearch({
    from: '/_auth/verification',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (otp.length !== 6) return;

    setLoading(true);

    try {
      const result = await verifyEmailOTP(
        email,
        otp,
        type as 'sign-in' | 'sign-up',
      );

      if (result.success && result.user) {
        toast.success('Verifikasi berhasil!');

        // Backend sudah mengecek table UserProfile dan return hasCompletedOnboarding
        if (result.user.hasCompletedOnboarding) {
          // UserProfile sudah ada, langsung ke /app dengan smooth navigation
          navigate({ to: '/app' });
        } else {
          // UserProfile kosong (user baru), ke /onboarding dengan smooth navigation
          navigate({ to: '/onboarding' });
        }
      } else {
        toast.error(result.message || 'Kode OTP tidak valid');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Kode OTP tidak valid',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);

    try {
      const result = await signInWithEmailOTP(
        email,
        type as 'sign-in' | 'sign-up',
      );

      if (result.success) {
        toast.success('Kode OTP baru telah dikirim ke email Anda');
      } else {
        toast.error(result.message || 'Gagal mengirim kode OTP');
      }
    } catch {
      toast.error('Gagal mengirim kode OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-8 py-12">
      <div className="w-full max-w-sm">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e4e4e7 1px, transparent 1px),
              linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
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

          <div className="mt-10 flex flex-col items-center space-y-6">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              onComplete={handleVerify}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                  index={0}
                  className="h-12 w-12 border-zinc-300 text-lg font-semibold"
                />
                <InputOTPSlot
                  index={1}
                  className="h-12 w-12 border-zinc-300 text-lg font-semibold"
                />
                <InputOTPSlot
                  index={2}
                  className="h-12 w-12 border-zinc-300 text-lg font-semibold"
                />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                  index={3}
                  className="h-12 w-12 border-zinc-300 text-lg font-semibold"
                />
                <InputOTPSlot
                  index={4}
                  className="h-12 w-12 border-zinc-300 text-lg font-semibold"
                />
                <InputOTPSlot
                  index={5}
                  className="h-12 w-12 border-zinc-300 text-lg font-semibold"
                />
              </InputOTPGroup>
            </InputOTP>

            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi'}
            </Button>

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
