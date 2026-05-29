import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, BookOpen, Clock, Bone, Compass, Ruler, ChevronRight,
} from 'lucide-react';
import { Dinosaur } from '@/data/types';
import { LocationMapSingle } from '@/components/LocationMapSingle';
import { getTaxonomyType, getTaxonomyLabel } from '@/lib/taxonomy';

// ── Exhibit navigation targets (must match section ids in DinosaurPage) ──────
const NAV_ITEMS = [
  { id: 'exhibit-encyclopedia', label: 'Encyclopedia', icon: BookOpen },
  { id: 'exhibit-timeline',     label: 'Geological Timeline', icon: Clock },
  { id: 'exhibit-fossil',       label: 'Fossil Record', icon: Bone },
  { id: 'exhibit-discovery',    label: 'Discovery', icon: Compass },
  { id: 'exhibit-scale',        label: 'True Scale', icon: Ruler },
];

const PERIODS = [
  { name: 'Permian', start: 299, end: 252 },
  { name: 'Triassic', start: 252, end: 201 },
  { name: 'Jurassic', start: 201, end: 145 },
  { name: 'Cretaceous', start: 145, end: 66 },
];
const T_START = 300, T_END = 60;
const span = T_START - T_END;
const pct = (mya: number) => ((T_START - mya) / span) * 100;

function specimenCode(dino: Dinosaur): string {
  const base = dino.id.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase().padEnd(4, 'X');
  return `SPC-${base}`;
}

// ── HUD panel wrapper ────────────────────────────────────────────────────────
function RailPanel({
  label, tag, children,
}: { label: string; tag?: string; children: React.ReactNode }) {
  return (
    <div className="relative rounded-lg border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-amber-400/25 pointer-events-none" />
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
        <span className="text-[9px] uppercase tracking-[0.22em] font-display text-amber-400/60">{label}</span>
        {tag && <span className="text-[8px] uppercase tracking-[0.14em] font-display text-muted-foreground/40">{tag}</span>}
      </div>
      <div className="px-3.5 pb-3.5">{children}</div>
    </div>
  );
}

// ── Scroll-spy across exhibit sections ──────────────────────────────────────
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState<string>(ids[0]);
  const key = ids.join(',');
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive((visible[0].target as HTMLElement).id);
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: [0, 0.2, 0.5, 1] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
}

function goToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 100;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

export function SpeciesScientificRail({ dino }: { dino: Dinosaur }) {
  const taxon = getTaxonomyType(dino);
  const code = useMemo(() => specimenCode(dino), [dino]);
  const navIds = useMemo(() => NAV_ITEMS.map((n) => n.id), []);
  const active = useActiveSection(navIds);

  const rangeLeft = pct(dino.periodRange.start);
  const rangeWidth = Math.max(pct(dino.periodRange.end) - rangeLeft, 2);

  return (
    <div className="space-y-3">
      {/* Specimen identifier */}
      <div className="relative rounded-lg border border-amber-500/25 bg-amber-500/[0.04] overflow-hidden px-3.5 py-3">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <p className="text-[8px] uppercase tracking-[0.24em] font-display text-amber-400/55">Specimen Identifier</p>
        <p className="mt-1 font-mono text-sm tabular-nums text-foreground tracking-wider">{code}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-[0.18em] font-display text-muted-foreground/60 bg-secondary/60 border border-border/40 rounded-sm px-1.5 py-0.5">
            {getTaxonomyLabel(taxon)}
          </span>
          <span className="text-[9px] uppercase tracking-[0.18em] font-display text-muted-foreground/60 bg-secondary/60 border border-border/40 rounded-sm px-1.5 py-0.5">
            {dino.period}
          </span>
        </div>
      </div>

      {/* Exhibit navigation */}
      <RailPanel label="Exhibit Navigation" tag={`${NAV_ITEMS.length} Zones`}>
        <nav className="space-y-0.5 -mx-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => goToSection(item.id)}
                data-testid={`nav-${item.id}`}
                className={`relative w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors group ${
                  isActive ? 'bg-amber-500/10' : 'hover:bg-secondary/40'
                }`}
              >
                {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-amber-400" />}
                <Icon className={`h-3.5 w-3.5 flex-shrink-0 transition-colors ${isActive ? 'text-amber-300' : 'text-muted-foreground/60 group-hover:text-foreground'}`} />
                <span className={`text-xs font-display tracking-wide transition-colors flex-1 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
                <ChevronRight className={`h-3 w-3 flex-shrink-0 transition-all ${isActive ? 'text-amber-400/70 translate-x-0' : 'text-transparent -translate-x-1 group-hover:text-muted-foreground/40 group-hover:translate-x-0'}`} />
              </button>
            );
          })}
        </nav>
      </RailPanel>

      {/* Scientific classification */}
      <RailPanel label="Classification" tag="Taxonomy">
        <div className="space-y-1.5">
          {Object.entries(dino.classification).map(([key, value], i) => (
            <div key={key} className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/45 font-display flex-shrink-0">{key}</span>
              <span
                className="text-[11px] text-foreground/85 font-body text-right break-words"
                data-testid={`rail-classification-${key}`}
              >
                {value}
              </span>
              {/* hairline */}
            </div>
          ))}
        </div>
      </RailPanel>

      {/* Geological position */}
      <RailPanel label="Geological Position" tag={`${dino.periodRange.start}–${dino.periodRange.end} Mya`}>
        <div className="relative">
          <div className="relative h-2 rounded-full overflow-hidden flex bg-secondary">
            {PERIODS.map((p) => (
              <div
                key={p.name}
                style={{ width: `${((p.start - p.end) / span) * 100}%` }}
                className="h-full border-r border-background/40 last:border-r-0 bg-muted-foreground/20"
              />
            ))}
          </div>
          {/* species range marker */}
          <motion.div
            className="absolute top-0 h-2 rounded-full bg-amber-400/80"
            style={{ left: `${rangeLeft}%`, boxShadow: '0 0 8px hsla(38,92%,60%,0.5)' }}
            initial={{ width: 0 }}
            animate={{ width: `${rangeWidth}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <div className="flex justify-between mt-2 text-[8px] font-mono text-muted-foreground/40 tabular-nums">
            <span>300</span><span>Mya</span><span>60</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {PERIODS.map((p) => (
              <span
                key={p.name}
                className={`text-[8px] uppercase tracking-[0.12em] font-display rounded-sm px-1.5 py-0.5 border ${
                  p.name === dino.period
                    ? 'text-amber-300 border-amber-500/40 bg-amber-500/10'
                    : 'text-muted-foreground/35 border-border/30'
                }`}
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </RailPanel>

      {/* Discovery location */}
      <RailPanel label="Discovery Location" tag="Field Site">
        <LocationMapSingle location={dino.discovery.location} continent={dino.continent} />
        <div className="flex items-start gap-2 mt-3">
          <MapPin className="h-3.5 w-3.5 text-amber-400/60 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-foreground/85 font-body break-words leading-snug" data-testid="rail-discovery-location">
              {dino.discovery.location}
            </p>
            <p className="text-[10px] text-muted-foreground/55 font-body mt-0.5 break-words">{dino.continent}</p>
          </div>
        </div>
      </RailPanel>
    </div>
  );
}
