import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

import manAvatar from '@/assets/images/man1.jpg';
import manAvatar2 from '@/assets/images/man2.jpg';
import womanAvatar from '@/assets/images/woman1.jpg';
import womanAvatar2 from '@/assets/images/woman2.jpg';
import womanAvatar3 from '@/assets/images/woman3.jpg';

const cardContents = [
  {
    id: 1,
    layout: 'split',
    user: {
      name: 'Ahmad Kurniawan',
      role: 'Software Engineer',
      avatar: 'AK',
      image: manAvatar,
    },
    title: 'Assessment Kompetensi React',
    description: 'Evaluasi kemampuan React Hooks dan state management.',
    metrics: [
      { label: 'Component Design', value: 92 },
      { label: 'State Management', value: 88 },
      { label: 'Performance', value: 95 },
    ],
    badge: 'Verified',
    hash: '0x7a9f...3c2e',
  },
  {
    id: 2,
    layout: 'stacked',
    user: {
      name: 'Siti Rahayu',
      role: 'Data Analyst',
      avatar: 'SR',
      image: womanAvatar,
    },
    title: 'Analisis Statistik & Data Mining',
    description: 'Uji kemampuan analisis data kuantitatif dan prediktif.',
    metrics: [
      { label: 'Statistical Analysis', value: 94 },
      { label: 'Data Visualization', value: 89 },
    ],
    insights: [
      { label: 'Regression Model', value: '94% accuracy' },
      { label: 'Hypothesis Testing', value: 'Passed' },
      { label: 'Advanced SQL', value: 'Mastered' },
    ],
    badge: 'Expert',
    hash: '0x4b2c...8d1f',
  },
  {
    id: 3,
    layout: 'grid',
    user: {
      name: 'Budi Santoso',
      role: 'Financial Analyst',
      avatar: 'BS',
      image: manAvatar2,
    },
    title: 'Manajemen Keuangan & Investasi',
    description:
      'Evaluasi kemampuan analisis finansial dan portfolio management.',
    skills: [
      { name: 'Financial Modeling', level: 'Advanced', progress: 96 },
      { name: 'Risk Assessment', level: 'Expert', progress: 91 },
      { name: 'Portfolio Analysis', level: 'Intermediate', progress: 85 },
    ],
    badge: 'Certified',
    hash: '0x9e5a...2f7c',
  },
  {
    id: 4,
    layout: 'minimal',
    user: {
      name: 'Dewi Lestari',
      role: 'Mathematics Teacher',
      avatar: 'DL',
      image: womanAvatar2,
    },
    title: 'Kompetensi Matematika Lanjut',
    description: 'Uji kemampuan aljabar, kalkulus, dan matematika diskrit.',
    topics: [
      { name: 'Linear Algebra', score: 93, status: 'completed' },
      { name: 'Differential Calculus', score: 88, status: 'completed' },
      { name: 'Discrete Math', score: 90, status: 'completed' },
      { name: 'Number Theory', score: 86, status: 'in-progress' },
    ],
    badge: 'Master',
    hash: '0x2f8b...5a3d',
  },
  {
    id: 5,
    layout: 'card-list',
    user: {
      name: 'Siti Nurhaliza',
      role: 'Marketing Strategist',
      avatar: 'RP',
      image: womanAvatar3,
    },
    title: 'Digital Marketing & Analytics',
    description: 'Evaluasi strategi pemasaran digital dan analisis campaign.',
    achievements: [
      { title: 'Campaign ROI Analysis', result: '+245% growth' },
      { title: 'SEO Optimization', result: 'Top 3 ranking' },
      { title: 'Social Media Strategy', result: '50K+ engagement' },
    ],
    overallScore: 91,
    badge: 'Pro',
    hash: '0x6d3e...9c1b',
  },
];

function Avatar({ initials, image }: { initials: string; image?: string }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center border border-foreground/20 bg-foreground/5 text-xs font-medium tracking-wide text-foreground shadow-sm overflow-hidden">
      {image ? (
        <img
          src={image}
          alt={initials}
          width={40}
          height={40}
          className="size-full aspect-square object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="border border-foreground/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-foreground/50">
      {text}
    </span>
  );
}

function HashLine({ hash }: { hash: string }) {
  return (
    <div className="flex items-center gap-3 border-t border-foreground/8 pt-3 mt-auto">
      <span className="text-[10px] uppercase tracking-widest text-foreground/30">
        Hash
      </span>
      <span className="font-mono text-xs text-foreground/40">{hash}</span>
    </div>
  );
}

function Bar({ value, delay = 0 }: { value: number; delay?: number }) {
  return (
    <div className="h-0.75 w-full bg-foreground/8">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
        className="h-full bg-foreground/70"
      />
    </div>
  );
}

function UserRow({
  user,
  badge,
}: {
  user: { name: string; role: string; avatar: string; image?: string };
  badge: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar initials={user.avatar} image={user.image} />
        <div>
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="mt-1 text-xs text-foreground/40">{user.role}</p>
        </div>
      </div>
      <Badge text={badge} />
    </div>
  );
}

function SplitLayout({ card }: { card: (typeof cardContents)[0] }) {
  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-[1fr_180px]">
      <div className="flex flex-col gap-4 md:gap-6 md:border-r border-foreground/8 p-4 md:p-6">
        <UserRow user={card.user!} badge={card.badge} />
        <div>
          <p className="text-sm md:text-base font-semibold leading-snug">
            {card.title}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-foreground/40">
            {card.description}
          </p>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-3 md:gap-4">
          {card.metrics?.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-foreground/50">{m.label}</span>
                <span className="tabular-nums text-foreground/80">
                  {m.value}
                </span>
              </div>
              <Bar value={m.value} delay={i * 0.08 + 0.2} />
            </motion.div>
          ))}
        </div>
        <HashLine hash={card.hash} />
      </div>
      <div className="hidden md:flex flex-col justify-between p-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-foreground/30">
            Score
          </p>
          <p className="text-5xl font-semibold tabular-nums leading-none">
            {card.metrics
              ? Math.round(
                  card.metrics.reduce((a, m) => a + m.value, 0) /
                    card.metrics.length,
                )
              : '—'}
          </p>
          <p className="text-xs text-foreground/30">avg.</p>
        </div>
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-foreground/30">
            Blockchain
          </p>
          <p className="break-all font-mono text-xs text-foreground/50">
            {card.hash}
          </p>
        </div>
      </div>
    </div>
  );
}

