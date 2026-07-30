import { useState, useMemo, useRef } from 'react';
import { dinosaurs } from '@/data/dinosaurs';
import { ArchiveSpecimenCard, DinosaurListCard, FeaturedExhibitCard, PERIOD_META } from '@/components/DinosaurCard';
import { cn } from '@/lib/utils';
import { Period } from '@/data/types';
import { AnimatePresence, motion } from 'framer-motion';
import { getTaxonomyType } from '@/lib/taxonomy';
import { MuseumEntrance } from '@/components/MuseumEntrance';
import { Layers, Wind, Waves, ChevronRight, LayoutGrid, List } from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────

const PERIOD_ORDER: Period[] = ['Permian', 'Triassic', 'Jurassic', 'Cretaceous'];

type TabKey = 'dinosaurs' | 'pterosaurs' | 'marine_reptiles';

const TABS: { key: TabKey; label: string; sub: string; numeral: string; blurb: string; icon: React.ReactNode }[] = [
  { key: 'dinosaurs',       label: 'Dinosaurs',       sub: 'Terrestrial',  numeral: 'I',   blurb: 'The great land-dwelling archosaurs that ruled the continents across three geological periods.',  icon: <Layers className="h-3.5 w-3.5" /> },
  { key: 'pterosaurs',      label: 'Pterosaurs',       sub: 'Aerial',       numeral: 'II',  blurb: 'The first vertebrates to master powered flight, soaring over the ancient skies of the Mesozoic.', icon: <Wind className="h-3.5 w-3.5" /> },
  { key: 'marine_reptiles', label: 'Marine Reptiles',  sub: 'Aquatic',      numeral: 'III', blurb: 'Reptilian lineages that returned to the water and rose to dominate the prehistoric seas.',        icon: <Waves className="h-3.5 w-3.5" /> },
];

const FEATURED_IDS: Record<TabKey, string[]> = {
  dinosaurs:       ['tyrannosaurus-rex', 'spinosaurus', 'triceratops'],
  pterosaurs:      ['pteranodon', 'quetzalcoatlus'],
  marine_reptiles: ['mosasaurus', 'plesiosaurus'],
};

// Marine clade descriptions for reorganized view
const MARINE_CLADE_INFO: Record<string, { desc: string; color: string; textColor: string; dotColor: string }> = {
  Mosasaurs:    { desc: 'Predatory varanoid lizards that dominated Late Cretaceous seas. Related to modern monitor lizards.', color: 'bg-blue-500/8 border-blue-500/20',    textColor: 'text-blue-400/70',    dotColor: 'bg-blue-400'    },
  Ichthyosaurs: { desc: 'Dolphin-shaped reptiles with fully aquatic lifestyles. Gave birth to live young at sea.',            color: 'bg-teal-500/8 border-teal-500/20',   textColor: 'text-teal-400/70',   dotColor: 'bg-teal-400'   },
  Plesiosaurs:  { desc: 'Four-flippered marine reptiles — long-necked forms and short-necked pliosaurs.',                    color: 'bg-cyan-500/8 border-cyan-500/20',   textColor: 'text-cyan-400/70',   dotColor: 'bg-cyan-400'   },
  Pliosaurids:  { desc: 'Large-skulled, short-necked apex marine predators. Closely related to plesiosaurs.',                color: 'bg-violet-500/8 border-violet-500/20', textColor: 'text-violet-400/70', dotColor: 'bg-violet-400' },
};

const DIET_STYLE: Record<string, string> = {
  Carnivore:   'bg-red-500/10 text-red-400/75 border-red-500/22',
  Herbivore:   'bg-green-500/10 text-green-400/75 border-green-500/22',
  Omnivore:    'bg-yellow-500/10 text-yellow-400/75 border-yellow-500/22',
  Piscivore:   'bg-blue-500/10 text-blue-400/75 border-blue-500/22',
  Insectivore: 'bg-violet-500/10 text-violet-400/75 border-violet-500/22',
};

// ── Archive Rail ─────────────────────────────────────────────────────────────

