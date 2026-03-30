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

// Expanded geological periods with subdivisions
const GEOLOGICAL_PERIODS = [
  {
    name: 'Devonian',
    start: 419,
    end: 359,
    accent: 'hsl(280, 35%, 40%)',
    bg: 'hsl(280, 25%, 12%)',
    description: 'Age of Fish - first tetrapods emerge',
    subdivisions: [
      { name: 'Early Devonian', start: 419, end: 393, description: 'Jawless fish dominate' },
      { name: 'Middle Devonian', start: 393, end: 383, description: 'Rise of jawed fish' },
      { name: 'Late Devonian', start: 383, end: 359, description: 'First amphibians appear' },
    ],
  },
  {
    name: 'Carboniferous',
    start: 359,
    end: 299,
    accent: 'hsl(160, 40%, 35%)',
    bg: 'hsl(160, 25%, 10%)',
    description: 'Age of Amphibians - vast coal forests',
    subdivisions: [
      { name: 'Mississippian', start: 359, end: 323, description: 'Early carboniferous period' },
      { name: 'Pennsylvanian', start: 323, end: 299, description: 'First reptiles evolve' },
    ],
  },
  {
    name: 'Permian',
    start: 299,
    end: 252,
    accent: 'hsl(30, 45%, 42%)',
    bg: 'hsl(30, 26%, 11%)',
    description: 'Rise of synapsids - ends with mass extinction',
    subdivisions: [
      { name: 'Cisuralian', start: 299, end: 273, description: 'Early Permian synapsids' },
      { name: 'Guadalupian', start: 273, end: 260, description: 'Mid-Permian diversification' },
      { name: 'Lopingian', start: 260, end: 252, description: 'Great Dying extinction event' },
    ],
  },
  {
    name: 'Triassic',
    start: 252,
    end: 201,
    accent: 'hsl(10, 50%, 45%)',
    bg: 'hsl(10, 26%, 12%)',
    description: 'Dawn of dinosaurs - recovery from extinction',
    subdivisions: [
      { name: 'Early Triassic', start: 252, end: 247, description: 'Post-extinction recovery' },
      { name: 'Middle Triassic', start: 247, end: 237, description: 'Archosaurs diversify' },
      { name: 'Late Triassic', start: 237, end: 201, description: 'First true dinosaurs' },
    ],
  },
  {
    name: 'Jurassic',
    start: 201,
    end: 145,
    accent: 'hsl(142, 45%, 38%)',
    bg: 'hsl(142, 22%, 11%)',
    description: 'Age of Giants - dinosaurs dominate Earth',
    subdivisions: [
      { name: 'Early Jurassic', start: 201, end: 174, description: 'Dinosaurs spread globally' },
      { name: 'Middle Jurassic', start: 174, end: 164, description: 'Giant sauropods emerge' },
      { name: 'Late Jurassic', start: 164, end: 145, description: 'Apex of dinosaur diversity' },
    ],
  },
  {
    name: 'Cretaceous',
    start: 145,
    end: 66,
    accent: 'hsl(210, 50%, 42%)',
    bg: 'hsl(210, 26%, 11%)',
    description: 'Final dinosaur era - ends with asteroid impact',
    subdivisions: [
      { name: 'Early Cretaceous', start: 145, end: 100, description: 'Flowering plants appear' },
      { name: 'Late Cretaceous', start: 100, end: 66, description: 'T. rex and K-Pg extinction' },
    ],
  },
];

const TOTAL_START = 419;
const TOTAL_END = 66;

interface TooltipState {
  content: React.ReactNode;
  x: number;
  y: number;
}

interface Props {
  dinosaurs: Dinosaur[];
}

