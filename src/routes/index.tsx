import HeroSection from '@/pages/client/landing-page/HeroSection';
import LogoLoopSection from '@/pages/client/landing-page/LogoLoopSection';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <LogoLoopSection />
    </div>
  );
}
