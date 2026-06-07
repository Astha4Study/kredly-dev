import { Button } from '@/components/ui/button';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="flex max-w-xl flex-col items-center text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Rsbuild with React
        </h1>

        <p className="mt-4 text-muted-foreground">
          Start building amazing things with Rsbuild.
        </p>

        <Button className="mt-6" variant="default">
          Get Started
        </Button>
      </div>
    </div>
  );
}
