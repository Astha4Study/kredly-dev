import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface GridBorderProps {
  children: React.ReactNode;
  className?: string;
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

export default function GridBorder({ children, className }: GridBorderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const markerLeftRef = useRef<HTMLDivElement>(null);
  const markerRightRef = useRef<HTMLDivElement>(null);

  const [hasTopNeighbor, setHasTopNeighbor] = useState(false);

  const [hLineStyle, setHLineStyle] = useState({
    left: GAP,
    right: GAP,
  });

  useEffect(() => {
    const el = ref.current;
    const ml = markerLeftRef.current;
    const mr = markerRightRef.current;

    if (!el || !ml || !mr) return;

    const updateLine = () => {
      const elRect = el.getBoundingClientRect();
      const mlRect = ml.getBoundingClientRect();
      const mrRect = mr.getBoundingClientRect();

      const leftCenter = mlRect.left + mlRect.width / 2 - elRect.left;

      const rightCenter = elRect.right - (mrRect.left + mrRect.width / 2);

      setHLineStyle({
        left: leftCenter + GAP,
        right: rightCenter + GAP,
      });
    };

    updateLine();

    window.addEventListener('resize', updateLine);

    return () => {
      window.removeEventListener('resize', updateLine);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const section = el.closest('section');

    if (!section) return;

    const prevSection = section.previousElementSibling;

    const prevGridBorder = prevSection?.querySelector('[data-grid-border]');

    setHasTopNeighbor(Boolean(prevGridBorder));
  }, []);

  const marker = (
    <Plus className="size-4 sm:size-6 text-muted-foreground" strokeWidth={1} />
  );

  return (
    <div ref={ref} data-grid-border className={`relative ${className ?? ''}`}>
      {children}

      <VerticalLine side="left" hasTopNeighbor={hasTopNeighbor} />

      <VerticalLine side="right" hasTopNeighbor={hasTopNeighbor} />

      {/* Garis bawah */}
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
      </div>

      {/* Marker kanan bawah */}
      <div
        ref={markerRightRef}
        className="absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 translate-x-1/2 translate-y-1/2"
      >
        {marker}
      </div>
    </div>
  );
}
