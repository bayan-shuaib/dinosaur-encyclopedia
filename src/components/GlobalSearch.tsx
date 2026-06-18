import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dinosaurs } from '@/data/dinosaurs';
import { Dinosaur } from '@/data/types';
import { PERIOD_META } from '@/components/DinosaurCard';

// ── Fuzzy match engine ────────────────────────────────────────────────────────

function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 4) return 99;
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length];
}

function scoreMatch(query: string, dino: Dinosaur): number {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return 0;

  const fields: [string, number][] = [
    [dino.name,                               12],
    [dino.scientificName,                     10],
    [dino.classification.genus,                9],
    [dino.classification.family,               6],
    [dino.group,                               5],
    [dino.period,                              3],
    [dino.continent,                           2],
    [dino.diet,                               2],
    [dino.habitat,                             2],
    [dino.discovery.location,                  1],
    [dino.description.slice(0, 300),           1],
  ];

  let score = 0;
  for (const [text, weight] of fields) {
    const t = text.toLowerCase();
    if (t.startsWith(q)) { score += weight * 3; continue; }
    if (t.includes(q))   { score += weight * 2; continue; }
    const words = t.split(/[\s,().]+/);
    for (const word of words) {
      if (word.startsWith(q)) { score += weight * 2; break; }
      // Fuzzy: tolerate up to 2 edits for queries 4+ chars
      if (q.length >= 4 && word.length >= 3 && editDistance(q, word) <= 2) {
        score += weight; break;
      }
    }
  }
  return score;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GlobalSearch() {
  const [query, setQuery]     = useState('');
  const [open, setOpen]       = useState(false);
  const [focused, setFocused] = useState(0);
  const navigate   = useNavigate();
  const inputRef   = useRef<HTMLInputElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return dinosaurs
      .map(d => ({ dino: d, score: scoreMatch(query, d) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(r => r.dino);
  }, [query]);

  // Close when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Reset focus index when results change
  useEffect(() => { setFocused(0); }, [results]);

  const go = (id: string) => {
    navigate(`/dinosaur/${id}`);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)); }
    if (e.key === 'Enter' && results[focused]) { go(results[focused].id); }
    if (e.key === 'Escape')    { setOpen(false); setQuery(''); }
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={wrapRef} className="relative flex-1 max-w-xs hidden sm:block mx-4">
      {/* Input */}
      <div className={`flex items-center gap-2 px-3 py-[7px] rounded-lg border transition-all duration-200 ${
        open ? 'bg-card border-amber-500/35 shadow-[0_0_12px_rgba(251,191,36,0.06)]' : 'bg-card/40 border-border/30 hover:border-border/55'
      }`}>
        <Search className="h-3.5 w-3.5 text-muted-foreground/45 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Search taxa, genera, periods…"
          className="flex-1 min-w-0 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/30 outline-none font-body"
          data-testid="input-global-search"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="flex-shrink-0 text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1.5 z-[300] bg-card border border-border/40 rounded-lg overflow-hidden shadow-2xl shadow-black/40"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/20">
              <span className="text-[7.5px] uppercase tracking-[0.24em] text-amber-400/40 font-display">
                ARCHIVE SEARCH
              </span>
              <span className="text-[7.5px] font-mono text-muted-foreground/25">
                {results.length} {results.length === 1 ? 'RESULT' : 'RESULTS'}
              </span>
            </div>

            {results.length > 0 ? (
              <>
                {results.map((dino, i) => {
                  const period = PERIOD_META[dino.period] ?? PERIOD_META.Cretaceous;
                  return (
                    <button
                      key={dino.id}
                      onMouseEnter={() => setFocused(i)}
                      onClick={() => go(dino.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-border/10 last:border-b-0 ${
                        i === focused ? 'bg-secondary/65' : 'hover:bg-secondary/35'
                      }`}
                      data-testid={`search-result-${dino.id}`}
                    >
                      <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${period.dotColor} opacity-65`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-condensed font-bold uppercase tracking-wide text-foreground leading-tight">
                          {dino.name}
                        </p>
                        <p className="text-[9px] italic text-muted-foreground/45 font-body leading-tight truncate mt-0.5">
                          {dino.scientificName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-[6.5px] font-display uppercase tracking-[0.09em] px-1 py-[2px] rounded-sm border ${period.textColor} ${period.bgBorder}`}>
                          {dino.period.slice(0, 4).toUpperCase()}
                        </span>
                      </div>
                    </button>
                  );
                })}
                <div className="px-3 py-1.5 border-t border-border/15">
                  <p className="text-[8px] text-muted-foreground/22 font-body">
                    Searching name, genus, family, group, period, continent, diet, habitat
                  </p>
                </div>
              </>
            ) : (
              <div className="px-4 py-5 text-center">
                <p className="text-[9px] font-display uppercase tracking-[0.2em] text-muted-foreground/28">
                  NO TAXA FOUND
                </p>
                <p className="text-[8px] text-muted-foreground/18 font-body mt-1.5">
                  Try a different name, genus, or period
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
