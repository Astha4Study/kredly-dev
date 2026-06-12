import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';

type Phase =
  | 'idle'
  | 'scanning'
  | 'header'
  | 'identity'
  | 'cv-bar'
  | 'cv-strike'
  | 'interview-bar'
  | 'interview-check'
  | 'sim-bar'
  | 'sim-check'
  | 'task-bar'
  | 'task-check'
  | 'footer'
  | 'stamp'
  | 'hold';

interface Profile {
  field: string;
  sub: string;
  id: string;
  cv: number;
  interview: number;
  sim: number;
  task: number;
}

const PROFILES: Profile[] = [
  {
    field: 'Rekayasa Perangkat Lunak',
    sub: 'Teknologi Informasi',
    id: '2025-RPL-0847',
    cv: 42,
    interview: 68,
    sim: 84,
    task: 91,
  },
  {
    field: 'Biologi Molekuler',
    sub: 'Ilmu Hayati',
    id: '2025-BIO-1203',
    cv: 38,
    interview: 65,
    sim: 79,
    task: 88,
  },
  {
    field: 'Analisis Data',
    sub: 'Matematika Terapan',
    id: '2025-DAT-0562',
    cv: 50,
    interview: 72,
    sim: 86,
    task: 93,
  },
  {
    field: 'Desain Arsitektur',
    sub: 'Teknik Sipil',
    id: '2025-ARS-0391',
    cv: 35,
    interview: 63,
    sim: 76,
    task: 89,
  },
  {
    field: 'Psikologi Klinis',
    sub: 'Ilmu Kesehatan',
    id: '2025-PSI-0774',
    cv: 44,
    interview: 70,
    sim: 81,
    task: 90,
  },
  {
    field: 'Astrofisika',
    sub: 'Fisika Terapan',
    id: '2025-FIS-0318',
    cv: 40,
    interview: 67,
    sim: 83,
    task: 92,
  },
  {
    field: 'Gizi Klinik',
    sub: 'Ilmu Kesehatan',
    id: '2025-GZI-0655',
    cv: 47,
    interview: 71,
    sim: 78,
    task: 87,
  },
  {
    field: 'Elektronika Industri',
    sub: 'Teknik Elektro',
    id: '2025-ELK-0429',
    cv: 36,
    interview: 64,
    sim: 80,
    task: 88,
  },
];

