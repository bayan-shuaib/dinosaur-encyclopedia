import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Leaf, FlaskConical, Lightbulb, Sparkles } from 'lucide-react';
import { Dinosaur } from '@/data/types';
import { ImagePlaceholder, PlaceholderKind } from '@/components/ImagePlaceholder';
import { getTaxonomyType } from '@/lib/taxonomy';
import { NarrationPlayer } from '@/components/NarrationPlayer';

type Mode = 'life' | 'scientific';

// Exported so NarrationPlayer can reference if needed
export interface Section {
  id: string;
  title: string;
  body: string;
  placeholder: PlaceholderKind;
  placeholderLabel?: string;
}

interface Props {
  dino: Dinosaur;
}

// ============================================================================
// SHARED HELPERS
// ============================================================================

const lifeHedge = ['Evidence suggests', 'Reconstructions indicate', 'Available fossils suggest', 'Most paleontologists agree', 'Studies of related species imply'];
const sciHedge  = ['Current data indicate', 'Analyses suggest', 'Available evidence implies', 'Comparative studies show', 'Recent re-examinations confirm'];

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }
function seedFromId(id: string): number {
  let s = 0;
  for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) >>> 0;
  return s;
}

function dietPhrase(diet: string): string {
  switch (diet) {
    case 'Carnivore':   return 'an active predator that pursued or ambushed live prey';
    case 'Herbivore':   return 'a plant-eater that browsed or grazed across its environment';
    case 'Omnivore':    return 'an opportunistic feeder consuming both plant matter and small animals';
    case 'Piscivore':   return 'a fish-eater specialised for capturing aquatic prey';
    case 'Insectivore': return 'a small-bodied feeder that hunted insects and invertebrates';
    default:            return 'a feeder adapted to its local food resources';
  }
}

function periodContext(p: string): string {
  switch (p) {
    case 'Permian':    return 'the late Paleozoic, before true dinosaurs existed, when synapsids and early reptiles dominated terrestrial ecosystems';
    case 'Triassic':   return 'an experimental phase of archosaur evolution, recovering from the largest mass extinction in Earth\u2019s history';
    case 'Jurassic':   return 'the first great age of dinosaur dominance, with sprawling forests of conifers, cycads and tree ferns';
    case 'Cretaceous': return 'the longest dinosaur-dominated period, marked by the rise of flowering plants and increasingly complex food webs';
    default:           return 'a deep-time interval of reptile diversification';
  }
}

function climateNote(p: string): string {
  switch (p) {
    case 'Permian':    return 'Climates were strongly seasonal, with vast inland deserts and a single supercontinent (Pangaea) limiting moisture inland.';
    case 'Triassic':   return 'Global climates were warm and dry overall, with monsoonal margins and few polar ice deposits.';
    case 'Jurassic':   return 'Conditions were warm and humid, with no permanent polar ice and broad shallow seas across the continents.';
    case 'Cretaceous': return 'The world was warmer than today, with high sea levels flooding continental interiors and creating extensive coastal habitats.';
    default:           return 'Local climate exerted strong control over what species could persist.';
  }
}

function intelligencePhrase(score: number): string {
  if (score >= 8) return 'high \u2014 among the more cognitively capable archosaurs of its time';
  if (score >= 6) return 'above average for its broader group';
  if (score >= 4) return 'modest, comparable to similar-sized contemporaries';
  return 'low to moderate, sufficient for instinctive behaviour';
}

function speedPhrase(score: number, taxon: string): string {
  if (taxon === 'pterosaur')      return score >= 6 ? 'a strong, sustained flier capable of long-distance travel' : 'a competent but short-burst flier';
  if (taxon === 'marine_reptile') return score >= 6 ? 'a fast cruising swimmer capable of pursuit' : 'a slower, ambush-style swimmer';
  return score >= 7 ? 'a fast runner relative to its body mass' : score >= 4 ? 'a moderate runner with bursts of speed' : 'a slow, steady mover';
}

function bitePhrase(score: number, diet: string): string {
  if (diet === 'Herbivore') return 'cropping or grinding teeth suited to plant material';
  if (score >= 8) return 'one of the most powerful bites in its ecosystem, capable of crushing bone';
  if (score >= 5) return 'a strong bite well suited for processing prey';
  return 'a relatively gracile bite suited to soft prey';
}

