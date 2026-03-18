import { useState, useMemo } from 'react';
import * as topojson from 'topojson-client';
import { geoNaturalEarth1, geoPath, geoGraticule } from 'd3-geo';
// @ts-ignore
import worldData from 'world-atlas/countries-110m.json';
import { Dinosaur } from '@/data/types';

const DINO_COLORS = [
  'hsl(4, 72%, 62%)',
  'hsl(214, 65%, 62%)',
  'hsl(158, 48%, 52%)',
  'hsl(38, 72%, 58%)',
  'hsl(278, 52%, 64%)',
  'hsl(188, 58%, 56%)',
];

const W = 800;
const H = 440;
const PAD = 20;

function getLatLon(d: Dinosaur): [number, number] {
  const loc = d.discovery.location.toLowerCase();
  const cont = d.continent.toLowerCase();
  if (loc.includes('montana')) return [-110, 47];
  if (loc.includes('wyoming')) return [-108, 44];
  if (loc.includes('colorado')) return [-105, 39];
  if (loc.includes('south dakota')) return [-100, 44];
  if (loc.includes('utah')) return [-111, 39];
  if (loc.includes('new mexico')) return [-106, 35];
  if (loc.includes('arizona')) return [-112, 34];
  if (loc.includes('texas')) return [-100, 31];
  if (loc.includes('nevada')) return [-117, 39];
  if (loc.includes('alberta') || loc.includes('canada')) return [-114, 52];
  if (loc.includes('argentina') || loc.includes('patagonia')) return [-68, -40];
  if (loc.includes('brazil')) return [-48, -15];
  if (loc.includes('morocco')) return [-5, 32];
  if (loc.includes('niger')) return [8, 14];
  if (loc.includes('egypt')) return [30, 27];
  if (loc.includes('sahara')) return [10, 25];
  if (loc.includes('south africa')) return [28, -30];
  if (loc.includes('tanzania')) return [35, -6];
  if (loc.includes('madagascar')) return [47, -19];
  if (loc.includes('mongolia') || loc.includes('gobi')) return [104, 44];
  if (loc.includes('china') || loc.includes('liaoning') || loc.includes('yunnan')) return [110, 35];
  if (loc.includes('germany') || loc.includes('württemberg') || loc.includes('nuremberg')) return [10, 51];
  if (loc.includes('england')) return [-1, 52];
  if (loc.includes('poland')) return [20, 51];
  if (loc.includes('europe')) return [10, 48];
  if (loc.includes('australia')) return [135, -25];
  if (loc.includes('india')) return [78, 22];
  if (loc.includes('japan')) return [138, 36];
  if (loc.includes('france')) return [2, 46];
  if (loc.includes('portugal')) return [-8, 39];
  if (loc.includes('romania')) return [25, 46];
  if (cont.includes('north america')) return [-100, 42];
  if (cont.includes('south america')) return [-60, -25];
  if (cont.includes('africa')) return [20, 5];
  if (cont.includes('europe')) return [10, 50];
  if (cont.includes('asia')) return [100, 40];
  if (cont.includes('australia')) return [135, -25];
  if (cont.includes('antarctica')) return [0, -70];
  return [0, 20];
}

function getFormation(d: Dinosaur): string {
  const match = d.discovery.location.match(/([A-Z][a-zA-Z\s]+Formation)/);
  if (match) return match[1];
  return d.continent;
}

interface Props {
  dinosaurs: Dinosaur[];
}

