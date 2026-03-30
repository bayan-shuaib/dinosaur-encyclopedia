import { useState, useRef, useMemo } from 'react';
import { Dinosaur } from '@/data/types';

const COLORS = [
  'hsl(4, 72%, 62%)',
  'hsl(214, 65%, 62%)',
  'hsl(158, 48%, 52%)',
  'hsl(38, 72%, 58%)',
  'hsl(278, 52%, 64%)',
  'hsl(188, 58%, 56%)',
];

// Geological periods with subdivisions
const GEOLOGICAL_PERIODS = [
  {
    name: 'Devonian',
    start: 419,
    end: 359,
    color: 'hsl(195, 45%, 32%)',
    colorLight: 'hsl(195, 35%, 18%)',
    colorLighter: 'hsl(195, 30%, 12%)',
    subdivisions: [
      { name: 'Early', start: 419, end: 393 },
      { name: 'Middle', start: 393, end: 383 },
      { name: 'Late', start: 383, end: 359 },
    ],
  },
  {
    name: 'Carboniferous',
    start: 359,
    end: 299,
    color: 'hsl(145, 35%, 28%)',
    colorLight: 'hsl(145, 28%, 16%)',
    colorLighter: 'hsl(145, 22%, 10%)',
    subdivisions: [
      { name: 'Mississippian', start: 359, end: 323 },
      { name: 'Pennsylvanian', start: 323, end: 299 },
    ],
  },
  {
    name: 'Permian',
    start: 299,
    end: 252,
    color: 'hsl(35, 40%, 35%)',
    colorLight: 'hsl(35, 32%, 18%)',
    colorLighter: 'hsl(35, 25%, 12%)',
    subdivisions: [
      { name: 'Cisuralian', start: 299, end: 273 },
      { name: 'Guadalupian', start: 273, end: 260 },
      { name: 'Lopingian', start: 260, end: 252 },
    ],
  },
  {
    name: 'Triassic',
    start: 252,
    end: 201,
    color: 'hsl(20, 45%, 38%)',
    colorLight: 'hsl(20, 35%, 18%)',
    colorLighter: 'hsl(20, 28%, 12%)',
    subdivisions: [
      { name: 'Early', start: 252, end: 247 },
      { name: 'Middle', start: 247, end: 237 },
      { name: 'Late', start: 237, end: 201 },
    ],
  },
  {
    name: 'Jurassic',
    start: 201,
    end: 145,
    color: 'hsl(130, 38%, 30%)',
    colorLight: 'hsl(130, 28%, 16%)',
    colorLighter: 'hsl(130, 22%, 10%)',
    subdivisions: [
      { name: 'Early', start: 201, end: 174 },
      { name: 'Middle', start: 174, end: 164 },
      { name: 'Late', start: 164, end: 145 },
    ],
  },
  {
    name: 'Cretaceous',
    start: 145,
    end: 66,
    color: 'hsl(45, 42%, 38%)',
    colorLight: 'hsl(45, 32%, 18%)',
    colorLighter: 'hsl(45, 25%, 12%)',
    subdivisions: [
      { name: 'Early', start: 145, end: 100 },
      { name: 'Late', start: 100, end: 66 },
    ],
  },
];

const TOTAL_START = 419;
const TOTAL_END = 66;
const TOTAL_SPAN = TOTAL_START - TOTAL_END;

// Flatten all subdivisions for column generation
const ALL_SUBDIVISIONS = GEOLOGICAL_PERIODS.flatMap(period => 
  period.subdivisions.map((sub, subIdx) => ({
    ...sub,
    periodName: period.name,
    periodColor: period.color,
    periodColorLight: period.colorLight,
    periodColorLighter: period.colorLighter,
    isEven: subIdx % 2 === 0,
    fullName: sub.name === 'Early' || sub.name === 'Middle' || sub.name === 'Late' 
      ? `${sub.name} ${period.name}` 
      : sub.name,
  }))
);

