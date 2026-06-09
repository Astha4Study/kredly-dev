import GridBorder from '@/components/GridBorder';
import { Badge } from '@/components/ui/badge';
import { WhyTrustUsCard } from '@/components/WhyTrustUsCard';
import { Brain, ShieldCheck, Briefcase, BadgeCheck } from 'lucide-react';

const trustFactors = [
  {
    icon: <Brain />,
    title: 'Penilaian Objektif',
    description:
      'Kemampuan dinilai berdasarkan hasil pengujian dan performa nyata, bukan sekadar klaim dalam CV.',
  },
  {
    icon: <Briefcase />,
    title: 'Simulasi Dunia Kerja',
    description:
      'Assessment dirancang menyerupai tantangan yang relevan dengan kebutuhan industri dan pekerjaan sesungguhnya.',
  },
  {
    icon: <ShieldCheck />,
    title: 'Credential Terverifikasi',
    description:
      'Setiap credential memiliki identitas unik yang dapat diverifikasi secara online kapan saja.',
  },
  {
    icon: <BadgeCheck />,
    title: 'Mudah Dibagikan',
    description:
      'Bagikan hasil validasi dan reputasi digital Anda kepada recruiter, perusahaan, atau klien.',
  },
];

export default function WhyTrustUsSection() {
  return (
    <section className="px-4 sm:px-6">
      <GridBorder className="mx-auto w-full max-w-7xl" paddingY="py-6 sm:py-12">
        <div className="mx-auto max-w-5xl flex flex-col items-center text-center">
          <Badge>Mengapa Kredly Dipercaya?</Badge>

          <div className="mt-4 max-w-3xl space-y-8">
            <h2 className="text-3xl font-bold tracking-tight lg:text-5xl">
              Dibangun untuk validasi kemampuan yang transparan
            </h2>

            <p className="mx-auto max-w-2xl text-muted-foreground">
              Kredly membantu perusahaan dan recruiter memahami kemampuan
              kandidat melalui pengujian yang objektif, terukur, dan dapat
              diverifikasi.
            </p>
          </div>
        </div>

        <div className="mt-10 overflow-hidden bg-zinc-100/50">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {trustFactors.map((feature) => (
              <WhyTrustUsCard feature={feature} key={feature.title} />
            ))}
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
