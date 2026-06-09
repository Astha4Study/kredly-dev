import { AssessmentAnimation } from '@/components/AssasementAnimation';
import GridBorder from '@/components/GridBorder';
import { OrbitingCirclesAnimation } from '@/components/OrbitingCirclesAnimation';
import { ProfileAnalysisAnimation } from '@/components/ProfileAnalysisAnimation';
import { Badge } from '@/components/ui/badge';

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
          <Badge variant="default">Bagaimana Kredly Bekerja</Badge>

          <div className="mt-4 max-w-3xl space-y-8">
            <h2 className="text-3xl font-bold tracking-tight lg:text-5xl">
              Buktikan kemampuanmu melalui
              <span className="text-primary"> pengujian nyata</span>.
            </h2>

            <p className="mx-auto max-w-2xl text-muted-foreground">
              Kredly tidak hanya membaca CV. Kami menganalisis profilmu, menguji
              kemampuan melalui simulasi kerja nyata berbasis AI, lalu
              menerbitkan reputasi digital yang dapat diverifikasi.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-start border border-zinc-100 bg-white p-4"
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
                  <div className="relative mt-6 h-50 w-full overflow-hidden">
                    <ProfileAnalysisAnimation />
                  </div>
                )}

                {step.id === '02' && (
                  <div className="relative mt-6 h-50 w-full overflow-hidden">
                    <AssessmentAnimation />
                  </div>
                )}

                {step.id === '03' && (
                  <div className="relative mt-6 h-50 w-full overflow-hidden">
                    <OrbitingCirclesAnimation />
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
