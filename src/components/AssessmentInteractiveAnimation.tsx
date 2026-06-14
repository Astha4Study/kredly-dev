import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';

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
    soal: 1,
    total: 10,
    question: 'Dalam negosiasi dengan klien, strategi terbaik untuk mencapai win-win solution adalah?',
    options: ['Fokus pada kepentingan bersama', 'Memaksakan kehendak', 'Menghindar dari konflik', 'Kompetisi agresif'],
    correctIndex: 0,
    wrongIndex: 1,
  },
  {
    type: 'essay',
    soal: 2,
    total: 10,
    question: 'Jelaskan pendekatan Anda ketika menghadapi konflik antar anggota tim dalam sebuah proyek.',
    answer: 'Saya akan mendengarkan perspektif kedua pihak secara objektif, mengidentifikasi akar masalah, dan memfasilitasi diskusi untuk mencapai solusi yang adil.',
  },
  {
    type: 'pilgan',
    soal: 3,
    total: 10,
    question: 'Ketika deadline proyek sangat ketat namun kualitas harus dijaga, prioritas utama adalah?',
    options: ['Mengorbankan kualitas demi deadline', 'MVP dengan fitur esensial berkualitas', 'Request perpanjangan waktu', 'Skip testing phase'],
    correctIndex: 1,
    wrongIndex: 2,
  },
  {
    type: 'essay',
    soal: 4,
    total: 10,
    question: 'Bagaimana cara Anda mengelola ekspektasi stakeholder yang tidak realistis?',
    answer: 'Komunikasikan dengan data dan fakta tentang batasan yang ada, tawarkan alternatif solusi yang achievable, dan tetap transparan tentang trade-off dari setiap keputusan.',
  },
  {
    type: 'pilgan',
    soal: 5,
    total: 10,
    question: 'Dalam presentasi proposal ke manajemen, elemen paling krusial adalah?',
    options: ['Data dan metrik yang mendukung', 'Desain slide yang menarik', 'Durasi presentasi singkat', 'Storytelling emosional'],
    correctIndex: 0,
    wrongIndex: 1,
  },
  {
    type: 'essay',
    soal: 6,
    total: 10,
    question: 'Deskripsikan strategi Anda untuk membangun relasi profesional dengan klien baru.',
    answer: 'Memulai dengan mendengarkan kebutuhan mereka secara mendalam, memberikan value di setiap interaksi, konsisten dalam komunikasi dan delivery.',
  },
  {
    type: 'pilgan',
    soal: 7,
    total: 10,
    question: 'Saat menerima feedback negatif dari atasan, respons terbaik adalah?',
    options: ['Defensif dan menjelaskan alasan', 'Menerima dan bertanya solusi', 'Mengabaikan feedback tersebut', 'Langsung resign'],
    correctIndex: 1,
    wrongIndex: 0,
  },
  {
    type: 'essay',
    soal: 8,
    total: 10,
    question: 'Jelaskan bagaimana Anda menangani situasi di mana resource tim sangat terbatas namun target tetap tinggi.',
    answer: 'Prioritaskan task berdasarkan impact dan urgency, optimalkan proses dengan efisiensi, dan komunikasikan constraint ke stakeholder dengan proposal realistis.',
  },
  {
    type: 'pilgan',
    soal: 9,
    total: 10,
    question: 'Ketika tim mengalami burnout di tengah proyek penting, langkah pertama yang harus diambil adalah?',
    options: ['Menambah jam kerja untuk kejar target', 'Evaluasi beban kerja dan redistribute', 'Ganti anggota tim yang burnout', 'Biarkan sampai selesai'],
    correctIndex: 1,
    wrongIndex: 0,
  },
  {
    type: 'essay',
    soal: 10,
    total: 10,
    question: 'Bagaimana Anda mengambil keputusan strategis ketika data yang tersedia terbatas dan waktu mendesak?',
    answer: 'Kumpulkan informasi kritis dengan cepat, analisis berdasarkan pengalaman, konsultasi dengan expert jika memungkinkan, buat keputusan dengan calculated risk.',
  },
];

