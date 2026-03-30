import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Dinosaur, EcologicalStats } from '@/data/types';
import { COLORS } from '@/pages/ComparePage';
import InteractiveTimeline from '@/components/InteractiveTimeline';
import LocationMap from '@/components/LocationMap';
import SkeletonVisualizer from '@/components/SkeletonVisualizer';
import { Trophy, Leaf } from 'lucide-react';

interface Props {
  dinosaurs: Dinosaur[];
}

const COMBAT_STATS = ['Aggression', 'Speed', 'Bite Force', 'Defense', 'Intelligence', 'Size'] as const;
const COMBAT_STAT_KEYS: Record<string, keyof Dinosaur['combatStats']> = {
  'Aggression': 'aggression',
  'Speed': 'speed',
  'Bite Force': 'biteForce',
  'Defense': 'defense',
  'Intelligence': 'intelligence',
  'Size': 'size',
};

const ECOLOGICAL_STATS = ['Apex Status', 'Geographic Spread', 'Population Density', 'Competition Pressure', 'Niche Control', 'Evolutionary Longevity'] as const;
const ECOLOGICAL_STAT_KEYS: Record<string, keyof EcologicalStats> = {
  'Apex Status': 'apexStatus',
  'Geographic Spread': 'geographicSpread',
  'Population Density': 'populationDensity',
  'Competition Pressure': 'competitionPressure',
  'Niche Control': 'nicheControl',
  'Evolutionary Longevity': 'evolutionaryLongevity',
};

const ECOLOGICAL_TOOLTIPS: Record<string, string> = {
  'Apex Status': 'Dominance level in the food chain',
  'Geographic Spread': 'Distribution across regions and continents',
  'Population Density': 'Estimated abundance within its habitat',
  'Competition Pressure': 'Ability to survive against rival species',
  'Niche Control': 'How strongly it dominated its ecological role',
  'Evolutionary Longevity': 'Duration the species persisted over time',
};

// Generate ecological stats from existing dinosaur data
function generateEcologicalStats(dino: Dinosaur): EcologicalStats {
  if (dino.ecologicalStats) return dino.ecologicalStats;
  
  // Derive ecological stats from combat stats and other attributes
  const { combatStats, diet, period, weight, length } = dino;
  
  // Apex Status: Based on diet, size, and aggression
  const apexStatus = diet === 'Carnivore' 
    ? Math.min(10, Math.round((combatStats.aggression + combatStats.size + combatStats.biteForce) / 3 + 1))
    : diet === 'Omnivore'
    ? Math.min(10, Math.round((combatStats.aggression + combatStats.defense) / 2))
    : Math.min(8, Math.round((combatStats.defense + combatStats.size) / 2));
  
  // Geographic Spread: Larger animals often had wider ranges
  const geographicSpread = Math.min(10, Math.round(
    (combatStats.speed * 0.3 + combatStats.size * 0.4 + (weight > 5000 ? 3 : weight > 1000 ? 2 : 1)) 
  ));
  
  // Population Density: Smaller, faster creatures often more abundant
  const populationDensity = Math.min(10, Math.round(
    10 - combatStats.size * 0.5 + combatStats.speed * 0.3 + (diet === 'Herbivore' ? 2 : 0)
  ));
  
  // Competition Pressure: Based on aggression, intelligence, defense
  const competitionPressure = Math.min(10, Math.round(
    (combatStats.aggression + combatStats.intelligence + combatStats.defense) / 3 + 1
  ));
  
  // Niche Control: Based on specialization (distinct features, size dominance)
  const nicheControl = Math.min(10, Math.round(
    (combatStats.size + combatStats.defense + combatStats.biteForce) / 3 + (diet === 'Carnivore' ? 1 : 0)
  ));
  
  // Evolutionary Longevity: Based on period range
  const periodYears = dino.periodRange ? Math.abs(dino.periodRange.start - dino.periodRange.end) : 10;
  const evolutionaryLongevity = Math.min(10, Math.max(3, Math.round(periodYears / 3)));
  
  return {
    apexStatus,
    geographicSpread,
    populationDensity,
    competitionPressure,
    nicheControl,
    evolutionaryLongevity,
  };
}

