import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/auth';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Show skeleton saat check auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* TopBar Skeleton */}
        <div className="sticky top-0 z-10 border-b bg-white">
          <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-6">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-10 w-96" />
              </div>
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Generic Content Skeleton */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="mt-8 h-64 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </main>
      </div>
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
