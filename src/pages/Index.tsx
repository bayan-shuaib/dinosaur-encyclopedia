import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { dinosaurs } from '@/data/dinosaurs';
import { ArchiveSpecimenCard, DinosaurListCard, FeaturedExhibitCard, PERIOD_META } from '@/components/DinosaurCard';
import { cn } from '@/lib/utils';
import { Period } from '@/data/types';
import { AnimatePresence, motion } from 'framer-motion';
import { getTaxonomyType } from '@/lib/taxonomy';
import { Layers, Wind, Waves, ChevronRight, LayoutGrid, List } from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────

const PERIOD_ORDER: Period[] = ['Permian', 'Triassic', 'Jurassic', 'Cretaceous'];

type TabKey = 'dinosaurs' | 'pterosaurs' | 'marine_reptiles';

const TABS: { key: TabKey; label: string; sub: string; icon: React.ReactNode }[] = [
  { key: 'dinosaurs',       label: 'Dinosaurs',       sub: 'Terrestrial',  icon: <Layers className="h-3.5 w-3.5" /> },
  { key: 'pterosaurs',      label: 'Pterosaurs',      sub: 'Aerial',       icon: <Wind className="h-3.5 w-3.5" /> },
  { key: 'marine_reptiles', label: 'Marine Reptiles', sub: 'Aquatic',      icon: <Waves className="h-3.5 w-3.5" /> },
];

const FEATURED_IDS: Record<TabKey, string[]> = {
  dinosaurs:       ['tyrannosaurus-rex', 'spinosaurus', 'triceratops'],
  pterosaurs:      ['pteranodon', 'quetzalcoatlus'],
  marine_reptiles: ['mosasaurus', 'plesiosaurus'],
};

// ── Archive Rail ─────────────────────────────────────────────────────────────

