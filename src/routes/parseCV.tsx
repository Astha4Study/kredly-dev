import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/parseCV')({
  beforeLoad: () => {
    throw redirect({ to: '/app/new-assessment/upload-cv' });
  },
});
