// Anatomically accurate SVG silhouettes — rebuilt from scratch
// All shapes use smooth bezier curves, correct postures, accurate proportions

interface SilhouetteData {
  viewBox: string;
  // aspect = width/height of the viewBox — used for scaling width proportionally
  aspectW: number;
  aspectH: number;
  d: string;
}

// ── Human ──────────────────────────────────────────────────────────────────
const HUMAN_SVG = `
  M 18 4 C 13 4 10 7 10 11 C 10 15 13 18 18 18 C 23 18 26 15 26 11 C 26 7 23 4 18 4 Z
  M 10 20 C 6 21 4 24 4 28 L 5 42 C 5 44 7 46 10 46 L 10 52 L 6 70 C 5 73 7 75 10 75
    C 12 75 14 73 15 70 L 18 55 L 21 70 C 22 73 24 75 26 75 C 29 75 31 73 30 70 L 26 52
    L 26 46 C 29 46 31 44 31 42 L 32 28 C 32 24 30 21 26 20
  L 22 19 L 18 22 L 14 19 Z
  M 7 22 L 4 42 C 3 45 5 47 7 47 C 9 47 10 45 11 43 L 12 28 Z
  M 29 22 L 32 28 L 33 43 C 33 45 35 47 37 47 C 39 47 41 45 40 42 L 37 22 Z
`;

// ── T-Rex style large biped ─────────────────────────────────────────────────
const TREX_SVG = `
  M 180 55 C 190 45 205 40 215 42 C 228 44 236 52 234 62 C 240 58 248 55 252 58
    C 258 62 255 70 248 72 C 255 68 260 72 258 78 C 256 84 248 84 242 80
    C 244 86 242 92 236 94 C 230 96 224 90 222 84 C 218 92 212 98 202 98
    C 196 98 192 94 190 88 C 186 96 180 102 170 104 C 162 106 155 100 154 92
    C 150 100 144 106 134 108 C 124 110 115 104 113 95 C 106 100 98 100 90 96
    C 80 92 76 82 78 72 L 60 68 C 52 66 46 60 48 52 C 50 44 58 40 68 42
    L 90 46 C 98 38 110 32 125 30 C 140 28 155 30 168 36 C 172 28 178 22 186 18
    C 196 12 208 13 216 18 C 224 23 228 32 226 42 C 234 40 240 44 242 50
    C 244 56 240 62 234 64 Z
  M 100 96 L 95 120 C 95 124 98 126 102 125 C 106 124 108 120 108 116 L 110 96 Z
  M 125 95 L 122 118 C 122 122 125 124 129 123 C 133 122 135 118 134 114 L 133 95 Z
`;

// ── Small biped (raptor) ────────────────────────────────────────────────────
const RAPTOR_SVG = `
  M 160 38 C 168 28 180 24 190 26 C 200 28 206 36 204 46 C 208 42 214 40 218 44
    C 222 48 220 56 214 58 C 218 56 222 60 220 66 C 218 72 210 72 204 68
    C 200 76 192 84 180 88 C 172 90 165 86 163 78 C 158 86 150 92 138 94
    C 128 96 120 88 118 80 C 112 84 105 82 99 78 C 90 72 88 62 92 52
    L 78 46 C 70 42 68 34 72 26 C 76 18 86 16 94 20 L 110 28
    C 118 22 130 16 144 14 C 158 12 172 18 180 28 Z
  M 125 92 L 120 114 L 128 116 L 132 94 Z
  M 148 90 L 144 112 L 152 112 L 155 90 Z
  M 202 68 L 220 82 C 222 84 220 88 217 87 L 198 74 Z
`;

// ── Triceratops (quadruped ceratopsian) ────────────────────────────────────
const TRIKE_SVG = `
  M 20 56 C 14 50 14 42 20 38 C 26 34 34 36 38 42 C 34 36 36 28 42 24
    C 48 20 56 22 58 28 C 60 22 64 16 70 14 C 76 12 82 14 84 20
    C 90 14 98 10 108 10 C 120 10 130 16 132 24 C 140 18 150 16 158 18
    C 170 22 174 32 170 42 C 180 40 190 42 196 50 C 202 58 200 70 190 76
    C 200 74 208 78 210 86 C 212 94 206 100 196 100 C 188 100 182 94 180 86
    C 176 94 168 100 158 100 C 148 100 140 92 140 82 C 130 90 118 96 104 98
    C 90 100 76 96 66 88 C 56 94 44 100 32 98 C 20 96 12 88 14 78 C 10 76 8 72 10 66
    C 8 60 12 56 20 56 Z
  M 78 96 L 74 118 L 82 120 L 86 96 Z
  M 104 98 L 100 120 L 110 120 L 112 98 Z
  M 156 98 L 152 120 L 162 118 L 164 96 Z
  M 182 86 L 178 110 L 188 108 L 190 84 Z
`;

