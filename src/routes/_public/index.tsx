import BenefitsSection from '@/pages/client/landing-page/BenefitsSection';
import CTASection from '@/pages/client/landing-page/CTASection';
import FAQSection from '@/pages/client/landing-page/FAQSection';
import HeroSection from '@/pages/client/landing-page/HeroSection';
import HowItWorksSection from '@/pages/client/landing-page/HowItWorksSection';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="overflow-x-clip">
      <HeroSection />
      <HowItWorksSection />
      <BenefitsSection />
      <CTASection />
      <FAQSection />
    </div>
  );
}
