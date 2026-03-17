interface SizeComparisonProps {
  dinoName: string;
  dinoHeight: number;
  dinoLength: number;
}

function HumanSilhouette({ scale }: { scale: number }) {
  return (
    <svg
      viewBox="0 0 28 80"
      style={{ height: `${scale * 100}%`, width: 'auto', minHeight: 20 }}
      fill="hsl(0,0%,60%)"
    >
      {/* Head */}
      <ellipse cx="14" cy="6" rx="5.5" ry="6" />
      {/* Neck */}
      <rect x="11.5" y="11.5" width="5" height="4" rx="1.5" />
      {/* Torso */}
      <path d="M8 15 Q6 18 6.5 27 Q7 32 10 33 L10 44 L18 44 L18 33 Q21 32 21.5 27 Q22 18 20 15 Z" />
      {/* Left arm */}
      <path d="M8 16 Q4 22 4.5 30 Q5 32 6.5 33 Q8 30 8.5 24 L9.5 18 Z" />
      {/* Right arm */}
      <path d="M20 16 Q24 22 23.5 30 Q23 32 21.5 33 Q20 30 19.5 24 L18.5 18 Z" />
      {/* Left leg */}
      <path d="M10 43 Q9 55 9.5 66 Q10 70 11 72 Q13 72 13.5 70 L14 58 L13 43 Z" />
      {/* Right leg */}
      <path d="M18 43 Q19 55 18.5 66 Q18 70 17 72 Q15 72 14.5 70 L14 58 L15 43 Z" />
      {/* Feet */}
      <ellipse cx="11" cy="72.5" rx="4" ry="2.2" />
      <ellipse cx="17" cy="72.5" rx="4" ry="2.2" />
    </svg>
  );
}

function getBipedPath(length: number, height: number): string {
  const l = length;
  const h = height;
  const vb = 120;
  const vbh = 60;
  const bodyLen = vb * 0.5;
  const bodyH = vbh * 0.38;
  const neckLen = vbh * 0.22;
  const headR = vbh * 0.12;
  const tailLen = vb * 0.38;

  const hipX = vb * 0.52;
  const hipY = vbh * 0.48;

  return [
    `M ${hipX - bodyLen * 0.1} ${hipY - bodyH * 0.1}`,
    `Q ${hipX - bodyLen * 0.5} ${hipY - bodyH * 0.5} ${hipX - bodyLen * 0.7} ${hipY - bodyH * 0.3}`,
    `Q ${hipX - tailLen} ${hipY + bodyH * 0.1} ${hipX - tailLen - 10} ${hipY + bodyH * 0.2}`,
    `Q ${hipX - tailLen - 4} ${hipY + bodyH * 0.3} ${hipX - tailLen + 4} ${hipY + bodyH * 0.18}`,
    `Q ${hipX - bodyLen * 0.5} ${hipY + bodyH * 0.5} ${hipX} ${hipY + bodyH * 0.5}`,
    `Q ${hipX + bodyLen * 0.4} ${hipY + bodyH * 0.3} ${hipX + bodyLen * 0.5} ${hipY}`,
    `Q ${hipX + bodyLen * 0.4} ${hipY - bodyH * 0.4} ${hipX + bodyLen * 0.3} ${hipY - bodyH * 0.6}`,
    `Q ${hipX + bodyLen * 0.25} ${hipY - bodyH - neckLen * 0.4} ${hipX + bodyLen * 0.2} ${hipY - bodyH - neckLen * 0.8}`,
    `Q ${hipX + bodyLen * 0.15} ${hipY - bodyH - neckLen - headR * 0.6} ${hipX + bodyLen * 0.1} ${hipY - bodyH - neckLen - headR * 0.2}`,
    `Q ${hipX + bodyLen * 0.05} ${hipY - bodyH - neckLen - headR * 0.8} ${hipX + bodyLen * 0.08} ${hipY - bodyH - neckLen - headR * 1.6}`,
    `Q ${hipX + bodyLen * 0.18} ${hipY - bodyH - neckLen - headR * 2.2} ${hipX + bodyLen * 0.3} ${hipY - bodyH - neckLen - headR * 1.8}`,
    `Q ${hipX + bodyLen * 0.38} ${hipY - bodyH - neckLen - headR * 1.0} ${hipX + bodyLen * 0.3} ${hipY - bodyH - neckLen * 0.5}`,
    `Q ${hipX + bodyLen * 0.5} ${hipY - bodyH * 0.2} ${hipX + bodyLen * 0.52} ${hipY - bodyH * 0.0}`,
    `Q ${hipX + bodyLen * 0.3} ${hipY - bodyH * 0.0} ${hipX} ${hipY}`,
    `Q ${hipX - bodyLen * 0.05} ${hipY + bodyH * 0.1} ${hipX - bodyLen * 0.1} ${hipY - bodyH * 0.1}`,
    'Z',
  ].join(' ');
}

