import { useState, useEffect, useRef, useMemo } from 'react';
import { Dinosaur } from '@/data/types';
import { COLORS } from '@/pages/ComparePage';
import InteractiveTimeline from '@/components/InteractiveTimeline';
import LocationMap from '@/components/LocationMap';
import SkeletonVisualizer from '@/components/SkeletonVisualizer';
import { Trophy } from 'lucide-react';

interface Props {
  dinosaurs: Dinosaur[];
}

const STATS = ['Aggression', 'Speed', 'Bite Force', 'Defense', 'Intelligence', 'Size'] as const;
const STAT_KEYS: Record<string, keyof Dinosaur['combatStats']> = {
  'Aggression': 'aggression',
  'Speed': 'speed',
  'Bite Force': 'biteForce',
  'Defense': 'defense',
  'Intelligence': 'intelligence',
  'Size': 'size',
};

function AnimatedRadar({ dinosaurs }: { dinosaurs: Dinosaur[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef(Date.now());

  const cx = 180, cy = 180, maxR = 130;
  const numAxes = STATS.length;

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
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
        ctx.strokeStyle = 'hsla(0, 0%, 100%, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Static labels
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = 'hsla(0, 0%, 100%, 0.45)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const lx = cx + Math.cos(angle) * (maxR + 18);
        const ly = cy + Math.sin(angle) * (maxR + 18);
        ctx.fillText(STATS[i], lx, ly);
      }

      // Animated spikes
      dinosaurs.forEach((dino, di) => {
        const color = COLORS[di];
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i < numAxes; i++) {
          const statKey = STAT_KEYS[STATS[i]];
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
        ctx.fillStyle = color.replace(')', ', 0.1)').replace('hsl(', 'hsla(');
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
  }, [dinosaurs]);

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
    <div className="flex flex-col items-center justify-center w-full">
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        className="mx-auto block"
        style={{ width: 300, height: 300 }}
      />
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

export default function AnalyticalLab({ dinosaurs }: Props) {
  const [skeletonMode, setSkeletonMode] = useState(false);

  return (
    <div>
      <h2 className="text-2xl font-medium uppercase tracking-[0.12em] text-foreground mb-8">Analytical Lab</h2>

      {/* Block A (left) + Block B & C (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 mb-6">
        {/* Block A — Radar Chart */}
        <section className="info-panel flex items-center justify-center" style={{ minHeight: 420 }}>
          <div className="w-full">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4 font-medium text-center">Combat Analysis</p>
            <AnimatedRadar dinosaurs={dinosaurs} />
          </div>
        </section>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Block B — Timeline */}
          <section className="info-panel flex-1" style={{ minHeight: 200 }}>
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3 font-medium">Geological Timeline</p>
            <InteractiveTimeline dinosaurs={dinosaurs} />
          </section>

          {/* Block C — Location Map */}
          <section className="info-panel flex-1" style={{ minHeight: 200 }}>
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3 font-medium">Discovery Locations</p>
            <LocationMap dinosaurs={dinosaurs} />
          </section>
        </div>
      </div>

      {/* Block D — Skeleton Data */}
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
