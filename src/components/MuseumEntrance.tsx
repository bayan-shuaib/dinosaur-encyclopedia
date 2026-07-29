import { GlobalSearch } from '@/components/GlobalSearch';
import { Layers, Wind, Waves, ArrowRight } from 'lucide-react';
import entranceHall from '@/assets/entrance-hall.png';

export type GalleryKey = 'dinosaurs' | 'pterosaurs' | 'marine_reptiles';

const GALLERIES: {
  key: GalleryKey;
  numeral: string;
  title: string;
  realm: string;
  blurb: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'dinosaurs',
    numeral: 'I',
    title: 'Terrestrial',
    realm: 'Dinosaurs',
    blurb: 'The great land-dwelling archosaurs that ruled the continents.',
    icon: <Layers className="h-4 w-4" />,
  },
  {
    key: 'pterosaurs',
    numeral: 'II',
    title: 'Aerial',
    realm: 'Pterosaurs',
    blurb: 'The first vertebrates to master powered flight over ancient skies.',
    icon: <Wind className="h-4 w-4" />,
  },
  {
    key: 'marine_reptiles',
    numeral: 'III',
    title: 'Aquatic',
    realm: 'Marine Reptiles',
    blurb: 'Reptilian lineages that returned to conquer the prehistoric seas.',
    icon: <Waves className="h-4 w-4" />,
  },
];

export function MuseumEntrance({
  activeTab,
  onSelectGallery,
  counts,
  stats,
}: {
  activeTab: GalleryKey;
  onSelectGallery: (k: GalleryKey) => void;
  counts: Record<GalleryKey, number>;
  stats: { total: number; periods: number; continents: number };
}) {
  return (
    <header className="relative">
      {/* ── Entrance hall backdrop ─────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={entranceHall}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center opacity-[0.28]"
        />
        {/* Vignette + fade so the hall dissolves into the archive below */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,transparent_0%,hsl(var(--background))_78%)]" />
      </div>

      <div className="relative max-w-[1480px] mx-auto px-4 md:px-8">
        {/* ── Hero copy ────────────────────────────────────────────────── */}
        <div className="pt-16 md:pt-24 pb-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-7">
            <span className="h-px w-10 bg-amber-400/40" />
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.38em] text-amber-300/60 font-display">
              Est. MMXXV · Gallery of Prehistoric Life
            </span>
          </div>

          <h1 className="font-display font-bold tracking-tight text-foreground text-balance text-4xl md:text-6xl lg:text-[68px] leading-[0.98]">
            The Museum of
            <br />
            <span className="text-amber-200/90">Deep Time</span>
          </h1>

          {/* Institutional motto — engraved into the entrance */}
          <div className="mt-6 flex items-center gap-4" aria-label="Museum philosophy">
            <span className="h-px w-6 bg-amber-200/25" />
            <p className="text-[10px] md:text-[11px] font-display uppercase text-amber-100/45 tracking-[0.46em] md:tracking-[0.58em] whitespace-nowrap">
              Explore
              <span className="mx-2 text-amber-300/35 align-middle">&bull;</span>
              Learn
              <span className="mx-2 text-amber-300/35 align-middle">&bull;</span>
              Preserve
            </p>
            <span className="h-px flex-1 bg-gradient-to-r from-amber-200/25 to-transparent" />
          </div>

          <p className="mt-7 text-sm md:text-base leading-relaxed text-muted-foreground/75 font-body max-w-xl text-pretty">
            Step into a curated archive of the ancient world — every specimen
            catalogued, illustrated, and preserved. Wander the halls of an era
            that vanished sixty-six million years ago.
          </p>

          {/* ── Archive search console ─────────────────────────────────── */}
          <div className="mt-9 max-w-2xl">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground/45 font-display">
                Archive Retrieval
              </span>
              <span className="h-px flex-1 bg-border/40" />
            </div>
            <div className="border-x border-amber-400/15 bg-background/10 backdrop-blur-sm">
              <GlobalSearch variant="hero" />
            </div>
          </div>
        </div>

        {/* ── Collection statistics ──────────────────────────────────────── */}
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/40 border-y border-border/40 rounded-sm overflow-hidden">
          {[
            { label: 'Catalogued Taxa', value: String(stats.total), note: 'Specimens on record' },
            { label: 'Museum Galleries', value: '03', note: 'Curated collections' },
            { label: 'Geological Periods', value: String(stats.periods).padStart(2, '0'), note: 'Permian → Cretaceous' },
            { label: 'Continents', value: String(stats.continents).padStart(2, '0'), note: 'Global provenance' },
          ].map((s) => (
            <div key={s.label} className="bg-background/60 backdrop-blur-sm px-5 py-6">
              <dd className="font-display font-bold text-3xl md:text-4xl text-amber-200/90 tabular-nums leading-none">
                {s.value}
              </dd>
              <dt className="mt-3 text-[10px] uppercase tracking-[0.22em] text-foreground/70 font-display">
                {s.label}
              </dt>
              <p className="mt-1 text-[10px] text-muted-foreground/45 font-body">{s.note}</p>
            </div>
          ))}
        </dl>

        {/* ── Gallery navigation (category collections) ──────────────────── */}
        <div className="mt-14 mb-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/55 font-display">
              Choose a Gallery
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {GALLERIES.map((g) => {
              const active = activeTab === g.key;
              return (
                <button
                  key={g.key}
                  onClick={() => onSelectGallery(g.key)}
                  data-testid={`gallery-${g.key}`}
                  className={`group relative text-left rounded-lg border p-6 transition-all duration-300 overflow-hidden ${
                    active
                      ? 'border-amber-400/40 bg-card/80 shadow-[0_0_40px_-12px_rgba(251,191,36,0.15)]'
                      : 'border-border/45 bg-card/40 hover:border-amber-400/25 hover:bg-card/60'
                  }`}
                >
                  {/* Numeral watermark */}
                  <span className="absolute -top-3 right-3 font-display font-bold text-[64px] leading-none text-foreground/[0.04] group-hover:text-amber-400/[0.06] transition-colors select-none">
                    {g.numeral}
                  </span>

                  <div className="relative flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                      active
                        ? 'border-amber-400/45 text-amber-300/85'
                        : 'border-border/50 text-muted-foreground/60 group-hover:text-amber-300/70 group-hover:border-amber-400/30'
                    }`}>
                      {g.icon}
                    </span>
                    <span className="text-[8px] uppercase tracking-[0.26em] text-muted-foreground/45 font-display">
                      Gallery {g.numeral}
                    </span>
                  </div>

                  <h3 className="relative mt-5 font-display font-bold text-xl text-foreground tracking-tight">
                    {g.realm}
                  </h3>
                  <p className="relative text-[10px] uppercase tracking-[0.24em] text-amber-300/50 font-display mt-1">
                    {g.title} Realm
                  </p>

                  <p className="relative mt-3 text-xs leading-relaxed text-muted-foreground/60 font-body text-pretty">
                    {g.blurb}
                  </p>

                  <div className="relative mt-5 flex items-center justify-between border-t border-border/30 pt-4">
                    <span className="text-[11px] font-mono text-muted-foreground/55">
                      {String(counts[g.key]).padStart(2, '0')} specimens
                    </span>
                    <span className={`flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-display transition-colors ${
                      active ? 'text-amber-300/80' : 'text-muted-foreground/50 group-hover:text-amber-300/70'
                    }`}>
                      {active ? 'Now Viewing' : 'Enter'}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
