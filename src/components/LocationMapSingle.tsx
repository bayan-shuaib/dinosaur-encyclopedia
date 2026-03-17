import { useMemo } from 'react';
import * as topojson from 'topojson-client';
import { geoNaturalEarth1, geoPath, geoGraticule } from 'd3-geo';
// @ts-ignore
import worldData from 'world-atlas/countries-110m.json';

const W = 500;
const H = 270;
const PAD = 14;
const ACCENT = 'hsl(18, 76%, 60%)';

function getLatLonFromLocation(location: string, continent: string): [number, number] {
  const loc = location.toLowerCase();
  const cont = continent.toLowerCase();
  if (loc.includes('montana')) return [-110, 47];
  if (loc.includes('wyoming')) return [-108, 44];
  if (loc.includes('colorado')) return [-105, 39];
  if (loc.includes('south dakota')) return [-100, 44];
  if (loc.includes('utah')) return [-111, 39];
  if (loc.includes('new mexico')) return [-106, 35];
  if (loc.includes('arizona')) return [-112, 34];
  if (loc.includes('texas')) return [-100, 31];
  if (loc.includes('oklahoma')) return [-97, 35];
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

interface Props {
  location: string;
  continent: string;
}

export function LocationMapSingle({ location, continent }: Props) {
  const { landPath, graticulePath, markerX, markerY } = useMemo(() => {
    const land = topojson.feature(worldData as any, (worldData as any).objects.land);
    const proj = geoNaturalEarth1().fitExtent([[PAD, PAD], [W - PAD, H - PAD]], land as any);
    const pathGen = geoPath().projection(proj);
    const graticule = geoGraticule()();
    const lonLat = getLatLonFromLocation(location, continent);
    const pt = proj(lonLat);
    return {
      landPath: pathGen(land as any) || '',
      graticulePath: pathGen(graticule) || '',
      markerX: pt ? pt[0] : W / 2,
      markerY: pt ? pt[1] : H / 2,
    };
  }, [location, continent]);

  const pinHeadY = markerY - 15;

  return (
    <div className="mt-2 rounded-lg overflow-hidden" style={{ background: 'hsl(220,22%,5%)' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
        <defs>
          <filter id="single-pin-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="single-ocean" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(218,28%,8%)" />
            <stop offset="100%" stopColor="hsl(220,20%,4%)" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill="url(#single-ocean)" />
        <path d={graticulePath} fill="none" stroke="hsl(210,25%,50%)" strokeWidth="0.4" opacity="0.1" />
        <path d={landPath} fill="hsl(0,0%,16%)" stroke="hsl(0,0%,22%)" strokeWidth="0.3" />

        {/* Pulse */}
        <circle cx={markerX} cy={markerY} r={14} fill={ACCENT} opacity={0.08}>
          <animate attributeName="r" values="10;20;10" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.12;0.03;0.12" dur="2.6s" repeatCount="indefinite" />
        </circle>

        {/* Shadow */}
        <ellipse cx={markerX} cy={markerY + 1.5} rx={3.5} ry={1.5} fill="rgba(0,0,0,0.3)" />

        {/* Pin stem */}
        <line x1={markerX} y1={markerY} x2={markerX} y2={pinHeadY + 8}
          stroke={ACCENT} strokeWidth={1.8} opacity={0.92} />

        {/* Pin head */}
        <circle cx={markerX} cy={pinHeadY} r={6} fill={ACCENT} filter="url(#single-pin-glow)" />
        <circle cx={markerX - 1.8} cy={pinHeadY - 1.8} r={2} fill="rgba(255,255,255,0.6)" />
      </svg>
    </div>
  );
}
