import { useState } from 'react';
import { Dinosaur } from '@/data/types';

const COLORS = [
  'hsl(0, 70%, 55%)',
  'hsl(210, 70%, 55%)',
  'hsl(142, 50%, 45%)',
  'hsl(45, 80%, 55%)',
];

// Detailed SVG silhouette paths for recognizable dinosaur shapes
// viewBox is normalized so width = body length proportionally
const SILHOUETTES: Record<string, { path: string; viewBox: string }> = {
  'tyrannosaurus-rex': {
    viewBox: '0 0 200 120',
    path: 'M10,85 Q8,80 12,75 L18,70 Q22,65 28,62 L35,60 Q40,58 45,56 L50,55 Q55,54 60,53 L70,52 Q80,51 90,50 L100,49 Q110,48 120,48 L130,49 Q135,50 140,52 L145,55 Q148,58 152,55 L156,48 Q158,42 162,38 L165,35 Q168,32 172,30 L176,28 Q180,27 184,28 L186,30 Q188,32 186,35 L183,38 Q180,42 178,45 L175,50 Q172,55 168,58 L164,60 Q160,62 156,63 L152,64 Q148,66 144,70 L140,75 Q138,80 136,85 L134,90 Q132,95 128,98 L124,100 Q120,95 118,90 L116,85 Q114,80 110,78 L106,80 Q102,82 100,85 L98,90 Q96,95 92,98 L88,100 Q84,95 80,88 L76,82 Q72,78 68,76 L64,75 Q58,74 52,75 L46,78 Q40,82 34,85 L28,88 Q22,90 16,90 L10,85 Z',
  },
  velociraptor: {
    viewBox: '0 0 200 110',
    path: 'M15,75 Q12,70 16,65 L22,60 Q28,55 35,52 L45,50 Q55,48 65,47 L75,46 Q85,45 95,45 L105,46 Q110,47 115,48 L120,50 Q125,48 130,42 L135,36 Q138,30 142,26 L148,22 Q152,20 158,20 L164,22 Q168,24 166,28 L162,32 Q158,36 155,40 L152,44 Q148,48 144,52 L140,55 Q136,58 132,60 L128,62 Q124,65 120,70 L118,75 Q116,80 114,85 L112,88 Q110,90 108,88 L106,84 Q104,78 102,74 L100,70 Q96,68 92,70 L90,74 Q88,80 86,85 L84,88 Q82,90 80,88 L78,84 Q76,78 72,75 L68,73 Q62,72 56,74 L48,78 Q40,82 32,84 L24,82 Q18,80 15,75 Z',
  },
  triceratops: {
    viewBox: '0 0 200 100',
    path: 'M5,60 Q2,55 5,50 L10,45 Q15,40 20,38 L28,36 Q32,34 36,32 L40,30 Q44,28 48,30 L52,32 Q56,34 60,36 L65,38 Q70,40 75,42 L80,44 Q85,46 90,47 L100,48 Q110,48 120,48 L130,48 Q140,49 150,50 L155,52 Q160,54 164,56 L168,58 Q172,60 176,60 L180,58 Q184,55 188,54 L192,55 Q196,58 194,62 L190,66 Q186,68 182,68 L178,66 Q174,64 170,64 L166,66 Q162,68 160,72 L158,76 Q156,80 152,84 L148,86 Q144,84 142,80 L140,76 Q138,72 134,70 L130,72 Q126,74 124,78 L122,82 Q120,86 116,88 L112,86 Q108,82 106,78 L104,74 Q100,70 96,68 L90,66 Q84,65 78,66 L70,68 Q62,72 54,75 L46,78 Q38,80 30,78 L22,74 Q14,68 10,64 L5,60 Z',
  },
  spinosaurus: {
    viewBox: '0 0 220 120',
    path: 'M8,85 Q5,80 10,74 L16,68 Q22,62 30,58 L40,55 Q50,52 60,50 L70,49 Q75,48 80,46 L85,40 Q88,34 92,30 L96,34 Q98,38 100,42 L104,36 Q106,30 110,26 L114,30 Q116,34 118,40 L122,34 Q124,28 128,24 L132,28 Q134,34 134,40 L136,44 Q138,48 142,50 L150,52 Q158,54 165,55 L170,56 Q175,54 180,48 L184,40 Q186,34 190,30 L194,28 Q198,28 200,32 L198,38 Q194,44 190,50 L186,56 Q182,60 178,62 L174,64 Q170,66 166,70 L164,74 Q162,78 160,82 L158,86 Q156,90 152,92 L148,90 Q146,86 144,82 L142,78 Q138,74 134,72 L130,74 Q126,78 124,82 L122,86 Q120,90 116,92 L112,90 Q108,86 106,82 L104,78 Q100,74 96,72 L90,70 Q82,69 74,70 L66,72 Q56,76 46,80 L36,84 Q26,88 16,88 L8,85 Z',
  },
  brachiosaurus: {
    viewBox: '0 0 200 140',
    path: 'M30,120 Q26,115 30,108 L34,100 Q38,92 42,86 L46,80 Q50,74 54,70 L58,66 Q62,62 66,60 L70,58 Q74,54 76,48 L78,42 Q80,36 82,30 L84,24 Q86,18 90,14 L94,12 Q98,12 100,16 L102,22 Q104,28 104,34 L103,40 Q102,46 100,50 L98,54 Q96,58 96,62 L98,66 Q102,68 108,68 L118,68 Q128,68 138,70 L148,72 Q158,74 164,78 L168,82 Q170,86 168,90 L164,94 Q160,98 158,102 L156,106 Q154,110 150,112 L146,108 Q144,102 142,98 L140,94 Q136,90 132,92 L128,96 Q124,100 122,104 L120,108 Q118,112 114,114 L110,110 Q108,104 106,98 L104,92 Q100,88 96,86 L90,84 Q82,82 74,84 L66,88 Q56,94 48,100 L40,108 Q36,114 34,118 L30,120 Z',
  },
  stegosaurus: {
    viewBox: '0 0 200 110',
    path: 'M10,75 Q8,70 12,65 L18,60 Q24,56 30,54 L38,52 Q46,50 54,48 L50,38 Q48,32 52,28 L56,32 Q58,38 60,44 L62,48 Q64,44 66,36 L68,28 Q66,22 70,18 L74,22 Q76,28 76,36 L78,44 Q80,48 82,42 L84,34 Q86,26 88,20 L90,16 Q94,20 92,28 L90,36 Q88,44 90,48 L94,50 Q100,48 106,46 L108,38 Q110,30 112,24 L114,18 Q118,22 116,30 L114,38 Q112,46 114,50 L120,52 Q126,54 132,56 L138,58 Q144,60 148,62 L152,64 Q156,68 158,72 L160,76 Q162,80 166,82 L170,84 Q174,86 178,84 L182,80 Q184,78 188,80 L186,84 Q182,90 176,92 L170,90 Q164,88 160,86 L156,84 Q152,82 148,84 L146,88 Q144,92 140,94 L136,92 Q134,88 132,84 L130,80 Q126,76 120,76 L114,78 Q108,80 102,82 L96,84 Q88,86 80,86 L72,84 Q64,82 56,80 L48,78 Q38,76 28,78 L20,80 Q14,80 10,75 Z',
  },
  ankylosaurus: {
    viewBox: '0 0 200 90',
    path: 'M8,55 Q5,50 10,45 L18,40 Q26,36 34,34 L42,32 Q50,30 58,30 L66,30 Q74,30 82,30 L90,30 Q98,30 106,30 L114,30 Q122,30 130,32 L138,34 Q146,36 152,38 L158,40 Q164,42 168,44 L172,46 Q176,48 180,46 L184,42 Q186,38 190,36 L194,38 Q196,42 194,48 L190,54 Q186,58 182,58 L178,56 Q174,54 170,56 L166,60 Q162,64 158,66 L154,68 Q150,70 146,70 L142,68 Q138,66 136,62 L134,58 Q130,56 126,58 L122,62 Q118,66 114,68 L110,66 Q106,62 104,58 L102,56 Q98,54 94,56 L90,60 Q86,64 82,66 L78,64 Q74,60 72,56 L70,54 Q66,52 62,54 L56,58 Q50,62 44,64 L38,62 Q32,60 26,58 L20,56 Q14,55 8,55 Z',
  },
};

