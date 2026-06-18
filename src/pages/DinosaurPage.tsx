import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDinosaurById } from '@/data/dinosaurs';
import { Dinosaur } from '@/data/types';
import { ModelViewer } from '@/components/ModelViewer';
import { SizeComparison } from '@/components/SizeComparison';
import { SkeletonViewer } from '@/components/SkeletonViewer';
import { LocationMapSingle } from '@/components/LocationMapSingle';
import InteractiveTimeline from '@/components/InteractiveTimeline';
import { SpeciesContent } from '@/components/SpeciesContent';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Ruler, Weight,
  GitCompareArrows, MoveHorizontal, MoveVertical, Wind, Waves,
  BookOpen, MapPin, Bone, Maximize2, Layers,
  ShieldCheck, Zap, Brain, Swords, Shield, Gauge,
} from 'lucide-react';
import { getDisplayStats, getTaxonomyType, getTaxonomyLabel, StatIconKey } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';

// ── Stat icons ────────────────────────────────────────────────────────────────
const STAT_ICON: Record<StatIconKey, typeof Ruler> = {
  length:   MoveHorizontal,
  height:   MoveVertical,
  weight:   Weight,
  wingspan: Wind,
  depth:    Waves,
};

// ── Specimen ID derived from dino.id ─────────────────────────────────────────
function specimenCode(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return `SP-${String(h % 9000 + 1000).padStart(4, '0')}`;
}

// ── Section scroll helper ─────────────────────────────────────────────────────
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Reconstruction confidence helpers ─────────────────────────────────────────
function getReconStatus(dino: Dinosaur) {
  const pct = dino.skeletonData.completeness;
  const taxon = getTaxonomyType(dino);

  let confidence: string, evidenceStrength: string, sciConsensus: string;
  let textColor: string, bgBorder: string, barGrad: string;

  if (pct >= 70) {
    confidence = 'High'; evidenceStrength = 'Extensive'; sciConsensus = 'Strong';
    textColor = 'text-emerald-400/80'; bgBorder = 'bg-emerald-500/8 border-emerald-500/25';
    barGrad = 'from-emerald-500/60 to-emerald-300/60';
  } else if (pct >= 45) {
    confidence = 'Moderate'; evidenceStrength = 'Good'; sciConsensus = 'Supported';
    textColor = 'text-amber-400/80'; bgBorder = 'bg-amber-500/8 border-amber-500/25';
    barGrad = 'from-amber-500/60 to-amber-300/60';
  } else if (pct >= 20) {
    confidence = 'Low'; evidenceStrength = 'Fragmentary'; sciConsensus = 'Debated';
    textColor = 'text-orange-400/80'; bgBorder = 'bg-orange-500/8 border-orange-500/25';
    barGrad = 'from-orange-500/60 to-orange-300/60';
  } else {
    confidence = 'Very Low'; evidenceStrength = 'Minimal'; sciConsensus = 'Contested';
    textColor = 'text-red-400/80'; bgBorder = 'bg-red-500/8 border-red-500/25';
    barGrad = 'from-red-500/60 to-red-300/60';
  }

  const uncertainties: string[] = [];
  if (pct < 40) uncertainties.push('Body proportions partially inferred from related taxa');
  const recovered = dino.skeletonData.recoveredBones.map(b => b.toLowerCase());
  if (!recovered.some(b => b.includes('skull') || b.includes('cranium') || b.includes('jaw')))
    uncertainties.push('Skull morphology reconstructed from related material');
  if (dino.diet === 'Piscivore') uncertainties.push('Aquatic locomotion actively debated');
  if (taxon === 'marine_reptile') uncertainties.push('Soft tissue largely speculative');
  if (pct < 60) uncertainties.push('Integument inferred from exceptional preservation in related species');

  return { confidence, evidenceStrength, sciConsensus, textColor, bgBorder, barGrad, uncertainties, pct };
}

// ── LEFT SIDEBAR ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'section-encyclopedia', label: 'Encyclopedia',   Icon: BookOpen },
  { id: 'section-timeline',     label: 'Timeline',       Icon: Calendar },
  { id: 'section-fossil',       label: 'Fossil Record',  Icon: Bone },
  { id: 'section-discovery',    label: 'Discovery',      Icon: MapPin },
  { id: 'section-true-scale',   label: 'True Scale',     Icon: Maximize2 },
];

