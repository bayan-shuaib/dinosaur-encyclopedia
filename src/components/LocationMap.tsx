import { useState, useMemo } from 'react';
import { Dinosaur } from '@/data/types';

const DINO_COLORS = [
  'hsl(0, 65%, 62%)',
  'hsl(213, 60%, 62%)',
  'hsl(160, 45%, 52%)',
  'hsl(38, 70%, 58%)',
  'hsl(280, 50%, 62%)',
  'hsl(185, 55%, 55%)',
];

function robinsonProject(lat: number, lon: number, width: number, height: number) {
  const table = [
    [0, 1.0000, 0.0000], [5, 0.9986, 0.0620], [10, 0.9954, 0.1240],
    [15, 0.9900, 0.1860], [20, 0.9822, 0.2480], [25, 0.9730, 0.3100],
    [30, 0.9600, 0.3720], [35, 0.9427, 0.4340], [40, 0.9216, 0.4958],
    [45, 0.8962, 0.5571], [50, 0.8679, 0.6176], [55, 0.8350, 0.6769],
    [60, 0.7986, 0.7346], [65, 0.7597, 0.7903], [70, 0.7186, 0.8435],
    [75, 0.6732, 0.8936], [80, 0.6213, 0.9394], [85, 0.5722, 0.9761],
    [90, 0.5322, 1.0000],
  ];
  const absLat = Math.min(Math.abs(lat), 90);
  const idx = Math.floor(absLat / 5);
  const frac = (absLat - idx * 5) / 5;
  const i0 = Math.min(idx, table.length - 1);
  const i1 = Math.min(idx + 1, table.length - 1);
  const xLen = table[i0][1] + frac * (table[i1][1] - table[i0][1]);
  const yPos = table[i0][2] + frac * (table[i1][2] - table[i0][2]);
  const cx = width / 2;
  const cy = height / 2;
  const maxW = width * 0.45;
  const maxH = height * 0.45;
  const x = cx + (lon / 180) * xLen * maxW;
  const yFinal = cy - (lat >= 0 ? 1 : -1) * yPos * maxH;
  return { x, y: yFinal };
}

function robinsonOutline(width: number, height: number): string {
  const points: string[] = [];
  for (let lat = 90; lat >= -90; lat -= 5) {
    const p = robinsonProject(lat, 180, width, height);
    points.push(`${p.x},${p.y}`);
  }
  for (let lat = -90; lat <= 90; lat += 5) {
    const p = robinsonProject(lat, -180, width, height);
    points.push(`${p.x},${p.y}`);
  }
  return points.join(' ');
}

function gridLines(width: number, height: number) {
  const lats: string[] = [];
  const lons: string[] = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts: string[] = [];
    for (let lon = -180; lon <= 180; lon += 10) {
      const p = robinsonProject(lat, lon, width, height);
      pts.push(`${p.x},${p.y}`);
    }
    lats.push(pts.join(' '));
  }
  for (let lon = -150; lon <= 180; lon += 30) {
    const pts: string[] = [];
    for (let lat = -90; lat <= 90; lat += 5) {
      const p = robinsonProject(lat, lon, width, height);
      pts.push(`${p.x},${p.y}`);
    }
    lons.push(pts.join(' '));
  }
  return { lats, lons };
}

const CONTINENTS: { name: string; coords: [number, number][] }[] = [
  { name: 'North America', coords: [[60,-140],[65,-170],[70,-160],[72,-130],[65,-90],[55,-80],[50,-60],[45,-65],[40,-75],[35,-80],[30,-85],[25,-90],[20,-100],[18,-105],[30,-115],[35,-120],[40,-125],[48,-125],[55,-130],[60,-140]] },
  { name: 'Central America', coords: [[18,-105],[20,-100],[15,-90],[10,-85],[8,-80],[10,-75],[15,-88],[18,-105]] },
  { name: 'South America', coords: [[10,-75],[8,-80],[5,-77],[0,-50],[-5,-35],[-10,-37],[-20,-40],[-30,-50],[-40,-65],[-50,-70],[-55,-68],[-50,-75],[-40,-73],[-30,-70],[-20,-70],[-15,-75],[-5,-80],[0,-80],[5,-77],[10,-75]] },
  { name: 'Europe', coords: [[40,-10],[38,0],[43,5],[46,2],[48,-5],[50,0],[52,5],[55,10],[58,15],[60,25],[65,28],[70,30],[72,25],[70,15],[65,12],[60,10],[55,5],[52,-5],[48,-10],[44,-10],[40,-10]] },
  { name: 'Africa', coords: [[35,-10],[37,10],[33,30],[30,32],[22,37],[12,44],[5,42],[0,42],[-5,40],[-10,40],[-15,35],[-25,35],[-35,25],[-35,18],[-30,28],[-20,30],[-10,30],[0,10],[5,0],[5,-5],[10,-15],[15,-17],[20,-17],[28,-13],[35,-10]] },
  { name: 'Asia', coords: [[70,30],[75,60],[72,90],[70,100],[65,100],[60,105],[55,110],[50,120],[45,130],[40,130],[35,128],[30,122],[25,120],[20,110],[15,100],[10,105],[5,103],[0,100],[5,95],[15,80],[25,68],[30,60],[35,55],[40,45],[42,35],[45,30],[50,30],[55,30],[60,25],[65,28],[70,30]] },
  { name: 'India', coords: [[30,68],[25,68],[20,73],[15,78],[10,78],[8,77],[12,80],[20,85],[25,88],[28,78],[30,68]] },
  { name: 'Australia', coords: [[-12,130],[-15,125],[-20,118],[-25,115],[-32,115],[-35,118],[-38,145],[-35,150],[-28,153],[-20,148],[-15,145],[-12,140],[-12,130]] },
  { name: 'Antarctica', coords: [[-65,-60],[-70,-30],[-75,0],[-70,30],[-68,70],[-70,110],[-75,140],[-70,170],[-68,-170],[-70,-140],[-72,-100],[-65,-60]] },
];

