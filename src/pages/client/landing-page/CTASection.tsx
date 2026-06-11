import GridBorder from '@/components/GridBorder';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { IntegrationGrid } from '@/components/IntegrationGrid';

export default function CTASection() {
  return (
    <section className="px-4 sm:px-6 pt-4">
      <GridBorder className="mx-auto w-full max-w-7xl">
        <div className="mx-auto bg-white border border-zinc-200 p-8 lg:p-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center py-10">
            {/* Left Content */}
            <div className="space-y-6 max-w-lg">
              <h2 className="text-2xl font-bold tracking-tight lg:text-5xl">
                Buktikan kemampuan, bukan sekadar klaim
              </h2>

              <p className="text-muted-foreground text-base">
                Dapatkan credential terverifikasi yang dipercaya recruiter dan
                perusahaan.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" className="group">
                  Mulai Assessment
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Button>

                <Button size="lg" variant="outline">
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </div>
            {/* Right Grid Icons */}
            <div className="w-full">
              <IntegrationGrid />
            </div>
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