function getQuadrupedPath(): string {
  return [
    'M 8 35',
    'Q 6 20 10 14',
    'Q 14 10 22 10',
    'Q 30 10 34 16',
    'Q 36 10 38 8',
    'Q 48 4 56 8',
    'Q 60 12 62 18',
    'Q 78 20 90 28',
    'Q 100 34 105 38',
    'Q 112 40 115 38',
    'Q 118 36 116 42',
    'Q 112 46 105 44',
    'Q 98 44 94 50',
    'Q 94 58 88 60',
    'Q 82 62 80 58',
    'Q 78 52 80 46',
    'Q 72 50 60 50',
    'Q 50 50 40 50',
    'Q 38 56 32 58',
    'Q 26 60 24 56',
    'Q 22 50 24 44',
    'Q 18 44 12 44',
    'Q 6 42 8 35',
    'Z',
  ].join(' ');
}

function detectPosture(dinoName: string, length: number, height: number): 'biped' | 'quadruped' | 'sail' {
  const n = dinoName.toLowerCase();
  if (n.includes('dimetrodon')) return 'sail';
  if (
    n.includes('triceratops') || n.includes('stegosaurus') || n.includes('ankylosaurus') ||
    n.includes('brachiosaurus') || n.includes('diplodocus') || n.includes('apatosaurus') ||
    n.includes('argentinosaurus') || n.includes('patagotitan') || n.includes('iguanodon') ||
    n.includes('hadrosaur') || n.includes('parasaurolophus') || n.includes('nodosaurus') ||
    n.includes('sauropod') || n.includes('camarasaurus') || n.includes('torosaurus')
  ) return 'quadruped';
  if (length / height > 4.5) return 'quadruped';
  return 'biped';
}

