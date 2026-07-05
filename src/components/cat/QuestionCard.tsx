import { motion, AnimatePresence } from 'motion/react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuestionCardProps {
  question: string;
  topic: string;
  questionNumber: number;
}

export default function QuestionCard({
  question,
  topic,
  questionNumber,
}: QuestionCardProps) {
  return (
    <Card className="relative overflow-hidden border border-foreground/10 bg-background/50 backdrop-blur-md transition-all duration-300 hover:border-foreground/20">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 h-0.5 w-full bg-linear-to-r from-primary/50 via-primary to-primary/50" />

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Soal #{questionNumber}
          </span>
        </div>
        <Badge variant="default">{topic}</Badge>
      </CardHeader>

      <CardContent className="pt-2 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={question}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="select-none text-lg font-medium leading-relaxed text-foreground antialiased md:text-xl">
              {question}
            </p>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
