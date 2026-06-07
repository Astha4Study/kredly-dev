import { Button } from '@/components/ui/button';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-background text-foreground">
      <div className="flex max-w-xl flex-col items-center text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Rsbuild with React
        </h1>

        <p className="mt-4 text-muted-foreground">
          Start building amazing things with Rsbuild.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="default" asChild>
            <Link to="/test">Test Shadcn Theme</Link>
          </Button>
          <Button variant="outline">Get Started</Button>
        </div>
      </div>
    </div>
  );
}
