import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { dinosaurs, getDinosaurById } from '@/data/dinosaurs';
import { Dinosaur } from '@/data/types';
import { X, Search, Plus, ArrowLeft, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CompareLoading from '@/components/CompareLoading';
import FieldReport from '@/components/compare/FieldReport';
import AnalyticalLab from '@/components/compare/AnalyticalLab';
import VisualExhibit from '@/components/compare/VisualExhibit';

const DEFAULT_IDS = ['tyrannosaurus-rex', 'velociraptor', 'triceratops'];

const PAGES = [
  { key: 'field-report', label: 'Field Report' },
  { key: 'analytical-lab', label: 'Analytical Lab' },
  { key: 'visual-exhibit', label: 'Visual Exhibit' },
] as const;

export const COLORS = [
  'hsl(0, 70%, 55%)',
  'hsl(210, 70%, 55%)',
  'hsl(142, 50%, 45%)',
  'hsl(45, 80%, 55%)',
];

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('ids');

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialId) return [initialId];
    return DEFAULT_IDS;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [comparisonStarted, setComparisonStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Reset comparison when species change
  useEffect(() => {
    setComparisonStarted(false);
    setLoading(false);
  }, [selectedIds]);

  const selected = useMemo(
    () => selectedIds.map(id => getDinosaurById(id)).filter(Boolean) as Dinosaur[],
    [selectedIds]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return dinosaurs.filter(d => !selectedIds.includes(d.id)).slice(0, 12);
    const q = searchQuery.toLowerCase();
    return dinosaurs.filter(
      d => (d.name.toLowerCase().includes(q) || d.scientificName.toLowerCase().includes(q)) && !selectedIds.includes(d.id)
    ).slice(0, 8);
  }, [searchQuery, selectedIds]);

  const addDino = (id: string) => {
    if (selectedIds.length >= 4 || selectedIds.includes(id)) return;
    setSelectedIds(prev => [...prev, id]);
    setSearchQuery('');
    setShowSearch(false);
  };

  const removeDino = (id: string) => {
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  const goToPage = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= PAGES.length) return;
    setDirection(newIndex > pageIndex ? 1 : -1);
    setPageIndex(newIndex);
  }, [pageIndex]);

  const handleStartComparison = () => {
    setLoading(true);
    setComparisonStarted(true);
  };

  const handleLoadComplete = useCallback(() => {
    setLoading(false);
  }, []);

  const pageVariants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? '100%' : '-100%',
      scale: 0.92,
      opacity: 0,
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir >= 0 ? '-30%' : '30%',
      scale: 0.82,
      opacity: 0,
    }),
  };

  const hasEnough = selected.length >= 2;
  const showResults = hasEnough && comparisonStarted && !loading;

  return (
    <div className="compare-page min-h-screen pt-[90px] font-body">
      <AnimatePresence>
        {loading && <CompareLoading onComplete={handleLoadComplete} />}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to encyclopedia
          </Link>
          <h1 className="text-3xl md:text-4xl font-medium text-foreground uppercase tracking-[0.06em]">
            Compare Dinosaurs
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Select 2–4 species to compare side-by-side</p>
        </div>

        {/* Selection bar */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {selected.map((dino, i) => (
            <div key={dino.id} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-sm text-foreground">{dino.name}</span>
              <button onClick={() => removeDino(dino.id)} className="text-muted-foreground hover:text-foreground ml-1">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {selectedIds.length < 4 && (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" /> Add species
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {showSearch && (
          <div className="mb-8 info-panel max-w-md">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search species..."
                className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground"
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {searchResults.map(d => (
                <button
                  key={d.id}
                  onClick={() => addDino(d.id)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm text-foreground transition-colors"
                >
                  {d.name} <span className="text-muted-foreground italic ml-1">({d.period})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!hasEnough && (
          <div className="text-center py-20 text-muted-foreground">
            Select at least 2 species to begin comparing.
          </div>
        )}

        {/* START COMPARISON button */}
        {hasEnough && !comparisonStarted && (
          <div className="flex justify-center py-20">
            <motion.button
              onClick={handleStartComparison}
              className="group relative flex items-center gap-3 px-10 py-5 rounded-xl border border-border bg-card text-foreground uppercase tracking-[0.2em] text-sm font-medium transition-all hover:border-accent hover:shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                boxShadow: '0 0 30px hsl(var(--accent) / 0.08)',
              }}
            >
              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ boxShadow: '0 0 20px hsl(var(--accent) / 0.15), inset 0 0 20px hsl(var(--accent) / 0.05)' }}
              />
              <Play className="h-5 w-5 text-accent" />
              <span>Start Comparison</span>
            </motion.button>
          </div>
        )}

        {showResults && (
          <>
            {/* Page navigation tabs */}
            <div className="flex items-center gap-1 mb-8 border-b border-border pb-3">
              <button
                onClick={() => goToPage(pageIndex - 1)}
                disabled={pageIndex === 0}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors mr-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {PAGES.map((page, i) => (
                <button
                  key={page.key}
                  onClick={() => goToPage(i)}
                  className={`px-5 py-2 rounded-md text-xs uppercase tracking-[0.18em] font-medium transition-all ${
                    i === pageIndex
                      ? 'bg-card border border-border text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {page.label}
                </button>
              ))}

              <button
                onClick={() => goToPage(pageIndex + 1)}
                disabled={pageIndex === PAGES.length - 1}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors ml-2"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Page content with panel-swap transitions */}
            <div className="relative overflow-hidden" style={{ minHeight: 600 }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={pageIndex}
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  {pageIndex === 0 && <FieldReport dinosaurs={selected} />}
                  {pageIndex === 1 && <AnalyticalLab dinosaurs={selected} />}
                  {pageIndex === 2 && <VisualExhibit dinosaurs={selected} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
