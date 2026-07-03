 
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
    question:
      'Dalam negosiasi dengan klien, strategi terbaik untuk mencapai win-win solution adalah?',
    options: [
      'Fokus pada kepentingan bersama',
      'Memaksakan kehendak',
      'Menghindar dari konflik',
      'Kompetisi agresif',
    ],
    correctIndex: 0,
    wrongIndex: 1,
  },
  {
    type: 'essay',
    soal: 2,
    total: 10,
    question:
      'Jelaskan pendekatan Anda ketika menghadapi konflik antar anggota tim dalam sebuah proyek.',
    answer:
      'Saya akan mendengarkan perspektif kedua pihak secara objektif, mengidentifikasi akar masalah, dan memfasilitasi diskusi untuk mencapai solusi yang adil.',
  },
  {
    type: 'pilgan',
    soal: 3,
    total: 10,
    question:
      'Ketika deadline proyek sangat ketat namun kualitas harus dijaga, prioritas utama adalah?',
    options: [
      'Mengorbankan kualitas demi deadline',
      'MVP dengan fitur esensial berkualitas',
      'Request perpanjangan waktu',
      'Skip testing phase',
    ],
    correctIndex: 1,
    wrongIndex: 2,
  },
  {
    type: 'essay',
    soal: 4,
    total: 10,
    question:
      'Bagaimana cara Anda mengelola ekspektasi stakeholder yang tidak realistis?',
    answer:
      'Komunikasikan dengan data dan fakta tentang batasan yang ada, tawarkan alternatif solusi yang achievable, dan tetap transparan tentang trade-off dari setiap keputusan.',
  },
  {
    type: 'pilgan',
    soal: 5,
    total: 10,
    question:
      'Dalam presentasi proposal ke manajemen, elemen paling krusial adalah?',
    options: [
      'Data dan metrik yang mendukung',
      'Desain slide yang menarik',
      'Durasi presentasi singkat',
      'Storytelling emosional',
    ],
    correctIndex: 0,
    wrongIndex: 1,
  },
  {
    type: 'essay',
    soal: 6,
    total: 10,
    question:
      'Deskripsikan strategi Anda untuk membangun relasi profesional dengan klien baru.',
    answer:
      'Memulai dengan mendengarkan kebutuhan mereka secara mendalam, memberikan value di setiap interaksi, konsisten dalam komunikasi dan delivery.',
  },
  {
    type: 'pilgan',
    soal: 7,
    total: 10,
    question:
      'Saat menerima feedback negatif dari atasan, respons terbaik adalah?',
    options: [
      'Defensif dan menjelaskan alasan',
      'Menerima dan bertanya solusi',
      'Mengabaikan feedback tersebut',
      'Langsung resign',
    ],
    correctIndex: 1,
    wrongIndex: 0,
  },
  {
    type: 'essay',
    soal: 8,
    total: 10,
    question:
      'Jelaskan bagaimana Anda menangani situasi di mana resource tim sangat terbatas namun target tetap tinggi.',
    answer:
      'Prioritaskan task berdasarkan impact dan urgency, optimalkan proses dengan efisiensi, dan komunikasikan constraint ke stakeholder dengan proposal realistis.',
  },
  {
    type: 'pilgan',
    soal: 9,
    total: 10,
    question:
      'Ketika tim mengalami burnout di tengah proyek penting, langkah pertama yang harus diambil adalah?',
    options: [
      'Menambah jam kerja untuk kejar target',
      'Evaluasi beban kerja dan redistribute',
      'Ganti anggota tim yang burnout',
      'Biarkan sampai selesai',
    ],
    correctIndex: 1,
    wrongIndex: 0,
  },
  {
    type: 'essay',
    soal: 10,
    total: 10,
    question:
      'Bagaimana Anda mengambil keputusan strategis ketika data yang tersedia terbatas dan waktu mendesak?',
    answer:
      'Kumpulkan informasi kritis dengan cepat, analisis berdasarkan pengalaman, konsultasi dengan expert jika memungkinkan, buat keputusan dengan calculated risk.',
  },
];

const CARD_H = 340;

// Responsive heights for different breakpoints
const CARD_H_MOBILE = 280; // for screens < 640px
const CARD_H_TABLET = 320; // for screens 640px - 1024px

// How many cards visible in the stack behind the front
const STACK_DEPTH = 2;
// Per-layer visual offset
const LAYER_Y = 10; // px gap between each stacked card (peeking from bottom)
const LAYER_Y_MOBILE = 6; // smaller gap for mobile
const LAYER_SCALE = 0.034; // scale reduction per layer

// ─── Pilgan ───────────────────────────────────────────────────────────────────