interface TooltipState {
  content: React.ReactNode;
  x: number;
  y: number;
}

interface Props {
  dinosaurs: Dinosaur[];
}

export default function InteractiveTimeline({ dinosaurs }: Props) {
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);
  const [hoveredDino, setHoveredDino] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate percentage position from MYA
  const myaToPercent = (mya: number) => ((TOTAL_START - mya) / TOTAL_SPAN) * 100;

  const handleMouseMove = (e: React.MouseEvent, content: React.ReactNode) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setTooltip({
      content,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
    setHoveredCol(null);
    setHoveredDino(null);
  };

  // Get relevant dinosaurs
  const relevantDinos = useMemo(() => {
    return dinosaurs.filter(d => 
      d.periodRange.start <= TOTAL_START && d.periodRange.end >= TOTAL_END
    );
  }, [dinosaurs]);

  const TIMELINE_WIDTH = 1600;
  const ROW_HEIGHT = 28;
  const HEADER_HEIGHT = 44;
  const SUBHEADER_HEIGHT = 24;
  const TOTAL_ROWS = 8; // Fixed number of rows to fill the grid area

  return (
    <div className="select-none h-full flex flex-col relative" ref={containerRef}>
      <style>{`
        .timeline-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .timeline-scroll::-webkit-scrollbar-track {
          background: hsl(0, 0%, 8%);
          border-radius: 3px;
        }
        .timeline-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, hsl(35, 40%, 30%), hsl(145, 35%, 30%));
          border-radius: 3px;
        }
        .timeline-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, hsl(35, 45%, 40%), hsl(145, 40%, 40%));
        }
        .dino-bar {
          transition: all 0.2s ease;
        }
        .dino-bar:hover {
          filter: brightness(1.3);
          transform: scaleY(1.15);
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Scrollable Timeline */}
      <div 
        className="timeline-scroll flex-1 overflow-x-auto overflow-y-hidden"
        style={{ minHeight: 0 }}
      >
        <div 
          className="relative"
          style={{ 
            width: TIMELINE_WIDTH,
            height: HEADER_HEIGHT + SUBHEADER_HEIGHT + (TOTAL_ROWS * ROW_HEIGHT),
            background: 'hsl(220, 15%, 5%)',
          }}
        >
          {/* === HEADER ROW: Major Periods === */}
          <div className="absolute top-0 left-0 right-0 flex" style={{ height: HEADER_HEIGHT }}>
            {GEOLOGICAL_PERIODS.map((period) => {
              const leftPct = myaToPercent(period.start);
              const widthPct = myaToPercent(period.end) - leftPct;
              
              return (
                <div
                  key={period.name}
                  className="absolute top-0 flex items-center justify-center cursor-pointer transition-all duration-200"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    height: HEADER_HEIGHT,
                    background: period.color,
                    borderRight: '1px solid rgba(255,255,255,0.15)',
                    borderBottom: '2px solid rgba(0,0,0,0.4)',
                  }}
                  onMouseEnter={(e) => handleMouseMove(e, (
                    <div>
                      <p className="text-sm font-bold text-foreground">{period.name} Period</p>
                      <p className="text-xs text-muted-foreground mt-1">{period.start} - {period.end} MYA</p>
                    </div>
                  ))}
                  onMouseMove={(e) => handleMouseMove(e, (
                    <div>
                      <p className="text-sm font-bold text-foreground">{period.name} Period</p>
                      <p className="text-xs text-muted-foreground mt-1">{period.start} - {period.end} MYA</p>
                    </div>
                  ))}
                  onMouseLeave={handleMouseLeave}
                >
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/90 drop-shadow">
                    {period.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* === SUBHEADER ROW: Subdivisions === */}
          <div 
            className="absolute left-0 right-0 flex" 
            style={{ top: HEADER_HEIGHT, height: SUBHEADER_HEIGHT }}
          >
            {ALL_SUBDIVISIONS.map((sub, idx) => {
              const leftPct = myaToPercent(sub.start);
              const widthPct = myaToPercent(sub.end) - leftPct;
              const isHovered = hoveredCol === sub.fullName;
              
              return (
                <div
                  key={`sub-${idx}`}
                  className="absolute top-0 flex items-center justify-center cursor-pointer transition-all duration-200"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    height: SUBHEADER_HEIGHT,
                    background: isHovered ? sub.periodColor : sub.periodColorLight,
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                    borderBottom: '1px solid rgba(0,0,0,0.5)',
                  }}
                  onMouseEnter={(e) => {
                    setHoveredCol(sub.fullName);
                    handleMouseMove(e, (
                      <div>
                        <p className="text-xs font-semibold text-foreground">{sub.fullName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{sub.start} - {sub.end} MYA</p>
                      </div>
                    ));
                  }}
                  onMouseMove={(e) => handleMouseMove(e, (
                    <div>
                      <p className="text-xs font-semibold text-foreground">{sub.fullName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{sub.start} - {sub.end} MYA</p>
                    </div>
                  ))}
                  onMouseLeave={handleMouseLeave}
                >
                  <span className="text-[9px] font-medium text-white/80 truncate px-1">
                    {sub.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* === GRID AREA: Full-height columns + Rows === */}
          <div 
            className="absolute left-0 right-0"
            style={{ 
              top: HEADER_HEIGHT + SUBHEADER_HEIGHT,
              height: TOTAL_ROWS * ROW_HEIGHT,
            }}
          >
            {/* Full-height subdivision columns with period-based gradient coloring */}
            {ALL_SUBDIVISIONS.map((sub, idx) => {
              const leftPct = myaToPercent(sub.start);
              const widthPct = myaToPercent(sub.end) - leftPct;
              const isHovered = hoveredCol === sub.fullName;
              
              // Alternating light gradient based on parent period color
              const bgColor = sub.isEven ? sub.periodColorLight : sub.periodColorLighter;
              const hoverBgColor = sub.periodColorLight;
              
              return (
                <div
                  key={`col-${idx}`}
                  className="absolute top-0 transition-all duration-200 cursor-pointer"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    height: '100%',
                    background: isHovered ? hoverBgColor : bgColor,
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    setHoveredCol(sub.fullName);
                    handleMouseMove(e, (
                      <div>
                        <p className="text-xs font-semibold text-foreground">{sub.fullName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{sub.start} - {sub.end} MYA</p>
                      </div>
                    ));
                  }}
                  onMouseMove={(e) => handleMouseMove(e, (
                    <div>
                      <p className="text-xs font-semibold text-foreground">{sub.fullName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{sub.start} - {sub.end} MYA</p>
                    </div>
                  ))}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })}

            {/* Horizontal row lines for ALL rows */}
            {Array.from({ length: TOTAL_ROWS }).map((_, rowIdx) => (
              <div
                key={`row-line-${rowIdx}`}
                className="absolute left-0 right-0"
                style={{
                  top: rowIdx * ROW_HEIGHT,
                  height: ROW_HEIGHT,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              />
            ))}

            {/* Dinosaur bars overlaid on rows */}
            {relevantDinos.map((dino, dinoIdx) => {
              const dinoColor = COLORS[dinoIdx % COLORS.length];
              const isRowHovered = hoveredDino === dino.id;
              const topOffset = dinoIdx * ROW_HEIGHT;
              
              // Calculate bar position
              const barLeftPct = myaToPercent(Math.min(dino.periodRange.start, TOTAL_START));
              const barRightPct = myaToPercent(Math.max(dino.periodRange.end, TOTAL_END));
              const barWidthPct = barRightPct - barLeftPct;

              return (
                <div
                  key={dino.id}
                  className="absolute left-0 right-0 flex items-center pointer-events-none"
                  style={{
                    top: topOffset,
                    height: ROW_HEIGHT,
                    background: isRowHovered ? 'rgba(255,255,255,0.02)' : 'transparent',
                    zIndex: 10,
                  }}
                >
                  {/* Dinosaur lifespan bar */}
                  <div
                    className="dino-bar absolute rounded-full cursor-pointer pointer-events-auto"
                    style={{
                      left: `${barLeftPct}%`,
                      width: `${Math.max(barWidthPct, 0.5)}%`,
                      height: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: `linear-gradient(90deg, ${dinoColor} 0%, ${dinoColor}bb 60%, ${dinoColor}80 100%)`,
                      boxShadow: isRowHovered 
                        ? `0 0 14px ${dinoColor}70, 0 2px 6px ${dinoColor}50`
                        : `0 2px 4px ${dinoColor}25`,
                      zIndex: 20,
                    }}
                    onMouseEnter={(e) => {
                      setHoveredDino(dino.id);
                      handleMouseMove(e, (
                        <div>
                          <p className="text-sm font-bold" style={{ color: dinoColor }}>{dino.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{dino.periodRange.start} - {dino.periodRange.end} MYA</p>
                          <p className="text-[10px] text-foreground/70 mt-1">{dino.period}</p>
                        </div>
                      ));
                    }}
                    onMouseMove={(e) => handleMouseMove(e, (
                      <div>
                        <p className="text-sm font-bold" style={{ color: dinoColor }}>{dino.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{dino.periodRange.start} - {dino.periodRange.end} MYA</p>
                        <p className="text-[10px] text-foreground/70 mt-1">{dino.period}</p>
                      </div>
                    ))}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Start marker */}
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: dinoColor,
                        boxShadow: isRowHovered ? `0 0 6px ${dinoColor}` : 'none',
                      }}
                    />
                    
                    {/* Name label inside bar */}
                    {barWidthPct > 6 && (
                      <span 
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-white whitespace-nowrap"
                        style={{ textShadow: `0 1px 2px rgba(0,0,0,0.8)` }}
                      >
                        {dino.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* K-Pg Extinction marker - full height */}
            <div 
              className="absolute top-0 cursor-pointer"
              style={{
                right: 0,
                width: 3,
                height: '100%',
                background: 'linear-gradient(180deg, hsl(0, 70%, 55%) 0%, hsl(0, 70%, 35%) 100%)',
                boxShadow: '0 0 12px hsl(0, 70%, 50%, 0.6)',
                zIndex: 30,
              }}
              onMouseEnter={(e) => handleMouseMove(e, (
                <div>
                  <p className="text-sm font-bold text-red-400">K-Pg Extinction</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">66 Million Years Ago</p>
                </div>
              ))}
              onMouseLeave={handleMouseLeave}
            />
            
            {/* Extinction pulse */}
            <div 
              className="absolute w-2 h-2 rounded-full"
              style={{
                right: -0.5,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'hsl(0, 70%, 55%)',
                boxShadow: '0 0 8px hsl(0, 70%, 55%)',
                animation: 'pulse 2s ease-in-out infinite',
                zIndex: 31,
              }}
            />
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg bg-card/95 border border-border shadow-xl backdrop-blur-sm"
              style={{
                left: Math.min(tooltip.x + 12, TIMELINE_WIDTH - 160),
                top: Math.max(tooltip.y - 50, 10),
                maxWidth: 180,
              }}
            >
              {tooltip.content}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 pt-2 mt-1 border-t border-border/20">
        <div className="flex flex-wrap gap-3 justify-center">
          {relevantDinos.map((dino, i) => (
            <div 
              key={dino.id} 
              className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-200"
              style={{ opacity: hoveredDino === dino.id ? 1 : 0.7 }}
              onMouseEnter={() => setHoveredDino(dino.id)}
              onMouseLeave={() => setHoveredDino(null)}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: COLORS[i % COLORS.length] }} 
              />
              <span className="text-[10px] text-muted-foreground">{dino.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
