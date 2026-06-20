import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/auth';
import { useEffect } from 'react';

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Hanya redirect jika sudah authenticated DAN bukan di halaman onboarding
    if (!isLoading && isAuthenticated && user) {
      const currentPath = window.location.pathname;

      // Jika sudah selesai onboarding, tidak boleh akses onboarding page lagi
      if (user.hasCompletedOnboarding && currentPath === '/onboarding') {
        navigate({ to: '/app', replace: true });
        return;
      }

      // Jika di halaman onboarding dan belum selesai onboarding, izinkan akses
      if (currentPath === '/onboarding' && !user.hasCompletedOnboarding) {
        return;
      }

      // Jika belum selesai onboarding dan bukan di onboarding, redirect ke onboarding
      if (!user.hasCompletedOnboarding) {
        navigate({ to: '/onboarding', replace: true });
      } else {
        // Jika sudah selesai onboarding dan di halaman login/register, redirect ke dashboard
        navigate({ to: '/app', replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  // Show loading saat check auth
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Outlet />
    </main>
  );
}
