import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts';
import { toast } from 'sonner';

export const Route = createFileRoute('/_app/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  async function handleLogout() {
    try {
      await signOut();
      toast.success('Berhasil logout');
      navigate({ to: '/login', replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Gagal logout');
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Selamat datang, {user?.name || user?.email}
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
