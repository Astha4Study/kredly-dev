import GridBorder from '@/components/GridBorder';
import { Badge } from '@/components/ui/badge';
import { ValidationAnimation } from '@/components/ValidationAnimation';
import { AIAnimation } from '@/components/AiAnimation';
import { CredentialAnimation } from '@/components/CredentialAnimation';
import { TrustAnimation } from '@/components/TrustAnimation';

const benefits = [
  {
    title: 'Validasi Nyata, Bukan Klaim',
    description:
      'Kemampuan Anda diuji melalui simulasi dan tugas yang relevan dengan dunia kerja, bukan hanya berdasarkan informasi pada CV.',
    visual: <ValidationAnimation />,
  },
  {
    title: 'Penilaian Berbasis AI',
    description:
      'AI membantu mengevaluasi hasil secara konsisten dan objektif sehingga proses validasi menjadi lebih terukur.',
    visual: <AIAnimation />,
  },
  {
    title: 'Reputasi Digital Terverifikasi',
    description:
      'Bangun reputasi profesional yang dapat dibagikan dan diverifikasi oleh perusahaan maupun recruiter.',
    visual: <CredentialAnimation />,
  },
  {
    title: 'Meningkatkan Kepercayaan Recruiter',
    description:
      'Tunjukkan bukti kompetensi yang lebih meyakinkan sehingga recruiter dapat menilai kemampuan Anda dengan lebih cepat.',
    visual: <TrustAnimation />,
  },
];

export default function BenefitsSection() {
  return (
    <section className="px-4 sm:px-6">
      <GridBorder
        className="mx-auto w-full max-w-7xl"
        paddingY="py-6 sm:py-8"
        mergeBelow
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
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

          <div className="mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => {
              return (
                <div
                  key={benefit.title}
                  className="overflow-hidden border border-zinc-200 bg-background"
                >
                  <div className="p-6">
                    <h3 className="text-lg text-left font-semibold">
                      {benefit.title}
                    </h3>

                    <p className="mt-1.5 text-sm text-left leading-relaxed text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>

                  <div className="border-t bg-zinc-50 p-4">
                    <div className="flex h-43 items-center justify-center">
                      {benefit.visual}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