function SkillRow({
  label,
  width,
  barClass,
  pctClass = '',
  showPct,
  showCheck,
  checkOk,
  strikeThrough,
}: {
  label: string;
  width: number;
  barClass: string;
  pctClass?: string;
  showPct: boolean;
  showCheck: boolean;
  checkOk: boolean;
  strikeThrough: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-[70px] shrink-0 text-[8.5px] transition-colors duration-300 ${strikeThrough ? 'text-muted-foreground/30 line-through' : 'text-muted-foreground'}`}
      >
        {label}
      </span>

      <div className="h-[2px] flex-1 overflow-hidden bg-muted">
        <motion.div
          className={`h-full ${barClass}`}
          initial={{ width: '0%' }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      <motion.span
        animate={{ opacity: showPct ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.65 }}
        className={`w-7 text-right font-mono text-[8px] ${pctClass || 'text-muted-foreground'}`}
      >
        {width}%
      </motion.span>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: showCheck ? 1 : 0, scale: showCheck ? 1 : 0.5 }}
        transition={{ duration: 0.25, type: 'spring', stiffness: 300 }}
        className="w-3 shrink-0 flex items-center justify-center"
      >
        {checkOk ? (
          <Check className="size-3 text-primary" />
        ) : (
          <X className="size-3 text-muted-foreground/40" />
        )}
      </motion.div>
    </div>
  );
}

export function ValidationAnimation() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [profile, setProfile] = useState<Profile>(PROFILES[0]);
  const [cvW, setCvW] = useState(0);
  const [interviewW, setInterviewW] = useState(0);
  const [simW, setSimW] = useState(0);
  const [taskW, setTaskW] = useState(0);
  const indexRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const add = (fn: () => void, ms: number) =>
    timersRef.current.push(setTimeout(fn, ms));

  const startLoop = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const p = PROFILES[indexRef.current % PROFILES.length];
    indexRef.current++;
    setProfile(p);
    setPhase('idle');
    setCvW(0);
    setInterviewW(0);
    setSimW(0);
    setTaskW(0);

    add(() => setPhase('scanning'), 300);
    add(() => setPhase('header'), 500);
    add(() => setPhase('identity'), 1800);
    add(() => {
      setPhase('cv-bar');
      setCvW(p.cv);
    }, 2400);
    add(() => setPhase('cv-strike'), 3200);
    add(() => {
      setPhase('interview-bar');
      setInterviewW(p.interview);
    }, 3300);
    add(() => setPhase('interview-check'), 3900);
    add(() => {
      setPhase('sim-bar');
      setSimW(p.sim);
    }, 4000);
    add(() => setPhase('sim-check'), 4600);
    add(() => {
      setPhase('task-bar');
      setTaskW(p.task);
    }, 4700);
    add(() => setPhase('task-check'), 5300);
    add(() => setPhase('footer'), 5600);
    add(() => setPhase('stamp'), 6000);
    add(() => setPhase('hold'), 6300);
    add(() => startLoop(), 9700);
  };

  useEffect(() => {
    const t = setTimeout(startLoop, 400);
    return () => {
      clearTimeout(t);
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const after = (p: Phase, phases: Phase[]) => phases.includes(p);

  const scanning = phase === 'scanning';
  const headerVis = phase !== 'idle';
  const identityVis = after(phase, [
    'identity',
    'cv-bar',
    'cv-strike',
    'interview-bar',
    'interview-check',
    'sim-bar',
    'sim-check',
    'task-bar',
    'task-check',
    'footer',
    'stamp',
    'hold',
  ]);
  const cvBarVis = after(phase, [
    'cv-bar',
    'cv-strike',
    'interview-bar',
    'interview-check',
    'sim-bar',
    'sim-check',
    'task-bar',
    'task-check',
    'footer',
    'stamp',
    'hold',
  ]);
  const cvStrike = after(phase, [
    'cv-strike',
    'interview-bar',
    'interview-check',
    'sim-bar',
    'sim-check',
    'task-bar',
    'task-check',
    'footer',
    'stamp',
    'hold',
  ]);
  const interviewVis = after(phase, [
    'interview-bar',
    'interview-check',
    'sim-bar',
    'sim-check',
    'task-bar',
    'task-check',
    'footer',
    'stamp',
    'hold',
  ]);
  const interviewCheck = after(phase, [
    'interview-check',
    'sim-bar',
    'sim-check',
    'task-bar',
    'task-check',
    'footer',
    'stamp',
    'hold',
  ]);
  const simVis = after(phase, [
    'sim-bar',
    'sim-check',
    'task-bar',
    'task-check',
    'footer',
    'stamp',
    'hold',
  ]);
  const simCheck = after(phase, [
    'sim-check',
    'task-bar',
    'task-check',
    'footer',
    'stamp',
    'hold',
  ]);
  const taskVis = after(phase, [
    'task-bar',
    'task-check',
    'footer',
    'stamp',
    'hold',
  ]);
  const taskCheck = after(phase, ['task-check', 'footer', 'stamp', 'hold']);
  const footerVis = after(phase, ['footer', 'stamp', 'hold']);
  const stampVis = after(phase, ['stamp', 'hold']);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden border border-border bg-card">
      {/* Scan line - berbeda dari CredentialAnimation (dari bawah ke atas) */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 z-10 h-px bg-primary/50"
            initial={{ bottom: 0, opacity: 0.6 }}
            animate={{ bottom: '100%', opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'linear' }}
          />
        )}
      </AnimatePresence>

      {/* Inner border */}
      <div className="absolute inset-[7px] border border-border/50 pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-border/60 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-[18px] w-[18px] items-center justify-center bg-foreground">
            <span className="text-[9px] font-bold text-background">K</span>
          </div>
          <div>
            <div className="text-[10px] font-semibold leading-tight text-foreground tracking-tight">
              Kredly
            </div>
            <div className="font-mono text-[7.5px] uppercase tracking-widest text-muted-foreground">
              Skill Validation
            </div>
          </div>
        </div>
        <motion.div
          animate={{ opacity: headerVis ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          className="text-right font-mono text-[7.5px] uppercase tracking-widest text-muted-foreground leading-[1.5]"
        >
          Validasi
          <br />
          Kompetensi
        </motion.div>
      </div>

      {/* Body */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden px-3.5 py-3">
        {/* Identity */}
        <div className="mb-3">
          <motion.p
            animate={{ opacity: identityVis ? 1 : 0, y: identityVis ? 0 : 5 }}
            transition={{ duration: 0.4 }}
            className="mb-1 font-mono text-[8px] uppercase tracking-widest text-muted-foreground"
          >
            Sertifikat Kompetensi
          </motion.p>
          <motion.p
            key={profile.field}
            animate={{ opacity: identityVis ? 1 : 0, y: identityVis ? 0 : 6 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-[18px] font-medium leading-tight tracking-tight text-foreground"
          >
            {profile.field}
          </motion.p>
          <motion.p
            key={profile.sub}
            animate={{ opacity: identityVis ? 1 : 0, y: identityVis ? 0 : 5 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-1 text-[9px] text-muted-foreground"
          >
            {profile.sub}
          </motion.p>
        </div>

        <motion.div
          animate={{ opacity: identityVis ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="h-px bg-border/60 mb-3"
        />

        {/* Rows */}
        <div className="flex flex-col gap-1.5">
          <SkillRow
            label="CV klaim"
            width={cvW}
            barClass="bg-muted-foreground/20"
            showPct={cvBarVis}
            showCheck={cvStrike}
            checkOk={false}
            strikeThrough={cvStrike}
          />

          <AnimatePresence>
            {interviewVis && (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SkillRow
                  label="Wawancara"
                  width={interviewW}
                  barClass="bg-primary/40"
                  showPct={interviewVis}
                  showCheck={interviewCheck}
                  checkOk={true}
                  strikeThrough={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {simVis && (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SkillRow
                  label="Simulasi"
                  width={simW}
                  barClass="bg-primary/60"
                  showPct={simVis}
                  showCheck={simCheck}
                  checkOk={true}
                  strikeThrough={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {taskVis && (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SkillRow
                  label="Tugas nyata"
                  width={taskW}
                  barClass="bg-primary"
                  pctClass="text-primary"
                  showPct={taskVis}
                  showCheck={taskCheck}
                  checkOk={true}
                  strikeThrough={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stamp - berbeda: posisi kiri bawah vs kanan bawah di CredentialAnimation */}
      <AnimatePresence>
        {stampVis && (
          <motion.div
            initial={{ scale: 1.4, rotate: 8, opacity: 0 }}
            animate={{ scale: 1, rotate: 4, opacity: 1 }}
            exit={{ scale: 1.4, rotate: 8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="absolute bottom-9 left-4 z-20 flex h-[52px] w-[52px] flex-col items-center justify-center gap-0.5 rounded-full border-[1.5px] border-primary"
          >
            <Check className="size-4 text-primary" />
            <span className="font-mono text-[6px] font-semibold uppercase tracking-widest text-primary">
              Valid
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="relative z-10 flex shrink-0 items-end justify-between border-t border-border/60 px-3.5 py-2.5">
        <motion.div
          animate={{ opacity: footerVis ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-1 h-px w-14 bg-border" />
          <p className="text-[9px] font-medium leading-tight text-foreground">
            Kredly AI
          </p>
          <p className="text-[8px] text-muted-foreground">Validation System</p>
        </motion.div>
        <motion.div
          animate={{ opacity: footerVis ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-right"
        >
          <p className="font-mono text-[8px] text-muted-foreground/40">
            {profile.id}
          </p>
          <div className="mt-1 flex justify-end gap-1">
            {[false, true, false].map((active, i) => (
              <motion.div
                key={i}
                className="h-1 w-1 rounded-full"
                animate={{
                  background:
                    active && stampVis
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted))',
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