function defensePhrase(score: number, features: string[]): string {
  const armor = features.find(f => /armor|spike|plate|shield|frill|club|horn/i.test(f));
  if (armor) return `passive defence centred on its ${armor.toLowerCase()}`;
  if (score >= 7) return 'robust skeletal architecture and bulk providing strong passive defence';
  return 'limited passive defence \u2014 likely relied on agility or group behaviour';
}

function locomotionContext(taxon: string): string {
  if (taxon === 'pterosaur')      return 'A quadrupedal launch posture is now favoured by most experts, with powerful forelimb muscles providing the initial vault into flight';
  if (taxon === 'marine_reptile') return 'Underwater locomotion was driven by either flipper-based "underwater flying" or lateral undulation of the body and tail, depending on lineage';
  return 'Gait reconstruction draws on limb proportions, trackway stride length, and comparison with living analogues';
}

// ============================================================================
// LIFE MODE SECTIONS
// ============================================================================

function buildLifeSections(d: Dinosaur): Section[] {
  const seed = seedFromId(d.id);
  const taxon = getTaxonomyType(d);
  const eco = d.ecologicalStats;

  const overview = [
    d.description,
    `As a member of ${d.classification.family} within the ${d.group} radiation, ${d.name} shares its broad body plan with related forms but carries its own distinctive specialisations. It lived during ${periodContext(d.period)}.`,
    `${pick(lifeHedge, seed)} the overall silhouette and proportions are well established, but finer details \u2014 colouration, soft tissues, exact behaviours \u2014 are inferred from related species and from the few exceptionally preserved specimens that survive in the fossil record.`,
  ].join('\n\n');

  const habitat = [
    `${d.habitat} ${pick(lifeHedge, seed + 1)} that ${d.name} ranged across parts of ${d.continent}, occupying environments shaped by the ${d.period} climate.`,
    `${climateNote(d.period)} These conditions controlled the vegetation, water sources and prey base available to ${d.name}, and ultimately determined where the species could establish and persist.`,
    `Fossil distribution reflects where conditions favoured preservation as much as where the animal actually lived. The true range may have extended well beyond known sites, particularly into upland or arid areas where bones rarely fossilise.`,
  ].join('\n\n');

  const diet = [
    `${d.name} was ${dietPhrase(d.diet)}. Its feeding strategy is reflected directly in the morphology of the jaws and teeth, which preserve ${bitePhrase(d.combatStats.biteForce, d.diet)}.`,
    `${pick(lifeHedge, seed + 2)} prey or food items were processed through a combination of jaw kinematics and ${d.diet === 'Herbivore' ? 'continuous tooth replacement that kept grinding surfaces effective throughout life' : 'serrated, replaceable teeth that compensated for wear and breakage during feeding'}. Daily intake would have varied with seasonal abundance and competition from neighbouring species.`,
    `In years of scarcity, dietary breadth probably expanded; bite-mark evidence and stomach-content fossils, when found, occasionally reveal a wider menu than skull morphology alone implies.`,
  ].join('\n\n');

  const role = eco
    ? [
        `${pick(lifeHedge, seed + 3)} ${d.name} occupied an ecological position with apex influence rated around ${eco.apexStatus}/10 and niche control of ${eco.nicheControl}/10. Its geographic spread (${eco.geographicSpread}/10) and population density (${eco.populationDensity}/10) suggest it was ${eco.populationDensity >= 6 ? 'a common, widespread' : 'a more specialised and locally distributed'} member of its community.`,
        `Within the food web, it interacted constantly with both contemporaries and prey or predator species, exerting top-down or bottom-up pressure depending on its trophic level. Competition pressure (${eco.competitionPressure}/10) hints at how often it had to defend resources against ecological rivals.`,
        `Evolutionary longevity of ${eco.evolutionaryLongevity}/10 indicates how long its lineage persisted before extinction or replacement \u2014 a useful, if approximate, measure of ecological success across deep time.`,
      ].join('\n\n')
    : [
        `Within its ecosystem, ${d.name} interacted with both contemporaries and prey or predator species, exerting some pressure on the surrounding food web.`,
        `Reconstructing its exact ecological role requires combined evidence from sediment, trace fossils and associated fauna found in the same formations.`,
        `As with many extinct species, gaps in the fossil record mean that subtle ecological relationships \u2014 parasitism, competition, mutualism \u2014 remain largely speculative.`,
      ].join('\n\n');

  const behaviorBullets = d.distinctFeatures.slice(0, 3).map(f => `\u2022 ${f}`).join('\n');
  const behavior = [
    `Lifestyle indicators come primarily from anatomical features and trackway evidence preserved in sediment. ${pick(lifeHedge, seed + 4)} ${d.name} exhibited:\n${behaviorBullets}`,
    `Day-to-day behaviour was shaped by ${taxon === 'marine_reptile' ? 'open-water cruising and breath-hold diving cycles' : taxon === 'pterosaur' ? 'aerial foraging interspersed with quadrupedal terrestrial locomotion' : 'terrestrial movement across varied landscapes, with activity patterns probably tied to temperature and prey availability'}. ${locomotionContext(taxon)}.`,
    `Behaviours that rarely fossilise \u2014 vocalisation, display, courtship rituals \u2014 are inferred indirectly from cranial structures, sexual dimorphism and comparison with living relatives such as crocodilians and birds.`,
  ].join('\n\n');

  const social = [
    `Social structure is among the hardest aspects of behaviour to recover from fossils. ${pick(lifeHedge, seed + 5)} ${d.combatStats.intelligence >= 6 ? `${d.name} exhibited some degree of group coordination, possibly cooperative foraging or shared territories.` : `${d.name} was largely solitary, with interactions limited to mating and brief territorial encounters.`}`,
    `The strongest evidence for sociality comes from bonebeds containing multiple individuals of mixed ages, parallel trackways suggesting coordinated movement, and nesting colonies preserved together in time.`,
    `Even when such evidence exists, distinguishing true social bonds from passive aggregation around scarce resources remains difficult and is an active area of paleontological debate.`,
  ].join('\n\n');

  const reproduction = [
    taxon === 'marine_reptile'
      ? `Live birth (viviparity) is documented for several marine reptile lineages, with mothers giving birth tail-first to fully-formed young in open water.`
      : `Egg-laying is the most strongly supported reproductive mode for this group, based on associated nest sites, fossilised eggs and embryos preserved in matrix.`,
    `${pick(lifeHedge, seed + 6)} parental investment varied across the lineage \u2014 from minimal post-hatching care in some forms to extended guarding and provisioning in others, similar to modern crocodilians and birds.`,
    `Growth rates inferred from bone histology suggest that juveniles reached sexual maturity well before achieving full adult size, a pattern shared by many large-bodied extinct reptiles.`,
  ].join('\n\n');

  return [
    { id: 'overview',  title: 'Overview',                body: overview,      placeholder: 'reconstruction', placeholderLabel: `${d.name} Reconstruction` },
    { id: 'habitat',   title: 'Habitat & Distribution',  body: habitat,       placeholder: 'habitat' },
    { id: 'diet',      title: 'Diet & Feeding Behavior', body: diet,          placeholder: 'diet' },
    { id: 'role',      title: 'Ecological Role',         body: role,          placeholder: 'distribution' },
    { id: 'behavior',  title: 'Behavior & Lifestyle',    body: behavior,      placeholder: 'behavior' },
    { id: 'social',    title: 'Social Structure',        body: social,        placeholder: 'social' },
    { id: 'repro',     title: 'Reproduction',            body: reproduction,  placeholder: 'reproduction' },
  ];
}

