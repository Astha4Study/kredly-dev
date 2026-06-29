import IllustrationCetha from '@/assets/images/illustration-cetha.png';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function JobsBanner() {
  return (
    <div className="relative h-50 overflow-hidden border border-border bg-card">
      {/* Background Image */}
      <img
        src={IllustrationCetha}
        alt="Jobs Banner"
        className="absolute inset-0 left-70 top-5 h-full w-full object-contain"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/70 to-background/20" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center px-8">
        <div className="max-w-lg space-y-2">
          <Badge variant="outline">AI Job Matching</Badge>

          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dapatkan <span className="text-[#f59e0b]">Kerja Lebih Cepat</span>
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Optimalkan CV Anda dengan AI dan tingkatkan peluang diterima kerja.
            Temukan kekuatan profil Anda dan raih peluang karier yang lebih
            baik.
          </p>

          <Button
            size="sm"
            className="mt-2 bg-[#2563eb] text-white hover:bg-[#1e40af]!"
            asChild
          >
            <a
              href="https://cetha.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Coba Cetha Gratis
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
