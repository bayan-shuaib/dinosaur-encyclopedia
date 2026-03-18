import { useState, useMemo, useRef } from 'react';
import { dinosaurs } from '@/data/dinosaurs';
import { DinosaurGridCard, DinosaurListCard } from '@/components/DinosaurCard';
import { ChevronDown, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Period, DinosaurGroup } from '@/data/types';
import { AnimatePresence, motion } from 'framer-motion';

const periodOrder: Period[] = ['Permian', 'Triassic', 'Jurassic', 'Cretaceous'];

type TabKey = 'dinosaurs' | 'pterosaurs' | 'archosaurs';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'dinosaurs', label: 'Dinosaurs' },
  { key: 'pterosaurs', label: 'Pterosaurs' },
  { key: 'archosaurs', label: 'Archosaurs' },
];

const pterosaurGroups: DinosaurGroup[] = ['Pterosaurs'];
const archosaurGroups: DinosaurGroup[] = ['Phytosaurs', 'Rauisuchians', 'Crocodylomorphs'];

const Index = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [collapsedPeriods, setCollapsedPeriods] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabKey>('dinosaurs');
  const [direction, setDirection] = useState(1);

  const filteredDinos = useMemo(() => {
    if (activeTab === 'pterosaurs') {
      return dinosaurs.filter(d => pterosaurGroups.includes(d.group));
    }
    if (activeTab === 'archosaurs') {
      return dinosaurs.filter(d => archosaurGroups.includes(d.group));
    }
    // Dinosaurs: exclude pterosaurs and archosaurs
    return dinosaurs.filter(d => !pterosaurGroups.includes(d.group) && !archosaurGroups.includes(d.group));
  }, [activeTab]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof dinosaurs> = {};
    for (const period of periodOrder) {
      const dinos = filteredDinos
        .filter(d => d.period === period)
        .sort((a, b) => a.name.localeCompare(b.name));
      if (dinos.length > 0) groups[period] = dinos;
    }
    return groups;
  }, [filteredDinos]);

  const togglePeriod = (period: string) => {
    setCollapsedPeriods(prev => {
      const next = new Set(prev);
      if (next.has(period)) next.delete(period);
      else next.add(period);
      return next;
    });
  };

  const handleTabChange = (tab: TabKey) => {
    if (tab === activeTab) return;
    const currentIndex = tabs.findIndex(t => t.key === activeTab);
    const nextIndex = tabs.findIndex(t => t.key === tab);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setActiveTab(tab);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      scale: 0.82,
      opacity: 0,
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      scale: 0.82,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen pt-[90px]">
      {/* Hero */}
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 tracking-tight">
          Tap a thumbnail to learn more
        </h1>
        <p className="text-base text-muted-foreground font-body max-w-xl mx-auto">
          Explore the largest and most accurate dinosaur encyclopedia with 3D models, facts and interesting info.
        </p>
      </section>

      {/* Content */}
      <section className="max-w-[1400px] mx-auto px-6 pb-20">
        {/* Selector tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  'px-5 py-2 rounded-md text-sm font-display transition-all duration-200',
                  activeTab === tab.key
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 mb-6 bg-card rounded-lg p-1 w-fit">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-display transition-all',
              viewMode === 'grid'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-display transition-all',
              viewMode === 'list'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="h-4 w-4" />
            List
          </button>
        </div>

        {/* Animated grid swap */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              {Object.keys(grouped).length === 0 ? (
                <p className="text-center text-muted-foreground font-body py-16">
                  No species found in this category.
                </p>
              ) : (
                Object.entries(grouped).map(([period, dinos]) => {
                  const isCollapsed = collapsedPeriods.has(period);
                  return (
                    <div key={period} className="mb-2">
                      <button
                        onClick={() => togglePeriod(period)}
                        className="period-header w-full"
                      >
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            isCollapsed && '-rotate-90'
                          )}
                        />
                        {period}
                      </button>

                      {!isCollapsed && (
                        <div
                          className={cn(
                            viewMode === 'grid'
                              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 py-4'
                              : 'flex flex-col gap-1 py-2'
                          )}
                        >
                          {dinos.map((dino) =>
                            viewMode === 'grid' ? (
                              <DinosaurGridCard key={dino.id} dinosaur={dino} />
                            ) : (
                              <DinosaurListCard key={dino.id} dinosaur={dino} />
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default Index;