function continentPath(coords: [number, number][], width: number, height: number): string {
  return coords.map((c, i) => {
    const p = robinsonProject(c[0], c[1], width, height);
    return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`;
  }).join(' ') + ' Z';
}

function getLatLon(d: Dinosaur): { lat: number; lon: number } {
  const loc = d.discovery.location.toLowerCase();
  const cont = d.continent.toLowerCase();
  if (loc.includes('montana')) return { lat: 47, lon: -110 };
  if (loc.includes('wyoming')) return { lat: 44, lon: -108 };
  if (loc.includes('colorado')) return { lat: 39, lon: -105 };
  if (loc.includes('south dakota')) return { lat: 44, lon: -100 };
  if (loc.includes('utah')) return { lat: 39, lon: -111 };
  if (loc.includes('new mexico')) return { lat: 35, lon: -106 };
  if (loc.includes('arizona')) return { lat: 34, lon: -112 };
  if (loc.includes('texas')) return { lat: 31, lon: -100 };
  if (loc.includes('nevada')) return { lat: 39, lon: -117 };
  if (loc.includes('alberta') || loc.includes('canada')) return { lat: 52, lon: -114 };
  if (loc.includes('argentina') || loc.includes('patagonia')) return { lat: -40, lon: -68 };
  if (loc.includes('brazil')) return { lat: -15, lon: -48 };
  if (loc.includes('morocco')) return { lat: 32, lon: -5 };
  if (loc.includes('niger')) return { lat: 14, lon: 8 };
  if (loc.includes('egypt')) return { lat: 27, lon: 30 };
  if (loc.includes('sahara')) return { lat: 25, lon: 10 };
  if (loc.includes('south africa')) return { lat: -30, lon: 28 };
  if (loc.includes('tanzania')) return { lat: -6, lon: 35 };
  if (loc.includes('madagascar')) return { lat: -19, lon: 47 };
  if (loc.includes('mongolia') || loc.includes('gobi')) return { lat: 44, lon: 104 };
  if (loc.includes('china') || loc.includes('liaoning') || loc.includes('yunnan')) return { lat: 35, lon: 110 };
  if (loc.includes('germany') || loc.includes('württemberg') || loc.includes('nuremberg')) return { lat: 51, lon: 10 };
  if (loc.includes('england')) return { lat: 52, lon: -1 };
  if (loc.includes('poland')) return { lat: 51, lon: 20 };
  if (loc.includes('europe')) return { lat: 48, lon: 10 };
  if (loc.includes('australia')) return { lat: -25, lon: 135 };
  if (loc.includes('india')) return { lat: 22, lon: 78 };
  if (loc.includes('japan')) return { lat: 36, lon: 138 };
  if (loc.includes('france')) return { lat: 46, lon: 2 };
  if (loc.includes('portugal')) return { lat: 39, lon: -8 };
  if (loc.includes('romania')) return { lat: 46, lon: 25 };
  if (cont.includes('north america')) return { lat: 42, lon: -100 };
  if (cont.includes('south america')) return { lat: -25, lon: -60 };
  if (cont.includes('africa')) return { lat: 5, lon: 20 };
  if (cont.includes('europe')) return { lat: 50, lon: 10 };
  if (cont.includes('asia')) return { lat: 40, lon: 100 };
  if (cont.includes('australia')) return { lat: -25, lon: 135 };
  if (cont.includes('antarctica')) return { lat: -70, lon: 0 };
  return { lat: 20, lon: 0 };
}

function getFormation(d: Dinosaur): string {
  const loc = d.discovery.location;
  const match = loc.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s+Formation)/);
  if (match) return match[1];
  return d.continent;
}

interface Props {
  dinosaurs: Dinosaur[];
}

const W = 600;
const H = 320;

export default function LocationMap({ dinosaurs }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const outline = useMemo(() => robinsonOutline(W, H), []);
  const grid = useMemo(() => gridLines(W, H), []);

  const markers = dinosaurs.map((d, i) => {
    const ll = getLatLon(d);
    const offsetLon = (i % 3 - 1) * 4;
    const offsetLat = (Math.floor(i / 3) % 2) * 3;
    const pos = robinsonProject(ll.lat + offsetLat, ll.lon + offsetLon, W, H);
    const color = DINO_COLORS[i % DINO_COLORS.length];
    return { dino: d, pos, color, index: i };
  });

  return (
    <div className="relative overflow-hidden rounded-lg" style={{ background: 'hsl(0,0%,4%)' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block"
        style={{ display: 'block' }}
      >
        <defs>
          <clipPath id="robinson-clip-compare">
            <polygon points={outline} />
          </clipPath>
          {markers.map(({ dino, color }) => (
            <filter key={`glow-${dino.id}`} id={`glow-${dino.id}`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Ocean background */}
        <polygon points={outline} fill="hsl(220,20%,8%)" />

        {/* Grid lines */}
        <g clipPath="url(#robinson-clip-compare)" opacity="0.1">
          {grid.lats.map((pts, i) => (
            <polyline key={`lat-${i}`} points={pts} fill="none" stroke="hsl(0,0%,100%)" strokeWidth="0.5" />
          ))}
          {grid.lons.map((pts, i) => (
            <polyline key={`lon-${i}`} points={pts} fill="none" stroke="hsl(0,0%,100%)" strokeWidth="0.5" />
          ))}
        </g>

        {/* Continents */}
        <g clipPath="url(#robinson-clip-compare)">
          {CONTINENTS.map(c => (
            <path
              key={c.name}
              d={continentPath(c.coords, W, H)}
              fill="hsl(0,0%,18%)"
              stroke="hsl(0,0%,22%)"
              strokeWidth="0.4"
            />
          ))}
        </g>

        {/* Markers */}
        {markers.map(({ dino, pos, color }) => {
          const isHovered = hoveredId === dino.id;
          const pinY = pos.y - 14;

          return (
            <g key={dino.id}
              onMouseEnter={() => setHoveredId(dino.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Glow pulse */}
              <circle cx={pos.x} cy={pos.y} r={isHovered ? 18 : 10} fill={color} opacity={isHovered ? 0.18 : 0.08}
                style={{ transition: 'all 0.25s ease' }} />

              {/* Pin shadow */}
              <ellipse cx={pos.x} cy={pos.y + 2} rx={4} ry={2} fill="hsl(0,0%,0%)" opacity={0.3} />

              {/* Pin stem */}
              <line
                x1={pos.x} y1={pos.y}
                x2={pos.x} y2={pinY + 9}
                stroke={color}
                strokeWidth={isHovered ? 1.8 : 1.4}
                opacity={isHovered ? 1 : 0.85}
                style={{ transition: 'all 0.2s ease' }}
              />

              {/* Pin head circle */}
              <circle
                cx={pos.x} cy={pinY}
                r={isHovered ? 5.5 : 4}
                fill={color}
                opacity={isHovered ? 1 : 0.9}
                filter={isHovered ? `url(#glow-${dino.id})` : undefined}
                style={{ transition: 'all 0.2s ease' }}
              />
              <circle cx={pos.x} cy={pinY} r={isHovered ? 2 : 1.5} fill="hsl(0,0%,100%)" opacity={0.6} />
            </g>
          );
        })}

        {/* Tooltips rendered last so they appear on top */}
        {markers.map(({ dino, pos, color }) => {
          if (hoveredId !== dino.id) return null;
          const tw = 170;
          const th = 68;
          const tx = Math.min(Math.max(pos.x - tw / 2, 4), W - tw - 4);
          const ty = Math.max(pos.y - 14 - th - 12, 4);
          const formation = getFormation(dino);

          return (
            <foreignObject key={`tt-${dino.id}`} x={tx} y={ty} width={tw} height={th} style={{ pointerEvents: 'none', overflow: 'visible' }}>
              <div
                style={{
                  background: 'rgba(12,12,14,0.88)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: `1px solid ${color}44`,
                  borderRadius: '10px',
                  padding: '8px 10px',
                  boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${color}22`,
                  animation: 'fadeScaleIn 0.18s ease-out forwards',
                }}
              >
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#fff', marginBottom: '3px', letterSpacing: '0.02em' }}>{dino.name}</p>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)', marginBottom: '2px', lineHeight: 1.3 }}>{dino.discovery.location}</p>
                <p style={{ fontSize: '9px', color: color, opacity: 0.9, lineHeight: 1.3 }}>{formation}</p>
              </div>
            </foreignObject>
          );
        })}
      </svg>

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.94) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
