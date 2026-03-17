import { useState, useRef } from 'react';
import { Dinosaur } from '@/data/types';

const DINO_COLORS = [
  'hsl(0, 65%, 62%)',
  'hsl(213, 60%, 62%)',
  'hsl(160, 45%, 52%)',
  'hsl(38, 70%, 58%)',
  'hsl(280, 50%, 62%)',
  'hsl(185, 55%, 55%)',
];

const PERIODS = [
  { name: 'Permian',    start: 299, end: 252, color: 'hsl(30,30%,22%)',  label: 'hsl(30,40%,60%)' },
  { name: 'Triassic',   start: 252, end: 201, color: 'hsl(0,28%,22%)',   label: 'hsl(0,45%,62%)' },
  { name: 'Jurassic',   start: 201, end: 145, color: 'hsl(142,22%,20%)', label: 'hsl(142,40%,52%)' },
  { name: 'Cretaceous', start: 145, end: 66,  color: 'hsl(210,28%,22%)', label: 'hsl(210,50%,62%)' },
];

const TIMELINE_START = 300;
const TIMELINE_END = 60;
const TOTAL_SPAN = TIMELINE_START - TIMELINE_END;

interface Props {
  dinosaurs: Dinosaur[];
}

export default function InteractiveTimeline({ dinosaurs }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const myaToPercent = (mya: number) => ((TIMELINE_START - mya) / TOTAL_SPAN) * 100;

  return (
    <div className="flex flex-col h-full select-none">
      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-visible"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          paddingBottom: 8,
        }}
      >
        <style>{`
          .timeline-scroll::-webkit-scrollbar { display: none; }
          @keyframes tooltipIn {
            from { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.95); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);    }
          }
        `}</style>

        <div className="timeline-scroll" style={{ minWidth: 480 }}>

          {/* Period label row */}
          <div className="relative h-5 mb-1" style={{ overflow: 'visible' }}>
            {PERIODS.map(p => {
              const left = myaToPercent(p.start);
              const width = ((p.start - p.end) / TOTAL_SPAN) * 100;
              return (
                <span
                  key={p.name}
                  className="absolute text-[9px] font-semibold tracking-wider uppercase text-center"
                  style={{ left: `${left}%`, width: `${width}%`, color: p.label, opacity: 0.85 }}
                >
                  {p.name}
                </span>
              );
            })}
          </div>

          {/* Period segments bar */}
          <div className="relative h-8 rounded-lg overflow-hidden flex" style={{ border: '1px solid hsl(0,0%,14%)' }}>
            {PERIODS.map(p => {
              const width = ((p.start - p.end) / TOTAL_SPAN) * 100;
              return (
                <div
                  key={p.name}
                  style={{ width: `${width}%`, backgroundColor: p.color }}
                  className="h-full relative flex items-center justify-center"
                >
                  {/* Separator */}
                  <div className="absolute right-0 top-0 h-full w-px" style={{ background: 'hsl(0,0%,12%)' }} />
                </div>
              );
            })}

            {/* K-Pg extinction marker */}
            <div
              className="absolute top-0 h-full"
              style={{
                left: `${myaToPercent(66)}%`,
                width: 1.5,
                background: 'hsl(0,75%,58%)',
                boxShadow: '0 0 6px hsl(0,75%,58%)',
                opacity: 0.7,
                zIndex: 2,
              }}
            />
            <span
              className="absolute text-[7px] font-semibold"
              style={{
                left: `calc(${myaToPercent(66)}% + 3px)`,
                top: 3,
                color: 'hsl(0,75%,68%)',
                opacity: 0.8,
                letterSpacing: '0.05em',
                zIndex: 2,
              }}
            >
              K-Pg
            </span>
          </div>

          {/* Dinosaur marker row */}
          <div className="relative mt-3" style={{ height: dinosaurs.length * 28 + 12, overflow: 'visible' }}>
            {/* Subtle track lines per dino */}
            {dinosaurs.map((_, i) => (
              <div
                key={`track-${i}`}
                className="absolute rounded-full"
                style={{
                  top: 10 + i * 28,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: 'hsl(0,0%,10%)',
                }}
              />
            ))}

            {/* Dino range indicators */}
            {dinosaurs.map((d, i) => {
              const left = myaToPercent(d.periodRange.start);
              const right = myaToPercent(d.periodRange.end);
              const width = Math.max(right - left, 1);
              const color = DINO_COLORS[i % DINO_COLORS.length];
              const isHovered = hoveredId === d.id;
              const cy = 10 + i * 28;
              const midX = left + width / 2;

              return (
                <div
                  key={d.id}
                  className="absolute"
                  style={{ top: cy - 4, left: `${left}%`, width: `${width}%`, height: 8, zIndex: isHovered ? 20 : 10 }}
                  onMouseEnter={() => setHoveredId(d.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Range bar */}
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${color}99, ${color}55)`,
                      boxShadow: isHovered ? `0 0 10px ${color}88` : 'none',
                      transition: 'box-shadow 0.2s ease',
                    }}
                  />

                  {/* Start dot marker */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      left: 0,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: isHovered ? 10 : 7,
                      height: isHovered ? 10 : 7,
                      background: color,
                      boxShadow: isHovered ? `0 0 8px ${color}` : `0 0 4px ${color}88`,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      zIndex: 5,
                    }}
                  />

                  {/* Hover tooltip */}
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: `${Math.min(Math.max(midX - left, 0), width)}%`,
                        marginBottom: 10,
                        zIndex: 50,
                        pointerEvents: 'none',
                        animation: 'tooltipIn 0.18s ease-out forwards',
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <div style={{
                        background: 'rgba(10,10,12,0.92)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: `1px solid ${color}44`,
                        borderRadius: 8,
                        padding: '6px 10px',
                        boxShadow: `0 4px 16px rgba(0,0,0,0.6), 0 0 8px ${color}22`,
                      }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{d.name}</p>
                        <p style={{ fontSize: 9, color: color, marginBottom: 1 }}>{d.period}</p>
                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>
                          {d.periodRange.start}–{d.periodRange.end} MYA
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* MYA scale ticks */}
          <div className="relative mt-1" style={{ height: 20 }}>
            {[300, 270, 240, 210, 180, 150, 120, 90, 66].map(mya => (
              <div
                key={mya}
                className="absolute flex flex-col items-center"
                style={{ left: `${myaToPercent(mya)}%`, transform: 'translateX(-50%)' }}
              >
                <div style={{ width: 1, height: 4, background: 'hsl(0,0%,20%)' }} />
                <span style={{ fontSize: 7, color: 'hsl(0,0%,35%)', marginTop: 1, whiteSpace: 'nowrap' }}>
                  {mya} MYA
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