// ============================================================================
// SCIENTIFIC MODE SECTIONS
// ============================================================================

function buildScientificSections(d: Dinosaur): Section[] {
  const seed = seedFromId(d.id);
  const taxon = getTaxonomyType(d);
  const skel = d.skeletonData;

  const skeletal = [
    `The skeleton of ${d.name} is currently reconstructed from a fossil completeness of ${skel.completeness}%. Recovered elements include ${skel.recoveredBones.slice(0, 5).join(', ')}${skel.recoveredBones.length > 5 ? ', among others' : ''}.`,
    `Completeness is calculated as the percentage of expected skeletal elements actually recovered. Missing or poorly known regions \u2014 ${skel.missingBones.slice(0, 3).join(', ') || 'minor postcranial details'} \u2014 are reconstructed using phylogenetic bracketing against the closest known relatives.`,
    `${pick(sciHedge, seed)} the diagnostic features used to define the species are concentrated in the skull and pelvis, where preservation tends to be more reliable and the morphological signal is strongest.`,
  ].join('\n\n');

  const muscle = [
    `Muscle reconstruction relies on osteological correlates: scars, ridges, fossae and tubercles preserved on the bones where major muscle groups attached in life.`,
    `${pick(sciHedge, seed + 1)} the limb musculature of ${d.name} was ${d.combatStats.size >= 7 ? 'massive, supporting a heavy frame and powerful, columnar locomotion' : 'proportionate to a more agile build, with longer distal limb segments favouring stride speed'}. The reconstruction places it as ${speedPhrase(d.combatStats.speed, taxon)}.`,
    `Soft tissues do not fossilise directly; mass and cross-sectional area of each muscle are estimated by comparison with living archosaurs and constrained by the size of the bony attachment.`,
  ].join('\n\n');

  const speed = [
    `Estimated maximum speed is derived from limb proportions, hindlimb-to-trunk ratios and trackway stride lengths where preserved. ${d.name} is interpreted as ${speedPhrase(d.combatStats.speed, taxon)}.`,
    `${pick(sciHedge, seed + 2)} sustained cruising speed was significantly lower than peak burst speed, mirroring the pattern seen in modern large vertebrates where high-speed locomotion is metabolically expensive.`,
    `Reported speed estimates carry wide uncertainty bounds. Different biomechanical models, even applied to the same skeleton, can produce results that differ by several metres per second.`,
  ].join('\n\n');

  const bite = [
    `Feeding mechanics centre on the skull, dentition and the major jaw-closing muscles. ${d.name} possessed ${bitePhrase(d.combatStats.biteForce, d.diet)}.`,
    `Estimated bite force scales with skull size, dental morphology and the cross-sectional area of the adductor musculature, and is calibrated against measurements taken from living crocodilians and birds.`,
    `Tooth wear, microstriations and bite-mark evidence on fossil prey \u2014 when found \u2014 provide independent tests of these reconstructions, and sometimes overturn them.`,
  ].join('\n\n');

  const strength = [
    `Physical strength and durability are assessed via skeletal robustness, bone microstructure and the frequency and distribution of pathologies recorded across known specimens.`,
    `${d.name} shows ${defensePhrase(d.combatStats.defense, d.distinctFeatures)}, consistent with the lifestyle reconstructed from its anatomy.`,
    `${pick(sciHedge, seed + 3)} healed injuries, when present, document the kinds of mechanical stresses the animal endured during life and survived long enough for the bone to remodel.`,
  ].join('\n\n');

  const intel = [
    `Brain morphology, recovered indirectly via endocasts of the braincase, gives the clearest signal for cognitive capacity in extinct species.`,
    `${pick(sciHedge, seed + 4)} the relative encephalisation of ${d.name} was ${intelligencePhrase(d.combatStats.intelligence)}. Sensory acuity \u2014 vision, smell and balance \u2014 is reconstructed from cranial nerve canals and the bony labyrinth of the inner ear.`,
    `Encephalisation quotient (EQ) comparisons across species are useful but imperfect: brain-tissue density, organisation and energy use leave only indirect traces in fossil bone.`,
  ].join('\n\n');

  const fossil = [
    `${d.name} was first described by ${d.discovery.discoverer} in ${d.discovery.year}, based on material recovered from ${d.discovery.location}.`,
    `Subsequent finds have refined the diagnostic features, the stratigraphic range and the geographic extent of the species. ${pick(sciHedge, seed + 5)} re-examination using modern imaging techniques \u2014 CT scanning, synchrotron tomography \u2014 continues to reveal details invisible to earlier researchers.`,
    `Pathological specimens, when reported, document healed injuries, infections or developmental abnormalities and provide some of the most direct evidence of how the animal actually lived and died.`,
  ].join('\n\n');

  return [
    { id: 'skeletal', title: 'Skeletal Structure',                 body: skeletal, placeholder: 'skeleton' },
    { id: 'muscle',   title: 'Muscle Reconstruction & Locomotion', body: muscle,   placeholder: 'anatomy' },
    { id: 'speed',    title: 'Speed & Movement',                   body: speed,    placeholder: 'locomotion' },
    { id: 'bite',     title: 'Feeding Mechanics & Bite Force',     body: bite,     placeholder: 'bite' },
    { id: 'strength', title: 'Physical Strength & Durability',     body: strength, placeholder: 'strength' },
    { id: 'intel',    title: 'Intelligence & Senses',              body: intel,    placeholder: 'intelligence' },
    { id: 'fossil',   title: 'Fossil Evidence & Pathologies',      body: fossil,   placeholder: 'fossil' },
  ];
}

