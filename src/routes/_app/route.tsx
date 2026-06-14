import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();

    if (!session?.data?.user) {
      // Simpan URL yang ingin diakses
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
      throw redirect({
        to: '/login',
        search: {
          redirect: location.pathname,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="min-h-screen">
      <Outlet />
    </main>
  );
}