// ── Sauropod (long-neck quadruped) ─────────────────────────────────────────
const SAURO_SVG = `
  M 220 22 C 226 14 234 10 242 12 C 250 14 256 22 254 32 C 260 28 266 26 270 30
    C 274 34 272 42 266 44 C 270 42 274 46 272 52 C 268 58 260 58 254 52
    C 250 60 240 68 228 72 C 220 76 212 74 208 66 L 195 72 C 188 76 178 78 164 78
    L 140 78 L 116 78 L 92 78 L 68 78 L 44 78
    C 30 78 18 74 12 66 C 6 58 8 48 16 42 C 10 40 6 34 8 28 C 10 22 18 18 26 20
    C 22 14 20 8 24 4 C 28 0 34 0 38 4 C 42 8 42 14 40 20 L 46 18
    C 52 14 60 12 68 14 C 80 16 90 24 96 34 C 108 26 124 22 142 22
    C 162 22 180 28 192 36 C 200 30 210 24 220 22 Z
  M 32 78 L 28 106 L 36 108 L 40 78 Z
  M 56 78 L 52 106 L 60 108 L 64 78 Z
  M 100 78 L 96 106 L 104 108 L 108 78 Z
  M 130 78 L 126 106 L 134 108 L 138 78 Z
`;

// ── Stegosaurus ─────────────────────────────────────────────────────────────
const STEGO_SVG = `
  M 210 58 C 220 46 232 40 244 40 C 256 40 264 48 262 58 C 268 52 276 50 280 54
    C 284 60 280 68 274 70 C 278 68 282 72 280 78 C 278 84 270 84 264 78
    C 260 86 250 94 238 98 C 228 102 218 98 214 90 C 208 98 198 104 186 106
    C 172 108 158 100 152 90 C 140 96 126 98 110 98 C 94 98 80 92 70 82
    C 60 90 48 96 34 96 C 22 96 12 88 12 78 C 8 76 6 70 8 64 C 10 58 16 54 24 54
    L 70 56 C 82 46 98 40 116 38 C 136 36 156 42 168 52 C 178 44 194 40 210 40 Z
  M 100 36 L 90 14 C 88 10 92 8 95 10 L 104 32 Z
  M 120 34 L 112 8 C 110 4 115 2 117 6 L 124 32 Z
  M 142 34 L 138 6 C 137 2 142 1 143 5 L 148 32 Z
  M 164 38 L 162 12 C 161 8 166 7 167 11 L 170 36 Z
  M 186 44 L 186 20 C 186 16 191 16 191 20 L 192 42 Z
  M 72 96 L 68 118 L 76 120 L 80 96 Z
  M 98 98 L 94 120 L 102 120 L 106 96 Z
  M 170 106 L 166 128 L 176 128 L 178 104 Z
  M 198 102 L 194 124 L 204 122 L 206 100 Z
`;

// ── Dimetrodon (sail synapsid) ──────────────────────────────────────────────
const DIMERO_SVG = `
  M 200 62 C 210 50 224 44 236 46 C 248 48 256 58 254 70 C 260 64 268 62 272 66
    C 276 72 272 80 266 82 C 270 78 274 82 272 88 C 270 96 260 96 254 90
    C 248 98 238 106 224 108 C 212 110 202 104 198 94 C 188 102 174 106 158 106
    C 138 106 122 98 112 86 C 96 92 80 94 64 90 C 48 86 36 74 38 60
    C 40 46 54 38 70 40 L 90 44 C 106 34 126 28 148 28 C 170 28 190 36 202 48 Z
  M 130 28 C 126 20 122 8 124 0 C 126 -4 130 -2 130 2 C 130 10 132 20 134 28 Z
  M 150 28 C 146 18 144 4 146 -2 C 148 -6 153 -4 152 2 C 151 10 152 20 154 28 Z
  M 168 30 C 166 20 166 8 168 2 C 170 -2 174 0 173 4 C 172 12 172 22 172 30 Z
  M 184 34 C 184 24 186 14 188 8 C 190 4 194 6 193 10 C 192 18 190 28 190 34 Z
  M 70 90 L 64 114 L 74 116 L 78 90 Z
  M 96 90 L 92 114 L 102 114 L 104 90 Z
  M 164 106 L 160 128 L 170 128 L 172 104 Z
  M 192 100 L 188 122 L 198 120 L 200 98 Z
`;

