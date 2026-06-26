import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getDinosaurById } from "@/data/dinosaurs";
import { ModelViewer } from "@/components/ModelViewer";
import { SizeComparison } from "@/components/SizeComparison";
import { SkeletonViewer } from "@/components/SkeletonViewer";
import InteractiveTimeline from "@/components/InteractiveTimeline";
import { SpeciesContent } from "@/components/SpeciesContent";
import { SpeciesScientificRail } from "@/components/species/SpeciesScientificRail";
import { SpeciesEvidenceRail } from "@/components/species/SpeciesEvidenceRail";
import {
  ArrowLeft,
  Calendar,
  Ruler,
  Weight,
  GitCompareArrows,
  MoveHorizontal,
  MoveVertical,
  Wind,
  Waves,
  Compass,
  Bone,
  Clock,
} from "lucide-react";
import {
  getDisplayStats,
  getTaxonomyType,
  getTaxonomyLabel,
  StatIconKey,
} from "@/lib/taxonomy";

const STAT_ICON: Record<StatIconKey, typeof Ruler> = {
  length: MoveHorizontal,
  height: MoveVertical,
  weight: Weight,
  wingspan: Wind,
  depth: Waves,
};

/* ── Exhibit band — full-width section with a scan-label header ─────────────── */
function ExhibitBand({
  id,
  index,
  label,
  kicker,
  icon: Icon,
  children,
}: {
  id: string;
  index: string;
  label: string;
  kicker?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24" data-testid={`section-${id}`}>
      {/* Scan-divider header — keeps the wall continuous instead of boxed cards */}
      <div className="flex items-center gap-4 mb-7">
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-mono text-[11px] tabular-nums text-amber-400/55">
            {index}
          </span>
          <div className="h-9 w-9 rounded-md border border-amber-500/25 bg-amber-500/[0.06] flex items-center justify-center">
            <Icon className="h-4 w-4 text-amber-300/80" />
          </div>
          <div>
            {kicker && (
              <p className="text-[9px] uppercase tracking-[0.24em] font-display text-amber-400/50 leading-none mb-1">
                {kicker}
              </p>
            )}
            <h2 className="text-lg md:text-xl font-display font-bold text-foreground tracking-tight leading-none">
              {label}
            </h2>
          </div>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 via-border/40 to-transparent" />
      </div>
      {children}
    </section>
  );
}

