import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

const detectedTopics = [
  { id: 'math', label: 'Matematika', confidence: 94 },
  { id: 'stats', label: 'Statistika', confidence: 88 },
  { id: 'sql', label: 'SQL', confidence: 76 },
  { id: 'python', label: 'Python', confidence: 82 },
];

const SCAN_MESSAGES = [
  'Memindai dokumen...',
  'Mendeteksi keterampilan...',
  'Memetakan topik...',
  'Pilih topik untuk diuji',
];

type Phase = 'scanning' | 'revealing' | 'ready' | 'selecting' | 'resetting';

export function ProfileAnalysisAnimation() {
  const [phase, setPhase] = useState<Phase>('scanning');
  const [scanY, setScanY] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clear() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function startLoop() {
    clear();
    setPhase('scanning');
    setScanY(0);
    setStatusIndex(0);
    setRevealedCount(0);
    setSelectedId(null);

    // Use fixed 160px (h-40) as the scan height
    const cardHeight = 160;
    const scanDuration = 1400;
    const startTime = performance.now();

    function animateScan(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / scanDuration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setScanY(eased * cardHeight);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animateScan);
      } else {
        setPhase('revealing');
        setStatusIndex(1);

        let count = 0;
        function revealNext() {
          if (count >= detectedTopics.length) {
            setStatusIndex(3);
            timerRef.current = setTimeout(() => {
              setPhase('ready');
              autoSelect(0);
            }, 700);
            return;
          }
          if (count === 1) setStatusIndex(2);
          count++;
          setRevealedCount(count);
          timerRef.current = setTimeout(revealNext, 480);
        }

        timerRef.current = setTimeout(revealNext, 300);
      }
    }

    rafRef.current = requestAnimationFrame(animateScan);
  }

  function autoSelect(index: number) {
    if (index >= detectedTopics.length) {
      timerRef.current = setTimeout(() => {
        setPhase('resetting');
        timerRef.current = setTimeout(startLoop, 600);
      }, 1200);
      return;
    }

    timerRef.current = setTimeout(() => {
      setPhase('selecting');
      setSelectedId(detectedTopics[index].id);
      timerRef.current = setTimeout(() => {
        setSelectedId(null);
        autoSelect(index + 1);
      }, 1100);
    }, 600);
  }

  useEffect(() => {
    const init = setTimeout(startLoop, 600);
    return () => {
      clearTimeout(init);
      clear();
    };
  }, []);

  return (
    // Mengisi tepat h-40 (160px) dari parent, tidak ada padding luar
    <div className="relative h-full w-full">
      <div
        ref={cardRef}
        className="relative h-full w-full overflow-hidden border border-zinc-200 bg-white px-3 py-2.5"
      >
        {/* Scan line */}
        {phase === 'scanning' && (
          <div
            className="pointer-events-none absolute inset-x-0 z-20"
            style={{ top: `${scanY}px` }}
          >
            <div className="h-px w-full bg-zinc-300" />
          </div>
        )}

        {/* Header — sangat compact */}
        <div className="mb-2 flex items-center gap-1.5">
          <svg
            className="h-3 w-3 shrink-0 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <span className="text-[9px] font-medium uppercase tracking-widest text-zinc-400">
            CV_Resume.pdf
          </span>
        </div>

        {/* Topics — py-1 agar muat 4 item di 160px */}
        <div className="mb-2 space-y-1">
          {detectedTopics.map((topic, i) => {
            const visible = i < revealedCount;
            const isSelected = selectedId === topic.id;

            return (
              <AnimatePresence key={topic.id}>
                {visible && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <motion.div
                      animate={
                        isSelected
                          ? {
                              backgroundColor: '#18181b',
                              borderColor: '#18181b',
                            }
                          : {
                              backgroundColor: '#ffffff',
                              borderColor: '#e4e4e7',
                            }
                      }
                      transition={{ duration: 0.3 }}
                      className="flex w-full items-center justify-between border px-2 py-1"
                    >
                      <motion.span
                        animate={{ color: isSelected ? '#ffffff' : '#27272a' }}
                        transition={{ duration: 0.3 }}
                        className="text-[11px] font-medium"
                      >
                        {topic.label}
                      </motion.span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-px w-8 bg-zinc-100">
                          <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${topic.confidence}%` }}
                            transition={{
                              duration: 0.8,
                              delay: 0.1,
                              ease: [0.4, 0, 0.2, 1],
                            }}
                            className={
                              isSelected
                                ? 'h-full bg-white/40'
                                : 'h-full bg-zinc-300'
                            }
                          />
                        </div>
                        <span className="text-[9px] tabular-nums text-zinc-400">
                          {topic.confidence}%
                        </span>
                        <motion.svg
                          animate={{
                            opacity: isSelected ? 1 : 0,
                            x: isSelected ? 0 : -3,
                          }}
                          transition={{ duration: 0.2 }}
                          className="h-2.5 w-2.5 text-white"
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
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1.5 border-t border-zinc-100 pt-1.5">
          <motion.div
            animate={
              phase === 'revealing' || phase === 'scanning'
                ? { opacity: [1, 0.2, 1] }
                : { opacity: 1 }
            }
            transition={
              phase === 'revealing' || phase === 'scanning'
                ? { duration: 0.9, repeat: Infinity }
                : {}
            }
            className={`h-1 w-1 shrink-0 ${
              phase === 'ready' || phase === 'selecting'
                ? 'bg-zinc-900'
                : 'bg-zinc-300'
            }`}
          />
          <AnimatePresence mode="wait">
            <motion.span
              key={selectedId ?? statusIndex}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.2 }}
              className="text-[9px] uppercase tracking-widest text-zinc-400"
            >
              {phase === 'selecting' && selectedId
                ? `${detectedTopics.find((t) => t.id === selectedId)?.label} dipilih — mulai uji`
                : SCAN_MESSAGES[statusIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
