export type Diet = 'Carnivore' | 'Herbivore' | 'Omnivore' | 'Piscivore' | 'Insectivore';
export type Period = 'Permian' | 'Triassic' | 'Jurassic' | 'Cretaceous';
export type DinosaurGroup =
  | 'Theropods'
  | 'Sauropods'
  | 'Ceratopsians'
  | 'Ornithopods'
  | 'Thyreophora'
  | 'Dromaeosauridae'
  | 'Synapsids'
  | 'Prosauropods'
  | 'Herrerasaurids'
  | 'Dicynodonts'
  | 'Temnospondyls'
  | 'Dinosauriformes'
  | 'Phytosaurs'
  | 'Ichthyosaurs'
  | 'Rauisuchians'
  | 'Pterosaurs'
  | 'Stegosaurs'
  | 'Ankylosaurs'
  | 'Pachycephalosaurs'
  | 'Hadrosaurs'
  | 'Abelisaurids'
  | 'Tyrannosaurids'
  | 'Plesiosaurs'
  | 'Mosasaurs'
  | 'Titanosaurs'
  | 'Spinosaurids'
  | 'Crocodylomorphs'
  | 'Nodosaurids'
  | 'Ornithomimosaurs'
  | 'Oviraptorosaurs'
  | 'Therizinosaurids'
  | 'Troodontids';

export interface Classification {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
}

export interface Discovery {
  year: number;
  discoverer: string;
  location: string;
}

export interface SkeletonData {
  completeness: number;
  recoveredBones: string[];
  missingBones: string[];
}

export interface CombatStats {
  aggression: number;  // 1-10
  speed: number;       // 1-10
  biteForce: number;   // 1-10
  defense: number;     // 1-10
  intelligence: number;// 1-10
  size: number;        // 1-10
}

export interface Dinosaur {
  id: string;
  name: string;
  scientificName: string;
  period: Period;
  periodRange: { start: number; end: number };
  diet: Diet;
  group: DinosaurGroup;
  length: number;
  height: number;
  weight: number;
  description: string;
  habitat: string;
  continent: string;
  classification: Classification;
  discovery: Discovery;
  distinctFeatures: string[];
  image: string;
  galleryImages: string[];
  skeletonData: SkeletonData;
  relatedIds: string[];
  combatStats: CombatStats;
  sketchfabUrl?: string;
}
