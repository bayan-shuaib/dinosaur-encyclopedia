import { Link } from 'react-router-dom';
import { Dinosaur } from '@/data/types';

// ── Shared palette maps ────────────────────────────────────────────────────

export const PERIOD_META: Record<string, {
  textColor: string; bgBorder: string; dotColor: string; range: string;
}> = {
  Permian:    { textColor: 'text-purple-400/70',  bgBorder: 'bg-purple-500/8 border-purple-500/22',  dotColor: 'bg-purple-400',  range: '299–252 Mya' },
  Triassic:   { textColor: 'text-orange-400/70',  bgBorder: 'bg-orange-500/8 border-orange-500/22',  dotColor: 'bg-orange-400',  range: '252–201 Mya' },
  Jurassic:   { textColor: 'text-emerald-400/70', bgBorder: 'bg-emerald-500/8 border-emerald-500/22', dotColor: 'bg-emerald-400', range: '201–145 Mya' },
  Cretaceous: { textColor: 'text-amber-400/70',   bgBorder: 'bg-amber-500/8 border-amber-500/22',   dotColor: 'bg-amber-400',   range: '145–66 Mya'  },
};

const DIET_META: Record<string, { cls: string; abbr: string }> = {
  Carnivore:   { cls: 'bg-red-500/8 text-red-400/65 border-red-500/18',     abbr: 'CARNI' },
  Herbivore:   { cls: 'bg-green-500/8 text-green-400/65 border-green-500/18', abbr: 'HERBI' },
  Omnivore:    { cls: 'bg-yellow-500/8 text-yellow-400/65 border-yellow-500/18', abbr: 'OMNI' },
  Piscivore:   { cls: 'bg-blue-500/8 text-blue-400/65 border-blue-500/18',   abbr: 'PISCI' },
  Insectivore: { cls: 'bg-violet-500/8 text-violet-400/65 border-violet-500/18', abbr: 'INSEC' },
};

// ============================================================================
// ARCHIVE SPECIMEN CARD — primary card for horizontal archive rows
// ============================================================================

