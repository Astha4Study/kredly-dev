import { Outlet, createFileRoute } from '@tanstack/react-router';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';

export const Route = createFileRoute('/_public/(landing)')({
  component: LandingLayout,
});

function LandingLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