// ============================================================================
// FUN FACTS
// ============================================================================

function buildLifeFunFacts(d: Dinosaur): string[] {
  const taxon = getTaxonomyType(d);
  const facts: string[] = [];
  const ageMid = Math.round((d.periodRange.start + d.periodRange.end) / 2);

  if (ageMid <= 70) {
    facts.push(`Lived around ${ageMid} million years ago \u2014 closer in time to humans than to Stegosaurus, which preceded it by over 80 million years.`);
  } else if (ageMid >= 200) {
    facts.push(`Roamed the planet roughly ${ageMid} million years ago, before flowering plants existed and when forests were dominated by conifers, ferns and cycads.`);
  } else {
    facts.push(`Lived approximately ${ageMid} million years ago, deep in the ${d.period} period and long before any modern mammal lineage appeared.`);
  }

  if (taxon === 'pterosaur') {
    facts.push(`Despite being a contemporary of dinosaurs, ${d.name} was not a dinosaur \u2014 pterosaurs belong to a separate flying-reptile lineage and evolved powered flight independently.`);
  } else if (taxon === 'marine_reptile') {
    facts.push(`Although it shared the world with dinosaurs, ${d.name} was not a dinosaur \u2014 it belonged to a separate reptile lineage that returned to the sea.`);
  }

  if (d.weight >= 5000) {
    facts.push(`Outweighed roughly ${(d.weight / 6000).toFixed(1)} adult African elephants \u2014 a true heavyweight of its ecosystem.`);
  } else if (d.weight <= 30) {
    facts.push(`Weighed less than a modern Border Collie, despite living alongside far larger contemporaries.`);
  } else if (d.length >= 25) {
    facts.push(`Stretched over ${d.length} metres from snout to tail tip \u2014 longer than a typical city bus.`);
  }

  if (d.distinctFeatures[0]) {
    facts.push(`One of its most striking features is ${d.distinctFeatures[0].toLowerCase().replace(/\.$/, '')}, a trait that sets it apart from most contemporaries.`);
  }

  facts.push(`Formally described in ${d.discovery.year} from fossils unearthed in ${d.discovery.location.split(',').slice(-1)[0].trim()}.`);
  return facts.slice(0, 5);
}

