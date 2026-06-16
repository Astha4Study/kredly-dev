/* eslint-disable react-hooks/exhaustive-deps */
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

interface Profile {
  field: string;
  sub: string;
  id: string;
  cv: number;
  interview: number;
  sim: number;
  task: number;
  level: string;
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
    level: 'Advanced',
  },
  {
    field: 'Analisis Data',
    sub: 'Matematika Terapan',
    id: '2025-DAT-0562',
    cv: 50,
    interview: 72,
    sim: 86,
    task: 93,
    level: 'Expert',
  },
  {
    field: 'Desain Arsitektur',
    sub: 'Teknik Sipil',
    id: '2025-ARS-0391',
    cv: 35,
    interview: 63,
    sim: 76,
    task: 89,
    level: 'Proficient',
  },
];

const TODAY = (() => {
  const d = new Date();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${d.getFullYear()}-${months[d.getMonth()]}-${String(d.getDate()).padStart(2, '0')}`;
})();

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12l2 2 4-4" />
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ScorePill({
  label,
  value,
  active,
  struck,
  primary,
}: {
  label: string;
  value: number;
  active: boolean;
  struck: boolean;
  primary?: boolean;
}) {
  return (
    <div
      className={[
        'relative flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-1.5 sm:py-2 border-2 overflow-hidden bg-muted/30',
        struck
          ? 'opacity-40 border-border/40'
          : active
            ? 'border-border'
            : 'border-border/60',
      ].join(' ')}
    >
      <span className="font-mono text-[7px] sm:text-[8px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <span
        className={[
          'font-mono text-[13px] sm:text-[15px] font-bold leading-none',
          struck
            ? 'line-through text-muted-foreground'
            : primary
              ? 'text-primary'
              : 'text-foreground',
        ].join(' ')}
      >
        {value}%
      </span>
      <motion.div
        className={[
          'absolute bottom-0 left-0 right-0 h-[2.5px]',
          struck
            ? 'bg-muted-foreground/30'
            : primary
              ? 'bg-primary'
              : 'bg-foreground/60',
        ].join(' ')}
        initial={{ scaleX: struck ? 1 : 0 }}
        animate={{ scaleX: struck || active ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
}

type Phase =
  | 'idle'
  | 'scan'
  | 'header'
  | 'presents'
  | 'title'
  | 'domain'
  | 'pills'
  | 'pill-iw'
  | 'pill-sim'
  | 'pill-task'
  | 'footer'
  | 'seal'
  | 'verified'
  | 'hold';

const PHASE_ORDER: Phase[] = [
  'idle',
  'scan',
  'header',
  'presents',
  'title',
  'domain',
  'pills',
  'pill-iw',
  'pill-sim',
  'pill-task',
  'footer',
  'seal',
  'verified',
  'hold',
];

function after(current: Phase, phases: Phase[]): boolean {
  return phases.some(
    (p) => PHASE_ORDER.indexOf(current) >= PHASE_ORDER.indexOf(p),
  );
}

export function SertificationValidationAnimation() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [profile, setProfile] = useState<Profile>(PROFILES[0]);
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

    add(() => setPhase('scan'), 200);
    add(() => setPhase('header'), 500);
    add(() => setPhase('presents'), 1600);
    add(() => setPhase('title'), 1900);
    add(() => setPhase('domain'), 2200);
    add(() => setPhase('pills'), 2600);
    add(() => setPhase('pill-iw'), 3100);
    add(() => setPhase('pill-sim'), 3700);
    add(() => setPhase('pill-task'), 4300);
    add(() => setPhase('footer'), 4600);
    add(() => setPhase('seal'), 5200);
    add(() => setPhase('verified'), 5800);
    add(() => setPhase('hold'), 6100);
    add(() => startLoop(), 9800);
  };

  useEffect(() => {
    const t = setTimeout(startLoop, 400);
    return () => {
      clearTimeout(t);
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const scanning = phase === 'scan';
  const headerVis = after(phase, ['header']);
  const presents = after(phase, ['presents']);
  const titleVis = after(phase, ['title']);
  const domainVis = after(phase, ['domain']);
  const pillsVis = after(phase, ['pills']);
  const iwActive = after(phase, ['pill-iw']);
  const simActive = after(phase, ['pill-sim']);
  const taskActive = after(phase, ['pill-task']);
  const footerVis = after(phase, ['footer']);
  const sealVis = after(phase, ['seal']);
  const verified = after(phase, ['verified']);

  return (
    <div className="absolute top-3 sm:top-5 w-full max-w-4xl mx-auto px-4 sm:px-0">
      {/* Layer 4 */}
      <div
        className="absolute inset-0 border-2 sm:border-[3px] border-border/10 bg-background shadow-sm pointer-events-none hidden sm:block"
        style={{
          transform: 'translate(32px, -24px)',
          zIndex: -4,
        }}
      />

      {/* Layer 3 */}
      <div
        className="absolute inset-0 border-2 sm:border-[3px] border-border/15 bg-background shadow-sm pointer-events-none hidden sm:block"
        style={{
          transform: 'translate(24px, -18px)',
          zIndex: -3,
        }}
      />

      {/* Layer 2 */}
      <div
        className="absolute inset-0 border-2 sm:border-[3px] border-border/20 bg-background shadow-sm pointer-events-none"
        style={{
          transform: 'translate(16px, -12px)',
          zIndex: -2,
        }}
      />

      {/* Layer 1 */}
      <div
        className="absolute inset-0 border-2 sm:border-[3px] border-border/25 bg-background shadow-sm pointer-events-none"
        style={{
          transform: 'translate(8px, -6px)',
          zIndex: -1,
        }}
      />

      {/* Main */}
      <div
        className="relative w-full border-2 sm:border-[3px] border-border/30 bg-background overflow-hidden flex flex-col font-sans shadow-sm"
        style={{ zIndex: 1 }}
      >
        {/* Inner decorative borders - more visible */}
        <div className="absolute inset-2 sm:inset-3 border sm:border-2 border-border/30 pointer-events-none z-0 rounded-sm" />
        <div className="absolute inset-3 sm:inset-5 border border-border/20 pointer-events-none z-0 hidden sm:block" />

        {/* Scan line */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-primary/80 shadow-sm shadow-primary/50"
              initial={{ bottom: 0, opacity: 0.8 }}
              animate={{ bottom: '100%', opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: 'linear' }}
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="relative z-3 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border/30 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div>
              <div className="text-[11px] sm:text-[13px] text-left font-bold text-foreground tracking-tight">
                Kredly
              </div>
              <div className="font-mono text-[7px] sm:text-[8px] uppercase tracking-[0.15em] text-muted-foreground">
                Certification Authority
              </div>
            </div>
          </div>

          <motion.div
            animate={{ opacity: headerVis ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-muted-foreground text-right leading-[1.6]"
          >
            Certificate of
            <br />
            Competency
          </motion.div>
        </div>

        {/* Body */}
        <div className="relative z-3 flex flex-col sm:flex-row px-4 sm:px-6 py-4 sm:py-5 gap-4 sm:gap-6 overflow-hidden">
          {/* Left content */}
          <div className="flex-1 flex flex-col justify-center sm:pr-6">
            <motion.p
              animate={{ opacity: presents ? 1 : 0, y: presents ? 0 : 6 }}
              transition={{ duration: 0.4 }}
              className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-2 sm:mb-2.5"
            >
              This certifies that
            </motion.p>

            <motion.p
              key={profile.field}
              animate={{ opacity: titleVis ? 1 : 0, y: titleVis ? 0 : 8 }}
              transition={{ duration: 0.5 }}
              className="text-[20px] sm:text-[28px] leading-[1.15] tracking-tight text-foreground mb-1 sm:mb-1.5 font-serif"
              style={{ fontWeight: 400 }}
            >
              {profile.field}
            </motion.p>

            <motion.p
              key={profile.sub}
              animate={{ opacity: domainVis ? 1 : 0, y: domainVis ? 0 : 4 }}
              transition={{ duration: 0.4 }}
              className="text-[10px] sm:text-[11px] text-muted-foreground mb-3 sm:mb-4"
            >
              {profile.sub}
            </motion.p>

            {/* Score pills */}
            <motion.div
              animate={{ opacity: pillsVis ? 1 : 0, y: pillsVis ? 0 : 6 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-4 gap-1.5 sm:gap-2"
            >
              <ScorePill
                label="CV"
                value={profile.cv}
                active={true}
                struck={true}
              />
              <ScorePill
                label="Interview"
                value={profile.interview}
                active={iwActive}
                struck={false}
              />
              <ScorePill
                label="Simulasi"
                value={profile.sim}
                active={simActive}
                struck={false}
              />
              <ScorePill
                label="Tugas"
                value={profile.task}
                active={taskActive}
                struck={false}
                primary
              />
            </motion.div>
          </div>

          {/* Vertical divider */}
          <div className="w-full sm:w-0.5 h-0.5 sm:h-auto bg-border shrink-0 sm:my-4" />

          {/* Right sidebar */}
          <div className="w-full sm:w-32.5 shrink-0 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-4 sm:gap-4 sm:pl-4">
            {/* Seal */}
            <motion.div
              animate={
                sealVis
                  ? { opacity: 1, scale: 1, rotate: 0 }
                  : { opacity: 0, scale: 1.3, rotate: 10 }
              }
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className={[
                'relative w-16 h-16 sm:w-17.5 sm:h-17.5 rounded-full border-2 flex flex-col items-center justify-center gap-0.5 sm:gap-1 shrink-0',
                verified
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-foreground text-foreground bg-muted/30',
              ].join(' ')}
            >
              <div className="absolute inset-1.5 rounded-full border-[1.5px] border-dashed border-current/30" />
              <ShieldCheck className="relative z-1 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="relative z-1 font-mono text-[6px] sm:text-[7px] font-bold uppercase tracking-[0.15em]">
                {verified ? 'Verified' : 'Pending'}
              </span>
            </motion.div>

            {/* Meta info */}
            <motion.div
              animate={{ opacity: footerVis ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col sm:flex-col gap-3 sm:gap-2 w-full"
            >
              {[
                { key: 'Issued', val: TODAY, mono: true },
                { key: 'Level', val: profile.level, mono: false },
                { key: 'Expires', val: '2027-06-14', mono: true },
              ].map(({ key, val, mono }) => (
                <div
                  key={key}
                  className="flex flex-row sm:flex-col gap-1 sm:gap-0.5 items-baseline sm:items-start"
                >
                  <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-muted-foreground">
                    {key}:
                  </span>
                  <span
                    className={[
                      'text-[9px] sm:text-[10px] font-semibold text-foreground',
                      mono ? 'font-mono' : '',
                    ].join(' ')}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-3 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-border/30 shrink-0">
          <motion.div
            animate={{ opacity: footerVis ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-0.5 sm:gap-1"
          >
            <div className="h-0.5 w-12 sm:w-15 bg-foreground/40" />
            <span className="text-[10px] sm:text-[11px] font-bold text-foreground mt-0.5">
              Kredly AI
            </span>
            <span className="text-[7px] sm:text-[8px] text-muted-foreground">
              Validation Authority
            </span>
          </motion.div>

          <motion.div
            animate={{ opacity: footerVis ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-right"
          >
            <p className="font-mono text-[7px] sm:text-[8px] text-muted-foreground/60 mb-1 sm:mb-1.5">
              {profile.id}
            </p>
            <div className="inline-flex items-center gap-1 sm:gap-1.5 font-mono text-[7px] sm:text-[8px] uppercase tracking-[0.15em] font-semibold text-primary">
              <motion.div
                animate={{
                  scale: verified ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.4 }}
                className="w-1.5 h-1.5 rounded-full shrink-0 bg-primary"
              />
              {verified ? 'Validated' : 'Validating'}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
