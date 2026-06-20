import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@tanstack/react-router';
import googleIcons from '@/assets/svg/google.svg';
import { useAuth } from '@/contexts/auth';

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmailOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const result = await signInWithEmailOTP(email, 'sign-up');

      if (result.success) {
        navigate({
          to: '/verification',
          search: {
            email,
            type: 'sign-up',
          },
        });
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setErrorMessage('Gagal mengirim kode OTP. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  // Google sign up sama dengan sign in, backend akan handle otomatis
  const signUpWithGoogle = signInWithGoogle;

  return (
    <main className="grid min-h-screen lg:grid-cols-2 md:p-4">
      {/* Left — slot untuk gambar */}
      <section className="hidden lg:block relative bg-white border-r overflow-hidden">
        {/* Taruh <img> atau komponen gambar di sini */}
      </section>

      {/* Right — form register */}
      <section className="relative flex items-center justify-center px-8 py-12 bg-white">
        {/* Link masuk — kanan atas */}
        <div className="absolute top-7 right-8 text-sm text-foreground">
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="font-medium text-zinc-900 border-b border-zinc-300 hover:border-zinc-900 transition-colors"
          >
            Masuk
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Bergabung dengan Kredly
              </h1>

              <p className="text-sm text-muted-foreground">
                Buat akun untuk memulai validasi skill dan membangun kredensial
                profesional Anda.
              </p>
            </div>

            {/* Google Sign Up */}
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              type="button"
              onClick={signUpWithGoogle}
            >
              <img src={googleIcons} alt="Google" className="mr-2 h-4 w-4" />
              Daftar dengan Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>

              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">
                  atau
                </span>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Mengirim kode...' : 'Buat Akun'}
              </Button>

              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
            </form>

            {/* Terms */}
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Dengan mendaftar, Anda menyetujui{' '}
              <a
                href="/terms"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Syarat & Ketentuan
              </a>{' '}
              dan{' '}
              <a
                href="/privacy"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Kebijakan Privasi
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
