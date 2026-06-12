import { createFileRoute } from '@tanstack/react-router';
import QuizPage from '@/pages/client/cat/QuizPage';

export const Route = createFileRoute('/quiz/$sessionId')({
  component: QuizPage,
});
