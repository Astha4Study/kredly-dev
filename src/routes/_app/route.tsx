import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useAuth } from '@/contexts';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect ke login jika belum authenticated
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
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

  // Jika belum authenticated, tidak render apa-apa (akan redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <Outlet />
    </main>
  );
}