export function SizeComparison({ dinoName, dinoHeight, dinoLength }: SizeComparisonProps) {
  const humanHeight = 1.7;
  const maxH = Math.max(dinoHeight, humanHeight);
  const humanScale = humanHeight / maxH;
  const dinoScale = dinoHeight / maxH;

  const posture = detectPosture(dinoName, dinoLength, dinoHeight);

  return (
    <div className="info-panel">
      <p className="section-label">Size Comparison</p>
      <div className="flex items-end justify-center gap-10 mt-6" style={{ height: 160 }}>

        {/* Human */}
        <div className="flex flex-col items-center justify-end h-full">
          <div className="flex items-end justify-center" style={{ height: `${humanScale * 100}%` }}>
            <HumanSilhouette scale={1} />
          </div>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-muted-foreground/70 font-body">Human</p>
            <p className="text-[9px] text-muted-foreground/40">1.7m</p>
          </div>
        </div>

        {/* Dinosaur */}
        <div className="flex flex-col items-center justify-end h-full">
          <div className="flex items-end justify-center" style={{ height: `${dinoScale * 100}%`, minHeight: 24 }}>
            {posture === 'biped' && (
              <svg
                viewBox="0 0 120 80"
                style={{ height: '100%', width: 'auto', maxWidth: 140, minWidth: 48 }}
                fill="hsl(0,0%,50%)"
                opacity={0.7}
              >
                {/* Body */}
                <ellipse cx="52" cy="42" rx="22" ry="14" />
                {/* Neck */}
                <path d="M 68 34 Q 76 24 78 18 Q 82 12 80 8" stroke="hsl(0,0%,50%)" strokeWidth="8" strokeLinecap="round" fill="none" opacity={0.7} />
                {/* Head */}
                <path d="M 72 6 Q 86 2 96 6 Q 100 10 98 14 Q 96 18 88 18 Q 82 16 74 12 Z" fill="hsl(0,0%,50%)" opacity={0.7} />
                {/* Tail */}
                <path d="M 30 44 Q 14 46 4 52 Q 2 54 4 56 Q 8 54 18 52 Q 26 50 32 48 Z" fill="hsl(0,0%,50%)" opacity={0.7} />
                {/* Thigh L */}
                <path d="M 44 52 Q 42 60 38 68 Q 40 70 44 68 Q 46 62 48 54 Z" fill="hsl(0,0%,45%)" opacity={0.7} />
                {/* Shin L */}
                <path d="M 38 68 Q 34 74 34 78 Q 36 80 40 78 Q 40 74 44 68 Z" fill="hsl(0,0%,45%)" opacity={0.7} />
                {/* Thigh R */}
                <path d="M 52 54 Q 52 62 50 70 Q 52 72 56 70 Q 56 62 56 54 Z" fill="hsl(0,0%,45%)" opacity={0.7} />
                {/* Shin R */}
                <path d="M 50 70 Q 48 76 50 80 Q 52 80 56 78 Q 54 74 56 70 Z" fill="hsl(0,0%,45%)" opacity={0.7} />
                {/* Forelimb */}
                <path d="M 62 40 Q 66 50 64 56 Q 62 56 60 54 Q 62 48 60 42 Z" fill="hsl(0,0%,45%)" opacity={0.6} />
              </svg>
            )}

            {posture === 'quadruped' && (
              <svg
                viewBox="0 0 130 80"
                style={{ height: '100%', width: 'auto', maxWidth: 200, minWidth: 80 }}
                fill="hsl(0,0%,50%)"
                opacity={0.7}
              >
                {/* Body */}
                <ellipse cx="65" cy="36" rx="40" ry="20" />
                {/* Head */}
                <ellipse cx="108" cy="28" rx="16" ry="12" />
                {/* Snout */}
                <path d="M 118 26 Q 126 28 124 32 Q 120 34 116 32 Z" />
                {/* Neck */}
                <path d="M 92 26 Q 100 20 106 22" stroke="hsl(0,0%,50%)" strokeWidth="10" fill="none" strokeLinecap="round" opacity={0.7} />
                {/* Tail */}
                <path d="M 25 40 Q 10 44 4 50 Q 6 52 10 50 Q 18 46 26 42 Z" />
                {/* Front-left leg */}
                <path d="M 88 52 Q 86 62 84 72 Q 86 74 90 72 Q 90 62 92 52 Z" fill="hsl(0,0%,45%)" />
                {/* Front-right leg */}
                <path d="M 98 52 Q 98 62 98 72 Q 100 74 104 72 Q 102 62 102 52 Z" fill="hsl(0,0%,45%)" />
                {/* Rear-left leg */}
                <path d="M 40 54 Q 38 64 36 72 Q 38 74 42 72 Q 42 64 44 54 Z" fill="hsl(0,0%,45%)" />
                {/* Rear-right leg */}
                <path d="M 52 54 Q 52 64 52 72 Q 54 74 58 72 Q 56 64 56 54 Z" fill="hsl(0,0%,45%)" />
              </svg>
            )}

            {posture === 'sail' && (
              <svg
                viewBox="0 0 130 80"
                style={{ height: '100%', width: 'auto', maxWidth: 180, minWidth: 60 }}
                fill="hsl(0,0%,50%)"
                opacity={0.7}
              >
                {/* Body */}
                <ellipse cx="65" cy="52" rx="38" ry="16" />
                {/* Head */}
                <ellipse cx="105" cy="42" rx="14" ry="10" />
                <path d="M 114 40 Q 122 42 120 46 Q 116 48 112 46 Z" />
                {/* Neck */}
                <path d="M 90 44 Q 98 38 102 40" stroke="hsl(0,0%,50%)" strokeWidth="9" fill="none" strokeLinecap="round" opacity={0.7} />
                {/* Tail */}
                <path d="M 27 54 Q 12 56 4 60 Q 6 63 10 61 Q 18 58 28 56 Z" />
                {/* Sail */}
                <path d="M 55 36 Q 52 10 56 4 Q 60 2 62 6 Q 64 14 64 36 Z" opacity={0.6} />
                <path d="M 64 36 Q 63 8 67 4 Q 71 2 72 6 Q 72 16 72 36 Z" opacity={0.6} />
                <path d="M 72 36 Q 74 12 76 6 Q 80 2 81 6 Q 80 18 78 36 Z" opacity={0.5} />
                {/* Legs */}
                <path d="M 48 64 Q 44 70 44 76 Q 46 78 50 76 Q 50 70 52 64 Z" fill="hsl(0,0%,45%)" />
                <path d="M 58 64 Q 58 70 58 76 Q 60 78 64 76 Q 62 70 62 64 Z" fill="hsl(0,0%,45%)" />
                <path d="M 76 64 Q 74 70 74 76 Q 76 78 80 76 Q 80 70 80 64 Z" fill="hsl(0,0%,45%)" />
                <path d="M 86 64 Q 86 70 86 76 Q 88 78 92 76 Q 90 70 90 64 Z" fill="hsl(0,0%,45%)" />
              </svg>
            )}
          </div>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-muted-foreground/70 font-body">{dinoName}</p>
            <p className="text-[9px] text-muted-foreground/40">{dinoHeight}m tall · {dinoLength}m long</p>
          </div>
        </div>
      </div>

      {/* Ground line */}
      <div className="mt-3 mx-4 h-px rounded-full" style={{ background: 'linear-gradient(to right, transparent, hsl(0,0%,25%), transparent)' }} />
    </div>
  );
}
