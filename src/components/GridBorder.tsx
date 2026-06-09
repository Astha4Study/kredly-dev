import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface GridBorderProps {
  children: React.ReactNode;
  className?: string;
  paddingY?: string; // default 'py-12 sm:py-16'
}

interface VerticalLineProps {
  side: 'left' | 'right';
  hasTopNeighbor: boolean;
}

const GAP = 12;

function VerticalLine({ side, hasTopNeighbor }: VerticalLineProps) {
  return (
    <div
      className={`absolute ${
        side === 'left' ? '-left-2 sm:-left-4' : '-right-2 sm:-right-4'
      } -bottom-2 sm:-bottom-4 w-0`}
      style={{ top: hasTopNeighbor ? 0 : -9999 }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 w-px bg-border"
        style={{
          top: hasTopNeighbor ? GAP : 0,
          bottom: GAP,
        }}
      />
    </div>
  );
}

export default function GridBorder({
  children,
  className,
  paddingY = 'py-6 sm:py-8',
}: GridBorderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const markerLeftRef = useRef<HTMLDivElement>(null);
  const markerRightRef = useRef<HTMLDivElement>(null);

  const [hasTopNeighbor, setHasTopNeighbor] = useState(false);
  const [hLineStyle, setHLineStyle] = useState({ left: GAP, right: GAP });
  const [outerWidth, setOuterWidth] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const el = ref.current;
    const ml = markerLeftRef.current;
    const mr = markerRightRef.current;
    if (!el || !ml || !mr) return;

    const update = () => {
      const elRect = el.getBoundingClientRect();
      const mlRect = ml.getBoundingClientRect();
      const mrRect = mr.getBoundingClientRect();

      const leftCenter = mlRect.left + mlRect.width / 2 - elRect.left;
      const rightCenter = elRect.right - (mrRect.left + mrRect.width / 2);

      setHLineStyle({ left: leftCenter + GAP, right: rightCenter + GAP });

      const mlCenterX = mlRect.left + mlRect.width / 2;
      const mrCenterX = mrRect.left + mrRect.width / 2;

      setOuterWidth({
        left: Math.max(0, mlCenterX - GAP),
        right: Math.max(0, window.innerWidth - mrCenterX - GAP),
      });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const section = el.closest('section');
    if (!section) return;
    const prevGridBorder =
      section.previousElementSibling?.querySelector('[data-grid-border]');
    setHasTopNeighbor(Boolean(prevGridBorder));
  }, []);

  const marker = (
    <Plus className="size-4 sm:size-6 text-muted-foreground" strokeWidth={1} />
  );

  return (
    <div ref={ref} data-grid-border className={`relative ${className ?? ''}`}>
      {/* Konten dengan padding vertikal bawaan */}
      <div className={paddingY}>{children}</div>

      <VerticalLine side="left" hasTopNeighbor={hasTopNeighbor} />
      <VerticalLine side="right" hasTopNeighbor={hasTopNeighbor} />

      {/* Garis bawah DALAM (antar marker kiri–kanan) */}
      <div className="absolute -bottom-2 sm:-bottom-4 inset-x-0 h-0 pointer-events-none">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-px bg-border"
          style={hLineStyle}
        />
      </div>

      {/* Marker kiri bawah */}
      <div
        ref={markerLeftRef}
        className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 -translate-x-1/2 translate-y-1/2"
      >
        {marker}
        {/* Garis luar kiri */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-px bg-border pointer-events-none"
          style={{
            right: `calc(50% + ${GAP}px)`,
            width: outerWidth.left,
          }}
        />
      </div>

      {/* Marker kanan bawah */}
      <div
        ref={markerRightRef}
        className="absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 translate-x-1/2 translate-y-1/2"
      >
        {marker}
        {/* Garis luar kanan */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-px bg-border pointer-events-none"
          style={{
            left: `calc(50% + ${GAP}px)`,
            width: outerWidth.right,
          }}
        />
      </div>
    </div>
  );
}