function ArchiveRail({
  activeTab, onTabChange, periodCounts, onScrollToPeriod,
}: {
  activeTab: TabKey;
  onTabChange: (t: TabKey) => void;
  periodCounts: Record<string, number>;
  onScrollToPeriod: (p: string) => void;
}) {
  return (
    <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 select-none">
      <div className="sticky top-[100px] flex flex-col gap-5">
        {/* Archive title */}
        <div className="pb-3 border-b border-border/25">
          <div className="text-[7.5px] uppercase tracking-[0.32em] text-amber-400/40 font-display mb-1">
            DINOPEDIA
          </div>
          <div className="text-[11px] font-display font-semibold text-foreground/80 tracking-wide">
            Paleontology Archive
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400/60 animate-pulse" />
            <span className="text-[8px] font-mono text-muted-foreground/35 tracking-[0.12em]">ARCHIVE ACTIVE</span>
          </div>
        </div>

        {/* Collection */}
        <div>
          <div className="text-[7.5px] uppercase tracking-[0.25em] text-muted-foreground/35 font-display mb-2.5">
            COLLECTION
          </div>
          <div className="space-y-0.5">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-all',
                  activeTab === tab.key
                    ? 'bg-secondary/70 text-foreground border border-border/30'
                    : 'text-muted-foreground/50 hover:text-foreground/80 hover:bg-secondary/30',
                )}
                data-testid={`rail-tab-${tab.key}`}
              >
                <span className={cn('flex-shrink-0 transition-colors', activeTab === tab.key ? 'text-amber-300/70' : '')}>
                  {tab.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-display font-medium leading-tight">{tab.label}</div>
                  <div className="text-[8px] text-muted-foreground/35 tracking-[0.1em] uppercase font-display">{tab.sub}</div>
                </div>
                {activeTab === tab.key && (
                  <div className="w-1 h-1 rounded-full bg-amber-400/60 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Geological periods */}
        <div>
          <div className="text-[7.5px] uppercase tracking-[0.25em] text-muted-foreground/35 font-display mb-2.5">
            GEOLOGICAL RECORD
          </div>
          <div className="space-y-1">
            {PERIOD_ORDER.filter(p => periodCounts[p] > 0).map(period => {
              const meta = PERIOD_META[period];
              return (
                <button
                  key={period}
                  onClick={() => onScrollToPeriod(period)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left hover:bg-secondary/30 transition-colors group"
                  data-testid={`rail-period-${period.toLowerCase()}`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${meta.dotColor} opacity-60`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-display text-muted-foreground/55 group-hover:text-foreground/70 transition-colors">
                      {period}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground/28 flex-shrink-0">
                    {String(periodCounts[period]).padStart(2, '0')}
                  </span>
                  <span className={`text-[7px] font-display tracking-[0.1em] flex-shrink-0 ${meta.textColor} opacity-60`}>
                    {PERIOD_META[period].range}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Archive stats */}
        <div className="rounded-lg border border-border/22 bg-secondary/15 p-3 space-y-2">
          <div className="text-[7.5px] uppercase tracking-[0.25em] text-muted-foreground/30 font-display mb-1">
            ARCHIVE STATUS
          </div>
          {[
            ['Total Specimens', String(Object.values(periodCounts).reduce((a, b) => a + b, 0))],
            ['Active Periods',  String(Object.values(periodCounts).filter(c => c > 0).length)],
            ['Collections',     '3'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground/40 font-display">{label}</span>
              <span className="text-[9px] font-mono text-amber-400/55">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ── Period Archive Row ────────────────────────────────────────────────────────

function PeriodArchiveRow({
  period, dinos, globalOffset, viewMode,
}: {
  period: string;
  dinos: typeof dinosaurs;
  globalOffset: number;
  viewMode: 'archive' | 'grid' | 'list';
}) {
  const meta = PERIOD_META[period] ?? PERIOD_META.Cretaceous;

  return (
    <div>
      {/* Period row header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${meta.dotColor} opacity-70`} />
        <span className={`text-[8px] uppercase tracking-[0.28em] font-display flex-shrink-0 ${meta.textColor}`}>
          {period.toUpperCase()}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-border/30 to-transparent min-w-[20px]" />
        <span className="text-[8px] font-mono text-muted-foreground/28 flex-shrink-0 whitespace-nowrap">
          {meta.range} · {dinos.length} SPECIMENS
        </span>
        <ChevronRight className="h-3 w-3 text-muted-foreground/20 flex-shrink-0" />
      </div>

      {/* Content: horizontal archive scroll (archive/grid) or list */}
      {viewMode === 'list' ? (
        <div className="flex flex-col gap-0.5">
          {dinos.map(d => <DinosaurListCard key={d.id} dinosaur={d} />)}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {dinos.map((d, i) => (
            <ArchiveSpecimenCard key={d.id} dinosaur={d} specimenIndex={globalOffset + i} />
          ))}
        </div>
      ) : (
        /* Archive horizontal scroll */
        <div
          className="flex gap-3 overflow-x-auto pb-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {dinos.map((d, i) => (
            <ArchiveSpecimenCard key={d.id} dinosaur={d} specimenIndex={globalOffset + i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Mobile collection tabs ────────────────────────────────────────────────────

function MobileTabs({ activeTab, onTabChange }: { activeTab: TabKey; onTabChange: (t: TabKey) => void }) {
  return (
    <div className="lg:hidden flex gap-1 bg-card/70 rounded-lg p-1 border border-border/25 mb-6">
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-display transition-all',
            activeTab === tab.key
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground/50 hover:text-foreground',
          )}
          data-testid={`tab-${tab.key}`}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
        </button>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const Index = () => {
  const [activeTab,  setActiveTab]  = useState<TabKey>('dinosaurs');
  const [direction,  setDirection]  = useState(1);
  const [viewMode,   setViewMode]   = useState<'archive' | 'grid' | 'list'>('archive');

  const periodRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Data ──────────────────────────────────────────────────────────────────
  const filteredDinos = useMemo(() => {
    if (activeTab === 'pterosaurs')      return dinosaurs.filter(d => getTaxonomyType(d) === 'pterosaur');
    if (activeTab === 'marine_reptiles') return dinosaurs.filter(d => getTaxonomyType(d) === 'marine_reptile');
    return dinosaurs.filter(d => getTaxonomyType(d) === 'dinosaur');
  }, [activeTab]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof dinosaurs> = {};
    for (const p of PERIOD_ORDER) {
      const dinos = filteredDinos.filter(d => d.period === p).sort((a, b) => a.name.localeCompare(b.name));
      if (dinos.length > 0) groups[p] = dinos;
    }
    return groups;
  }, [filteredDinos]);

  const periodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [p, ds] of Object.entries(grouped)) counts[p] = ds.length;
    return counts;
  }, [grouped]);

  const featuredDino = useMemo(() => {
    const ids = FEATURED_IDS[activeTab];
    for (const id of ids) {
      const found = filteredDinos.find(d => d.id === id);
      if (found) return found;
    }
    return filteredDinos[0] ?? null;
  }, [activeTab, filteredDinos]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleTabChange = (tab: TabKey) => {
    if (tab === activeTab) return;
    const ci = TABS.findIndex(t => t.key === activeTab);
    const ni = TABS.findIndex(t => t.key === tab);
    setDirection(ni > ci ? 1 : -1);
    setActiveTab(tab);
  };

  const scrollToPeriod = (period: string) => {
    periodRefs.current[period]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Accumulated specimen index ─────────────────────────────────────────
  let globalOffset = 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-[90px]">
      {/* Ambient background gridlines */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(251,191,36,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251,191,36,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-[1480px] mx-auto px-4 md:px-6 pb-20">
        {/* ── Two-column layout: rail + main ─────────────────────────────── */}
        <div className="flex gap-8">

          {/* ── Left archive rail ──────────────────────────────────────── */}
          <ArchiveRail
            activeTab={activeTab}
            onTabChange={handleTabChange}
            periodCounts={periodCounts}
            onScrollToPeriod={scrollToPeriod}
          />

          {/* ── Main content area ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0 pt-4">

            {/* ── Archive header (replaces centered hero) ─────────────── */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-border/20">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[7.5px] uppercase tracking-[0.3em] text-amber-400/40 font-display">
                    NATURAL HISTORY ARCHIVE
                  </span>
                  <div className="h-px w-8 bg-amber-400/20" />
                  <span className="text-[7.5px] uppercase tracking-[0.2em] text-muted-foreground/25 font-display">
                    {TABS.find(t => t.key === activeTab)?.sub.toUpperCase()} COLLECTION
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
                  Prehistoric Life Database
                </h1>
                <p className="text-xs text-muted-foreground/45 font-body mt-1">
                  {filteredDinos.length} specimens · {Object.keys(grouped).length} geological periods catalogued
                </p>
              </div>

              {/* View mode toggle (compact) */}
              <div className="flex-shrink-0 flex items-center gap-1 bg-card/70 rounded-lg p-1 border border-border/25">
                {([
                  { key: 'archive', icon: <Layers className="h-3.5 w-3.5" />, label: 'Archive' },
                  { key: 'grid',    icon: <LayoutGrid className="h-3.5 w-3.5" />, label: 'Grid' },
                  { key: 'list',    icon: <List className="h-3.5 w-3.5" />,       label: 'List' },
                ] as const).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setViewMode(opt.key)}
                    title={opt.label}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-display transition-all',
                      viewMode === opt.key
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground/40 hover:text-foreground',
                    )}
                    data-testid={`view-${opt.key}`}
                  >
                    {opt.icon}
                    <span className="hidden sm:inline text-[10px] tracking-wide">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Mobile tabs ─────────────────────────────────────────── */}
            <MobileTabs activeTab={activeTab} onTabChange={handleTabChange} />

            {/* ── Animated collection swap ─────────────────────────────── */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeTab}
                custom={direction}
                initial={d => ({ x: d > 0 ? '6%' : '-6%', opacity: 0 })}
                animate={{ x: 0, opacity: 1 }}
                exit={d => ({ x: d > 0 ? '-6%' : '6%', opacity: 0 })}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-10"
              >
                {Object.keys(grouped).length === 0 ? (
                  <div className="text-center py-24">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-display text-muted-foreground/30">
                      NO SPECIMENS CATALOGUED IN THIS COLLECTION
                    </p>
                  </div>
                ) : (
                  <>
                    {/* ── Featured exhibit ─────────────────────────────── */}
                    {featuredDino && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[7.5px] uppercase tracking-[0.28em] text-amber-400/38 font-display">EXHIBIT HIGHLIGHT</span>
                          <div className="h-px flex-1 bg-gradient-to-r from-amber-400/18 to-transparent" />
                        </div>
                        <FeaturedExhibitCard dinosaur={featuredDino} />
                      </div>
                    )}

                    {/* ── Period archive rows ───────────────────────────── */}
                    {Object.entries(grouped).map(([period, dinos]) => {
                      const offset = globalOffset;
                      globalOffset += dinos.length;
                      return (
                        <div
                          key={period}
                          ref={el => { periodRefs.current[period] = el; }}
                          className="scroll-mt-[110px]"
                        >
                          <PeriodArchiveRow
                            period={period}
                            dinos={dinos}
                            globalOffset={offset}
                            viewMode={viewMode}
                          />
                        </div>
                      );
                    })}

                    {/* ── Archive footer ──────────────────────────────── */}
                    <div className="flex items-center gap-4 pt-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/12 to-transparent" />
                      <span className="text-[7.5px] font-display uppercase tracking-[0.28em] text-amber-400/25 px-2 whitespace-nowrap">
                        END OF ARCHIVE — {filteredDinos.length} SPECIMENS
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/12 to-transparent" />
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
