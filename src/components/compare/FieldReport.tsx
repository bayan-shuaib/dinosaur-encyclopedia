import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dinosaur } from '@/data/types';
import { Trophy, Ruler, Weight as WeightIcon, Wind } from 'lucide-react';
import { COLORS } from '@/pages/ComparePage';
import { getTaxonomyType, getTaxonomyLabel, formatWeight } from '@/lib/taxonomy';

interface Props {
  dinosaurs: Dinosaur[];
}

const wingspanOf = (d: Dinosaur) => d.wingspan ?? d.length;
const depthOf    = (d: Dinosaur) => d.bodyDepth ?? d.height;

export default function FieldReport({ dinosaurs }: Props) {
  const types = dinosaurs.map(getTaxonomyType);
  const hasPterosaur     = types.includes('pterosaur');
  const hasMarineReptile = types.includes('marine_reptile');
  const hasDinosaur      = types.includes('dinosaur');

  const largest  = useMemo(() => dinosaurs.reduce((a, b) => a.length > b.length ? a : b), [dinosaurs]);
  const heaviest = useMemo(() => dinosaurs.reduce((a, b) => a.weight > b.weight ? a : b), [dinosaurs]);
  const tallest  = useMemo(() => dinosaurs.reduce((a, b) => a.height > b.height ? a : b), [dinosaurs]);
  const widestWing = useMemo(() => {
    const pteros = dinosaurs.filter(d => getTaxonomyType(d) === 'pterosaur');
    if (pteros.length === 0) return null;
    return pteros.reduce((a, b) => wingspanOf(a) > wingspanOf(b) ? a : b);
  }, [dinosaurs]);

  const awards = [
    { icon: Trophy, label: 'Longest Specimen', dino: largest, stat: `${largest.length}m` },
    { icon: WeightIcon, label: 'Heaviest Specimen', dino: heaviest, stat: formatWeight(heaviest.weight) },
    widestWing
      ? { icon: Wind, label: 'Largest Wingspan', dino: widestWing, stat: `${wingspanOf(widestWing)}m` }
      : { icon: Ruler, label: 'Tallest Specimen', dino: tallest, stat: `${tallest.height}m` },
  ];

  // Build rows dynamically based on taxonomies present
  const tableRows = useMemo(() => {
    const rows: { label: string; fn: (d: Dinosaur) => React.ReactNode }[] = [
      { label: 'Scientific Name', fn: d => <em className="text-foreground/60">{d.scientificName}</em> },
      { label: 'Taxonomy',        fn: d => getTaxonomyLabel(getTaxonomyType(d)) },
      { label: 'Period',          fn: d => d.period },
      { label: 'Diet',            fn: d => d.diet },
      { label: 'Length',          fn: d => `${d.length} m` },
    ];

    if (hasPterosaur) {
      rows.push({
        label: 'Wingspan',
        fn: d => getTaxonomyType(d) === 'pterosaur' ? `${wingspanOf(d)} m` : '—',
      });
    }
    if (hasDinosaur) {
      rows.push({
        label: 'Height',
        fn: d => getTaxonomyType(d) === 'dinosaur' ? `${d.height} m` : '—',
      });
    }
    if (hasMarineReptile) {
      rows.push({
        label: 'Body Depth',
        fn: d => getTaxonomyType(d) === 'marine_reptile' ? `${depthOf(d)} m` : '—',
      });
    }

    rows.push(
      { label: 'Weight',         fn: d => formatWeight(d.weight) },
      { label: 'Habitat',        fn: d => d.habitat.split('.')[0] },
      { label: 'Discovery',      fn: d => `${d.discovery.year} — ${d.discovery.location}` },
      { label: 'Continent',      fn: d => d.continent },
      { label: 'Classification', fn: d => d.classification.family },
      { label: 'Notable Traits', fn: d => d.distinctFeatures[0] || '—' },
    );
    return rows;
  }, [hasPterosaur, hasDinosaur, hasMarineReptile]);

  return (
    <div>
      <h2 className="text-2xl font-medium uppercase tracking-[0.12em] text-foreground mb-8">Field Report</h2>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-8">
        {/* Left — Comparison Table */}
        <section className="info-panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 text-muted-foreground font-normal text-xs uppercase tracking-[0.12em]">Attribute</th>
                {dinosaurs.map((d, i) => (
                  <th key={d.id} className="text-left py-3 px-3 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="font-semibold text-foreground">{d.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map(row => (
                <tr key={row.label} className="border-b border-border/30 group transition-colors hover:bg-secondary/30">
                  <td className="py-3 pr-4 text-muted-foreground text-xs uppercase tracking-[0.12em]">{row.label}</td>
                  {dinosaurs.map(d => (
                    <td key={d.id} className="py-3 px-3 text-sm text-foreground/80">{row.fn(d)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Right — Award Cards */}
        <div className="flex flex-col gap-4">
          {awards.map((award, i) => (
            <motion.div
              key={award.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 * i, duration: 0.4, ease: 'easeOut' }}
              className="relative rounded-xl p-5 border border-border/40 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%)',
                boxShadow: '0 0 20px hsl(var(--accent) / 0.06), inset 0 1px 0 hsl(0 0% 100% / 0.04)',
              }}
            >
              {/* Glassmorphism shine */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              
              {/* Subtle glowing border accent */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 0 1px hsl(var(--accent) / 0.1), 0 0 15px hsl(var(--accent) / 0.04)`,
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <award.icon className="h-4 w-4 text-accent" />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">{award.label}</span>
                </div>
                <p className="text-lg font-semibold text-foreground">{award.dino.name}</p>
                <p className="text-2xl font-bold text-accent mt-1">{award.stat}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
