import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen } from 'lucide-react';
import { Dinosaur } from '@/data/types';
import { DICTIONARY, DictionaryEntry, DictionaryCategory } from '@/data/scientificDictionary';
import { Section } from '@/components/SpeciesContent';

interface Props {
  dino:     Dinosaur;
  mode:     'life' | 'scientific';
  sections: Section[];
}

// ── Category styling ──────────────────────────────────────────────────────────

const CATEGORY_META: Record<DictionaryCategory, { label: string; color: string }> = {
  anatomy:      { label: 'Anatomy',       color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  taxonomy:     { label: 'Taxonomy',      color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  behavior:     { label: 'Behavior',      color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  ecology:      { label: 'Ecology',       color: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
  paleontology: { label: 'Paleontology',  color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
};

// ── Term detection ────────────────────────────────────────────────────────────

function detectTerms(sections: Section[], dino: Dinosaur): DictionaryEntry[] {
  // Build a corpus from all section titles + bodies + the dino's own text fields
  const corpus = [
    ...sections.map(s => s.title + ' ' + s.body),
    dino.description,
    dino.habitat,
    dino.group,
    dino.classification.order,
    dino.classification.family,
    ...dino.distinctFeatures,
  ].join(' ').toLowerCase();

  return DICTIONARY.filter(entry =>
    entry.triggers.some(t => corpus.includes(t.toLowerCase()))
  );
}

// ── Species relevance blurb ───────────────────────────────────────────────────

function relevanceNote(entry: DictionaryEntry, dino: Dinosaur): string {
  const n = dino.name;
  switch (entry.term) {
    case 'Temporal Fenestra':
      return `In ${n}, the temporal fenestrae are sized proportionally to the jaw-closing muscle mass estimated from the skull, directly informing bite force reconstructions.`;
    case 'Osteoderm':
      return `${n}'s lineage is characterised by extensive dermal armour; osteoderm distribution patterns help distinguish it from closely related taxa.`;
    case 'Adductor Musculature':
      return `The adductor muscle volume in ${n} is estimated from the temporal fenestra and mandibular fossa dimensions, producing the bite force values used in functional reconstructions.`;
    case 'Endocast':
      return `An endocast of ${n}'s braincase reveals the relative sizes of the olfactory lobes and optic region, informing our understanding of its sensory priorities.`;
    case 'Encephalisation':
      return `${n} has an encephalisation quotient consistent with ${dino.combatStats.intelligence >= 7 ? 'cognitively active predatory behaviour' : dino.combatStats.intelligence >= 4 ? 'moderate cognitive capacity for its lineage' : 'relatively instinctive behaviour'}.`;
    case 'Osteological Correlate':
      return `Muscle attachment scars on ${n}'s limb bones and vertebrae are the primary evidence used to reconstruct the locomotor musculature and estimate functional performance.`;
    case 'Phylogenetic Bracketing':
      return `Missing soft-tissue data for ${n} is filled using bracketing between crocodilians and birds — the two living archosaur lineages that bracket all dinosaurs phylogenetically.`;
    case 'Trackway':
      return `Trackway evidence, where available for ${n}'s formation, provides independent constraints on gait type and speed estimates that complement skeletal reconstructions.`;
    case 'Bone Histology':
      return `Growth rings in ${n}'s cortical bone allow age-at-death estimates for known specimens and constrain the growth trajectory from hatchling to adult size.`;
    case 'Paleopathology':
      return `Pathological specimens of ${n} document healed bite marks and fractures, providing direct evidence of intraspecific conflict and predator-prey interaction.`;
    case 'CT Scanning':
      return `CT scanning of ${n} specimens has revealed internal bone structure, sinus anatomy and, in some cases, embryonic material that traditional preparation could never expose.`;
    case 'Viviparity':
      return dino.swimmingStyle
        ? `As a fully aquatic species, ${n} is believed to have given birth to live young at sea, as documented in related lineages from exceptionally preserved specimens.`
        : `Live birth is not the primary reproductive mode reconstructed for ${n}'s lineage, though the evidence base for specific reproductive behaviour is limited.`;
    case 'Piscivore':
      return dino.diet === 'Piscivore'
        ? `${n} is classified as a piscivore based on its elongated jaw morphology, conical teeth and habitat reconstruction in coastal or riverine environments.`
        : `While ${n} was not primarily piscivorous, fish remains have occasionally been documented in stomach contents of closely related taxa.`;
    case 'Trophic Level':
      return `${n} is reconstructed at ${dino.diet === 'Carnivore' || dino.diet === 'Piscivore' ? 'a high trophic level (3–4), as a secondary or tertiary consumer' : 'a primary consumer level (2), feeding directly on plant material'} within its ${dino.period} community.`;
    case 'Apex Predator':
      return `${dino.diet === 'Carnivore' && dino.combatStats.biteForce >= 7
        ? `${n} is reconstructed as a likely apex predator of its ecosystem, with body size and bite force placing it at the top of the reconstructed food chain.`
        : `${n} was not the apex predator of its community — it coexisted with larger theropods or other predators that likely held the top trophic position.`}`;
    case 'Archosaur':
      return `${n} belongs to Archosauria and shares the diagnostic features of the group: an antorbital fenestra, mandibular fenestra, and a fully erect hindlimb posture.`;
    case 'Synapsid':
      return `${n} is not a synapsid — it belongs to the reptilian line (Archosauria). Understanding the synapsid lineage, however, contextualises the convergent evolution of some traits seen in ${n}.`;
    case 'Coelurosaur':
      return dino.group === 'Theropods' || dino.group === 'Dromaeosauridae' || dino.group === 'Tyrannosaurids'
        ? `${n} belongs to Coelurosauria and likely possessed at least some feathering, based on phylogenetic bracketing with close relatives where integument is preserved.`
        : `${n} is not a coelurosaur but shares some ecological convergences — like those seen in large-bodied predators across different lineages.`;
    default:
      return `This concept is directly relevant to the reconstruction and interpretation of ${n}'s biology and ecological role in the ${dino.period} fossil record.`;
  }
}

// ── Dictionary Card ───────────────────────────────────────────────────────────

function DictionaryCard({ entry, dino, index }: {
  entry: DictionaryEntry;
  dino:  Dinosaur;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[entry.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-lg border border-border/60 bg-card/60 overflow-hidden hover:border-border transition-colors"
      data-testid={`dict-card-${entry.term.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Header row — always visible */}
      <button
        className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        data-testid={`button-dict-${entry.term.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`flex-shrink-0 text-[9px] uppercase tracking-[0.18em] font-display border rounded-sm px-1.5 py-0.5 ${meta.color}`}>
            {meta.label}
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-display font-semibold text-foreground tracking-tight truncate">
              {entry.term}
            </h4>
            {entry.pronunciation && !expanded && (
              <p className="text-[10px] font-mono text-muted-foreground/50 leading-none mt-0.5">
                {entry.pronunciation}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3.5 border-t border-border/40">
              {entry.pronunciation && (
                <p className="text-[11px] font-mono text-amber-400/60 pt-3 -mb-1">
                  /{entry.pronunciation}/
                </p>
              )}

              {/* Definition */}
              <div className="space-y-1 pt-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/50 font-display">Definition</p>
                <p className="text-sm text-foreground/80 font-body leading-relaxed">{entry.definition}</p>
              </div>

              {/* Scientific significance */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/50 font-display">Scientific Significance</p>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{entry.significance}</p>
              </div>

              {/* Relevance to this species */}
              <div className="rounded-md border border-amber-500/15 bg-amber-500/[0.04] px-3 py-2.5 space-y-1">
                <p className="text-[10px] uppercase tracking-[0.16em] text-amber-400/70 font-display">
                  Relevance to {dino.name}
                </p>
                <p className="text-xs text-foreground/70 font-body leading-relaxed">
                  {relevanceNote(entry, dino)}
                </p>
              </div>

              {/* Related terms */}
              {entry.relatedTerms.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/50 font-display">Related Terms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.relatedTerms.map(rt => (
                      <span
                        key={rt}
                        className="text-[11px] font-display text-muted-foreground bg-secondary/60 border border-border/50 rounded-sm px-2 py-0.5"
                      >
                        {rt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function NomenclatureDictionary({ dino, mode, sections }: Props) {
  const [filter, setFilter] = useState<DictionaryCategory | 'all'>('all');

  const allTerms = useMemo(() => detectTerms(sections, dino), [sections, dino]);
  const visible  = useMemo(
    () => filter === 'all' ? allTerms : allTerms.filter(e => e.category === filter),
    [allTerms, filter],
  );

  // Build category counts
  const counts = useMemo(() => {
    const c: Partial<Record<DictionaryCategory, number>> = {};
    allTerms.forEach(e => { c[e.category] = (c[e.category] ?? 0) + 1; });
    return c;
  }, [allTerms]);

  if (allTerms.length === 0) return null;

  const categories = (Object.keys(CATEGORY_META) as DictionaryCategory[])
    .filter(cat => counts[cat]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
      data-testid="nomenclature-dictionary"
    >
      {/* Section header */}
      <header className="flex items-start gap-4">
        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <BookOpen className="h-4.5 w-4.5 text-blue-300" />
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-display mb-1">
            Museum Reference
          </h3>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
            Scientific Nomenclature
          </h2>
          <p className="text-sm text-muted-foreground font-body mt-1">
            {allTerms.length} scientific {allTerms.length === 1 ? 'term' : 'terms'} identified in this{' '}
            {mode === 'life' ? 'life history' : 'scientific'} record
          </p>
        </div>
      </header>

      {/* Category filter tabs */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            data-testid="filter-dict-all"
            className={`px-3.5 py-1.5 rounded-md text-xs font-display border transition-all ${
              filter === 'all'
                ? 'bg-secondary text-foreground border-border'
                : 'border-border/50 text-muted-foreground hover:border-border'
            }`}
          >
            All ({allTerms.length})
          </button>
          {categories.map(cat => {
            const meta = CATEGORY_META[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                data-testid={`filter-dict-${cat}`}
                className={`px-3.5 py-1.5 rounded-md text-xs font-display border transition-all ${
                  filter === cat
                    ? `${meta.color} bg-opacity-100`
                    : 'border-border/50 text-muted-foreground hover:border-border'
                }`}
              >
                {meta.label} ({counts[cat]})
              </button>
            );
          })}
        </div>
      )}

      {/* Cards grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid gap-2 md:grid-cols-2"
        >
          {visible.map((entry, i) => (
            <DictionaryCard key={entry.term} entry={entry} dino={dino} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.article>
  );
}
