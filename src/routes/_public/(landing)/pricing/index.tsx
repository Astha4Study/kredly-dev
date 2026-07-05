import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import GridBorder from '@/components/GridBorder';
import { motion } from 'motion/react';
import { fadeInUp, fadeInUpDelayed, createStaggerAnimation } from '@/lib/animations';

export const Route = createFileRoute('/_public/(landing)/pricing/')({
  component: RouteComponent,
});

interface TopupPackage {
  name: string;
  credits: number;
  price: string;
  priceNumeric: number;
  pricePerCredit: string;
  bonus?: number;
  popular?: boolean;
}

const topupPackages: TopupPackage[] = [
  {
    name: 'Starter',
    credits: 5,
    price: 'Rp 25.000',
    priceNumeric: 25000,
    pricePerCredit: 'Rp 5.000/kredit',
  },
  {
    name: 'Explorer',
    credits: 20,
    price: 'Rp 79.000',
    priceNumeric: 79000,
    pricePerCredit: 'Rp 3.950/kredit',
  },
  {
    name: 'Career',
    credits: 50,
    price: 'Rp 149.000',
    priceNumeric: 149000,
    pricePerCredit: 'Rp 2.980/kredit',
    popular: true,
  },
  {
    name: 'Pro',
    credits: 100,
    price: 'Rp 249.000',
    priceNumeric: 249000,
    pricePerCredit: 'Rp 2.490/kredit',
  },
];

const features = [
  '1 kredit = 1 asesmen lengkap',
  '5 kredit = sertifikat blockchain',
  'Kredit tidak kedaluwarsa',
  'Akses ke semua skill assessment',
  'Sertifikat terverifikasi blockchain',
  'Laporan detail kemampuan',
];

function RouteComponent() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  const handleSelectPackage = (pkg: TopupPackage) => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }

    navigate({
      to: '/app/checkout',
      search: {
        credits: pkg.credits,
      },
    });
  };

  return (
    <div className="min-h-screen">
      <section className="px-4 sm:px-6 pt-4">
        <GridBorder
          className="mx-auto w-full max-w-7xl"
          paddingY="py-6 sm:py-8"
        >
          <div className="mx-auto flex  flex-col items-center text-center">
            <div className="max-w-6xl">
            <motion.div {...fadeInUp}>
              <Badge variant="default" className="shadow-sm">
                <Coins />
                Paket Kredit
              </Badge>
            </motion.div>

            <div className="mt-4 max-w-3xl space-y-4 md:space-y-8">
              <motion.h2
                {...fadeInUpDelayed(0.1)}
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
              >
                Pilih paket yang sesuai dengan{' '}
                <span className="text-primary">kebutuhanmu</span>
              </motion.h2>

              <motion.p
                {...fadeInUpDelayed(0.2)}
                className="mx-auto max-w-2xl text-muted-foreground"
              >
                Dapatkan kredit untuk mengakses assessment berbasis AI dan
                dapatkan sertifikat terverifikasi blockchain
              </motion.p>
              </div>
            </div>

            <div className="mt-12 w-full">
              <div className="border bg-background">
                <div className="relative overflow-hidden p-6 md:p-10">
                  {/* Grid Background */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, rgb(228 228 231 / .8) 1px, transparent 1px),
                        linear-gradient(to bottom, rgb(228 228 231 / .8) 1px, transparent 1px)
                      `,
                      backgroundSize: '72px 72px',
                    }}
                  />

                  <div className="relative z-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {topupPackages.map((pkg, index) => (
                      <motion.div
                        key={pkg.credits}
                        {...createStaggerAnimation(index)}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className={cn(
                          'relative flex flex-col border bg-background transition-colors overflow-hidden',
                          pkg.popular
                            ? 'border-primary'
                            : 'border-border hover:border-foreground/20',
                        )}
                      >
                        {/* Popular Badge Strip */}
                        {pkg.popular && (
                          <div className="w-full bg-primary px-4 py-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                              Paling Populer
                            </span>
                          </div>
                        )}

                        <div className="flex flex-1 flex-col p-6">
                          {/* Package */}
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {pkg.name}
                            </p>

                            <div className="mt-6 flex items-end gap-2">
                              <span className="text-5xl font-bold tracking-tight">
                                {pkg.credits}
                              </span>

                              <span className="pb-1 text-sm text-muted-foreground">
                                kredit
                              </span>
                            </div>

                            <div className="mt-6">
                              <div className="text-3xl font-bold">
                                {pkg.price}
                              </div>

                              <p className="mt-1 text-sm text-muted-foreground">
                                {pkg.pricePerCredit}
                              </p>
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="my-6 border-t" />

                          {/* Features */}
                          <div className="flex-1 space-y-3">
                            {features.slice(0, 4).map((feature) => (
                              <div
                                key={feature}
                                className="flex items-start gap-3"
                              >
                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border">
                                  <Check className="h-3.5 w-3.5" />
                                </div>

                                <span className="text-sm text-start leading-6 text-muted-foreground">
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* CTA */}
                          <Button
                            onClick={() => handleSelectPackage(pkg)}
                            disabled={isLoading}
                            className={cn(
                              'mt-8 h-11 w-full rounded-none',
                              pkg.popular
                                ? 'bg-primary hover:bg-primary/90'
                                : 'bg-foreground text-background hover:bg-foreground/90',
                            )}
                          >
                            {isLoading
                              ? 'Loading...'
                              : isAuthenticated
                                ? 'Pilih Paket'
                                : 'Login & Pilih Paket'}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GridBorder>
      </section>
    </div>
  );
}
