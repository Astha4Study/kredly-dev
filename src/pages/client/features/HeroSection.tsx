import { motion } from 'motion/react';
import GridBorder from '@/components/GridBorder';
import { Badge } from '@/components/ui/badge';
import { OrbitingCirclesFeaturesAnimation } from '@/components/OrbitingCirclesFeaturesAnimation';

export default function HeroSection() {
  return (
    <section className="relative flex items-center -mt-4 px-4 sm:px-6 md:mt-0">
      <GridBorder className="mx-auto w-full max-w-7xl">
        <div className="relative w-full p-1 sm:p-2">
          <div className="relative overflow-hidden border border-zinc-200 bg-white">
            {/* Background Grid */}
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

            <div className="relative overflow-visible px-6 py-10 sm:px-10 sm:py-14 md:px-14 md:py-20 min-h-125">
              <div className="max-w-sm sm:max-w-md md:max-w-xl lg:max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge variant="secondary">Fitur Utama</Badge>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1,
                    duration: 0.5,
                  }}
                  className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
                >
                  Teknologi yang{' '}
                  <span className="text-primary">membuat perbedaan</span> dalam
                  verifikasi skill
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.5,
                  }}
                  className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                  Kombinasi AI, blockchain, dan real-time assessment yang
                  mengubah cara dunia memverifikasi skill profesional. Dari
                  assessment hingga credential yang dapat dipercaya.
                </motion.p>
              </div>
              <div className="absolute -top-50 -right-70 -translate-y-1/2 h-100 w-200 hidden lg:block pointer-events-none">
                <OrbitingCirclesFeaturesAnimation />
              </div>
            </div>
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
