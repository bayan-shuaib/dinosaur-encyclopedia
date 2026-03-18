import { useState, useRef, useCallback } from 'react';
import { Dinosaur } from '@/data/types';

const COLORS = [
  'hsl(4, 72%, 62%)',
  'hsl(214, 65%, 62%)',
  'hsl(158, 48%, 52%)',
  'hsl(38, 72%, 58%)',
  'hsl(278, 52%, 64%)',
  'hsl(188, 58%, 56%)',
];

const PERIODS = [
  { name: 'Permian',    start: 299, end: 252, bg: 'hsl(30,26%,12%)',  accent: 'hsl(30,40%,38%)' },
  { name: 'Triassic',   start: 252, end: 201, bg: 'hsl(10,26%,13%)',  accent: 'hsl(10,40%,40%)' },
  { name: 'Jurassic',   start: 201, end: 145, bg: 'hsl(140,22%,12%)', accent: 'hsl(140,36%,36%)' },
  { name: 'Cretaceous', start: 145, end: 66,  bg: 'hsl(210,26%,12%)', accent: 'hsl(210,40%,38%)' },
];

const TOTAL_START = 299;
const TOTAL_END   = 62;
const TOTAL_SPAN  = TOTAL_START - TOTAL_END;
const TICK_MARKS  = [299, 270, 240, 210, 180, 150, 120, 90, 66];

function pct(mya: number) {
  return ((TOTAL_START - mya) / TOTAL_SPAN) * 100;
}

interface TooltipState {
  dino: Dinosaur;
  color: string;
  side: 'left' | 'right' | 'center';
  barLeftPct: number;
}

interface Props { dinosaurs: Dinosaur[] }

