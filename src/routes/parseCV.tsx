import { createFileRoute } from '@tanstack/react-router';
import CVParserPage from '@/pages/client/parse-cv';

export const Route = createFileRoute('/parseCV')({
  component: CVParserPage,
});