// Generic theropod/sauropod/ceratopsian fallback
function getFallbackType(d: Dinosaur): string {
  const group = d.group.toLowerCase();
  if (group.includes('sauropod') || group.includes('titanosaur') || group.includes('prosauropod')) return 'sauropod';
  if (group.includes('ceratop')) return 'ceratopsian';
  if (group.includes('stegosaur') || group.includes('thyreophora')) return 'stegosaur';
  if (group.includes('ankylosaur') || group.includes('nodosaur')) return 'ankylosaur';
  if (group.includes('hadrosaur') || group.includes('ornithopod')) return 'hadrosaur';
  return 'theropod';
}

const FALLBACK_SILHOUETTES: Record<string, { path: string; viewBox: string }> = {
  theropod: SILHOUETTES['tyrannosaurus-rex'],
  sauropod: SILHOUETTES['brachiosaurus'],
  ceratopsian: SILHOUETTES['triceratops'],
  stegosaur: SILHOUETTES['stegosaurus'],
  ankylosaur: SILHOUETTES['ankylosaurus'],
  hadrosaur: {
    viewBox: '0 0 200 110',
    path: 'M12,80 Q8,75 12,68 L18,62 Q24,56 32,52 L42,48 Q52,46 62,44 L72,43 Q82,42 92,42 L102,43 Q112,44 120,46 L128,48 Q132,46 136,40 L140,34 Q142,28 146,24 L150,22 Q154,22 156,26 L155,32 Q152,38 150,44 L148,48 Q146,52 142,56 L138,60 Q134,64 132,68 L130,74 Q128,78 126,82 L124,86 Q122,88 120,86 L118,82 Q116,76 114,72 L112,68 Q108,66 104,68 L102,72 Q100,76 98,80 L96,84 Q94,86 92,84 L90,80 Q88,74 84,72 L78,70 Q70,68 62,70 L54,74 Q44,78 34,82 L24,84 Q16,82 12,80 Z',
  },
};

