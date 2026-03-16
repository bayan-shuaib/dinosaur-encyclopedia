import { useState } from 'react';
import { Dinosaur } from '@/data/types';

const COLORS = [
  'hsl(0, 70%, 55%)',
  'hsl(210, 70%, 55%)',
  'hsl(142, 50%, 45%)',
  'hsl(45, 80%, 55%)',
];

const PERIODS = [
  { name: 'Permian', start: 299, end: 252, color: 'hsl(30, 40%, 35%)' },
  { name: 'Triassic', start: 252, end: 201, color: 'hsl(0, 40%, 35%)' },
  { name: 'Jurassic', start: 201, end: 145, color: 'hsl(142, 35%, 32%)' },
  { name: 'Cretaceous', start: 145, end: 66, color: 'hsl(210, 40%, 35%)' },
];

const TIMELINE_START = 300;
const TIMELINE_END = 60;
const EXTINCTION_MYA = 66;

interface Props {
  dinosaurs: Dinosaur[];
}

export default function InteractiveTimeline({ dinosaurs }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const totalSpan = TIMELINE_START - TIMELINE_END;
  const myaToPercent = (mya: number) => ((TIMELINE_START - mya) / totalSpan) * 100;
  const extinctionX = myaToPercent(EXTINCTION_MYA);

  return (
    <div className="flex flex-col h-full">
      <div className="relative">
        {/* Period labels */}
        <div className="relative h-5">
          {PERIODS.map(p => {
            const left = myaToPercent(p.start);
            const width = ((p.start - p.end) / totalSpan) * 100;
            return (
              <span
                key={p.name}
                className="absolute text-[8px] text-muted-foreground/60 text-center"
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                {p.name}
              </span>
            );
          })}
        </div>

        {/* Period color bars */}
        <div className="relative h-7 rounded overflow-hidden flex">
          {PERIODS.map(p => {
            const width = ((p.start - p.end) / totalSpan) * 100;
            return (
              <div
                key={p.name}
                style={{ width: `${width}%`, backgroundColor: p.color }}
                className="h-full opacity-40"
              />
            );
          })}
        </div>

        {/* K-Pg extinction line */}
        <div
          className="absolute z-10"
          style={{
            top: 20,
            left: `${extinctionX}%`,
            width: 2,
            height: 7 + dinosaurs.length * 24 + 8,
            backgroundColor: 'hsl(0, 84%, 60%)',
            opacity: 0.5,
            boxShadow: '0 0 6px hsl(0, 84%, 60%)',
          }}
        />

        {/* Dinosaur range bars area */}
        <div className="relative mt-1" style={{ height: dinosaurs.length * 24 + 8 }}>
          {dinosaurs.map((d, i) => {
            const left = myaToPercent(d.periodRange.start);
            const right = myaToPercent(d.periodRange.end);
            const width = right - left;
            const isHovered = hoveredId === d.id;

            return (
              <div
                key={d.id}
                className="absolute"
                style={{ top: 4 + i * 24, left: `${left}%`, width: `${Math.max(width, 1.5)}%`, height: 16 }}
              >
                {/* Range bar */}
                <div
                  className="h-full rounded-full cursor-pointer transition-all duration-150"
                  style={{
                    backgroundColor: COLORS[i],
                    opacity: isHovered ? 1 : 0.65,
                    boxShadow: isHovered ? `0 0 10px ${COLORS[i]}` : 'none',
                  }}
                  onMouseEnter={() => setHoveredId(d.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />

                {/* Name label */}
                <span
                  className="absolute text-[8px] font-semibold whitespace-nowrap pointer-events-none"
                  style={{
                    top: 1,
                    left: 'calc(100% + 4px)',
                    color: COLORS[i],
                  }}
                >
                  {d.name}
                </span>

                {/* Hover tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none">
                    <div className="bg-card border border-border rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap">
                      <p className="text-[10px] font-bold text-foreground">{d.name}</p>
                      <p className="text-[9px] text-muted-foreground">{d.period} · {d.periodRange.start}–{d.periodRange.end} MYA</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* MYA Scale */}
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-muted-foreground/50">300 MYA</span>
          <span className="text-[8px] text-muted-foreground/50">60 MYA</span>
        </div>
      </div>
    </div>
  );
}
