import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDinosaurById } from '@/data/dinosaurs';
import { ModelViewer } from '@/components/ModelViewer';
import { SizeComparison } from '@/components/SizeComparison';
import { SkeletonViewer } from '@/components/SkeletonViewer';
import { LocationMapSingle } from '@/components/LocationMapSingle';
import InteractiveTimeline from '@/components/InteractiveTimeline';
import { SpeciesContent } from '@/components/SpeciesContent';
import {
  ArrowLeft, ChevronDown, MapPin, Calendar, Ruler, Weight,
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

  return (
    <div className="min-h-screen pt-[90px]">
      {/* Back link + Compare button */}
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm" data-testid="link-back-encyclopedia">
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

      {/* Hero — Left panels + Right 360 view */}
      <section className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* Left side: stacked info panels */}
          <div className="space-y-3 hidden lg:block">
            <div className="info-panel">
              <p className="section-label">Scientific Classification</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mt-0.5 font-display">{getTaxonomyLabel(taxon)}</p>
              <div className="space-y-1.5 mt-3">
                {Object.entries(dino.classification).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs font-body">
                    <span className="text-muted-foreground capitalize">{key}</span>
                    <span className="text-foreground break-words text-right max-w-[160px]" data-testid={`text-classification-${key}`}>{value}</span>
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
                  <p className="text-sm text-foreground font-body break-words whitespace-normal" data-testid="text-discovery-location">{dino.discovery.location}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1 break-words whitespace-normal">{dino.continent}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: 360 View */}
          <div className="w-full">
            <ModelViewer image={dino.image} dinoName={dino.name} sketchfabUrl={dino.sketchfabUrl} />
            <div className="flex justify-center mt-4">
              <button className="flex items-center gap-2 text-sm text-muted-foreground font-body hover:text-foreground transition-colors">
                Scroll down <ChevronDown className="h-4 w-4 animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <div className="max-w-[1000px] mx-auto px-6 py-16 space-y-14">
        {/* Name */}
        <section>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70 font-display mb-2" data-testid="text-taxonomy-label">{getTaxonomyLabel(taxon)} · {dino.period}</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-1 tracking-tight" data-testid="text-dino-name">
            {dino.name}
          </h1>
          <p className="text-lg text-muted-foreground italic font-body">{dino.scientificName}</p>
        </section>

        {/* Adaptive stat row — count varies (3 metrics + period) */}
        <section className={`grid grid-cols-2 gap-4 ${stats.length === 3 ? 'md:grid-cols-4' : 'md:grid-cols-4'}`}>
          {stats.map((s) => {
            const Icon = STAT_ICON[s.iconKey];
            return (
              <div key={s.label} className="info-panel text-center" data-testid={`stat-${s.iconKey}`}>
                <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground font-body">{s.label}</p>
              </div>
            );
          })}
          <div className="info-panel text-center" data-testid="stat-period">
            <Calendar className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-xl font-display font-bold text-foreground">{dino.period}</p>
            <p className="text-xs text-muted-foreground font-body">{dino.periodRange.start}–{dino.periodRange.end} Mya</p>
          </div>
        </section>

        {/* Mobile-only panels */}
        <div className="grid md:grid-cols-2 gap-4 lg:hidden">
          <div className="info-panel">
            <p className="section-label">Scientific Classification</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mt-0.5 font-display">{getTaxonomyLabel(taxon)}</p>
            <div className="space-y-1.5 mt-3">
              {Object.entries(dino.classification).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs font-body">
                  <span className="text-muted-foreground capitalize">{key}</span>
                  <span className="text-foreground">{value}</span>
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
        <SpeciesContent dino={dino} />

        {/* Geological Timeline — same component as comparison tab, single-species mode */}
        <section className="info-panel flex flex-col" style={{ height: 380 }} data-testid="section-timeline">
          <p className="section-label mb-3">Geological Timeline</p>
          <div className="flex-1 min-h-0">
            <InteractiveTimeline dinosaurs={[dino]} />
          </div>
        </section>

        {/* Fossil Record */}
        <section className="info-panel" data-testid="section-fossil-record">
          <SkeletonViewer skeletonData={dino.skeletonData} dinoName={dino.name} />
        </section>

        {/* Discovery */}
        <section className="info-panel">
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
        <SizeComparison dinoName={dino.name} dinoHeight={dino.height} dinoLength={dino.length} dinoGroup={dino.group} dinoId={dino.id} />
      </div>
    </div>
  );
}
