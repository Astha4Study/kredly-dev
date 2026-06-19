import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAppLayout } from '@/contexts/AppLayoutContext';
import AppTopbarAssessment from '@/components/AppTopbarAssessment';

export const Route = createFileRoute('/_app/app/assessment/$assessmentId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { setShowTopBar } = useAppLayout();

  useEffect(() => {
    setShowTopBar(false);
    return () => setShowTopBar(true);
  }, [setShowTopBar]);

  return (
    <>
      <AppTopbarAssessment />
      <Outlet />
    </>
  );
}
