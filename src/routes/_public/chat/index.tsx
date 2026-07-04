import { createFileRoute } from '@tanstack/react-router';
import { SimpleChat } from '@/components/SimpleChat';

export const Route = createFileRoute('/_public/chat/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="fixed inset-x-0 bottom-0 top-14 md:top-12 flex w-full bg-zinc-100/50">
      <main className="flex-1">
        <SimpleChat />
      </main>
    </div>
  );
}
