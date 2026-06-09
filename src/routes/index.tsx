import BenefitsSection from '@/pages/client/landing-page/BenefitsSection';
import HeroSection from '@/pages/client/landing-page/HeroSection';
import HowItWorksSection from '@/pages/client/landing-page/HowItWorksSection';
import WhyTrustUsSection from '@/pages/client/landing-page/WhyTrustUsSection';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col overflow-x-clip">
      <HeroSection />
      <HowItWorksSection />
      <BenefitsSection />
      <WhyTrustUsSection />
    </div>
  );
}
