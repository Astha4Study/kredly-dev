import GridBorder from '@/components/GridBorder';
import { WhyTrustUsCard } from '@/components/WhyTrustUsCard';
import {
  Brain,
  ShieldCheck,
  Briefcase,
  BadgeCheck,
  Fingerprint,
  FileCheck,
} from 'lucide-react';

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
  {
    icon: <Fingerprint />,
    title: 'Anti Pemalsuan',
    description:
      'Setiap credential memiliki identitas unik sehingga keasliannya dapat diverifikasi dan tidak mudah dipalsukan.',
  },
  {
    icon: <FileCheck />,
    title: 'Berbasis Bukti',
    description:
      'Hasil penilaian didukung oleh data assessment dan aktivitas yang terdokumentasi, bukan opini subjektif.',
  },
];

export default function WhyTrustUsSection() {
  return (
    <section className="px-4 sm:px-6">
      <GridBorder className="mx-auto w-full max-w-7xl" paddingY="py-6 sm:py-12">
        <div className="mx-auto max-w-5xl flex flex-col items-center text-center">
          <div className="mt-4 max-w-3xl space-y-8">
            <h2 className="text-2xl font-bold tracking-tight lg:text-4xl">
              ...Dan masih banyak lagi
            </h2>
          </div>
        </div>

        <div className="mt-12 max-w-6xl mx-auto overflow-hidden bg-zinc-100/50">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {trustFactors.map((feature) => (
              <WhyTrustUsCard feature={feature} key={feature.title} />
            ))}
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