export default function DinosaurPage() {
  const { id } = useParams<{ id: string }>();
  const dino = getDinosaurById(id || "");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  if (!dino) {
    return (
      <div className="min-h-screen pt-[90px] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-foreground mb-2">
            Species not found
          </h1>
          <Link to="/" className="text-primary hover:underline font-body">
            ← Back to encyclopedia
          </Link>
        </div>
      </div>
    );
  }

  const taxon = getTaxonomyType(dino);
  const stats = getDisplayStats(dino);
  const specimenCode = `SPC-${dino.id
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 6)
    .toUpperCase()
    .padEnd(4, "X")}`;

  return (
    <div className="min-h-screen pt-[90px]">
      {/* ── Command bar ──────────────────────────────────────────────────── */}
      <div className="max-w-[2160px] mx-auto px-4 md:px-8 2xl:px-12 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          data-testid="link-back-encyclopedia"
        >
          <ArrowLeft className="h-4 w-4" /> Back to encyclopedia
        </Link>
        <Link
          to={`/compare?ids=${dino.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm font-display text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          data-testid="link-compare-this"
        >
          <GitCompareArrows className="h-4 w-4" />
          Compare with another
        </Link>
      </div>

      {/* ── CINEMATIC HERO — full-bleed exhibit frame ───────────────────────── */}
      <section className="max-w-[2160px] mx-auto px-4 md:px-8 2xl:px-12">
        <div className="relative rounded-2xl border border-border/50 bg-card/40 overflow-hidden">
          {/* atmospheric glow */}
          <div className="pointer-events-none absolute -top-1/3 left-1/4 h-80 w-80 rounded-full bg-amber-500/[0.06] blur-[120px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

          {/* HUD metadata strip */}
          <div className="relative flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 md:px-7 py-3 border-b border-border/40 text-[10px] font-display uppercase tracking-[0.18em] text-muted-foreground/55">
            <span className="font-mono tracking-wider text-amber-400/70">
              {specimenCode}
            </span>
            <span className="hidden sm:inline text-border">/</span>
            <span>{getTaxonomyLabel(taxon)}</span>
            <span className="hidden sm:inline text-border">/</span>
            <span>
              {dino.period} · {dino.periodRange.start}–{dino.periodRange.end}{" "}
              Mya
            </span>
            <span className="hidden md:inline text-border">/</span>
            <span className="hidden md:inline">{dino.continent}</span>
            <span className="ml-auto flex items-center gap-2 text-amber-400/60">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Exhibit Active
            </span>
          </div>

          {/* Viewer + identity panel — wider canvas */}
          <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_440px]">
            <div className="relative p-4 md:p-6">
              <ModelViewer
                image={dino.image}
                dinoName={dino.name}
                sketchfabUrl={dino.sketchfabUrl}
              />
            </div>

            {/* Identity panel */}
            <div className="relative border-t lg:border-t-0 lg:border-l border-border/40 bg-secondary/10 p-5 md:p-7 flex flex-col justify-center">
              <p
                className="text-[10px] uppercase tracking-[0.24em] text-amber-400/55 font-display mb-2"
                data-testid="text-taxonomy-label"
              >
                {getTaxonomyLabel(taxon)} · {dino.period}
              </p>
              <h1
                className="text-3xl md:text-4xl xl:text-5xl font-display font-bold text-foreground tracking-tight leading-[1.05] text-balance"
                data-testid="text-dino-name"
              >
                {dino.name}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground italic font-body mt-1.5">
                {dino.scientificName}
              </p>

              {/* Metric tiles */}
              <div className="grid grid-cols-2 gap-2.5 mt-6">
                {stats.map((s) => {
                  const Icon = STAT_ICON[s.iconKey];
                  return (
                    <div
                      key={s.label}
                      className="relative rounded-lg border border-border/50 bg-card/60 px-3 py-2.5"
                      data-testid={`stat-${s.iconKey}`}
                    >
                      <Icon className="h-4 w-4 text-amber-400/55 mb-1.5" />
                      <p className="text-lg font-display font-bold text-foreground tabular-nums leading-none">
                        {s.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground/55 font-body mt-1">
                        {s.label}
                      </p>
                    </div>
                  );
                })}
                <div
                  className="relative rounded-lg border border-border/50 bg-card/60 px-3 py-2.5"
                  data-testid="stat-period"
                >
                  <Calendar className="h-4 w-4 text-amber-400/55 mb-1.5" />
                  <p className="text-lg font-display font-bold text-foreground leading-none">
                    {dino.period}
                  </p>
                  <p className="text-[10px] text-muted-foreground/55 font-body mt-1">
                    {dino.periodRange.start}–{dino.periodRange.end} Mya
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MUSEUM ARCHITECTURE — left rail · exhibit hall · evidence system ── */}
      <div className="max-w-[2160px] mx-auto px-4 md:px-8 2xl:px-12 py-10 md:py-14">
        <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)_330px] gap-6 2xl:gap-10 items-start">
          {/* LEFT — persistent scientific support column (sticky, flanks the whole wall) */}
          <aside className="hidden xl:block self-start sticky top-[100px]">
            <SpeciesScientificRail dino={dino} />
          </aside>

          {/* CENTER — exhibit hall */}
          <main className="min-w-0 space-y-16 md:space-y-24">
            {/* Condensed classification + location for < xl (rails hidden) */}
            <div className="grid md:grid-cols-2 gap-4 xl:hidden">
              <div className="info-panel">
                <p className="section-label">Scientific Classification</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mt-0.5 font-display">
                  {getTaxonomyLabel(taxon)}
                </p>
                <div className="space-y-1.5 mt-3">
                  {Object.entries(dino.classification).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between text-xs font-body"
                    >
                      <span className="text-muted-foreground capitalize">
                        {key}
                      </span>
                      <span className="text-foreground text-right break-words max-w-[160px]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="info-panel">
                <p className="section-label">Discovery</p>
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-muted-foreground">Year</span>
                    <span className="text-foreground">
                      {dino.discovery.year}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-muted-foreground">Discoverer</span>
                    <span className="text-foreground text-right">
                      {dino.discovery.discoverer}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-muted-foreground">Location</span>
                    <span className="text-foreground text-right break-words max-w-[160px]">
                      {dino.discovery.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RICH STRUCTURED CONTENT — Life mode / Scientific mode */}
            <div id="exhibit-encyclopedia" className="scroll-mt-24">
              <SpeciesContent dino={dino} />
            </div>

            {/* Geological Timeline */}
            <ExhibitBand
              id="exhibit-timeline"
              index="06"
              kicker="Deep Time"
              label="Geological Timeline"
              icon={Clock}
            >
              <div
                className="rounded-xl border border-border/40 bg-card/40 p-4 md:p-5"
                style={{ height: 420 }}
              >
                <div className="h-full">
                  <InteractiveTimeline dinosaurs={[dino]} />
                </div>
              </div>
            </ExhibitBand>

            {/* Fossil Record */}
            <ExhibitBand
              id="exhibit-fossil"
              index="07"
              kicker="Physical Evidence"
              label="Fossil Record"
              icon={Bone}
            >
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 md:p-6">
                <SkeletonViewer
                  skeletonData={dino.skeletonData}
                  dinoName={dino.name}
                />
              </div>
            </ExhibitBand>

            {/* True Scale */}
            <ExhibitBand
              id="exhibit-scale"
              index="08"
              kicker="Human Reference"
              label="True Scale"
              icon={Ruler}
            >
              <SizeComparison
                dinoName={dino.name}
                dinoHeight={dino.height}
                dinoLength={dino.length}
                dinoGroup={dino.group}
                dinoId={dino.id}
              />
            </ExhibitBand>

            {/* Discovery — wide multi-zone band */}
            <ExhibitBand
              id="exhibit-discovery"
              index="09"
              kicker="Field Record"
              label="Discovery"
              icon={Compass}
            >
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border/40 bg-card/40 p-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50 font-display">
                    Year Described
                  </p>
                  <p className="mt-2 text-3xl font-display font-bold text-foreground tabular-nums">
                    {dino.discovery.year}
                  </p>
                </div>
                <div className="rounded-xl border border-border/40 bg-card/40 p-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50 font-display">
                    Discoverer
                  </p>
                  <p className="mt-2 text-lg font-display font-semibold text-foreground leading-snug">
                    {dino.discovery.discoverer}
                  </p>
                </div>
                <div className="rounded-xl border border-border/40 bg-card/40 p-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50 font-display">
                    Site & Formation
                  </p>
                  <p className="mt-2 text-sm font-body text-foreground/85 leading-snug break-words">
                    {dino.discovery.location}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60 font-body">
                    {dino.continent}
                  </p>
                </div>
              </div>
            </ExhibitBand>
          </main>

          {/* RIGHT — persistent evidence support column (sticky, flanks the whole wall) */}
          <aside className="hidden xl:block self-start sticky top-[100px]">
            <SpeciesEvidenceRail dino={dino} />
          </aside>
        </div>
      </div>
    </div>
  );
}
