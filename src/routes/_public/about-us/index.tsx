import { createFileRoute } from '@tanstack/react-router';
import HeroSection from '@/pages/client/about-us/HeroSection';
import MissionSection from '@/pages/client/about-us/MissionSection';
import TeamSection from '@/pages/client/about-us/TeamSection';

export const Route = createFileRoute('/_public/about-us/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="overflow-x-clip">
      <HeroSection />
      <MissionSection />
      <TeamSection />
    </div>
  );
}