// Combat Analysis Radar Chart (warm tones - unchanged behavior)
function CombatRadar({ dinosaurs }: { dinosaurs: Dinosaur[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef(Date.now());
  const [hoveredAxis, setHoveredAxis] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const cx = 180, cy = 180, maxR = 130;
  const numAxes = COMBAT_STATS.length;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    // Check if hovering near an axis
    let foundAxis: number | null = null;
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const labelX = cx + Math.cos(angle) * (maxR + 18);
      const labelY = cy + Math.sin(angle) * (maxR + 18);
      const dist = Math.sqrt((x - labelX) ** 2 + (y - labelY) ** 2);
      if (dist < 25) {
        foundAxis = i;
        break;
      }
    }
    setHoveredAxis(foundAxis);
  }, [numAxes]);

  const handleMouseLeave = useCallback(() => {
    setHoveredAxis(null);
    setMousePos(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    startTimeRef.current = Date.now();

    const draw = () => {
      const t = (Date.now() - startTimeRef.current) / 1000;
      ctx.clearRect(0, 0, 360, 360);

      // Static grid rings
      for (let ring = 1; ring <= 5; ring++) {
        const r = (ring / 5) * maxR;
        ctx.beginPath();
        for (let i = 0; i <= numAxes; i++) {
          const angle = (Math.PI * 2 * (i % numAxes)) / numAxes - Math.PI / 2;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = 'hsla(0, 0%, 100%, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Static axis lines
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const isHovered = hoveredAxis === i;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
        ctx.strokeStyle = isHovered ? 'hsla(30, 60%, 60%, 0.6)' : 'hsla(0, 0%, 100%, 0.08)';
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();
      }

      // Static labels
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const lx = cx + Math.cos(angle) * (maxR + 18);
        const ly = cy + Math.sin(angle) * (maxR + 18);
        const isHovered = hoveredAxis === i;
        ctx.fillStyle = isHovered ? 'hsla(30, 60%, 70%, 1)' : 'hsla(0, 0%, 100%, 0.45)';
        ctx.font = isHovered ? 'bold 10px Inter, sans-serif' : '10px Inter, sans-serif';
        ctx.fillText(COMBAT_STATS[i], lx, ly);
      }

      // Animated spikes
      dinosaurs.forEach((dino, di) => {
        const color = COLORS[di];
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i < numAxes; i++) {
          const statKey = COMBAT_STAT_KEYS[COMBAT_STATS[i]];
          const val = dino.combatStats[statKey] / 10;
          const baseR = val * maxR;
          const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
          const phase = di * 1.7 + i * 1.1;
          const driftX = Math.sin(t * 0.8 + phase) * 2.5;
          const driftY = Math.cos(t * 0.6 + phase * 1.3) * 2.5;
          points.push({ x: cx + Math.cos(angle) * baseR + driftX, y: cy + Math.sin(angle) * baseR + driftY });
        }

        ctx.beginPath();
        points.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
        ctx.closePath();
        const fillOpacity = hoveredAxis !== null ? 0.15 : 0.1;
        ctx.fillStyle = color.replace(')', `, ${fillOpacity})`).replace('hsl(', 'hsla(');
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        points.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = color.replace(')', ', 0.2)').replace('hsl(', 'hsla(');
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [dinosaurs, hoveredAxis]);

  // Calculate overall winner
  const winner = useMemo(() => {
    let best = { name: '', total: 0, color: '', index: 0 };
    dinosaurs.forEach((d, i) => {
      const total = Object.values(d.combatStats).reduce((sum, v) => sum + v, 0);
      if (total > best.total) best = { name: d.name, total, color: COLORS[i], index: i };
    });
    return best;
  }, [dinosaurs]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full">
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        className="mx-auto block cursor-crosshair"
        style={{ width: 280, height: 280 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {/* Tooltip */}
      {hoveredAxis !== null && mousePos && (
        <div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg bg-card/95 border border-border shadow-lg backdrop-blur-sm"
          style={{
            left: Math.min(mousePos.x + 10, 200),
            top: mousePos.y - 40,
            maxWidth: 180,
          }}
        >
          <p className="text-xs font-semibold text-foreground">{COMBAT_STATS[hoveredAxis]}</p>
          <div className="mt-1 space-y-0.5">
            {dinosaurs.map((d, i) => (
              <div key={d.id} className="flex items-center gap-2 text-[10px]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-muted-foreground">{d.name}:</span>
                <span className="font-medium text-foreground">{d.combatStats[COMBAT_STAT_KEYS[COMBAT_STATS[hoveredAxis]]]}/10</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 flex-wrap justify-center">
        {dinosaurs.map((d, i) => (
          <div key={d.id} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-xs text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
      {/* Overall winner */}
      <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
        <Trophy className="h-4 w-4" style={{ color: winner.color }} />
        <span className="text-xs text-muted-foreground">Overall Winner:</span>
        <span className="text-sm font-semibold" style={{ color: winner.color }}>{winner.name}</span>
        <span className="text-xs text-muted-foreground/60">({winner.total}/60)</span>
      </div>
    </div>
  );
}

// Ecological Dominance Profile Radar Chart (cool tones - teal/blue/green)
function EcologicalRadar({ dinosaurs }: { dinosaurs: Dinosaur[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef(Date.now());
  const [hoveredAxis, setHoveredAxis] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const cx = 180, cy = 180, maxR = 130;
  const numAxes = ECOLOGICAL_STATS.length;

  // Cool-toned colors for ecological chart
  const ECOLOGICAL_COLORS = ['hsl(180, 60%, 50%)', 'hsl(160, 50%, 45%)', 'hsl(200, 55%, 55%)', 'hsl(140, 45%, 50%)'];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    // Check if hovering near an axis
    let foundAxis: number | null = null;
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const labelX = cx + Math.cos(angle) * (maxR + 18);
      const labelY = cy + Math.sin(angle) * (maxR + 18);
      const dist = Math.sqrt((x - labelX) ** 2 + (y - labelY) ** 2);
      if (dist < 30) {
        foundAxis = i;
        break;
      }
    }
    setHoveredAxis(foundAxis);
  }, [numAxes]);

  const handleMouseLeave = useCallback(() => {
    setHoveredAxis(null);
    setMousePos(null);
  }, []);

  // Memoize ecological stats for each dinosaur
  const dinoEcoStats = useMemo(() => {
    return dinosaurs.map(d => generateEcologicalStats(d));
  }, [dinosaurs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    startTimeRef.current = Date.now();

    const draw = () => {
      const t = (Date.now() - startTimeRef.current) / 1000;
      ctx.clearRect(0, 0, 360, 360);

      // Static grid rings
      for (let ring = 1; ring <= 5; ring++) {
        const r = (ring / 5) * maxR;
        ctx.beginPath();
        for (let i = 0; i <= numAxes; i++) {
          const angle = (Math.PI * 2 * (i % numAxes)) / numAxes - Math.PI / 2;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = 'hsla(180, 20%, 100%, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Static axis lines
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const isHovered = hoveredAxis === i;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
        ctx.strokeStyle = isHovered ? 'hsla(180, 60%, 50%, 0.6)' : 'hsla(0, 0%, 100%, 0.08)';
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();
      }

      // Static labels (wrapped for longer text)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const lx = cx + Math.cos(angle) * (maxR + 28);
        const ly = cy + Math.sin(angle) * (maxR + 28);
        const isHovered = hoveredAxis === i;
        ctx.fillStyle = isHovered ? 'hsla(180, 60%, 70%, 1)' : 'hsla(0, 0%, 100%, 0.45)';
        ctx.font = isHovered ? 'bold 9px Inter, sans-serif' : '9px Inter, sans-serif';
        
        // Split label into two lines if needed
        const label = ECOLOGICAL_STATS[i];
        const words = label.split(' ');
        if (words.length > 1) {
          ctx.fillText(words[0], lx, ly - 5);
          ctx.fillText(words.slice(1).join(' '), lx, ly + 5);
        } else {
          ctx.fillText(label, lx, ly);
        }
      }

      // Animated spikes with cool tones
      dinosaurs.forEach((dino, di) => {
        const color = ECOLOGICAL_COLORS[di % ECOLOGICAL_COLORS.length];
        const ecoStats = dinoEcoStats[di];
        const points: { x: number; y: number }[] = [];
        
        for (let i = 0; i < numAxes; i++) {
          const statKey = ECOLOGICAL_STAT_KEYS[ECOLOGICAL_STATS[i]];
          const val = ecoStats[statKey] / 10;
          const baseR = val * maxR;
          const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
          const phase = di * 1.7 + i * 1.1;
          const driftX = Math.sin(t * 0.8 + phase) * 2.5;
          const driftY = Math.cos(t * 0.6 + phase * 1.3) * 2.5;
          points.push({ x: cx + Math.cos(angle) * baseR + driftX, y: cy + Math.sin(angle) * baseR + driftY });
        }

        ctx.beginPath();
        points.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
        ctx.closePath();
        const fillOpacity = hoveredAxis !== null ? 0.15 : 0.1;
        ctx.fillStyle = color.replace(')', `, ${fillOpacity})`).replace('hsl(', 'hsla(');
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        points.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = color.replace(')', ', 0.2)').replace('hsl(', 'hsla(');
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [dinosaurs, hoveredAxis, dinoEcoStats, ECOLOGICAL_COLORS]);

  // Calculate ecological leader
  const leader = useMemo(() => {
    let best = { name: '', total: 0, color: '', index: 0 };
    dinosaurs.forEach((d, i) => {
      const ecoStats = dinoEcoStats[i];
      const total = Object.values(ecoStats).reduce((sum, v) => sum + v, 0);
      if (total > best.total) best = { name: d.name, total, color: ECOLOGICAL_COLORS[i % ECOLOGICAL_COLORS.length], index: i };
    });
    return best;
  }, [dinosaurs, dinoEcoStats, ECOLOGICAL_COLORS]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full">
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        className="mx-auto block cursor-crosshair"
        style={{ width: 280, height: 280 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {/* Tooltip */}
      {hoveredAxis !== null && mousePos && (
        <div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg bg-card/95 border border-border shadow-lg backdrop-blur-sm"
          style={{
            left: Math.min(mousePos.x + 10, 180),
            top: mousePos.y - 40,
            maxWidth: 200,
          }}
        >
          <p className="text-xs font-semibold text-foreground">{ECOLOGICAL_STATS[hoveredAxis]}</p>
          <p className="text-[10px] text-muted-foreground mb-1">{ECOLOGICAL_TOOLTIPS[ECOLOGICAL_STATS[hoveredAxis]]}</p>
          <div className="mt-1 space-y-0.5">
            {dinosaurs.map((d, i) => (
              <div key={d.id} className="flex items-center gap-2 text-[10px]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ECOLOGICAL_COLORS[i % ECOLOGICAL_COLORS.length] }} />
                <span className="text-muted-foreground">{d.name}:</span>
                <span className="font-medium text-foreground">{dinoEcoStats[i][ECOLOGICAL_STAT_KEYS[ECOLOGICAL_STATS[hoveredAxis]]]}/10</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 flex-wrap justify-center">
        {dinosaurs.map((d, i) => (
          <div key={d.id} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ECOLOGICAL_COLORS[i % ECOLOGICAL_COLORS.length] }} />
            <span className="text-xs text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
      {/* Overall leader */}
      <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
        <Leaf className="h-4 w-4" style={{ color: leader.color }} />
        <span className="text-xs text-muted-foreground">Ecological Leader:</span>
        <span className="text-sm font-semibold" style={{ color: leader.color }}>{leader.name}</span>
        <span className="text-xs text-muted-foreground/60">({leader.total}/60)</span>
      </div>
    </div>
  );
}

export default function AnalyticalLab({ dinosaurs }: Props) {
  const [skeletonMode, setSkeletonMode] = useState(false);

  return (
    <div>
      <h2 className="text-2xl font-medium uppercase tracking-[0.12em] text-foreground mb-8">Analytical Lab</h2>

      {/* ROW 1: Combat Analysis (40%) + Geological Timeline (60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 mb-6">
        {/* Combat Analysis Chart */}
        <section className="info-panel flex items-center justify-center" style={{ minHeight: 420 }}>
          <div className="w-full">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4 font-medium text-center">Combat Analysis</p>
            <CombatRadar dinosaurs={dinosaurs} />
          </div>
        </section>

        {/* Geological Timeline */}
        <section className="info-panel flex flex-col" style={{ minHeight: 420 }}>
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3 font-medium">Geological Timeline</p>
          <div className="flex-1 flex items-center">
            <InteractiveTimeline dinosaurs={dinosaurs} />
          </div>
        </section>
      </div>

      {/* ROW 2: Discovery Locations (60%) + Ecological Dominance (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 mb-6">
        {/* Discovery Locations */}
        <section className="info-panel overflow-hidden flex flex-col" style={{ minHeight: 420 }}>
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3 font-medium flex-shrink-0">Discovery Locations</p>
          <div className="flex-1 min-h-0 overflow-hidden">
            <LocationMap dinosaurs={dinosaurs} />
          </div>
        </section>

        {/* Ecological Dominance Profile - NEW */}
        <section className="info-panel flex items-center justify-center" style={{ minHeight: 420 }}>
          <div className="w-full">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4 font-medium text-center">Ecological Dominance Profile</p>
            <EcologicalRadar dinosaurs={dinosaurs} />
          </div>
        </section>
      </div>

      {/* ROW 3: Skeleton Data - Full Width */}
      <section className="info-panel">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Skeleton Data</p>
          <button
            onClick={() => setSkeletonMode(!skeletonMode)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded-md bg-secondary"
          >
            {skeletonMode ? 'Hide Details' : 'Show Skeleton Mode'}
          </button>
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${dinosaurs.length}, 1fr)` }}>
          {dinosaurs.map((d, i) => (
            <div key={d.id} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-sm font-semibold text-foreground">{d.name}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mb-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${d.skeletonData.completeness}%`, backgroundColor: COLORS[i] }} />
              </div>
              <p className="text-xs text-muted-foreground">{d.skeletonData.completeness}% complete</p>
              {skeletonMode && (
                <div className="text-left mt-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.12em] mb-1">Recovered</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {d.skeletonData.recoveredBones.map(b => (
                      <span key={b} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-foreground/70">{b}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.12em] mb-1">Missing</p>
                  <div className="flex flex-wrap gap-1">
                    {d.skeletonData.missingBones.map(b => (
                      <span key={b} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-destructive/60">{b}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <SkeletonVisualizer dinosaurs={dinosaurs} skeletonMode={skeletonMode} />
      </section>
    </div>
  );
}
