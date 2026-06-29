import { motion } from 'motion/react';
import type { AnswerResponse, QuizItem } from '../types';
import QuestionCard from '@/components/cat/QuestionCard';
import AnswerOptions from '@/components/cat/AnswerOptions';

interface QuizContentProps {
  currentItem: QuizItem;
  selectedAnswer: string | null;
  setSelectedAnswer: (answer: string | null) => void;
  isLoading: boolean;
  isSubmitting: boolean;
  showResult: boolean;
  feedback: AnswerResponse | null;
  questionNumber: number;
}

export default function QuizContent({
  currentItem,
  selectedAnswer,
  setSelectedAnswer,
  isLoading,
  isSubmitting,
  showResult,
  feedback,
  questionNumber,
}: QuizContentProps) {
  return (
    <div className="space-y-6">
      {/* Question Box */}
      <QuestionCard
        question={currentItem.pertanyaan}
        topic={currentItem.topic}
        questionNumber={questionNumber}
      />

      {/* Answer Selections */}
      {currentItem.type === 'essay' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-muted-foreground">
              Jawaban Essay Anda:
            </label>
            <span className="text-xs text-muted-foreground/60">
              Tuliskan jawaban singkat dan padat
            </span>
          </div>
          <textarea
            disabled={isLoading || isSubmitting || showResult}
            value={selectedAnswer || ''}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            placeholder="Ketik jawaban Anda di sini"
            className="w-full min-h-40 p-4 rounded-2xl border border-foreground/10 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300 resize-y text-sm leading-relaxed"
          />
        </motion.div>
      ) : (
        <AnswerOptions
          options={currentItem.pilihan || []}
          selectedAnswer={selectedAnswer}
          onSelect={setSelectedAnswer}
          disabled={isLoading || isSubmitting || showResult}
          correctAnswer={feedback?.correct_answer}
          showResult={showResult}
        />
      )}
    </div>
  );
}
