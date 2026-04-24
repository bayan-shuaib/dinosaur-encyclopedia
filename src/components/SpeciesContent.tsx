import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Leaf, FlaskConical } from 'lucide-react';
import { Dinosaur } from '@/data/types';
import { ImagePlaceholder, PlaceholderKind } from '@/components/ImagePlaceholder';
import { getTaxonomyType } from '@/lib/taxonomy';

type Mode = 'life' | 'scientific';

interface Section {
  id: string;
  title: string;
  body: string;
  placeholder: PlaceholderKind;
  placeholderLabel?: string;
}

interface Props {
  dino: Dinosaur;
}

// ----- Content generation helpers -------------------------------------------

const toneHedge = ['Evidence suggests', 'Researchers believe', 'Available fossils indicate', 'Likely', 'Most reconstructions agree that'];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}
function seedFromId(id: string): number {
  let s = 0;
  for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) >>> 0;
  return s;
}

function dietPhrase(diet: string): string {
  switch (diet) {
    case 'Carnivore':  return 'an active predator that pursued or ambushed live prey';
    case 'Herbivore':  return 'a plant-eater that browsed or grazed across its environment';
    case 'Omnivore':   return 'an opportunistic feeder consuming both plant matter and small animals';
    case 'Piscivore':  return 'a fish-eater specialised for capturing aquatic prey';
    case 'Insectivore':return 'a small-bodied feeder that hunted insects and invertebrates';
    default:           return 'a feeder adapted to its local food resources';
  }
}

function intelligencePhrase(score: number): string {
  if (score >= 8) return 'high — among the more cognitively capable archosaurs of its time';
  if (score >= 6) return 'above average for its broader group';
  if (score >= 4) return 'modest, comparable to similar-sized contemporaries';
  return 'low to moderate, sufficient for instinctive behaviour';
}

function speedPhrase(score: number, taxon: string): string {
  if (taxon === 'pterosaur') return score >= 6 ? 'a strong, sustained flier capable of long-distance travel' : 'a competent but short-burst flier';
  if (taxon === 'marine_reptile') return score >= 6 ? 'a fast cruising swimmer capable of pursuit' : 'a slower, ambush-style swimmer';
  return score >= 7 ? 'a fast runner relative to its body mass' : score >= 4 ? 'a moderate runner with bursts of speed' : 'a slow, steady mover';
}

function bitePhrase(score: number, diet: string): string {
  if (diet === 'Herbivore') return 'cropping or grinding apparatus suited to plant material';
  if (score >= 8) return 'one of the most powerful bites in its ecosystem, capable of crushing bone';
  if (score >= 5) return 'a strong bite well suited for processing prey';
  return 'a relatively gracile bite suited to soft prey';
}

function defensePhrase(score: number, features: string[]): string {
  const armor = features.find(f => /armor|spike|plate|shield|frill|club|horn/i.test(f));
  if (armor) return `passive defence centered on ${armor.toLowerCase()}`;
  if (score >= 7) return 'robust skeletal architecture and bulk providing strong passive defence';
  return 'limited passive defence — likely relied on agility or group behaviour';
}

