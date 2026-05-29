import { Fragment, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Leaf, FlaskConical, Lightbulb, Sparkles } from 'lucide-react';
import { Dinosaur } from '@/data/types';
import { ImagePlaceholder, PlaceholderKind } from '@/components/ImagePlaceholder';
import { getTaxonomyType } from '@/lib/taxonomy';
import { NarrationPlayer } from '@/components/NarrationPlayer';
import { SectionExhibit } from '@/components/exhibits/MuseumExhibits';
import { NomenclatureDictionary } from '@/components/NomenclatureDictionary';

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
// CINEMATIC EXHIBIT SYSTEM — HELPER COMPONENTS
// ============================================================================

// ── Decorative corner brackets ─────────────────────────────────────────────

function CinematicBrackets({ color = 'amber' }: { color?: 'amber' | 'muted' }) {
  const cls = color === 'amber' ? 'border-amber-400/45' : 'border-border/40';
  return (
    <>
      <div className={`absolute top-2 left-2 w-5 h-5 border-t border-l ${cls} pointer-events-none`} />
      <div className={`absolute top-2 right-2 w-5 h-5 border-t border-r ${cls} pointer-events-none`} />
      <div className={`absolute bottom-2 left-2 w-5 h-5 border-b border-l ${cls} pointer-events-none`} />
      <div className={`absolute bottom-2 right-2 w-5 h-5 border-b border-r ${cls} pointer-events-none`} />
    </>
  );
}

// ── Exhibit header (number + scan line + category badge + title) ───────────

const SECTION_CATEGORIES: Record<string, string> = {
  overview: 'INTRODUCTION', habitat: 'ECOLOGY', diet: 'FEEDING',
  role: 'ECOSYSTEM', behavior: 'BEHAVIOR', social: 'SOCIAL',
  repro: 'REPRODUCTION', skeletal: 'OSTEOLOGY', muscle: 'MYOLOGY',
  speed: 'BIOMECHANICS', bite: 'CRANIOLOGY', strength: 'PATHOLOGY',
  intel: 'NEUROLOGY', fossil: 'PALEONTOLOGY',
};

