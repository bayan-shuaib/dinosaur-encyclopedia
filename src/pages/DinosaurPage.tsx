import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDinosaurById } from '@/data/dinosaurs';
import { ModelViewer } from '@/components/ModelViewer';
import { SizeComparison } from '@/components/SizeComparison';
import { SkeletonViewer } from '@/components/SkeletonViewer';
import { LocationMapSingle } from '@/components/LocationMapSingle';
import InteractiveTimeline from '@/components/InteractiveTimeline';
import { SpeciesContent } from '@/components/SpeciesContent';
import { SpeciesScientificRail } from '@/components/species/SpeciesScientificRail';
import { SpeciesEvidenceRail } from '@/components/species/SpeciesEvidenceRail';
import {
  ArrowLeft, MapPin, Calendar, Ruler, Weight,
  GitCompareArrows, MoveHorizontal, MoveVertical, Wind, Waves,
} from 'lucide-react';
import { getDisplayStats, getTaxonomyType, getTaxonomyLabel, StatIconKey } from '@/lib/taxonomy';

const STAT_ICON: Record<StatIconKey, typeof Ruler> = {
  length:   MoveHorizontal,
  height:   MoveVertical,
  weight:   Weight,
  wingspan: Wind,
  depth:    Waves,
};

export default function DinosaurPage() {
  const { id } = useParams<{ id: string }>();
  const dino = getDinosaurById(id || '');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  if (!dino) {
    return (
      <div className="min-h-screen pt-[90px] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-foreground mb-2">Species not found</h1>
          <Link to="/" className="text-primary hover:underline font-body">← Back to encyclopedia</Link>
        </div>
      </div>
    );
  }

  const taxon = getTaxonomyType(dino);
  const stats = getDisplayStats(dino);
  const specimenCode = `SPC-${dino.id.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase().padEnd(4, 'X')}`;

  return (
    <div className="min-h-screen pt-[90px]">
      {/* ── Command bar ──────────────────────────────────────────────────── */}
      <div className="max-w-[1840px] mx-auto px-4 md:px-6 xl:px-10 py-4 flex items-center justify-between">
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
      <section className="max-w-[1840px] mx-auto px-4 md:px-6 xl:px-10">
        <div className="relative rounded-2xl border border-border/50 bg-card/40 overflow-hidden">
          {/* atmospheric glow */}
          <div className="pointer-events-none absolute -top-1/3 left-1/4 h-80 w-80 rounded-full bg-amber-500/[0.06] blur-[120px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

          {/* HUD metadata strip */}
          <div className="relative flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 md:px-6 py-3 border-b border-border/40 text-[10px] font-display uppercase tracking-[0.18em] text-muted-foreground/55">
            <span className="font-mono tracking-wider text-amber-400/70">{specimenCode}</span>
            <span className="hidden sm:inline text-border">/</span>
            <span>{getTaxonomyLabel(taxon)}</span>
            <span className="hidden sm:inline text-border">/</span>
            <span>{dino.period} · {dino.periodRange.start}–{dino.periodRange.end} Mya</span>
            <span className="hidden md:inline text-border">/</span>
            <span className="hidden md:inline">{dino.continent}</span>
            <span className="ml-auto flex items-center gap-2 text-amber-400/60">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Exhibit Active
            </span>
          </div>

          {/* Viewer + identity panel */}
          <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="relative p-4 md:p-6">
              <ModelViewer image={dino.image} dinoName={dino.name} sketchfabUrl={dino.sketchfabUrl} />
            </div>

            {/* Identity panel */}
            <div className="relative border-t lg:border-t-0 lg:border-l border-border/40 bg-secondary/10 p-5 md:p-6 flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-[0.24em] text-amber-400/55 font-display mb-2" data-testid="text-taxonomy-label">
                {getTaxonomyLabel(taxon)} · {dino.period}
              </p>
              <h1 className="text-3xl md:text-4xl xl:text-5xl font-display font-bold text-foreground tracking-tight leading-[1.05] text-balance" data-testid="text-dino-name">
                {dino.name}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground italic font-body mt-1.5">{dino.scientificName}</p>

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
                      <p className="text-lg font-display font-bold text-foreground tabular-nums leading-none">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground/55 font-body mt-1">{s.label}</p>
                    </div>
                  );
                })}
                <div className="relative rounded-lg border border-border/50 bg-card/60 px-3 py-2.5" data-testid="stat-period">
                  <Calendar className="h-4 w-4 text-amber-400/55 mb-1.5" />
                  <p className="text-lg font-display font-bold text-foreground leading-none">{dino.period}</p>
                  <p className="text-[10px] text-muted-foreground/55 font-body mt-1">{dino.periodRange.start}–{dino.periodRange.end} Mya</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MUSEUM ARCHITECTURE — left rail · exhibit hall · evidence system ── */}
      <div className="max-w-[1840px] mx-auto px-4 md:px-6 xl:px-10 py-10 md:py-14">
        <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_300px] gap-6 xl:gap-8 items-start">

          {/* LEFT — persistent scientific rail */}
          <aside className="hidden xl:block">
            <div className="sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto pr-1 pb-6">
              <SpeciesScientificRail dino={dino} />
            </div>
          </aside>

          {/* CENTER — exhibit hall */}
          <main className="min-w-0 space-y-16 md:space-y-20">

            {/* Condensed classification + location for < xl (rails hidden) */}
            <div className="grid md:grid-cols-2 gap-4 xl:hidden">
              <div className="info-panel">
                <p className="section-label">Scientific Classification</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mt-0.5 font-display">{getTaxonomyLabel(taxon)}</p>
                <div className="space-y-1.5 mt-3">
                  {Object.entries(dino.classification).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs font-body">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span className="text-foreground text-right break-words max-w-[160px]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="info-panel">
                <p className="section-label">Location & Formation</p>
                <LocationMapSingle location={dino.discovery.location} continent={dino.continent} />
                <div className="flex items-start gap-2 mt-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground font-body break-words">{dino.discovery.location}</p>
                    <p className="text-xs text-muted-foreground font-body mt-1 break-words">{dino.continent}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RICH STRUCTURED CONTENT — Life mode / Scientific mode */}
            <div id="exhibit-encyclopedia" className="scroll-mt-24">
              <SpeciesContent dino={dino} />
            </div>

            {/* Geological Timeline */}
            <section id="exhibit-timeline" className="scroll-mt-24 info-panel flex flex-col" style={{ height: 380 }} data-testid="section-timeline">
              <p className="section-label mb-3">Geological Timeline</p>
              <div className="flex-1 min-h-0">
                <InteractiveTimeline dinosaurs={[dino]} />
              </div>
            </section>

            {/* Fossil Record */}
            <section id="exhibit-fossil" className="scroll-mt-24 info-panel" data-testid="section-fossil-record">
              <SkeletonViewer skeletonData={dino.skeletonData} dinoName={dino.name} />
            </section>

            {/* Discovery */}
            <section id="exhibit-discovery" className="scroll-mt-24 info-panel">
              <p className="section-label">Discovery</p>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground font-body">Year</p>
                  <p className="text-sm text-foreground font-display font-semibold">{dino.discovery.year}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Discoverer</p>
                  <p className="text-sm text-foreground font-body">{dino.discovery.discoverer}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Location</p>
                  <p className="text-sm text-foreground font-body">{dino.discovery.location}</p>
                </div>
              </div>
            </section>

            {/* Size Comparison */}
            <div id="exhibit-scale" className="scroll-mt-24">
              <SizeComparison dinoName={dino.name} dinoHeight={dino.height} dinoLength={dino.length} dinoGroup={dino.group} dinoId={dino.id} />
            </div>
          </main>

          {/* RIGHT — floating evidence system */}
          <aside className="hidden xl:block">
            <div className="sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto pl-1 pb-6">
              <SpeciesEvidenceRail dino={dino} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
