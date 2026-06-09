import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

// ─── Data ────────────────────────────────────────────────────────────────────

type CardType = 'pilgan' | 'essay';

interface PilganCard {
  type: 'pilgan';
  soal: number;
  total: number;
  question: string;
  options: string[];
  correctIndex: number;
}

interface EssayCard {
  type: 'essay';
  soal: number;
  total: number;
  question: string;
  lines: number;
}

type Card = PilganCard | EssayCard;

const CARDS: Card[] = [
  {
    type: 'pilgan',
    soal: 2,
    total: 8,
    question: 'Bagaimana Python mengeksekusi kode sumber?',
    options: [
      'Kompilasi ke bytecode',
      'Interpretasi langsung',
      'Transpilasi ke C',
    ],
    correctIndex: 1,
  },
  {
    type: 'essay',
    soal: 5,
    total: 8,
    question:
      'Jelaskan perbedaan proses sinkron dan asinkron dalam pemrograman.',
    lines: 3,
  },
  {
    type: 'pilgan',
    soal: 3,
    total: 8,
    question: 'Kompleksitas waktu Bubble Sort pada kasus terburuk adalah?',
    options: ['O(n log n)', 'O(n²)', 'O(log n)'],
    correctIndex: 1,
  },
  {
    type: 'essay',
    soal: 7,
    total: 8,
    question:
      'Apa yang dimaksud dengan normalisasi basis data? Berikan contohnya.',
    lines: 3,
  },
];

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ type }: { type: CardType }) {
  return (
    <div className="mb-1.5 flex items-center gap-1">
      {type === 'pilgan' ? (
        <>
          <svg
            className="h-2.5 w-2.5 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className="text-[9px] font-medium uppercase tracking-widest text-zinc-400">
            Pilihan Ganda
          </span>
        </>
      ) : (
        <>
          <svg
            className="h-2.5 w-2.5 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <span className="text-[9px] font-medium uppercase tracking-widest text-zinc-400">
            Esai
          </span>
        </>
      )}
    </div>
  );
}

// ─── Pilgan ───────────────────────────────────────────────────────────────────

function PilganContent({ card }: { card: PilganCard }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSelectedIndex(null);
    let idx = 0;
    function clickNext() {
      setSelectedIndex(idx);
      if (idx < card.correctIndex) {
        idx++;
        timerRef.current = setTimeout(clickNext, 600);
      }
    }
    timerRef.current = setTimeout(clickNext, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [card]);

  return (
    <>
      <Badge type="pilgan" />
      <p className="mb-1.5 text-[10px] leading-[1.4] text-zinc-600">
        {card.question}
      </p>
      <div className="space-y-1">
        {card.options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          return (
            <motion.div
              key={i}
              animate={
                isSelected
                  ? { backgroundColor: '#18181b', borderColor: '#18181b' }
                  : { backgroundColor: '#ffffff', borderColor: '#e4e4e7' }
              }
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 border px-2 py-1.25"
            >
              <div
                className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full border"
                style={{
                  borderColor: isSelected ? '#ffffff' : '#d4d4d8',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                }}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-1 w-1 rounded-full bg-zinc-900"
                  />
                )}
              </div>
              <motion.span
                animate={{ color: isSelected ? '#ffffff' : '#52525b' }}
                transition={{ duration: 0.2 }}
                className="text-[10px] font-medium"
              >
                {opt}
              </motion.span>
              <motion.svg
                animate={{
                  opacity: isSelected ? 1 : 0,
                  x: isSelected ? 0 : -3,
                }}
                transition={{ duration: 0.2 }}
                className="ml-auto h-2.5 w-2.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </motion.svg>
            </motion.div>
          );
        })}
      </div>
      <CardFooter soal={card.soal} total={card.total} />
    </>
  );
}

// ─── Essay ────────────────────────────────────────────────────────────────────

function EssayContent({ card }: { card: EssayCard }) {
  const [typedLines, setTypedLines] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTypedLines(0);
    let count = 0;
    function typeNext() {
      if (count >= card.lines) return;
      count++;
      setTypedLines(count);
      timerRef.current = setTimeout(typeNext, 700);
    }
    timerRef.current = setTimeout(typeNext, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [card]);

  const lineWidths = [92, 78, 55];

  return (
    <>
      <Badge type="essay" />
      <p className="mb-1.5 text-[10px] leading-[1.4] text-zinc-600">
        {card.question}
      </p>
      <div className="border border-zinc-200 bg-zinc-50 px-2 py-1.5">
        <div className="space-y-1.5">
          {lineWidths.map((w, i) => {
            const isTyped = i < typedLines;
            const isCurrent = i === typedLines;
            return (
              <div key={i} className="flex h-2 items-center">
                {isTyped && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${w}%` }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="h-1.5 rounded-sm bg-zinc-300"
                  />
                )}
                {isCurrent && (
                  <div className="flex items-center gap-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(w * 0.4)}%` }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      className="h-1.5 rounded-sm bg-zinc-300"
                    />
                    <motion.div
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="h-3 w-px bg-zinc-500"
                    />
                  </div>
                )}
                {!isTyped && !isCurrent && (
                  <div
                    className="h-1.5 rounded-sm bg-zinc-100"
                    style={{ width: `${w}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <CardFooter soal={card.soal} total={card.total} />
    </>
  );
}

// ─── Shared Footer ────────────────────────────────────────────────────────────

function CardFooter({ soal, total }: { soal: number; total: number }) {
  const progress = Math.round(((soal - 1) / total) * 100);
  return (
    <div className="mt-2 border-t border-zinc-100 pt-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-widest text-zinc-400">
          Soal {soal} / {total}
        </span>
        <div className="flex items-center gap-1">
          <div className="h-px w-14 bg-zinc-100">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="h-full bg-zinc-300"
            />
          </div>
          <span className="text-[9px] tabular-nums text-zinc-400">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AssessmentAnimation() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'visible' | 'hidden'>('visible');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function cycle() {
      timerRef.current = setTimeout(() => {
        setPhase('hidden');
        timerRef.current = setTimeout(() => {
          setIndex((prev) => (prev + 1) % CARDS.length);
          setPhase('visible');
          cycle();
        }, 350);
      }, 3400);
    }
    cycle();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const card = CARDS[index];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 'visible' && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0 border border-zinc-200 bg-white px-3 py-2.5"
          >
            {card.type === 'pilgan' ? (
              <PilganContent card={card} />
            ) : (
              <EssayContent card={card} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
