import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_app/app/$')({
  component: NotFoundComponent,
});

function NotFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <h2 className="text-2xl font-semibold">Halaman Tidak Ditemukan</h2>
        <p className="text-muted-foreground max-w-md">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div className="pt-4">
          <Link to="/app">
            <Button>Kembali ke Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
