import { Button } from '@/components/ui/button';
import GoogleIcon from '@/assets/svg/google.svg';
import GridBorder from '@/components/GridBorder';
import HeroCard from '../../../components/HeroCard';

export default function HeroSection() {
  return (
    <section className="relative flex items-center px-4 sm:px-6">
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
              <div className="max-w-xl z-10">
                <div className="space-y-6">
                  <h1 className="text-2xl sm:text-3xl font-bold leading-tight sm:leading-13 tracking-tight text-foreground md:text-4xl lg:text-5xl">
                    Ubah CV menjadi{' '}
                    <span className="text-primary">reputasi digital </span> yang
                    terpercaya.
                  </h1>

                  <p className="max-w-lg text-sm sm:text-base leading-relaxed text-muted-foreground">
                    CV menunjukkan pengalaman. Kredly menguji kemampuanmu
                    melalui live sandbox berbasis AI dan mengubah hasilnya
                    menjadi reputasi digital terverifikasi.
                  </p>

                  <div className="max-w-lg space-y-3">
                    <Button size="lg" className="w-full text-white">
                      Mulai Sekarang
                    </Button>

                    <Button variant="outline" size="lg" className="w-full">
                      <img src={GoogleIcon} alt="Google" className="size-4" />
                      Lanjutkan dengan Google
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-6 sm:gap-8">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold">10K+</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Assessment
                      </p>
                    </div>

                    <div>
                      <p className="text-xl sm:text-2xl font-bold">500+</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Kredensial
                      </p>
                    </div>

                    <div>
                      <p className="text-xl sm:text-2xl font-bold">99.9%</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Terverifikasi
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT - Animated Card Component */}
              <HeroCard />
            </div>
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
