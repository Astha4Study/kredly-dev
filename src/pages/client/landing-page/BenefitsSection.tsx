import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

import GridBorder from '@/components/GridBorder';
import { Badge } from '@/components/ui/badge';
import { SertificationValidationAnimation } from '@/components/SertificationValidationAnimation';
import { AiEvaluationAnimation } from '@/components/AiEvaluationAnimation';
import { AssessmentInteractiveAnimation } from '@/components/AssessmentInteractiveAnimation';
import { AccelerationCareerAnimation } from '@/components/AccelerationCareerAnimation';
import { AnimatePresence, motion } from 'motion/react';

const benefits = [
  {
    title: 'Assessment Interaktif',
    description:
      'Uji kemampuan melalui simulasi yang menyerupai situasi kerja nyata.',
    visual: <AssessmentInteractiveAnimation />,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/50',
  },
  {
    title: 'Evaluasi Berbasis AI',
    description: 'AI menilai hasil secara objektif dan konsisten.',
    visual: <AiEvaluationAnimation />,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/50',
  },
  {
    title: 'Sertifikat Terverifikasi',
    description:
      'Dapatkan sertifikat digital berdasarkan kemampuan yang telah diuji.',
    visual: <SertificationValidationAnimation />,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/50',
  },
  {
    title: 'Akselerasi Karier',
    description: 'Perkuat profil profesional dan temukan peluang yang relevan.',
    visual: <AccelerationCareerAnimation />,
    color: 'from-orange-500/20 to-amber-500/20',
    borderColor: 'border-orange-500/50',
  },
];

export default function BenefitsSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % benefits.length);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const currentBenefit = benefits[active];

  if (!currentBenefit) return null;

  return (
    <section className="px-4 sm:px-6">
      <GridBorder className="mx-auto w-full max-w-7xl" paddingY="py-6 sm:py-8">
        <div className="mx-auto flex w-full flex-col items-center text-center">
          <Badge>Manfaat Menggunakan Kredly</Badge>

          <div className="mt-4 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight lg:text-5xl">
              Validasi kemampuan secara objektif dan nyata
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Dapatkan credential terverifikasi berdasarkan kemampuan yang
              benar-benar diuji.
            </p>
          </div>

          <div className="mt-12 w-full overflow-hidden rounded-xl border border-zinc-200 bg-background shadow-sm">
            {/* Loading Progress Bar */}
            <div className="relative h-0.5 w-full bg-zinc-100">
              <motion.div
                key={`progress-${active}`}
                className="absolute left-0 top-0 h-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 15,
                  ease: 'linear',
                }}
              />
            </div>

            {/* Visual */}
            <div className="relative border-b overflow-hidden p-4 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                    filter: 'blur(10px)',
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px)',
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.05,
                    filter: 'blur(10px)',
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="flex h-80 items-center justify-center"
                >
                  {currentBenefit.visual}
                </motion.div>
              </AnimatePresence>

              {/* Gradient Background */}
              <motion.div
                key={`bg-${active}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className={cn(
                  'absolute inset-0 -z-10 bg-linear-to-br',
                  currentBenefit.color,
                )}
              />
            </div>

            {/* Feature Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit, index) => (
                <button
                  key={benefit.title}
                  onClick={() => setActive(index)}
                  className={cn(
                    'relative p-6 text-left transition-all duration-500',
                    'border-b md:border-b-0',
                    index !== benefits.length - 1 && 'md:border-r',
                    active === index
                      ? 'bg-primary/5 border-primary/20'
                      : 'hover:bg-zinc-50/50',
                  )}
                >
                  {/* Active Indicator Top */}
                  {active === index && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute left-0 top-0 h-1 w-full bg-primary"
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  <div className="flex flex-col gap-2">
                    <motion.span
                      animate={{
                        color:
                          active === index
                            ? 'hsl(var(--primary))'
                            : 'rgb(113, 113, 122)',
                      }}
                      transition={{ duration: 0.3 }}
                      className="text-xl font-bold"
                    >
                      0{index + 1}
                    </motion.span>

                    <motion.h3
                      animate={{
                        color:
                          active === index
                            ? 'hsl(var(--primary))'
                            : 'rgb(113, 113, 122)',
                      }}
                      transition={{ duration: 0.3 }}
                      className="font-semibold text-base"
                    >
                      {benefit.title}
                    </motion.h3>
                  </div>

                  <motion.p
                    animate={{
                      opacity: active === index ? 1 : 0.7,
                    }}
                    transition={{ duration: 0.3 }}
                    className="mt-1 text-sm text-muted-foreground"
                  >
                    {benefit.description}
                  </motion.p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
