import { Navbar } from '@/components/Navbar';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/chat')({
  component: ChatLayout,
});

function ChatLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
