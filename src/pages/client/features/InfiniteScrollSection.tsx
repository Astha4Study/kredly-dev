import GridBorder from '@/components/GridBorder';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { motion } from 'motion/react';

const TECH_ITEMS = [
  'BLOCKCHAIN VERIFIED',
  'AI POWERED',
  'REAL-TIME VALIDATION',
  'DECENTRALIZED',
  'SMART CONTRACTS',
  'LIVE ASSESSMENT',
];

export default function InfiniteScrollSection() {
  return (
    <section className="relative">
      <GridBorder className="mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden">
          {/* Blur */}
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative">
            {/* Top Marquee */}
            <div className="overflow-hidden border-y border-zinc-200 py-5">
              <motion.div
                className="flex whitespace-nowrap"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  duration: 35,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {[...TECH_ITEMS, ...TECH_ITEMS].map((item, i) => (
                  <span
                    key={i}
                    className="mx-8 text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase"
                  >
                    {item}
                  </span>
                ))}
              </motion.div>

              <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-linear-to-r from-zinc-100/50 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-linear-to-l from-zinc-100/50 to-transparent" />
            </div>

            {/* Center */}
            <div className="relative py-24 text-center sm:py-32">
              {/* Giant Watermark */}
              <span
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  -translate-x-1/2
                  -translate-y-1/2
                  whitespace-nowrap
                  text-[80px]
                  font-bold
                  tracking-tight
                  text-zinc-100
                  sm:text-[140px]
                  lg:text-[180px]
                "
              >
                TRUST
              </span>

              <Badge variant="default"><Building2 /> Enterprise Technology</Badge>

              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="
                  relative
                  z-10
                  mx-auto
                  mt-6
                  max-w-4xl
                  text-4xl
                  font-semibold
                  tracking-tight
                  sm:text-5xl
                  md:text-6xl
                "
              >
                Teknologi yang
                <span className="text-primary"> dapat dipercaya </span>
                oleh recruiter modern
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.1,
                  duration: 0.5,
                }}
                className="
                  relative
                  z-10
                  mx-auto
                  mt-6
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-muted-foreground
                  sm:text-base
                "
              >
                Menggabungkan AI, blockchain, dan sistem verifikasi real-time
                untuk memastikan setiap credential memiliki tingkat kepercayaan
                yang lebih tinggi dibandingkan sertifikat tradisional.
              </motion.p>

              <div className="mx-auto mt-10 h-px w-24 bg-primary/30" />
            </div>

            {/* Bottom Marquee */}
            <div className="overflow-hidden border-y border-zinc-200 py-5">
              <motion.div
                className="flex whitespace-nowrap"
                animate={{ x: ['-50%', '0%'] }}
                transition={{
                  duration: 35,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {[...TECH_ITEMS, ...TECH_ITEMS].map((item, i) => (
                  <span
                    key={i}
                    className="mx-8 text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase"
                  >
                    {item}
                  </span>
                ))}
              </motion.div>

              <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-linear-to-r from-zinc-100/50 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-linear-to-l from-zinc-100/50 to-transparent" />
            </div>
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
