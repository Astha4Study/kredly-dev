import AppTopBar from '@/components/AppTopBar';
import { AppLayoutProvider, useAppLayout } from '@/contexts/app-layout';
import { createFileRoute, Outlet } from '@tanstack/react-router';

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
