import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { BadgeCheck } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase =
  | 'idle'
  | 'header'
  | 'cv-bar'
  | 'cv-strike'
  | 'sim-bar'
  | 'task-bar'
  | 'footer'
  | 'stamp'
  | 'hold';

// ─── Main Component ───────────────────────────────────────────────────────────

export function ValidationAnimation() {
  const [phase, setPhase] = useState<Phase>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // CV bar width — animates up to 45% then stays while strikethrough happens
  const [cvBarW, setCvBarW] = useState(0);
  const [simBarW, setSimBarW] = useState(0);
  const [taskBarW, setTaskBarW] = useState(0);

  function clear() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function after(ms: number, fn: () => void) {
    clear();
    timerRef.current = setTimeout(fn, ms);
  }

  function startLoop() {
    setCvBarW(0);
    setSimBarW(0);
    setTaskBarW(0);
    setPhase('idle');

    after(300, () => {
      setPhase('header');
      after(900, () => {
        setPhase('cv-bar');
        setCvBarW(45);
        after(700, () => {
          setPhase('cv-strike');
          after(600, () => {
            setPhase('sim-bar');
            setSimBarW(82);
            after(700, () => {
              setPhase('task-bar');
              setTaskBarW(91);
              after(700, () => {
                setPhase('footer');
                after(500, () => {
                  setPhase('stamp');
                  after(300, () => {
                    setPhase('hold');
                    after(3000, startLoop);
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  useEffect(() => {
    const init = setTimeout(startLoop, 400);
    return () => {
      clearTimeout(init);
      clear();
    };
  }, []);

  const headerVisible = phase !== 'idle';
  const cvStrike = [
    'cv-strike',
    'sim-bar',
    'task-bar',
    'footer',
    'stamp',
    'hold',
  ].includes(phase);
  const simVisible = [
    'sim-bar',
    'task-bar',
    'footer',
    'stamp',
    'hold',
  ].includes(phase);
  const taskVisible = ['task-bar', 'footer', 'stamp', 'hold'].includes(phase);
  const footerVisible = ['footer', 'stamp', 'hold'].includes(phase);
  const stampVisible = ['stamp', 'hold'].includes(phase);

  return (
    <div className="relative h-full w-full overflow-hidden border border-zinc-200 bg-white">
      {/* Top accent line */}
      <motion.div
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-primary"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: headerVisible ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      />

      <div className="px-3 py-2.5">
        {/* Header */}
        <div className="mb-3 flex items-start gap-2.5">
          {/* Badge icon */}
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-primary/20 bg-primary/5">
            <BadgeCheck className="h-4 w-4 text-primary" />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: headerVisible ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[9px] font-medium text-left uppercase tracking-widest text-zinc-400">
              Sertifikat Kompetensi
            </p>
            <p className="text-[11px] font-medium text-left text-zinc-800">
              Rekayasa Perangkat Lunak
            </p>
          </motion.div>
        </div>

        {/* Skill rows */}
        <div className="mb-2 mt-6 space-y-2">
          {/* CV klaim — always mounted, bar animates */}
          <SkillRow
            label="CV klaim"
            barWidth={cvBarW}
            barClass="bg-primary/30"
            showCheck={cvStrike}
            checkMark="✕"
            strikeThrough={cvStrike}
          />

          {/* Uji simulasi */}
          <AnimatePresence>
            {simVisible && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SkillRow
                  label="Uji simulasi"
                  barWidth={simBarW}
                  barClass="bg-primary/75"
                  showCheck={taskVisible}
                  checkMark="✓"
                  strikeThrough={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tugas nyata */}
          <AnimatePresence>
            {taskVisible && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SkillRow
                  label="Tugas nyata"
                  barWidth={taskBarW}
                  barClass="bg-primary"
                  showCheck={footerVisible}
                  checkMark="✓"
                  strikeThrough={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          className="flex items-center justify-between border-t border-zinc-100 pt-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: footerVisible ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-[9px] tabular-nums tracking-widest text-zinc-400">
            ID · 2024-RPL-0847
          </span>
          <div className="flex gap-1">
            {[false, false, true].map((active, i) => (
              <div
                key={i}
                className="h-1 w-1 rounded-full"
                style={{
                  backgroundColor: active ? 'hsl(var(--primary))' : '#e4e4e7',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stamp */}
      <AnimatePresence>
        {stampVisible && (
          <motion.div
            initial={{ scale: 1.6, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: -2, opacity: 1 }}
            exit={{ scale: 1.6, rotate: -8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="absolute right-3 top-2.5 flex h-10 w-10 flex-col items-center justify-center gap-0 rounded-full border-[1.5px] border-zinc-900 bg-white"
          >
            <span className="text-[5.5px] font-semibold uppercase tracking-[0.12em] text-zinc-900 leading-tight">
              Tervalidasi
            </span>
            <span className="text-[13px] leading-tight text-zinc-900">✓</span>
            <span className="text-[5px] uppercase tracking-widest text-zinc-900 leading-tight">
              Verified
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SkillRow ─────────────────────────────────────────────────────────────────

function SkillRow({
  label,
  barWidth,
  barClass,
  showCheck,
  checkMark,
  strikeThrough,
}: {
  label: string;
  barWidth: number;
  barClass: string;
  showCheck: boolean;
  checkMark: string;
  strikeThrough: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex w-13 shrink-0 items-center">
        <span className="text-[9px] text-zinc-500">{label}</span>

        {strikeThrough && (
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute left-0 top-1/2 h-px bg-zinc-400"
            style={{ transform: 'translateY(-50%)' }}
          />
        )}
      </div>

      <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100">
        <motion.div
          className={`h-full rounded-full ${barClass}`}
          initial={{ width: '0%' }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: showCheck ? 1 : 0, scale: showCheck ? 1 : 0.5 }}
        transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
        className="w-3 shrink-0 text-center text-[9px] font-medium text-zinc-700"
      >
        {checkMark}
      </motion.span>
    </div>
  );
}