// Stack visual constants
const CARD_HEIGHT = 360;

// ─── Pilgan ───────────────────────────────────────────────────────────────────

function PilganContent({ card, preview = false }: { card: PilganCard; preview?: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (preview) return;
    setSelectedIndex(null);
    setWrongIdx(null);
    t.current = setTimeout(() => {
      setSelectedIndex(card.wrongIndex);
      t.current = setTimeout(() => {
        setWrongIdx(card.wrongIndex);
        setSelectedIndex(null);
        t.current = setTimeout(() => {
          setWrongIdx(null);
          setSelectedIndex(card.correctIndex);
        }, 400);
      }, 750);
    }, 350);
    return () => { if (t.current) clearTimeout(t.current); };
  }, [card, preview]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Pilihan Ganda
        </span>
        <div className="h-px flex-1 bg-zinc-100" />
        <span className="text-[8px] font-medium tabular-nums text-zinc-300">
          {card.soal}/{card.total}
        </span>
      </div>

      <p className="text-[11px] font-medium leading-[1.6] text-zinc-700 mb-4">
        {card.question}
      </p>

      <div className="flex flex-col gap-2 flex-1">
        {card.options.map((opt, i) => {
          const isSel = !preview && selectedIndex === i;
          const isWrong = !preview && wrongIdx === i;

          return (
            <motion.div
              key={i}
              animate={
                isWrong
                  ? { backgroundColor: '#fef2f2', borderColor: '#fca5a5', x: [0, 3, -2, 0] }
                  : isSel
                  ? { backgroundColor: '#18181b', borderColor: '#18181b', x: 0 }
                  : { backgroundColor: '#ffffff', borderColor: '#e4e4e7', x: 0 }
              }
              transition={{
                backgroundColor: { duration: 0.18 },
                borderColor: { duration: 0.18 },
                x: isWrong ? { duration: 0.26, times: [0, 0.3, 0.7, 1] } : { duration: 0.18 },
              }}
              className="flex items-center gap-2.5 border px-3 py-2.5"
            >
              <motion.div
                animate={{
                  borderColor: isWrong ? '#f87171' : isSel ? '#ffffff' : '#d4d4d8',
                  backgroundColor: isSel ? '#ffffff' : 'transparent',
                }}
                transition={{ duration: 0.15 }}
                className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2"
              >
                {isSel && <div className="h-2 w-2 rounded-full bg-zinc-900" />}
                {isWrong && <div className="h-2 w-2 rounded-full bg-red-400" />}
              </motion.div>

              <motion.span
                animate={{ color: isWrong ? '#ef4444' : isSel ? '#ffffff' : '#52525b' }}
                transition={{ duration: 0.15 }}
                className="text-[10px] flex-1 leading-relaxed"
              >
                {opt}
              </motion.span>

              {isSel && i === card.correctIndex && (
                <Check className="h-3.5 w-3.5 shrink-0 text-white" strokeWidth={2.5} />
              )}
              {isWrong && (
                <X className="h-3.5 w-3.5 shrink-0 text-red-400" strokeWidth={2.5} />
              )}
            </motion.div>
          );
        })}
      </div>

      <Footer soal={card.soal} total={card.total} />
    </div>
  );
}

// ─── Essay ────────────────────────────────────────────────────────────────────

