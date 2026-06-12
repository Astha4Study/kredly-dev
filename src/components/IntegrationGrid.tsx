import { animate } from 'motion/react';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { ICON_LIST } from './IntegrationIcons';

const COLS = 4;
const ROWS = 2;
const TOTAL = COLS * ROWS;
const ICON_PAD = 0.24;

const INTERVAL_MS = 2200;
const ANIM_DURATION = 0.5;
const ANIM_EASE: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

type Slot = { el: HTMLDivElement; slot: number };

function slotToXY(slot: number, cell: number): { x: number; y: number } {
  const pad = (cell * ICON_PAD) / 2;
  if (slot === -1) return { x: -cell, y: pad };
  if (slot >= TOTAL) return { x: COLS * cell, y: pad + (ROWS - 1) * cell };
  const col = slot % COLS;
  const row = Math.floor(slot / COLS);
  return { x: col * cell + pad, y: row * cell + pad };
}

const iconCache = new Map<string, HTMLDivElement>();

function prewarmCache(iconPx: number) {
  ICON_LIST.forEach((item, realIdx) => {
    const key = `${realIdx}-${iconPx}`;
    if (iconCache.has(key)) return;
    const IconComponent = item.Icon;
    const offscreen = document.createElement('div');
    offscreen.style.cssText = [
      'position:fixed;top:-9999px;left:-9999px;',
      `width:${iconPx}px;height:${iconPx}px;`,
      'visibility:hidden;pointer-events:none;',
    ].join('');
    document.body.appendChild(offscreen);
    const root = createRoot(offscreen);
    flushSync(() => root.render(<IconComponent />));
    iconCache.set(key, offscreen);
  });
}

function getIconEl(idx: number, cell: number): HTMLDivElement {
  const iconPx = Math.round(cell * (1 - ICON_PAD));
  const realIdx =
    ((idx % ICON_LIST.length) + ICON_LIST.length) % ICON_LIST.length;
  const key = `${realIdx}-${iconPx}`;
  if (!iconCache.has(key)) prewarmCache(iconPx);
  const cached = iconCache.get(key)!;
  const clone = cached.cloneNode(true) as HTMLDivElement;
  clone.style.cssText = [
    `width:${iconPx}px;height:${iconPx}px;`,
    'display:flex;align-items:center;justify-content:center;',
    'position:absolute;z-index:3;pointer-events:none;',
    'will-change:left,top;',
    'backface-visibility:hidden;',
    '-webkit-backface-visibility:hidden;',
    'padding:4px;',
  ].join('');
  return clone;
}

