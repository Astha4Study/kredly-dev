import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/app/parse-cv/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Parse CV</h1>
      <p className="text-muted-foreground mt-2">Halaman untuk parsing CV</p>
    </div>
  );
}