function buildScientificFunFacts(d: Dinosaur): string[] {
  const taxon = getTaxonomyType(d);
  const facts: string[] = [];
  const skel = d.skeletonData;

  if (skel.completeness >= 80) {
    facts.push(`At ${skel.completeness}% skeletal completeness, ${d.name} is among the better-known species in the fossil record \u2014 most extinct reptiles are reconstructed from far less.`);
  } else if (skel.completeness <= 30) {
    facts.push(`Only about ${skel.completeness}% of its skeleton has ever been recovered, so much of the reconstruction relies on phylogenetic bracketing against close relatives.`);
  } else {
    facts.push(`Roughly ${skel.completeness}% of the skeleton is known from fossil material, a typical figure for medium-coverage extinct species.`);
  }

  facts.push(`First scientifically named in ${d.discovery.year}, the holotype specimen has been re-examined repeatedly as new analytical techniques have become available.`);
  facts.push(`Belongs to the family ${d.classification.family}, within the broader ${d.group} group \u2014 a placement supported by both skeletal traits and modern phylogenetic analysis.`);

  if (d.combatStats.biteForce >= 8 && d.diet !== 'Herbivore') {
    facts.push(`Bite-force estimates place ${d.name} among the most powerful jawed predators of its size class, with crushing strength capable of fracturing prey bone.`);
  } else if (d.combatStats.intelligence >= 7) {
    facts.push(`Endocast studies suggest a relatively enlarged brain for its body size, hinting at more complex behavioural repertoires than many contemporaries.`);
  } else if (taxon === 'pterosaur' && d.wingspan && d.wingspan >= 6) {
    facts.push(`With an estimated wingspan of around ${d.wingspan} m, biomechanical models suggest it could remain airborne for hours using thermal soaring.`);
  } else if (taxon === 'marine_reptile') {
    facts.push(`Bone microstructure suggests adaptations for sustained diving, including dense, ballast-like ribs and modifications of the limb bones into flippers.`);
  } else {
    facts.push(`Limb proportions place ${d.name} among the ${d.combatStats.speed >= 7 ? 'more cursorial' : 'more graviportal'} members of its group.`);
  }

  facts.push(`Stratigraphic range falls within the ${d.period} period (${d.periodRange.end}\u2013${d.periodRange.start} Mya), constraining its appearance in the geological record.`);
  return facts.slice(0, 5);
}