function PilganContent({
  card,
  preview = false,
}: {
  card: PilganCard;
  preview?: boolean;
}) {
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
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, [card, preview]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center gap-2 mb-2 sm:mb-3.5">
        <span className="text-[7px] sm:text-[7.5px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Pilihan Ganda
        </span>
        <div className="h-px flex-1 bg-zinc-100" />
        <span className="text-[7px] sm:text-[7.5px] font-medium tabular-nums text-zinc-300">
          {card.soal}/{card.total}
        </span>
      </div>

      <p className="text-[10px] sm:text-[11px] font-medium leading-[1.6] text-zinc-700 mb-2 sm:mb-3.5 line-clamp-2">
        {card.question}
      </p>

      <div className="flex flex-col gap-1.5 sm:gap-2 flex-1">
        {card.options.map((opt, i) => {
          const isSel = !preview && selectedIndex === i;
          const isWrong = !preview && wrongIdx === i;

          return (
            <motion.div
              key={i}
              animate={
                isWrong
                  ? {
                      backgroundColor: '#fef2f2',
                      borderColor: '#fca5a5',
                      x: [0, 3, -2, 0],
                    }
                  : isSel
                    ? {
                        backgroundColor: '#18181b',
                        borderColor: '#18181b',
                        x: 0,
                      }
                    : {
                        backgroundColor: '#ffffff',
                        borderColor: '#e4e4e7',
                        x: 0,
                      }
              }
              transition={{
                backgroundColor: { duration: 0.18 },
                borderColor: { duration: 0.18 },
                x: isWrong
                  ? { duration: 0.26, times: [0, 0.3, 0.7, 1] }
                  : { duration: 0.18 },
              }}
              className="flex items-center gap-2 sm:gap-2.5 border px-2.5 sm:px-3 py-1.5 sm:py-2"
            >
              <motion.div
                animate={{
                  borderColor: isWrong
                    ? '#f87171'
                    : isSel
                      ? '#ffffff'
                      : '#d4d4d8',
                  backgroundColor: isSel ? '#ffffff' : 'transparent',
                }}
                transition={{ duration: 0.15 }}
                className="flex h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 items-center justify-center rounded-full border-2"
              >
                {isSel && (
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-zinc-900" />
                )}
                {isWrong && (
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-red-400" />
                )}
              </motion.div>

              <motion.span
                animate={{
                  color: isWrong ? '#ef4444' : isSel ? '#ffffff' : '#52525b',
                }}
                transition={{ duration: 0.15 }}
                className="text-[9px] sm:text-[10px] flex-1 leading-relaxed"
              >
                {opt}
              </motion.span>

              {isSel && i === card.correctIndex && (
                <Check
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-white"
                  strokeWidth={2.5}
                />
              )}
              {isWrong && (
                <X
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-red-400"
                  strokeWidth={2.5}
                />
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

function EssayContent({
  card,
  preview = false,
}: {
  card: EssayCard;
  preview?: boolean;
}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (preview) {
      setDisplayed(card.answer.slice(0, 60) + '…');
      setDone(false);
      return;
    }
    setDisplayed('');
    setDone(false);
    let i = 0;
    function tick() {
      if (i >= card.answer.length) {
        setDone(true);
        return;
      }
      setDisplayed(card.answer.slice(0, i + 1));
      const ch = card.answer[i];
      const delay = ch === '.' || ch === ',' ? 110 : ch === ' ' ? 22 : 16;
      i++;
      t.current = setTimeout(tick, delay);
    }
    t.current = setTimeout(tick, 160);
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, [card, preview]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center gap-2 mb-2 sm:mb-3.5">
        <span className="text-[7px] sm:text-[7.5px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Esai
        </span>
        <div className="h-px flex-1 bg-zinc-100" />
        <span className="text-[7px] sm:text-[7.5px] font-medium tabular-nums text-zinc-300">
          {card.soal}/{card.total}
        </span>
      </div>

      <p className="text-[10px] sm:text-[11px] font-medium leading-[1.6] text-zinc-700 mb-2 sm:mb-3.5 line-clamp-2">
        {card.question}
      </p>

      <div className="flex-1 overflow-hidden border border-zinc-200 bg-zinc-50 px-2.5 sm:px-3 py-2 sm:py-2.5">
        <p className="text-[9px] sm:text-[10px] leading-[1.75] text-zinc-600">
          {displayed}
          {!done && !preview && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="ml-px inline-block h-2.5 sm:h-2.75 w-px translate-y-px bg-zinc-500"
            />
          )}
          {done && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="ml-1 inline-flex items-center gap-0.5 text-[7px] sm:text-[7.5px] uppercase tracking-widest text-zinc-400"
            >
              <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5" strokeWidth={2.5} />
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
    <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-zinc-100 flex items-center justify-between shrink-0">
      <div className="flex gap-0.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-0.5 w-2.5 sm:w-3.5 transition-colors duration-300"
            style={{ backgroundColor: i < soal ? '#18181b' : '#e4e4e7' }}
          />
        ))}
      </div>
      <span className="text-[7px] sm:text-[7.5px] tabular-nums font-medium text-zinc-400">
        {soal} / {total}
      </span>
    </div>
  );
}

// ─── Card face ────────────────────────────────────────────────────────────────

function CardFace({
  card,
  preview = false,
}: {
  card: Card;
  preview?: boolean;
}) {
  return (
    <div
      className="bg-white border border-zinc-200 w-full overflow-hidden h-70 sm:h-80 lg:h-85 px-3 sm:px-4 py-3 sm:py-4"
      style={{
        maxWidth: '100%',
      }}
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
  const [frontIndex, setFrontIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine card height based on screen size
  const [cardHeight, setCardHeight] = useState(CARD_H);
  const [layerY, setLayerY] = useState(LAYER_Y);

  useEffect(() => {
    function updateDimensions() {
      if (window.innerWidth < 640) {
        setCardHeight(CARD_H_MOBILE);
        setLayerY(LAYER_Y_MOBILE);
      } else if (window.innerWidth < 1024) {
        setCardHeight(CARD_H_TABLET);
        setLayerY(LAYER_Y);
      } else {
        setCardHeight(CARD_H);
        setLayerY(LAYER_Y);
      }
    }

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    function schedule() {
      timerRef.current = setTimeout(() => {
        setExiting(true);
        timerRef.current = setTimeout(() => {
          setFrontIndex((p) => (p + 1) % CARDS.length);
          setExiting(false);
          schedule();
        }, 700);
      }, 5000);
    }
    schedule();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const SLOTS = STACK_DEPTH + 2; // render 1 extra for the entering card from back

  function slotProps(slot: number) {
    if (!exiting) {
      // idle state
      if (slot >= STACK_DEPTH + 1) {
        // hidden slot - card waiting to enter from back
        const y = (STACK_DEPTH + 1) * layerY;
        const scale = 1 - (STACK_DEPTH + 1) * LAYER_SCALE;
        const opacity = 0;
        const zIndex = 0;
        return { y, scale, opacity, zIndex };
      }
      const y = slot * layerY;
      const scale = 1 - slot * LAYER_SCALE;
      const opacity = slot === 0 ? 1 : slot === 1 ? 0.85 : 0.6;
      const zIndex = (STACK_DEPTH + 1 - slot) * 10;
      return { y, scale, opacity, zIndex };
    } else {
      // exiting state
      if (slot === 0) {
        // front card slides down and out
        const y = cardHeight + 80;
        const scale = 0.88;
        const opacity = 0;
        const zIndex = 40; // stay on top while exiting
        return { y, scale, opacity, zIndex };
      } else {
        // all other cards advance by one position
        const targetSlot = slot - 1;
        const y = targetSlot * layerY;
        const scale = 1 - targetSlot * LAYER_SCALE;
        const opacity =
          targetSlot === 0
            ? 1
            : targetSlot === 1
              ? 0.85
              : targetSlot === 2
                ? 0.6
                : 0.4;
        const zIndex = (STACK_DEPTH + 1 - targetSlot) * 10;
        return { y, scale, opacity, zIndex };
      }
    }
  }

  const ease = [0.25, 0.46, 0.45, 0.94] as const;
  const exitEase = [0.4, 0.0, 0.2, 1.0] as const;
  const DUR = 0.7;

  return (
    <div className="flex justify-center w-full px-4 sm:px-6">
      <div
        className="relative top-6 sm:top-8 lg:top-12 overflow-visible max-w-4xl w-full mx-auto"
        style={{
          height: cardHeight + STACK_DEPTH * layerY + 8,
        }}
      >
        {Array.from({ length: SLOTS }).map((_, slot) => {
          const cardIndex = (frontIndex + slot) % CARDS.length;
          const card = CARDS[cardIndex];
          const { y, scale, opacity, zIndex } = slotProps(slot);

          return (
            <motion.div
              key={`${frontIndex}-${slot}`}
              className="absolute top-0 left-0 right-0 origin-top"
              style={{ zIndex }}
              animate={{ y, scale, opacity }}
              transition={{
                duration: DUR,
                ease: slot === 0 && exiting ? exitEase : ease,
              }}
            >
              <div className="shadow-sm">
                <CardFace card={card} preview={slot !== 0 && !exiting} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