export function IntegrationGrid() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const grid = gridRef.current;
    if (!wrapper || !grid) return;

    // Semua timer dalam satu Set — termasuk cleanup timer di step()
    const allTimers = new Set<ReturnType<typeof setTimeout>>();
    const allRafs = new Set<number>();
    let slots: Slot[] = [];
    let nextIdx = 0;
    let cell = 0;
    let isActive = true;
    let stepping = false;

    // Waktu tersisa sebelum step berikutnya saat tab di-hide
    // Dipakai untuk resume dari titik yang sama, bukan mulai ulang
    let remainingMs = INTERVAL_MS;
    let stepScheduledAt = 0; // performance.now() saat timer di-set

    const safeTimeout = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        allTimers.delete(t);
        fn();
      }, ms);
      allTimers.add(t);
      return t;
    };

    const cancelAllTimers = () => {
      allTimers.forEach((t) => clearTimeout(t));
      allTimers.clear();
    };

    const cancelAllRafs = () => {
      allRafs.forEach((r) => cancelAnimationFrame(r));
      allRafs.clear();
    };

    const buildStaticLayer = (c: number) => {
      wrapper
        .querySelectorAll<HTMLElement>('.ig-static')
        .forEach((e) => e.remove());

      const GAP = 12; // jarak kosong di kiri-kanan titik plus pada garis

      // Ambil warna foreground dari CSS variable
      const foregroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--foreground')
        .trim();

      // Garis vertikal (antar kolom) — dibagi jadi segmen atas dan bawah per intersection
      for (let co = 1; co < COLS; co++) {
        for (let r = 0; r < ROWS; r++) {
          const x = co * c;
          const yTop = r * c;
          const yBot = (r + 1) * c;

          // Segmen dari atas cell ke junction bawah (r,r+1) dengan gap
          // Atas: dari yTop ke junction r — dengan gap di junction r (kecuali r=0 tidak ada junction di atas)
          const segTop = document.createElement('div');
          segTop.className = 'ig-static';
          const topStart = r === 0 ? yTop : yTop + GAP;
          const topEnd = yBot - GAP;
          if (topEnd > topStart) {
            segTop.style.cssText = [
              'position:absolute;z-index:1;pointer-events:none;',
              `left:${x}px;top:${topStart}px;`,
              `width:0;height:${topEnd - topStart}px;`,
              `border-left:0.5px solid color-mix(in srgb, ${foregroundColor} 12%, transparent);`,
            ].join('');
            wrapper.appendChild(segTop);
          }
        }
        // Segmen terakhir: dari junction bawah terakhir ke bawah grid
        const lastR = ROWS - 1;
        const segBot = document.createElement('div');
        segBot.className = 'ig-static';
        segBot.style.cssText = [
          'position:absolute;z-index:1;pointer-events:none;',
          `left:${co * c}px;top:${lastR * c + GAP}px;`,
          `width:0;height:${c - GAP}px;`,
          `border-left:0.5px solid color-mix(in srgb, ${foregroundColor} 12%, transparent);`,
        ].join('');
        wrapper.appendChild(segBot);
      }

      // Garis horizontal (antar baris) — dibagi jadi segmen kiri dan kanan per intersection
      for (let r = 1; r < ROWS; r++) {
        for (let co = 0; co < COLS; co++) {
          const y = r * c;
          const xLeft = co * c;
          const xRight = (co + 1) * c;

          const segLeft = document.createElement('div');
          segLeft.className = 'ig-static';
          const leftStart = co === 0 ? xLeft : xLeft + GAP;
          const leftEnd = xRight - GAP;
          if (leftEnd > leftStart) {
            segLeft.style.cssText = [
              'position:absolute;z-index:1;pointer-events:none;',
              `left:${leftStart}px;top:${y}px;`,
              `width:${leftEnd - leftStart}px;height:0;`,
              `border-top:0.5px solid color-mix(in srgb, ${foregroundColor} 12%, transparent);`,
            ].join('');
            wrapper.appendChild(segLeft);
          }
        }
        // Segmen terakhir kanan
        const lastCo = COLS - 1;
        const segRight = document.createElement('div');
        segRight.className = 'ig-static';
        segRight.style.cssText = [
          'position:absolute;z-index:1;pointer-events:none;',
          `left:${lastCo * c + GAP}px;top:${r * c}px;`,
          `width:${c - GAP}px;height:0;`,
          `border-top:0.5px solid color-mix(in srgb, ${foregroundColor} 12%, transparent);`,
        ].join('');
        wrapper.appendChild(segRight);
      }

      // Plus markers — hanya di inner intersections (bukan tepi luar)
      for (let r = 1; r < ROWS; r++) {
        for (let co = 1; co < COLS; co++) {
          const p = document.createElement('div');
          p.className = 'ig-static';
          p.style.cssText = [
            'position:absolute;z-index:4;pointer-events:none;',
            `left:${co * c}px;top:${r * c}px;`,
            'transform:translate(-50%,-50%);',
          ].join('');
          p.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            stroke="color-mix(in srgb, ${foregroundColor} 40%, transparent)" stroke-width="1.5" stroke-linecap="round">
            <line x1="6" y1="0" x2="6" y2="12"/>
            <line x1="0" y1="6" x2="12" y2="6"/>
          </svg>`;
          wrapper.appendChild(p);
        }
      }
    };

    const fullTeardown = () => {
      cancelAllTimers();
      cancelAllRafs();
      grid
        .querySelectorAll<HTMLElement>('.ig-icon-el')
        .forEach((e) => e.remove());
      slots = [];
      stepping = false;
      remainingMs = INTERVAL_MS;
    };

    const snapToCurrentPositions = () => {
      for (let i = slots.length - 1; i >= 0; i--) {
        const s = slots[i];
        if (s.slot < 0 || s.slot >= TOTAL) {
          s.el.remove();
          slots.splice(i, 1);
        } else {
          const { x, y } = slotToXY(s.slot, cell);
          s.el.style.left = `${x}px`;
          s.el.style.top = `${y}px`;
        }
      }
    };

    const scheduleNext = (delayMs = INTERVAL_MS) => {
      stepScheduledAt = performance.now();
      safeTimeout(() => {
        if (!isActive || document.hidden) return;
        step();
      }, delayMs);
    };

    const step = () => {
      if (!isActive || stepping) return;
      stepping = true;

      slots.forEach((s) => {
        const { x, y } = slotToXY(s.slot + 1, cell);
        // Naikkan z-index saat animasi berlangsung
        s.el.style.zIndex = '10';
        animate(
          s.el,
          { left: `${x}px`, top: `${y}px` },
          {
            duration: ANIM_DURATION,
            ease: ANIM_EASE,
            onComplete: () => {
              s.el.style.zIndex = '3'; // reset setelah selesai
            },
          },
        );
        s.slot += 1;
      });

      const newEl = getIconEl(nextIdx, cell);
      newEl.classList.add('ig-icon-el');
      const { x: ex, y: ey } = slotToXY(-1, cell);
      newEl.style.left = `${ex}px`;
      newEl.style.top = `${ey}px`;
      grid.appendChild(newEl);

      const entering: Slot = { el: newEl, slot: -1 };
      slots.unshift(entering);
      nextIdx = (nextIdx + 1) % ICON_LIST.length;

      const raf = requestAnimationFrame(() => {
        allRafs.delete(raf);
        if (!isActive) return;
        const { x: tx, y: ty } = slotToXY(0, cell);
        animate(
          newEl,
          { left: `${tx}px`, top: `${ty}px` },
          {
            duration: ANIM_DURATION,
            ease: ANIM_EASE,
          },
        );
        entering.slot = 0;
      });
      allRafs.add(raf);

      // Cleanup + schedule next — keduanya dalam safeTimeout agar masuk allTimers
      safeTimeout(
        () => {
          if (!isActive) return;
          for (let i = slots.length - 1; i >= 0; i--) {
            if (slots[i].slot >= TOTAL) {
              slots[i].el.remove();
              slots.splice(i, 1);
            }
          }
          stepping = false;
          scheduleNext();
        },
        ANIM_DURATION * 1000 + 100,
      );
    };

    const setup = () => {
      fullTeardown();
      const containerW = wrapper.getBoundingClientRect().width;
      if (containerW === 0) return;

      cell = containerW / COLS;
      const totalH = ROWS * cell;
      wrapper.style.height = `${totalH}px`;
      grid.style.height = `${totalH}px`;

      prewarmCache(Math.round(cell * (1 - ICON_PAD)));
      buildStaticLayer(cell);

      nextIdx = TOTAL % ICON_LIST.length;

      for (let i = 0; i < TOTAL; i++) {
        const el = getIconEl(i, cell);
        el.classList.add('ig-icon-el');
        const { x, y } = slotToXY(i, cell);
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        grid.appendChild(el);
        slots.push({ el, slot: i });
      }

      scheduleNext();
    };

    const handleVisibilityChange = () => {
      if (!isActive) return;

      if (document.hidden) {
        // Hitung sisa waktu sebelum step berikutnya sebelum cancel
        const elapsed = performance.now() - stepScheduledAt;
        remainingMs = Math.max(0, INTERVAL_MS - elapsed);

        // Cancel semua timer dan rAF — termasuk cleanup timer in-flight
        cancelAllTimers();
        cancelAllRafs();

        // Jika step sedang in-flight (animasi jalan tapi cleanup belum),
        // paksa selesaikan state: snap icon ke posisi slot sekarang
        if (stepping) {
          stepping = false;
          snapToCurrentPositions();
        }
      } else {
        // Resume: snap posisi (pastikan tidak ada ghost dari animasi yang ter-cancel)
        // lalu lanjut dengan sisa waktu yang tepat
        snapToCurrentPositions();
        scheduleNext(remainingMs);
        // Reset remainingMs untuk siklus berikutnya
        remainingMs = INTERVAL_MS;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    setup();

    const ro = new ResizeObserver(() => {
      const raf = requestAnimationFrame(() => {
        allRafs.delete(raf);
        if (isActive) setup();
      });
      allRafs.add(raf);
    });
    ro.observe(wrapper);

    return () => {
      isActive = false;
      fullTeardown();
      ro.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="relative w-full max-w-md mx-auto">
        <div
          ref={wrapperRef}
          style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
        >
          <div
            ref={gridRef}
            style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
          />
        </div>
      </div>
    </div>
  );
}
