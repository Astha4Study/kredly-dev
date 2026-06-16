/* eslint-disable react-hooks/set-state-in-effect */
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Check, Sparkles, ScanLine } from 'lucide-react';

interface EvaluationCard {
  soal: number;
  total: number;
  question: string;
  answer: string;
  criteria: {
    label: string;
    score: number;
    maxScore: number;
  }[];
  finalScore: number;
  feedback: string;
}

const CARDS: EvaluationCard[] = [
  {
    soal: 1,
    total: 6,
    question: 'Jelaskan pendekatan Anda ketika menghadapi konflik antar anggota tim dalam sebuah proyek.',
    answer:
      'Saya akan mendengarkan perspektif kedua pihak secara objektif, mengidentifikasi akar masalah, dan memfasilitasi diskusi untuk mencapai solusi yang adil.',
    criteria: [
      { label: 'Kelengkapan', score: 18, maxScore: 20 },
      { label: 'Relevansi', score: 19, maxScore: 20 },
      { label: 'Struktur', score: 17, maxScore: 20 },
    ],
    finalScore: 90,
    feedback: 'Jawaban menunjukkan pemahaman yang baik tentang manajemen konflik',
  },
  {
    soal: 2,
    total: 6,
    question: 'Bagaimana cara Anda mengelola ekspektasi stakeholder yang tidak realistis?',
    answer:
      'Komunikasikan dengan data dan fakta tentang batasan yang ada, tawarkan alternatif solusi yang achievable, dan tetap transparan tentang trade-off dari setiap keputusan.',
    criteria: [
      { label: 'Kelengkapan', score: 19, maxScore: 20 },
      { label: 'Relevansi', score: 20, maxScore: 20 },
      { label: 'Struktur', score: 18, maxScore: 20 },
    ],
    finalScore: 95,
    feedback: 'Pendekatan komunikasi yang sangat efektif dan profesional',
  },
  {
    soal: 3,
    total: 6,
    question: 'Deskripsikan strategi Anda untuk membangun relasi profesional dengan klien baru.',
    answer:
      'Memulai dengan mendengarkan kebutuhan mereka secara mendalam, memberikan value di setiap interaksi, konsisten dalam komunikasi.',
    criteria: [
      { label: 'Kelengkapan', score: 16, maxScore: 20 },
      { label: 'Relevansi', score: 18, maxScore: 20 },
      { label: 'Struktur', score: 17, maxScore: 20 },
    ],
    finalScore: 85,
    feedback: 'Strategi solid, bisa diperkuat dengan contoh konkret',
  },
  {
    soal: 4,
    total: 6,
    question:
      'Jelaskan bagaimana Anda menangani situasi di mana resource tim sangat terbatas namun target tetap tinggi.',
    answer:
      'Prioritaskan task berdasarkan impact dan urgency, optimalkan proses dengan automation, komunikasikan constraint ke stakeholder dengan proposal realistis.',
    criteria: [
      { label: 'Kelengkapan', score: 19, maxScore: 20 },
      { label: 'Relevansi', score: 19, maxScore: 20 },
      { label: 'Struktur', score: 19, maxScore: 20 },
    ],
    finalScore: 95,
    feedback: 'Pendekatan pragmatis dengan keseimbangan yang sangat baik',
  },
  {
    soal: 5,
    total: 6,
    question:
      'Bagaimana Anda mengambil keputusan strategis ketika data yang tersedia terbatas dan waktu mendesak?',
    answer:
      'Kumpulkan informasi kritis dengan cepat, analisis berdasarkan pengalaman, konsultasi dengan expert jika memungkinkan, buat keputusan dengan calculated risk.',
    criteria: [
      { label: 'Kelengkapan', score: 18, maxScore: 20 },
      { label: 'Relevansi', score: 19, maxScore: 20 },
      { label: 'Struktur', score: 18, maxScore: 20 },
    ],
    finalScore: 92,
    feedback: 'Menunjukkan kemampuan decision-making yang matang',
  },
  {
    soal: 6,
    total: 6,
    question:
      'Jelaskan pendekatan Anda dalam memberikan feedback konstruktif kepada anggota tim yang performanya menurun.',
    answer:
      'Lakukan percakapan empat mata, fokus pada perilaku spesifik bukan pribadi, dengarkan perspektif mereka, buat action plan bersama dengan timeline jelas.',
    criteria: [
      { label: 'Kelengkapan', score: 20, maxScore: 20 },
      { label: 'Relevansi', score: 20, maxScore: 20 },
      { label: 'Struktur', score: 19, maxScore: 20 },
    ],
    finalScore: 98,
    feedback: 'Pendekatan leadership yang sangat baik dan empatik',
  },
];

type Phase = 'idle' | 'scanning' | 'reading' | 'analyzing' | 'scoring' | 'feedback' | 'complete';