function buildLifeSections(d: Dinosaur): Section[] {
  const seed = seedFromId(d.id);
  const taxon = getTaxonomyType(d);
  const eco = d.ecologicalStats;
  const overview = d.description;

  const habitat = `${d.habitat} ${pick(toneHedge, seed)} that this species ranged across ${d.continent}, occupying environments shaped by the ${d.period} climate. Local fauna and vegetation would have determined the resources available across its range.`;

  const diet = `${d.name} was ${dietPhrase(d.diet)}. ${pick(toneHedge, seed + 1)} its feeding strategy is reflected in jaw and tooth morphology, with ${bitePhrase(d.combatStats.biteForce, d.diet)}. Daily foraging would have varied with seasonal abundance and competition from neighbouring species.`;

  const ecologicalRole = eco
    ? `${pick(toneHedge, seed + 2)} ${d.name} occupied a position with apex influence rated around ${eco.apexStatus}/10 and niche control of ${eco.nicheControl}/10. Its geographic spread (${eco.geographicSpread}/10) and population density (${eco.populationDensity}/10) suggest a ${eco.populationDensity >= 6 ? 'common and widespread' : 'specialised, locally distributed'} member of its community.`
    : `Within its ecosystem, ${d.name} would have interacted with both contemporaries and prey/predator species. Reconstructing its exact ecological role requires combined evidence from sediment, trace fossils, and associated fauna.`;

  const behaviorPoints = d.distinctFeatures.slice(0, 3).map(f => `• ${f}`).join('\n');
  const behavior = `Lifestyle indicators come primarily from anatomical features and trackway evidence. ${pick(toneHedge, seed + 3)} this animal exhibited:\n${behaviorPoints}\nDay-to-day behaviour was shaped by ${taxon === 'marine_reptile' ? 'open-water cruising and breath-hold diving' : taxon === 'pterosaur' ? 'aerial foraging and roosting in coastal environments' : 'terrestrial movement across varied landscapes'}.`;

  const social = `Social structure is among the hardest behaviours to infer from fossils. ${pick(toneHedge, seed + 4)} ${d.combatStats.intelligence >= 6 ? `${d.name} exhibited some degree of group coordination, possibly cooperative foraging or shared territories.` : `${d.name} was largely solitary, with interactions limited to mating and brief territorial encounters.`} Bonebed accumulations, when found, can occasionally support herd or pack behaviour.`;

  const reproduction = `Reproductive biology is largely inferred from related species. ${taxon === 'marine_reptile' ? 'Live birth (viviparity) is documented for several marine reptile lineages.' : 'Egg-laying is the most strongly supported reproductive mode for this group.'} ${pick(toneHedge, seed + 5)} parental investment varied across the lineage.`;

  return [
    { id: 'overview',   title: 'Overview',                  body: overview,        placeholder: 'reconstruction', placeholderLabel: `${d.name} Reconstruction` },
    { id: 'habitat',    title: 'Habitat & Distribution',    body: habitat,         placeholder: 'habitat' },
    { id: 'diet',       title: 'Diet & Feeding Behavior',   body: diet,            placeholder: 'diet' },
    { id: 'role',       title: 'Ecological Role',           body: ecologicalRole,  placeholder: 'distribution' },
    { id: 'behavior',   title: 'Behavior & Lifestyle',      body: behavior,        placeholder: 'behavior' },
    { id: 'social',     title: 'Social Structure',          body: social,          placeholder: 'social' },
    { id: 'repro',      title: 'Reproduction',              body: reproduction,    placeholder: 'reproduction' },
  ];
}

function buildScientificSections(d: Dinosaur): Section[] {
  const seed = seedFromId(d.id);
  const taxon = getTaxonomyType(d);
  const skel = d.skeletonData;

  const skeletal = `The skeleton of ${d.name} is currently reconstructed from a fossil completeness of ${skel.completeness}%. Recovered elements include ${skel.recoveredBones.slice(0, 5).join(', ')}${skel.recoveredBones.length > 5 ? ', among others' : ''}. Missing or poorly known regions — ${skel.missingBones.slice(0, 3).join(', ') || 'minor postcranial details'} — are reconstructed by phylogenetic comparison with related taxa.`;

  const muscle = `Muscle reconstruction relies on osteological correlates: scars, ridges and crests preserved on the bones. ${pick(toneHedge, seed)} the limb musculature of ${d.name} was ${d.combatStats.size >= 7 ? 'massive, supporting a heavy frame and powerful locomotion' : 'proportionate to a more agile build'}. Locomotor reconstruction places it as ${speedPhrase(d.combatStats.speed, taxon)}.`;

  const speed = `Estimated maximum speed is derived from limb proportions and trackway data where available. ${d.name} is interpreted as ${speedPhrase(d.combatStats.speed, taxon)}. ${pick(toneHedge, seed + 1)} sustained cruising speed was lower than peak burst speed.`;

  const bite = `Feeding mechanics centre on the skull, dentition and jaw musculature. ${d.name} possessed ${bitePhrase(d.combatStats.biteForce, d.diet)}. Estimated bite force scales with skull size and muscle attachment area, and is supported in some cases by tooth wear and bite-mark evidence on fossil prey.`;

  const strength = `Physical strength and durability are assessed via skeletal robustness, bone microstructure and pathology counts. ${d.name} shows ${defensePhrase(d.combatStats.defense, d.distinctFeatures)}. ${pick(toneHedge, seed + 2)} skeletal pathologies, when present, indicate the kinds of stresses the animal endured during life.`;

  const intel = `Brain morphology and the endocast give the clearest signal for cognitive capacity. ${pick(toneHedge, seed + 3)} the relative encephalisation of ${d.name} was ${intelligencePhrase(d.combatStats.intelligence)}. Sensory acuity — vision, smell, balance — is reconstructed from cranial nerve canals and inner-ear anatomy.`;

  const fossilEvidence = `${d.name} was first described by ${d.discovery.discoverer} in ${d.discovery.year}, based on material recovered from ${d.discovery.location}. Subsequent finds have refined the diagnostic features and stratigraphic range. ${pick(toneHedge, seed + 4)} pathological specimens, when reported, document healed injuries or disease consistent with the lifestyle reconstructed above.`;

  return [
    { id: 'skeletal',  title: 'Skeletal Structure',                 body: skeletal,       placeholder: 'skeleton' },
    { id: 'muscle',    title: 'Muscle Reconstruction & Locomotion', body: muscle,         placeholder: 'anatomy' },
    { id: 'speed',     title: 'Speed & Movement',                   body: speed,          placeholder: 'locomotion' },
    { id: 'bite',      title: 'Feeding Mechanics / Bite Force',     body: bite,           placeholder: 'bite' },
    { id: 'strength',  title: 'Physical Strength & Durability',     body: strength,       placeholder: 'strength' },
    { id: 'intel',     title: 'Intelligence',                       body: intel,          placeholder: 'intelligence' },
    { id: 'fossil',    title: 'Fossil Evidence & Pathologies',      body: fossilEvidence, placeholder: 'fossil' },
  ];
}

