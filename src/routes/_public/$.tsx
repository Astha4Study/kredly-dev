import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { scaleIn, fadeInUpDelayed } from '@/lib/animations';

export const Route = createFileRoute('/_public/$')({
  component: NotFoundComponent,
});

function NotFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center space-y-4">
        <motion.h1 {...scaleIn} className="text-6xl font-bold text-gray-300">
          404
        </motion.h1>
        <motion.h2 {...fadeInUpDelayed(0.2)} className="text-2xl font-semibold">
          Halaman Tidak Ditemukan
        </motion.h2>
        <motion.p
          {...fadeInUpDelayed(0.3)}
          className="text-muted-foreground max-w-md"
        >
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </motion.p>
        <motion.div {...fadeInUpDelayed(0.4)} className="pt-4">
          <Link to="/">
            <Button>Kembali ke Halaman</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
