import { AssessmentAnimation } from '@/components/AssessmentAnimation';
import GridBorder from '@/components/GridBorder';
import { OrbitingCirclesAnimation } from '@/components/OrbitingCirclesAnimation';
import { ProfileAnalysisAnimation } from '@/components/ProfileAnalysisAnimation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Workflow } from 'lucide-react';

const steps = [
  {
    id: '01',
    title: 'Analisis Profil',
    desc: 'Kami menganalisis profil Anda untuk memahami keahlian dan pengalaman Anda.',
  },
  {
    id: '02',
    title: 'Pengujian Nyata',
    desc: 'Uji kemampuan Anda melalui simulasi kerja nyata berbasis AI.',
  },
  {
    id: '03',
    title: 'Reputasi Digital',
    desc: 'Terbitkan reputasi digital yang dapat diverifikasi oleh calon pemberi kerja.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="flex items-center px-4 py-4 sm:px-6">
      <GridBorder className="mx-auto w-full max-w-7xl" paddingY="py-6 sm:py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <Badge variant="default" className="shadow-sm">
            <Workflow />
            Bagaimana Kredly Bekerja
          </Badge>

          <div className="mt-4 max-w-3xl space-y-4 md:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Buktikan kemampuanmu melalui pengujian nyata.
            </h2>

            <p className="mx-auto max-w-2xl text-muted-foreground">
              Dapatkan credential terverifikasi berdasarkan kemampuan yang
              benar-benar diuji.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex flex-col items-start border border-zinc-100 bg-white p-4 overflow-hidden shadow-sm',
                  index === 2 &&
                    'md:col-span-2 md:mx-auto md:max-w-md xl:col-span-1 xl:mx-0 xl:max-w-none',
                )}
              >
                <div className="bg-primary text-primary-foreground p-0.5">
                  <span className="text-base font-bold">{step.id}</span>
                </div>

                <h3 className="mt-2 text-left text-lg font-bold">
                  {step.title}
                </h3>

                <p className="mt-1 text-left text-sm text-muted-foreground">
                  {step.desc}
                </p>

                {step.id === '01' && (
                  <div className="relative h-50 w-full">
                    <div className="absolute left-2 top-11">
                      <ProfileAnalysisAnimation />
                    </div>
                  </div>
                )}

                {step.id === '02' && (
                  <div className="relative h-50 w-full">
                    <div className="absolute top-4 md:top-10.5 right-0 h-full w-80">
                      <AssessmentAnimation />
                    </div>
                  </div>
                )}

                {step.id === '03' && (
                  <div className="relative mt-6 h-50 w-full overflow-hidden">
                    <div className="absolute inset-0 h-full">
                      <OrbitingCirclesAnimation />
                    </div>
                    {/* Gradient mask top */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-linear-to-b from-white to-transparent z-10" />
                    {/* Gradient mask bottom */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-white to-transparent z-10" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
