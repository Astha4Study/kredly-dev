import * as React from 'react';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

interface QuizActionsProps {
  showResult: boolean;
  selectedAnswer: string | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onContinue: () => void;
  countdown: number;
  error: string | null;
}

export default function QuizActions({
  showResult,
  selectedAnswer,
  isSubmitting,
  onSubmit,
  onContinue,
  countdown,
  error,
}: QuizActionsProps) {
  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex items-center justify-end pt-2">
        {!showResult ? (
          <Button
            size="lg"
            disabled={
              !(selectedAnswer && selectedAnswer.trim() !== '') || isSubmitting
            }
            onClick={onSubmit}
            className="w-full md:w-auto font-medium transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Menyerahkan...
              </>
            ) : (
              <>
                Kirim Jawaban <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={onContinue}
            className="w-full md:w-auto font-medium transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"
          >
            Lanjutkan ({countdown}s) <ArrowRight className="ml-2 size-4" />
          </Button>
        )}
      </div>

      {/* Error banner inside quiz */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl text-rose-300 text-sm"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}
