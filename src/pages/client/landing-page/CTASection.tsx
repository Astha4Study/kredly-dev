import GridBorder from '@/components/GridBorder';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { IntegrationGrid } from '@/components/IntegrationGrid';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { slideInLeft, slideInRight } from '@/lib/animations';

export default function CTASection() {
  return (
    <section className="px-4 sm:px-6 pt-4">
      <GridBorder className="mx-auto w-full max-w-7xl">
        <div className="mx-auto bg-white border border-zinc-200 p-6 sm:p-8 lg:p-12">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 items-center py-4 sm:py-5 md:py-10">
            {/* Left Content */}
            <motion.div
              {...slideInLeft}
              className="text-center lg:text-left space-y-4 sm:space-y-5 max-w-lg mx-auto lg:mx-0"
            >
              <Badge variant="secondary">Bukti Skill yang Terverifikasi</Badge>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight md:leading-13">
                Buktikan kemampuan, bukan sekadar klaim
              </h2>

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Dapatkan credential terverifikasi yang dipercaya recruiter dan
                perusahaan.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3 sm:gap-4 pt-2">
                <Button size="lg" className="group w-full sm:w-auto">
                  Mulai Assessment
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </motion.div>
            {/* Right Grid Icons */}
            <motion.div {...slideInRight} className="w-full mt-4 lg:mt-0">
              <IntegrationGrid />
            </motion.div>
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
