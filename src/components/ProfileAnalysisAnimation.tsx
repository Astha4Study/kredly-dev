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

// Fake CV "lines" shown during scan — mimics real resume structure
const CV_LINES = [
  { w: '55%', h: 5, mb: 6, indent: 0, dark: true }, // Name
  { w: '38%', h: 3, mb: 10, indent: 0, dark: false }, // Title / email
  { w: '20%', h: 3, mb: 5, indent: 0, dark: true }, // Section header
  { w: '90%', h: 2, mb: 3, indent: 8, dark: false },
  { w: '80%', h: 2, mb: 3, indent: 8, dark: false },
  { w: '65%', h: 2, mb: 8, indent: 8, dark: false },
  { w: '22%', h: 3, mb: 5, indent: 0, dark: true }, // Section header
  { w: '85%', h: 2, mb: 3, indent: 8, dark: false },
  { w: '70%', h: 2, mb: 3, indent: 8, dark: false },
];

type Phase = 'scanning' | 'revealing' | 'ready' | 'selecting' | 'resetting';

const CARD_HEIGHT = 200;
const CARD_WIDTH = 320;

export function ProfileAnalysisAnimation() {
  const [phase, setPhase] = useState<Phase>('scanning');
  const [scanY, setScanY] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

    const scanDuration = 1600;
    const startTime = performance.now();

    function animateScan(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / scanDuration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setScanY(eased * CARD_HEIGHT);

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
            }, 500);
            return;
          }
          if (count === 1) setStatusIndex(2);
          count++;
          setRevealedCount(count);
          timerRef.current = setTimeout(revealNext, 380);
        }

        timerRef.current = setTimeout(revealNext, 200);
      }
    }

    rafRef.current = requestAnimationFrame(animateScan);
  }

  function autoSelect(index: number) {
    if (index >= detectedTopics.length) {
      timerRef.current = setTimeout(() => {
        setPhase('resetting');
        timerRef.current = setTimeout(startLoop, 400);
      }, 800);
      return;
    }

    timerRef.current = setTimeout(() => {
      setPhase('selecting');
      setSelectedId(detectedTopics[index].id);
      timerRef.current = setTimeout(() => {
        setSelectedId(null);
        autoSelect(index + 1);
      }, 900);
    }, 400);
  }

  useEffect(() => {
    const init = setTimeout(startLoop, 300);
    return () => {
      clearTimeout(init);
      clear();
    };
  }, []);

  const isScanning = phase === 'scanning' || phase === 'revealing';

  return (
    <div
      className="relative shadow-sm"
      style={{ height: CARD_HEIGHT, width: CARD_WIDTH }}
    >
      {/* Stacked papers effect - background layers muncul dari atas */}
      <div
        className="absolute left-10 -top-4 h-full w-full border border-zinc-200 bg-zinc-50 shadow-sm"
        style={{ height: CARD_HEIGHT, width: CARD_WIDTH }}
      />
      <div
        className="absolute left-5 -top-2 h-full w-full border border-zinc-200 bg-zinc-100 shadow-sm"
        style={{ height: CARD_HEIGHT, width: CARD_WIDTH }}
      />

      {/* Main card - front layer */}
      <div
        className="relative w-full overflow-hidden border border-zinc-200 bg-white shadow-md z-10"
        style={{ height: CARD_HEIGHT, width: CARD_WIDTH }}
      >
        {/* ── CV paper view (scanning phase) ── */}
        <AnimatePresence>
          {phase === 'scanning' && (
            <motion.div
              className="absolute inset-0 px-3 pt-3"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {CV_LINES.map((line, i) => (
                <div
                  key={i}
                  style={{
                    marginLeft: line.indent,
                    marginBottom: line.mb,
                    width: line.w,
                    height: line.h,
                    background: line.dark ? '#d4d4d8' : '#e4e4e7',
                    borderRadius: 1,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scan beam ── */}
        <AnimatePresence>
          {phase === 'scanning' && (
            <motion.div
              className="pointer-events-none absolute inset-x-0 z-20"
              style={{ top: scanY }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* glow above */}
              <div
                className="absolute inset-x-0"
                style={{
                  bottom: '100%',
                  height: 20,
                  background:
                    'linear-gradient(to top, rgba(59,130,246,0.08), transparent)',
                }}
              />
              {/* beam line */}
              <div
                className="h-px w-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, #93c5fd 15%, #3b82f6 50%, #93c5fd 85%, transparent 100%)',
                }}
              />
              {/* glow below */}
              <div
                className="absolute inset-x-0"
                style={{
                  top: '100%',
                  height: 14,
                  background:
                    'linear-gradient(to bottom, rgba(59,130,246,0.06), transparent)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Topic list (after scan) ── */}
        <AnimatePresence>
          {phase !== 'scanning' && (
            <motion.div
              className="absolute inset-0 flex flex-col px-3 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header text */}
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mb-2 text-[9px] text-left font-medium uppercase tracking-widest text-zinc-400"
              >
                Pilih salah satu
              </motion.p>

              {/* Topic list */}
              <div className="flex flex-col gap-1.25">
                {detectedTopics.map((topic, i) => {
                  const visible = i < revealedCount;
                  const isSelected = selectedId === topic.id;

                  return (
                    <AnimatePresence key={topic.id}>
                      {visible && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.25,
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
                            transition={{ duration: 0.22 }}
                            className="flex w-full items-center justify-between border px-2.5 py-1.5"
                          >
                            <motion.span
                              animate={{
                                color: isSelected ? '#ffffff' : '#27272a',
                              }}
                              transition={{ duration: 0.22 }}
                              className="text-[11px] font-medium leading-none"
                            >
                              {topic.label}
                            </motion.span>

                            <div className="flex items-center gap-2">
                              {/* confidence bar */}
                              <div className="h-px w-8 overflow-hidden bg-zinc-100">
                                <motion.div
                                  initial={{ width: '0%' }}
                                  animate={{ width: `${topic.confidence}%` }}
                                  transition={{
                                    duration: 0.65,
                                    delay: 0.06,
                                    ease: [0.4, 0, 0.2, 1],
                                  }}
                                  className={
                                    isSelected
                                      ? 'h-full bg-white/35'
                                      : 'h-full bg-zinc-300'
                                  }
                                />
                              </div>

                              {/* pct */}
                              <motion.span
                                animate={{
                                  color: isSelected
                                    ? 'rgba(255,255,255,0.45)'
                                    : '#a1a1aa',
                                }}
                                transition={{ duration: 0.22 }}
                                className="w-5 text-right text-[9px] tabular-nums"
                              >
                                {topic.confidence}%
                              </motion.span>

                              {/* arrow */}
                              <motion.svg
                                animate={{
                                  opacity: isSelected ? 1 : 0,
                                  x: isSelected ? 0 : -3,
                                }}
                                transition={{ duration: 0.16 }}
                                className="h-2.5 w-2.5 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="white"
                                strokeWidth={3}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Status bar (bottom) ── */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 border-t border-zinc-100 bg-white px-3 py-1.5">
          <motion.div
            animate={isScanning ? { opacity: [1, 0.25, 1] } : { opacity: 1 }}
            transition={isScanning ? { duration: 0.8, repeat: Infinity } : {}}
            className={`h-1.25 w-1.25 shrink-0 ${
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
              transition={{ duration: 0.16 }}
              className="text-[8px] uppercase tracking-widest text-zinc-400"
            >
              {phase === 'selecting' && selectedId
                ? `${detectedTopics.find((t) => t.id === selectedId)?.label} dipilih`
                : SCAN_MESSAGES[statusIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