function getSilhouette(d: Dinosaur) {
  if (SILHOUETTES[d.id]) return SILHOUETTES[d.id];
  return FALLBACK_SILHOUETTES[getFallbackType(d)] || FALLBACK_SILHOUETTES.theropod;
}

interface Props {
  dinosaurs: Dinosaur[];
}

export default function TrueScaleComparison({ dinosaurs }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const humanHeight = 1.7;
  const humanLength = 0.5;

  // Use length for horizontal scaling, height for vertical
  const maxLength = Math.max(...dinosaurs.map(d => d.length), humanLength);
  const maxHeight = Math.max(...dinosaurs.map(d => d.height), humanHeight);

  // Scale factor: pixels per meter
  const containerWidth = 900;
  const containerHeight = 280;
  const groundY = containerHeight - 40;
  const scaleX = (containerWidth - 100) / maxLength;
  const scaleY = (groundY - 20) / maxHeight;
  const scale = Math.min(scaleX, scaleY);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${containerWidth} ${containerHeight}`} className="w-full" style={{ minHeight: 200 }}>
        {/* Ground line */}
        <line
          x1="20" y1={groundY} x2={containerWidth - 20} y2={groundY}
          stroke="hsl(0, 0%, 25%)" strokeWidth="1" strokeDasharray="4,4"
        />
        <text x={containerWidth - 20} y={groundY + 14} textAnchor="end" fill="hsl(0, 0%, 35%)" fontSize="9" fontFamily="Inter, sans-serif">
          Ground Level
        </text>

        {/* Scale bar */}
        {(() => {
          const meterPx = scale;
          const barMeters = Math.max(1, Math.floor(maxLength / 4));
          const barWidth = barMeters * meterPx;
          return (
            <g>
              <line x1="30" y1={groundY + 24} x2={30 + barWidth} y2={groundY + 24} stroke="hsl(0, 0%, 40%)" strokeWidth="1.5" />
              <line x1="30" y1={groundY + 20} x2="30" y2={groundY + 28} stroke="hsl(0, 0%, 40%)" strokeWidth="1" />
              <line x1={30 + barWidth} y1={groundY + 20} x2={30 + barWidth} y2={groundY + 28} stroke="hsl(0, 0%, 40%)" strokeWidth="1" />
              <text x={30 + barWidth / 2} y={groundY + 36} textAnchor="middle" fill="hsl(0, 0%, 45%)" fontSize="9" fontFamily="Inter, sans-serif">
                {barMeters}m
              </text>
            </g>
          );
        })()}

        {/* Human reference */}
        {(() => {
          const hW = humanLength * scale;
          const hH = humanHeight * scale;
          const hX = 40;
          return (
            <g opacity="0.4">
              <svg x={hX} y={groundY - hH} width={Math.max(hW, 16)} height={hH} viewBox="0 0 40 100" preserveAspectRatio="xMidYMax meet">
                <ellipse cx="20" cy="8" rx="7" ry="8" fill="hsl(0, 0%, 60%)" />
                <rect x="14" y="16" width="12" height="35" rx="4" fill="hsl(0, 0%, 60%)" />
                <rect x="8" y="20" width="6" height="25" rx="3" fill="hsl(0, 0%, 60%)" />
                <rect x="26" y="20" width="6" height="25" rx="3" fill="hsl(0, 0%, 60%)" />
                <rect x="14" y="51" width="6" height="35" rx="3" fill="hsl(0, 0%, 60%)" />
                <rect x="20" y="51" width="6" height="35" rx="3" fill="hsl(0, 0%, 60%)" />
              </svg>
              <text x={hX + Math.max(hW, 16) / 2} y={groundY + 14} textAnchor="middle" fill="hsl(0, 0%, 45%)" fontSize="9" fontFamily="Inter, sans-serif">
                Human · 1.7m
              </text>
            </g>
          );
        })()}

        {/* Dinosaur silhouettes */}
        {dinosaurs.map((d, i) => {
          const silhouette = getSilhouette(d);
          const w = d.length * scale;
          const h = d.height * scale;
          const xOffset = 80 + i * (containerWidth - 120) / Math.max(dinosaurs.length, 1);
          const isHovered = hoveredId === d.id;

          return (
            <g
              key={d.id}
              onMouseEnter={() => setHoveredId(d.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer"
            >
              {/* Drop shadow */}
              <ellipse
                cx={xOffset + w / 2}
                cy={groundY + 2}
                rx={w / 2.5}
                ry={3}
                fill="hsl(0, 0%, 10%)"
                opacity="0.5"
              />

              {/* Silhouette */}
              <svg
                x={xOffset}
                y={groundY - h}
                width={w}
                height={h}
                viewBox={silhouette.viewBox}
                preserveAspectRatio="xMidYMax meet"
              >
                {/* Color accent outline */}
                <path
                  d={silhouette.path}
                  fill="none"
                  stroke={COLORS[i]}
                  strokeWidth={isHovered ? 3 : 1.5}
                  opacity={isHovered ? 0.8 : 0.4}
                />
                {/* Black fill */}
                <path
                  d={silhouette.path}
                  fill="hsl(0, 0%, 8%)"
                  opacity={isHovered ? 0.9 : 0.75}
                />
              </svg>

              {/* Name label */}
              <text
                x={xOffset + w / 2}
                y={groundY + 14}
                textAnchor="middle"
                fill={COLORS[i]}
                fontSize="10"
                fontWeight="500"
                fontFamily="Inter, sans-serif"
              >
                {d.name}
              </text>
              <text
                x={xOffset + w / 2}
                y={groundY + 26}
                textAnchor="middle"
                fill="hsl(0, 0%, 45%)"
                fontSize="8"
                fontFamily="Inter, sans-serif"
              >
                {d.height}m tall · {d.length}m long
              </text>

              {/* Hover tooltip */}
              {isHovered && (
                <foreignObject
                  x={Math.min(xOffset + w / 2 - 70, containerWidth - 150)}
                  y={Math.max(groundY - h - 60, 5)}
                  width="140"
                  height="52"
                  className="pointer-events-none"
                >
                  <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
                    <p className="text-[11px] font-medium text-foreground">{d.name}</p>
                    <p className="text-[9px] text-muted-foreground">Height: {d.height}m · Length: {d.length}m</p>
                    <p className="text-[9px] text-muted-foreground">Weight: {d.weight >= 1000 ? `${(d.weight / 1000).toFixed(1)}t` : `${d.weight}kg`}</p>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