function StackedLayout({ card }: { card: (typeof cardContents)[1] }) {
  return (
    <div className="flex h-full flex-col gap-4 md:gap-6 p-4 md:p-6">
      <UserRow user={card.user!} badge={card.badge} />
      <div>
        <p className="text-sm md:text-base font-semibold leading-snug">
          {card.title}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground/40">
          {card.description}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {card.metrics?.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-foreground/8 p-3 md:p-5"
          >
            <p className="text-3xl md:text-4xl font-semibold tabular-nums">
              {m.value}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-foreground/35">
              {m.label}
            </p>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {(card as any).insights?.map(
          (ins: { label: string; value: string }, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center justify-between border-t border-foreground/8 py-2 md:py-3 text-xs"
            >
              <span className="text-foreground/40">{ins.label}</span>
              <span className="font-medium">{ins.value}</span>
            </motion.div>
          ),
        )}
      </div>
      <HashLine hash={card.hash} />
    </div>
  );
}

function GridLayout({ card }: { card: (typeof cardContents)[2] }) {
  return (
    <div className="flex h-full flex-col gap-4 md:gap-6 p-4 md:p-6">
      <UserRow user={card.user!} badge={card.badge} />
      <div>
        <p className="text-sm md:text-base font-semibold leading-snug">
          {card.title}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground/40">
          {card.description}
        </p>
      </div>
      <div className="flex flex-col gap-4 md:gap-5">
        {card.skills?.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col gap-2 md:gap-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span>{s.name}</span>
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-foreground/35">{s.level}</span>
                <span className="tabular-nums text-foreground/60">
                  {s.progress}
                </span>
              </div>
            </div>
            <Bar value={s.progress} delay={i * 0.1 + 0.2} />
          </motion.div>
        ))}
      </div>
      <HashLine hash={card.hash} />
    </div>
  );
}

function MinimalLayout({ card }: { card: (typeof cardContents)[3] }) {
  return (
    <div className="flex h-full flex-col gap-4 md:gap-6 p-4 md:p-6">
      <UserRow user={card.user!} badge={card.badge} />
      <div>
        <p className="text-sm md:text-base font-semibold leading-snug">
          {card.title}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground/40">
          {card.description}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {card.topics?.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className="flex flex-col justify-between border border-foreground/8 p-3 md:p-5"
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-block size-1.5 rounded-full ${t.status === 'completed' ? 'bg-foreground/70' : 'bg-foreground/25'}`}
              />
              <span className="text-2xl md:text-3xl font-semibold tabular-nums">
                {t.score}
              </span>
            </div>
            <p className="mt-2 md:mt-3 text-xs text-foreground/50">{t.name}</p>
          </motion.div>
        ))}
      </div>
      <HashLine hash={card.hash} />
    </div>
  );
}

function CardListLayout({ card }: { card: (typeof cardContents)[4] }) {
  return (
    <div className="flex h-full flex-col gap-4 md:gap-6 p-4 md:p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials={card.user.avatar} image={card.user.image} />
          <div>
            <p className="text-sm font-medium leading-none">{card.user.name}</p>
            <p className="mt-1 text-xs text-foreground/40">{card.user.role}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl md:text-4xl font-semibold tabular-nums leading-none">
            {card.overallScore}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-foreground/30">
            overall
          </p>
        </div>
      </div>
      <div>
        <p className="text-sm md:text-base font-semibold leading-snug">
          {card.title}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground/40">
          {card.description}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {card.achievements?.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between border-t border-foreground/8 py-3 md:py-4 text-xs"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-[10px] uppercase tracking-widest text-foreground/30">
                0{i + 1}
              </span>
              <span className="text-foreground/70">{a.title}</span>
            </div>
            <span className="font-medium">{a.result}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Badge text={card.badge} />
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-foreground/30">
            Hash
          </span>
          <span className="font-mono text-xs text-foreground/40">
            {card.hash}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HeroCard() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cardContents.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const current = cardContents[currentIndex];

  const renderLayout = () => {
    switch (current.layout) {
      case 'split':
        return <SplitLayout card={current as any} />;
      case 'stacked':
        return <StackedLayout card={current as any} />;
      case 'grid':
        return <GridLayout card={current as any} />;
      case 'minimal':
        return <MinimalLayout card={current as any} />;
      case 'card-list':
        return <CardListLayout card={current as any} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex h-100 md:h-105 items-center justify-center">
      <div className="absolute -right-6 md:-right-30 xl:-right-20 top-1/2 w-full md:w-[120%] h-full -translate-y-1/2 border border-foreground/10 bg-background shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {renderLayout()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
