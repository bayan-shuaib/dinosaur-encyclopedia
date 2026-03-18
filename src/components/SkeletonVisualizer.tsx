import { useState } from 'react';
import { Dinosaur } from '@/data/types';
import { SpecimenOverlay } from '@/components/SpecimenOverlay';

const COLORS = [
  'hsl(0, 70%, 55%)',
  'hsl(210, 70%, 55%)',
  'hsl(142, 50%, 45%)',
  'hsl(45, 80%, 55%)',
];

// Skeletal bone regions with SVG paths per bone area
interface BoneRegion {
  name: string;
  path: string;
}

// Theropod skeleton regions
const THEROPOD_BONES: BoneRegion[] = [
  { name: 'Skull', path: 'M155,20 Q160,15 168,14 L176,15 Q182,17 185,22 L186,28 Q185,33 180,35 L172,36 Q165,35 160,32 L156,28 Q154,24 155,20 Z' },
  { name: 'Cervical Vertebrae', path: 'M140,28 L155,22 Q155,26 155,30 L154,34 Q150,36 146,35 L142,33 Q140,31 140,28 Z' },
  { name: 'Dorsal Vertebrae', path: 'M90,30 L140,28 L142,33 L146,35 Q148,38 146,40 L140,42 L90,44 L88,40 Q86,36 88,33 L90,30 Z' },
  { name: 'Ribs', path: 'M95,40 Q100,42 105,44 L108,52 Q110,60 108,68 L104,72 Q100,68 98,62 L96,54 Q94,48 95,40 Z M110,40 Q115,42 118,44 L120,52 Q122,60 120,68 L116,72 Q112,68 110,62 L108,54 Q106,48 110,40 Z M125,40 Q130,42 132,44 L134,52 Q136,58 134,64 L130,68 Q126,64 124,58 L122,52 Q120,46 125,40 Z' },
  { name: 'Sacral Vertebrae', path: 'M70,32 L90,30 L88,33 Q86,36 88,40 L90,44 L70,46 L68,42 Q66,38 68,35 L70,32 Z' },
  { name: 'Tail Vertebrae', path: 'M10,50 L70,32 L68,35 Q66,38 68,42 L70,46 L12,56 Q10,54 10,50 Z' },
  { name: 'Scapula', path: 'M130,38 L138,36 Q140,40 140,44 L136,48 Q132,46 130,42 L130,38 Z' },
  { name: 'Humerus', path: 'M132,48 L136,48 Q138,54 138,60 L136,64 Q134,62 132,58 L132,48 Z' },
  { name: 'Forearm', path: 'M134,64 L138,64 Q140,70 142,76 L140,78 Q136,76 134,72 L134,64 Z' },
  { name: 'Pelvis', path: 'M66,36 L82,34 Q86,36 86,40 L84,46 L78,50 Q72,48 68,46 L66,42 Q64,38 66,36 Z' },
  { name: 'Femur', path: 'M76,50 L82,50 Q84,58 86,66 L88,74 Q86,78 82,80 L78,78 Q76,72 74,66 L76,50 Z' },
  { name: 'Tibia', path: 'M80,80 L86,80 Q88,88 90,96 L88,100 Q84,98 82,94 L80,80 Z' },
  { name: 'Metatarsals', path: 'M82,100 L90,100 Q92,104 90,108 L84,108 Q80,106 82,100 Z' },
];

// Ceratopsian skeleton regions
const CERATOPSIAN_BONES: BoneRegion[] = [
  { name: 'Skull & Frill', path: 'M155,18 Q160,10 170,8 L182,10 Q190,14 195,22 L196,30 Q195,38 190,42 L180,44 Q170,42 162,38 L158,32 Q155,26 155,18 Z' },
  { name: 'Horns', path: 'M170,8 L168,2 Q170,0 172,2 L174,8 Z M180,10 L182,4 Q184,2 186,4 L184,12 Z' },
  { name: 'Cervical Vertebrae', path: 'M140,30 L155,24 Q156,28 156,32 L154,36 Q148,38 144,36 L140,34 L140,30 Z' },
  { name: 'Dorsal Vertebrae', path: 'M80,34 L140,30 L140,34 L144,36 Q146,40 144,42 L80,46 Q76,42 78,38 L80,34 Z' },
  { name: 'Ribs', path: 'M90,42 Q96,44 100,46 L102,56 Q104,64 100,70 L96,68 Q92,62 90,54 L90,42 Z M112,42 Q118,44 120,46 L122,56 Q124,62 120,68 L116,66 Q112,60 112,52 L112,42 Z M130,40 Q134,42 136,44 L138,52 Q138,58 136,62 L132,60 Q130,56 130,48 L130,40 Z' },
  { name: 'Sacral Vertebrae', path: 'M60,36 L80,34 L78,38 Q76,42 80,46 L60,48 Q56,44 58,40 L60,36 Z' },
  { name: 'Tail Vertebrae', path: 'M15,52 L60,36 L58,40 Q56,44 60,48 L16,58 Q14,56 15,52 Z' },
  { name: 'Pelvis', path: 'M58,38 L74,36 Q78,38 78,42 L76,48 Q70,52 64,50 L60,46 Q56,42 58,38 Z' },
  { name: 'Femur', path: 'M68,50 L74,50 Q76,60 78,70 L76,76 Q72,74 70,68 L68,50 Z' },
  { name: 'Tibia', path: 'M72,76 L78,76 Q80,86 82,94 L80,98 Q76,96 74,90 L72,76 Z' },
  { name: 'Forelimb', path: 'M140,42 L146,42 Q148,52 150,62 L148,68 Q144,66 142,60 L140,42 Z' },
  { name: 'Metatarsals', path: 'M74,98 L82,98 Q84,102 82,106 L76,106 Q72,104 74,98 Z' },
];

