export type DictionaryCategory =
  | 'anatomy'
  | 'taxonomy'
  | 'behavior'
  | 'ecology'
  | 'paleontology';

export interface DictionaryEntry {
  term:           string;
  pronunciation?: string;
  category:       DictionaryCategory;
  definition:     string;
  significance:   string;
  relatedTerms:   string[];
  /** Lower-cased substrings that trigger detection in article text */
  triggers:       string[];
}

export const DICTIONARY: DictionaryEntry[] = [
  // ── Anatomy ─────────────────────────────────────────────────────────────────
  {
    term: 'Temporal Fenestra',
    pronunciation: 'TEM-por-al fen-ES-tra',
    category: 'anatomy',
    definition:
      'An opening in the skull behind the eye socket, formed by bones of the temporal region. Amniotes are classified in part by the number and arrangement of these openings, which anchor major jaw-closing muscles.',
    significance:
      'The size and shape of temporal fenestrae directly constrain jaw-muscle volume, making them a key indicator of bite force and dietary capability.',
    relatedTerms: ['Adductor Musculature', 'Archosaur', 'Synapsid'],
    triggers: ['temporal fenestra', 'temporal opening', 'skull opening'],
  },
  {
    term: 'Pneumatization',
    pronunciation: 'nyoo-mat-ih-ZAY-shun',
    category: 'anatomy',
    definition:
      'The invasion of bone by air-filled diverticula connected to the respiratory system, producing hollow or lattice-like bone walls. Widespread in theropod dinosaurs and their living descendants, modern birds.',
    significance:
      'Pneumatized vertebrae reduce skeletal mass without sacrificing structural strength, enabling efficient locomotion in large-bodied forms and influencing body mass estimates.',
    relatedTerms: ['Archosaur', 'Theropoda', 'Bone Histology'],
    triggers: ['pneumat', 'hollow bone', 'air sac'],
  },
  {
    term: 'Osteoderm',
    pronunciation: 'OS-tee-oh-derm',
    category: 'anatomy',
    definition:
      'A bony plate or scale embedded within the skin, forming external dermal armour. Osteoderms appear in crocodilians, ankylosaurs, nodosaurs, stegosaurs and several other lineages.',
    significance:
      'Osteoderms provide direct physical evidence of defensive adaptations and help distinguish taxa in the fossil record even when skeletal material is absent.',
    relatedTerms: ['Taphonomy', 'Clade'],
    triggers: ['osteoderm', 'dermal armour', 'dermal armor', 'armor plate', 'bony plate'],
  },
  {
    term: 'Osteological Correlate',
    pronunciation: 'os-tee-oh-LOJ-ih-kul KOR-eh-layt',
    category: 'anatomy',
    definition:
      'A feature preserved on bone — a scar, ridge, fossa or rugosity — that records the attachment of soft tissue in life. Muscle reconstruction in extinct species depends entirely on reading these correlates.',
    significance:
      'By comparing correlate positions with those of living relatives, paleontologists infer the size, orientation and action of muscles that left no direct fossil trace.',
    relatedTerms: ['Phylogenetic Bracketing', 'Adductor Musculature', 'Bone Histology'],
    triggers: ['osteological correlate', 'attachment scar', 'muscle scar', 'bone scar', 'ridge'],
  },
  {
    term: 'Adductor Musculature',
    pronunciation: 'ah-DUK-tor mus-kyoo-LAY-chur',
    category: 'anatomy',
    definition:
      'The complex of muscles that close the jaw, originating on the skull and inserting on the lower jaw (mandible). In archosaurs this includes the pterygoideus, pseudotemporalis and external adductor groups.',
    significance:
      'Cross-sectional area of the adductor muscles is the primary variable in bite-force calculations, and its estimation from fossil bone is a central challenge in reconstructing feeding ecology.',
    relatedTerms: ['Temporal Fenestra', 'Bite Force', 'Archosaur'],
    triggers: ['adductor', 'jaw muscle', 'jaw closing'],
  },
  {
    term: 'Endocast',
    pronunciation: 'EN-doh-kast',
    category: 'anatomy',
    definition:
      'A cast of the internal volume of the braincase, formed naturally by sediment infilling or artificially by CT-based digital reconstruction. Preserves the approximate size and shape of the brain.',
    significance:
      'Endocasts reveal relative brain volume, the development of specific lobes associated with vision and smell, and the bony labyrinth of the inner ear — giving the best available window into cognition and sensory acuity in extinct species.',
    relatedTerms: ['Encephalisation', 'CT Scanning', 'Bone Histology'],
    triggers: ['endocast', 'braincase', 'brain volume', 'cranial nerv'],
  },
  {
    term: 'Heterodonty',
    pronunciation: 'het-er-oh-DON-tee',
    category: 'anatomy',
    definition:
      'The condition of possessing more than one morphological type of tooth within the same jaw — for example, incisors, canines and molars in mammals, or differentiated front and rear teeth in some theropods.',
    significance:
      'Heterodont dentition implies dietary specialisation and complex food processing, and its presence or absence helps define dietary categories and phylogenetic relationships.',
    relatedTerms: ['Piscivore', 'Adductor Musculature'],
    triggers: ['heterodont', 'tooth morphology', 'differentiated teeth', 'serrated', 'dentition'],
  },

  // ── Taxonomy ─────────────────────────────────────────────────────────────────
  {
    term: 'Archosaur',
    pronunciation: 'AR-koh-sor',
    category: 'taxonomy',
    definition:
      'The major clade of reptiles that includes crocodilians, birds and all extinct dinosaurs, pterosaurs and their relatives. Defined by features including an antorbital fenestra, a hole in the lower jaw, and an upright gait in most lineages.',
    significance:
      'Archosaurs are the most species-rich and ecologically diverse lineage of large land vertebrates in Earth history, dominating terrestrial ecosystems for over 250 million years.',
    relatedTerms: ['Clade', 'Theropoda', 'Synapsid'],
    triggers: ['archosaur'],
  },
  {
    term: 'Synapsid',
    pronunciation: 'SIN-ap-sid',
    category: 'taxonomy',
    definition:
      'The amniote lineage with a single temporal fenestra behind each eye socket, including all mammals and their extinct relatives such as pelycosaurs and therapsids. The dominant land vertebrates of the Permian.',
    significance:
      'Synapsids represent the mammalian line of evolution; studying Permian synapsids illuminates the origins of traits like endothermy, complex dentition and parental care.',
    relatedTerms: ['Temporal Fenestra', 'Archosaur', 'Endothermy'],
    triggers: ['synapsid', 'mammal-like'],
  },
  {
    term: 'Coelurosaur',
    pronunciation: 'see-LURE-oh-sor',
    category: 'taxonomy',
    definition:
      'A diverse clade of hollow-boned theropod dinosaurs that includes tyrannosaurs, dromaeosaurids, oviraptorosaurs and, ultimately, modern birds. Most coelurosaurs were feathered.',
    significance:
      'Coelurosauria represents the evolutionary transition from non-avian dinosaurs to birds and contains the greatest diversity of body plans and ecological strategies within Theropoda.',
    relatedTerms: ['Theropoda', 'Archosaur', 'Clade'],
    triggers: ['coelurosaur', 'hollow-boned', 'feathered'],
  },
  {
    term: 'Theropoda',
    pronunciation: 'the-ROP-oh-dah',
    category: 'taxonomy',
    definition:
      'A major clade of saurischian dinosaurs characterised by bipedal locomotion, three-toed feet, and hollow bones. Includes all carnivorous dinosaurs of the Mesozoic and the living birds.',
    significance:
      'Theropods are the best-studied dinosaur group, providing the clearest evolutionary narrative from the Triassic apex predators through the avian radiation still ongoing today.',
    relatedTerms: ['Coelurosaur', 'Archosaur', 'Sauropodomorpha'],
    triggers: ['theropod', 'theropoda'],
  },
  {
    term: 'Sauropodomorpha',
    pronunciation: 'sore-oh-pod-oh-MOR-fah',
    category: 'taxonomy',
    definition:
      'The saurischian dinosaur clade comprising all long-necked, largely herbivorous forms, from the modest prosauropods of the Triassic through to the titanosaurs — the largest land animals ever known.',
    significance:
      'Sauropodomorphs achieved body masses an order of magnitude greater than any other land animal, requiring unique solutions to locomotion, feeding and bone growth that remain subjects of active research.',
    relatedTerms: ['Theropoda', 'Archosaur', 'Bone Histology'],
    triggers: ['sauropodomorph', 'sauropod', 'long-necked'],
  },
  {
    term: 'Clade',
    pronunciation: 'KLAYD',
    category: 'taxonomy',
    definition:
      'A group of organisms consisting of a common ancestor and all of its descendants. A clade is a natural, monophyletic unit in phylogenetic classification and is the fundamental building block of modern taxonomy.',
    significance:
      'Thinking in clades allows biologists to make biologically meaningful comparisons: traits shared within a clade reflect common inheritance rather than convergent evolution.',
    relatedTerms: ['Archosaur', 'Theropoda', 'Phylogenetic Bracketing'],
    triggers: ['clade', 'monophyletic', 'radiation'],
  },
  {
    term: 'Phylogenetic Bracketing',
    pronunciation: 'fy-loh-jen-ET-ik BRAK-et-ing',
    category: 'taxonomy',
    definition:
      'A technique for inferring the biology of an extinct species from the shared features of its closest living relatives. If both the nearest living outgroups share a trait, that trait is inferred for the fossil taxon.',
    significance:
      'Bracketing allows paleontologists to reconstruct soft-tissue anatomy, physiology and behaviour in organisms for which only hard parts are preserved — the only method available for many biological questions.',
    relatedTerms: ['Clade', 'Osteological Correlate', 'Bone Histology'],
    triggers: ['phylogenetic bracketing', 'closest relative', 'bracketing'],
  },

  // ── Behavior ─────────────────────────────────────────────────────────────────
  {
    term: 'Piscivore',
    pronunciation: 'PIS-ih-vor',
    category: 'behavior',
    definition:
      'An animal specialised for feeding primarily on fish. Piscivorous adaptations commonly include elongated jaws, conical or recurved teeth, and enhanced aquatic locomotion.',
    significance:
      'Piscivory represents an ecological niche that has evolved independently many times across vertebrate history, and identifying it in fossil species helps reconstruct ancient food webs.',
    relatedTerms: ['Heterodonty', 'Trophic Level', 'Ecological Niche'],
    triggers: ['piscivore', 'fish-eater', 'fish-eating', 'piscivorous'],
  },
  {
    term: 'Viviparity',
    pronunciation: 'vy-VIP-ar-ih-tee',
    category: 'behavior',
    definition:
      'A reproductive strategy in which young develop inside the mother and are born live rather than hatched from eggs. Well documented in ichthyosaurs and some mosasaurs from exquisitely preserved specimens.',
    significance:
      'Viviparity in fully marine reptiles such as ichthyosaurs demonstrates that some lineages became so adapted to open-water life that they could not return to land even for reproduction.',
    relatedTerms: ['Sexual Dimorphism', 'Taphonomy'],
    triggers: ['vivipari', 'live birth', 'born live', 'give birth'],
  },
  {
    term: 'Endothermy',
    pronunciation: 'en-doh-THER-mee',
    category: 'behavior',
    definition:
      'The physiological capacity to generate and maintain body heat internally through metabolic activity, independent of environmental temperature. Colloquially described as "warm-bloodedness".',
    significance:
      'Evidence from bone histology, isotope chemistry and growth rates increasingly supports elevated metabolic rates in many dinosaur lineages, fundamentally changing how we understand dinosaur ecology and activity levels.',
    relatedTerms: ['Bone Histology', 'Archosaur', 'Encephalisation'],
    triggers: ['endotherm', 'warm-blood', 'metabolic rate'],
  },
  {
    term: 'Sexual Dimorphism',
    pronunciation: 'SEK-shoo-ul dy-MOR-fizm',
    category: 'behavior',
    definition:
      'Systematic physical differences between males and females of the same species beyond reproductive organs, such as size, colouration, cranial crests or ornamental structures.',
    significance:
      'Identifying sexual dimorphism in the fossil record is methodologically difficult but important: many proposed species separations have later been reinterpreted as male-female variation within a single species.',
    relatedTerms: ['Clade', 'Bone Histology'],
    triggers: ['sexual dimorphism', 'male and female', 'dimorphic'],
  },
  {
    term: 'Encephalisation',
    pronunciation: 'en-sef-ah-lih-ZAY-shun',
    category: 'behavior',
    definition:
      'The relative brain size of an animal compared to what is expected for its body mass, expressed as an encephalisation quotient (EQ). Higher EQ values are broadly correlated with more complex behaviour.',
    significance:
      'Encephalisation quotient comparisons across extinct taxa provide a comparative framework for assessing cognitive evolution, though brain organisation and connectivity leave only indirect traces in fossil material.',
    relatedTerms: ['Endocast', 'Archosaur', 'Endothermy'],
    triggers: ['encephalisation', 'encephalization', 'brain size', 'relative brain', 'eq'],
  },

  // ── Ecology ──────────────────────────────────────────────────────────────────
  {
    term: 'Trophic Level',
    pronunciation: 'TROH-fik LEV-ul',
    category: 'ecology',
    definition:
      'The position of an organism in a food chain, measured by the number of energy-transfer steps between it and the primary producers (plants). Primary consumers are at level 2, predators of those at level 3, and so on.',
    significance:
      'Reconstructing trophic levels in ancient communities allows paleontologists to build energy-flow models of extinct ecosystems and understand how the loss of species at any level affected overall community structure.',
    relatedTerms: ['Apex Predator', 'Ecological Niche', 'Piscivore'],
    triggers: ['trophic', 'food chain', 'food web'],
  },
  {
    term: 'Apex Predator',
    pronunciation: 'AY-peks PRED-ah-tor',
    category: 'ecology',
    definition:
      'A predator at the top of its food chain with no natural predators of its own as an adult. Apex predators disproportionately structure community composition through top-down regulation of prey populations.',
    significance:
      'The presence of apex predators fundamentally reshapes ecosystems through "trophic cascades"; their loss or arrival triggers changes that cascade down through multiple trophic levels.',
    relatedTerms: ['Trophic Level', 'Ecological Niche'],
    triggers: ['apex predator', 'apex status', 'top predator', 'apex'],
  },
  {
    term: 'Ecological Niche',
    pronunciation: 'ee-koh-LOJ-ih-kul NITCH',
    category: 'ecology',
    definition:
      'The functional role of a species within its ecosystem: what it eats, what eats it, what habitats it occupies, and how it interacts with other species and its physical environment.',
    significance:
      'Understanding the ecological niche of extinct species contextualises their anatomy and helps reconstruct community dynamics, showing how empty niches may have driven diversification after mass extinctions.',
    relatedTerms: ['Trophic Level', 'Apex Predator'],
    triggers: ['ecological niche', 'niche control', 'ecological role'],
  },

  // ── Paleontology ─────────────────────────────────────────────────────────────
  {
    term: 'Trackway',
    pronunciation: 'TRAK-way',
    category: 'paleontology',
    definition:
      'A series of fossilised footprints left by a single animal, preserved in sequential positions that record locomotion. Trackways may include pace, stride length and foot morphology.',
    significance:
      'Trackways provide direct behavioural data unavailable from body fossils: actual locomotion speed, gait patterns, social grouping and, in some cases, predator-prey interactions frozen in stone.',
    relatedTerms: ['Taphonomy', 'Bone Histology'],
    triggers: ['trackway', 'trackways', 'footprint', 'stride length', 'trace fossil'],
  },
  {
    term: 'Taphonomy',
    pronunciation: 'taf-ON-oh-mee',
    category: 'paleontology',
    definition:
      'The branch of paleontology that studies how organisms decay, become buried, and are ultimately preserved as fossils. Encompasses physical processes (water transport, burial) and biological processes (scavenging, microbial decay).',
    significance:
      'Taphonomic analysis reveals whether a fossil assemblage reflects a genuine biological community or an artefact of preservation bias, critically affecting ecological and diversity reconstructions.',
    relatedTerms: ['Stratigraphy', 'Formation', 'Holotype'],
    triggers: ['taphon', 'preservation', 'fossilisation', 'fossilization'],
  },
  {
    term: 'Stratigraphy',
    pronunciation: 'strah-TIG-rah-fee',
    category: 'paleontology',
    definition:
      'The study of rock layers (strata) and their relationships in time and space. By correlating rock units across regions, geologists establish the relative and absolute ages of the organisms found within them.',
    significance:
      'Accurate stratigraphy is the foundation of all time-based claims in paleontology — without knowing the age of a fossil, it cannot be placed meaningfully within evolutionary or ecological narratives.',
    relatedTerms: ['Biostratigraphy', 'Formation', 'Taphonomy'],
    triggers: ['stratigraphy', 'stratigraphic', 'rock layer', 'geological record'],
  },
  {
    term: 'Biostratigraphy',
    pronunciation: 'by-oh-strah-TIG-rah-fee',
    category: 'paleontology',
    definition:
      'A method of relative dating that uses the known temporal ranges of fossil organisms (index fossils) to correlate rock units and establish their age, even without radiometric data.',
    significance:
      'Biostratigraphy allows age estimation of fossil-bearing rocks worldwide using only the fossils themselves, providing a universal currency for comparing sites across continents.',
    relatedTerms: ['Stratigraphy', 'Formation'],
    triggers: ['biostratigraph', 'index fossil', 'stratigraphic range'],
  },
  {
    term: 'Bone Histology',
    pronunciation: 'BOHN his-TOL-oh-jee',
    category: 'paleontology',
    definition:
      'The microscopic study of bone tissue structure. Thin sections of fossil bone reveal growth rings (lines of arrested growth), bone tissue type and vascularity — allowing age determination and metabolic rate estimation.',
    significance:
      'Bone histology is the primary tool for establishing growth rates in extinct species, providing evidence that many non-avian dinosaurs grew rapidly and may have maintained elevated metabolic rates.',
    relatedTerms: ['Endothermy', 'Phylogenetic Bracketing', 'Osteological Correlate'],
    triggers: ['bone histology', 'histolog', 'growth ring', 'bone tissue', 'growth rate'],
  },
  {
    term: 'Paleopathology',
    pronunciation: 'pay-lee-oh-pah-THOL-oh-jee',
    category: 'paleontology',
    definition:
      'The study of disease, injury and abnormal conditions preserved in fossil organisms. Includes healed fractures, infections, arthritis, tumours and bite marks recorded in bone.',
    significance:
      'Paleopathological evidence provides direct data on the lived experience of ancient animals — documenting predator-prey interactions, intraspecific combat and the diseases that shaped individual lives.',
    relatedTerms: ['Taphonomy', 'Bone Histology'],
    triggers: ['pathol', 'healed fracture', 'healed injur', 'bite mark', 'infection', 'disease'],
  },
  {
    term: 'CT Scanning',
    pronunciation: 'see-tee SKAN-ing',
    category: 'paleontology',
    definition:
      'Computed Tomography: a technique that combines multiple X-ray images taken from different angles to produce detailed cross-sectional images of the interior of an object, including fossil bones, without physical sectioning.',
    significance:
      'CT scanning has revolutionised paleontology by revealing internal structure, endocranial morphology, inner ear anatomy and embedded embryos in specimens that cannot be physically prepared.',
    relatedTerms: ['Endocast', 'Bone Histology'],
    triggers: ['ct scan', 'computed tomography', 'synchrotron', 'imaging technique', 'internal structur'],
  },
  {
    term: 'Holotype',
    pronunciation: 'HOH-loh-type',
    category: 'paleontology',
    definition:
      'The single physical specimen designated as the name-bearing type for a species when it is formally described. All future assignments of other specimens to that species are made by comparison to the holotype.',
    significance:
      'The holotype anchors the species concept: if the holotype is later found to belong to a previously named species, the newer name becomes invalid, requiring taxonomic revision.',
    relatedTerms: ['Stratigraphy', 'Taphonomy'],
    triggers: ['holotype', 'type specimen', 'first described', 'formally described'],
  },
  {
    term: 'Formation',
    pronunciation: 'for-MAY-shun',
    category: 'paleontology',
    definition:
      'A formally defined and named body of rock of sufficient thickness and geographic extent to be mapped, distinguished from adjacent units by its lithological character and typically representing a particular environment of deposition.',
    significance:
      'Named formations are the primary reference units for fossil localities: saying a species comes from the Hell Creek Formation immediately implies a known age, geography and depositional environment to any paleontologist.',
    relatedTerms: ['Stratigraphy', 'Taphonomy', 'Biostratigraphy'],
    triggers: ['formation', 'geological formation', 'rock unit'],
  },
];
