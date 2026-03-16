import { Link } from 'react-router-dom';
import { Dinosaur } from '@/data/types';
import { Leaf, Drumstick, Bug, Fish } from 'lucide-react';

function getDietIcons(diet: string) {
  // facts.app style: show relevant diet icons
  const icons: { icon: React.ReactNode; active: boolean; label: string }[] = [
    { icon: <Fish className="w-3.5 h-3.5" />, active: diet === 'Piscivore' || diet === 'Omnivore', label: 'Fish' },
    { icon: <Bug className="w-3.5 h-3.5" />, active: diet === 'Insectivore' || diet === 'Omnivore', label: 'Insects' },
    { icon: <Leaf className="w-3.5 h-3.5" />, active: diet === 'Herbivore' || diet === 'Omnivore', label: 'Plants' },
    { icon: <Drumstick className="w-3.5 h-3.5" />, active: diet === 'Carnivore' || diet === 'Omnivore' || diet === 'Piscivore', label: 'Meat' },
  ];
  return icons;
}

interface DinosaurGridCardProps {
  dinosaur: Dinosaur;
}

export function DinosaurGridCard({ dinosaur }: DinosaurGridCardProps) {
  const dietIcons = getDietIcons(dinosaur.diet);

  return (
    <Link to={`/dinosaur/${dinosaur.id}`} className="dino-card group relative">
      {/* Plus icon like facts.app */}
      <div className="absolute top-2.5 left-2.5 z-10 w-5 h-5 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground/50 group-hover:text-foreground group-hover:border-foreground/30 transition-colors">
        <span className="text-xs leading-none">+</span>
      </div>

      {/* Image area - dark with silhouette placeholder */}
      <div className="aspect-square bg-secondary/80 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="text-5xl font-condensed font-bold text-muted-foreground/10 uppercase text-center leading-none select-none">
          {dinosaur.name.split(' ')[0]}
        </div>
      </div>

      {/* Name block */}
      <div className="px-3 pt-2.5 pb-1">
        <p className="font-condensed font-bold uppercase text-[13px] tracking-wide text-foreground leading-tight">
          {dinosaur.name.toUpperCase()}
        </p>
        <p className="font-condensed text-[11px] text-muted-foreground italic mt-0.5 truncate leading-tight">
          {dinosaur.scientificName.split(' ').slice(1).join(' ').toLowerCase()}
        </p>
      </div>

      {/* Diet icons row - facts.app style */}
      <div className="px-3 pb-3 pt-1 flex items-center gap-2">
        {dietIcons.map((item, i) => (
          <span
            key={i}
            className={`transition-colors ${item.active ? 'text-foreground/70' : 'text-muted-foreground/20'}`}
            title={item.label}
          >
            {item.icon}
          </span>
        ))}
      </div>
    </Link>
  );
}

export function DinosaurListCard({ dinosaur }: DinosaurGridCardProps) {
  const dietIcons = getDietIcons(dinosaur.diet);

  return (
    <Link
      to={`/dinosaur/${dinosaur.id}`}
      className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-card transition-colors group"
    >
      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <span className="text-lg font-condensed font-bold text-muted-foreground/20">
          {dinosaur.name[0]}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-condensed font-bold uppercase tracking-wide text-[13px] text-foreground">{dinosaur.name.toUpperCase()}</p>
        <p className="font-condensed text-[11px] text-muted-foreground italic truncate">{dinosaur.scientificName.split(' ').slice(1).join(' ').toLowerCase()}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {dietIcons.map((item, i) => (
          <span key={i} className={item.active ? 'text-foreground/70' : 'text-muted-foreground/20'}>
            {item.icon}
          </span>
        ))}
      </div>
    </Link>
  );
}
