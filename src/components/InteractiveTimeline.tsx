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

// Expanded geological periods with subdivisions and museum-quality colors
const GEOLOGICAL_PERIODS = [
  {
    name: 'Devonian',
    start: 419,
    end: 359,
    color: 'hsl(195, 45%, 32%)', // Deep blue-green
    colorLight: 'hsl(195, 40%, 42%)',
    description: 'Age of Fish',
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
    color: 'hsl(145, 35%, 28%)', // Forest green
    colorLight: 'hsl(145, 32%, 38%)',
    description: 'Age of Amphibians',
    subdivisions: [
      { name: 'Mississippian', start: 359, end: 323 },
      { name: 'Pennsylvanian', start: 323, end: 299 },
    ],
  },
  {
    name: 'Permian',
    start: 299,
    end: 252,
    color: 'hsl(35, 40%, 35%)', // Muted amber
    colorLight: 'hsl(35, 38%, 45%)',
    description: 'Rise of Synapsids',
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
    color: 'hsl(20, 45%, 38%)', // Warm orange-brown
    colorLight: 'hsl(20, 42%, 48%)',
    description: 'Dawn of Dinosaurs',
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
    color: 'hsl(130, 38%, 30%)', // Rich green
    colorLight: 'hsl(130, 35%, 40%)',
    description: 'Age of Giants',
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
    color: 'hsl(45, 42%, 38%)', // Golden tone
    colorLight: 'hsl(45, 40%, 48%)',
    description: 'Final Dinosaur Era',
    subdivisions: [
      { name: 'Early', start: 145, end: 100 },
      { name: 'Late', start: 100, end: 66 },
    ],
  },
];

