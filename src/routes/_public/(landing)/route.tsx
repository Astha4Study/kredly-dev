import { Outlet, createFileRoute } from '@tanstack/react-router';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';

export const Route = createFileRoute('/_public/(landing)')({
  component: LandingLayout,
});

function LandingLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
