import GridBorder from '@/components/GridBorder';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { Brain, Blocks, ShieldCheck, ScanSearch } from 'lucide-react';

const highlights = [
  {
    icon: <Brain className="size-5" />,
    title: 'AI Assessment',
    description: 'Evaluasi kemampuan berbasis AI.',
  },
  {
    icon: <Blocks className="size-5" />,
    title: 'Live Sandbox',
    description: 'Bukti keterampilan melalui praktik nyata.',
  },
  {
    icon: <ShieldCheck className="size-5" />,
    title: 'Blockchain Credential',
    description: 'Credential aman dan tidak dapat dimanipulasi.',
  },
  {
    icon: <ScanSearch className="size-5" />,
    title: 'Public Verification',
    description: 'Dapat diverifikasi kapan saja oleh recruiter.',
  },
];

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

            {/* Soft blur accents */}
            <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

            <div className="relative px-6 py-10 sm:px-10 sm:py-14 md:px-14 md:py-20">
              <div className="max-w-sm sm:max-w-md md:max-w-xl lg:max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge variant="secondary">Tentang Kredly</Badge>
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
                  Membangun masa depan{' '}
                  <span className="text-primary">verifikasi kemampuan</span>{' '}
                  yang lebih terpercaya
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.5,
                  }}
                  className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                  Kredly hadir untuk membantu individu membangun reputasi
                  digital yang terpercaya melalui assessment berbasis AI,
                  tantangan praktik nyata, dan credential berbasis blockchain
                  yang dapat diverifikasi secara publik.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.5,
                }}
                className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="
                      group
                      relative
                      overflow-hidden
                      border
                      border-zinc-200
                      bg-white
                      p-5
                      transition-all
                      duration-300
                      shadow-sm
                      hover:border-primary/30
                      hover:shadow-md
                    "
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-primary scale-y-0 origin-top transition-transform duration-300 group-hover:scale-y-100" />

                    <div className="flex items-center gap-4">
                      <div
                        className="
                        flex
                        size-10
                        shrink-0
                        items-center
                        justify-center
                        border
                        border-primary/15
                        bg-primary/5
                        text-primary
                      "
                      >
                        {item.icon}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground">
                          {item.title}
                        </h3>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
