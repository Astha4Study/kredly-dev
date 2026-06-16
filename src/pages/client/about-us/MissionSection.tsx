import GridBorder from '@/components/GridBorder';
import { motion } from 'motion/react';

const PILLARS = [
  {
    number: '01',
    title: 'Visi',
    content:
      'Menjadi platform verifikasi skill berbasis blockchain yang membantu talenta membangun reputasi digital yang dapat dipercaya secara global.',
  },
  {
    number: '02',
    title: 'Misi',
    content:
      'Menyediakan sistem assessment dan credential yang transparan, akurat, serta mudah diverifikasi oleh perusahaan dan recruiter.',
  },
  {
    number: '03',
    title: 'Nilai',
    content:
      'Kami percaya pada transparansi, inovasi, dan integritas sebagai fondasi dalam membangun kepercayaan di era digital.',
  },
];

export default function MissionSection() {
  return (
    <section className="px-4 pt-4 sm:px-6 ">
      <GridBorder className="mx-auto w-full max-w-7xl" paddingY='py-16 sm:py-24'>
        <div className="grid grid-cols-1 md:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              className="
                group
                relative
                overflow-hidden
                border
                border-zinc-200
                bg-white
                p-8
                sm:p-10
                transition-all
                duration-300
                hover:border-foreground
                hover:bg-foreground
              "
            >
              {/* Background Number */}
              <div className="absolute top-4 right-4 text-7xl sm:text-8xl font-extrabold text-zinc-100 transition-all duration-300 group-hover:text-white/10">
                {pillar.number}
              </div>

              <div className="relative z-10">
                {/* Number */}
                <span className="text-xs font-medium tracking-[0.25em] text-muted-foreground transition-colors duration-300 group-hover:text-white/60">
                  {pillar.number}
                </span>

                {/* Title */}
                <h3 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-white">
                  {pillar.title}
                </h3>

                {/* Divider */}
                <div className="mt-5 h-px w-16 bg-primary/30 transition-colors duration-300 group-hover:bg-white/30" />

                {/* Content */}
                <p className="mt-5 text-sm leading-7 text-muted-foreground transition-colors duration-300 group-hover:text-white/70">
                  {pillar.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </GridBorder>
    </section>
  );
}