function EssayContent({ card, preview = false }: { card: EssayCard; preview?: boolean }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (preview) {
      setDisplayed(card.answer.slice(0, 52) + '…');
      setDone(false);
      return;
    }
    setDisplayed('');
    setDone(false);
    let i = 0;
    function tick() {
      if (i >= card.answer.length) { setDone(true); return; }
      setDisplayed(card.answer.slice(0, i + 1));
      const ch = card.answer[i];
      const delay = ch === '.' || ch === ',' ? 110 : ch === ' ' ? 22 : 16;
      i++;
      t.current = setTimeout(tick, delay);
    }
    t.current = setTimeout(tick, 160);
    return () => { if (t.current) clearTimeout(t.current); };
  }, [card, preview]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Esai
        </span>
        <div className="h-px flex-1 bg-zinc-100" />
        <span className="text-[8px] font-medium tabular-nums text-zinc-300">
          {card.soal}/{card.total}
        </span>
      </div>

      <p className="text-[11px] font-medium leading-[1.6] text-zinc-700 mb-4">
        {card.question}
      </p>

      <div className="flex-1 overflow-hidden border border-zinc-200 bg-zinc-50 px-3 py-2.5">
        <p className="text-[10px] leading-[1.72] text-zinc-600">
          {displayed}
          {!done && !preview && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="ml-px inline-block h-[10px] w-px translate-y-px bg-zinc-500"
            />
          )}
          {done && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="ml-1 inline-flex items-center gap-0.5 text-[8px] uppercase tracking-widest text-zinc-400"
            >
              <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
              selesai
            </motion.span>
          )}
        </p>
      </div>

      <Footer soal={card.soal} total={card.total} />
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ soal, total }: { soal: number; total: number }) {
  return (
    <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between shrink-0">
      <div className="flex gap-0.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-[2.5px] w-4 transition-colors duration-300"
            style={{ backgroundColor: i < soal ? '#18181b' : '#e4e4e7' }}
          />
        ))}
      </div>
      <span className="text-[8px] tabular-nums font-medium text-zinc-400">
        {soal} / {total}
      </span>
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function CardShell({
  card,
  preview = false,
  dimmed = false,
}: {
  card: Card;
  preview?: boolean;
  dimmed?: boolean;
}) {
  return (
    <div
      className="bg-white border border-zinc-200 px-4 py-4 w-full overflow-hidden transition-opacity"
      style={{ height: CARD_HEIGHT, opacity: dimmed ? 0.4 : 1 }}
    >
      {card.type === 'pilgan' ? (
        <PilganContent card={card} preview={preview} />
      ) : (
        <EssayContent card={card} preview={preview} />
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AssessmentInteractiveAnimation() {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function schedule() {
      timerRef.current = setTimeout(() => {
        setIsTransitioning(true);
        timerRef.current = setTimeout(() => {
          setIndex((p) => (p + 1) % CARDS.length);
          setIsTransitioning(false);
          schedule();
        }, 600);
      }, 5000);
    }
    schedule();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const currentCard = CARDS[index];
  const nextCard = CARDS[(index + 1) % CARDS.length];
  const afterNextCard = CARDS[(index + 2) % CARDS.length];

  return (
    <div className="relative flex justify-center w-full px-4">
      <div className="relative top-8 max-w-4xl w-full" style={{ height: CARD_HEIGHT + 40 }}>
        {/* Stack card 2 - furthest back */}
        <motion.div
          className="absolute inset-x-0 pointer-events-none"
          animate={{
            y: isTransitioning ? -8 : -16,
            scale: isTransitioning ? 0.97 : 0.94,
          }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ zIndex: 1, top: CARD_HEIGHT }}
        >
          <CardShell card={afterNextCard} preview dimmed />
        </motion.div>

        {/* Stack card 1 - middle */}
        <motion.div
          className="absolute inset-x-0 shadow-sm"
          animate={{
            y: isTransitioning ? -16 : -8,
            scale: isTransitioning ? 1 : 0.97,
            zIndex: isTransitioning ? 3 : 2,
          }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ top: CARD_HEIGHT }}
        >
          <CardShell card={nextCard} preview={!isTransitioning} />
        </motion.div>

        {/* Main card - front, slides down */}
        <motion.div
          key={index}
          className="absolute inset-x-0 top-0 overflow-hidden shadow-sm"
          animate={{
            y: isTransitioning ? CARD_HEIGHT + 60 : 0,
            opacity: isTransitioning ? 0 : 1,
            scale: isTransitioning ? 0.95 : 1,
          }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ zIndex: 3 }}
        >
          <CardShell card={currentCard} />
        </motion.div>
      </div>
    </div>
  );
}