import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useAuth } from '@/contexts';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});

function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect ke dashboard jika sudah login
    if (!isLoading && isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading saat check auth
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </main>
    );
  }

  // Jika sudah authenticated, tidak render apa-apa (akan redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <Outlet />
    </main>
  );
}
