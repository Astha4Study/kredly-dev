import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

interface PilganCard {
  type: 'pilgan';
  soal: number;
  total: number;
  question: string;
  options: string[];
  correctIndex: number;
  wrongIndex: number;
}

interface EssayCard {
  type: 'essay';
  soal: number;
  total: number;
  question: string;
  answer: string;
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
    wrongIndex: 0,
  },
  {
    type: 'essay',
    soal: 5,
    total: 8,
    question:
      'Jelaskan perbedaan proses sinkron dan asinkron dalam pemrograman.',
    answer:
      'Proses sinkron berjalan secara berurutan dan memblokir eksekusi hingga selesai. Asinkron memungkinkan eksekusi berlanjut tanpa menunggu operasi selesai.',
  },
  {
    type: 'pilgan',
    soal: 3,
    total: 8,
    question: 'Kompleksitas waktu Bubble Sort pada kasus terburuk adalah?',
    options: ['O(n log n)', 'O(n²)', 'O(log n)'],
    correctIndex: 1,
    wrongIndex: 2,
  },
  {
    type: 'essay',
    soal: 7,
    total: 8,
    question: 'Apa yang dimaksud dengan normalisasi basis data?',
    answer:
      'Normalisasi adalah proses mengorganisasi kolom dan tabel untuk mengurangi redundansi data dan meningkatkan integritas.',
  },
];

// ─── Pilgan ───────────────────────────────────────────────────────────────────

function PilganContent({ card }: { card: PilganCard }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSelectedIndex(null);
    setWrongIndex(null);

    timerRef.current = setTimeout(() => {
      setSelectedIndex(card.wrongIndex);
      timerRef.current = setTimeout(() => {
        setWrongIndex(card.wrongIndex);
        setSelectedIndex(null);
        timerRef.current = setTimeout(() => {
          setWrongIndex(null);
          setSelectedIndex(card.correctIndex);
        }, 380);
      }, 700);
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [card]);

  return (
    <>
      {/* badge */}
      <div className="mb-2.5 flex items-center gap-1.5">
        <div className="h-1 w-1 bg-zinc-300" />
        <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-zinc-400">
          Pilihan Ganda
        </span>
      </div>

      {/* question */}
      <p className="mb-3 text-[11px] font-medium leading-relaxed text-zinc-700">
        {card.question}
      </p>

      {/* options — fixed height per row, never shrink */}
      <div className="flex flex-col gap-1.5">
        {card.options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          const isWrong = wrongIndex === i;

          return (
            <motion.div
              key={i}
              animate={
                isWrong
                  ? {
                      backgroundColor: '#fef2f2',
                      borderColor: '#fca5a5',
                      x: [0, 3, -2, 0],
                    }
                  : isSelected
                    ? {
                        backgroundColor: '#18181b',
                        borderColor: '#18181b',
                        x: 0,
                      }
                    : {
                        backgroundColor: '#ffffff',
                        borderColor: '#e4e4e7',
                        x: 0,
                      }
              }
              transition={{
                backgroundColor: { duration: 0.2 },
                borderColor: { duration: 0.2 },
                x: isWrong
                  ? { duration: 0.28, times: [0, 0.3, 0.7, 1] }
                  : { duration: 0.2 },
              }}
              className="flex h-7 shrink-0 items-center gap-2 border px-2.5"
            >
              <motion.div
                animate={{
                  borderColor: isWrong
                    ? '#f87171'
                    : isSelected
                      ? '#ffffff'
                      : '#d4d4d8',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                }}
                transition={{ duration: 0.18 }}
                className="flex h-2.25 w-2.25 shrink-0 items-center justify-center rounded-full border"
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.15 }}
                      className="h-1 w-1 rounded-full bg-zinc-900"
                    />
                  )}
                  {isWrong && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.15 }}
                      className="h-1 w-1 rounded-full bg-red-400"
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.span
                animate={{
                  color: isWrong
                    ? '#ef4444'
                    : isSelected
                      ? '#ffffff'
                      : '#52525b',
                }}
                transition={{ duration: 0.18 }}
                className="truncate text-[10.5px]"
              >
                {opt}
              </motion.span>

              <AnimatePresence>
                {isSelected && i === card.correctIndex && (
                  <motion.svg
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.18 }}
                    className="ml-auto h-3 w-3 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
                {isWrong && (
                  <motion.svg
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.18 }}
                    className="ml-auto h-3 w-3 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#f87171"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
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
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayed('');
    setDone(false);

    let i = 0;
    function typeChar() {
      if (i >= card.answer.length) {
        setDone(true);
        return;
      }
      setDisplayed(card.answer.slice(0, i + 1));
      const ch = card.answer[i];
      const delay = ch === '.' || ch === ',' ? 150 : ch === ' ' ? 26 : 20;
      i++;
      timerRef.current = setTimeout(typeChar, delay);
    }

    timerRef.current = setTimeout(typeChar, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [card]);

  return (
    <>
      {/* badge */}
      <div className="mb-2.5 flex items-center gap-1.5">
        <div className="h-1 w-1 bg-zinc-300" />
        <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-zinc-400">
          Esai
        </span>
      </div>

      {/* question */}
      <p className="mb-3 text-[11px] font-medium leading-relaxed text-zinc-700">
        {card.question}
      </p>

      {/* typing area — fixed height, content overflows internally via scroll-hidden */}
      <div className="h-18 shrink-0 overflow-hidden border border-zinc-200 bg-zinc-50 px-2.5 py-2">
        <p className="text-left text-[10px] leading-[1.7] text-zinc-600">
          {displayed}
          {!done && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.65, repeat: Infinity }}
              className="ml-px inline-block h-3 w-px translate-y-px bg-zinc-500"
            />
          )}
          {done && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="ml-1 inline-flex items-center gap-0.5 text-[8px] uppercase tracking-widest text-zinc-400"
            >
              <svg
                className="h-2 w-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              selesai
            </motion.span>
          )}
        </p>
      </div>

      <CardFooter soal={card.soal} total={card.total} />
    </>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function CardFooter({ soal, total }: { soal: number; total: number }) {
  const progress = Math.round(((soal - 1) / total) * 100);
  return (
    <div className="mt-3 shrink-0 border-t border-zinc-100 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-[8px] uppercase tracking-widest text-zinc-400">
          {soal} / {total}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="h-px w-16 overflow-hidden bg-zinc-100">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="h-full bg-zinc-400"
            />
          </div>
          <span className="text-[8px] tabular-nums text-zinc-400">
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
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function schedule() {
      timerRef.current = setTimeout(() => {
        setVisible(false);
        timerRef.current = setTimeout(() => {
          setIndex((p) => (p + 1) % CARDS.length);
          setVisible(true);
          schedule();
        }, 300);
      }, 4600);
    }
    schedule();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const card = CARDS[index];

  return (
    // Parent: fixed size, never grows or shrinks
    <div className="relative h-full w-full overflow-hidden border border-zinc-200 bg-white shadow-sm">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
            transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            // absolute fill — content is clipped by parent overflow-hidden
            className="absolute inset-0 flex flex-col px-3.5 py-3"
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