// ----- Layout system --------------------------------------------------------

type Layout = 'image-right' | 'image-left' | 'image-top' | 'image-inline';

const CYCLE: Layout[] = ['image-right', 'image-left', 'image-top', 'image-right', 'image-left', 'image-inline', 'image-top'];

function ExpandableBody({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  // Show ~2-3 lines when collapsed
  const collapsedHeight = '4.6em';
  const isLong = text.length > 220 || text.includes('\n');

  return (
    <div>
      <motion.div
        animate={{ maxHeight: open || !isLong ? '60em' : collapsedHeight }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="relative overflow-hidden text-sm md:text-[15px] leading-relaxed text-foreground/85 font-body whitespace-pre-line"
      >
        {text}
        {!open && isLong && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" />
        )}
      </motion.div>
      {isLong && (
        <button
          onClick={() => setOpen(o => !o)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-display uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
          data-testid={`button-readmore-${text.length}`}
        >
          {open ? 'Show less' : 'Read more'}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}

function SectionBlock({ section, index }: { section: Section; index: number }) {
  const layout = CYCLE[index % CYCLE.length];

  if (layout === 'image-top') {
    return (
      <article className="space-y-5" data-testid={`section-${section.id}`}>
        <ImagePlaceholder kind={section.placeholder} label={section.placeholderLabel} ratio="21/9" />
        <header>
          <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-display mb-1">Section</h3>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">{section.title}</h2>
        </header>
        <ExpandableBody text={section.body} />
      </article>
    );
  }

  if (layout === 'image-inline') {
    const [first, ...rest] = section.body.split('\n');
    return (
      <article className="space-y-5" data-testid={`section-${section.id}`}>
        <header>
          <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-display mb-1">Section</h3>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">{section.title}</h2>
        </header>
        <p className="text-sm md:text-[15px] leading-relaxed text-foreground/85 font-body">{first}</p>
        <ImagePlaceholder kind={section.placeholder} label={section.placeholderLabel} ratio="16/9" />
        {rest.length > 0 && <ExpandableBody text={rest.join('\n')} />}
      </article>
    );
  }

  const imageRight = layout === 'image-right';
  return (
    <article
      className={`grid gap-6 md:gap-8 md:grid-cols-2 items-start ${imageRight ? '' : 'md:[direction:rtl]'}`}
      data-testid={`section-${section.id}`}
    >
      <div className={`${imageRight ? '' : 'md:[direction:ltr]'} space-y-4`}>
        <header>
          <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-display mb-1">Section</h3>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">{section.title}</h2>
        </header>
        <ExpandableBody text={section.body} />
      </div>
      <div className={imageRight ? '' : 'md:[direction:ltr]'}>
        <ImagePlaceholder kind={section.placeholder} label={section.placeholderLabel} ratio="4/3" />
      </div>
    </article>
  );
}

export function SpeciesContent({ dino }: Props) {
  const [mode, setMode] = useState<Mode>('life');
  const sections = mode === 'life' ? buildLifeSections(dino) : buildScientificSections(dino);

  return (
    <section className="space-y-10" data-testid="species-content">
      {/* Mode toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
          <button
            onClick={() => setMode('life')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-display transition-all ${
              mode === 'life' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="button-mode-life"
          >
            <Leaf className="h-4 w-4" />
            Life Appearance & Behavior
          </button>
          <button
            onClick={() => setMode('scientific')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-display transition-all ${
              mode === 'scientific' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="button-mode-scientific"
          >
            <FlaskConical className="h-4 w-4" />
            Anatomy & Scientific Evidence
          </button>
        </div>
      </div>

      {/* Sections — fade transition between modes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-14 md:space-y-20"
        >
          {sections.map((s, i) => (
            <SectionBlock key={s.id} section={s} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