function LeftSidebar({ dino }: { dino: Dinosaur }) {
  const [active, setActive] = useState('section-encyclopedia');
  const taxon = getTaxonomyType(dino);
  const spCode = specimenCode(dino.id);

  // Observe which section is in view
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    NAV_ITEMS.forEach(n => {
      const el = document.getElementById(n.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <aside className="hidden xl:flex flex-col w-52 flex-shrink-0">
      <div className="sticky top-[100px] space-y-3">

        {/* Specimen identifier */}
        <div className="info-panel relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          <div className="text-[7px] uppercase tracking-[0.32em] text-amber-400/40 font-display mb-2">
            SPECIMEN RECORD
          </div>
          <div className="text-sm font-display font-bold text-foreground leading-tight mb-0.5">
            {dino.name}
          </div>
          <div className="text-[9px] italic text-muted-foreground/45 font-body mb-2">
            {dino.scientificName}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[7.5px] font-mono text-amber-400/45 tracking-wider border border-amber-400/15 px-1.5 py-0.5 rounded-sm">
              {spCode}
            </span>
            <span className="text-[7.5px] font-display uppercase tracking-[0.1em] text-muted-foreground/35">
              {getTaxonomyLabel(taxon)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="h-1 w-1 rounded-full bg-amber-400/50 animate-pulse" />
            <span className="text-[7px] font-mono text-muted-foreground/25 tracking-[0.12em] uppercase">
              {dino.period} · {dino.periodRange.end}–{dino.periodRange.start} Mya
            </span>
          </div>
        </div>

        {/* Compact taxonomy */}
        <div className="info-panel">
          <p className="text-[7.5px] uppercase tracking-[0.25em] text-muted-foreground/35 font-display mb-2">
            CLASSIFICATION
          </p>
          <div className="space-y-1">
            {Object.entries(dino.classification).map(([key, value]) => (
              <div key={key} className="flex items-baseline justify-between gap-1.5">
                <span className="text-[9px] text-muted-foreground/45 capitalize font-display flex-shrink-0">{key}</span>
                <span className="text-[9px] text-foreground/70 font-body text-right min-w-0 truncate"
                  data-testid={`text-classification-${key}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exhibit navigation */}
        <div className="info-panel">
          <p className="text-[7.5px] uppercase tracking-[0.25em] text-muted-foreground/35 font-display mb-2">
            EXHIBIT NAVIGATION
          </p>
          <div className="space-y-0.5">
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => { scrollTo(id); setActive(id); }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-all text-[10px] font-display',
                  active === id
                    ? 'bg-secondary/70 text-foreground'
                    : 'text-muted-foreground/45 hover:text-foreground hover:bg-secondary/30',
                )}
                data-testid={`nav-${id}`}
              >
                <Icon className={cn('h-3 w-3 flex-shrink-0', active === id ? 'text-amber-400/70' : '')} />
                {label}
                {active === id && (
                  <div className="ml-auto h-1 w-1 rounded-full bg-amber-400/60 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Location mini */}
        <div className="info-panel">
          <p className="text-[7.5px] uppercase tracking-[0.25em] text-muted-foreground/35 font-display mb-2">
            DISCOVERY SITE
          </p>
          <LocationMapSingle location={dino.discovery.location} continent={dino.continent} />
          <div className="flex items-start gap-1.5 mt-2">
            <MapPin className="h-3 w-3 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
            <p className="text-[9px] text-muted-foreground/55 font-body leading-relaxed break-words" data-testid="text-discovery-location">
              {dino.discovery.location}
            </p>
          </div>
        </div>

      </div>
    </aside>
  );
}

// ── RIGHT SIDEBAR ─────────────────────────────────────────────────────────────

function PhysiologyScanCard({ dino }: { dino: Dinosaur }) {
  const stats = [
    { label: 'Aggression',   val: dino.combatStats.aggression,   Icon: Swords },
    { label: 'Speed',        val: dino.combatStats.speed,         Icon: Gauge },
    { label: 'Bite Force',   val: dino.combatStats.biteForce,     Icon: Zap },
    { label: 'Defense',      val: dino.combatStats.defense,       Icon: Shield },
    { label: 'Intelligence', val: dino.combatStats.intelligence,  Icon: Brain },
    { label: 'Size',         val: dino.combatStats.size,          Icon: Layers },
  ];
  return (
    <div className="info-panel">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/45" />
        <p className="section-label mb-0 text-[9px]">Physiology Scan</p>
      </div>
      <div className="space-y-2">
        {stats.map(({ label, val, Icon }) => (
          <div key={label} className="space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Icon className="h-2.5 w-2.5 text-muted-foreground/35 flex-shrink-0" />
                <span className="text-[8.5px] text-muted-foreground/50 font-display uppercase tracking-[0.08em]">{label}</span>
              </div>
              <span className="text-[8.5px] font-mono text-amber-400/55 tabular-nums">{val}/10</span>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500/50 to-amber-300/50"
                initial={{ width: 0 }}
                whileInView={{ width: `${val * 10}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReconstructionSidebar({ dino }: { dino: Dinosaur }) {
  const rs = getReconStatus(dino);
  const skel = dino.skeletonData;

  return (
    <>
      {/* Confidence card */}
      <div className="info-panel" data-testid="section-reconstruction-status">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label mb-0 text-[9px]">Reconstruction Status</p>
          <span className={`text-[7px] font-display uppercase tracking-[0.18em] px-1.5 py-0.5 rounded border ${rs.textColor} ${rs.bgBorder}`}>
            {rs.confidence}
          </span>
        </div>

        {/* Tri-stat */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[
            { label: 'Confidence', value: rs.confidence },
            { label: 'Evidence',   value: rs.evidenceStrength },
            { label: 'Consensus',  value: rs.sciConsensus },
          ].map(({ label, value }) => (
            <div key={label} className="bg-secondary/30 rounded-md p-1.5 text-center">
              <p className="text-[6.5px] uppercase tracking-[0.12em] text-muted-foreground/35 font-display mb-1 leading-tight">{label}</p>
              <p className={`text-[9px] font-display font-semibold leading-tight ${rs.textColor}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Completeness */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between">
            <span className="text-[7.5px] uppercase tracking-[0.12em] text-muted-foreground/35 font-display">Completeness</span>
            <span className="text-[8px] font-mono text-amber-400/55">{rs.pct}% KNOWN</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${rs.barGrad}`}
              initial={{ width: 0 }}
              whileInView={{ width: `${rs.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[7px] text-muted-foreground/28 font-body">{skel.recoveredBones.length} recovered</span>
            <span className="text-[7px] text-muted-foreground/22 font-body">{skel.missingBones.length} unknown</span>
          </div>
        </div>

        {/* Uncertainties */}
        {rs.uncertainties.length > 0 && (
          <div>
            <p className="text-[7.5px] uppercase tracking-[0.14em] text-muted-foreground/30 font-display mb-1.5">Uncertainties</p>
            <div className="space-y-1.5">
              {rs.uncertainties.map((u, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <div className="h-0.5 w-0.5 rounded-full bg-amber-400/30 mt-1.5 flex-shrink-0" />
                  <p className="text-[8.5px] text-muted-foreground/45 font-body leading-relaxed">{u}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Physiology */}
      <PhysiologyScanCard dino={dino} />

      {/* Fossil evidence */}
      <div className="info-panel">
        <p className="section-label mb-0 text-[9px] mb-3">Fossil Evidence</p>
        <div className="space-y-3">
          <div>
            <p className="text-[7.5px] uppercase tracking-[0.14em] text-muted-foreground/30 font-display mb-1.5">Recovered Elements</p>
            <div className="flex flex-wrap gap-1">
              {skel.recoveredBones.slice(0, 8).map(b => (
                <span key={b} className="text-[7px] px-1.5 py-0.5 rounded-sm bg-emerald-500/8 border border-emerald-500/15 text-emerald-400/60 font-body">
                  {b}
                </span>
              ))}
              {skel.recoveredBones.length > 8 && (
                <span className="text-[7px] px-1.5 py-0.5 rounded-sm bg-secondary/50 border border-border/20 text-muted-foreground/30 font-mono">
                  +{skel.recoveredBones.length - 8}
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-[7.5px] uppercase tracking-[0.14em] text-muted-foreground/25 font-display mb-1.5">Unknown Elements</p>
            <div className="flex flex-wrap gap-1">
              {skel.missingBones.slice(0, 6).map(b => (
                <span key={b} className="text-[7px] px-1.5 py-0.5 rounded-sm bg-secondary/30 border border-border/15 text-muted-foreground/30 font-body">
                  {b}
                </span>
              ))}
              {skel.missingBones.length > 6 && (
                <span className="text-[7px] px-1.5 py-0.5 rounded-sm bg-secondary/30 border border-border/15 text-muted-foreground/20 font-mono">
                  +{skel.missingBones.length - 6}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DinosaurPage() {
  const { id } = useParams<{ id: string }>();
  const dino = getDinosaurById(id || '');
  const heroRef = useRef<HTMLDivElement>(null);

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

      {/* ── Top action bar ─────────────────────────────────────────────────── */}
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

      {/* ── Hero — 360 viewer (full width above 3-col layout) ──────────────── */}
      <section ref={heroRef} className="max-w-[1400px] mx-auto px-6 mb-8">
        <ModelViewer image={dino.image} dinoName={dino.name} sketchfabUrl={dino.sketchfabUrl} />
      </section>

      {/* ── Three-column museum dashboard ──────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 pb-24">
        <div className="flex gap-6 items-start">

          {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
          <LeftSidebar dino={dino} />

          {/* ── CENTER CONTENT ───────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-12">

            {/* Name header */}
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
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map(s => {
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

            {/* Mobile-only: classification + location */}
            <div className="grid sm:grid-cols-2 gap-4 xl:hidden">
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

            {/* Mobile-only: reconstruction status (right sidebar collapses on mobile) */}
            <div className="xl:hidden space-y-4">
              <ReconstructionSidebar dino={dino} />
            </div>

            {/* ── Encyclopedia content ──────────────────────────────────── */}
            <div id="section-encyclopedia" className="scroll-mt-[110px]">
              <SpeciesContent dino={dino} />
            </div>

            {/* ── Geological Timeline ───────────────────────────────────── */}
            <section
              id="section-timeline"
              className="info-panel flex flex-col scroll-mt-[110px]"
              style={{ height: 380 }}
              data-testid="section-timeline"
            >
              <p className="section-label mb-3">Geological Timeline</p>
              <div className="flex-1 min-h-0">
                <InteractiveTimeline dinosaurs={[dino]} />
              </div>
            </section>

            {/* ── Fossil Record ─────────────────────────────────────────── */}
            <section
              id="section-fossil"
              className="info-panel scroll-mt-[110px]"
              data-testid="section-fossil-record"
            >
              <SkeletonViewer skeletonData={dino.skeletonData} dinoName={dino.name} />
            </section>

            {/* ── Discovery ─────────────────────────────────────────────── */}
            <section id="section-discovery" className="info-panel scroll-mt-[110px]">
              <p className="section-label">Discovery</p>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground font-body">Year Described</p>
                  <p className="text-sm text-foreground font-display font-semibold">{dino.discovery.year}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Described By</p>
                  <p className="text-sm text-foreground font-body">{dino.discovery.discoverer}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Type Locality</p>
                  <p className="text-sm text-foreground font-body">{dino.discovery.location}</p>
                </div>
              </div>
            </section>

            {/* ── True Scale ────────────────────────────────────────────── */}
            <div id="section-true-scale" className="scroll-mt-[110px]">
              <SizeComparison
                dinoName={dino.name}
                dinoHeight={dino.height}
                dinoLength={dino.length}
                dinoGroup={dino.group}
                dinoId={dino.id}
              />
            </div>

          </div>{/* end center */}

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <aside className="hidden xl:flex flex-col w-60 flex-shrink-0">
            <div className="sticky top-[100px] space-y-3">
              <ReconstructionSidebar dino={dino} />
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
