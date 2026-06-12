import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';

type Phase =
  | 'idle'
  | 'scanning'
  | 'header'
  | 'identity'
  | 'skills'
  | 'stats'
  | 'verdict'
  | 'hold';

interface Profile {
  name: string;
  role: string;
  skills: { label: string; width: number }[];
  sv: number;
  sc: number;
  sa: number;
  month: string;
  year: number;
}

const PROFILES: Omit<Profile, 'month' | 'year'>[] = [
  {
    name: 'Dr. Rina Kusuma',
    role: 'Biolog Molekuler · Bandung, Indonesia',
    skills: [
      { label: 'Genetika', width: 95 },
      { label: 'Biokimia', width: 88 },
      { label: 'Lab PCR', width: 91 },
    ],
    sv: 14,
    sc: 96,
    sa: 11,
  },
  {
    name: 'Ahmad Fauzi',
    role: 'Ilmuwan Data · Surabaya, Indonesia',
    skills: [
      { label: 'Python', width: 90 },
      { label: 'Statistika', width: 85 },
      { label: 'Machine Learning', width: 78 },
    ],
    sv: 10,
    sc: 91,
    sa: 9,
  },
  {
    name: 'Siti Rahayu',
    role: 'Arsitek · Yogyakarta, Indonesia',
    skills: [
      { label: 'AutoCAD', width: 93 },
      { label: 'Desain Struktural', width: 80 },
      { label: 'BIM', width: 74 },
    ],
    sv: 8,
    sc: 88,
    sa: 7,
  },
  {
    name: 'Budi Santoso',
    role: 'Matematikawan · Malang, Indonesia',
    skills: [
      { label: 'Aljabar Linear', width: 97 },
      { label: 'Kalkulus', width: 94 },
      { label: 'Statistika', width: 89 },
    ],
    sv: 12,
    sc: 97,
    sa: 10,
  },
  {
    name: 'Dewi Lestari',
    role: 'Psikolog Klinis · Jakarta, Indonesia',
    skills: [
      { label: 'Psikoterapi', width: 92 },
      { label: 'Asesmen Psikologi', width: 87 },
      { label: 'CBT', width: 83 },
    ],
    sv: 9,
    sc: 90,
    sa: 8,
  },
  {
    name: 'Hendra Wijaya',
    role: 'Insinyur Elektro · Medan, Indonesia',
    skills: [
      { label: 'Elektronika', width: 89 },
      { label: 'Sistem Kontrol', width: 82 },
      { label: 'PLC', width: 76 },
    ],
    sv: 11,
    sc: 87,
    sa: 9,
  },
  {
    name: 'Nurul Hidayah',
    role: 'Ahli Gizi Klinis · Makassar, Indonesia',
    skills: [
      { label: 'Nutrisi Klinik', width: 94 },
      { label: 'Dietologi', width: 90 },
      { label: 'Biokimia Gizi', width: 85 },
    ],
    sv: 10,
    sc: 93,
    sa: 8,
  },
  {
    name: 'Rizky Pratama',
    role: 'Astrofisikawan · Bandung, Indonesia',
    skills: [
      { label: 'Astrofisika', width: 91 },
      { label: 'Pemrograman C++', width: 79 },
      { label: 'Analisis Spektral', width: 86 },
    ],
    sv: 9,
    sc: 89,
    sa: 7,
  },
];

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

function randHex() {
  const a = Math.random().toString(16).slice(2, 8);
  const b = Math.random().toString(16).slice(2, 6);
  return `0x${a}…${b}`;
}

function useCountUp(target: number, active: boolean, duration = 700) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number>();
  useEffect(() => {
    if (!active) {
      setVal(0);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, target, duration]);
  return val;
}