// ============================================================================
// PARAGRAPH LIST — with optional active-paragraph highlight
// ============================================================================

function ParagraphList({
  text,
  activeParagraphIndex,
}: {
  text: string;
  activeParagraphIndex?: number;
}) {
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  return (
    <div className="space-y-4 text-sm md:text-[15px] leading-relaxed text-foreground/85 font-body">
      {paragraphs.map((p, i) => (
        <motion.p
          key={i}
          animate={
            activeParagraphIndex === i
              ? { backgroundColor: 'rgba(var(--primary-rgb, 255 255 255) / 0.05)' }
              : { backgroundColor: 'rgba(0 0 0 / 0)' }
          }
          transition={{ duration: 0.5 }}
          className={`whitespace-pre-line rounded px-2 -mx-2 py-1 transition-colors duration-500 ${
            activeParagraphIndex === i
              ? 'text-foreground/95 border-l-2 border-primary/40 pl-3 -ml-[13px]'
              : ''
          }`}
        >
          {p}
        </motion.p>
      ))}
    </div>
  );
}

// ============================================================================
// EXPANDABLE BODY
// ============================================================================

interface ExpandableBodyProps {
  text: string;
  /** undefined = user-controlled; true = force open; false = force closed */
  controlledOpen?: boolean;
  activeParagraphIndex?: number;
}

