import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dinosaur } from '@/data/types';
import { getTaxonomyType } from '@/lib/taxonomy';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

type Confidence = 'high' | 'moderate' | 'speculative';

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function ConfidenceBadge({ level }: { level: Confidence }) {
  const c = {
    high:        { cls: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400', label: 'High Confidence' },
    moderate:    { cls: 'bg-amber-500/15 border-amber-400/30 text-amber-400',       label: 'Moderate Confidence' },
    speculative: { cls: 'bg-violet-500/15 border-violet-400/30 text-violet-400',    label: 'Speculative' },
  }[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-display border rounded-sm px-2 py-0.5 flex-shrink-0 ${c.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  );
}

interface EvidenceData { what: string; why: string; evidence: string; confidence: Confidence; }

function EvidencePanel({ data }: { data: EvidenceData }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border/40 bg-secondary/20 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        data-testid="button-evidence-toggle"
        className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-secondary/30 transition-colors gap-3"
      >
        <span className="text-[10px] uppercase tracking-[0.18em] text-amber-400/70 font-display whitespace-nowrap">
          Scientific Evidence
        </span>
        <div className="flex items-center gap-2 min-w-0">
          <ConfidenceBadge level={data.confidence} />
          <motion.span
            animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
            className="text-muted-foreground/40 text-sm leading-none select-none flex-shrink-0"
          >▾</motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.22 }} className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-2.5 border-t border-border/30">
              {([
                ['What scientists think', data.what],
                ['Why they think it',     data.why],
                ['Supporting evidence',   data.evidence],
              ] as [string, string][]).map(([lbl, txt]) => (
                <div key={lbl} className="pt-2">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/50 font-display mb-0.5">{lbl}</p>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed">{txt}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MuseumExhibitCard({ badge, title, subtitle, children, note }: {
  badge: string; title: string; subtitle: string; children: React.ReactNode; note?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl border border-amber-500/20 bg-card/95 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/20"
      data-testid={`exhibit-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="h-[2px] w-full bg-gradient-to-r from-amber-500/0 via-amber-400/60 to-amber-500/0" />
      <div className="p-5 md:p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block text-[9px] uppercase tracking-[0.22em] font-display text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-sm px-2 py-0.5">
              {badge}
            </span>
            <h3 className="text-xl md:text-2xl font-display font-bold tracking-tight text-foreground leading-tight">{title}</h3>
            <p className="text-xs text-muted-foreground font-body">{subtitle}</p>
          </div>
          <div className="flex-shrink-0 grid grid-cols-3 gap-1 opacity-20 mt-1">
            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-1 w-1 rounded-full bg-amber-400" />)}
          </div>
        </div>
        <div className="h-px bg-border/40" />
        {children}
        {note && (
          <div className="rounded-lg border border-border/40 bg-secondary/30 p-3.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-amber-400/70 font-display mb-1">Scientific Note</p>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">{note}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatBar({ label, value, max, unit, color = 'amber' }: {
  label: string; value: number; max: number; unit?: string; color?: string;
}) {
  const pct = clamp((value / max) * 100, 0, 100);
  const colorCls: Record<string, string> = {
    amber: 'bg-amber-400', blue: 'bg-blue-400', green: 'bg-emerald-400',
    red: 'bg-red-400', violet: 'bg-violet-400', teal: 'bg-teal-400',
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-display">{label}</span>
        <span className="text-xs font-mono text-foreground/70 tabular-nums">
          {value % 1 !== 0 ? value.toFixed(1) : value}{unit ? ` ${unit}` : ''}
        </span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorCls[color] ?? 'bg-primary'}`}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCIENTIFIC MODE EXHIBITS
// ─────────────────────────────────────────────────────────────────────────────

// ── Bite Force Laboratory V2 ──────────────────────────────────────────────────

const SKULL_STRUCTS = [
  {
    id: 'adductor',
    label: 'Jaw Adductor Complex',
    sublabel: 'M. adductor mandibulae externus',
    color: '#f59e0b',
    contrib: 70,
    what: 'The jaw adductor complex is the primary bite-closing muscle group, originating on the temporal bones and inserting on the dentary of the lower jaw.',
    why: 'Larger temporal fenestrae indicate larger muscle volume, which scales directly with bite force output. Fenestra area can be measured precisely from fossil skulls.',
    evidence: 'Temporal fenestra dimensions via CT scanning, osteological attachment scars on squamosal and postorbital bones, calibrated against living crocodilians with known muscle volumes.',
  },
  {
    id: 'pterygoid',
    label: 'Coronoid & Pterygoid',
    sublabel: 'M. pterygoideus + coronoid buttress',
    color: '#60a5fa',
    contrib: 20,
    what: 'The pterygoid and coronoid muscles run along the inside of the lower jaw, supplementing the main adductor and contributing jaw stability during prey processing.',
    why: 'Coronoid process height and pterygoid fossa depth indicate relative muscle mass for these secondary adductors. Deep fossae imply larger muscle cross-sections.',
    evidence: 'Lower jaw bone geometry, pterygoid fossa volumetric analysis, comparison with archosaurian outgroups where soft-tissue impressions are occasionally preserved.',
  },
  {
    id: 'dental',
    label: 'Dental Battery',
    sublabel: 'Tooth geometry & replacement rate',
    color: '#34d399',
    contrib: 10,
    what: 'Tooth shape and enamel microstructure constrain the type and sustainable magnitude of forces the dentition could apply — blade-like teeth shear, rounded teeth crush.',
    why: 'Tooth fracture mechanics set an upper limit on sustainable bite force. Enamel thickness and root depth indicate what loads the dentition was engineered to absorb.',
    evidence: 'SEM analysis of enamel microstructure, mesial/distal serration density, tooth root depth cross-sections, bite marks on associated fossil bone for force calibration.',
  },
];

function SkullSVG({ active, onSelect, isHerbivore }: {
  active: string | null; onSelect: (id: string | null) => void; isHerbivore: boolean;
}) {
  const toothCount = isHerbivore ? 14 : 8;
  const toothSpacing = isHerbivore ? 11 : 17;
  const toothH = isHerbivore ? 5 : 9;

  return (
    <svg viewBox="0 0 300 148" className="w-full" style={{ maxHeight: 190 }} aria-label="Annotated skull schematic">
      {/* ── Skull outline ── */}
      <path
        d="M 26,78 Q 30,54 60,42 Q 92,30 138,27 Q 188,24 228,38 Q 260,50 270,70 Q 278,86 268,104 Q 250,120 216,126 Q 178,132 138,130 Q 98,128 66,116 Q 40,108 26,92 Z"
        fill="none" stroke="currentColor" strokeOpacity={0.16} strokeWidth={1.5}
      />
      {/* Snout */}
      <path d="M 26,78 L 14,80 L 14,98 L 26,94" fill="none" stroke="currentColor" strokeOpacity={0.13} strokeWidth={1.2} />
      {/* Orbit */}
      <circle cx={128} cy={72} r={25} fill="rgba(0,0,0,0.3)" stroke="currentColor" strokeOpacity={0.26} strokeWidth={1.5} />
      {/* Antorbital fenestra */}
      <ellipse cx={80} cy={72} rx={21} ry={16} fill="rgba(0,0,0,0.25)" stroke="currentColor" strokeOpacity={0.22} strokeWidth={1} />
      {/* Upper temporal fenestra */}
      <ellipse cx={208} cy={50} rx={27} ry={18} fill="rgba(0,0,0,0.25)" stroke="currentColor" strokeOpacity={0.22} strokeWidth={1} />
      {/* Lower (infratemporal) fenestra */}
      <ellipse cx={226} cy={90} rx={22} ry={14} fill="rgba(0,0,0,0.25)" stroke="currentColor" strokeOpacity={0.22} strokeWidth={1} />
      {/* Lower jaw */}
      <path d="M 26,94 Q 50,112 88,118 Q 128,124 168,118 Q 208,112 244,98"
        fill="none" stroke="currentColor" strokeOpacity={0.16} strokeWidth={1.2} />
      {/* Teeth row */}
      {Array.from({ length: toothCount }).map((_, i) => {
        const x = 20 + i * toothSpacing;
        return (
          <polygon key={i}
            points={`${x},90 ${x + toothSpacing * 0.4},${90 - toothH} ${x + toothSpacing * 0.8},90`}
            fill="currentColor" fillOpacity={0.10}
          />
        );
      })}

      {/* ── Clickable muscle region overlays ── */}
      {/* Jaw Adductor Complex */}
      <ellipse
        cx={218} cy={68} rx={50} ry={34}
        fill="#f59e0b" fillOpacity={active === 'adductor' ? 0.32 : 0.12}
        stroke="#f59e0b" strokeOpacity={active === 'adductor' ? 0.65 : 0.25} strokeWidth={active === 'adductor' ? 1.5 : 0.8}
        onClick={() => onSelect(active === 'adductor' ? null : 'adductor')}
        className="cursor-pointer"
        data-testid="skull-region-adductor"
        style={{ transition: 'fill-opacity 0.15s, stroke-opacity 0.15s' }}
      />
      {/* Pterygoid / Coronoid */}
      <ellipse
        cx={162} cy={108} rx={44} ry={13}
        fill="#60a5fa" fillOpacity={active === 'pterygoid' ? 0.32 : 0.12}
        stroke="#60a5fa" strokeOpacity={active === 'pterygoid' ? 0.65 : 0.25} strokeWidth={active === 'pterygoid' ? 1.5 : 0.8}
        onClick={() => onSelect(active === 'pterygoid' ? null : 'pterygoid')}
        className="cursor-pointer"
        data-testid="skull-region-pterygoid"
        style={{ transition: 'fill-opacity 0.15s, stroke-opacity 0.15s' }}
      />
      {/* Dental Battery */}
      <rect
        x={20} y={87} width={175} height={14} rx={3}
        fill="#34d399" fillOpacity={active === 'dental' ? 0.32 : 0.10}
        stroke="#34d399" strokeOpacity={active === 'dental' ? 0.65 : 0.25} strokeWidth={active === 'dental' ? 1.5 : 0.8}
        onClick={() => onSelect(active === 'dental' ? null : 'dental')}
        className="cursor-pointer"
        data-testid="skull-region-dental"
        style={{ transition: 'fill-opacity 0.15s, stroke-opacity 0.15s' }}
      />

      {/* ── Annotation labels ── */}
      <text x={208} y={43} textAnchor="middle" fill="#f59e0b" fillOpacity={0.5} fontSize={7} fontFamily="monospace">TEMPORAL</text>
      <text x={128} y={104} textAnchor="middle" fill="currentColor" fillOpacity={0.25} fontSize={7} fontFamily="monospace">ORBIT</text>
      <text x={80} y={56} textAnchor="middle" fill="currentColor" fillOpacity={0.22} fontSize={6} fontFamily="monospace">ANT-ORB.</text>

      {/* Force vector when region selected */}
      {active && (
        <>
          <defs>
            <marker id="arw" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
              <path d="M0,0 L0,5 L5,2.5 z" fill="rgba(255,255,255,0.25)" />
            </marker>
          </defs>
          <line x1={128} y1={72} x2={128} y2={106}
            stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="3,2" markerEnd="url(#arw)" />
        </>
      )}
      {!active && (
        <text x={150} y={142} textAnchor="middle" fill="currentColor" fillOpacity={0.18} fontSize={7} fontFamily="monospace">
          CLICK COLOURED REGIONS TO INSPECT
        </text>
      )}
    </svg>
  );
}

function BiteForceLab({ dino }: { dino: Dinosaur }) {
  const [active, setActive] = useState<string | null>(null);
  const isHerbivore = dino.diet === 'Herbivore';
  const bf = dino.combatStats.biteForce;

  const totalKN = clamp(bf * 2.2 + dino.combatStats.size * 0.38, 0.8, 92);
  const totalN  = Math.round(totalKN * 1000);
  const gauge   = clamp((totalKN / 92) * 100, 4, 100);

  const MODERN = [
    { name: 'Human', kn: 0.7 }, { name: 'Wolf', kn: 1.0 }, { name: 'Hyena', kn: 4.5 },
    { name: 'Nile Croc', kn: 22 }, { name: 'Saltwater Croc', kn: 35 },
  ];
  const closest = MODERN.reduce((b, m) => Math.abs(m.kn - totalKN) < Math.abs(b.kn - totalKN) ? m : b);
  const forceLabel = totalKN < 5 ? 'LOW' : totalKN < 15 ? 'MODERATE' : totalKN < 35 ? 'HIGH' : 'EXTREME';
  const forceColor = totalKN < 5 ? 'text-blue-400' : totalKN < 15 ? 'text-amber-300' : totalKN < 35 ? 'text-orange-400' : 'text-red-400';

  const activeStruct = active ? SKULL_STRUCTS.find(s => s.id === active) : null;

  return (
    <MuseumExhibitCard
      badge="Anatomy Laboratory"
      title="Bite Force Laboratory"
      subtitle="Cranial Mechanics Reconstruction — Jaw musculature analysis from temporal fenestra morphology"
      note="Force output scales with jaw adductor cross-section area, jaw-closing lever-arm ratio, and gape angle. Select the coloured anatomical regions on the skull schematic to inspect each structure's contribution."
    >
      <div className="space-y-5">
        {/* Skull diagram */}
        <div className="rounded-lg border border-border/30 bg-secondary/20 p-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/35 font-display mb-3 text-center">
            Lateral Skull Schematic — Select regions to inspect
          </p>
          <SkullSVG active={active} onSelect={setActive} isHerbivore={isHerbivore} />
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center">
            {SKULL_STRUCTS.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(active === s.id ? null : s.id)}
                data-testid={`legend-btn-${s.id}`}
                className={`flex items-center gap-1.5 text-[10px] font-display uppercase tracking-wider transition-opacity ${
                  active && active !== s.id ? 'opacity-35' : 'opacity-100'
                }`}
              >
                <span className="h-2 w-2 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color, opacity: 0.7 }} />
                <span style={{ color: s.color, opacity: 0.8 }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected structure info */}
        <AnimatePresence mode="wait">
          {activeStruct && (
            <motion.div
              key={activeStruct.id}
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="rounded-lg border p-4 space-y-3"
              style={{ borderColor: activeStruct.color + '35', backgroundColor: activeStruct.color + '07' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-display font-semibold" style={{ color: activeStruct.color }}>{activeStruct.label}</h4>
                  <p className="text-[10px] text-muted-foreground/55 font-body italic mt-0.5">{activeStruct.sublabel}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/40 font-display">Force Contribution</p>
                  <p className="text-2xl font-display font-bold tabular-nums" style={{ color: activeStruct.color }}>{activeStruct.contrib}%</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 font-display">What scientists know</p>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{activeStruct.what}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 font-display">Evidence used</p>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{activeStruct.evidence}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Force output */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4 space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-amber-400/70 font-display">Estimated Bite Force</p>
              <p className="text-3xl font-display font-bold text-foreground tabular-nums mt-1">
                {totalN.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-1.5">N</span>
              </p>
              <p className={`text-[10px] font-display uppercase tracking-[0.2em] mt-0.5 ${forceColor}`}>{forceLabel}</p>
            </div>
            <div className="text-right text-xs text-muted-foreground font-body">
              <p className="tabular-nums">≈ {totalKN.toFixed(1)} kN</p>
              <p className="text-[11px] mt-0.5 text-muted-foreground/55">Closest modern: {closest.name}</p>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
              animate={{ width: `${gauge}%` }} transition={{ duration: 0.5 }} />
          </div>
          {/* Contribution breakdown */}
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            {SKULL_STRUCTS.map(s => (
              <div key={s.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-[8px] font-mono truncate" style={{ color: s.color, opacity: 0.65 }}>
                    {s.label.split(' ')[0]}
                  </p>
                  <p className="text-[9px] font-mono tabular-nums" style={{ color: s.color, opacity: 0.65 }}>{s.contrib}%</p>
                </div>
                <div className="h-0.5 rounded-full" style={{ backgroundColor: s.color, opacity: 0.35, width: `${s.contrib}%`, minWidth: 6 }} />
              </div>
            ))}
          </div>
        </div>

        <EvidencePanel data={{
          what: isHerbivore
            ? `${dino.name} had a bite optimised for plant processing. Cropping or grinding forces are lower per unit than predators but are sustained for extended durations during feeding bouts.`
            : `${dino.name} exerted approximately ${totalN.toLocaleString()} N — sufficient to ${bf >= 8 ? 'fracture large prey bone and process carcasses entirely' : bf >= 5 ? 'penetrate hide and process medium prey items' : 'capture and process soft-bodied prey'}.`,
          why: 'Jaw adductor volume scales predictably with temporal fenestra area in living archosaurs. Skull length, temporal region width, and lever-arm geometry allow force estimates within ±30% of true values.',
          evidence: `CT scans of temporal fenestra dimensions; osteological attachment scarring; calibration against living Nile crocodile and alligator populations with directly measured bite forces (nearest analogue: ${closest.name}).`,
          confidence: bf >= 6 ? 'high' : bf >= 4 ? 'moderate' : 'speculative',
        }} />
      </div>
    </MuseumExhibitCard>
  );
}

// ── Sensory Reconstruction V2 ─────────────────────────────────────────────────

const SENSORY_STRUCTS = [
  {
    id: 'orbital',
    label: 'Orbital Position',
    sublabel: 'Eye socket placement & size',
    color: '#f59e0b',
    what: 'The placement of the orbit on the skull determines the degree of binocular overlap in the frontal field — critical for depth perception during prey capture.',
    why: 'Forward-facing orbits indicate predatory or arboreal lifestyles requiring depth perception. Lateral orbits indicate wide-field prey detection for herbivores.',
    evidence: 'Direct measurement of orbital angle relative to skull midline, comparison with living birds and reptiles of known visual ecology.',
  },
  {
    id: 'olfactory',
    label: 'Olfactory Bulb Region',
    sublabel: 'Anterior braincase endocast',
    color: '#34d399',
    what: 'The olfactory bulb impression in the braincase endocast indicates the relative investment in chemosensory processing — larger bulbs mean more powerful smell.',
    why: 'Olfactory bulb volume relative to total brain volume (the olfactory ratio) is strongly correlated with scent-tracking ability in living vertebrates.',
    evidence: 'CT-scanned braincase endocasts, olfactory bulb volume measurement, comparison with living birds (theropod descendants) and crocodilians.',
  },
  {
    id: 'inner_ear',
    label: 'Bony Labyrinth',
    sublabel: 'Semicircular canals & cochlea',
    color: '#a78bfa',
    what: 'The geometry of the bony semicircular canals reconstructs vestibular function — how fast the head could turn, and what frequencies the animal could detect.',
    why: 'Canal radius of curvature correlates with angular sensitivity; cochlear length correlates with low-frequency hearing range used for long-distance communication.',
    evidence: 'High-resolution CT scans of the petrosal and exoccipital bones, geometrical analysis of canal radii, comparison with extant archosaur audiograms.',
  },
];

function VisionSVG({ isCarnivore, active, onSelect }: {
  isCarnivore: boolean; active: string | null; onSelect: (id: string | null) => void;
}) {
  // Top-down skull: carnivores have forward eyes, herbivores have lateral eyes
  const eyeLx = isCarnivore ? 82 : 55;
  const eyeRx = isCarnivore ? 178 : 205;
  const eyeY  = isCarnivore ? 82 : 72;
  const coneAngle = isCarnivore ? 35 : 15; // binocular overlap degrees

  // Vision cone points (forward = top of SVG)
  const coneHalfRad = (coneAngle * Math.PI) / 180;
  const coneLen = 80;
  const cx = 130, cy = 90;
  const lx = cx - Math.sin(coneHalfRad) * coneLen;
  const rx = cx + Math.sin(coneHalfRad) * coneLen;
  const ty = cy - Math.cos(coneHalfRad) * coneLen;

  return (
    <svg viewBox="0 0 260 170" className="w-full" style={{ maxHeight: 170 }} aria-label="Top-down sensory diagram">
      {/* Vision cone */}
      <defs>
        <radialGradient id="vcone" cx="50%" cy="100%" r="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
        </radialGradient>
        <radialGradient id="pcone" cx="50%" cy="100%" r="100%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.01" />
        </radialGradient>
      </defs>
      {/* Peripheral vision arc */}
      <path d={`M ${cx},${cy} Q ${cx - 90},${cy - 50} ${cx - 85},${cy + 20} Q ${cx},${cy + 30} ${cx + 85},${cy + 20} Q ${cx + 90},${cy - 50} ${cx},${cy}`}
        fill="url(#pcone)" />
      {/* Binocular cone */}
      <path d={`M ${cx},${cy} L ${lx},${ty} Q ${cx},${cy - coneLen - 10} ${rx},${ty} Z`}
        fill="url(#vcone)" stroke="#f59e0b" strokeOpacity={0.2} strokeWidth={0.8} />

      {/* Skull top-down outline */}
      <ellipse cx={130} cy={95} rx={72} ry={60} fill="none" stroke="currentColor" strokeOpacity={0.16} strokeWidth={1.4} />
      {/* Snout */}
      <path d="M 100,38 Q 130,24 160,38" fill="none" stroke="currentColor" strokeOpacity={0.14} strokeWidth={1.2} />
      {/* Temporal region */}
      <ellipse cx={80} cy={105} rx={18} ry={12} fill="none" stroke="currentColor" strokeOpacity={0.13} strokeWidth={1} />
      <ellipse cx={180} cy={105} rx={18} ry={12} fill="none" stroke="currentColor" strokeOpacity={0.13} strokeWidth={1} />

      {/* ── Clickable sense regions ── */}
      {/* Eyes / Orbital */}
      <circle cx={eyeLx} cy={eyeY} r={12}
        fill="#f59e0b" fillOpacity={active === 'orbital' ? 0.38 : 0.12}
        stroke="#f59e0b" strokeOpacity={active === 'orbital' ? 0.7 : 0.3} strokeWidth={active === 'orbital' ? 1.5 : 0.8}
        onClick={() => onSelect(active === 'orbital' ? null : 'orbital')}
        className="cursor-pointer" data-testid="sense-region-orbital"
        style={{ transition: 'fill-opacity 0.15s' }} />
      <circle cx={eyeRx} cy={eyeY} r={12}
        fill="#f59e0b" fillOpacity={active === 'orbital' ? 0.38 : 0.12}
        stroke="#f59e0b" strokeOpacity={active === 'orbital' ? 0.7 : 0.3} strokeWidth={active === 'orbital' ? 1.5 : 0.8}
        onClick={() => onSelect(active === 'orbital' ? null : 'orbital')}
        className="cursor-pointer"
        style={{ transition: 'fill-opacity 0.15s' }} />
      {/* Olfactory region (front of skull) */}
      <ellipse cx={130} cy={44} rx={22} ry={12}
        fill="#34d399" fillOpacity={active === 'olfactory' ? 0.38 : 0.12}
        stroke="#34d399" strokeOpacity={active === 'olfactory' ? 0.7 : 0.3} strokeWidth={active === 'olfactory' ? 1.5 : 0.8}
        onClick={() => onSelect(active === 'olfactory' ? null : 'olfactory')}
        className="cursor-pointer" data-testid="sense-region-olfactory"
        style={{ transition: 'fill-opacity 0.15s' }} />
      {/* Inner ear / braincase */}
      <ellipse cx={130} cy={128} rx={26} ry={14}
        fill="#a78bfa" fillOpacity={active === 'inner_ear' ? 0.38 : 0.12}
        stroke="#a78bfa" strokeOpacity={active === 'inner_ear' ? 0.7 : 0.3} strokeWidth={active === 'inner_ear' ? 1.5 : 0.8}
        onClick={() => onSelect(active === 'inner_ear' ? null : 'inner_ear')}
        className="cursor-pointer" data-testid="sense-region-inner-ear"
        style={{ transition: 'fill-opacity 0.15s' }} />

      {/* Labels */}
      <text x={130} y={33} textAnchor="middle" fill="#34d399" fillOpacity={0.5} fontSize={7} fontFamily="monospace">OLFACTORY</text>
      <text x={eyeLx - 18} y={eyeY + 3} textAnchor="end" fill="#f59e0b" fillOpacity={0.45} fontSize={7} fontFamily="monospace">EYE</text>
      <text x={eyeRx + 18} y={eyeY + 3} textAnchor="start" fill="#f59e0b" fillOpacity={0.45} fontSize={7} fontFamily="monospace">EYE</text>
      <text x={130} y={148} textAnchor="middle" fill="#a78bfa" fillOpacity={0.45} fontSize={7} fontFamily="monospace">INNER EAR</text>
      {/* Binocular label */}
      <text x={cx} y={ty - 5} textAnchor="middle" fill="#f59e0b" fillOpacity={0.35} fontSize={6.5} fontFamily="monospace">
        {coneAngle * 2}° BINOCULAR
      </text>
      {!active && (
        <text x={130} y={163} textAnchor="middle" fill="currentColor" fillOpacity={0.16} fontSize={7} fontFamily="monospace">
          CLICK REGIONS TO INSPECT
        </text>
      )}
    </svg>
  );
}

function SensoryReconstructionV2({ dino }: { dino: Dinosaur }) {
  const [active, setActive] = useState<string | null>(null);
  const iq = dino.combatStats.intelligence;
  const isCarnivore = dino.diet === 'Carnivore' || dino.diet === 'Piscivore';
  const isMarine = getTaxonomyType(dino) === 'marine_reptile';

  const vision    = clamp(isCarnivore ? iq * 7 + 18 : iq * 5 + 30, 20, 96);
  const binoc     = clamp(isCarnivore ? iq * 3 + 20 : iq * 1.5 + 6, 8, 58);
  const monocular = clamp(isCarnivore ? 220 - binoc * 1.4 : 300 - binoc, 130, 340);
  const smell     = clamp(!isMarine ? iq * 6 + 25 : iq * 3 + 14, 20, 96);
  const hearing   = clamp(iq * 8 + 10, 20, 92);
  const balance   = clamp(isMarine ? iq * 9 + 10 : iq * 7 + 20, 35, 96);

  const activeStruct = active ? SENSORY_STRUCTS.find(s => s.id === active) : null;

  const senseBars = [
    { label: 'Visual Acuity',        value: vision,  color: 'amber',  note: `${binoc}° binocular / ${monocular}° total field` },
    { label: 'Olfactory Sensitivity',value: smell,   color: 'green',  note: isMarine ? 'Reduced olfaction in aquatic medium' : iq >= 7 ? 'Highly developed olfactory bulbs' : 'Moderate olfactory capacity' },
    { label: 'Hearing Range',        value: hearing, color: 'violet', note: `Est. ${Math.round(hearing * 0.35 + 55)} – ${Math.round(hearing * 220 + 1800)} Hz` },
    { label: 'Vestibular Function',  value: balance, color: 'blue',   note: 'From bony semicircular canal geometry' },
  ];

  return (
    <MuseumExhibitCard
      badge="Anatomy Laboratory"
      title="Sensory Reconstruction"
      subtitle="Cranial Nerve & Inner Ear Analysis — Derived from endocast morphology and bony labyrinth"
      note="All sensory values are proportional estimates, not absolute measurements. They reflect the relative size of cranial nerve openings, olfactory bulb impressions, and semicircular canal dimensions in comparison with living archosaurs."
    >
      <div className="space-y-5">
        {/* Vision & brain diagram */}
        <div className="rounded-lg border border-border/30 bg-secondary/20 p-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/35 font-display mb-3 text-center">
            Dorsal Skull Schematic — Sensory Region Analysis
          </p>
          <VisionSVG isCarnivore={isCarnivore} active={active} onSelect={setActive} />
          {/* Sense legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center">
            {SENSORY_STRUCTS.map(s => (
              <button key={s.id}
                onClick={() => setActive(active === s.id ? null : s.id)}
                data-testid={`sense-legend-${s.id}`}
                className={`flex items-center gap-1.5 text-[10px] font-display uppercase tracking-wider transition-opacity ${
                  active && active !== s.id ? 'opacity-35' : 'opacity-100'
                }`}
              >
                <span className="h-2 w-2 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color, opacity: 0.7 }} />
                <span style={{ color: s.color, opacity: 0.8 }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected structure detail */}
        <AnimatePresence mode="wait">
          {activeStruct && (
            <motion.div
              key={activeStruct.id}
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="rounded-lg border p-4 space-y-2"
              style={{ borderColor: activeStruct.color + '35', backgroundColor: activeStruct.color + '07' }}
            >
              <div>
                <h4 className="text-sm font-display font-semibold" style={{ color: activeStruct.color }}>{activeStruct.label}</h4>
                <p className="text-[10px] text-muted-foreground/55 font-body italic mt-0.5">{activeStruct.sublabel}</p>
              </div>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">{activeStruct.what}</p>
              <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/40 font-display pt-1">Evidence</p>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">{activeStruct.evidence}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sensory bars */}
        <div className="space-y-3">
          {senseBars.map(b => (
            <div key={b.label} className="space-y-1">
              <StatBar label={b.label} value={b.value} max={100} color={b.color} />
              <p className="text-[10px] text-muted-foreground/45 font-body italic">{b.note}</p>
            </div>
          ))}
        </div>

        <EvidencePanel data={{
          what: `${dino.name} had ${isCarnivore ? 'forward-biased vision with strong depth perception, large olfactory bulbs for tracking prey, and sensitive balance organs for rapid head movements' : 'wide-field lateral vision for predator detection, moderate olfactory processing, and a stable vestibular system for constant vigilance'}.`,
          why: `Endocast morphology reveals the relative size of each brain region. In archosaurs, olfactory bulb investment strongly predicts olfactory ability, while orbital position and size predict visual ecology.`,
          evidence: `CT-scanned braincase endocasts, cranial nerve foramen dimensions, petrosal bone semicircular canal geometry, comparison with extant birds (theropod descendants) and crocodilians.`,
          confidence: iq >= 6 ? 'high' : iq >= 4 ? 'moderate' : 'speculative',
        }} />
      </div>
    </MuseumExhibitCard>
  );
}

// ── Skeletal Mechanics Lab ────────────────────────────────────────────────────

const BONE_GROUPS = [
  {
    id: 'hindlimb',
    label: 'Hindlimb Ratio',
    sublabel: 'Femur–Tibia–Metatarsal',
    color: '#60a5fa',
    note: 'A tibia longer than the femur indicates a cursorial (fast-running) build; shorter tibia indicates graviportal (weight-bearing) build.',
  },
  {
    id: 'hip',
    label: 'Hip & Ilium',
    sublabel: 'Pelvic architecture & muscle origin',
    color: '#f59e0b',
    note: 'Broad iliac blades anchor the caudofemoralis and iliotibialis muscles — the primary forward-thrust generators. Width indicates total muscular power output.',
  },
  {
    id: 'vertebrae',
    label: 'Vertebral Column',
    sublabel: 'Neural spine height & ligament scars',
    color: '#34d399',
    note: 'Tall neural spines anchor dorsal ligaments that passively transfer ground reaction force toward the head, reducing muscular effort during locomotion.',
  },
  {
    id: 'tail',
    label: 'Tail as Counterweight',
    sublabel: 'Caudal musculature & mass distribution',
    color: '#f472b6',
    note: 'The caudofemoralis muscle (running from tail to femur) is the primary hip extensor in dinosaurs — a longer, deeper tail directly increases running power.',
  },
];

function SkeletonSVG({ activeBone }: { activeBone: string | null }) {
  const highlightColor = (id: string) => {
    const s = BONE_GROUPS.find(b => b.id === id);
    return s ? s.color : '#ffffff';
  };
  const op = (id: string) => activeBone === null ? 0.16 : activeBone === id ? 0.55 : 0.07;
  const strokeOp = (id: string) => activeBone === null ? 0.22 : activeBone === id ? 0.8 : 0.1;

  return (
    <svg viewBox="0 0 320 140" className="w-full" style={{ maxHeight: 170 }} aria-label="Skeletal mechanics diagram">
      {/* Body silhouette */}
      <path d="M 30,68 Q 50,40 90,35 Q 130,30 170,36 Q 200,42 210,55 Q 218,65 210,78 Q 200,90 170,94 Q 130,98 90,92 Q 50,86 30,72 Z"
        fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={1.2} />
      {/* Head */}
      <ellipse cx={44} cy={62} rx={28} ry={22}
        fill="none" stroke="currentColor" strokeOpacity={0.14} strokeWidth={1} />
      {/* Tail */}
      <path d="M 210,65 Q 240,62 275,70 Q 295,75 305,82"
        fill="none" stroke={highlightColor('tail')} strokeOpacity={op('tail')} strokeWidth={3}
        style={{ transition: 'stroke-opacity 0.15s' }} />

      {/* ── Bone groups ── */}
      {/* Vertebral column */}
      {Array.from({ length: 10 }).map((_, i) => (
        <ellipse key={i} cx={90 + i * 13} cy={60} rx={5} ry={3.5}
          fill={highlightColor('vertebrae')} fillOpacity={op('vertebrae')}
          stroke={highlightColor('vertebrae')} strokeOpacity={strokeOp('vertebrae')} strokeWidth={0.8}
          style={{ transition: 'fill-opacity 0.15s' }} />
      ))}
      {/* Hip / Ilium */}
      <ellipse cx={185} cy={58} rx={22} ry={18}
        fill={highlightColor('hip')} fillOpacity={op('hip')}
        stroke={highlightColor('hip')} strokeOpacity={strokeOp('hip')} strokeWidth={1}
        style={{ transition: 'fill-opacity 0.15s' }} />
      {/* Femur */}
      <rect x={190} y={78} width={10} height={32} rx={4}
        fill={highlightColor('hindlimb')} fillOpacity={op('hindlimb')}
        stroke={highlightColor('hindlimb')} strokeOpacity={strokeOp('hindlimb')} strokeWidth={0.8}
        style={{ transition: 'fill-opacity 0.15s' }} />
      {/* Tibia */}
      <rect x={193} y={112} width={8} height={22} rx={3}
        fill={highlightColor('hindlimb')} fillOpacity={op('hindlimb') * 0.85}
        stroke={highlightColor('hindlimb')} strokeOpacity={strokeOp('hindlimb')} strokeWidth={0.8}
        style={{ transition: 'fill-opacity 0.15s' }} />

      {/* Center of mass indicator */}
      <circle cx={172} cy={64} r={6}
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="3,2" />
      <circle cx={172} cy={64} r={2} fill="rgba(255,255,255,0.5)" />
      <text x={172} y={54} textAnchor="middle" fill="currentColor" fillOpacity={0.25} fontSize={6.5} fontFamily="monospace">C.O.M.</text>

      {/* Ground line */}
      <line x1={170} y1={134} x2={220} y2={134} stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} />
      {/* Ground reaction force arrow */}
      <line x1={197} y1={134} x2={197} y2={110}
        stroke="rgba(96,165,250,0.35)" strokeWidth={1.5} strokeDasharray="2,2" />
      <polygon points="192,112 202,112 197,104" fill="rgba(96,165,250,0.3)" />
      <text x={220} y={130} fill="currentColor" fillOpacity={0.2} fontSize={6} fontFamily="monospace">GRF</text>

      {/* Labels */}
      <text x={185} y={52} textAnchor="middle" fill={highlightColor('hip')} fillOpacity={0.45} fontSize={6.5} fontFamily="monospace">HIP</text>
      <text x={130} y={50} textAnchor="middle" fill={highlightColor('vertebrae')} fillOpacity={0.4} fontSize={6.5} fontFamily="monospace">VERTEBRAE</text>
      <text x={197} y={96} textAnchor="middle" fill={highlightColor('hindlimb')} fillOpacity={0.45} fontSize={6.5} fontFamily="monospace">FEMUR</text>
    </svg>
  );
}

function SkeletalMechanicsLab({ dino }: { dino: Dinosaur }) {
  const [activeBone, setActiveBone] = useState<string | null>(null);
  const sp = dino.combatStats.speed;
  const sz = dino.combatStats.size;
  const taxon = getTaxonomyType(dino);

  const speedKmh = clamp(sp * (taxon === 'pterosaur' ? 12 : taxon === 'marine_reptile' ? 6.5 : 5.2), 2, 80);
  const tibiaRatio = clamp(0.75 + (sp / 10) * 0.6, 0.6, 1.5); // tibia:femur ratio
  const isCursorial = sp >= 6;
  const activeGroup = activeBone ? BONE_GROUPS.find(b => b.id === activeBone) : null;

  return (
    <MuseumExhibitCard
      badge="Anatomy Laboratory"
      title="Skeletal Mechanics Lab"
      subtitle="Locomotor Biomechanics — Speed reconstruction from limb proportions and bone stress analysis"
      note="Select skeletal regions above to understand how each element contributes to locomotor speed. Centre of mass position (C.O.M.) and ground reaction force (GRF) direction are central to all speed estimates."
    >
      <div className="space-y-5">
        {/* Skeleton diagram */}
        <div className="rounded-lg border border-border/30 bg-secondary/20 p-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/35 font-display mb-3 text-center">
            Lateral Skeletal Schematic — Select bone groups to inspect
          </p>
          <SkeletonSVG activeBone={activeBone} />
          {/* Bone group legend / buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {BONE_GROUPS.map(b => (
              <button
                key={b.id}
                onClick={() => setActiveBone(activeBone === b.id ? null : b.id)}
                data-testid={`bone-btn-${b.id}`}
                className={`flex items-start gap-2 text-left p-2 rounded-lg border transition-all ${
                  activeBone === b.id
                    ? 'border-current bg-secondary/50'
                    : activeBone ? 'border-border/20 opacity-40 hover:opacity-60' : 'border-border/30 hover:border-border/50'
                }`}
                style={activeBone === b.id ? { borderColor: b.color + '50', backgroundColor: b.color + '08' } : {}}
              >
                <span className="h-2 w-2 rounded-sm mt-0.5 flex-shrink-0" style={{ backgroundColor: b.color, opacity: 0.7 }} />
                <div>
                  <p className="text-[10px] font-display uppercase tracking-wider leading-none" style={{ color: b.color, opacity: 0.85 }}>{b.label}</p>
                  <p className="text-[9px] text-muted-foreground/45 font-body mt-0.5">{b.sublabel}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active bone detail */}
        <AnimatePresence mode="wait">
          {activeGroup && (
            <motion.div
              key={activeGroup.id}
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="rounded-lg border p-3.5"
              style={{ borderColor: activeGroup.color + '35', backgroundColor: activeGroup.color + '07' }}
            >
              <h4 className="text-sm font-display font-semibold mb-1" style={{ color: activeGroup.color }}>{activeGroup.label}</h4>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">{activeGroup.note}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border/30 bg-secondary/20 p-3.5 space-y-1">
            <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/45 font-display">Max Speed Estimate</p>
            <p className="text-2xl font-display font-bold tabular-nums text-foreground">
              {speedKmh.toFixed(1)}<span className="text-xs font-normal text-muted-foreground ml-1">km/h</span>
            </p>
            <p className="text-[10px] text-muted-foreground/55 font-body">
              {isCursorial ? 'Cursorial build — elongated distal limbs' : 'Graviportal build — shortened distal limbs'}
            </p>
          </div>
          <div className="rounded-lg border border-border/30 bg-secondary/20 p-3.5 space-y-1">
            <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/45 font-display">Tibia : Femur Ratio</p>
            <p className="text-2xl font-display font-bold tabular-nums text-foreground">
              {tibiaRatio.toFixed(2)}<span className="text-xs font-normal text-muted-foreground ml-1">:</span><span className="text-2xl font-display font-bold text-muted-foreground">1</span>
            </p>
            <p className="text-[10px] text-muted-foreground/55 font-body">
              {tibiaRatio >= 1.1 ? 'Strongly cursorial' : tibiaRatio >= 0.9 ? 'Moderately cursorial' : 'Graviportal'}
            </p>
          </div>
        </div>

        {/* Bone stress bars */}
        <div className="space-y-3">
          <StatBar label="Limb Bone Robustness" value={clamp(sz * 9 + 5, 10, 95)} max={100} color="blue" />
          <StatBar label="Stride Frequency Capacity" value={clamp(sp * 9 + 5, 10, 95)} max={100} color="amber" />
          <StatBar label="Ground Reaction Force Tolerance" value={clamp((sz + sp) * 4.5, 10, 95)} max={100} color="green" />
        </div>

        <EvidencePanel data={{
          what: `${dino.name} is reconstructed as a ${isCursorial ? 'relatively fast, cursorial animal' : 'slower, more heavily built animal'} with estimated peak speeds of ${speedKmh.toFixed(1)} km/h based on hindlimb proportions.`,
          why: `Tibia:femur ratios in living vertebrates reliably predict locomotor speed class. The ratio of ${tibiaRatio.toFixed(2)} places this species in the ${isCursorial ? 'cursorial' : 'graviportal'} category. Centre of mass position above the hindlimbs confirms a bipedal locomotor style.`,
          evidence: `Articulated hindlimb specimens with preserved femur, tibia, and metatarsal lengths; comparison with ${sz >= 7 ? 'elephants and hippos for graviportal analogy' : 'ostriches and emus for cursorial analogy'}; trackway stride-to-hip-height ratios where footprints are preserved.`,
          confidence: dino.skeletonData.completeness >= 60 ? 'high' : dino.skeletonData.completeness >= 35 ? 'moderate' : 'speculative',
        }} />
      </div>
    </MuseumExhibitCard>
  );
}

// ── Muscle Reconstruction Lab ─────────────────────────────────────────────────

const MUSCLE_LAYERS = [
  { id: 0, label: 'Skeleton',         color: 'text-slate-400',  badge: 'Layer 1' },
  { id: 1, label: 'Muscles',          color: 'text-red-400',    badge: 'Layer 2' },
  { id: 2, label: 'Life Silhouette',  color: 'text-amber-300',  badge: 'Layer 3' },
];

const MUSCLE_GROUPS = [
  { id: 'caudofemoralis', label: 'Caudofemoralis',        contrib: 42, color: '#ef4444', desc: 'Primary hip-extensor running from tail base to femur — the main thrust generator in theropods.' },
  { id: 'iliotibialis',   label: 'Iliotibialis',          contrib: 28, color: '#f97316', desc: 'Knee-extending muscle from ilium to tibia, critical for stride extension and weight transfer.' },
  { id: 'gastrocnemius',  label: 'Gastrocnemius',         contrib: 18, color: '#eab308', desc: 'Calf muscle group providing ankle push-off, contributing burst speed and stride efficiency.' },
  { id: 'femorotibialis', label: 'Femorotibialis',        contrib: 12, color: '#84cc16', desc: 'Secondary knee extensors; smaller role in forward propulsion but important for joint stability.' },
];

function BodySVG({ layer }: { layer: number }) {
  // Layer 0: skeleton outlines only
  // Layer 1: muscle mass overlays
  // Layer 2: full body silhouette
  const skelOp    = 1;
  const muscleOp  = layer >= 1 ? 1 : 0;
  const skinOp    = layer >= 2 ? 1 : 0;

  return (
    <svg viewBox="0 0 280 140" className="w-full transition-all duration-500" style={{ maxHeight: 160 }} aria-label="Muscle reconstruction layers">
      {/* ── Layer 2: Life silhouette ── */}
      <motion.g animate={{ opacity: skinOp }} transition={{ duration: 0.4 }}>
        <path d="M 30,72 Q 40,46 70,36 Q 100,26 140,28 Q 175,30 200,46 Q 218,58 215,72 Q 210,86 190,94 Q 160,104 120,102 Q 80,100 50,88 Q 32,82 30,72 Z"
          fill="rgba(120,80,40,0.25)" stroke="rgba(140,90,50,0.3)" strokeWidth={1} />
        <ellipse cx={42} cy={64} rx={24} ry={18} fill="rgba(120,80,40,0.25)" stroke="rgba(140,90,50,0.3)" strokeWidth={1} />
        <path d="M 215,68 Q 250,64 278,74" fill="none" stroke="rgba(140,90,50,0.3)" strokeWidth={6} strokeLinecap="round" />
      </motion.g>

      {/* ── Layer 1: Muscle overlays ── */}
      <motion.g animate={{ opacity: muscleOp }} transition={{ duration: 0.4 }}>
        {/* Caudofemoralis (tail) */}
        <path d="M 200,76 Q 230,70 268,78 Q 250,88 215,84 Z"
          fill="#ef444440" stroke="#ef4444" strokeOpacity={0.4} strokeWidth={0.8} />
        {/* Iliotibialis (hip-thigh) */}
        <ellipse cx={192} cy={70} rx={28} ry={22}
          fill="#f9731630" stroke="#f97316" strokeOpacity={0.4} strokeWidth={0.8} />
        {/* Gastrocnemius (lower leg) */}
        <ellipse cx={196} cy={104} rx={12} ry={18}
          fill="#eab30830" stroke="#eab308" strokeOpacity={0.4} strokeWidth={0.8} />
        {/* Neck/back musculature */}
        <path d="M 80,36 Q 120,32 155,38 Q 145,52 115,54 Q 90,52 80,42 Z"
          fill="#84cc1625" stroke="#84cc16" strokeOpacity={0.3} strokeWidth={0.8} />
      </motion.g>

      {/* ── Layer 0: Skeleton (always visible) ── */}
      <motion.g animate={{ opacity: skelOp }} transition={{ duration: 0.4 }}>
        {/* Vertebral column */}
        {Array.from({ length: 11 }).map((_, i) => (
          <ellipse key={i} cx={75 + i * 12} cy={61} rx={4.5} ry={3}
            fill="none" stroke="currentColor" strokeOpacity={0.22} strokeWidth={0.8} />
        ))}
        {/* Ribs */}
        {Array.from({ length: 6 }).map((_, i) => (
          <path key={i}
            d={`M ${90 + i * 14},61 Q ${88 + i * 14},75 ${84 + i * 14},82`}
            fill="none" stroke="currentColor" strokeOpacity={0.14} strokeWidth={0.7} />
        ))}
        {/* Hip bones */}
        <ellipse cx={188} cy={66} rx={20} ry={16} fill="none" stroke="currentColor" strokeOpacity={0.22} strokeWidth={1} />
        {/* Femur */}
        <rect x={188} y={82} width={8} height={28} rx={3} fill="none" stroke="currentColor" strokeOpacity={0.22} strokeWidth={0.8} />
        {/* Tibia */}
        <rect x={191} y={112} width={6} height={20} rx={2} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={0.7} />
        {/* Skull outline */}
        <ellipse cx={42} cy={62} rx={22} ry={17} fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={1} />
        {/* Neck vertebrae */}
        {Array.from({ length: 4 }).map((_, i) => (
          <ellipse key={i} cx={55 + i * 8} cy={60} rx={3.5} ry={2.5}
            fill="none" stroke="currentColor" strokeOpacity={0.16} strokeWidth={0.7} />
        ))}
        {/* Tail */}
        <path d="M 212,68 Q 245,65 272,73" fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={1.5} strokeLinecap="round" />
      </motion.g>

      {/* Layer label */}
      <text x={10} y={136} fill="currentColor" fillOpacity={0.2} fontSize={7} fontFamily="monospace">
        LAYER {layer + 1}: {MUSCLE_LAYERS[layer].label.toUpperCase()}
      </text>
    </svg>
  );
}

function MuscleReconstructionLab({ dino }: { dino: Dinosaur }) {
  const [layer, setLayer] = useState(0);
  const sp = dino.combatStats.speed;
  const sz = dino.combatStats.size;

  return (
    <MuseumExhibitCard
      badge="Anatomy Laboratory"
      title="Muscle Reconstruction Lab"
      subtitle="Osteological Correlate Analysis — Muscle mass reconstructed from bone attachment scars"
      note="Muscle reconstructions are constrained by osteological correlates — scars, ridges and fossae on bones where muscles attached. Step through the layers from skeleton to full life reconstruction to see how scientists build from bone to body."
    >
      <div className="space-y-5">
        {/* Layer toggle */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/50 font-display">Reconstruction Layer</span>
          <div className="grid grid-cols-3 gap-2">
            {MUSCLE_LAYERS.map(l => (
              <button
                key={l.id}
                onClick={() => setLayer(l.id)}
                data-testid={`layer-btn-${l.id}`}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  layer === l.id
                    ? 'border-amber-400/40 bg-amber-500/10'
                    : 'border-border/30 hover:border-border/50'
                }`}
              >
                <p className={`text-[8px] uppercase tracking-[0.14em] font-display ${l.color}`}>{l.badge}</p>
                <p className="text-[11px] font-display font-medium text-foreground mt-0.5">{l.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Body layers SVG */}
        <div className="rounded-lg border border-border/30 bg-secondary/20 p-4">
          <BodySVG layer={layer} />
        </div>

        {/* Muscle group bars (visible in muscle/life layers) */}
        <AnimatePresence>
          {layer >= 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
              className="space-y-3 overflow-hidden"
            >
              {MUSCLE_GROUPS.map(mg => (
                <div key={mg.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-sm flex-shrink-0" style={{ backgroundColor: mg.color, opacity: 0.65 }} />
                      <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-display">{mg.label}</span>
                    </div>
                    <span className="text-xs font-mono text-foreground/60 tabular-nums">{mg.contrib}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ backgroundColor: mg.color }}
                      initial={{ width: 0 }} animate={{ width: `${mg.contrib}%` }}
                      transition={{ duration: 0.8 }} />
                  </div>
                  {layer >= 2 && (
                    <p className="text-[10px] text-muted-foreground/45 font-body italic leading-relaxed">{mg.desc}</p>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speed/strength summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/30 bg-secondary/20 p-3 space-y-0.5">
            <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/40 font-display">Estimated Muscle Mass</p>
            <p className="text-xl font-display font-bold text-foreground tabular-nums">
              {Math.round(dino.weight * 0.38 / 1000 * 10) / 10}
              <span className="text-xs font-normal text-muted-foreground ml-1">tonnes</span>
            </p>
          </div>
          <div className="rounded-lg border border-border/30 bg-secondary/20 p-3 space-y-0.5">
            <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/40 font-display">Power-to-Mass Ratio</p>
            <p className="text-xl font-display font-bold text-foreground tabular-nums">
              {clamp((sp * 12 + sz * 3) / 10, 1.0, 9.9).toFixed(1)}
              <span className="text-xs font-normal text-muted-foreground ml-1">W/kg</span>
            </p>
          </div>
        </div>

        <EvidencePanel data={{
          what: `Muscle reconstruction places the primary locomotor mass in the hindquarters — the caudofemoralis complex accounts for roughly 42% of total propulsive force in this body plan.`,
          why: `Osteological correlates (attachment scars, rugosities, and fossae on the femur, ilium, and caudal vertebrae) constrain which muscles were present and their approximate cross-sectional area.`,
          evidence: `Comparisons with fully-fledged crocodilians and birds (living archosaurs); occasionally preserved tendocalcaneum impressions; bone surface texture analysis at predicted attachment sites.`,
          confidence: dino.skeletonData.completeness >= 50 ? 'moderate' : 'speculative',
        }} />
      </div>
    </MuseumExhibitCard>
  );
}

// ── Paleopathology Exhibit ────────────────────────────────────────────────────

function PaleopathologyExhibit({ dino }: { dino: Dinosaur }) {
  const def = dino.combatStats.defense;
  const sz  = dino.combatStats.size;

  // Infer likely injury types from data
  const injuries: Array<{ type: string; confidence: Confidence; desc: string; evidence: string }> = [];

  if (dino.diet === 'Carnivore' || dino.diet === 'Piscivore') {
    injuries.push({
      type: 'Healed Bite Marks',
      confidence: 'high',
      desc: 'Pit-and-groove feeding traces on bone, many showing periosteal remodelling indicating the animal survived the attack.',
      evidence: 'Identified via stereoscopic microscopy and 3D surface scanning of bone surfaces; cross-matched with known tooth morphology of contemporary predators.',
    });
  }
  if (sz >= 6) {
    injuries.push({
      type: 'Stress Fractures',
      confidence: 'moderate',
      desc: 'Repetitive loading fractures in weight-bearing bones, similar to those documented in modern large mammals and crocodilians.',
      evidence: 'Bone microstructure histology revealing subperiosteal callus formation; longitudinal sections showing interrupted growth ring sequences near fracture sites.',
    });
  }
  if (def >= 6) {
    injuries.push({
      type: 'Healed Combat Injuries',
      confidence: 'moderate',
      desc: 'Impact injuries and crushing damage with evidence of periosteal regrowth, indicating survival and recovery from intraspecific or interspecific combat.',
      evidence: 'Callus formation around fracture sites in rib and vertebral elements; asymmetric bone remodelling around impact zones documented via CT.',
    });
  }
  injuries.push({
    type: 'Infectious Periostitis',
    confidence: 'speculative',
    desc: 'Diffuse periosteal reactive bone consistent with chronic bacterial infection, diagnosed in many large theropods and sauropods.',
    evidence: 'Porous, layered bone texture on limb elements distinct from normal growth; comparison with osteomyelitis signatures in living reptiles.',
  });
  if (dino.combatStats.intelligence >= 5) {
    injuries.push({
      type: 'Degenerative Joint Disease',
      confidence: 'moderate',
      desc: 'Eburnation (bone-on-bone polishing) and osteophyte formation in joint surfaces, indicating age-related or activity-related arthritis.',
      evidence: 'Polished joint surfaces and marginal osteophytes identified in articulated specimens; more common in larger, longer-lived individuals.',
    });
  }

  const [selected, setSelected] = useState<number | null>(null);

  return (
    <MuseumExhibitCard
      badge="Anatomy Laboratory"
      title="Paleopathology Exhibit"
      subtitle="Disease & Injury Analysis — Reconstructed from pathological specimens and comparative anatomy"
      note="Paleopathology is the study of disease and injury in fossil organisms. Every pathology documented provides direct evidence of how the animal lived — what stresses its body endured, what injuries it survived, and what ultimately may have contributed to its death."
    >
      <div className="space-y-4">
        {/* Body diagram with injury points */}
        <div className="rounded-lg border border-border/30 bg-secondary/20 p-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/35 font-display mb-3 text-center">
            Documented Pathology Types — Select to inspect evidence
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {injuries.map((inj, i) => (
              <button
                key={i}
                onClick={() => setSelected(selected === i ? null : i)}
                data-testid={`injury-btn-${i}`}
                className={`text-left p-3 rounded-lg border transition-all ${
                  selected === i
                    ? 'border-amber-400/35 bg-amber-500/08'
                    : 'border-border/30 hover:border-border/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-display font-semibold text-foreground/80">{inj.type}</p>
                  <ConfidenceBadge level={inj.confidence} />
                </div>
                <p className="text-[10px] text-muted-foreground/55 font-body leading-relaxed line-clamp-2">{inj.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected injury detail */}
        <AnimatePresence mode="wait">
          {selected !== null && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="rounded-lg border border-amber-500/25 bg-amber-500/05 p-4 space-y-2.5"
            >
              <h4 className="text-sm font-display font-semibold text-amber-300">{injuries[selected].type}</h4>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">{injuries[selected].desc}</p>
              <div>
                <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 font-display mb-1">Evidence method</p>
                <p className="text-xs text-muted-foreground/80 font-body leading-relaxed">{injuries[selected].evidence}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border/30 bg-secondary/20 p-3 text-center">
            <p className="text-xl font-display font-bold text-foreground">{injuries.length}</p>
            <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/50 font-display mt-0.5">Known Pathology Types</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-secondary/20 p-3 text-center">
            <p className="text-xl font-display font-bold text-emerald-400">
              {injuries.filter(i => i.confidence === 'high').length}
            </p>
            <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/50 font-display mt-0.5">High Confidence</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-secondary/20 p-3 text-center">
            <p className="text-xl font-display font-bold text-amber-400">
              {injuries.filter(i => i.confidence === 'moderate').length}
            </p>
            <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/50 font-display mt-0.5">Moderate Confidence</p>
          </div>
        </div>

        <EvidencePanel data={{
          what: `Specimens of ${dino.name} show evidence of multiple pathological conditions, including healed injuries that confirm the animal survived significant physical trauma during its lifetime.`,
          why: `Healed bone injuries require periosteal remodelling — a process that takes months in living reptiles. Healed pathologies therefore prove the animal was alive long after the injury event, providing insights into lifespan and resilience.`,
          evidence: `CT scanning, histological thin-sections, 3D surface models, and comparison with documented pathologies in living crocodilians and birds. Key reference specimens held at major natural history collections.`,
          confidence: def >= 5 ? 'moderate' : 'speculative',
        }} />
      </div>
    </MuseumExhibitCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIFE MODE EXHIBITS
// ─────────────────────────────────────────────────────────────────────────────

// ── Advanced Locomotion Lab (Life Mode) ───────────────────────────────────────

type EnvEntry = { id: string; label: string; speed: (s: number) => number; confidence: Confidence; evidenceNote: string; };
type EnvGroup = { category: string; icon: string; envs: EnvEntry[] };

const DINO_ENVS: EnvGroup[] = [
  {
    category: 'LAND',
    icon: '⬜',
    envs: [
      { id: 'flat',   label: 'Flat Terrain',       speed: s => s * 5.2,        confidence: 'high',        evidenceNote: 'Direct trackway stride-to-hip-height measurements; most reliable locomotor evidence.' },
      { id: 'slope',  label: 'Incline',             speed: s => s * 5.2 * 0.66, confidence: 'moderate',    evidenceNote: 'Bone stress modelling of femoral neck loading; no direct incline trackways known.' },
      { id: 'rough',  label: 'Rough Ground',        speed: s => s * 5.2 * 0.78, confidence: 'moderate',    evidenceNote: 'Joint morphology and limb bone robustness analysis; extrapolated from flat-terrain speed.' },
    ],
  },
  {
    category: 'WATER',
    icon: '🌊',
    envs: [
      { id: 'wade',   label: 'Shallow Wading',     speed: s => s * 5.2 * 0.32, confidence: 'moderate',    evidenceNote: 'Limb proportions and body mass buoyancy calculations; sauropod wading trackways exist.' },
      { id: 'river',  label: 'River Crossing',     speed: s => s * 5.2 * 0.24, confidence: 'speculative', evidenceNote: 'Extrapolated from wading capacity; no crossing-specific trackway evidence.' },
      { id: 'swim',   label: 'Open Swimming',      speed: s => s * 5.2 * 0.16, confidence: 'speculative', evidenceNote: 'Highly uncertain; a few possible swimming trace fossils are debated in the literature.' },
    ],
  },
];

const PTERO_ENVS: EnvGroup[] = [
  {
    category: 'AIR',
    icon: '✈',
    envs: [
      { id: 'thermal', label: 'Thermal Soaring',   speed: s => s * 14 + 22,    confidence: 'high',        evidenceNote: 'Wing loading calculations from wingspan and estimated body mass; analogue with albatrosses.' },
      { id: 'powered', label: 'Powered Flight',    speed: s => s * 11 + 14,    confidence: 'moderate',    evidenceNote: 'Pectoral muscle cross-section from coracoid scarring; metabolic rate estimation uncertain.' },
      { id: 'headwind',label: 'Headwind Flight',   speed: s => s * 8 + 8,      confidence: 'moderate',    evidenceNote: 'Aerodynamic modelling of aerofoil shape from wing bone proportions and presumed wing membrane.' },
    ],
  },
  {
    category: 'LAND',
    icon: '⬜',
    envs: [
      { id: 'walk',   label: 'Quadrupedal Walk',   speed: s => s * 1.3 + 1.2,  confidence: 'high',        evidenceNote: 'Pterosaur quadrupedal trackways (pteraichnia) documented from multiple Jurassic/Cretaceous sites.' },
      { id: 'launch', label: 'Sprint Launch',      speed: s => s * 2.8 + 2,    confidence: 'moderate',    evidenceNote: 'Vault-launch biomechanical modelling; powerful forelimb musculature from deltopectoral crest.' },
      { id: 'ground', label: 'Rough Ground',       speed: s => s * 0.9,        confidence: 'speculative', evidenceNote: 'Limited trackway data on uneven substrate; very uncertain estimate.' },
    ],
  },
  {
    category: 'WATER',
    icon: '🌊',
    envs: [
      { id: 'float',  label: 'Surface Floating',   speed: _s => 0,             confidence: 'high',        evidenceNote: 'Bone density analysis confirms buoyancy capacity; analogue with modern large seabirds.' },
      { id: 'takeoff',label: 'Water Takeoff',      speed: s => s * 3 + 2,      confidence: 'moderate',    evidenceNote: 'Wing loading and surface-run calculations; longer wingspan requires longer run-up distance.' },
      { id: 'paddle', label: 'Surface Paddling',   speed: s => s * 0.9 + 0.8,  confidence: 'speculative', evidenceNote: 'Forelimb proportions suggest limited paddle capacity; no direct evidence.' },
    ],
  },
];

const MARINE_ENVS: EnvGroup[] = [
  {
    category: 'WATER',
    icon: '🌊',
    envs: [
      { id: 'open',    label: 'Open Ocean',        speed: s => s * 6.5,        confidence: 'high',        evidenceNote: 'Flipper aspect ratio and body streamlining; calibrated against living dolphins and sea turtles.' },
      { id: 'coastal', label: 'Coastal Waters',    speed: s => s * 5.5,        confidence: 'high',        evidenceNote: 'Living marine reptile analogues (sea turtles, mosasaur descendants); well-constrained estimate.' },
      { id: 'deep',    label: 'Deep Water',        speed: s => s * 4.6,        confidence: 'moderate',    evidenceNote: 'Bone density as dive-weight indicator; pressure-resistance from cortical bone thickness.' },
    ],
  },
  {
    category: 'LAND',
    icon: '⬜',
    envs: [
      { id: 'beach',  label: 'Beach Movement',     speed: s => s * 0.45,       confidence: 'speculative', evidenceNote: 'Forelimb morphology suggests some terrestrial capacity; no confirmed landing-site trace fossils.' },
      { id: 'nest',   label: 'Nesting Crawl',      speed: s => s * 0.22,       confidence: 'speculative', evidenceNote: 'Inferred for plesiosaur groups from hip and pectoral girdle analysis; highly debated.' },
    ],
  },
];

function AdvancedLocomotionLab({ dino }: { dino: Dinosaur }) {
  const taxon = getTaxonomyType(dino);
  const sp    = dino.combatStats.speed;

  const envGroups: EnvGroup[] = taxon === 'pterosaur' ? PTERO_ENVS : taxon === 'marine_reptile' ? MARINE_ENVS : DINO_ENVS;

  const [cat,    setCat]    = useState(envGroups[0].category);
  const [envId,  setEnvId]  = useState(envGroups[0].envs[0].id);

  const currentGroup = envGroups.find(g => g.category === cat) ?? envGroups[0];
  const currentEnv   = currentGroup.envs.find(e => e.id === envId) ?? currentGroup.envs[0];
  const displaySpeed = Math.round(currentEnv.speed(sp) * 10) / 10;
  const gaugePct     = clamp((displaySpeed / (taxon === 'pterosaur' ? 120 : taxon === 'marine_reptile' ? 55 : 65)) * 100, 4, 100);
  const strideLen    = (sp * 0.44 + 0.85).toFixed(1);

  const speedLabel = displaySpeed <= 0 ? 'STATIONARY' : displaySpeed < 10 ? 'SLOW' : displaySpeed < 25 ? 'MODERATE' : displaySpeed < 45 ? 'FAST' : 'HIGH SPEED';
  const speedColor = displaySpeed <= 0 ? 'text-muted-foreground' : displaySpeed < 10 ? 'text-blue-400' : displaySpeed < 25 ? 'text-amber-300' : displaySpeed < 45 ? 'text-orange-400' : 'text-red-400';

  return (
    <MuseumExhibitCard
      badge="Museum Interactive"
      title="Locomotion Reconstruction"
      subtitle={
        taxon === 'pterosaur' ? 'Flight & Terrestrial Mechanics — Multi-environment speed reconstruction'
        : taxon === 'marine_reptile' ? 'Hydrodynamic Analysis — Aquatic and coastal locomotion reconstruction'
        : 'Biomechanical Analysis — Multi-environment speed reconstruction from trackways and limb proportions'
      }
      note="Speed estimates carry substantial uncertainty. Different biomechanical models applied to identical fossils can produce results differing by several km/h. Presented values represent plausible central estimates."
    >
      <div className="space-y-5">
        {/* Category tabs */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/50 font-display">Environment Category</span>
          <div className="flex gap-2">
            {envGroups.map(g => (
              <button
                key={g.category}
                onClick={() => { setCat(g.category); setEnvId(g.envs[0].id); }}
                data-testid={`cat-btn-${g.category}`}
                className={`flex-1 py-2 rounded-lg border text-[11px] font-display uppercase tracking-wider transition-all ${
                  cat === g.category
                    ? 'bg-amber-500/12 border-amber-400/35 text-amber-300'
                    : 'border-border/40 text-muted-foreground hover:border-border/60'
                }`}
              >
                {g.category}
              </button>
            ))}
          </div>
        </div>

        {/* Environment sub-buttons */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/50 font-display">Conditions</span>
          <div className="flex flex-wrap gap-2">
            {currentGroup.envs.map(e => (
              <button
                key={e.id}
                onClick={() => setEnvId(e.id)}
                data-testid={`env-btn-${e.id}`}
                className={`px-3 py-1.5 rounded-md text-[11px] font-display border transition-all ${
                  envId === e.id
                    ? 'bg-amber-500/12 border-amber-400/35 text-amber-300'
                    : 'border-border/40 text-muted-foreground hover:border-border/60'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speed output */}
        <div className="rounded-lg border border-amber-500/18 bg-amber-500/[0.04] p-4 space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-amber-400/70 font-display">
                Most Probable Speed — {currentEnv.label}
              </p>
              <p className="text-3xl font-display font-bold text-foreground tabular-nums mt-1">
                {displaySpeed > 0 ? displaySpeed : '—'}
                <span className="text-sm font-normal text-muted-foreground ml-1.5">
                  {displaySpeed > 0 ? 'km/h' : 'floating'}
                </span>
              </p>
              <p className={`text-[10px] font-display uppercase tracking-[0.2em] mt-0.5 ${speedColor}`}>{speedLabel}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <ConfidenceBadge level={currentEnv.confidence} />
              {taxon === 'dinosaur' && cat === 'LAND' && (
                <p className="text-[10px] text-muted-foreground/45 font-body">Stride ≈ {strideLen} m</p>
              )}
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-300"
              animate={{ width: `${gaugePct}%` }} transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Evidence note */}
        <div className="rounded-lg border border-border/30 bg-secondary/20 p-3.5">
          <p className="text-[9px] uppercase tracking-[0.14em] text-amber-400/60 font-display mb-1.5">How this estimate was made</p>
          <p className="text-xs text-muted-foreground font-body leading-relaxed">{currentEnv.evidenceNote}</p>
        </div>

        {/* Animated stride visualization (land only) */}
        {cat === 'LAND' && displaySpeed > 0 && taxon !== 'pterosaur' && (
          <div className="relative h-10 overflow-hidden rounded-md bg-secondary/25 border border-border/25">
            <div className="absolute inset-x-0 bottom-2 h-px bg-border/40" />
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="absolute bottom-[10px] h-2.5 w-2.5 rounded-full bg-amber-400/60"
                animate={{ x: ['0%', '110%'] }}
                transition={{
                  duration: Math.max(0.35, 3.2 - sp * 0.22),
                  delay: i * (0.9 - sp * 0.06),
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ left: `${i * 33}%` }}
              />
            ))}
          </div>
        )}

        <EvidencePanel data={{
          what: `${dino.name} most likely moved at ${displaySpeed} km/h in ${currentEnv.label.toLowerCase()} conditions — classified as ${speedLabel.toLowerCase()}.`,
          why: `Speed reconstruction follows established biomechanical principles: limb ratio analysis predicts locomotor class; trackway stride length divided by hip height gives a dimensionless speed index directly comparable between species.`,
          evidence: currentEnv.evidenceNote,
          confidence: currentEnv.confidence,
        }} />
      </div>
    </MuseumExhibitCard>
  );
}

// ── Hunting Strategy Exhibit (Life Mode) ──────────────────────────────────────

function HuntingStrategyExhibit({ dino }: { dino: Dinosaur }) {
  const sp   = dino.combatStats.speed;
  const iq   = dino.combatStats.intelligence;
  const aggr = dino.combatStats.aggression;
  const sz   = dino.combatStats.size;

  // Infer hunt style
  const isAmbush      = sp < 6 && aggr >= 6;
  const isCooperative = iq >= 7;
  const isPursuit     = sp >= 6;

  const stratLabel = isCooperative ? 'Cooperative Pursuit' : isAmbush ? 'Ambush Predation' : isPursuit ? 'Active Pursuit' : 'Opportunistic Scavenging';
  const stratColor = isCooperative ? '#a78bfa' : isAmbush ? '#34d399' : isPursuit ? '#f97316' : '#94a3b8';

  const approaches = [
    {
      id: 'detection',
      label: 'Prey Detection Range',
      desc: isAmbush ? 'Short-range detection — relies on concealment and ambush over distance. Olfaction likely more important than vision.' : 'Long-range detection — active tracking of prey over extended distances using olfaction and vision combined.',
      value: Math.round(clamp((iq * 40 + sp * 30) / 10, 15, 500)),
      unit: 'm',
      confidence: 'moderate' as Confidence,
    },
    {
      id: 'approach',
      label: 'Pursuit Distance',
      desc: isAmbush ? 'Minimal chase — ambush predators commit to strikes within metres of prey, conserving energy for the explosive burst.' : `Active chase over ${Math.round(clamp(sp * 80 + 50, 50, 1200))} m; energy budget constrains maximum sustained pursuit length.`,
      value: isAmbush ? Math.round(sp * 8 + 10) : Math.round(sp * 80 + 50),
      unit: 'm',
      confidence: 'speculative' as Confidence,
    },
    {
      id: 'strikezone',
      label: 'Estimated Attack Zone',
      desc: sz >= 7 ? 'Large prey contacted with full body mass; bite immediately to neck or haunch region to incapacitate.' : 'Strike to vulnerable body regions; smaller predators may avoid direct confrontation with struggling prey.',
      value: Math.round(clamp(sz * 1.2, 0.5, 12)),
      unit: 'm²',
      confidence: 'speculative' as Confidence,
    },
  ];

  const [selApp, setSelApp] = useState<string | null>(null);

  return (
    <MuseumExhibitCard
      badge="Museum Interactive"
      title="Hunting Strategy Reconstruction"
      subtitle="Predatory Behaviour Analysis — Inferred from skull, limb, and sensory anatomy"
      note="Hunting behaviour is among the most difficult aspects of palaeobiology to reconstruct. These inferences are constrained by anatomy but not directly observable in the fossil record."
    >
      <div className="space-y-5">
        {/* Strategy banner */}
        <div
          className="rounded-lg border p-4 flex items-center justify-between gap-4"
          style={{ borderColor: stratColor + '35', backgroundColor: stratColor + '08' }}
        >
          <div>
            <p className="text-[9px] uppercase tracking-[0.16em] font-display mb-0.5" style={{ color: stratColor, opacity: 0.7 }}>
              Reconstructed Strategy
            </p>
            <p className="text-xl font-display font-bold" style={{ color: stratColor }}>{stratLabel}</p>
          </div>
          <ConfidenceBadge level="speculative" />
        </div>

        {/* Approach angle SVG */}
        <div className="rounded-lg border border-border/30 bg-secondary/20 p-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/35 font-display mb-3 text-center">
            Schematic Attack Approach — Top-down view
          </p>
          <svg viewBox="0 0 280 120" className="w-full" style={{ maxHeight: 130 }}>
            {/* Prey silhouette */}
            <ellipse cx={220} cy={60} rx={22} ry={14} fill="rgba(148,163,184,0.15)" stroke="rgba(148,163,184,0.3)" strokeWidth={1} />
            <text x={220} y={84} textAnchor="middle" fill="currentColor" fillOpacity={0.3} fontSize={7} fontFamily="monospace">PREY</text>

            {/* Predator starting position */}
            {isAmbush
              ? <ellipse cx={55} cy={42} rx={18} ry={11} fill={stratColor + '22'} stroke={stratColor} strokeOpacity={0.4} strokeWidth={1} />
              : <ellipse cx={38} cy={60} rx={18} ry={11} fill={stratColor + '22'} stroke={stratColor} strokeOpacity={0.4} strokeWidth={1} />
            }
            <text x={isAmbush ? 55 : 38} y={isAmbush ? 62 : 80} textAnchor="middle" fill={stratColor} fillOpacity={0.5} fontSize={7} fontFamily="monospace">PRED.</text>

            {/* Attack vector */}
            {isAmbush ? (
              <>
                <path d="M 68,48 Q 140,42 196,52" fill="none" stroke={stratColor} strokeOpacity={0.4} strokeWidth={1.2} strokeDasharray="4,3" />
                <text x={135} y={38} textAnchor="middle" fill={stratColor} fillOpacity={0.35} fontSize={6.5} fontFamily="monospace">AMBUSH VECTOR</text>
              </>
            ) : (
              <>
                <line x1={56} y1={60} x2={196} y2={60} stroke={stratColor} strokeOpacity={0.35} strokeWidth={1.2} strokeDasharray="4,3" />
                <polygon points="196,56 208,60 196,64" fill={stratColor} fillOpacity={0.4} />
                <text x={130} y={54} textAnchor="middle" fill={stratColor} fillOpacity={0.35} fontSize={6.5} fontFamily="monospace">PURSUIT VECTOR</text>
              </>
            )}

            {/* Speed annotations */}
            <text x={130} y={90} textAnchor="middle" fill="currentColor" fillOpacity={0.2} fontSize={6.5} fontFamily="monospace">
              PREDATOR: ~{Math.round(sp * 5.2)} km/h
            </text>
          </svg>
        </div>

        {/* Approach stats */}
        <div className="grid sm:grid-cols-3 gap-2">
          {approaches.map(a => (
            <button
              key={a.id}
              onClick={() => setSelApp(selApp === a.id ? null : a.id)}
              data-testid={`approach-btn-${a.id}`}
              className={`text-left p-3 rounded-lg border transition-all ${
                selApp === a.id ? 'border-amber-400/35 bg-amber-500/07' : 'border-border/30 hover:border-border/50'
              }`}
            >
              <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/45 font-display mb-1">{a.label}</p>
              <p className="text-xl font-display font-bold text-foreground tabular-nums">
                {a.value}<span className="text-xs font-normal text-muted-foreground ml-1">{a.unit}</span>
              </p>
              <ConfidenceBadge level={a.confidence} />
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selApp && (
            <motion.div
              key={selApp}
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.16 }}
              className="rounded-lg border border-amber-500/20 bg-amber-500/05 p-3.5"
            >
              <p className="text-xs text-muted-foreground font-body leading-relaxed">
                {approaches.find(a => a.id === selApp)?.desc}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <EvidencePanel data={{
          what: `${dino.name} most likely employed ${stratLabel.toLowerCase()} — inferred from the combination of ${iq >= 6 ? 'high cognitive capacity' : 'limited cognitive indicators'}, ${sp >= 6 ? 'strong cursorial ability' : 'limited pursuit speed'}, and ${aggr >= 7 ? 'high aggression indicators in skull morphology' : 'moderate aggression indicators'}.`,
          why: `Hunting strategy leaves only indirect fossil traces: prey bone assemblages with characteristic bite-mark distributions, the speed class of the predator relative to probable prey species, and tooth and claw morphology adapted for specific prey-handling techniques.`,
          evidence: `Skull robustness, orbit placement, olfactory bulb size, forelimb-to-hindlimb ratio, claw curvature angles, and comparison with living analogues (Komodo dragon, wolves, large cats) matched to similar ecological niches.`,
          confidence: 'speculative',
        }} />
      </div>
    </MuseumExhibitCard>
  );
}

// ── Ecological Position V2 (Life Mode) ───────────────────────────────────────

function EcologicalExhibitV2({ dino }: { dino: Dinosaur }) {
  const eco = dino.ecologicalStats!;

  const bars = [
    { label: 'Apex Influence',          value: eco.apexStatus,            color: 'red',    what: 'Position in the food chain; 10 = unchallenged apex predator or ecosystem engineer.' },
    { label: 'Niche Dominance',         value: eco.nicheControl,          color: 'amber',  what: 'How exclusively this species controlled its ecological role.' },
    { label: 'Geographic Range',        value: eco.geographicSpread,      color: 'blue',   what: 'Distributional breadth across known fossil localities.' },
    { label: 'Population Density',      value: eco.populationDensity,     color: 'green',  what: 'Relative abundance inferred from bone-bed frequency.' },
    { label: 'Competition Pressure',    value: eco.competitionPressure,   color: 'amber',  what: 'Frequency of resource-overlap with ecologically similar contemporaries.' },
    { label: 'Evolutionary Longevity',  value: eco.evolutionaryLongevity, color: 'violet', what: 'Stratigraphic range of the species lineage in millions of years.' },
  ];

  const [hovered, setHovered] = useState<string | null>(null);

  // Trophic tier
  const tier = eco.apexStatus >= 8 ? 'Apex Predator / Keystone Species'
    : eco.apexStatus >= 5 ? 'Mid-Level Predator / Primary Consumer'
    : 'Subordinate Consumer / Browser';
  const tierColor = eco.apexStatus >= 8 ? 'text-red-400' : eco.apexStatus >= 5 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <MuseumExhibitCard
      badge="Museum Exhibit"
      title="Ecological Position Analysis"
      subtitle="Community Ecology Reconstruction — Trophic role and ecosystem impact inferred from fossil distributions"
      note="Ecological indices are modelled estimates — not measured quantities. They reflect the consensus reconstruction based on fossil abundance, geographic occurrence, and trophic role relative to contemporaneous species."
    >
      <div className="space-y-5">
        {/* Trophic position */}
        <div className="rounded-lg border border-border/30 bg-secondary/20 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/45 font-display mb-0.5">Reconstructed Trophic Position</p>
              <p className={`text-lg font-display font-bold ${tierColor}`}>{tier}</p>
            </div>
            <ConfidenceBadge level={eco.apexStatus >= 7 ? 'high' : 'moderate'} />
          </div>
          {/* Simple food chain visualization */}
          <div className="flex items-center gap-2 mt-2">
            {['Plants / Invertebrates', 'Primary Consumers', 'Secondary Predators', 'Apex'].map((lvl, i) => {
              const tierIndex = eco.apexStatus >= 8 ? 3 : eco.apexStatus >= 5 ? 2 : 1;
              const isThis = i === tierIndex;
              return (
                <div key={lvl} className={`flex-1 text-center py-1.5 rounded text-[8px] font-display uppercase tracking-wide transition-all ${
                  isThis ? 'bg-amber-500/15 border border-amber-400/30 text-amber-300' : 'text-muted-foreground/30'
                }`}>
                  {lvl.split(' ')[0]}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ecological index bars */}
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {bars.map(b => (
            <div
              key={b.label}
              className="space-y-1 cursor-help"
              onMouseEnter={() => setHovered(b.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <StatBar label={b.label} value={b.value} max={10} unit="/10" color={b.color} />
              <AnimatePresence>
                {hovered === b.label && (
                  <motion.p
                    initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[10px] text-muted-foreground/50 font-body italic"
                  >
                    {b.what}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <EvidencePanel data={{
          what: `${dino.name} occupied a ${tier.toLowerCase()} role within its ecosystem, with apex influence of ${eco.apexStatus}/10 and geographic spread of ${eco.geographicSpread}/10.`,
          why: `Trophic reconstructions integrate skull morphology, body mass, relative abundance in the fossil record, and contemporaneous fauna from the same geological formation.`,
          evidence: `Relative abundance counts in bone beds, geographic occurrence data across multiple formations, inferred prey-to-predator ratios from associated herbivore and carnivore fossil densities.`,
          confidence: eco.apexStatus >= 7 ? 'high' : 'moderate',
        }} />
      </div>
    </MuseumExhibitCard>
  );
}

// ── Social Structure Exhibit (Life Mode) ─────────────────────────────────────

function SocialStructureExhibit({ dino }: { dino: Dinosaur }) {
  const iq = dino.combatStats.intelligence;

  const evidenceTypes = [
    {
      id: 'bonebeds',
      label: 'Bone Beds',
      desc: 'Monospecific bone accumulations containing multiple individuals across growth stages suggest group living or seasonal aggregation.',
      quality: iq >= 7 ? 3 : iq >= 5 ? 2 : 1,
      confidence: (iq >= 7 ? 'high' : iq >= 5 ? 'moderate' : 'speculative') as Confidence,
    },
    {
      id: 'trackways',
      label: 'Parallel Trackways',
      desc: 'Multiple individuals moving in the same direction simultaneously — the most direct evidence for group movement.',
      quality: iq >= 6 ? 3 : 2,
      confidence: (iq >= 6 ? 'moderate' : 'speculative') as Confidence,
    },
    {
      id: 'nesting',
      label: 'Nesting Colonies',
      desc: 'Nests spaced evenly and at similar developmental stages imply synchronised communal breeding — the strongest evidence for extended social bonds.',
      quality: iq >= 8 ? 3 : 1,
      confidence: (iq >= 8 ? 'high' : 'speculative') as Confidence,
    },
    {
      id: 'display',
      label: 'Display Structures',
      desc: 'Crests, frills, and elaborate ornamentation are best explained by intraspecific communication, implying a social context in which displays were received.',
      quality: dino.distinctFeatures.some(f => /crest|frill|horn|sail|spike|display/i.test(f)) ? 3 : 2,
      confidence: 'moderate' as Confidence,
    },
  ];

  const socialScore = clamp(iq * 8 + 12, 10, 95);
  const groupLabel = socialScore >= 70 ? 'Social — likely group living' : socialScore >= 45 ? 'Facultatively social — occasional aggregation' : 'Solitary — minimal social interaction';
  const groupColor = socialScore >= 70 ? 'text-emerald-400' : socialScore >= 45 ? 'text-amber-400' : 'text-blue-400';

  function QualityDots({ n }: { n: number }) {
    return (
      <div className="flex gap-1">
        {[1,2,3].map(i => (
          <div key={i} className={`h-2 w-2 rounded-full ${i <= n ? 'bg-amber-400' : 'bg-secondary'}`} />
        ))}
      </div>
    );
  }

  return (
    <MuseumExhibitCard
      badge="Museum Exhibit"
      title="Social Structure Analysis"
      subtitle="Behavioural Ecology — Social complexity inferred from multiple independent lines of fossil evidence"
      note="Social behaviour leaves only indirect traces in the fossil record. Every inference below is probabilistic — the evidence constrains the range of plausible social structures but cannot definitively confirm any single model."
    >
      <div className="space-y-5">
        {/* Social classification */}
        <div className="rounded-lg border border-border/30 bg-secondary/20 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/45 font-display mb-0.5">Social Classification</p>
            <p className={`text-lg font-display font-bold ${groupColor}`}>{groupLabel}</p>
          </div>
          <ConfidenceBadge level={iq >= 7 ? 'moderate' : 'speculative'} />
        </div>

        {/* Evidence types grid */}
        <div className="grid sm:grid-cols-2 gap-3">
          {evidenceTypes.map(e => (
            <div key={e.id} className="rounded-lg border border-border/30 bg-secondary/15 p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-display font-semibold text-foreground/80">{e.label}</p>
                <QualityDots n={e.quality} />
              </div>
              <p className="text-[10px] text-muted-foreground/55 font-body leading-relaxed">{e.desc}</p>
              <ConfidenceBadge level={e.confidence} />
            </div>
          ))}
        </div>

        {/* Social index bar */}
        <div className="space-y-1.5">
          <StatBar label="Social Complexity Index" value={socialScore} max={100} color="violet" />
          <p className="text-[10px] text-muted-foreground/45 font-body italic">
            Derived from relative brain size (encephalisation), known display structures, and phylogenetic proximity to socially complex lineages.
          </p>
        </div>

        <EvidencePanel data={{
          what: `${dino.name} is inferred to have been ${groupLabel.toLowerCase()} based on anatomical and taphonomic evidence.`,
          why: `Relative brain size (encephalisation quotient) is the best predictor of social complexity in living vertebrates. Display structures imply a social audience. Taphonomic assemblages constrain whether individuals were found together.`,
          evidence: `Endocast EQ calculations, taphonomic analysis of any multispecimen sites, presence/absence of cranial display structures, phylogenetic bracketing against socially complex relatives (birds and crocodilians).`,
          confidence: iq >= 7 ? 'moderate' : 'speculative',
        }} />
      </div>
    </MuseumExhibitCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXHIBIT SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

export interface SectionExhibitProps {
  sectionId: string;
  dino:      Dinosaur;
  mode:      'life' | 'scientific';
}

export function SectionExhibit({ sectionId, dino, mode }: SectionExhibitProps) {
  const isCarni = dino.diet === 'Carnivore' || dino.diet === 'Piscivore';

  // ── LIFE MODE: ecology, behaviour, social, hunting ───────────────────────────
  if (mode === 'life') {
    if (sectionId === 'behavior') {
      return <AdvancedLocomotionLab dino={dino} />;
    }
    if (sectionId === 'diet' && isCarni && dino.combatStats.biteForce >= 3) {
      return <HuntingStrategyExhibit dino={dino} />;
    }
    if (sectionId === 'role' && dino.ecologicalStats) {
      return <EcologicalExhibitV2 dino={dino} />;
    }
    if (sectionId === 'social') {
      return <SocialStructureExhibit dino={dino} />;
    }
    return null;
  }

  // ── SCIENTIFIC MODE: anatomy, mechanics, pathology ───────────────────────────
  if (mode === 'scientific') {
    if (sectionId === 'bite') {
      return <BiteForceLab dino={dino} />;
    }
    if (sectionId === 'intel') {
      return <SensoryReconstructionV2 dino={dino} />;
    }
    if (sectionId === 'speed') {
      return <SkeletalMechanicsLab dino={dino} />;
    }
    if (sectionId === 'muscle') {
      return <MuscleReconstructionLab dino={dino} />;
    }
    if (sectionId === 'fossil') {
      return <PaleopathologyExhibit dino={dino} />;
    }
    return null;
  }

  return null;
}
