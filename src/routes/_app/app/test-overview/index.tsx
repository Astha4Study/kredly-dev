import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/app/test-overview/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_app/app/test-overview/"!</div>;
}
