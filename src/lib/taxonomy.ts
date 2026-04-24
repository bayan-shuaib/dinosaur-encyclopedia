import type { Dinosaur, DinosaurGroup } from '@/data/types';

export type TaxonomyType = 'dinosaur' | 'pterosaur' | 'marine_reptile';

export const PTEROSAUR_GROUPS: DinosaurGroup[] = ['Pterosaurs'];

export const MARINE_REPTILE_GROUPS: DinosaurGroup[] = [
  'Plesiosaurs',
  'Mosasaurs',
  'Ichthyosaurs',
  'Phytosaurs',
  'Crocodylomorphs',
  'Rauisuchians',
];

export function getTaxonomyType(dino: Dinosaur): TaxonomyType {
  if (PTEROSAUR_GROUPS.includes(dino.group)) return 'pterosaur';
  if (MARINE_REPTILE_GROUPS.includes(dino.group)) return 'marine_reptile';
  return 'dinosaur';
}

export function getTaxonomyLabel(t: TaxonomyType): string {
  switch (t) {
    case 'pterosaur':
      return 'Pterosaur';
    case 'marine_reptile':
      return 'Marine Reptile';
    default:
      return 'Dinosaur';
  }
}

export type StatIconKey = 'length' | 'height' | 'weight' | 'wingspan' | 'depth';

export interface DisplayStat {
  label: string;
  value: string;
  iconKey: StatIconKey;
}

export function formatWeight(w: number): string {
  return w >= 1000 ? `${(w / 1000).toFixed(1)} t` : `${w} kg`;
}

export function getDisplayStats(dino: Dinosaur): DisplayStat[] {
  const t = getTaxonomyType(dino);
  if (t === 'pterosaur') {
    return [
      { label: 'Wingspan', value: `${dino.wingspan ?? dino.length} m`, iconKey: 'wingspan' },
      { label: 'Weight', value: formatWeight(dino.weight), iconKey: 'weight' },
      { label: 'Body Length', value: `${dino.length} m`, iconKey: 'length' },
    ];
  }
  if (t === 'marine_reptile') {
    return [
      { label: 'Length', value: `${dino.length} m`, iconKey: 'length' },
      { label: 'Weight', value: formatWeight(dino.weight), iconKey: 'weight' },
      { label: 'Body Depth', value: `${dino.bodyDepth ?? dino.height} m`, iconKey: 'depth' },
    ];
  }
  return [
    { label: 'Length', value: `${dino.length} m`, iconKey: 'length' },
    { label: 'Height', value: `${dino.height} m`, iconKey: 'height' },
    { label: 'Weight', value: formatWeight(dino.weight), iconKey: 'weight' },
  ];
}
