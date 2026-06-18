import * as React from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnswerOptionsProps {
  options: string[];
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  disabled: boolean;
  correctAnswer?: string;
  showResult: boolean;
}

export default function AnswerOptions({
  options,
  selectedAnswer,
  onSelect,
  disabled,
  correctAnswer,
  showResult,
}: AnswerOptionsProps) {
  // Helper to parse key (A, B, C, D) and option text
  const parseOption = (option: string, index: number) => {
    if (/^[A-D]\.\s/.test(option)) {
      return {
        key: option.charAt(0),
        text: option.substring(3),
      };
    }
    return {
      key: String.fromCharCode(65 + index),
      text: option,
    };
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const numKey = e.key;

      let targetKey: string | null = null;
      if (['A', 'B', 'C', 'D'].includes(key)) {
        targetKey = key;
      } else if (['1', '2', '3', '4'].includes(numKey)) {
        const index = parseInt(numKey, 10) - 1;
        targetKey = String.fromCharCode(65 + index);
      }

      if (targetKey) {
        // Find if this key exists in the options keys
        const optionExists = options.some(
          (opt, idx) => parseOption(opt, idx).key === targetKey,
        );
        if (optionExists) {
          onSelect(targetKey);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [options, disabled, onSelect]);

  return (
    <div className="grid grid-cols-1 gap-3">
      {options.map((option, index) => {
        const { key, text } = parseOption(option, index);
        const isSelected = selectedAnswer === key;
        const isCorrect = correctAnswer === key;

        // styling classes
        let borderClass =
          'border-foreground/10 bg-background/30 hover:border-foreground/20 hover:bg-background/40';
        let badgeClass =
          'bg-foreground/5 text-foreground/70 border-foreground/10';
        let textClass = 'text-foreground/80';
        let icon: React.ReactNode = null;

        if (showResult) {
          if (isSelected && isCorrect) {
            // User picked the right answer → green
            borderClass =
              'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
            badgeClass =
              'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            textClass = 'text-emerald-200';
            icon = <Check className="size-4 shrink-0 text-emerald-400" />;
          } else if (isSelected && !isCorrect) {
            // User picked wrong answer → red
            borderClass = 'border-rose-500/30 bg-rose-500/10 text-rose-300';
            badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
            textClass = 'text-rose-200';
            icon = <X className="size-4 shrink-0 text-rose-400" />;
          } else if (!isSelected && isCorrect) {
            // This is the correct answer but user didn't pick it → highlight green
            borderClass =
              'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
            badgeClass =
              'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            textClass = 'text-emerald-200';
            icon = <Check className="size-4 shrink-0 text-emerald-400" />;
          }
          // All other options stay neutral (no highlight)
        } else if (isSelected) {
          // Normal state — user has selected but not yet submitted
          borderClass =
            'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]';
          badgeClass = 'bg-primary text-primary-foreground border-primary';
          textClass = 'text-foreground font-medium';
        }

        return (
          <motion.button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(key)}
            className={cn(
              'group relative flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              borderClass,
              disabled && 'cursor-default opacity-85',
            )}
            whileHover={!disabled ? { y: -1 } : {}}
            whileTap={!disabled ? { y: 0, scale: 0.99 } : {}}
          >
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold uppercase transition-colors',
                  badgeClass,
                )}
              >
                {key}
              </span>
              <span
                className={cn(
                  'text-sm md:text-base leading-relaxed',
                  textClass,
                )}
              >
                {text}
              </span>
            </div>
            {icon}
          </motion.button>
        );
      })}
    </div>
  );
}
