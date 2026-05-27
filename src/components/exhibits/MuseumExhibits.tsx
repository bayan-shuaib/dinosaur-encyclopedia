import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Dinosaur } from '@/data/types';
import { getTaxonomyType } from '@/lib/taxonomy';

// ── Shared types ──────────────────────────────────────────────────────────────

interface ExhibitCardProps {
  badge:    string;
  title:    string;
  subtitle: string;
  children: React.ReactNode;
  note?:    string;
}

// ── Shared utilities ──────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

const MODERN_BITE: Array<{ name: string; kn: number }> = [
  { name: 'Human',         kn: 0.7  },
  { name: 'Wolf',          kn: 1.0  },
  { name: 'Hyena',         kn: 4.5  },
  { name: 'Nile Crocodile',kn: 22   },
  { name: 'Saltwater Croc',kn: 35   },
];

function closestModern(kn: number) {
  return MODERN_BITE.reduce((best, m) =>
    Math.abs(m.kn - kn) < Math.abs(best.kn - kn) ? m : best
  );
}

// ── Museum Exhibit Card ───────────────────────────────────────────────────────

function MuseumExhibitCard({ badge, title, subtitle, children, note }: ExhibitCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl border border-amber-500/20 bg-card/95 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/20"
      data-testid={`exhibit-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Amber accent top line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-amber-500/0 via-amber-400/60 to-amber-500/0" />

      <div className="p-5 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block text-[9px] uppercase tracking-[0.22em] font-display text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-sm px-2 py-0.5">
              {badge}
            </span>
            <h3 className="text-xl md:text-2xl font-display font-bold tracking-tight text-foreground leading-tight">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground font-body">{subtitle}</p>
          </div>
          {/* Decorative exhibit dot grid */}
          <div className="flex-shrink-0 grid grid-cols-3 gap-1 opacity-20 mt-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-amber-400" />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/40" />

        {/* Interactive content */}
        {children}

        {/* Scientific note */}
        {note && (
          <div className="rounded-lg border border-border/40 bg-secondary/30 p-3.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-amber-400/70 font-display mb-1">
              Scientific Note
            </p>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">{note}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Stat Bar ─────────────────────────────────────────────────────────────────

function StatBar({ label, value, max, unit, color = 'amber' }: {
  label: string; value: number; max: number; unit?: string; color?: string;
}) {
  const pct = clamp((value / max) * 100, 0, 100);
  const colorClass = color === 'amber'  ? 'bg-amber-400'
                   : color === 'blue'   ? 'bg-blue-400'
                   : color === 'green'  ? 'bg-emerald-400'
                   : color === 'red'    ? 'bg-red-400'
                   : 'bg-primary';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-display">{label}</span>
        <span className="text-xs font-mono text-foreground/70 tabular-nums">
          {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}{unit ? ` ${unit}` : ''}
        </span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}

// ── Bite Force Laboratory ─────────────────────────────────────────────────────

function BiteForceLab({ dino }: { dino: Dinosaur }) {
  const [angle, setAngle] = useState(45);
  const [resist, setResist] = useState<'soft' | 'medium' | 'hard'>('medium');

  const baseKN = dino.combatStats.biteForce * 2.1;          // kN at 45°
  const angleEffect = Math.cos((angle * Math.PI) / 180) * 1.6 + 0.4; // wider = less
  const resistFactor = resist === 'soft' ? 0.65 : resist === 'medium' ? 1.0 : 1.35;
  const rawKN = baseKN * angleEffect * resistFactor;
  const displayKN = clamp(rawKN, 0.4, 95);
  const displayN  = Math.round(displayKN * 1000);
  const maxKN = dino.combatStats.biteForce * 2.1 * 2.0 * 1.35;
  const gaugeP = clamp((displayKN / maxKN) * 100, 4, 100);

  const modern = closestModern(displayKN);
  const forceLabel = displayKN < 5 ? 'LOW' : displayKN < 15 ? 'MODERATE' : displayKN < 35 ? 'HIGH' : 'EXTREME';
  const forceColor = displayKN < 5 ? 'text-blue-400' : displayKN < 15 ? 'text-amber-300' : displayKN < 35 ? 'text-orange-400' : 'text-red-400';

  return (
    <MuseumExhibitCard
      badge="Museum Interactive"
      title="Bite Force Laboratory"
      subtitle="Cranial Mechanics Research Station — Adjust variables to calculate estimated bite force"
      note="Bite force scales with jaw adductor cross-section and gape angle. All values are model estimates; actual forces varied by individual size, prey item, and jaw position."
    >
      <div className="space-y-6">
        {/* Jaw angle visualization */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-display">
                  Jaw Opening Angle
                </span>
                <span className="text-sm font-mono text-amber-300 tabular-nums">{angle}°</span>
              </div>
              <input
                type="range" min={15} max={65} step={5} value={angle}
                onChange={e => setAngle(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-amber-400 bg-secondary"
                data-testid="slider-jaw-angle"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/50 font-mono">
                <span>15° CLOSED</span><span>65° WIDE</span>
              </div>
            </div>

            {/* Prey resistance */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-display block">
                Prey Resistance
              </span>
              <div className="flex gap-2">
                {(['soft', 'medium', 'hard'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setResist(r)}
                    data-testid={`button-resist-${r}`}
                    className={`flex-1 px-3 py-1.5 rounded-md text-[11px] font-display uppercase tracking-wider border transition-all ${
                      resist === r
                        ? 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                        : 'border-border/50 text-muted-foreground hover:border-border'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Jaw diagram */}
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-28 flex flex-col items-center justify-center">
              {/* Upper jaw */}
              <div
                className="w-32 h-3 bg-gradient-to-r from-amber-600/40 via-amber-500/60 to-amber-600/40 rounded-full border border-amber-400/30 origin-right transition-transform duration-300"
                style={{ transform: `rotate(-${angle * 0.3}deg)` }}
              />
              {/* Jaw gap label */}
              <div className="py-1 text-[10px] font-mono text-amber-400/50">{angle}°</div>
              {/* Lower jaw */}
              <div
                className="w-32 h-3 bg-gradient-to-r from-amber-600/40 via-amber-500/60 to-amber-600/40 rounded-full border border-amber-400/30 origin-right transition-transform duration-300"
                style={{ transform: `rotate(${angle * 0.3}deg)` }}
              />
              <div className="absolute inset-0 rounded-full bg-amber-400/[0.02]" />
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4 space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-amber-400/70 font-display">
                Calculated Bite Force
              </p>
              <p className="text-3xl font-display font-bold text-foreground tabular-nums mt-1">
                {displayN.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-1.5">N</span>
              </p>
              <p className={`text-[10px] font-display uppercase tracking-[0.2em] mt-0.5 ${forceColor}`}>
                {forceLabel}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground font-body">
              <p>≈ {displayKN.toFixed(1)} kN</p>
              <p className="text-[11px] mt-0.5 text-muted-foreground/60">
                Closest modern: {modern.name}
              </p>
            </div>
          </div>
          {/* Gauge */}
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
              animate={{ width: `${gaugeP}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>
    </MuseumExhibitCard>
  );
}

// ── Locomotion Reconstruction Lab ─────────────────────────────────────────────

function LocomotionLab({ dino, variant }: { dino: Dinosaur; variant: 'life' | 'science' }) {
  const taxon = getTaxonomyType(dino);
  const [terrain, setTerrain] = useState<'flat' | 'slope' | 'rough'>('flat');
  const terrainFactor = terrain === 'flat' ? 1.0 : terrain === 'slope' ? 0.72 : 0.85;

  const baseSpeed = dino.combatStats.speed * (taxon === 'pterosaur' ? 5.8 : taxon === 'marine_reptile' ? 4.2 : 5.0);
  const displaySpeed = Math.round(baseSpeed * terrainFactor * 10) / 10;
  const strideLen = (dino.combatStats.speed * 0.45 + 0.8).toFixed(1);
  const gaugePct = clamp((displaySpeed / 60) * 100, 5, 100);

  const terrainLabel = taxon === 'marine_reptile'
    ? ['Open water', 'Shallow coast', 'Dense vegetation']
    : taxon === 'pterosaur'
    ? ['Thermal soaring', 'Powered flight', 'Headwind']
    : ['Flat terrain', 'Incline', 'Rough ground'];

  return (
    <MuseumExhibitCard
      badge={variant === 'science' ? 'Research Station' : 'Museum Interactive'}
      title="Locomotion Reconstruction Lab"
      subtitle={
        taxon === 'marine_reptile'
          ? 'Hydrodynamic Analysis — Aquatic speed reconstruction from fossil limb proportions'
          : taxon === 'pterosaur'
          ? 'Flight Mechanics Analysis — Aerial performance from wingspan and skeletal ratios'
          : 'Biomechanical Analysis — Speed reconstruction from limb proportions and trackway data'
      }
      note={
        taxon === 'marine_reptile'
          ? 'Aquatic speed is estimated from flipper morphology and body depth. Marine reptiles likely used energy-efficient cruising gaits, reserving burst speed for prey pursuit.'
          : taxon === 'pterosaur'
          ? 'Flight speed is modelled from wingspan, wing loading and body mass. Pterosaurs could exploit thermals for near-effortless long-distance travel.'
          : 'Speed estimates carry wide uncertainty. Different biomechanical models applied to identical skeletons can vary by several km/h. Presented values represent plausible midpoint estimates.'
      }
    >
      <div className="space-y-5">
        {/* Terrain selector */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-display block">
            {taxon === 'marine_reptile' ? 'Environment' : taxon === 'pterosaur' ? 'Conditions' : 'Terrain Type'}
          </span>
          <div className="flex gap-2">
            {(['flat', 'slope', 'rough'] as const).map((t, i) => (
              <button
                key={t}
                onClick={() => setTerrain(t)}
                data-testid={`button-terrain-${t}`}
                className={`flex-1 px-2 py-1.5 rounded-md text-[11px] font-display leading-tight border transition-all ${
                  terrain === t
                    ? 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                    : 'border-border/50 text-muted-foreground hover:border-border'
                }`}
              >
                {terrainLabel[i]}
              </button>
            ))}
          </div>
        </div>

        {/* Speed output */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-amber-400/70 font-display">
                {taxon === 'marine_reptile' ? 'Cruise Speed' : taxon === 'pterosaur' ? 'Airspeed Estimate' : 'Estimated Speed'}
              </p>
              <p className="text-3xl font-display font-bold text-foreground tabular-nums mt-1">
                {displaySpeed}
                <span className="text-sm font-normal text-muted-foreground ml-1.5">km/h</span>
              </p>
            </div>
            {taxon !== 'pterosaur' && taxon !== 'marine_reptile' && (
              <div className="text-right text-xs text-muted-foreground font-body space-y-0.5">
                <p>Stride: ~{strideLen} m</p>
                <p className="text-[11px] text-muted-foreground/60">
                  {displaySpeed >= 40 ? 'Fast runner' : displaySpeed >= 20 ? 'Moderate pace' : 'Slow mover'}
                </p>
              </div>
            )}
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-300"
              animate={{ width: `${gaugePct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Animated stride dots */}
        {taxon !== 'pterosaur' && taxon !== 'marine_reptile' && (
          <div className="relative h-10 overflow-hidden rounded-md bg-secondary/30 border border-border/30">
            <div className="absolute inset-x-0 bottom-2 h-px bg-border/50" />
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="absolute bottom-[11px] h-2.5 w-2.5 rounded-full bg-amber-400/70"
                animate={{ x: ['0%', '110%'] }}
                transition={{
                  duration: Math.max(0.4, 2.5 - dino.combatStats.speed * 0.18),
                  delay: i * (0.8 - dino.combatStats.speed * 0.05),
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ left: `${i * 33}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </MuseumExhibitCard>
  );
}

// ── Sensory Reconstruction Exhibit ────────────────────────────────────────────

function SensoryExhibit({ dino }: { dino: Dinosaur }) {
  const iq = dino.combatStats.intelligence;
  const isCarnivore = dino.diet === 'Carnivore' || dino.diet === 'Piscivore';
  const isMarine = getTaxonomyType(dino) === 'marine_reptile';

  // Derive sensory scores (0-100)
  const vision      = isCarnivore ? clamp(iq * 7 + 18, 20, 95) : clamp(iq * 5 + 30, 25, 80);
  const binocular   = isCarnivore ? clamp(iq * 3 + 20, 15, 55) : clamp(iq * 1.5 + 5, 8, 30); // degrees
  const monocular   = isCarnivore ? clamp(220 - binocular * 1.4, 140, 260) : clamp(300 - binocular, 200, 340);
  const smell       = !isMarine   ? clamp(iq * 6 + 25, 30, 95) : clamp(iq * 3 + 15, 20, 55);
  const hearing     = clamp(iq * 8 + 10, 20, 90);
  const balance     = isMarine ? clamp(iq * 9 + 10, 50, 95) : clamp(iq * 7 + 20, 35, 85);

  const [hovered, setHovered] = useState<string | null>(null);

  const sensors = [
    { key: 'vision',   label: 'Visual Acuity',      value: vision,   color: 'amber',  desc: `${binocular}° binocular / ${monocular}° monocular field` },
    { key: 'smell',    label: 'Olfactory Sensitivity', value: smell,  color: 'green',  desc: isMarine ? 'Reduced in aquatic medium' : iq >= 7 ? 'Highly developed olfactory bulbs' : 'Moderate olfactory capacity' },
    { key: 'hearing',  label: 'Hearing Range',       value: hearing,  color: 'blue',   desc: `Estimated ${Math.round(hearing * 0.35 + 60)} Hz–${Math.round(hearing * 220 + 2000)} Hz` },
    { key: 'balance',  label: 'Vestibular Function', value: balance,  color: 'amber',  desc: 'Inner ear canal morphology from braincase endocast' },
  ];

  return (
    <MuseumExhibitCard
      badge="Research Station"
      title="Sensory Reconstruction Exhibit"
      subtitle="Cranial Nerve & Inner Ear Analysis — Derived from endocast and bony labyrinth morphology"
      note="Sensory reconstructions are inferred from the relative size of cranial nerve openings, the dimensions of the olfactory bulb impression in the endocast, and the bony semicircular canals. Values are proportional estimates, not absolute measurements."
    >
      <div className="space-y-4">
        {/* Vision field diagram */}
        <div className="flex gap-6 items-center">
          <div className="relative flex-shrink-0 h-28 w-28">
            {/* Monocular arcs */}
            <div
              className="absolute inset-0 rounded-full border-4 border-blue-400/15"
              style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%)' }}
            />
            {/* Binocular overlap */}
            <div
              className="absolute rounded-full bg-amber-400/15 border border-amber-400/30"
              style={{
                width:  `${Math.round(binocular * 1.1)}%`,
                height: `${Math.round(binocular * 1.1)}%`,
                top:    `${50 - binocular * 0.55}%`,
                left:   `${50 - binocular * 0.55}%`,
              }}
            />
            {/* Eye dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-amber-400/80" />
            <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground/50 font-mono whitespace-nowrap">
              Vision Field
            </p>
          </div>

          <div className="flex-1 space-y-3">
            {sensors.map(s => (
              <div
                key={s.key}
                className="space-y-1 cursor-help"
                onMouseEnter={() => setHovered(s.key)}
                onMouseLeave={() => setHovered(null)}
              >
                <StatBar label={s.label} value={s.value} max={100} color={s.color} />
                {hovered === s.key && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] text-muted-foreground/60 font-body italic"
                  >
                    {s.desc}
                  </motion.p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MuseumExhibitCard>
  );
}

// ── Ecological Position Exhibit ───────────────────────────────────────────────

function EcologicalExhibit({ dino }: { dino: Dinosaur }) {
  const eco = dino.ecologicalStats;
  if (!eco) return null;

  const bars = [
    { label: 'Apex Influence',          value: eco.apexStatus,             color: 'red'   },
    { label: 'Niche Dominance',         value: eco.nicheControl,           color: 'amber' },
    { label: 'Geographic Range',        value: eco.geographicSpread,       color: 'blue'  },
    { label: 'Population Density',      value: eco.populationDensity,      color: 'green' },
    { label: 'Competition Pressure',    value: eco.competitionPressure,    color: 'amber' },
    { label: 'Evolutionary Longevity',  value: eco.evolutionaryLongevity,  color: 'blue'  },
  ];

  return (
    <MuseumExhibitCard
      badge="Exhibit Display"
      title="Ecological Position Analysis"
      subtitle="Community Ecology Research — Reconstructed from fossil distribution and associated fauna"
      note="Ecological ratings are modelled indices — not measured quantities. They reflect the consensus reconstruction based on fossil abundance, geographic occurrence, and trophic role relative to contemporaneous species."
    >
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
        {bars.map(b => (
          <StatBar
            key={b.label}
            label={b.label}
            value={b.value}
            max={10}
            unit="/10"
            color={b.color}
          />
        ))}
      </div>
    </MuseumExhibitCard>
  );
}

// ── Main Exhibit Selector ─────────────────────────────────────────────────────

interface SectionExhibitProps {
  sectionId: string;
  dino:      Dinosaur;
  mode:      'life' | 'scientific';
}

export function SectionExhibit({ sectionId, dino, mode }: SectionExhibitProps) {
  const taxon    = getTaxonomyType(dino);
  const isCarni  = dino.diet === 'Carnivore' || dino.diet === 'Piscivore';
  const hasBite  = dino.combatStats.biteForce >= 4;

  if (mode === 'life') {
    if (sectionId === 'diet' && isCarni && hasBite) {
      return <BiteForceLab dino={dino} />;
    }
    if (sectionId === 'behavior') {
      return <LocomotionLab dino={dino} variant="life" />;
    }
    if (sectionId === 'role' && dino.ecologicalStats) {
      return <EcologicalExhibit dino={dino} />;
    }
  }

  if (mode === 'scientific') {
    if (sectionId === 'bite') {
      return <BiteForceLab dino={dino} />;
    }
    if (sectionId === 'speed') {
      return <LocomotionLab dino={dino} variant="science" />;
    }
    if (sectionId === 'intel') {
      return <SensoryExhibit dino={dino} />;
    }
  }

  return null;
}