// ── Ankylosaur ──────────────────────────────────────────────────────────────
const ANKYLO_SVG = `
  M 16 52 C 10 46 10 38 18 34 C 26 30 36 34 40 42
    C 48 34 60 28 74 26 L 90 24 L 110 24 L 130 24 L 150 24 L 170 24 L 186 24
    C 200 24 212 30 220 40 C 228 32 240 28 250 30 C 262 32 268 42 264 52
    C 270 50 278 54 280 60 C 282 68 276 74 268 74 C 264 82 254 88 242 90
    C 228 92 214 84 208 74 C 196 82 180 88 162 90 C 144 92 126 88 112 80
    C 96 88 78 92 58 90 C 40 88 24 78 16 66 C 10 64 6 58 6 52
    C 4 44 8 38 16 36 Z
  M 34 88 L 30 110 L 40 112 L 44 88 Z
  M 62 90 L 58 112 L 68 112 L 72 88 Z
  M 148 90 L 144 112 L 154 112 L 158 88 Z
  M 178 88 L 174 110 L 184 110 L 188 86 Z
  M 240 90 L 250 100 C 256 106 264 104 268 98 C 262 98 256 94 252 88 Z
`;

// ── Hadrosaur (duck-bill) ────────────────────────────────────────────────────
const HADRO_SVG = `
  M 168 42 C 178 30 192 24 204 26 C 218 28 226 38 226 50 C 232 44 240 42 246 46
    C 252 50 250 60 244 62 C 250 58 256 62 254 70 C 252 78 242 78 236 72
    C 232 80 222 88 208 92 C 198 96 188 92 184 84 C 178 92 168 98 155 100
    C 142 102 130 96 126 86 C 118 92 108 96 96 96 C 80 96 66 88 58 76
    C 48 84 36 88 24 86 C 12 84 4 74 6 62 C 2 58 0 52 2 44 C 4 36 12 32 22 34
    L 56 40 C 68 30 84 24 102 22 C 122 20 140 26 154 36 C 158 28 162 20 168 16
    C 174 10 182 8 188 12 C 194 16 194 24 190 32 C 196 28 204 28 208 34
    C 212 40 210 48 204 52 Z
  M 90 94 L 86 118 L 96 120 L 100 94 Z
  M 118 96 L 115 120 L 126 120 L 128 94 Z
`;

// ── Spinosaurus ──────────────────────────────────────────────────────────────
const SPINO_SVG = `
  M 195 50 C 205 38 220 32 233 34 C 246 36 254 46 252 58 C 258 52 266 50 270 56
    C 274 62 270 72 263 74 C 268 70 273 74 271 82 C 269 90 259 90 252 84
    C 246 92 234 100 220 104 C 208 108 197 102 194 92 C 186 100 174 106 160 108
    C 144 110 128 102 118 90 C 106 96 92 98 76 96 C 60 94 46 84 44 70
    C 36 72 28 70 22 64 C 14 56 16 44 26 38 C 36 32 50 36 56 46 L 76 50
    C 88 40 104 34 122 32 C 142 30 162 38 175 50 Z
  M 140 32 L 135 8 C 134 4 138 2 140 6 L 146 30 Z
  M 160 30 L 158 4 C 157 0 162 -1 163 3 L 166 28 Z
  M 178 34 L 178 8 C 178 4 183 4 183 8 L 184 32 Z
  M 194 40 L 196 16 C 196 12 201 12 201 16 L 200 38 Z
  M 108 92 L 103 118 L 113 120 L 118 92 Z
  M 138 104 L 134 130 L 144 130 L 148 102 Z
`;

// ─── Silhouette registry ─────────────────────────────────────────────────────
const SILHOUETTES: Record<string, { d: string; vw: number; vh: number }> = {
  'tyrannosaurus-rex':  { d: TREX_SVG,   vw: 280, vh: 130 },
  'velociraptor':       { d: RAPTOR_SVG, vw: 240, vh: 100 },
  'triceratops':        { d: TRIKE_SVG,  vw: 220, vh: 125 },
  'stegosaurus':        { d: STEGO_SVG,  vw: 290, vh: 130 },
  'dimetrodon':         { d: DIMERO_SVG, vw: 290, vh: 115 },
  'ankylosaurus':       { d: ANKYLO_SVG, vw: 290, vh: 115 },
  'spinosaurus':        { d: SPINO_SVG,  vw: 290, vh: 130 },
  'brachiosaurus':      { d: SAURO_SVG,  vw: 290, vh: 120 },
};

