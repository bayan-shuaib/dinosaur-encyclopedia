interface TimelineBarProps {
  periodRange: { start: number; end: number };
  period: string;
}

const PERIODS = [
  { name: 'Permian', start: 299, end: 252, color: 'hsl(30, 40%, 35%)' },
  { name: 'Triassic', start: 252, end: 201, color: 'hsl(0, 40%, 35%)' },
  { name: 'Jurassic', start: 201, end: 145, color: 'hsl(142, 35%, 32%)' },
  { name: 'Cretaceous', start: 145, end: 66, color: 'hsl(210, 40%, 35%)' },
];

const TIMELINE_START = 300;
const TIMELINE_END = 60;
const totalSpan = TIMELINE_START - TIMELINE_END;
const EXTINCTION_MYA = 66;

export function TimelineBar({ periodRange }: TimelineBarProps) {
  const myaToPercent = (mya: number) => ((TIMELINE_START - mya) / totalSpan) * 100;

  const dinoLeft = myaToPercent(periodRange.start);
  const dinoRight = myaToPercent(periodRange.end);
  const dinoWidth = dinoRight - dinoLeft;

  const extinctionX = myaToPercent(EXTINCTION_MYA);

  return (
    <div className="info-panel">
      <p className="section-label">Geological Timeline</p>
      <div className="relative mt-4">
        {/* Period labels */}
        <div className="relative h-5">
          {PERIODS.map(p => {
            const left = myaToPercent(p.start);
            const width = ((p.start - p.end) / totalSpan) * 100;
            return (
              <span
                key={p.name}
                className="absolute text-[9px] font-body text-muted-foreground/70 text-center"
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                {p.name}
              </span>
            );
          })}
        </div>

        {/* Period color bars */}
        <div className="relative h-8 rounded overflow-hidden flex">
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

        {/* Dinosaur range marker */}
        <div
          className="absolute rounded-full"
          style={{
            top: 24,
            left: `${dinoLeft}%`,
            width: `${Math.max(dinoWidth, 1.5)}%`,
            height: 8,
            background: 'hsl(0, 70%, 55%)',
            opacity: 0.85,
            boxShadow: '0 0 8px hsla(0, 70%, 55%, 0.5)',
          }}
        />

        {/* K-Pg extinction line */}
        <div
          className="absolute top-[20px] h-[12px] w-[2px]"
          style={{
            left: `${extinctionX}%`,
            backgroundColor: 'hsl(0, 84%, 60%)',
            opacity: 0.6,
            boxShadow: '0 0 6px hsl(0, 84%, 60%)',
          }}
        />

        {/* MYA scale */}
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-muted-foreground/50">300 Mya</span>
          <span className="text-[9px] text-muted-foreground/50">60 Mya</span>
        </div>

        {/* Range label */}
        <p className="text-[10px] text-muted-foreground/60 mt-1 text-center">
          {periodRange.start}–{periodRange.end} Mya
        </p>
      </div>
    </div>
  );
}