const TOTAL_START = 419;
const TOTAL_END = 66;
const TOTAL_SPAN = TOTAL_START - TOTAL_END;

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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Timeline width multiplier for horizontal scroll
  const TIMELINE_WIDTH = 1800;

  return (
    <div className="select-none h-full flex flex-col relative" ref={containerRef}>
      <style>{`
        .museum-h-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .museum-h-scroll::-webkit-scrollbar-track {
          background: hsl(0, 0%, 6%);
          border-radius: 3px;
        }
        .museum-h-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, hsl(35, 40%, 25%), hsl(145, 35%, 25%));
          border-radius: 3px;
          box-shadow: 0 0 6px hsla(35, 50%, 40%, 0.3);
        }
        .museum-h-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, hsl(35, 45%, 35%), hsl(145, 40%, 35%));
        }
        .period-band {
          transition: all 0.3s ease;
        }
        .period-band:hover {
          filter: brightness(1.15);
        }
        .sub-period-block {
          transition: all 0.25s ease;
        }
        .sub-period-block:hover {
          transform: scaleY(1.05);
          filter: brightness(1.2);
        }
        .dino-bar {
          transition: all 0.2s ease;
        }
        .dino-bar:hover {
          transform: scaleY(1.4) translateY(-2px);
          filter: brightness(1.25);
        }
        @keyframes subtleGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Horizontally scrollable timeline */}
      <div 
        ref={scrollRef}
        className="museum-h-scroll flex-1 overflow-x-auto overflow-y-hidden"
        style={{ 
          scrollBehavior: 'smooth',
          minHeight: 0,
        }}
      >
        <div 
          className="relative h-full"
          style={{ 
            width: TIMELINE_WIDTH,
            minHeight: '100%',
            background: 'linear-gradient(180deg, hsl(220, 15%, 6%) 0%, hsl(220, 18%, 4%) 100%)',
          }}
        >
          {/* Subtle texture overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              mixBlendMode: 'overlay',
            }}
          />

          {/* TOP LAYER: Major Period Bands */}
          <div className="absolute top-0 left-0 right-0 h-14 flex">
            {GEOLOGICAL_PERIODS.map((period, idx) => {
              const leftPct = myaToPercent(period.start);
              const widthPct = myaToPercent(period.end) - leftPct;
              const isHovered = hoveredPeriod === period.name;
              const nextPeriod = GEOLOGICAL_PERIODS[idx + 1];
              
              return (
                <div
                  key={period.name}
                  className="period-band absolute top-0 h-full cursor-pointer"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    background: nextPeriod 
                      ? `linear-gradient(90deg, ${period.color} 0%, ${period.color} 70%, ${nextPeriod.color} 100%)`
                      : period.color,
                    borderBottom: `2px solid ${isHovered ? period.colorLight : 'transparent'}`,
                    boxShadow: isHovered ? `inset 0 0 20px ${period.colorLight}40, 0 4px 12px ${period.color}60` : 'none',
                  }}
                  onMouseEnter={(e) => {
                    setHoveredPeriod(period.name);
                    handleMouseMove(e, (
                      <div>
                        <p className="text-sm font-bold text-foreground">{period.name} Period</p>
                        <p className="text-xs text-muted-foreground mt-1">{period.start} - {period.end} MYA</p>
                        <p className="text-xs mt-1" style={{ color: period.colorLight }}>{period.description}</p>
                      </div>
                    ));
                  }}
                  onMouseMove={(e) => handleMouseMove(e, (
                    <div>
                      <p className="text-sm font-bold text-foreground">{period.name} Period</p>
                      <p className="text-xs text-muted-foreground mt-1">{period.start} - {period.end} MYA</p>
                      <p className="text-xs mt-1" style={{ color: period.colorLight }}>{period.description}</p>
                    </div>
                  ))}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Period label */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className="text-xs font-bold uppercase tracking-[0.2em] text-white/90 drop-shadow-lg"
                      style={{ 
                        textShadow: `0 2px 8px ${period.color}`,
                        opacity: isHovered ? 1 : 0.8,
                      }}
                    >
                      {period.name}
                    </span>
                  </div>
                  
                  {/* MYA markers at edges */}
                  <span className="absolute left-2 bottom-1 text-[9px] text-white/50">{period.start}</span>
                  {idx === GEOLOGICAL_PERIODS.length - 1 && (
                    <span className="absolute right-2 bottom-1 text-[9px] text-white/50">{period.end}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* MIDDLE LAYER: Sub-period blocks */}
          <div className="absolute top-14 left-0 right-0 h-10 flex">
            {GEOLOGICAL_PERIODS.map((period) => (
              period.subdivisions.map((sub, subIdx) => {
                const leftPct = myaToPercent(sub.start);
                const widthPct = myaToPercent(sub.end) - leftPct;
                const isHovered = hoveredSubPeriod === `${period.name}-${sub.name}`;
                
                return (
                  <div
                    key={`${period.name}-${sub.name}`}
                    className="sub-period-block absolute h-full cursor-pointer"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      background: `linear-gradient(180deg, ${period.color}90 0%, ${period.color}50 100%)`,
                      borderLeft: subIdx > 0 ? `1px solid ${period.colorLight}30` : 'none',
                      borderBottom: `1px solid ${isHovered ? period.colorLight : period.color}40`,
                      boxShadow: isHovered ? `inset 0 0 15px ${period.colorLight}30` : 'none',
                    }}
                    onMouseEnter={(e) => {
                      setHoveredSubPeriod(`${period.name}-${sub.name}`);
                      handleMouseMove(e, (
                        <div>
                          <p className="text-xs font-semibold text-foreground">{sub.name} {period.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{sub.start} - {sub.end} MYA</p>
                        </div>
                      ));
                    }}
                    onMouseMove={(e) => handleMouseMove(e, (
                      <div>
                        <p className="text-xs font-semibold text-foreground">{sub.name} {period.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{sub.start} - {sub.end} MYA</p>
                      </div>
                    ))}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Sub-period label */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span 
                        className="text-[10px] font-medium text-white/70 truncate px-1"
                        style={{ opacity: isHovered ? 1 : 0.7 }}
                      >
                        {sub.name}
                      </span>
                    </div>
                  </div>
                );
              })
            ))}
          </div>

          {/* Divider line */}
          <div 
            className="absolute left-0 right-0 h-px"
            style={{ 
              top: '96px',
              background: 'linear-gradient(90deg, transparent 0%, hsl(0, 0%, 25%) 10%, hsl(0, 0%, 25%) 90%, transparent 100%)',
            }}
          />

          {/* BOTTOM LAYER: Dinosaur lifespan bars */}
          <div 
            className="absolute left-0 right-0 bottom-10"
            style={{ top: '104px' }}
          >
            {/* Background grid lines */}
            {GEOLOGICAL_PERIODS.map((period) => {
              const leftPct = myaToPercent(period.start);
              return (
                <div
                  key={`grid-${period.name}`}
                  className="absolute top-0 bottom-0 w-px"
                  style={{
                    left: `${leftPct}%`,
                    background: `linear-gradient(180deg, ${period.color}40 0%, transparent 100%)`,
                  }}
                />
              );
            })}

            {/* Dinosaur bars */}
            {relevantDinos.map((dino, idx) => {
              const dinoColor = COLORS[idx % COLORS.length];
              const leftPct = myaToPercent(Math.min(dino.periodRange.start, TOTAL_START));
              const rightPct = myaToPercent(Math.max(dino.periodRange.end, TOTAL_END));
              const widthPct = rightPct - leftPct;
              const isDinoHovered = hoveredDino === dino.id;
              
              // Stagger vertical positions
              const topOffset = 8 + (idx * 28);
              
              return (
                <div
                  key={dino.id}
                  className="dino-bar absolute h-5 rounded-full cursor-pointer"
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(widthPct, 1)}%`,
                    top: topOffset,
                    background: `linear-gradient(90deg, ${dinoColor} 0%, ${dinoColor}90 50%, ${dinoColor}60 100%)`,
                    boxShadow: isDinoHovered 
                      ? `0 0 16px ${dinoColor}80, 0 4px 8px ${dinoColor}40, inset 0 1px 0 ${dinoColor}` 
                      : `0 2px 6px ${dinoColor}30`,
                    zIndex: isDinoHovered ? 20 : 10,
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
                  {/* Start cap */}
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: dinoColor,
                      boxShadow: isDinoHovered ? `0 0 10px ${dinoColor}` : `0 0 4px ${dinoColor}60`,
                    }}
                  />
                  
                  {/* End cap */}
                  <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: `${dinoColor}80`,
                    }}
                  />
                  
                  {/* Name label inside bar */}
                  {widthPct > 8 && (
                    <span 
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-white whitespace-nowrap"
                      style={{ 
                        textShadow: `0 1px 3px ${dinoColor}`,
                        opacity: isDinoHovered ? 1 : 0.9,
                      }}
                    >
                      {dino.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* K-Pg Extinction Event Marker */}
          <div 
            className="absolute bottom-0 h-full w-1 cursor-pointer"
            style={{
              right: 0,
              background: 'linear-gradient(180deg, hsl(0, 70%, 50%) 0%, hsl(0, 70%, 40%) 50%, transparent 100%)',
              boxShadow: '0 0 20px hsl(0, 70%, 50%, 0.6), 0 0 40px hsl(0, 70%, 50%, 0.3)',
            }}
            onMouseEnter={(e) => {
              handleMouseMove(e, (
                <div>
                  <p className="text-sm font-bold text-red-400">K-Pg Extinction Event</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">66 Million Years Ago</p>
                  <p className="text-[10px] text-red-400/70 mt-1">End of the Mesozoic Era</p>
                </div>
              ));
            }}
            onMouseLeave={handleMouseLeave}
          />
          
          {/* Extinction pulse animation */}
          <div 
            className="absolute bottom-10 w-3 h-3 rounded-full"
            style={{
              right: -1,
              backgroundColor: 'hsl(0, 70%, 50%)',
              boxShadow: '0 0 12px hsl(0, 70%, 50%), 0 0 24px hsl(0, 70%, 50%, 0.5)',
              animation: 'subtleGlow 2s ease-in-out infinite',
            }}
          />

          {/* Time axis at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-10 flex items-end border-t border-border/20">
            {/* Time markers */}
            {[400, 350, 300, 250, 200, 150, 100].map((mya) => {
              const leftPct = myaToPercent(mya);
              return (
                <div
                  key={mya}
                  className="absolute bottom-0 flex flex-col items-center"
                  style={{ left: `${leftPct}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-px h-2 bg-muted-foreground/30" />
                  <span className="text-[9px] text-muted-foreground/60 mt-0.5">{mya} MYA</span>
                </div>
              );
            })}
            
            {/* Arrow indicating time direction */}
            <div className="absolute right-4 bottom-2 flex items-center gap-1">
              <span className="text-[8px] text-muted-foreground/40 uppercase tracking-wider">Present</span>
              <svg width="12" height="8" viewBox="0 0 12 8" className="text-muted-foreground/40">
                <path d="M8 0l4 4-4 4M0 4h11" stroke="currentColor" strokeWidth="1" fill="none"/>
              </svg>
            </div>
          </div>
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
            left: Math.min(tooltip.x + 12, (containerRef.current?.offsetWidth || 300) - 180),
            top: Math.max(tooltip.y - 60, 10),
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            className="rounded-lg border border-border/50 shadow-xl"
            style={{
              background: 'linear-gradient(135deg, hsl(220, 20%, 12%) 0%, hsl(220, 22%, 8%) 100%)',
              padding: '10px 14px',
              maxWidth: 200,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            {tooltip.content}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
