import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

type Phase = 'idle' | 'scanning' | 'skills' | 'levels' | 'verdict' | 'hold';

const SKILLS = ['Python', 'SQL', 'Statistika'];

const LEVELS = [
  { label: 'Pemula', width: 12 },
  { label: 'Menengah', width: 34 },
  { label: 'Mahir', width: 100 },
  { label: 'Pakar', width: 78 },
];

export function AIAnimation() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [skillsShown, setSkillsShown] = useState(0);
  const [levelsShown, setLevelsShown] = useState(0);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimeout = (callback: () => void, delay: number) => {
    const timer = setTimeout(callback, delay);
    timersRef.current.push(timer);
  };

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startLoop = () => {
    clearAllTimers();

    setPhase('idle');
    setSkillsShown(0);
    setLevelsShown(0);

    addTimeout(() => {
      setPhase('scanning');
    }, 350);

    addTimeout(() => {
      setPhase('skills');
    }, 1900);

    // Skills
    addTimeout(() => setSkillsShown(1), 1900);
    addTimeout(() => setSkillsShown(2), 2180);
    addTimeout(() => setSkillsShown(3), 2460);

    addTimeout(() => {
      setPhase('levels');
    }, 2800);

    // Levels
    addTimeout(() => setLevelsShown(1), 2800);
    addTimeout(() => setLevelsShown(2), 3260);
    addTimeout(() => setLevelsShown(3), 3720);
    addTimeout(() => setLevelsShown(4), 4180);

    addTimeout(() => {
      setPhase('verdict');
    }, 5000);

    addTimeout(() => {
      setPhase('hold');
    }, 5300);

    addTimeout(() => {
      startLoop();
    }, 8500);
  };

  useEffect(() => {
    const init = setTimeout(startLoop, 400);

    return () => {
      clearTimeout(init);
      clearAllTimers();
    };
  }, []);

  const scanning = phase === 'scanning';
  const badgeVisible = phase !== 'idle';
  const footerVisible = phase === 'verdict' || phase === 'hold';

  const barColors = [
    'bg-primary/40',
    'bg-primary/60',
    'bg-primary',
    'bg-primary/80',
  ];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden border border-zinc-200 bg-white">
      {/* Scan Line */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 z-10 h-px bg-primary/30"
            initial={{ top: 0, opacity: 1 }}
            animate={{ top: '100%', opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'linear' }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex shrink-0 items-center gap-1.5 border-b border-zinc-100 px-2.5 py-1.5">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-primary"
          animate={{ opacity: scanning ? [1, 0.3, 1] : 1 }}
          transition={scanning ? { duration: 1.2, repeat: Infinity } : {}}
        />

        <span className="flex-1 text-[9px] font-medium uppercase tracking-widest text-zinc-400">
          Penilaian AI
        </span>

        <motion.div
          animate={{ opacity: badgeVisible ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="border border-primary/20 bg-primary/5 px-1.5 py-px text-[8px] text-primary"
        >
          Menganalisis...
        </motion.div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left */}
        <div className="flex w-20 shrink-0 flex-col px-2.5 py-2">
          <span className="mb-2 text-[8px] uppercase tracking-wider text-zinc-400">
            Dari CV
          </span>

          <div className="flex flex-col gap-1.5">
            {SKILLS.map((skill, i) => (
              <motion.div
                key={skill}
                animate={{
                  opacity: skillsShown > i ? 1 : 0,
                  x: skillsShown > i ? 0 : -6,
                }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1 border border-zinc-100 bg-zinc-50 px-1.5 py-1"
              >
                <div className="h-1 w-1 rounded-full bg-primary/60" />
                <span className="text-[8.5px] text-zinc-500">{skill}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="w-px shrink-0 bg-zinc-100" />

        {/* Right */}
        <div className="flex flex-1 flex-col px-2.5 py-2">
          <span className="mb-2 text-[8px] uppercase tracking-wider text-zinc-400">
            Tingkat Keahlian
          </span>

          <div className="flex flex-col gap-2">
            {LEVELS.map((level, i) => (
              <div key={level.label} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-[8.5px] text-zinc-500">
                  {level.label}
                </span>

                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <motion.div
                    className={`h-full rounded-full ${barColors[i]}`}
                    initial={{ width: '0%' }}
                    animate={{
                      width: levelsShown > i ? `${level.width}%` : '0%',
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  />
                </div>

                <motion.span
                  animate={{
                    opacity: levelsShown > i ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-7 text-right text-[7.5px] font-medium tabular-nums text-primary"
                >
                  {level.width}%
                </motion.span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-zinc-100 px-2.5 py-1.5">
        <motion.span
          animate={{ opacity: footerVisible ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-[8px] tracking-wide text-zinc-400"
        >
          ID · 2024-DA-0391
        </motion.span>

        <div className="flex gap-1">
          {[false, false, true].map((active, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                active ? 'bg-primary' : 'bg-zinc-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
