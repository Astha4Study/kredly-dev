import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts';
import { useEffect } from 'react';

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      // Jika tidak authenticated, redirect ke login
      if (!isAuthenticated) {
        navigate({ to: '/login', replace: true });
        return;
      }

      // Jika authenticated tapi belum selesai onboarding, redirect ke onboarding
      if (user && !user.hasCompletedOnboarding) {
        navigate({ to: '/onboarding', replace: true });
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

  // Jika tidak authenticated atau belum onboarding, tidak render apa-apa (akan redirect)
  if (!isAuthenticated || (user && !user.hasCompletedOnboarding)) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <Outlet />
    </main>
  );
}
