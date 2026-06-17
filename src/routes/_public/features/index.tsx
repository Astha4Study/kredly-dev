import { createFileRoute } from '@tanstack/react-router';
import InfiniteScrollSection from '@/pages/client/features/InfiniteScrollSection';
import HowItWorksSection from '@/pages/client/features/HowItWorksSection';
import CTASection from '@/pages/client/landing-page/CTASection';
import CoreFeaturesSection from '@/pages/client/features/CoreFeaturesSection';
import HeroSection from '@/pages/client/features/HeroSection';

export const Route = createFileRoute('/_public/features/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="overflow-x-clip">
      <HeroSection />
      <CoreFeaturesSection />
      <InfiniteScrollSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
}
