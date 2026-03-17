import { useState, useRef } from 'react';
import { Dinosaur } from '@/data/types';

const DINO_COLORS = [
  'hsl(4, 72%, 62%)',
  'hsl(214, 65%, 62%)',
  'hsl(158, 48%, 52%)',
  'hsl(38, 72%, 58%)',
  'hsl(278, 52%, 64%)',
  'hsl(188, 58%, 56%)',
];

const PERIODS = [
  { name: 'Permian',    start: 299, end: 252, bg: 'hsl(30,28%,14%)',  border: 'hsl(30,35%,28%)' },
  { name: 'Triassic',   start: 252, end: 201, bg: 'hsl(0,26%,14%)',   border: 'hsl(0,32%,28%)' },
  { name: 'Jurassic',   start: 201, end: 145, bg: 'hsl(140,20%,14%)', border: 'hsl(140,28%,26%)' },
  { name: 'Cretaceous', start: 145, end: 66,  bg: 'hsl(210,26%,14%)', border: 'hsl(210,34%,28%)' },
];

const T_START = 299;
const T_END   = 60;
const SPAN    = T_START - T_END;

function myaToPercent(mya: number) {
  return ((T_START - mya) / SPAN) * 100;
}

interface TooltipData {
  dino: Dinosaur;
  color: string;
  markerX: number;
}

interface Props { dinosaurs: Dinosaur[] }

export default function InteractiveTimeline({ dinosaurs }: Props) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const tickMarks = [299, 270, 240, 210, 180, 150, 120, 90, 66];

  return (
    <div className="flex flex-col gap-0 select-none">
      <div
        ref={containerRef}
        className="relative overflow-x-auto"
        style={{
          overflowY: 'visible',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style>{`
          .tl-scroll::-webkit-scrollbar { display: none; }
          @keyframes tipFadeIn {
            from { opacity: 0; transform: translateX(-50%) scale(0.93); }
            to   { opacity: 1; transform: translateX(-50%) scale(1);    }
          }
        `}</style>

        <div
          ref={trackRef}
          className="tl-scroll"
          style={{ minWidth: 520, paddingBottom: 24, paddingTop: 8, position: 'relative' }}
        >
          {/* Period labels */}
          <div className="relative flex" style={{ height: 20, marginBottom: 4 }}>
            {PERIODS.map(p => {
              const left = myaToPercent(p.start);
              const width = ((p.start - p.end) / SPAN) * 100;
              return (
                <div
                  key={p.name}
                  className="absolute flex items-center justify-center"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: p.border,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {p.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Period bar */}
          <div
            className="relative flex rounded-md overflow-hidden"
            style={{ height: 36, border: '1px solid hsl(0,0%,14%)' }}
          >
            {PERIODS.map((p, pi) => {
              const width = ((p.start - p.end) / SPAN) * 100;
              return (
                <div
                  key={p.name}
                  style={{
                    width: `${width}%`,
                    background: p.bg,
                    borderRight: pi < PERIODS.length - 1 ? `1px solid hsl(0,0%,12%)` : 'none',
                    flexShrink: 0,
                  }}
                />
              );
            })}

            {/* K-Pg marker */}
            <div
              style={{
                position: 'absolute',
                left: `${myaToPercent(66)}%`,
                top: 0,
                bottom: 0,
                width: 2,
                background: 'hsl(0,75%,56%)',
                boxShadow: '0 0 6px hsl(0,75%,56%)',
                opacity: 0.75,
                zIndex: 4,
              }}
            />
            <span style={{
              position: 'absolute',
              left: `calc(${myaToPercent(66)}% + 4px)`,
              top: 4,
              fontSize: 7.5,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'hsl(0,70%,68%)',
              opacity: 0.9,
              zIndex: 4,
              pointerEvents: 'none',
            }}>K-Pg</span>
          </div>

          {/* Dinosaur track rows */}
          <div
            className="relative mt-3"
            style={{ height: dinosaurs.length * 28 + 8, overflow: 'visible' }}
          >
            {/* Track guides */}
            {dinosaurs.map((_, i) => (
              <div key={`guide-${i}`} style={{
                position: 'absolute',
                top: 14 + i * 28,
                left: 0,
                right: 0,
                height: 1,
                background: 'hsl(0,0%,10%)',
              }} />
            ))}

            {/* Dino ranges */}
            {dinosaurs.map((d, i) => {
              const leftPct = myaToPercent(d.periodRange.start);
              const rightPct = myaToPercent(d.periodRange.end);
              const widthPct = Math.max(rightPct - leftPct, 0.8);
              const color = DINO_COLORS[i % DINO_COLORS.length];
              const midPct = leftPct + widthPct / 2;
              const isHovered = tooltip?.dino.id === d.id;
              const rowTop = 8 + i * 28;

              return (
                <div
                  key={d.id}
                  style={{ position: 'absolute', top: rowTop, left: `${leftPct}%`, width: `${widthPct}%`, height: 12, zIndex: isHovered ? 20 : 5, cursor: 'pointer' }}
                  onMouseEnter={() => {
                    setTooltip({ dino: d, color, markerX: leftPct });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* Range pill */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 999,
                      background: `linear-gradient(to right, ${color}bb, ${color}44)`,
                      boxShadow: isHovered ? `0 0 10px ${color}88` : 'none',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s ease',
                    }}
                  />

                  {/* Start dot */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: isHovered ? 11 : 8,
                    height: isHovered ? 11 : 8,
                    borderRadius: '50%',
                    background: color,
                    boxShadow: isHovered ? `0 0 10px ${color}` : `0 0 5px ${color}88`,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    zIndex: 6,
                  }} />

                  {/* Tooltip */}
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 10px)',
                        left: `${Math.min(Math.max(50, 0), 100)}%`,
                        transform: 'translateX(-50%)',
                        zIndex: 100,
                        pointerEvents: 'none',
                        animation: 'tipFadeIn 0.16s ease-out forwards',
                        minWidth: 150,
                        maxWidth: 200,
                      }}
                    >
                      <div style={{
                        background: 'rgba(8,10,14,0.94)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: `1px solid ${color}40`,
                        borderRadius: 9,
                        padding: '7px 11px',
                        boxShadow: `0 6px 22px rgba(0,0,0,0.55), 0 0 10px ${color}18`,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 3, lineHeight: 1.3, wordBreak: 'break-word' }}>
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
              );
            })}
          </div>

          {/* MYA tick scale */}
          <div className="relative" style={{ height: 22 }}>
            {tickMarks.map(mya => {
              const leftPct = myaToPercent(mya);
              if (leftPct < 0 || leftPct > 100) return null;
              return (
                <div
                  key={mya}
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    top: 0,
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ width: 1, height: 4, background: 'hsl(0,0%,22%)' }} />
                  <span style={{ fontSize: 7.5, color: 'hsl(0,0%,38%)', marginTop: 1, whiteSpace: 'nowrap' }}>
                    {mya}
                  </span>
                </div>
              );
            })}
            <span style={{ position: 'absolute', right: 0, bottom: 0, fontSize: 7, color: 'hsl(0,0%,30%)', whiteSpace: 'nowrap' }}>
              MYA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
