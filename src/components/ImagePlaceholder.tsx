import { Mountain, Bone, Eye, Footprints, Image as ImageIcon, Microscope, Map as MapIcon, Utensils, Brain, HeartPulse } from 'lucide-react';

export type PlaceholderKind =
  | 'habitat'
  | 'reconstruction'
  | 'diet'
  | 'behavior'
  | 'social'
  | 'reproduction'
  | 'skeleton'
  | 'fossil'
  | 'anatomy'
  | 'locomotion'
  | 'bite'
  | 'strength'
  | 'intelligence'
  | 'pathology'
  | 'distribution'
  | 'generic';

const KIND_META: Record<PlaceholderKind, { icon: typeof Mountain; defaultLabel: string }> = {
  habitat:        { icon: Mountain,    defaultLabel: 'Habitat Image' },
  reconstruction: { icon: Eye,         defaultLabel: 'Life Reconstruction' },
  diet:           { icon: Utensils,    defaultLabel: 'Feeding Scene' },
  behavior:       { icon: Footprints,  defaultLabel: 'Behavioral Image' },
  social:         { icon: Eye,         defaultLabel: 'Social Group Scene' },
  reproduction:   { icon: HeartPulse,  defaultLabel: 'Reproduction Image' },
  skeleton:       { icon: Bone,        defaultLabel: 'Skeleton Diagram' },
  fossil:         { icon: Microscope,  defaultLabel: 'Fossil Image' },
  anatomy:        { icon: Bone,        defaultLabel: 'Anatomical Diagram' },
  locomotion:     { icon: Footprints,  defaultLabel: 'Locomotion Diagram' },
  bite:           { icon: Bone,        defaultLabel: 'Skull / Bite Diagram' },
  strength:       { icon: Bone,        defaultLabel: 'Musculature Diagram' },
  intelligence:   { icon: Brain,       defaultLabel: 'Endocast / Brain Diagram' },
  pathology:      { icon: Microscope,  defaultLabel: 'Fossil Pathology' },
  distribution:   { icon: MapIcon,     defaultLabel: 'Distribution Map' },
  generic:        { icon: ImageIcon,   defaultLabel: 'Image' },
};

const RATIO_CLASS: Record<string, string> = {
  '16/9': 'aspect-video',
  '4/3':  'aspect-[4/3]',
  '3/4':  'aspect-[3/4]',
  '1/1':  'aspect-square',
  '21/9': 'aspect-[21/9]',
};

interface Props {
  kind: PlaceholderKind;
  label?: string;
  ratio?: keyof typeof RATIO_CLASS;
  className?: string;
}

export function ImagePlaceholder({ kind, label, ratio = '16/9', className = '' }: Props) {
  const { icon: Icon, defaultLabel } = KIND_META[kind];
  const text = label ?? defaultLabel;

  return (
    <figure
      className={`group relative ${RATIO_CLASS[ratio]} w-full overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-secondary/30 via-card to-secondary/20 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.55)] hover:border-border/70 ${className}`}
      data-testid={`placeholder-${kind}`}
    >
      {/* Subtle radial accent */}
      <div className="absolute inset-0 opacity-50 transition-opacity duration-500 group-hover:opacity-70"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, hsl(35,40%,18%,0.35), transparent 60%), radial-gradient(ellipse at 70% 80%, hsl(195,30%,16%,0.30), transparent 60%)',
        }}
      />
      {/* Faint grid texture */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <figcaption className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground/70 transition-colors duration-500 group-hover:text-muted-foreground">
        <Icon className="h-8 w-8 stroke-[1.4]" />
        <span className="text-[11px] font-display tracking-[0.18em] uppercase">{text}</span>
      </figcaption>
      {/* Corner tag */}
      <span className="absolute top-3 left-3 text-[9px] font-mono uppercase tracking-[0.18em] text-muted-foreground/40">
        Placeholder
      </span>
    </figure>
  );
}
