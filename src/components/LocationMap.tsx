import { useState, useMemo } from 'react';
import { Dinosaur } from '@/data/types';

const COLORS = [
  'hsl(0, 70%, 55%)',
  'hsl(210, 70%, 55%)',
  'hsl(142, 50%, 45%)',
  'hsl(45, 80%, 55%)',
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

interface Props {
  dinosaurs: Dinosaur[];
}

const W = 600;
const H = 340;
const CONTINENT_FILL = 'hsl(35, 25%, 82%)';

export default function LocationMap({ dinosaurs }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const outline = useMemo(() => robinsonOutline(W, H), []);
  const grid = useMemo(() => gridLines(W, H), []);

  const markers = dinosaurs.map((d, i) => {
    const ll = getLatLon(d);
    const offsetLon = (i % 3 - 1) * 4;
    const offsetLat = (Math.floor(i / 3) % 2) * 3;
    const pos = robinsonProject(ll.lat + offsetLat, ll.lon + offsetLon, W, H);
    return { dino: d, pos, color: COLORS[i], index: i };
  });

  return (
    <div className="flex flex-col overflow-hidden" style={{ maxHeight: '100%' }}>
      <div className="relative overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 260, background: 'hsl(0, 0%, 3%)' }}>
          <defs>
            <clipPath id="robinson-clip-compare">
              <polygon points={outline} />
            </clipPath>
          </defs>

          {/* Grid lines */}
          <g clipPath="url(#robinson-clip-compare)" opacity="0.18">
            {grid.lats.map((pts, i) => (
              <polyline key={`lat-${i}`} points={pts} fill="none" stroke="hsl(0, 0%, 100%)" strokeWidth="0.7" />
            ))}
            {grid.lons.map((pts, i) => (
              <polyline key={`lon-${i}`} points={pts} fill="none" stroke="hsl(0, 0%, 100%)" strokeWidth="0.7" />
            ))}
          </g>

          {/* Continents — cream/beige fill */}
          <g clipPath="url(#robinson-clip-compare)">
            {CONTINENTS.map(c => (
              <path
                key={c.name}
                d={continentPath(c.coords, W, H)}
                fill={CONTINENT_FILL}
                stroke="none"
              />
            ))}
          </g>

          {/* Dinosaur markers */}
          {markers.map(({ dino, pos, color }) => {
            const isHovered = hoveredId === dino.id;
            return (
              <g key={dino.id}>
                <circle cx={pos.x} cy={pos.y} r={isHovered ? 14 : 9} fill={color} opacity={0.12}>
                  <animate attributeName="r" values={isHovered ? '11;16;11' : '7;11;7'} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.18;0.04;0.18" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle
                  cx={pos.x} cy={pos.y}
                  r={isHovered ? 5 : 3.5}
                  fill={color}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredId(dino.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
                {isHovered && (
                  <foreignObject
                    x={Math.min(pos.x + 10, W - 170)}
                    y={Math.max(pos.y - 55, 5)}
                    width="160" height="58"
                    className="pointer-events-none"
                  >
                    <div className="bg-card border border-border rounded-lg px-2.5 py-1.5 shadow-lg">
                      <p className="text-[10px] font-bold text-foreground">{dino.name}</p>
                      <p className="text-[9px] text-muted-foreground">{dino.discovery.location}</p>
                      <p className="text-[9px] text-muted-foreground/60">{dino.continent}</p>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend — wrapped */}
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {dinosaurs.map((d, i) => (
          <div key={d.id} className="flex items-center gap-1.5 min-w-0 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