function getSkeletonBones(d: Dinosaur): BoneRegion[] {
  const group = d.group.toLowerCase();
  if (group.includes('ceratop')) return CERATOPSIAN_BONES;
  return THEROPOD_BONES;
}

interface Props {
  dinosaurs: Dinosaur[];
  skeletonMode: boolean;
}

export default function SkeletonVisualizer({ dinosaurs, skeletonMode }: Props) {
  const [hoveredBone, setHoveredBone] = useState<{ dinoId: string; bone: string } | null>(null);

  if (!skeletonMode) return null;

  return (
    <SpecimenOverlay label="Skeleton Comparison">
    <div className="mt-6 grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(dinosaurs.length, 4)}, 1fr)` }}>
      {dinosaurs.map((d, i) => {
        const bones = getSkeletonBones(d);
        const completeness = d.skeletonData.completeness / 100;
        const recoveredSet = new Set(d.skeletonData.recoveredBones.map(b => b.toLowerCase()));

        return (
          <div key={d.id} className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-sm font-medium text-foreground">{d.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">{d.skeletonData.completeness}%</span>
            </div>

            <div className="relative bg-secondary/30 rounded-lg p-3 border border-border/30">
              <svg viewBox="0 0 200 115" className="w-full" style={{ minHeight: 120 }}>
                {/* Background glow for discovered bones */}
                <defs>
                  <filter id={`glow-${d.id}`}>
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {bones.map((bone) => {
                  const isRecovered = isBoneRecovered(bone.name, recoveredSet, completeness);
                  const isHovered = hoveredBone?.dinoId === d.id && hoveredBone?.bone === bone.name;

                  return (
                    <g key={bone.name}>
                      <path
                        d={bone.path}
                        fill={isRecovered ? 'hsl(0, 0%, 88%)' : 'hsl(0, 0%, 22%)'}
                        stroke={isHovered ? COLORS[i] : (isRecovered ? 'hsl(0, 0%, 70%)' : 'hsl(0, 0%, 18%)')}
                        strokeWidth={isHovered ? 1.5 : 0.5}
                        opacity={isRecovered ? 1 : 0.5}
                        filter={isRecovered && isHovered ? `url(#glow-${d.id})` : undefined}
                        className="cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setHoveredBone({ dinoId: d.id, bone: bone.name })}
                        onMouseLeave={() => setHoveredBone(null)}
                        style={{
                          transition: 'fill 0.5s ease, opacity 0.5s ease, stroke 0.2s ease',
                        }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Bone tooltip */}
              {hoveredBone?.dinoId === d.id && (
                <div className="absolute top-2 right-2 z-10 bg-card border border-border rounded-lg px-3 py-2 shadow-xl pointer-events-none">
                  <p className="text-[11px] font-medium text-foreground">{hoveredBone.bone}</p>
                  <p className="text-[9px] text-muted-foreground">
                    {isBoneRecovered(hoveredBone.bone, recoveredSet, completeness)
                      ? '✓ Fossil discovered'
                      : '○ Reconstructed'}
                  </p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm bg-[hsl(0,0%,88%)]" />
                <span className="text-[9px] text-muted-foreground">Discovered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm bg-[hsl(0,0%,22%)]" />
                <span className="text-[9px] text-muted-foreground">Reconstructed</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
    </SpecimenOverlay>
  );
}

function isBoneRecovered(boneName: string, recoveredSet: Set<string>, completeness: number): boolean {
  const boneNameLower = boneName.toLowerCase();
  // Check if the bone name or part of it matches recovered bones
  for (const rb of recoveredSet) {
    if (boneNameLower.includes(rb) || rb.includes(boneNameLower)) return true;
    // Partial matching for common bone names
    const parts = boneNameLower.split(/[\s&]+/);
    for (const part of parts) {
      if (part.length > 3 && rb.includes(part)) return true;
    }
  }
  // Fallback: use completeness probability
  // Hash the bone name for deterministic randomness
  let hash = 0;
  for (let i = 0; i < boneName.length; i++) hash = ((hash << 5) - hash + boneName.charCodeAt(i)) | 0;
  return (Math.abs(hash) % 100) / 100 < completeness;
}
