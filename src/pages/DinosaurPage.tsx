import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDinosaurById } from '@/data/dinosaurs';
import { ModelViewer } from '@/components/ModelViewer';
import { TimelineBar } from '@/components/TimelineBar';
import { SizeComparison } from '@/components/SizeComparison';
import { SkeletonViewer } from '@/components/SkeletonViewer';
import { LocationMapSingle } from '@/components/LocationMapSingle';
import { ArrowLeft, ChevronDown, MapPin, Calendar, Ruler, Weight, GitCompareArrows } from 'lucide-react';

export default function DinosaurPage() {
  const { id } = useParams<{ id: string }>();
  const dino = getDinosaurById(id || '');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  if (!dino) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-foreground mb-2">Dinosaur not found</h1>
          <Link to="/" className="text-primary hover:underline font-body">← Back to encyclopedia</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14">
      {/* Back link + Compare button */}
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to encyclopedia
        </Link>
        <Link
          to={`/compare?ids=${dino.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm font-display text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
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
            {/* Scientific Classification */}
            <div className="info-panel">
              <p className="section-label">Scientific Classification</p>
              <div className="space-y-1.5 mt-2">
                {Object.entries(dino.classification).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs font-body">
                    <span className="text-muted-foreground capitalize">{key}</span>
                    <span className="text-foreground break-words text-right max-w-[160px]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Formation — with map inside */}
            <div className="info-panel overflow-hidden">
              <p className="section-label">Location & Formation</p>
              <LocationMapSingle location={dino.discovery.location} continent={dino.continent} />
              <div className="flex items-start gap-2 mt-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground font-body break-words whitespace-normal">{dino.discovery.location}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1 break-words whitespace-normal">{dino.continent}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: 360 View */}
          <div className="w-full">
            <ModelViewer image={dino.image} dinoName={dino.name} sketchfabUrl={dino.sketchfabUrl} />
            {/* Scroll indicator */}
            <div className="flex justify-center mt-4">
              <button className="flex items-center gap-2 text-sm text-muted-foreground font-body hover:text-foreground transition-colors">
                Scroll down <ChevronDown className="h-4 w-4 animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <div className="max-w-[1000px] mx-auto px-6 py-16 space-y-12">
        {/* Name & Description */}
        <section>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-1 tracking-tight">
            {dino.name}
          </h1>
          <p className="text-lg text-muted-foreground italic font-body mb-6">{dino.scientificName}</p>
          <p className="text-foreground/80 font-body leading-relaxed">{dino.description}</p>
        </section>

        {/* Stats row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="info-panel text-center">
            <Ruler className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-xl font-display font-bold text-foreground">{dino.length} m</p>
            <p className="text-xs text-muted-foreground font-body">Length</p>
          </div>
          <div className="info-panel text-center">
            <Ruler className="h-5 w-5 text-muted-foreground mx-auto mb-2 rotate-90" />
            <p className="text-xl font-display font-bold text-foreground">{dino.height} m</p>
            <p className="text-xs text-muted-foreground font-body">Height</p>
          </div>
          <div className="info-panel text-center">
            <Weight className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-xl font-display font-bold text-foreground">
              {dino.weight >= 1000 ? `${(dino.weight / 1000).toFixed(1)} t` : `${dino.weight} kg`}
            </p>
            <p className="text-xs text-muted-foreground font-body">Weight</p>
          </div>
          <div className="info-panel text-center">
            <Calendar className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-xl font-display font-bold text-foreground">{dino.period}</p>
            <p className="text-xs text-muted-foreground font-body">{dino.periodRange.start}–{dino.periodRange.end} Mya</p>
          </div>
        </section>

        {/* Mobile-only panels */}
        <div className="grid md:grid-cols-2 gap-4 lg:hidden">
          <div className="info-panel">
            <p className="section-label">Scientific Classification</p>
            <div className="space-y-1.5 mt-2">
              {Object.entries(dino.classification).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs font-body">
                  <span className="text-muted-foreground capitalize">{key}</span>
                  <span className="text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="info-panel overflow-hidden">
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

        {/* Distinct Features */}
        <section className="info-panel">
          <p className="section-label">Distinct Features</p>
          <ul className="space-y-2 mt-3">
            {dino.distinctFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-3 font-body text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/30 mt-1.5 shrink-0" />
                <span className="text-foreground/80">{f}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Habitat */}
        <section className="info-panel">
          <p className="section-label">Habitat</p>
          <p className="text-sm text-foreground/80 font-body mt-2">{dino.habitat}</p>
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

        {/* Fossil Record (left half) + Geological Timeline (right half) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="info-panel">
            <SkeletonViewer skeletonData={dino.skeletonData} dinoName={dino.name} />
          </div>
          <TimelineBar periodRange={dino.periodRange} period={dino.period} />
        </section>

        {/* Size Comparison */}
        <SizeComparison dinoName={dino.name} dinoHeight={dino.height} dinoLength={dino.length} dinoGroup={dino.group} dinoId={dino.id} />
      </div>
    </div>
  );
}
