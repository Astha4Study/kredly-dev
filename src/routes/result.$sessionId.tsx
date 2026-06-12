import { createFileRoute } from '@tanstack/react-router';
import ResultPage from '@/pages/client/cat/ResultPage';

export const Route = createFileRoute('/result/$sessionId')({
  component: ResultPage,
});
