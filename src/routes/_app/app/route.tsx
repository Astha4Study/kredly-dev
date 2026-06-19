import AppTopBar from '@/components/AppTopBar';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AppLayoutProvider, useAppLayout } from '@/contexts/AppLayoutContext';

export const Route = createFileRoute('/_app/app')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppLayoutProvider>
      <RouteContent />
    </AppLayoutProvider>
  );
}

function RouteContent() {
  const { showTopBar } = useAppLayout();

  return (
    <>
      {showTopBar && <AppTopBar />}
      <Outlet />
    </>
  );
}