export function ArchiveSpecimenCard({
  dinosaur,
  specimenIndex,
}: {
  dinosaur: Dinosaur;
  specimenIndex: number;
}) {
  const specimenId = `SP-${String(specimenIndex + 1).padStart(4, '0')}`;
  const period = PERIOD_META[dinosaur.period] ?? PERIOD_META.Cretaceous;
  const diet   = DIET_META[dinosaur.diet] ?? DIET_META.Carnivore;
  const massT  = (dinosaur.weight / 1000).toFixed(1);

  return (
    <Link
      to={`/dinosaur/${dinosaur.id}`}
      className="group flex-shrink-0 w-[158px] rounded-lg bg-card border border-border/30 overflow-hidden hover:border-amber-500/45 hover:shadow-[0_0_22px_rgba(251,191,36,0.09)] hover:-translate-y-0.5 transition-all duration-300"
      data-testid={`card-archive-${dinosaur.id}`}
    >
      {/* ── Display case ──────────────────────────────────────────────── */}
      <div className="relative h-[112px] bg-secondary/45 overflow-hidden">
        {/* Case lighting — soft spotlight from above */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,191,36,0.10),transparent_62%)] opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Corner brackets */}
        <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-amber-400/28 pointer-events-none transition-opacity group-hover:border-amber-400/55" />
        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-amber-400/28 pointer-events-none transition-opacity group-hover:border-amber-400/55" />

        {/* Specimen ID */}
        <div className="absolute top-1.5 left-1.5 z-10 mt-3.5">
          <span className="text-[6.5px] font-mono tracking-[0.14em] text-amber-400/45 bg-black/25 px-1 py-[2px] rounded-[2px]">
            {specimenId}
          </span>
        </div>

        {/* Period badge */}
        <div className="absolute top-1.5 right-1.5 z-10">
          <span className={`text-[6.5px] font-display uppercase tracking-[0.1em] px-1 py-[2px] rounded-sm border ${period.textColor} ${period.bgBorder}`}>
            {dinosaur.period.slice(0, 4).toUpperCase()}
          </span>
        </div>

        {/* Name watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[22px] font-condensed font-black text-muted-foreground/[0.05] uppercase text-center leading-none select-none px-2 break-all">
            {dinosaur.name.split(' ')[0]}
          </span>
        </div>

        {/* Horizontal scan line on hover */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Hover stat overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/88 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 gap-0.5">
          <div className="flex justify-between items-center">
            <span className="text-[7px] uppercase tracking-[0.08em] text-muted-foreground/45 font-display">Length</span>
            <span className="text-[8px] font-mono text-foreground/55">{dinosaur.length}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[7px] uppercase tracking-[0.08em] text-muted-foreground/45 font-display">Mass</span>
            <span className="text-[8px] font-mono text-foreground/55">{massT}t</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[7px] uppercase tracking-[0.08em] text-muted-foreground/45 font-display">Described</span>
            <span className="text-[8px] font-mono text-foreground/55">{dinosaur.discovery.year}</span>
          </div>
        </div>
      </div>

      {/* ── Engraved placard ──────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
      <div className="px-2.5 pt-2 pb-2.5">
        <p className="font-condensed font-bold uppercase text-[11px] tracking-wide text-foreground leading-tight line-clamp-1">
          {dinosaur.name.toUpperCase()}
        </p>
        <p className="font-body text-[9px] text-muted-foreground/38 italic mt-0.5 truncate leading-tight">
          {dinosaur.scientificName.split(' ').slice(1).join(' ').toLowerCase()}
        </p>
        <div className="mt-2 flex items-center justify-between gap-1">
          <span className={`text-[7px] font-display uppercase tracking-[0.07em] px-1.5 py-[2px] rounded-sm border ${diet.cls}`}>
            {diet.abbr}
          </span>
          <div className="flex items-center gap-1">
            <div className={`h-1 w-1 rounded-full flex-shrink-0 ${period.dotColor} opacity-60`} />
            <span className="text-[7.5px] text-muted-foreground/28 font-mono">
              {dinosaur.continent.split(' ').pop()?.slice(0, 3).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// FEATURED EXHIBIT CARD — large cinematic highlight card
// ============================================================================

export function FeaturedExhibitCard({ dinosaur }: { dinosaur: Dinosaur }) {
  const period = PERIOD_META[dinosaur.period] ?? PERIOD_META.Cretaceous;
  const diet   = DIET_META[dinosaur.diet] ?? DIET_META.Carnivore;
  const descSnippet = dinosaur.description.length > 220
    ? dinosaur.description.slice(0, 220).trimEnd() + '…'
    : dinosaur.description;

  return (
    <Link
      to={`/dinosaur/${dinosaur.id}`}
      className="group block rounded-xl border border-amber-500/18 bg-card/70 overflow-hidden hover:border-amber-500/35 hover:shadow-[0_0_30px_rgba(251,191,36,0.05)] transition-all duration-300"
      data-testid={`card-featured-${dinosaur.id}`}
    >
      {/* Top amber line */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="grid md:grid-cols-5 gap-0">
        {/* ── Left: specimen image ─────────────────────────────────────── */}
        <div className="md:col-span-3 relative bg-secondary/50 aspect-[16/9] md:aspect-auto min-h-[160px] overflow-hidden">
          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-amber-400/35 pointer-events-none group-hover:border-amber-400/60 transition-colors" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-amber-400/35 pointer-events-none group-hover:border-amber-400/60 transition-colors" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-amber-400/35 pointer-events-none group-hover:border-amber-400/60 transition-colors" />

          {/* Today's Exhibit badge */}
          <div className="absolute top-3 left-3 z-10 mt-5">
            <span className="text-[8px] font-display uppercase tracking-[0.2em] text-amber-400/60 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-sm">
              TODAY'S EXHIBIT
            </span>
          </div>

          {/* Scan line */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Name watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-5xl md:text-7xl font-condensed font-black text-muted-foreground/[0.04] uppercase text-center leading-none select-none px-4">
              {dinosaur.name}
            </span>
          </div>

          {/* Bottom scan label */}
          <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/40 to-transparent">
            <span className="text-[7px] uppercase tracking-[0.22em] font-display text-amber-400/40">
              {dinosaur.group.toUpperCase()} · {dinosaur.period.toUpperCase()} · RECONSTRUCTION
            </span>
          </div>
        </div>

        {/* ── Right: species info ──────────────────────────────────────── */}
        <div className="md:col-span-2 p-5 md:p-6 flex flex-col justify-between gap-4">
          <div>
            <div className="text-[7.5px] uppercase tracking-[0.28em] text-muted-foreground/35 font-display mb-3 flex items-center gap-2">
              <span>FEATURED SPECIMEN</span>
              <div className="h-px flex-1 bg-border/20" />
            </div>
            <h3 className="text-xl md:text-2xl font-display font-bold text-foreground tracking-tight leading-tight">
              {dinosaur.name}
            </h3>
            <p className="text-[10px] text-muted-foreground/40 italic font-body mt-0.5 mb-3">
              {dinosaur.scientificName}
            </p>
            <p className="text-[12px] text-muted-foreground/65 font-body leading-relaxed">
              {descSnippet}
            </p>
          </div>

          {/* Stats grid */}
          <div className="space-y-1.5 border-t border-border/20 pt-3">
            {[
              ['Period',   dinosaur.period],
              ['Length',   `${dinosaur.length} m`],
              ['Diet',     dinosaur.diet],
              ['Described', String(dinosaur.discovery.year)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/35 font-display">{label}</span>
                <span className="text-[10px] text-foreground/55 font-body">{value}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="inline-flex items-center gap-2 text-[10px] font-display uppercase tracking-[0.18em] text-amber-300/50 group-hover:text-amber-300/80 transition-colors">
            <span>Access Exhibit Record</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// DINOSAUR GRID CARD — kept for any legacy grid views
// ============================================================================

export function DinosaurGridCard({ dinosaur }: { dinosaur: Dinosaur }) {
  const period = PERIOD_META[dinosaur.period] ?? PERIOD_META.Cretaceous;
  const diet   = DIET_META[dinosaur.diet] ?? DIET_META.Carnivore;

  return (
    <Link
      to={`/dinosaur/${dinosaur.id}`}
      className="group block rounded-lg bg-card border border-border/30 overflow-hidden hover:border-amber-500/40 hover:shadow-[0_0_16px_rgba(251,191,36,0.06)] transition-all duration-300"
      data-testid={`card-grid-${dinosaur.id}`}
    >
      <div className="relative aspect-square bg-secondary/50 overflow-hidden">
        {/* Corner brackets */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-amber-400/25 pointer-events-none group-hover:border-amber-400/50 transition-colors" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-amber-400/25 pointer-events-none group-hover:border-amber-400/50 transition-colors" />

        {/* Period badge */}
        <div className="absolute top-2 right-2 z-10 mt-4">
          <span className={`text-[6.5px] font-display uppercase tracking-[0.1em] px-1 py-[2px] rounded-sm border ${period.textColor} ${period.bgBorder}`}>
            {dinosaur.period.slice(0, 4).toUpperCase()}
          </span>
        </div>

        {/* Name silhouette */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-3xl font-condensed font-black text-muted-foreground/[0.06] uppercase text-center leading-none select-none px-2">
            {dinosaur.name.split(' ')[0]}
          </span>
        </div>

        {/* Hover scan line */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="px-3 pt-2.5 pb-3">
        <p className="font-condensed font-bold uppercase text-[12px] tracking-wide text-foreground leading-tight">
          {dinosaur.name.toUpperCase()}
        </p>
        <p className="font-body text-[9px] text-muted-foreground/38 italic mt-0.5 truncate">
          {dinosaur.scientificName.split(' ').slice(1).join(' ').toLowerCase()}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`text-[7px] font-display uppercase tracking-[0.07em] px-1.5 py-[2px] rounded-sm border ${diet.cls}`}>
            {diet.abbr}
          </span>
          <div className={`h-1 w-1 rounded-full ${period.dotColor} opacity-50`} />
          <span className="text-[8px] text-muted-foreground/28 font-display uppercase tracking-[0.08em]">
            {dinosaur.period.slice(0, 4)}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// DINOSAUR LIST CARD — compact archive record row
// ============================================================================

export function DinosaurListCard({ dinosaur }: { dinosaur: Dinosaur }) {
  const period = PERIOD_META[dinosaur.period] ?? PERIOD_META.Cretaceous;
  const diet   = DIET_META[dinosaur.diet] ?? DIET_META.Carnivore;

  return (
    <Link
      to={`/dinosaur/${dinosaur.id}`}
      className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-card border border-transparent hover:border-border/25 transition-all group"
      data-testid={`card-list-${dinosaur.id}`}
    >
      {/* Icon box */}
      <div className="w-10 h-10 rounded-md bg-secondary/60 flex items-center justify-center flex-shrink-0 border border-border/20 group-hover:border-amber-500/20 transition-colors">
        <span className={`text-base font-condensed font-black ${period.textColor} opacity-60`}>
          {dinosaur.name[0]}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-condensed font-bold uppercase tracking-wide text-[12px] text-foreground">
          {dinosaur.name.toUpperCase()}
        </p>
        <p className="font-body text-[9px] text-muted-foreground/40 italic truncate mt-0.5">
          {dinosaur.scientificName.split(' ').slice(1).join(' ').toLowerCase()}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-[7px] font-display uppercase tracking-[0.07em] px-1.5 py-[2px] rounded-sm border ${diet.cls}`}>
          {diet.abbr}
        </span>
        <span className="text-[8px] text-muted-foreground/30 font-mono">{dinosaur.length}m</span>
      </div>
    </Link>
  );
}