// Scan line that sweeps over the answer block
function ScanOverlay({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* tinted overlay */}
          <div className="absolute inset-0 bg-primary/3" />
          {/* moving scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-primary/40"
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 0.9, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Inline highlight that appears word by word — simulates AI "reading"
function HighlightedAnswer({ text, active }: { text: string; active: boolean }) {
  const words = text.split(' ');
  return (
    <p className="text-[9px] sm:text-[10px] leading-[1.75] text-zinc-600">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ backgroundColor: 'transparent' }}
          animate={
            active
              ? {
                  backgroundColor: ['transparent', 'rgba(99,102,241,0.12)', 'transparent'],
                }
              : { backgroundColor: 'transparent' }
          }
          transition={{
            delay: i * 0.045,
            duration: 0.35,
            ease: 'easeOut',
          }}
          className="rounded-xs"
        >
          {word}{' '}
        </motion.span>
      ))}
    </p>
  );
}

function EvaluationContent({ card }: { card: EvaluationCard }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [shownCriteria, setShownCriteria] = useState(0);
  const [displayedFeedback, setDisplayedFeedback] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clear() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }
  function after(ms: number, fn: () => void) {
    timerRef.current = setTimeout(fn, ms);
  }

  useEffect(() => {
    setPhase('idle');
    setShownCriteria(0);
    setDisplayedFeedback('');

    after(200, () => {
      setPhase('scanning');
      after(1000, () => {
        setPhase('reading');
        after(1400, () => {
          setPhase('analyzing');
          after(420, () => {
            setShownCriteria(1);
            after(380, () => {
              setShownCriteria(2);
              after(380, () => {
                setShownCriteria(3);
                after(400, () => {
                  setPhase('scoring');
                  after(500, () => {
                    setPhase('feedback');
                    let i = 0;
                    function type() {
                      if (i >= card.feedback.length) {
                        after(300, () => setPhase('complete'));
                        return;
                      }
                      setDisplayedFeedback(card.feedback.slice(0, i + 1));
                      i++;
                      timerRef.current = setTimeout(type, 28);
                    }
                    type();
                  });
                });
              });
            });
          });
        });
      });
    });

    return clear;
  }, [card]);

  const isReading = phase === 'reading';
  const isAnalyzing = ['analyzing', 'scoring', 'feedback', 'complete'].includes(phase);
  const isScoring = ['scoring', 'feedback', 'complete'].includes(phase);
  const isFeedback = ['feedback', 'complete'].includes(phase);
  const isComplete = phase === 'complete';

  return (
    <div className="flex flex-col gap-0">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-3 sm:px-4 py-2 sm:py-2.5">
        {/* left: soal badge + status */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 border border-zinc-200 bg-zinc-50">
            <span className="text-[7px] sm:text-[8px] font-bold tabular-nums text-zinc-500">
              {String(card.soal).padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <motion.div
              animate={{ rotate: phase === 'scanning' ? 360 : 0, opacity: phase === 'complete' ? 0.4 : 1 }}
              transition={{ duration: 1.6, repeat: phase === 'scanning' ? Infinity : 0, ease: 'linear' }}
            >
              {phase === 'scanning' ? (
                <ScanLine className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
              ) : (
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
              )}
            </motion.div>
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[7px] sm:text-[8px] font-medium uppercase tracking-[0.14em] text-zinc-400"
            >
              {phase === 'idle' && 'Menunggu'}
              {phase === 'scanning' && 'Memindai dokumen'}
              {phase === 'reading' && 'Membaca jawaban'}
              {phase === 'analyzing' && 'Menganalisis kriteria'}
              {phase === 'scoring' && 'Menghitung skor'}
              {phase === 'feedback' && 'Menulis feedback'}
              {phase === 'complete' && 'Selesai dinilai'}
            </motion.span>
          </div>
        </div>

        {/* right: complete check */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1"
            >
              <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-500" strokeWidth={2.5} />
              <span className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-wide text-emerald-600">
                Dinilai
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Body ── */}
      <div className="px-3 sm:px-4 pt-2.5 sm:pt-3 pb-2.5 sm:pb-3 flex flex-col gap-2.5 sm:gap-3">
        {/* Question */}
        <div>
          <p className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-[0.14em] text-zinc-400 mb-1 sm:mb-1.5">
            Pertanyaan
          </p>
          <p className="text-[10px] sm:text-[11px] font-medium leading-relaxed text-zinc-700">
            {card.question}
          </p>
        </div>

        {/* Answer block — scan + highlight overlay */}
        <div>
          <p className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-[0.14em] text-zinc-400 mb-1 sm:mb-1.5">
            Jawaban Peserta
          </p>
          <div className="relative border border-zinc-200 bg-zinc-50 px-2.5 sm:px-3 py-2 sm:py-2.5">
            <ScanOverlay active={phase === 'scanning'} />
            <HighlightedAnswer text={card.answer} active={isReading} />
          </div>
        </div>

        {/* Criteria — appear one by one */}
        <motion.div
          animate={{ opacity: isAnalyzing ? 1 : 0, y: isAnalyzing ? 0 : 4 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-[0.14em] text-zinc-400 mb-1.5 sm:mb-2">
            Kriteria Penilaian
          </p>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {card.criteria.map((c, i) => {
              const shown = shownCriteria > i;
              const pct = (c.score / c.maxScore) * 100;
              return (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: shown ? 1 : 0.2, x: 0 }}
                  transition={{ duration: 0.28 }}
                  className="flex items-center gap-2 sm:gap-2.5"
                >
                  <span className="w-16 sm:w-18 shrink-0 text-[9px] sm:text-[10px] text-zinc-600">{c.label}</span>
                  <div className="flex-1 h-0.75 bg-zinc-100 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: shown ? `${pct}%` : 0 }}
                      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                  <motion.span
                    animate={{ opacity: shown ? 1 : 0 }}
                    transition={{ delay: 0.45 }}
                    className="w-8 sm:w-9 shrink-0 text-right text-[9px] sm:text-[10px] font-mono text-zinc-600"
                  >
                    {c.score}/{c.maxScore}
                  </motion.span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Score + Feedback row */}
        <motion.div
          animate={{ opacity: isScoring ? 1 : 0, y: isScoring ? 0 : 6 }}
          transition={{ duration: 0.35 }}
          className="flex gap-2 sm:gap-2.5 border-t border-zinc-100 pt-2.5 sm:pt-3"
        >
          {/* Score pill */}
          <div className="flex flex-col items-center justify-center border border-zinc-200 bg-zinc-50 px-3 sm:px-4 py-1.5 sm:py-2 shrink-0">
            <motion.span
              animate={{ scale: isScoring ? [1, 1.12, 1] : 1 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="text-[20px] sm:text-[24px] font-bold leading-none text-primary tabular-nums"
            >
              {card.finalScore}
            </motion.span>
            <span className="mt-0.5 text-[7px] sm:text-[8px] uppercase tracking-wide text-zinc-400">/100</span>
          </div>

          {/* AI Feedback */}
          <motion.div
            animate={{ opacity: isFeedback ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 border border-primary/15 bg-primary/4 px-2.5 sm:px-3 py-1.5 sm:py-2"
          >
            <div className="flex items-center gap-1 mb-1 sm:mb-1.5">
              <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-primary/70" />
              <span className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-[0.12em] text-primary/60">
                AI Feedback
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] leading-relaxed text-zinc-700">
              {displayedFeedback}
              {isFeedback && !isComplete && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="ml-px inline-block h-2 sm:h-2.5 w-px bg-primary align-middle"
                />
              )}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Footer progress ── */}
      <div className="border-t border-zinc-100 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between">
        <div className="flex gap-0.5 sm:gap-1">
          {Array.from({ length: card.total }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                backgroundColor:
                  i < card.soal - 1
                    ? '#6366f1'
                    : i === card.soal - 1
                    ? isComplete
                      ? '#6366f1'
                      : '#d4d4d8'
                    : '#f4f4f5',
              }}
              transition={{ duration: 0.3 }}
              className="h-0.75 w-3 sm:w-4"
            />
          ))}
        </div>
        <span className="text-[7px] sm:text-[7.5px] font-medium tabular-nums text-zinc-400">
          {card.soal} / {card.total}
        </span>
      </div>
    </div>
  );
}

export function AiEvaluationAnimation() {
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
        }, 380);
      }, 8500);
    }
    schedule();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const card = CARDS[index];

  return (
    <div className="relative top-5 sm:top-3 w-full px-3 sm:px-6">
      <div className="relative max-w-4xl mx-auto">
        {/* Left stack - 2 cards */}
        <div
          className="absolute top-0 left-0 w-full h-full border border-zinc-200/40 bg-white/60 pointer-events-none"
          style={{
            transform: 'translate(-16px, 6px)',
            zIndex: -2,
          }}
        />
        <div
          className="absolute top-0 left-0 w-full h-full border border-zinc-200/50 bg-white/80 pointer-events-none"
          style={{
            transform: 'translate(-8px, 3px)',
            zIndex: -1,
          }}
        />

        {/* Main card */}
        <div className="relative border border-zinc-200 bg-white shadow-sm overflow-hidden" style={{ zIndex: 1 }}>
          <AnimatePresence mode="wait">
            {visible && (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <EvaluationContent card={card} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right stack - 2 cards */}
        <div
          className="absolute top-0 right-0 w-full h-full border border-zinc-200/50 bg-white/80 pointer-events-none"
          style={{
            transform: 'translate(8px, 3px)',
            zIndex: -1,
          }}
        />
        <div
          className="absolute top-0 right-0 w-full h-full border border-zinc-200/40 bg-white/60 pointer-events-none"
          style={{
            transform: 'translate(16px, 6px)',
            zIndex: -2,
          }}
        />
      </div>
    </div>
  );
}