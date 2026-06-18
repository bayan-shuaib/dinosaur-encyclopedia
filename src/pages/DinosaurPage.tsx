import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDinosaurById } from '@/data/dinosaurs';
import { Dinosaur } from '@/data/types';
import { ModelViewer } from '@/components/ModelViewer';
import { SizeComparison } from '@/components/SizeComparison';
import { SkeletonViewer } from '@/components/SkeletonViewer';
import { LocationMapSingle } from '@/components/LocationMapSingle';
import InteractiveTimeline from '@/components/InteractiveTimeline';
import { SpeciesContent } from '@/components/SpeciesContent';
import {
  ArrowLeft, ChevronDown, MapPin, Calendar, Ruler, Weight,
  GitCompareArrows, MoveHorizontal, MoveVertical, Wind, Waves,
  ShieldAlert,
} from 'lucide-react';
import { getDisplayStats, getTaxonomyType, getTaxonomyLabel, StatIconKey } from '@/lib/taxonomy';

const STAT_ICON: Record<StatIconKey, typeof Ruler> = {
  length:   MoveHorizontal,
  height:   MoveVertical,
  weight:   Weight,
  wingspan: Wind,
  depth:    Waves,
};

// ── Reconstruction Status Panel ───────────────────────────────────────────────

function ReconstructionStatus({ dino }: { dino: Dinosaur }) {
  const completeness = dino.skeletonData.completeness;
  const taxon = getTaxonomyType(dino);

  let confidence: string;
  let evidenceStrength: string;
  let sciConsensus: string;
  let confTextColor: string;
  let confBgBorder: string;
  let barColor: string;

  if (completeness >= 70) {
    confidence = 'High';          evidenceStrength = 'Extensive';    sciConsensus = 'Strong';
    confTextColor = 'text-emerald-400/80'; confBgBorder = 'bg-emerald-500/8 border-emerald-500/25';
    barColor = 'from-emerald-500/50 to-emerald-300/50';
  } else if (completeness >= 45) {
    confidence = 'Moderate';      evidenceStrength = 'Good';         sciConsensus = 'Supported';
    confTextColor = 'text-amber-400/80';   confBgBorder = 'bg-amber-500/8 border-amber-500/25';
    barColor = 'from-amber-500/50 to-amber-300/50';
  } else if (completeness >= 20) {
    confidence = 'Low';           evidenceStrength = 'Fragmentary';  sciConsensus = 'Debated';
    confTextColor = 'text-orange-400/80';  confBgBorder = 'bg-orange-500/8 border-orange-500/25';
    barColor = 'from-orange-500/50 to-orange-300/50';
  } else {
    confidence = 'Very Low';      evidenceStrength = 'Minimal';      sciConsensus = 'Contested';
    confTextColor = 'text-red-400/80';     confBgBorder = 'bg-red-500/8 border-red-500/25';
    barColor = 'from-red-500/50 to-red-300/50';
  }

  const disputes: string[] = [];
  if (completeness < 40)
    disputes.push('Overall body proportions partially inferred from related taxa');
  const recoveredLower = dino.skeletonData.recoveredBones.map(b => b.toLowerCase());
  if (!recoveredLower.some(b => b.includes('skull') || b.includes('cranium') || b.includes('jaw') || b.includes('mandible')))
    disputes.push('Skull morphology reconstructed from fragmentary or closely related material');
  if (dino.diet === 'Piscivore')
    disputes.push('Aquatic hunting behavior and locomotion remain actively debated');
  if (taxon === 'marine_reptile')
    disputes.push('Soft tissue, coloration, and thermoregulation are largely speculative for this lineage');
  if (completeness < 60)
    disputes.push('Integument details (scales, feathers, or skin texture) inferred from exceptional preservation in related species');
  if (dino.combatStats.intelligence >= 7 && completeness < 60)
    disputes.push('Neural anatomy and cognitive capacity estimated from endocast volume comparisons');

  const knownBones  = dino.skeletonData.recoveredBones.length;
  const missingBones = dino.skeletonData.missingBones.length;

  return (
    <section className="info-panel" data-testid="section-reconstruction-status">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-muted-foreground/50" />
          <p className="section-label mb-0">Reconstruction Status</p>
        </div>
        <span className={`text-[8px] font-display uppercase tracking-[0.2em] px-2 py-1 rounded border ${confTextColor} ${confBgBorder}`}>
          {confidence} Confidence
        </span>
      </div>

      {/* Status grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Confidence',  value: confidence },
          { label: 'Evidence',    value: evidenceStrength },
          { label: 'Consensus',   value: sciConsensus },
        ].map(({ label, value }) => (
          <div key={label} className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/38 font-display mb-1.5">{label}</p>
            <p className={`text-sm font-display font-semibold leading-tight ${confTextColor}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Completeness bar */}
      <div className="space-y-1.5 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/38 font-display">
            Skeletal Completeness
          </span>
          <span className="text-[10px] font-mono text-amber-400/60">{completeness}% KNOWN</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000`}
            style={{ width: `${completeness}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] text-muted-foreground/30 font-body">{knownBones} elements recovered</span>
          <span className="text-[9px] text-muted-foreground/25 font-body">{missingBones} elements unknown</span>
        </div>
      </div>

      {/* Known uncertainties */}
      {disputes.length > 0 && (
        <div>
          <p className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/38 font-display mb-2.5">
            Known Uncertainties
          </p>
          <div className="space-y-2">
            {disputes.map((d, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="h-1 w-1 rounded-full bg-amber-400/35 mt-1.5 flex-shrink-0" />
                <p className="text-[10px] text-muted-foreground/55 font-body leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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

      {/* Hero — left panels + 360 view */}
      <section className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* Left panels */}
          <div className="space-y-3 hidden lg:block">
            <div className="info-panel">
              <p className="section-label">Scientific Classification</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mt-0.5 font-display">
                {getTaxonomyLabel(taxon)}
              </p>
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
                  <p className="text-sm text-foreground font-body break-words whitespace-normal" data-testid="text-discovery-location">
                    {dino.discovery.location}
                  </p>
                  <p className="text-xs text-muted-foreground font-body mt-1 break-words whitespace-normal">{dino.continent}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 360 View */}
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

      {/* Main content */}
      <div className="max-w-[1000px] mx-auto px-6 py-16 space-y-14">

        {/* Name */}
        <section>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70 font-display mb-2" data-testid="text-taxonomy-label">
            {getTaxonomyLabel(taxon)} · {dino.period}
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-1 tracking-tight" data-testid="text-dino-name">
            {dino.name}
          </h1>
          <p className="text-lg text-muted-foreground italic font-body">{dino.scientificName}</p>
        </section>

        {/* Stat row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Reconstruction Status — placed before main species content */}
        <ReconstructionStatus dino={dino} />

        {/* Mobile-only panels */}
        <div className="grid md:grid-cols-2 gap-4 lg:hidden">
          <div className="info-panel">
            <p className="section-label">Scientific Classification</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mt-0.5 font-display">
              {getTaxonomyLabel(taxon)}
            </p>
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

        {/* Rich structured content */}
        <SpeciesContent dino={dino} />

        {/* Geological Timeline */}
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
