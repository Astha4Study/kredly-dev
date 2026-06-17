import { motion } from 'motion/react';
import GridBorder from '@/components/GridBorder';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Assessment',
    description:
      'AI menganalisis kemampuan melalui test adaptive yang disesuaikan dengan level skill',
    features: ['Adaptive Testing', 'Real-time Scoring', 'Skill Profiling'],
  },
  {
    number: '02',
    title: 'Verification',
    description:
      'Sistem blockchain mencatat hasil assessment dengan timestamp yang tidak dapat diubah',
    features: [
      'Blockchain Timestamping',
      'Cryptographic Signing',
      'Immutable Records',
    ],
  },
  {
    number: '03',
    title: 'Credential',
    description:
      'Digital credential diterbitkan dengan QR code dan link verifikasi publik',
    features: [
      'QR Code Generation',
      'Public Verification',
      'Shareable Portfolio',
    ],
  },
  {
    number: '04',
    title: 'Integration',
    description:
      'Otomatis terhubung dengan job platforms untuk matching dengan peluang karir',
    features: ['Job Matching', 'Auto-Apply', 'Recruiter Dashboard'],
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative pt-4">
      <GridBorder className="mx-auto w-full max-w-7xl" paddingY="py-8">
        {/* Section header */}
        <div className="mb-16 sm:mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl"
          >
            <Badge variant="default">How It Works</Badge>

            <div className="mt-6 space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                Validasi kemampuan secara objektif dan nyata
              </h2>

              <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                Dapatkan credential terverifikasi berdasarkan kemampuan yang
                benar-benar diuji melalui sistem AI dan blockchain.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Process steps */}
        <div className="space-y-0">
          {PROCESS_STEPS.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              <div className="border-2 max-w-6xl mx-auto border-foreground bg-background p-8 sm:p-12 hover:bg-foreground hover:text-background transition-all duration-300 group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Number */}
                  <div className="lg:col-span-2">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 3 }}
                      className="inline-block"
                    >
                      <div className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-none opacity-20 group-hover:opacity-100 transition-opacity">
                        {step.number}
                      </div>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-10">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
                      {step.title}
                    </h3>

                    <div className="w-20 h-0.5 bg-current mb-6 group-hover:w-40 transition-all duration-300" />

                    <p className="text-base sm:text-lg leading-relaxed mb-6 opacity-70 max-w-3xl">
                      {step.description}
                    </p>

                    {/* Features list */}
                    <div className="flex flex-wrap gap-3">
                      {step.features.map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.1 + i * 0.1,
                          }}
                          className="flex items-center gap-2 px-4 py-2 border border-current text-sm font-medium"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GridBorder>
    </section>
  );
}
