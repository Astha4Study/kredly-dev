import { motion } from 'motion/react';
import GridBorder from '@/components/GridBorder';
import { Brain, Shield, Zap, Eye, Target, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Assessment',
    description:
      'Machine learning yang menganalisis skill secara mendalam dengan akurasi tinggi',
  },
  {
    icon: Shield,
    title: 'Blockchain Verified',
    description:
      'Credential tersimpan di blockchain yang tidak dapat dimanipulasi',
  },
  {
    icon: Zap,
    title: 'Real-time Validation',
    description: 'Verifikasi instan yang dapat diakses kapan saja, dimana saja',
  },
  {
    icon: Eye,
    title: 'Public Transparency',
    description:
      'Semua credential dapat diverifikasi secara publik dengan QR code',
  },
  {
    icon: Target,
    title: 'Skill Matching',
    description:
      'AI yang mencocokkan skill dengan job requirements secara otomatis',
  },
  {
    icon: Cpu,
    title: 'Live Sandbox',
    description:
      'Testing environment untuk membuktikan kemampuan coding secara real-time',
  },
];

export default function CoreFeaturesSection() {
  return (
    <section className="flex items-center px-4 py-4 sm:px-6">
      <GridBorder className="mx-auto w-full max-w-7xl" paddingY="py-6 sm:py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <Badge variant="default" className="shadow-sm">
            Fitur Utama
          </Badge>

          <div className="mt-4 max-w-3xl space-y-4 md:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Teknologi yang membuat perbedaan
            </h2>

            <p className="mx-auto max-w-2xl text-muted-foreground">
              Kombinasi AI, blockchain, dan real-time assessment yang mengubah
              cara dunia memverifikasi skill profesional.
            </p>
          </div>

          <div className="mt-10 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                  }}
                  className="
                  group
                  relative
                  overflow-hidden
                  border
                  border-zinc-200
                  bg-white
                  p-8
                  flex
                  items-center
                  justify-center
                  text-center
                  transition-all
                  duration-500
                  ease-out
                  hover:-translate-y-1
                  hover:border-zinc-900
                  hover:bg-zinc-900
                  hover:shadow-xl
                "
                >
                  {/* Background Icon */}
                  <Icon
                    className="
                    absolute
                    -right-8
                    -bottom-8
                    size-36
                    text-zinc-100
                    transition-all
                    duration-500
                    ease-out
                    group-hover:scale-110
                    group-hover:text-white/10
                  "
                    strokeWidth={1.2}
                  />

                  {/* Content */}
                  <div className="relative z-10 max-w-xs">
                    <h3
                      className="
                      text-xl
                      font-semibold
                      tracking-tight
                      text-foreground
                      transition-colors
                      duration-500
                      ease-out
                      group-hover:text-white
                    "
                    >
                      {feature.title}
                    </h3>

                    <p
                      className="
                      mt-4
                      text-sm
                      leading-relaxed
                      text-muted-foreground
                      transition-colors
                      duration-500
                      ease-out
                      group-hover:text-zinc-300
                    "
                    >
                      {feature.description}
                    </p>
                  </div>

                  {/* Accent Line */}
                  <div
                    className="
                    absolute
                    bottom-0
                    left-0
                    h-1
                    w-0
                    bg-primary
                    transition-all
                    duration-500
                    ease-out
                    group-hover:w-full
                  "
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
