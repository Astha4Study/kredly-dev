import AppTopBar from '@/components/AppTopBar';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/app')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AppTopBar />
      <Outlet />
    </>
  );
}