function ArchiveRail({
  activeTab, onTabChange, groupCounts, onScrollToGroup, totalTaxa,
}: {
  activeTab: TabKey;
  onTabChange: (t: TabKey) => void;
  groupCounts: Record<string, number>;
  onScrollToGroup: (g: string) => void;
  totalTaxa: number;
}) {
  const isMarine = activeTab === 'marine_reptiles';

  return (
    <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 select-none">
      <div className="sticky top-[100px] flex flex-col gap-6">
        {/* Directory title */}
        <div className="pb-4 border-b border-border/25">
          <div className="text-[7.5px] uppercase tracking-[0.32em] text-amber-400/45 font-display mb-1.5">Museum Directory</div>
          <div className="text-[12px] font-display font-semibold text-foreground/85 tracking-wide">Floor Guide</div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400/60 animate-pulse" />
            <span className="text-[8px] font-mono text-muted-foreground/35 tracking-[0.12em]">GALLERIES OPEN</span>
          </div>
        </div>

        {/* Wings / collections */}
        <div>
          <div className="text-[7.5px] uppercase tracking-[0.25em] text-muted-foreground/35 font-display mb-2.5">Wings</div>
          <div className="space-y-0.5">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  'group/wing w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-all',
                  activeTab === tab.key
                    ? 'bg-secondary/70 text-foreground border border-border/30'
                    : 'text-muted-foreground/50 hover:text-foreground/80 hover:bg-secondary/30 border border-transparent',
                )}
                data-testid={`rail-tab-${tab.key}`}
              >
                <span className={cn(
                  'flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full border text-[8px] font-display transition-colors',
                  activeTab === tab.key
                    ? 'border-amber-400/40 text-amber-300/80'
                    : 'border-border/40 text-muted-foreground/45 group-hover/wing:border-amber-400/25 group-hover/wing:text-amber-300/60',
                )}>
                  {tab.numeral}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-display font-medium leading-tight">{tab.label}</div>
                  <div className="text-[8px] text-muted-foreground/35 tracking-[0.1em] uppercase font-display">{tab.sub} Wing</div>
                </div>
                {activeTab === tab.key && <div className="w-1 h-1 rounded-full bg-amber-400/60 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Geological / Taxonomic navigation */}
        <div>
          <div className="text-[7.5px] uppercase tracking-[0.25em] text-muted-foreground/35 font-display mb-2.5">
            {isMarine ? 'Taxonomic Groups' : 'Geological Record'}
          </div>
          <div className="space-y-1">
            {Object.entries(groupCounts).map(([key, count]) => {
              const meta = isMarine
                ? (MARINE_CLADE_INFO[key] ?? { textColor: 'text-muted-foreground/55', dotColor: 'bg-muted-foreground' })
                : (PERIOD_META[key] ?? PERIOD_META.Cretaceous);
              return (
                <button
                  key={key}
                  onClick={() => onScrollToGroup(key)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left hover:bg-secondary/30 transition-colors group"
                  data-testid={`rail-group-${key.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${meta.dotColor} opacity-60`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-display text-muted-foreground/55 group-hover:text-foreground/70 transition-colors leading-tight">
                      {key}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground/28 flex-shrink-0">
                    {String(count).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Archive stats */}
        <div className="rounded-lg border border-border/22 bg-secondary/15 p-3 space-y-2">
          <div className="text-[7.5px] uppercase tracking-[0.25em] text-muted-foreground/30 font-display mb-1">Wing Summary</div>
          {[
            ['Specimens',  String(totalTaxa)],
            ['Sections',   String(Object.keys(groupCounts).length)],
            ['Wings',      '3'],
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

// ── Group Archive Row ─────────────────────────────────────────────────────────

function GroupArchiveRow({
  groupKey, dinos, globalOffset, viewMode, isClade,
}: {
  groupKey: string;
  dinos: typeof dinosaurs;
  globalOffset: number;
  viewMode: 'archive' | 'grid' | 'list';
  isClade: boolean;
}) {
  const periodMeta = PERIOD_META[groupKey];
  const cladeMeta  = MARINE_CLADE_INFO[groupKey];

  const textColor = isClade
    ? (cladeMeta?.textColor ?? 'text-muted-foreground/60')
    : (periodMeta?.textColor ?? 'text-amber-400/70');
  const dotColor  = isClade
    ? (cladeMeta?.dotColor ?? 'bg-muted-foreground')
    : (periodMeta?.dotColor ?? 'bg-amber-400');
  const rangeLabel = isClade ? '' : (periodMeta?.range ?? '');

  return (
    <div>
      {/* Vitrine label */}
      <div className="space-y-2 mb-5">
        <div className="flex items-baseline gap-3">
          <div className={`h-2 w-2 rounded-full flex-shrink-0 self-center ${dotColor} opacity-75`} />
          <h3 className={`text-base md:text-lg font-display font-bold tracking-wide flex-shrink-0 ${textColor}`}>
            {groupKey}
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-border/35 to-transparent min-w-[20px] self-center" />
          <span className="text-[8px] font-mono text-muted-foreground/32 flex-shrink-0 whitespace-nowrap uppercase tracking-[0.12em]">
            {rangeLabel && `${rangeLabel} · `}{String(dinos.length).padStart(2, '0')} specimens
          </span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/20 flex-shrink-0 self-center" />
        </div>
        {/* Clade description for marine groups */}
        {isClade && cladeMeta?.desc && (
          <p className="text-[10px] text-muted-foreground/38 font-body leading-relaxed pl-5 max-w-2xl">
            {cladeMeta.desc}
          </p>
        )}
      </div>

      {/* Content */}
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
        <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
          {dinos.map((d, i) => (
            <ArchiveSpecimenCard key={d.id} dinosaur={d} specimenIndex={globalOffset + i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Mobile tabs ───────────────────────────────────────────────────────────────

function MobileTabs({ activeTab, onTabChange }: { activeTab: TabKey; onTabChange: (t: TabKey) => void }) {
  return (
    <div className="lg:hidden flex gap-1 bg-card/70 rounded-lg p-1 border border-border/25 mb-6">
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-display transition-all',
            activeTab === tab.key ? 'bg-secondary text-foreground' : 'text-muted-foreground/50 hover:text-foreground',
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
  const [dietFilter, setDietFilter] = useState<string | null>(null);

  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const archiveRef = useRef<HTMLDivElement | null>(null);

  // ── Entrance stats & gallery counts ────────────────────────────────────────
  const galleryCounts = useMemo(() => ({
    dinosaurs:       dinosaurs.filter(d => getTaxonomyType(d) === 'dinosaur').length,
    pterosaurs:      dinosaurs.filter(d => getTaxonomyType(d) === 'pterosaur').length,
    marine_reptiles: dinosaurs.filter(d => getTaxonomyType(d) === 'marine_reptile').length,
  }), []);

  const entranceStats = useMemo(() => ({
    total:      dinosaurs.length,
    periods:    new Set(dinosaurs.map(d => d.period)).size,
    continents: new Set(dinosaurs.map(d => d.continent)).size,
  }), []);

  // ── Data ──────────────────────────────────────────────────────────────────
  const filteredDinos = useMemo(() => {
    if (activeTab === 'pterosaurs')      return dinosaurs.filter(d => getTaxonomyType(d) === 'pterosaur');
    if (activeTab === 'marine_reptiles') return dinosaurs.filter(d => getTaxonomyType(d) === 'marine_reptile');
    return dinosaurs.filter(d => getTaxonomyType(d) === 'dinosaur');
  }, [activeTab]);

  // Unique diets in this collection (for filter chips)
  const uniqueDiets = useMemo(() => {
    const s = new Set(filteredDinos.map(d => d.diet));
    return Array.from(s).sort();
  }, [filteredDinos]);

  // Apply diet filter
  const displayDinos = useMemo(() => {
    if (!dietFilter) return filteredDinos;
    return filteredDinos.filter(d => d.diet === dietFilter);
  }, [filteredDinos, dietFilter]);

  // Group by period OR by taxonomic group (marine reptiles)
  const isMarine = activeTab === 'marine_reptiles';
  const grouped = useMemo(() => {
    const groups: Record<string, typeof dinosaurs> = {};
    if (isMarine) {
      for (const dino of displayDinos) {
        const g = dino.group as string;
        if (!groups[g]) groups[g] = [];
        groups[g].push(dino);
      }
      for (const g of Object.keys(groups)) {
        groups[g].sort((a, b) => a.name.localeCompare(b.name));
      }
    } else {
      for (const p of PERIOD_ORDER) {
        const dinos = displayDinos.filter(d => d.period === p).sort((a, b) => a.name.localeCompare(b.name));
        if (dinos.length > 0) groups[p] = dinos;
      }
    }
    return groups;
  }, [isMarine, displayDinos]);

  const groupCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const [k, v] of Object.entries(grouped)) c[k] = v.length;
    return c;
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
    setDietFilter(null);
  };

  const scrollToGroup = (key: string) => {
    groupRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectGallery = (tab: TabKey) => {
    handleTabChange(tab);
    archiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeWing = TABS.find(t => t.key === activeTab) ?? TABS[0];

  let globalOffset = 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-[99px]">
      {/* Ambient scientific gridlines */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `linear-gradient(rgba(251,191,36,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.8) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          zIndex: 0,
        }}
      />

      {/* ── Museum entrance hall ─────────────────────────────────────────── */}
      <MuseumEntrance
        activeTab={activeTab}
        onSelectGallery={handleSelectGallery}
        counts={galleryCounts}
        stats={entranceStats}
      />

      <div ref={archiveRef} className="relative z-10 max-w-[1480px] mx-auto px-4 md:px-6 pb-20 pt-6 scroll-mt-[99px]">
        <div className="flex gap-10">

          {/* ── Archive rail ───────────────────────────────────────────── */}
          <ArchiveRail
            activeTab={activeTab}
            onTabChange={handleTabChange}
            groupCounts={groupCounts}
            onScrollToGroup={scrollToGroup}
            totalTaxa={filteredDinos.length}
          />

          {/* ── Main content ────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 pt-4">

            {/* ── Gallery wing threshold ──────────────────────────────── */}
            <div className="mb-9 pb-7 border-b border-border/20">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-[7.5px] uppercase tracking-[0.34em] text-amber-400/45 font-display">
                  Now Entering
                </span>
                <span className="h-px w-8 bg-amber-400/25" />
                <span className="text-[7.5px] uppercase tracking-[0.22em] text-muted-foreground/30 font-display">
                  Gallery {activeWing.numeral}
                </span>
              </div>

              <div className="flex items-end justify-between gap-6 flex-wrap">
                <div className="min-w-0">
                  <h2 className="text-3xl md:text-[42px] font-display font-bold text-foreground tracking-tight leading-[0.95] text-balance">
                    The {activeWing.sub} Wing
                  </h2>
                  <p className="mt-2.5 text-xs md:text-[13px] text-muted-foreground/55 font-body leading-relaxed max-w-md text-pretty">
                    {activeWing.blurb}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-[9px] font-mono uppercase tracking-[0.16em] text-muted-foreground/40">
                    <span className="text-amber-400/55">{String(filteredDinos.length).padStart(2, '0')} specimens</span>
                    <span className="h-2.5 w-px bg-border/40" />
                    <span>{String(Object.keys(grouped).length).padStart(2, '0')} {isMarine ? 'clades' : 'periods'}</span>
                  </div>
                </div>

                {/* Display-mode selector */}
                <div className="flex-shrink-0">
                  <div className="text-[7px] uppercase tracking-[0.26em] text-muted-foreground/30 font-display mb-1.5 text-right">
                    Display Mode
                  </div>
                  <div className="flex items-center gap-1 bg-card/60 rounded-lg p-1 border border-border/25">
                    {([
                      { key: 'archive' as const, icon: <Layers className="h-3.5 w-3.5" />,    label: 'Vitrine' },
                      { key: 'grid'    as const, icon: <LayoutGrid className="h-3.5 w-3.5" />, label: 'Grid' },
                      { key: 'list'    as const, icon: <List className="h-3.5 w-3.5" />,       label: 'Ledger' },
                    ]).map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setViewMode(opt.key)}
                        title={opt.label}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-display transition-all',
                          viewMode === opt.key ? 'bg-secondary text-foreground' : 'text-muted-foreground/40 hover:text-foreground',
                        )}
                        data-testid={`view-${opt.key}`}
                      >
                        {opt.icon}
                        <span className="hidden sm:inline text-[10px] tracking-wide">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile tabs */}
            <MobileTabs activeTab={activeTab} onTabChange={handleTabChange} />

            {/* ── Diet filter chips ───────────────────────────────────── */}
            {uniqueDiets.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-8" style={{ scrollbarWidth: 'none' }}>
                <span className="text-[7.5px] uppercase tracking-[0.26em] text-amber-400/40 font-display whitespace-nowrap flex-shrink-0">
                  Curate by Diet
                </span>
                <span className="h-3 w-px bg-border/40 flex-shrink-0" />
                <button
                  onClick={() => setDietFilter(null)}
                  className={`text-[8px] font-display uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-md border whitespace-nowrap flex-shrink-0 transition-all ${
                    !dietFilter
                      ? 'bg-secondary text-foreground border-border/40'
                      : 'text-muted-foreground/38 border-border/18 hover:text-foreground hover:border-border/40'
                  }`}
                  data-testid="filter-all"
                >
                  All Taxa
                </button>
                {uniqueDiets.map(diet => (
                  <button
                    key={diet}
                    onClick={() => setDietFilter(dietFilter === diet ? null : diet)}
                    className={`text-[8px] font-display uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-md border whitespace-nowrap flex-shrink-0 transition-all ${
                      dietFilter === diet
                        ? (DIET_STYLE[diet] ?? 'bg-secondary text-foreground border-border/40')
                        : 'text-muted-foreground/38 border-border/18 hover:text-foreground hover:border-border/40'
                    }`}
                    data-testid={`filter-diet-${diet.toLowerCase()}`}
                  >
                    {diet}
                  </button>
                ))}
                {dietFilter && (
                  <span className="text-[8px] text-muted-foreground/28 font-body ml-1 whitespace-nowrap flex-shrink-0">
                    {displayDinos.length} of {filteredDinos.length} taxa shown
                  </span>
                )}
              </div>
            )}

            {/* ── Animated collection swap ─────────────────────────────── */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeTab}
                custom={direction}
                initial={d => ({ x: d > 0 ? '6%' : '-6%', opacity: 0 })}
                animate={{ x: 0, opacity: 1 }}
                exit={d => ({ x: d > 0 ? '-6%' : '6%', opacity: 0 })}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-14"
              >
                {Object.keys(grouped).length === 0 ? (
                  <div className="text-center py-24">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-display text-muted-foreground/28">
                      {dietFilter
                        ? `NO ${dietFilter.toUpperCase()} TAXA IN THIS COLLECTION`
                        : 'NO TAXA CATALOGUED IN THIS COLLECTION'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Featured exhibit — always shows from full collection */}
                    {featuredDino && !dietFilter && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400/50 flex-shrink-0" />
                          <span className="text-[8px] uppercase tracking-[0.3em] text-amber-400/45 font-display whitespace-nowrap">
                            Centre of the Gallery
                          </span>
                          <div className="h-px flex-1 bg-gradient-to-r from-amber-400/22 to-transparent" />
                          <span className="text-[7.5px] uppercase tracking-[0.2em] text-muted-foreground/28 font-display whitespace-nowrap">
                            Featured Exhibit
                          </span>
                        </div>
                        <FeaturedExhibitCard dinosaur={featuredDino} />
                      </div>
                    )}

                    {/* Marine clade context block */}
                    {isMarine && !dietFilter && (
                      <div className="rounded-lg border border-border/22 bg-secondary/10 px-4 py-3">
                        <p className="text-[7.5px] uppercase tracking-[0.22em] text-muted-foreground/30 font-display mb-1.5">CLASSIFICATION NOTE</p>
                        <p className="text-[10px] text-muted-foreground/50 font-body leading-relaxed">
                          Marine reptiles are organized by taxonomic lineage rather than geological period.
                          Each group represents a distinct evolutionary origin — convergently adapted to aquatic life.
                        </p>
                      </div>
                    )}

                    {/* Group rows */}
                    {Object.entries(grouped).map(([key, dinos]) => {
                      const offset = globalOffset;
                      globalOffset += dinos.length;
                      return (
                        <div
                          key={key}
                          ref={el => { groupRefs.current[key] = el; }}
                          className="scroll-mt-[110px]"
                        >
                          <GroupArchiveRow
                            groupKey={key}
                            dinos={dinos}
                            globalOffset={offset}
                            viewMode={viewMode}
                            isClade={isMarine}
                          />
                        </div>
                      );
                    })}

                    {/* Archive footer */}
                    <div className="flex items-center gap-4 pt-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/12 to-transparent" />
                      <span className="text-[7.5px] font-display uppercase tracking-[0.28em] text-amber-400/25 px-2 whitespace-nowrap">
                        END OF ARCHIVE — {filteredDinos.length} TAXA
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