function ExpandableBody({ text, controlledOpen, activeParagraphIndex }: ExpandableBodyProps) {
  const [manualOpen, setManualOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : manualOpen;

  // When narration mode exits (controlledOpen → undefined), reset manual state
  useEffect(() => {
    if (!isControlled) setManualOpen(false);
  }, [isControlled]);

  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  const isLong = paragraphs.length > 1 || text.length > 320;

  return (
    <div>
      <motion.div
        animate={{ maxHeight: open || !isLong ? '120em' : '6em' }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative overflow-hidden"
      >
        <ParagraphList text={text} activeParagraphIndex={activeParagraphIndex} />
        {!open && isLong && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background to-transparent" />
        )}
      </motion.div>
      {isLong && !isControlled && (
        <button
          onClick={() => setManualOpen(o => !o)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-display uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
          data-testid={`button-readmore-${text.length}`}
        >
          {manualOpen ? 'Show less' : 'Read more'}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${manualOpen ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// SECTION BLOCK
// ============================================================================

type Layout = 'image-right' | 'image-left' | 'image-top' | 'image-inline';
const CYCLE: Layout[] = ['image-right', 'image-left', 'image-top', 'image-right', 'image-left', 'image-inline', 'image-top'];

interface SectionBlockProps {
  section: Section;
  index: number;
  controlledOpen?: boolean;
  activeParagraphIndex?: number;
  isNarrationActive?: boolean;
}

function SectionBlock({ section, index, controlledOpen, activeParagraphIndex, isNarrationActive }: SectionBlockProps) {
  const layout = CYCLE[index % CYCLE.length];

  const header = (
    <header>
      <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-display mb-1">Section</h3>
      <h2
        className={`text-2xl md:text-3xl font-display font-bold tracking-tight transition-colors duration-500 ${
          isNarrationActive ? 'text-primary' : 'text-foreground'
        }`}
      >
        {section.title}
        {isNarrationActive && (
          <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse align-middle" />
        )}
      </h2>
    </header>
  );

  const body = (
    <ExpandableBody
      text={section.body}
      controlledOpen={controlledOpen}
      activeParagraphIndex={activeParagraphIndex}
    />
  );

  if (layout === 'image-top') {
    return (
      <article
        className="space-y-5"
        data-testid={`section-${section.id}`}
        data-section-id={section.id}
      >
        <ImagePlaceholder kind={section.placeholder} label={section.placeholderLabel} ratio="21/9" />
        {header}
        {body}
      </article>
    );
  }

  if (layout === 'image-inline') {
    const paragraphs = section.body.split(/\n{2,}/);
    const first = paragraphs[0] || '';
    const rest  = paragraphs.slice(1).join('\n\n');
    return (
      <article
        className="space-y-5"
        data-testid={`section-${section.id}`}
        data-section-id={section.id}
      >
        {header}
        <ParagraphList text={first} activeParagraphIndex={activeParagraphIndex === 0 ? 0 : undefined} />
        <ImagePlaceholder kind={section.placeholder} label={section.placeholderLabel} ratio="16/9" />
        {rest && (
          <ExpandableBody
            text={rest}
            controlledOpen={controlledOpen}
            activeParagraphIndex={
              activeParagraphIndex !== undefined && activeParagraphIndex > 0
                ? activeParagraphIndex - 1
                : undefined
            }
          />
        )}
      </article>
    );
  }

  const imageRight = layout === 'image-right';
  return (
    <article
      className={`grid gap-6 md:gap-8 md:grid-cols-2 items-start ${imageRight ? '' : 'md:[direction:rtl]'}`}
      data-testid={`section-${section.id}`}
      data-section-id={section.id}
    >
      <div className={`${imageRight ? '' : 'md:[direction:ltr]'} space-y-4`}>
        {header}
        {body}
      </div>
      <div className={imageRight ? '' : 'md:[direction:ltr]'}>
        <ImagePlaceholder kind={section.placeholder} label={section.placeholderLabel} ratio="4/3" />
      </div>
    </article>
  );
}

// ============================================================================
// FUN FACTS BLOCK
// ============================================================================

function FunFactsBlock({ facts, mode }: { facts: string[]; mode: Mode }) {
  if (!facts.length) return null;
  return (
    <article className="space-y-5" data-testid="section-funfacts">
      <header className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-amber-300" />
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-display mb-1">
            {mode === 'life' ? 'Curiosities' : 'Notes from the field'}
          </h3>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">Fun Facts</h2>
        </div>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {facts.map((f, i) => (
          <div
            key={i}
            className="flex gap-3 p-4 rounded-md bg-amber-500/[0.04] border border-amber-500/15 transition-colors hover:bg-amber-500/[0.07]"
            data-testid={`fact-${mode}-${i}`}
          >
            <Lightbulb className="h-4 w-4 mt-[2px] flex-shrink-0 text-amber-300/90" />
            <p className="text-sm leading-relaxed text-foreground/90 font-body">{f}</p>
          </div>
        ))}
      </div>
    </article>
  );
}


// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SpeciesContent({ dino }: Props) {
  const [mode, setMode]                       = useState<Mode>('life');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const sections = useMemo(
    () => mode === 'life' ? buildLifeSections(dino) : buildScientificSections(dino),
    [dino, mode],
  );
  const funFacts  = useMemo(
    () => mode === 'life' ? buildLifeFunFacts(dino) : buildScientificFunFacts(dino),
    [dino, mode],
  );

  // ── Auto-scroll to active section when narration drives section changes ──
  const userScrolledRef = useRef(false);
  const scrollTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      userScrolledRef.current = true;
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        userScrolledRef.current = false;
      }, 3000);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!activeSectionId || userScrolledRef.current) return;
    const el = document.querySelector(`[data-section-id="${activeSectionId}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeSectionId]);

  // ── Reset active section when mode changes ────────────────────────────────
  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    setActiveSectionId(null);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="space-y-10" data-testid="species-content">

      {/* ── Top controls: mode toggle ─────────────────────────────────────── */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
          <button
            onClick={() => handleModeChange('life')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-display transition-all ${
              mode === 'life' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="button-mode-life"
          >
            <Leaf className="h-4 w-4" />
            Life Appearance & Behavior
          </button>
          <button
            onClick={() => handleModeChange('scientific')}
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

      {/* ── Narration player — always visible ───────────────────────────────── */}
      <NarrationPlayer
        key={`${dino.id}-${mode}`}
        speciesId={dino.id}
        mode={mode}
        onActiveSectionId={setActiveSectionId}
      />

      {/* ── Sections ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-14 md:space-y-20"
        >
          {sections.map((s, i) => {
            const isActive = activeSectionId === s.id;
            // When narration is driving (activeSectionId !== null):
            //   force open the active section, force close all others.
            // When narration is idle (activeSectionId === null):
            //   undefined = fully user-controlled accordion.
            const controlledOpen = activeSectionId !== null ? isActive : undefined;

            return (
              <SectionBlock
                key={s.id}
                section={s}
                index={i}
                controlledOpen={controlledOpen}
                isNarrationActive={isActive && activeSectionId !== null}
              />
            );
          })}

          <FunFactsBlock facts={funFacts} mode={mode} />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
