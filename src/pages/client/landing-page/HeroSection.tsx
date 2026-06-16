import { Button } from '@/components/ui/button';
import GridBorder from '@/components/GridBorder';
import HeroCard from '../../../components/HeroCard';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function HeroSection() {
  return (
    <section className="relative flex items-center -mt-4 px-4 sm:px-6 md:mt-0">
      <GridBorder className="w-full mx-auto max-w-7xl">
        <div className="relative w-full p-1 sm:p-2">
          <div className="border border-zinc-200 bg-white">
            <div className="relative grid items-center gap-8 sm:gap-12 overflow-hidden px-6 py-10 sm:px-10 md:px-14 sm:py-14 md:py-20 lg:grid-cols-2">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                linear-gradient(to right, #e4e4e7 1px, transparent 1px),
                linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)
                `,
                  backgroundSize: '80px 80px',
                }}
              />
              {/* LEFT */}
              <div className="z-10 max-w-xl">
                <div className="space-y-6 text-center py-4 md:py-0 md:text-left">
                  <Badge variant="default">
                    AI-Powered Skill Verification Platform
                  </Badge>

                  <div className="max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
                    <h1 className="text-2xl sm:text-3xl font-bold xl:leading-13 tracking-tight text-foreground md:text-4xl lg:text-5xl">
                      Buktikan kemampuanmu dengan{' '}
                      <span className="text-primary">
                        reputasi digital terverifikasi
                      </span>
                    </h1>

                    <p className="mt-4 max-w-xs sm:max-w-md md:max-w-lg text-xs leading-relaxed text-muted-foreground sm:text-base">
                      CV menunjukkan pengalaman. Kredly membuktikan kemampuan
                      melalui assessment berbasis AI dan live sandbox yang
                      menghasilkan kredensial digital yang dapat dipercaya.
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center md:justify-start">
                    <Button size="lg" className="px-8 text-white">
                      <Link
                        to="/login"
                        className="flex items-center justify-center gap-2"
                      >
                        Mulai Validasi Skill
                      </Link>
                    </Button>

                    <Link
                      to="/about"
                      className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Lihat Cara Kerja
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap justify-center gap-6 pt-2 sm:gap-8 md:justify-start">
                    <div>
                      <p className="text-xl font-bold sm:text-2xl">10K+</p>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        Assessment
                      </p>
                    </div>

                    <div>
                      <p className="text-xl font-bold sm:text-2xl">500+</p>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        Kredensial
                      </p>
                    </div>

                    <div>
                      <p className="text-xl font-bold sm:text-2xl">99.9%</p>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        Terverifikasi
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT - Animated Card Component */}
              <div className="relative">
                <HeroCard />
              </div>
            </div>
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