export default function LocationMap({ dinosaurs }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const { countriesPath, landPath, graticulePath, projection } = useMemo(() => {
    const land = topojson.feature(worldData as any, (worldData as any).objects.land);
    const countries = topojson.feature(worldData as any, (worldData as any).objects.countries);
    const proj = geoNaturalEarth1().fitExtent([[PAD, PAD], [W - PAD, H - PAD]], land as any);
    const pathGen = geoPath().projection(proj);
    const graticule = geoGraticule()();
    return {
      landPath: pathGen(land as any) || '',
      countriesPath: (countries as any).features.map((f: any) => pathGen(f) || ''),
      graticulePath: pathGen(graticule) || '',
      projection: proj,
    };
  }, []);

  const markers = useMemo(() => {
    return dinosaurs.map((d, i) => {
      const lonLat = getLatLon(d);
      const pt = projection(lonLat);
      return {
        dino: d,
        x: pt ? pt[0] : 0,
        y: pt ? pt[1] : 0,
        color: DINO_COLORS[i % DINO_COLORS.length],
        formation: getFormation(d),
      };
    }).filter(m => m.x > 0 && m.y > 0);
  }, [dinosaurs, projection]);

  const hoveredMarker = markers.find(m => m.dino.id === hoveredId);

  const getTooltipPos = (mx: number, my: number) => {
    const TW = 180;
    const TH = 76;
    let tx = mx + 14;
    let ty = my - TH - 14;
    if (tx + TW > W - 4) tx = mx - TW - 14;
    if (ty < 4) ty = my + 14;
    if (ty + TH > H - 4) ty = H - TH - 4;
    if (tx < 4) tx = 4;
    return { tx, ty };
  };

  return (
    <div
      className="w-full rounded-xl"
      style={{ background: 'hsl(220,22%,5%)', position: 'relative', overflow: 'visible', paddingBottom: 4 }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full block"
        style={{ display: 'block', height: 'auto' }}
      >
        <defs>
          <filter id="map-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="pin-shadow" x="-80%" y="-80%" width="360%" height="360%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.5)" />
          </filter>
          <radialGradient id="ocean-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(218,30%,9%)" />
            <stop offset="100%" stopColor="hsl(220,22%,5%)" />
          </radialGradient>
        </defs>

        {/* Ocean */}
        <rect width={W} height={H} fill="url(#ocean-grad)" />

        {/* Graticule */}
        <path d={graticulePath} fill="none" stroke="hsl(210,30%,50%)" strokeWidth="0.4" opacity="0.12" />

        {/* Land */}
        <path d={landPath} fill="hsl(0,0%,16%)" stroke="hsl(0,0%,22%)" strokeWidth="0.3" />

        {/* Country borders */}
        {countriesPath.map((p: string, i: number) => (
          <path key={i} d={p} fill="none" stroke="hsl(0,0%,12%)" strokeWidth="0.25" />
        ))}

        {/* Markers */}
        {markers.map(({ dino, x, y, color }) => {
          const isHovered = hoveredId === dino.id;
          const pinHeadY = y - 16;

          return (
            <g
              key={dino.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => { setHoveredId(dino.id); setTooltipPos({ x, y }); }}
              onMouseLeave={() => { setHoveredId(null); setTooltipPos(null); }}
            >
              {/* Pulse ring */}
              <circle cx={x} cy={y} r={isHovered ? 20 : 12} fill={color}
                opacity={isHovered ? 0.2 : 0.08}
                style={{ transition: 'all 0.25s ease' }}
              />
              {/* Pin shadow ellipse */}
              <ellipse cx={x} cy={y + 1.5} rx={3.5} ry={1.5} fill="rgba(0,0,0,0.35)" />
              {/* Pin stem */}
              <line
                x1={x} y1={y}
                x2={x} y2={pinHeadY + 8}
                stroke={color}
                strokeWidth={isHovered ? 2 : 1.6}
                opacity={isHovered ? 1 : 0.88}
                style={{ transition: 'stroke-width 0.2s ease' }}
              />
              {/* Pin head */}
              <circle
                cx={x} cy={pinHeadY}
                r={isHovered ? 6.5 : 5}
                fill={color}
                filter={isHovered ? 'url(#map-glow)' : undefined}
                style={{ transition: 'r 0.2s ease' }}
              />
              {/* Pin highlight */}
              <circle cx={x - 1.5} cy={pinHeadY - 1.5} r={isHovered ? 2 : 1.6} fill="rgba(255,255,255,0.55)" />
            </g>
          );
        })}

        {/* Tooltip */}
        {hoveredMarker && tooltipPos && (() => {
          const { tx, ty } = getTooltipPos(tooltipPos.x, tooltipPos.y);
          return (
            <foreignObject x={tx} y={ty} width={180} height={80} style={{ pointerEvents: 'none', overflow: 'visible' }}>
              <div
                style={{
                  background: 'rgba(8,9,12,0.92)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: `1px solid ${hoveredMarker.color}38`,
                  borderRadius: 10,
                  padding: '8px 11px',
                  boxShadow: `0 6px 24px rgba(0,0,0,0.55), 0 0 14px ${hoveredMarker.color}1a`,
                  animation: 'mapTipIn 0.16s ease-out',
                  width: 180,
                  boxSizing: 'border-box',
                }}
              >
                <p style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.3, wordBreak: 'break-word' }}>
                  {hoveredMarker.dino.name}
                </p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.52)', marginBottom: 3, lineHeight: 1.4, wordBreak: 'break-word' }}>
                  {hoveredMarker.dino.discovery.location}
                </p>
                <p style={{ fontSize: 9, color: hoveredMarker.color, lineHeight: 1.4, wordBreak: 'break-word', opacity: 0.9 }}>
                  {hoveredMarker.formation}
                </p>
              </div>
            </foreignObject>
          );
        })()}

        <style>{`
          @keyframes mapTipIn {
            from { opacity: 0; transform: scale(0.93) translateY(3px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);    }
          }
        `}</style>
      </svg>
    </div>
  );
}
