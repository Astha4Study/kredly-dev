import LogoLoop from '@/components/LogoLoop';
import geminiLogo from '@/assets/svg/gemini_wordmark.svg';
import rsbuild from '@/assets/svg/rsbuild.svg';
import grokLightLogo from '@/assets/svg/Grok_wordmark_light.svg';
import GridBorder from '@/components/GridBorder';

const techLogos = [
  { src: geminiLogo, alt: 'Gemini' },
  { src: rsbuild, alt: 'RSBuild' },
  { src: grokLightLogo, alt: 'Grok Light' },
];

export default function LogoLoopSection() {
  return (
    <section className="relative flex justify-center items-center px-4 sm:px-6 py-6 pb-10 sm:py-6 sm:pb-10">
      <GridBorder className="w-full mx-auto max-w-7xl">
        <div className="relative w-full p-1 sm:p-2">
          <div className="flex px-8 items-center gap-8">
            <div className="shrink-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Menggunakan
              </p>

              <p className="font-semibold">Teknologi AI Modern</p>
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="min-w-0 flex-1">
              <LogoLoop
                logos={techLogos}
                speed={50}
                direction="left"
                logoHeight={40}
                gap={60}
                hoverSpeed={0}
                fadeOut
                fadeOutColor="#f4f4f5"
                ariaLabel="Technology partners"
              />
            </div>
          </div>
        </div>
      </GridBorder>
    </section>
  );
}