export default function InteractiveTimeline({ dinosaurs }: Props) {
  const [hoveredPeriod, setHoveredPeriod] = useState<string | null>(null);
  const [hoveredSubPeriod, setHoveredSubPeriod] = useState<string | null>(null);
  const [hoveredDino, setHoveredDino] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get dinosaur position in timeline
  const getDinoPosition = (dino: Dinosaur) => {
    const start = Math.min(dino.periodRange.start, TOTAL_START);
    const end = Math.max(dino.periodRange.end, TOTAL_END);
    return { start, end };
  };

  // Check if dinosaur exists in a period
  const dinoInPeriod = (dino: Dinosaur, periodStart: number, periodEnd: number) => {
    return dino.periodRange.start >= periodEnd && dino.periodRange.end <= periodStart;
  };

  // Calculate bar position within the timeline
  const getBarStyle = (start: number, end: number, periodStart: number, periodEnd: number) => {
    const periodSpan = periodStart - periodEnd;
    const barStart = Math.max(start, periodEnd);
    const barEnd = Math.min(end, periodStart);
    const leftPct = ((periodStart - barStart) / periodSpan) * 100;
    const widthPct = ((barStart - barEnd) / periodSpan) * 100;
    return { left: `${leftPct}%`, width: `${Math.max(widthPct, 2)}%` };
  };

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
    setHoveredPeriod(null);
    setHoveredSubPeriod(null);
    setHoveredDino(null);
  };

  // Get relevant dinosaurs for display
  const relevantDinos = useMemo(() => {
    return dinosaurs.filter(d => 
      d.periodRange.start <= TOTAL_START && d.periodRange.end >= TOTAL_END
    );
  }, [dinosaurs]);

  return (
    <div className="select-none h-full flex flex-col" ref={containerRef}>
      <style>{`
        .museum-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .museum-scroll::-webkit-scrollbar-track {
          background: hsl(0, 0%, 8%);
          border-radius: 3px;
        }
        .museum-scroll::-webkit-scrollbar-thumb {
          background: hsl(0, 0%, 20%);
          border-radius: 3px;
        }
        .museum-scroll::-webkit-scrollbar-thumb:hover {
          background: hsl(0, 0%, 28%);
        }
        @keyframes periodGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dino-bar {
          transition: all 0.2s ease;
        }
        .dino-bar:hover {
          transform: scaleY(1.3);
          filter: brightness(1.2);
        }
      `}</style>

      {/* Scrollable timeline container */}
      <div 
        className="museum-scroll flex-1 overflow-y-auto pr-2"
        style={{ 
          scrollBehavior: 'smooth',
          minHeight: 0,
        }}
      >
        <div className="relative pb-4">
          {/* Vertical timeline line */}
          <div 
            className="absolute left-6 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(to bottom, transparent, hsl(0, 0%, 20%) 5%, hsl(0, 0%, 20%) 95%, transparent)' }}
          />

          {/* Geological Periods */}
          {GEOLOGICAL_PERIODS.map((period, periodIdx) => {
            const isHovered = hoveredPeriod === period.name;
            const periodDinos = relevantDinos.filter(d => 
              d.periodRange.start <= period.start && d.periodRange.end >= period.end
            );

            return (
              <div key={period.name} className="relative">
                {/* Period Header */}
                <div
                  className="relative flex items-center gap-4 py-3 px-2 cursor-pointer transition-all duration-200"
                  style={{
                    background: isHovered ? period.bg : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    setHoveredPeriod(period.name);
                    handleMouseMove(e, (
                      <div>
                        <p className="text-sm font-bold text-foreground">{period.name} Period</p>
                        <p className="text-xs text-muted-foreground mt-1">{period.start} - {period.end} MYA</p>
                        <p className="text-xs mt-1" style={{ color: period.accent }}>{period.description}</p>
                      </div>
                    ));
                  }}
                  onMouseMove={(e) => handleMouseMove(e, (
                    <div>
                      <p className="text-sm font-bold text-foreground">{period.name} Period</p>
                      <p className="text-xs text-muted-foreground mt-1">{period.start} - {period.end} MYA</p>
                      <p className="text-xs mt-1" style={{ color: period.accent }}>{period.description}</p>
                    </div>
                  ))}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Timeline node */}
                  <div 
                    className="relative z-10 w-3 h-3 rounded-full transition-all duration-200"
                    style={{ 
                      backgroundColor: period.accent,
                      boxShadow: isHovered ? `0 0 12px ${period.accent}, 0 0 24px ${period.accent}40` : `0 0 6px ${period.accent}60`,
                      transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                    }}
                  />
                  
                  {/* Period label */}
                  <div className="flex-1">
                    <h3 
                      className="text-sm font-bold uppercase tracking-[0.15em] transition-colors duration-200"
                      style={{ color: isHovered ? period.accent : 'hsl(0, 0%, 55%)' }}
                    >
                      {period.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {period.start} - {period.end} MYA
                    </p>
                  </div>

                  {/* Period duration bar */}
                  <div 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-1 rounded-full transition-all duration-200"
                    style={{ 
                      width: `${((period.start - period.end) / (TOTAL_START - TOTAL_END)) * 60}%`,
                      maxWidth: 80,
                      backgroundColor: isHovered ? period.accent : `${period.accent}40`,
                    }}
                  />
                </div>

                {/* Subdivisions */}
                <div className="ml-10 border-l border-border/30">
                  {period.subdivisions.map((sub, subIdx) => {
                    const isSubHovered = hoveredSubPeriod === `${period.name}-${sub.name}`;
                    const subDinos = relevantDinos.filter(d => 
                      d.periodRange.start <= sub.start && d.periodRange.end >= sub.end
                    );

                    return (
                      <div 
                        key={sub.name}
                        className="relative py-2 pl-4 pr-2 transition-all duration-200 cursor-pointer"
                        style={{
                          background: isSubHovered ? `${period.bg}80` : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          setHoveredSubPeriod(`${period.name}-${sub.name}`);
                          handleMouseMove(e, (
                            <div>
                              <p className="text-xs font-semibold text-foreground">{sub.name}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{sub.start} - {sub.end} MYA</p>
                              <p className="text-[10px] mt-1" style={{ color: period.accent }}>{sub.description}</p>
                            </div>
                          ));
                        }}
                        onMouseMove={(e) => handleMouseMove(e, (
                          <div>
                            <p className="text-xs font-semibold text-foreground">{sub.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{sub.start} - {sub.end} MYA</p>
                            <p className="text-[10px] mt-1" style={{ color: period.accent }}>{sub.description}</p>
                          </div>
                        ))}
                        onMouseLeave={handleMouseLeave}
                      >
                        {/* Sub-period marker */}
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-all duration-200"
                          style={{ 
                            backgroundColor: isSubHovered ? period.accent : `${period.accent}50`,
                            transform: `translate(-50%, -50%) scale(${isSubHovered ? 1.2 : 1})`,
                          }}
                        />

                        {/* Sub-period label */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p 
                              className="text-xs transition-colors duration-200"
                              style={{ color: isSubHovered ? `${period.accent}` : 'hsl(0, 0%, 45%)' }}
                            >
                              {sub.name}
                            </p>
                            <p className="text-[9px] text-muted-foreground/50">{sub.start} - {sub.end} MYA</p>
                          </div>
                        </div>

                        {/* Dinosaur bars for this sub-period */}
                        {subDinos.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {subDinos.map((dino, dinoIdx) => {
                              const dinoColor = COLORS[relevantDinos.indexOf(dino) % COLORS.length];
                              const isDinoHovered = hoveredDino === dino.id;
                              const barWidth = Math.min(
                                ((Math.min(dino.periodRange.start, sub.start) - Math.max(dino.periodRange.end, sub.end)) / (sub.start - sub.end)) * 100,
                                100
                              );

                              return (
                                <div
                                  key={dino.id}
                                  className="dino-bar relative h-4 rounded-full cursor-pointer overflow-hidden"
                                  style={{
                                    width: `${Math.max(barWidth, 20)}%`,
                                    background: `linear-gradient(to right, ${dinoColor}cc, ${dinoColor}40)`,
                                    boxShadow: isDinoHovered ? `0 0 10px ${dinoColor}80` : 'none',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.stopPropagation();
                                    setHoveredDino(dino.id);
                                    handleMouseMove(e, (
                                      <div>
                                        <p className="text-sm font-bold" style={{ color: dinoColor }}>{dino.name}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{dino.periodRange.start} - {dino.periodRange.end} MYA</p>
                                        <p className="text-[10px] text-foreground/70 mt-1">{dino.period}</p>
                                      </div>
                                    ));
                                  }}
                                  onMouseMove={(e) => {
                                    e.stopPropagation();
                                    handleMouseMove(e, (
                                      <div>
                                        <p className="text-sm font-bold" style={{ color: dinoColor }}>{dino.name}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{dino.periodRange.start} - {dino.periodRange.end} MYA</p>
                                        <p className="text-[10px] text-foreground/70 mt-1">{dino.period}</p>
                                      </div>
                                    ));
                                  }}
                                  onMouseLeave={(e) => {
                                    e.stopPropagation();
                                    handleMouseLeave();
                                  }}
                                >
                                  {/* Start dot */}
                                  <div 
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                                    style={{ 
                                      backgroundColor: dinoColor,
                                      boxShadow: isDinoHovered ? `0 0 8px ${dinoColor}` : `0 0 4px ${dinoColor}60`,
                                    }}
                                  />
                                  {/* Dino name inside bar */}
                                  {barWidth > 40 && (
                                    <span 
                                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-medium text-white/80 whitespace-nowrap"
                                    >
                                      {dino.name}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Period separator */}
                {periodIdx < GEOLOGICAL_PERIODS.length - 1 && (
                  <div 
                    className="ml-6 h-px my-2"
                    style={{ background: `linear-gradient(to right, ${period.accent}30, transparent)` }}
                  />
                )}

                {/* Extinction marker for K-Pg */}
                {period.name === 'Cretaceous' && (
                  <div className="relative ml-6 py-2">
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full animate-pulse"
                      style={{ 
                        backgroundColor: 'hsl(0, 70%, 50%)',
                        boxShadow: '0 0 12px hsl(0, 70%, 50%), 0 0 24px hsl(0, 70%, 50%, 0.4)',
                      }}
                    />
                    <div className="ml-4 pl-4">
                      <p className="text-xs font-bold text-red-400 uppercase tracking-wider">K-Pg Extinction Event</p>
                      <p className="text-[9px] text-muted-foreground">66 MYA - End of the Mesozoic Era</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dinosaur Legend */}
      <div className="flex-shrink-0 pt-3 mt-2 border-t border-border/30">
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

      {/* Floating Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: Math.min(tooltip.x + 12, 220),
            top: tooltip.y - 10,
            animation: 'fadeSlideIn 0.15s ease-out forwards',
          }}
        >
          <div 
            className="px-3 py-2 rounded-lg shadow-xl"
            style={{
              background: 'rgba(10, 12, 16, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid hsl(0, 0%, 18%)',
              maxWidth: 200,
            }}
          >
            {tooltip.content}
          </div>
        </div>
      )}
    </div>
  );
}
