import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useSession, authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/_app/app')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();

  async function handleLogout() {
    await authClient.signOut();
    navigate({ to: '/login' });
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Selamat datang, {session?.user?.email}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <p className="text-muted-foreground">
        Selamat datang di dashboard Kredly. Halaman ini akan muncul setelah
        login.
      </p>
    </div>
  );
}