export function CredentialAnimation() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [barsShown, setBarsShown] = useState(0);
  const [profile, setProfile] = useState<Profile>(() => ({
    ...PROFILES[0],
    month: MONTHS[5],
    year: 2025,
  }));
  const indexRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const add = (fn: () => void, ms: number) =>
    timersRef.current.push(setTimeout(fn, ms));

  const startLoop = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const base = PROFILES[indexRef.current % PROFILES.length];
    indexRef.current++;
    setProfile({
      ...base,
      month: MONTHS[Math.floor(Math.random() * 12)],
      year: 2024 + Math.floor(indexRef.current / 4),
    });

    setPhase('idle');
    setBarsShown(0);

    add(() => setPhase('scanning'), 300);
    add(() => setPhase('header'), 500);
    add(() => setPhase('identity'), 1800);
    add(() => setPhase('skills'), 2500);
    add(() => setBarsShown(1), 2700);
    add(() => setBarsShown(2), 2980);
    add(() => setBarsShown(3), 3260);
    add(() => setPhase('stats'), 3900);
    add(() => setPhase('verdict'), 4800);
    add(() => setPhase('hold'), 5100);
    add(() => startLoop(), 9200);
  };

  useEffect(() => {
    const t = setTimeout(startLoop, 400);
    return () => {
      clearTimeout(t);
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const scanning = phase === 'scanning';
  const headerVis = phase !== 'idle';
  const identityVis = !['idle', 'scanning', 'header'].includes(phase);
  const skillsVis = ['skills', 'stats', 'verdict', 'hold'].includes(phase);
  const statsVis = ['stats', 'verdict', 'hold'].includes(phase);
  const verdictVis = phase === 'verdict' || phase === 'hold';

  const skillCount = useCountUp(profile.sv, statsVis);
  const scoreVal = useCountUp(profile.sc, statsVis);
  const testCount = useCountUp(profile.sa, statsVis);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden border border-border bg-card">
      <AnimatePresence>
        {scanning && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 z-10 h-px bg-primary/50"
            initial={{ top: 0, opacity: 0.6 }}
            animate={{ top: '100%', opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'linear' }}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-[7px] border border-border/50 pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-border/60 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-[18px] w-[18px] items-center justify-center bg-foreground">
            <span className="text-[9px] font-bold text-background">K</span>
          </div>
          <div>
            <div className="text-[10px] text-left font-semibold leading-tight text-foreground tracking-tight">
              Kredly
            </div>
            <div className="font-mono text-[7.5px] uppercase tracking-widest text-muted-foreground">
              Skill Verification
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: headerVis ? 1 : 0 }}
            transition={{ duration: 0.35 }}
            className="text-right font-mono text-[7.5px] uppercase tracking-widest text-muted-foreground leading-[1.5]"
          >
            Credential
            <br />
            Certificate
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden px-3.5 py-3">
        <div className="mb-3">
          <motion.p
            animate={{ opacity: identityVis ? 1 : 0, y: identityVis ? 0 : 5 }}
            transition={{ duration: 0.4 }}
            className="mb-1 font-mono text-[8px] uppercase tracking-widest text-muted-foreground"
          >
            Diberikan kepada
          </motion.p>
          <motion.p
            key={profile.name}
            animate={{ opacity: identityVis ? 1 : 0, y: identityVis ? 0 : 6 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-[22px] font-medium leading-none tracking-tight text-foreground"
          >
            {profile.name}
          </motion.p>
          <motion.p
            key={profile.role}
            animate={{ opacity: identityVis ? 1 : 0, y: identityVis ? 0 : 5 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-1 text-[9px] text-muted-foreground"
          >
            {profile.role}
          </motion.p>
        </div>

        <motion.div
          animate={{ opacity: skillsVis ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="mb-3 h-px bg-border/60"
        />

        <motion.div
          animate={{ opacity: skillsVis ? 1 : 0, y: skillsVis ? 0 : 5 }}
          transition={{ duration: 0.35 }}
        >
          <p className="mb-2 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
            Keahlian Terverifikasi
          </p>
          <div className="flex flex-col gap-1.5">
            {profile.skills.map(({ label, width }, i) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="w-[96px] shrink-0 text-[8.5px] text-muted-foreground">
                  {label}
                </span>
                <div className="h-[2px] flex-1 overflow-hidden bg-muted">
                  <motion.div
                    className="h-full bg-foreground"
                    initial={{ width: '0%' }}
                    animate={{ width: barsShown > i ? `${width}%` : '0%' }}
                    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
                <motion.span
                  animate={{ opacity: barsShown > i ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: 0.65 }}
                  className="w-7 text-right font-mono text-[8px] text-muted-foreground"
                >
                  {width}%
                </motion.span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: statsVis ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 border-t border-border/60 pt-3"
        >
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Skill Verified', val: skillCount, suffix: '' },
              { label: 'Kredibilitas', val: scoreVal, suffix: '/100' },
              { label: 'Assessments', val: testCount, suffix: '' },
            ].map(({ label, val, suffix }) => (
              <div key={label}>
                <p className="mb-0.5 font-mono text-[7.5px] uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="text-[15px] font-medium leading-none tracking-tight text-foreground">
                  {val}
                  <span className="text-[8px] font-normal text-muted-foreground">
                    {suffix}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stamp */}
      <motion.div
        animate={{
          opacity: verdictVis ? 1 : 0,
          scale: verdictVis ? 1 : 1.3,
          rotate: verdictVis ? -4 : -10,
        }}
        transition={{
          duration: 0.5,
          type: 'spring',
          stiffness: 220,
          damping: 18,
        }}
        className="absolute bottom-9 right-4 z-20 flex h-[52px] w-[52px] flex-col items-center justify-center gap-0.5 rounded-full border-[1.5px] border-primary"
      >
        <ShieldCheck className="size-4 text-primary" />
        <span className="font-mono text-[6px] font-semibold uppercase tracking-widest text-primary">
          Verified
        </span>
      </motion.div>

      {/* Footer */}
      <div className="relative z-10 flex shrink-0 items-end justify-between border-t border-border/60 px-3.5 py-2.5">
        <motion.div
          animate={{ opacity: verdictVis ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-1 h-px w-14 bg-border" />
          <p className="text-[9px] text-left font-medium leading-tight text-foreground">
            Kredly AI
          </p>
          <p className="text-[8px] text-muted-foreground">
            Verification Engine
          </p>
        </motion.div>
        <motion.div
          animate={{ opacity: verdictVis ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-right"
        >
          <p className="font-mono text-[8px] text-muted-foreground/40">
            {randHex()}
          </p>
          <p className="text-[8px] text-muted-foreground">
            Diterbitkan {profile.month} {profile.year}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