export default function InteractiveTimeline({ dinosaurs }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleEnter = useCallback((
    e: React.MouseEvent<HTMLDivElement>,
    dino: Dinosaur,
    color: string,
    barLeftPct: number,
  ) => {
    const scroll = scrollRef.current;
    if (!scroll) {
      setTooltip({ dino, color, side: 'center', barLeftPct });
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = scroll.getBoundingClientRect();
    const relLeft = rect.left - containerRect.left;
    const relRight = containerRect.right - rect.left;
    const EDGE = 160;
    let side: 'left' | 'right' | 'center' = 'center';
    if (relLeft < EDGE) side = 'right';
    else if (relRight < EDGE) side = 'left';
    setTooltip({ dino, color, side, barLeftPct });
  }, []);

  return (
    <div className="select-none">
      <style>{`
        .tl-outer::-webkit-scrollbar { display: none; }
        @keyframes tlFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      <div
        ref={scrollRef}
        className="tl-outer"
        style={{
          overflowX: 'auto',
          overflowY: 'visible',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{ minWidth: 560, paddingBottom: 6, paddingTop: 4, position: 'relative' }}>

          {/* Period labels row */}
          <div style={{ display: 'flex', marginBottom: 4 }}>
            {PERIODS.map(p => {
              const w = ((p.start - p.end) / TOTAL_SPAN) * 100;
              return (
                <div key={p.name} style={{ width: `${w}%`, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                  <span style={{
                    fontSize: 8.5,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: p.accent,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                    padding: '0 4px',
                  }}>
                    {p.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Period segments bar */}
          <div style={{ display: 'flex', height: 32, borderRadius: 6, overflow: 'hidden', border: '1px solid hsl(0,0%,13%)', position: 'relative' }}>
            {PERIODS.map((p, pi) => {
              const w = ((p.start - p.end) / TOTAL_SPAN) * 100;
              return (
                <div
                  key={p.name}
                  style={{
                    width: `${w}%`,
                    flexShrink: 0,
                    background: p.bg,
                    borderRight: pi < PERIODS.length - 1 ? '1px solid hsl(0,0%,10%)' : 'none',
                    position: 'relative',
                  }}
                />
              );
            })}

            {/* K-Pg extinction marker */}
            <div style={{
              position: 'absolute',
              left: `${pct(66)}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: 'hsl(0,78%,58%)',
              boxShadow: '0 0 8px hsl(0,78%,58%), 0 0 3px hsl(0,78%,58%)',
              opacity: 0.8,
              zIndex: 5,
            }} />
            <span style={{
              position: 'absolute',
              left: `calc(${pct(66)}% + 4px)`,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 7,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'hsl(0,72%,70%)',
              zIndex: 5,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}>K-Pg</span>
          </div>

          {/* Dinosaur range rows */}
          <div style={{ position: 'relative', marginTop: 10, paddingBottom: 4 }}>
            {dinosaurs.map((d, i) => {
              const leftPct  = pct(d.periodRange.start);
              const rightPct = pct(d.periodRange.end);
              const widthPct = Math.max(rightPct - leftPct, 1.2);
              const color    = COLORS[i % COLORS.length];
              const isHov    = tooltip?.dino.id === d.id;

              return (
                <div
                  key={d.id}
                  style={{ position: 'relative', height: 26, marginBottom: 2 }}
                >
                  {/* Track guide */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '50%',
                    height: 1,
                    background: 'hsl(0,0%,10%)',
                    transform: 'translateY(-50%)',
                  }} />

                  {/* Dino bar trigger area */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: 12,
                      cursor: 'pointer',
                      zIndex: isHov ? 20 : 5,
                    }}
                    onMouseEnter={e => handleEnter(e, d, color, leftPct)}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {/* Range pill */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 999,
                      background: `linear-gradient(to right, ${color}cc, ${color}44)`,
                      boxShadow: isHov ? `0 0 12px ${color}88` : 'none',
                      transition: 'box-shadow 0.2s ease',
                    }} />

                    {/* Start dot */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: isHov ? 12 : 9,
                      height: isHov ? 12 : 9,
                      borderRadius: '50%',
                      background: color,
                      boxShadow: isHov ? `0 0 12px ${color}` : `0 0 6px ${color}88`,
                      transition: 'all 0.18s ease',
                      zIndex: 6,
                    }} />

                    {/* Dino name label inside bar (only if wide enough) */}
                    {widthPct > 8 && (
                      <span style={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 8,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.7)',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        letterSpacing: '0.04em',
                      }}>
                        {d.name}
                      </span>
                    )}

                    {/* Tooltip */}
                    {isHov && tooltip && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 10px)',
                          ...(tooltip.side === 'right'
                            ? { left: 0 }
                            : tooltip.side === 'left'
                            ? { right: 0 }
                            : { left: '50%', transform: 'translateX(-50%)' }),
                          zIndex: 200,
                          pointerEvents: 'none',
                          animation: 'tlFadeIn 0.15s ease-out forwards',
                        }}
                      >
                        <div style={{
                          background: 'rgba(7,9,13,0.95)',
                          backdropFilter: 'blur(14px)',
                          WebkitBackdropFilter: 'blur(14px)',
                          border: `1px solid ${color}44`,
                          borderRadius: 8,
                          padding: '8px 12px',
                          boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 12px ${color}18`,
                          maxWidth: 200,
                          width: 'max-content',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 3, lineHeight: 1.35 }}>
                            {d.name}
                          </p>
                          <p style={{ fontSize: 9.5, color, marginBottom: 2, lineHeight: 1.4 }}>
                            {d.period}
                          </p>
                          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
                            {d.periodRange.start}–{d.periodRange.end} MYA
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* MYA tick scale */}
          <div style={{ position: 'relative', height: 22, marginTop: 4 }}>
            {TICK_MARKS.map(mya => {
              const left = pct(mya);
              if (left < 0 || left > 100) return null;
              return (
                <div
                  key={mya}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    top: 0,
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <div style={{ width: 1, height: 5, background: 'hsl(0,0%,24%)' }} />
                  <span style={{ fontSize: 7.5, color: 'hsl(0,0%,40%)', whiteSpace: 'nowrap' }}>
                    {mya}
                  </span>
                </div>
              );
            })}
            <span style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              fontSize: 7,
              color: 'hsl(0,0%,32%)',
              whiteSpace: 'nowrap',
            }}>
              MYA
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