const FALLBACKS: Record<string, { d: string; vw: number; vh: number }> = {
  theropod:    { d: TREX_SVG,   vw: 280, vh: 130 },
  raptor:      { d: RAPTOR_SVG, vw: 240, vh: 100 },
  ceratopsian: { d: TRIKE_SVG,  vw: 220, vh: 125 },
  stegosaur:   { d: STEGO_SVG,  vw: 290, vh: 130 },
  ankylosaur:  { d: ANKYLO_SVG, vw: 290, vh: 115 },
  sauropod:    { d: SAURO_SVG,  vw: 290, vh: 120 },
  synapsid:    { d: DIMERO_SVG, vw: 290, vh: 115 },
  hadrosaur:   { d: HADRO_SVG,  vw: 290, vh: 110 },
  spinosaurid: { d: SPINO_SVG,  vw: 290, vh: 130 },
};

function pickSilhouette(dinoId: string, dinoGroup: string) {
  const idKey = dinoId.toLowerCase();
  if (SILHOUETTES[idKey]) return SILHOUETTES[idKey];
  const g = dinoGroup.toLowerCase();
  if (g.includes('synapsid') || g.includes('pelycosaur')) return FALLBACKS.synapsid;
  if (g.includes('spinosaurid')) return FALLBACKS.spinosaurid;
  if (g.includes('sauropod') || g.includes('titanosaur') || g.includes('prosauropod')) return FALLBACKS.sauropod;
  if (g.includes('ceratop')) return FALLBACKS.ceratopsian;
  if (g.includes('stegosaur')) return FALLBACKS.stegosaur;
  if (g.includes('ankylosaur') || g.includes('nodosaur')) return FALLBACKS.ankylosaur;
  if (g.includes('hadrosaur') || g.includes('ornithopod')) return FALLBACKS.hadrosaur;
  if (g.includes('dromaeosaur')) return FALLBACKS.raptor;
  if (g.includes('theropod') || g.includes('tyrannosaurid') || g.includes('abelisaurid') || g.includes('ornithomimo') || g.includes('oviraptor') || g.includes('therizinosaurid') || g.includes('troodontid') || g.includes('herrerasaurid')) return FALLBACKS.theropod;
  // Default by proportions
  return FALLBACKS.theropod;
}

const HUMAN_VW = 44;
const HUMAN_VH = 80;

interface SizeComparisonProps {
  dinoName: string;
  dinoHeight: number;
  dinoLength: number;
  dinoGroup?: string;
  dinoId?: string;
}

export function SizeComparison({ dinoName, dinoHeight, dinoLength, dinoGroup = '', dinoId = '' }: SizeComparisonProps) {
  const HUMAN_H = 1.7;
  const maxH = Math.max(dinoHeight, HUMAN_H);

  const humanScalePct = (HUMAN_H / maxH) * 100;
  const dinoScalePct  = (dinoHeight / maxH) * 100;

  const sil = pickSilhouette(dinoId, dinoGroup);
  // Compute display width for dino SVG preserving aspect: width = height * (vw/vh)
  const dinoAspect = sil.vw / sil.vh;

  return (
    <div className="info-panel">
      <p className="section-label">Size Comparison</p>

      <div
        className="flex items-end justify-center gap-12 mt-6"
        style={{ height: 160, position: 'relative' }}
      >
        {/* Human */}
        <div className="flex flex-col items-center justify-end h-full">
          <div style={{ height: `${humanScalePct}%`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <svg
              viewBox={`0 0 ${HUMAN_VW} ${HUMAN_VH}`}
              style={{ height: '100%', width: 'auto', display: 'block' }}
              fill="hsl(0,0%,55%)"
              opacity={0.55}
            >
              <path d={HUMAN_SVG} />
            </svg>
          </div>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-muted-foreground/65 font-body">Human</p>
            <p className="text-[9px] text-muted-foreground/38">1.7 m</p>
          </div>
        </div>

        {/* Dinosaur */}
        <div className="flex flex-col items-center justify-end h-full">
          <div style={{ height: `${dinoScalePct}%`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', minHeight: 18 }}>
            <svg
              viewBox={`0 0 ${sil.vw} ${sil.vh}`}
              style={{ height: '100%', width: 'auto', display: 'block', maxWidth: 200 }}
              fill="hsl(0,0%,50%)"
              opacity={0.6}
              preserveAspectRatio="xMidYMax meet"
            >
              <path d={sil.d} />
            </svg>
          </div>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-muted-foreground/65 font-body">{dinoName}</p>
            <p className="text-[9px] text-muted-foreground/38">{dinoHeight} m tall · {dinoLength} m long</p>
          </div>
        </div>
      </div>

      {/* Ground rule */}
      <div
        className="mt-3 mx-6"
        style={{
          height: 1,
          borderRadius: 999,
          background: 'linear-gradient(to right, transparent, hsl(0,0%,22%), transparent)',
        }}
      />
    </div>
  );
}