function ExhibitHeader({
  index, total, title, sectionId, isActive,
}: {
  index: number; total: number; title: string; sectionId: string; isActive?: boolean;
}) {
  const cat = SECTION_CATEGORIES[sectionId] ?? 'EXHIBIT';
  return (
    <div className="space-y-3 relative">
      {/* Watermark exhibit number */}
      <div className="absolute -top-2 right-0 text-[80px] md:text-[100px] font-display font-black tabular-nums select-none pointer-events-none leading-none"
        style={{ color: 'rgba(251,191,36,0.04)' }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      {/* Exhibit counter + scan line + category */}
      <div className="flex items-center gap-3">
        <span className={`font-display text-[9px] uppercase tracking-[0.3em] tabular-nums whitespace-nowrap transition-colors duration-500 ${
          isActive ? 'text-amber-400' : 'text-amber-400/45'
        }`}>
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-amber-400/35 to-transparent" />
        <span className="text-[8px] font-display uppercase tracking-[0.22em] text-muted-foreground/35 bg-secondary/60 border border-border/30 px-2 py-0.5 rounded-sm whitespace-nowrap">
          {cat}
        </span>
      </div>
      {/* Title with amber left accent */}
      <h2 className={`text-2xl md:text-3xl lg:text-[2rem] font-display font-bold tracking-tight pl-4 border-l-2 leading-tight transition-all duration-500 ${
        isActive ? 'border-amber-400 text-amber-50' : 'border-amber-500/30 text-foreground'
      }`}>
        {title}
        {isActive && (
          <span className="ml-3 inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse align-middle" />
        )}
      </h2>
    </div>
  );
}

// ── Floating annotation card ───────────────────────────────────────────────

function getAnnotationData(sectionId: string, dino: Dinosaur, mode: 'life' | 'scientific') {
  const eco = dino.ecologicalStats;
  const skel = dino.skeletonData;
  const bf = dino.combatStats.biteForce;
  const sp = dino.combatStats.speed;
  const iq = dino.combatStats.intelligence;
  const sz = dino.combatStats.size;

  if (mode === 'life') {
    const map: Record<string, { badge: string; rows: [string, string][] }> = {
      overview: { badge: 'SPECIES RECORD', rows: [
        ['Period',  dino.period],
        ['Range',   `${dino.periodRange.end}–${dino.periodRange.start} Mya`],
        ['Described', String(dino.discovery.year)],
        ['Family',  dino.classification.family],
      ]},
      habitat: { badge: 'HABITAT DATA', rows: [
        ['Continent', dino.continent],
        ['Formation', dino.discovery.location.split(',')[0]],
        ['Climate', dino.period === 'Cretaceous' ? 'Warm, no polar ice' : dino.period === 'Jurassic' ? 'Warm & humid' : 'Arid–seasonal'],
        ['Period', dino.period],
      ]},
      diet: { badge: 'FEEDING PROFILE', rows: [
        ['Diet',  dino.diet],
        ['Bite Force', bf >= 7 ? 'Extreme' : bf >= 5 ? 'High' : bf >= 3 ? 'Moderate' : 'Low'],
        ['Mass', `${(dino.weight / 1000).toFixed(1)} tonnes`],
        ['Length', `${dino.length} m`],
      ]},
      role: { badge: 'ECOLOGICAL INDEX', rows: eco ? [
        ['Apex Influence', `${eco.apexStatus} / 10`],
        ['Niche Control',  `${eco.nicheControl} / 10`],
        ['Geo. Range',     `${eco.geographicSpread} / 10`],
        ['Pop. Density',   `${eco.populationDensity} / 10`],
      ] : [
        ['Group',  dino.group],
        ['Period', dino.period],
        ['Continent', dino.continent],
        ['Diet', dino.diet],
      ]},
      behavior: { badge: 'LOCOMOTION', rows: [
        ['Speed Class',  sp >= 7 ? 'Cursorial' : sp >= 4 ? 'Moderate' : 'Graviportal'],
        ['Speed Index',  `${sp} / 10`],
        ['Aggression',   `${dino.combatStats.aggression} / 10`],
        ['Body Mass',    `${(dino.weight / 1000).toFixed(1)} t`],
      ]},
      social: { badge: 'BEHAVIORAL DATA', rows: [
        ['Intelligence', `${iq} / 10`],
        ['Social Index', iq >= 7 ? 'Complex' : iq >= 5 ? 'Moderate' : 'Minimal'],
        ['Group Size',   iq >= 7 ? 'Likely social' : 'Likely solitary'],
        ['Brain Class',  iq >= 7 ? 'High EQ' : iq >= 5 ? 'Medium EQ' : 'Low EQ'],
      ]},
      repro: { badge: 'REPRODUCTIVE DATA', rows: [
        ['Strategy', getTaxonomyType(dino) === 'marine_reptile' ? 'Viviparous' : 'Oviparous'],
        ['Group',    dino.group],
        ['Size',     sz >= 7 ? 'Mega-fauna' : sz >= 5 ? 'Large' : 'Medium'],
        ['Period',   dino.period],
      ]},
    };
    return map[sectionId] ?? null;
  }

  // scientific mode
  const sciMap: Record<string, { badge: string; rows: [string, string][] }> = {
    skeletal: { badge: 'SPECIMEN DATA', rows: [
      ['Completeness', `${skel.completeness}%`],
      ['Known Elements', String(skel.recoveredBones.length)],
      ['Holotype', skel.completeness >= 70 ? 'Good' : skel.completeness >= 40 ? 'Partial' : 'Fragmentary'],
      ['First Described', String(dino.discovery.year)],
    ]},
    muscle: { badge: 'MYOLOGY DATA', rows: [
      ['Muscle Mass Est.', `${Math.round(dino.weight * 0.38 / 1000 * 10) / 10} t`],
      ['Build Type', sz >= 7 ? 'Graviportal' : sp >= 6 ? 'Cursorial' : 'Generalist'],
      ['Speed Index', `${sp} / 10`],
      ['Size Index',  `${sz} / 10`],
    ]},
    speed: { badge: 'BIOMECHANICS', rows: [
      ['Speed Class', sp >= 7 ? 'Fast' : sp >= 4 ? 'Moderate' : 'Slow'],
      ['Tibia Ratio', `${(0.75 + (sp / 10) * 0.6).toFixed(2)} : 1`],
      ['Body Mass',   `${(dino.weight / 1000).toFixed(1)} t`],
      ['Build',       sz >= 7 ? 'Heavy' : 'Light'],
    ]},
    bite: { badge: 'BITE FORCE DATA', rows: [
      ['Force Class',  bf >= 8 ? 'Extreme' : bf >= 6 ? 'High' : bf >= 4 ? 'Moderate' : 'Low'],
      ['Force Index',  `${bf} / 10`],
      ['Diet',         dino.diet],
      ['Skull Size',   sz >= 7 ? 'Massive' : sz >= 5 ? 'Large' : 'Medium'],
    ]},
    strength: { badge: 'PHYSICAL DATA', rows: [
      ['Defense Index', `${dino.combatStats.defense} / 10`],
      ['Body Size',     `${sz} / 10`],
      ['Known Pathologies', dino.combatStats.defense >= 5 ? '3–5 types' : '1–3 types'],
      ['Specimen Count', skel.completeness >= 70 ? 'Multiple' : 'Single'],
    ]},
    intel: { badge: 'NEUROLOGY DATA', rows: [
      ['Intelligence', `${iq} / 10`],
      ['EQ Class',     iq >= 7 ? 'High' : iq >= 5 ? 'Medium' : 'Low'],
      ['Primary Sense', dino.diet === 'Carnivore' ? 'Vision + Olfaction' : 'Vision (wide)'],
      ['Diet',         dino.diet],
    ]},
    fossil: { badge: 'DISCOVERY DATA', rows: [
      ['Described By', dino.discovery.discoverer],
      ['Year', String(dino.discovery.year)],
      ['Location', dino.discovery.location.split(',').slice(-2).join(',').trim()],
      ['Completeness', `${skel.completeness}%`],
    ]},
  };
  return sciMap[sectionId] ?? null;
}

function FloatingAnnotationCard({ sectionId, dino, mode }: {
  sectionId: string; dino: Dinosaur; mode: 'life' | 'scientific';
}) {
  const data = getAnnotationData(sectionId, dino, mode);
  if (!data) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-lg border border-amber-500/18 bg-amber-500/[0.03] backdrop-blur-sm overflow-hidden"
    >
      <div className="px-3 py-2 border-b border-amber-500/15">
        <span className="text-[8px] uppercase tracking-[0.22em] font-display text-amber-400/55">
          {data.badge}
        </span>
      </div>
      <div className="px-3 py-2.5 space-y-1.5">
        {data.rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50 font-display whitespace-nowrap flex-shrink-0">
              {label}
            </span>
            <span className="text-[11px] text-foreground/70 font-body text-right min-w-0 truncate">{value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Second annotation card — specimen/evidence card ────────────────────────

function SpecimenEvidenceCard({ dino, mode }: { dino: Dinosaur; mode: 'life' | 'scientific' }) {
  const skel = dino.skeletonData;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="rounded-lg border border-border/30 bg-secondary/20 p-3 space-y-2"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[8px] uppercase tracking-[0.2em] font-display text-muted-foreground/40">Skeletal Record</span>
        <span className="text-[9px] font-mono tabular-nums text-amber-400/60">{skel.completeness}% KNOWN</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-500/60 to-amber-300/60"
          initial={{ width: 0 }}
          whileInView={{ width: `${skel.completeness}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <p className="text-[9px] text-muted-foreground/40 font-body">
        {mode === 'scientific'
          ? `${skel.recoveredBones.length} elements recovered · missing: ${skel.missingBones.slice(0, 2).join(', ') || 'minor details'}`
          : `Described ${dino.discovery.year} · ${dino.discovery.location.split(',').pop()?.trim()}`
        }
      </p>
    </motion.div>
  );
}

// ── Image container with cinematic framing ────────────────────────────────

function CinematicImage({ kind, label, ratio, scanLabel }: {
  kind: PlaceholderKind; label?: string; ratio: string; scanLabel?: string;
}) {
  return (
    <div className="relative rounded-lg overflow-hidden group">
      <ImagePlaceholder kind={kind} label={label} ratio={ratio} />
      <CinematicBrackets />
      {scanLabel && (
        <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-gradient-to-t from-black/60 to-transparent">
          <span className="text-[8px] uppercase tracking-[0.18em] font-display text-amber-400/60">{scanLabel}</span>
        </div>
      )}
    </div>
  );
}

// ── Section divider ────────────────────────────────────────────────────────

function SectionDivider({ index }: { index: number }) {
  if (index === 0) return null;
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" />
      <div className="h-1 w-1 rounded-full bg-amber-400/25" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" />
    </div>
  );
}

// ============================================================================
// SECTION BLOCK — CINEMATIC EXHIBIT LAYOUTS
// ============================================================================

interface SectionBlockProps {
  section: Section;
  index: number;
  total: number;
  dino: Dinosaur;
  mode: Mode;
  controlledOpen?: boolean;
  activeParagraphIndex?: number;
  isNarrationActive?: boolean;
}

// Layout assignment: 4 alternating cinematic layouts
type ExhibitLayout = 'hero' | 'screenplay' | 'reversed' | 'dense';
function getLayout(index: number): ExhibitLayout {
  const cycle: ExhibitLayout[] = ['hero', 'screenplay', 'reversed', 'dense'];
  return cycle[index % 4];
}

function SectionBlock({ section, index, total, dino, mode, controlledOpen, activeParagraphIndex, isNarrationActive }: SectionBlockProps) {
  const layout = getLayout(index);

  const header = (
    <ExhibitHeader
      index={index}
      total={total}
      title={section.title}
      sectionId={section.id}
      isActive={isNarrationActive}
    />
  );

  const body = (
    <ExpandableBody
      text={section.body}
      controlledOpen={controlledOpen}
      activeParagraphIndex={activeParagraphIndex}
    />
  );

  // ── HERO: cinematic wide image top, 2-col text + annotation below ─────────
  if (layout === 'hero') {
    return (
      <article
        className="space-y-6"
        data-testid={`section-${section.id}`}
        data-section-id={section.id}
      >
        {header}
        <CinematicImage
          kind={section.placeholder}
          label={section.placeholderLabel}
          ratio="21/9"
          scanLabel={`${SECTION_CATEGORIES[section.id] ?? 'SPECIMEN'} · VISUAL RECORD`}
        />
        <div className="grid md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">{body}</div>
          <div className="space-y-3">
            <FloatingAnnotationCard sectionId={section.id} dino={dino} mode={mode} />
          </div>
        </div>
      </article>
    );
  }

  // ── SCREENPLAY: 3/5 text left — 2/5 image + cards right ──────────────────
  if (layout === 'screenplay') {
    return (
      <article
        className="space-y-5"
        data-testid={`section-${section.id}`}
        data-section-id={section.id}
      >
        {header}
        <div className="grid md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3 space-y-4">{body}</div>
          <div className="md:col-span-2 space-y-3">
            <CinematicImage
              kind={section.placeholder}
              label={section.placeholderLabel}
              ratio="4/3"
              scanLabel={SECTION_CATEGORIES[section.id]}
            />
            <FloatingAnnotationCard sectionId={section.id} dino={dino} mode={mode} />
          </div>
        </div>
      </article>
    );
  }

  // ── REVERSED: 2/5 image + cards left — 3/5 text right ────────────────────
  if (layout === 'reversed') {
    return (
      <article
        className="space-y-5"
        data-testid={`section-${section.id}`}
        data-section-id={section.id}
      >
        {header}
        <div className="grid md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-2 space-y-3 order-last md:order-first">
            <CinematicImage
              kind={section.placeholder}
              label={section.placeholderLabel}
              ratio="4/3"
              scanLabel={SECTION_CATEGORIES[section.id]}
            />
            <FloatingAnnotationCard sectionId={section.id} dino={dino} mode={mode} />
          </div>
          <div className="md:col-span-3 space-y-4">{body}</div>
        </div>
      </article>
    );
  }

  // ── DENSE GRID: image 2/3 + info cards 1/3 top — full-width text bottom ──
  return (
    <article
      className="space-y-5"
      data-testid={`section-${section.id}`}
      data-section-id={section.id}
    >
      {header}
      <div className="grid md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-2">
          <CinematicImage
            kind={section.placeholder}
            label={section.placeholderLabel}
            ratio="16/9"
            scanLabel={`${SECTION_CATEGORIES[section.id] ?? 'EXHIBIT'} · RECONSTRUCTION`}
          />
        </div>
        <div className="space-y-3">
          <FloatingAnnotationCard sectionId={section.id} dino={dino} mode={mode} />
          <SpecimenEvidenceCard dino={dino} mode={mode} />
        </div>
      </div>
      <div className="md:columns-2 md:gap-8">{body}</div>
    </article>
  );
}

// ============================================================================
// FUN FACTS BLOCK — CINEMATIC GRID
// ============================================================================

function FunFactsBlock({ facts, mode }: { facts: string[]; mode: Mode }) {
  if (!facts.length) return null;
  return (
    <article className="space-y-6" data-testid="section-funfacts">
      {/* Header row — same exhibit number style */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="font-display text-[9px] uppercase tracking-[0.3em] text-amber-400/45 whitespace-nowrap">
            FIELD NOTES
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-400/35 to-transparent" />
          <span className="text-[8px] font-display uppercase tracking-[0.22em] text-muted-foreground/35 bg-secondary/60 border border-border/30 px-2 py-0.5 rounded-sm">
            {mode === 'life' ? 'NATURAL HISTORY' : 'SCIENTIFIC RECORD'}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight pl-4 border-l-2 border-amber-500/30 text-foreground flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-amber-300/70 flex-shrink-0" />
          {mode === 'life' ? 'Curiosities & Notable Facts' : 'Scientific Notes from the Field'}
        </h2>
      </div>
      {/* Masonry-style grid — first two wide, rest smaller */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {facts.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className={`relative flex gap-3.5 p-4 rounded-lg border border-amber-500/15 bg-amber-500/[0.03] hover:bg-amber-500/[0.06] transition-colors group ${
              i === 0 ? 'md:col-span-2 lg:col-span-2' : ''
            }`}
            data-testid={`fact-${mode}-${i}`}
          >
            {/* Fact number */}
            <div className="flex-shrink-0 h-6 w-6 rounded-sm bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mt-0.5">
              <span className="text-[9px] font-display font-bold text-amber-400/70 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed text-foreground/85 font-body">{f}</p>
            </div>
            {/* Decorative corner */}
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-amber-400/25 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
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
    <section className="space-y-8" data-testid="species-content">

      {/* ── Documentary mode bar ──────────────────────────────────────────── */}
      <div className="relative rounded-lg border border-border/40 bg-card/60 overflow-hidden">
        {/* Ambient amber strip */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div className="flex flex-col sm:flex-row">
          {/* Life mode */}
          <button
            onClick={() => handleModeChange('life')}
            data-testid="button-mode-life"
            className={`relative flex-1 flex items-center gap-4 px-6 py-4 transition-all text-left group ${
              mode === 'life' ? 'bg-secondary/60' : 'hover:bg-secondary/20'
            }`}
          >
            {/* Active indicator */}
            {mode === 'life' && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-400" />
            )}
            <div className={`h-9 w-9 flex-shrink-0 rounded-md flex items-center justify-center border transition-colors ${
              mode === 'life'
                ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                : 'bg-secondary/50 border-border/30 text-muted-foreground group-hover:border-border/60'
            }`}>
              <Leaf className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[8px] uppercase tracking-[0.2em] font-display text-muted-foreground/40 mb-0.5">
                MODE A — NATURAL HISTORY
              </div>
              <div className={`text-sm font-display font-semibold tracking-wide transition-colors ${
                mode === 'life' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                Life Appearance & Behavior
              </div>
            </div>
            {mode === 'life' && (
              <div className="ml-auto flex-shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
            )}
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-border/30 self-stretch" />
          <div className="block sm:hidden h-px bg-border/30" />

          {/* Scientific mode */}
          <button
            onClick={() => handleModeChange('scientific')}
            data-testid="button-mode-scientific"
            className={`relative flex-1 flex items-center gap-4 px-6 py-4 transition-all text-left group ${
              mode === 'scientific' ? 'bg-secondary/60' : 'hover:bg-secondary/20'
            }`}
          >
            {mode === 'scientific' && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-400 sm:left-0" />
            )}
            <div className={`h-9 w-9 flex-shrink-0 rounded-md flex items-center justify-center border transition-colors ${
              mode === 'scientific'
                ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                : 'bg-secondary/50 border-border/30 text-muted-foreground group-hover:border-border/60'
            }`}>
              <FlaskConical className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[8px] uppercase tracking-[0.2em] font-display text-muted-foreground/40 mb-0.5">
                MODE B — SCIENTIFIC ARCHIVE
              </div>
              <div className={`text-sm font-display font-semibold tracking-wide transition-colors ${
                mode === 'scientific' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                Anatomy & Scientific Evidence
              </div>
            </div>
            {mode === 'scientific' && (
              <div className="ml-auto flex-shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
            )}
          </button>
        </div>
        {/* Bottom ambient strip */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      </div>

      {/* ── Narration player ─────────────────────────────────────────────── */}
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
          className="space-y-16 md:space-y-24"
        >
          {sections.map((s, i) => {
            const isActive = activeSectionId === s.id;
            const controlledOpen = activeSectionId !== null ? isActive : undefined;

            return (
              <Fragment key={s.id}>
                {/* Inter-section amber scan divider */}
                {i > 0 && (
                  <div className="flex items-center gap-4 -mt-6 md:-mt-10">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/12 to-transparent" />
                    <div className="h-1 w-1 rounded-full bg-amber-400/20" />
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/12 to-transparent" />
                  </div>
                )}
                <SectionBlock
                  section={s}
                  index={i}
                  total={sections.length}
                  dino={dino}
                  mode={mode}
                  controlledOpen={controlledOpen}
                  isNarrationActive={isActive && activeSectionId !== null}
                />
                <SectionExhibit sectionId={s.id} dino={dino} mode={mode} />
              </Fragment>
            );
          })}

          {/* Field notes divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <span className="text-[8px] font-display uppercase tracking-[0.25em] text-amber-400/35 px-2">
              END OF EXHIBIT RECORD
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          </div>

          <FunFactsBlock facts={funFacts} mode={mode} />

          <NomenclatureDictionary dino={dino} mode={mode} sections={sections} />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
