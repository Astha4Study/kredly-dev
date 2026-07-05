import { ArrowRight, CircleHelp, MessageCircle } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GridBorder from '@/components/GridBorder';
import { Link } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { fadeInUp, fadeInUpDelayed, scaleIn } from '@/lib/animations';

const faqs = [
  {
    q: 'Apa itu Kredly?',
    a: 'Kredly adalah platform verifikasi kemampuan yang membantu individu membuktikan skill mereka melalui assessment berbasis AI, tantangan praktik, dan credential digital yang dapat diverifikasi.',
  },
  {
    q: 'Apa bedanya Kredly dengan sertifikat biasa?',
    a: 'Sertifikat tradisional hanya menunjukkan bahwa seseorang telah menyelesaikan suatu program. Kredly melengkapi credential dengan bukti kemampuan, hasil assessment, dan verifikasi yang dapat diakses secara publik.',
  },
  {
    q: 'Bagaimana proses verifikasi skill di Kredly?',
    a: 'Pengguna menyelesaikan assessment atau tantangan yang relevan dengan bidangnya. Hasil tersebut kemudian digunakan untuk menghasilkan credential yang merepresentasikan kemampuan yang telah dibuktikan.',
  },
  {
    q: 'Apakah recruiter dapat memverifikasi credential saya?',
    a: 'Ya. Setiap credential memiliki halaman verifikasi yang dapat diakses recruiter atau perusahaan untuk melihat keaslian dan detail pencapaiannya.',
  },
  {
    q: 'Apakah credential Kredly menggunakan blockchain?',
    a: 'Ya. Kredly memanfaatkan teknologi blockchain untuk meningkatkan transparansi, integritas data, dan memastikan credential tidak dapat dimanipulasi.',
  },
  {
    q: 'Siapa yang dapat menggunakan Kredly?',
    a: 'Mahasiswa, fresh graduate, profesional, bootcamp, komunitas, hingga perusahaan yang ingin memvalidasi dan menunjukkan kompetensi secara lebih terpercaya.',
  },
  {
    q: 'Apakah saya bisa membagikan credential ke LinkedIn atau CV?',
    a: 'Tentu. Credential dapat dibagikan melalui tautan publik dan digunakan pada LinkedIn, CV, portofolio, atau platform profesional lainnya.',
  },
  {
    q: 'Apakah Kredly gratis digunakan?',
    a: 'Kredly menyediakan berbagai opsi penggunaan. Detail fitur dan paket dapat disesuaikan dengan kebutuhan individu maupun organisasi.',
  },
];

export default function FAQSection() {
  return (
    <section className="px-4 sm:px-6">
      <GridBorder className="mx-auto w-full max-w-7xl" paddingY="py-6 sm:py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
          <motion.div {...fadeInUp}>
            <Badge variant="default" className="shadow-sm">
              <CircleHelp />
              FAQ
            </Badge>
          </motion.div>

          <div className="mt-4 max-w-3xl space-y-4 md:space-y-8">
            <motion.h2
              {...fadeInUpDelayed(0.1)}
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
            >
              Pertanyaan yang sering ditanyakan
            </motion.h2>
            <motion.p
              {...fadeInUpDelayed(0.2)}
              className="mx-auto max-w-2xl text-muted-foreground"
            >
              Pelajari bagaimana Kredly membantu membuktikan kemampuan melalui
              assessment berbasis AI, sandbox interaktif, dan credential yang
              dapat diverifikasi secara publik.
            </motion.p>
          </div>

          <motion.div {...scaleIn} className="w-full">
            <Accordion type="single" collapsible className="mt-12">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent className="text-left text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
            </Accordion>
          </motion.div>

          <motion.div
            {...fadeInUpDelayed(0.4)}
            className="mt-10 flex flex-col items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-5 sm:flex-row"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center  bg-foreground text-background">
                <MessageCircle className="size-4" />
              </span>
              <div className="flex flex-col leading-tight">
                <p className="text-sm text-left font-medium text-foreground">
                  Masih memiliki pertanyaan?
                </p>
                <p className="text-xs text-muted-foreground">
                  Tim kami siap membantu Anda memahami cara kerja Kredly.
                </p>
              </div>
            </div>
            <Button size="sm" asChild>
              <Link to="chat">
                Ajukan Pertanyaan
                <ArrowRight />
              </Link>
            </Button>
          </motion.div>
        </div>
      </GridBorder>
    </section>
  );
}
