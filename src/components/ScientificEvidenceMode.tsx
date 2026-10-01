import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Dna,
  ExternalLink,
  FileSearch,
  GitBranch,
  History,
  Layers3,
  MapPinned,
  ShieldQuestion,
  Sparkles,
} from "lucide-react";
import type { Dinosaur } from "@/data/types";
import { ScientificSourcesPanel } from "@/components/ScientificSourcesPanel";
import type {
  ConfidenceLevel,
  DirectEvidence,
  EvidenceEntry,
  EvidenceType,
  ScientificEvidenceProfile,
  ScientificSource,
} from "@/data/scientificEvidence";

interface Props {
  dino: Dinosaur;
  profile: ScientificEvidenceProfile;
}

const evidenceTypeMeta: Record<
  EvidenceType,
  { label: string; className: string }
> = {
  direct: {
    label: "Direct evidence",
    className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  },
  inferred: {
    label: "Inferred",
    className: "border-sky-400/30 bg-sky-500/10 text-sky-300",
  },
  reconstructed: {
    label: "Reconstructed",
    className: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  },
  hypothesis: {
    label: "Hypothesis",
    className: "border-violet-400/30 bg-violet-500/10 text-violet-300",
  },
  unknown: {
    label: "Unknown",
    className: "border-border/50 bg-secondary/40 text-muted-foreground",
  },
};

const confidenceMeta: Record<
  ConfidenceLevel,
  { label: string; className: string }
> = {
  strong: {
    label: "Strong evidence",
    className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  },
  moderate: {
    label: "Moderate evidence",
    className: "border-sky-400/30 bg-sky-500/10 text-sky-300",
  },
  limited: {
    label: "Limited evidence",
    className: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  },
  hypothesis: {
    label: "Hypothesis",
    className: "border-violet-400/30 bg-violet-500/10 text-violet-300",
  },
  unknown: {
    label: "Unknown",
    className: "border-border/50 bg-secondary/40 text-muted-foreground",
  },
};

function ArchiveSection({
  id,
  index,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5" data-testid={`evidence-section-${id}`}>
      <div className="space-y-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 text-[9px] uppercase tracking-[0.3em] text-amber-400/55 font-display">
            {index}
          </span>
          <div className="h-px min-w-0 flex-1 bg-gradient-to-r from-amber-400/30 to-transparent" />
          <span className="shrink-0 rounded-sm border border-border/30 bg-secondary/60 px-2 py-0.5 text-[8px] uppercase tracking-[0.2em] text-muted-foreground/45 font-display">
            {eyebrow}
          </span>
        </div>
        <h2 className="border-l-2 border-amber-500/40 pl-4 text-2xl font-display font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground/75 font-body">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({
  children,
  className = "border-border/50 bg-secondary/40 text-muted-foreground",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-1 text-[9px] uppercase tracking-[0.12em] font-display ${className}`}
    >
      {children}
    </span>
  );
}

function SourceReferences({
  sourceIds,
  sources,
  onSelect,
}: {
  sourceIds: string[];
  sources: ScientificSource[];
  onSelect: (source: ScientificSource) => void;
}) {
  const sourceMap = useMemo(
    () => new Map(sources.map((source) => [source.id, source])),
    [sources],
  );
  const linkedSources = sourceIds
    .map((sourceId) => sourceMap.get(sourceId))
    .filter((source): source is ScientificSource => Boolean(source));

  if (linkedSources.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground/55 font-body">
        <ShieldQuestion className="h-3 w-3" />
        Source review pending
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {linkedSources.map((source) => (
        <button
          key={source.id}
          type="button"
          onClick={() => onSelect(source)}
          className="inline-flex max-w-full items-center gap-1 rounded-sm border border-amber-500/25 bg-amber-500/[0.05] px-2 py-1 text-left text-[10px] text-amber-200/80 transition-colors hover:border-amber-400/50 hover:bg-amber-500/10 font-display"
        >
          <BookOpen className="h-3 w-3 shrink-0" />
          <span className="truncate">{source.title}</span>
        </button>
      ))}
    </div>
  );
}

function EvidenceEntryCard({
  entry,
  sources,
  onSelectSource,
}: {
  entry: EvidenceEntry;
  sources: ScientificSource[];
  onSelectSource: (source: ScientificSource) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const evidenceMeta = evidenceTypeMeta[entry.evidenceType] ?? evidenceTypeMeta.unknown;
  const confidence = confidenceMeta[entry.confidence] ?? confidenceMeta.unknown;
  const categoryLabel = entry.category?.replace("_", " ") ?? "other";

  return (
    <article
      className="overflow-hidden rounded-xl border border-border/45 bg-card/55 transition-colors hover:border-amber-500/25"
      data-testid={`evidence-entry-${entry.id}`}
    >
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-start gap-3 p-4 text-left md:p-5"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/[0.06] text-amber-300/75">
          <FileSearch className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 space-y-2">
          <span className="block text-[9px] uppercase tracking-[0.2em] text-amber-400/55 font-display">
            {categoryLabel}
          </span>
          <span className="block text-base font-display font-semibold leading-snug text-foreground">
            {entry.claim}
          </span>
          <span className="flex flex-wrap gap-1.5">
            <StatusBadge className={evidenceMeta.className}>
              {evidenceMeta.label}
            </StatusBadge>
            <StatusBadge className={confidence.className}>
              {confidence.label}
            </StatusBadge>
          </span>
        </span>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 border-t border-border/35 px-4 pb-5 pt-4 md:grid-cols-2 md:px-5">
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55 font-display">
                  Evidence
                </p>
                <p className="text-sm leading-relaxed text-foreground/80 font-body">
                  {entry.evidence}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55 font-display">
                  Interpretation
                </p>
                <p className="text-sm leading-relaxed text-foreground/80 font-body">
                  {entry.interpretation}
                </p>
              </div>
              {(entry.limitations?.length || entry.competingInterpretations?.length) && (
                <div className="space-y-2 rounded-lg border border-amber-500/15 bg-amber-500/[0.03] p-3 md:col-span-2">
                  <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-amber-400/70 font-display">
                    <AlertTriangle className="h-3 w-3" />
                    Limits and uncertainty
                  </p>
                  <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground/75 font-body">
                    {[...(entry.limitations ?? []), ...(entry.competingInterpretations ?? [])].map(
                      (item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400/50" />
                          <span>{item}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
              <div className="space-y-2 md:col-span-2">
                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55 font-display">
                  Sources
                </p>
                <SourceReferences
                  sourceIds={entry.sourceIds}
                  sources={sources}
                  onSelect={onSelectSource}
                />
              </div>
              {(entry.relatedSpecimenIds?.length || entry.relatedPaperIds?.length) && (
                <div className="space-y-2 md:col-span-2">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55 font-display">
                    Archive connections
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground/70 font-mono">
                    {entry.relatedSpecimenIds?.length
                      ? `Specimens: ${entry.relatedSpecimenIds.join(", ")}`
                      : "No specimen IDs linked yet."}
                    {" · "}
                    {entry.relatedPaperIds?.length
                      ? `Papers: ${entry.relatedPaperIds.join(", ")}`
                      : "No paper IDs linked yet."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

function DirectEvidenceCard({
  entry,
  sources,
  onSelectSource,
}: {
  entry: DirectEvidence;
  sources: ScientificSource[];
  onSelectSource: (source: ScientificSource) => void;
}) {
  return (
    <article className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.025] p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-emerald-400/25 bg-emerald-500/10 text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-display font-semibold text-foreground">
              {entry.type}
            </h3>
            <StatusBadge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
              Directly preserved
            </StatusBadge>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80 font-body">
            {entry.description}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground/75 font-body">
            {entry.significance}
          </p>
          <div className="mt-4">
            <SourceReferences
              sourceIds={entry.sourceIds}
              sources={sources}
              onSelect={onSelectSource}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function SourceDrawer({
  source,
  onClose,
}: {
  source: ScientificSource | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {source && (
        <motion.aside
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-4"
          aria-label="Source details"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-amber-400/65 font-display">
                Source record
              </p>
              <h3 className="mt-1 text-base font-display font-semibold text-foreground">
                {source.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground/80 font-body">
            {[source.authors, source.year, source.journal ?? source.publisher]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {(source.url || source.doi) && (
            <a
              href={source.url ?? `https://doi.org/${source.doi}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200 font-display"
            >
              Open source <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export function ScientificEvidenceMode({ dino, profile }: Props) {
  const [selectedSource, setSelectedSource] = useState<ScientificSource | null>(null);
  const overview = profile.evidenceOverview;
  const sourceCount = profile.sources.length;
  const directCount = profile.directEvidence.length;
  const traitCount = profile.traitEvidence.length;

  return (
    <div className="min-w-0 space-y-16 md:space-y-24" data-testid="scientific-evidence-mode">
      <header className="relative overflow-hidden rounded-xl border border-amber-500/25 bg-amber-500/[0.035] p-5 md:p-7">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/55 to-transparent" />
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-amber-400/65 font-display">
              <FileSearch className="h-3.5 w-3.5" />
              Research archive · {dino.name}
            </div>
            <h1 className="mt-3 text-2xl font-display font-bold tracking-tight text-foreground md:text-4xl">
              Evidence &amp; Research
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground/80 font-body">
              How do we know what we think we know? This archive separates
              preserved material, scientific interpretation, confidence, and
              unresolved questions.
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-3 gap-2 text-center">
            {[
              ["Direct", directCount],
              ["Traits", traitCount],
              ["Sources", sourceCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border/40 bg-card/55 px-3 py-2.5">
                <p className="text-lg font-display font-bold tabular-nums text-amber-200/90">
                  {value}
                </p>
                <p className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground/55 font-display">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <ArchiveSection
        id="evidence-overview"
        index="01"
        eyebrow="Archive assessment"
        title="Evidence Overview"
        description={overview.summary}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Archive coverage", overview.fossilCompleteness],
            ["Preservation", overview.preservation],
            ["Geological context", overview.geologicalContext],
            ["Overall evidence status", overview.overallStatus],
            ["Source status", sourceCount > 0 ? "Sources linked" : "Source review pending"],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-lg border border-border/45 bg-card/55 p-4 sm:last:col-span-2 lg:last:col-span-1">
              <p className="text-[9px] uppercase tracking-[0.16em] text-amber-400/60 font-display">
                {label}
              </p>
              <p className="mt-2 break-words text-sm leading-relaxed text-foreground/80 font-body">
                {value ?? "Not entered"}
              </p>
            </div>
          ))}
        </div>
        {!!overview.importantMaterial?.length && (
          <div className="rounded-xl border border-border/40 bg-card/45 p-4 md:p-5">
            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55 font-display">
              Important material in the catalogue
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {overview.importantMaterial.map((material) => (
                <StatusBadge key={material}>{material}</StatusBadge>
              ))}
            </div>
          </div>
        )}
        {!!overview.importantLocalities?.length && (
          <div className="rounded-xl border border-border/40 bg-card/45 p-4 md:p-5">
            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55 font-display">
              Important localities or formations
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {overview.importantLocalities.map((locality) => (
                <StatusBadge key={locality}>{locality}</StatusBadge>
              ))}
            </div>
          </div>
        )}
        {!!overview.limitations?.length && (
          <div className="rounded-xl border border-amber-500/18 bg-amber-500/[0.03] p-4 md:p-5">
            <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-amber-400/70 font-display">
              <AlertTriangle className="h-3.5 w-3.5" />
              Evidence limitations
            </p>
            <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-muted-foreground/75 font-body md:grid-cols-2">
              {overview.limitations.map((limitation) => (
                <li key={limitation} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400/50" />
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ArchiveSection>

      <ArchiveSection
        id="direct-evidence"
        index="02"
        eyebrow="Physical record"
        title="Direct Fossil Evidence"
        description="These entries describe material represented in the current record. They are kept separate from interpretations built from that material."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {profile.directEvidence.map((entry) => (
            <DirectEvidenceCard
              key={entry.id}
              entry={entry}
              sources={profile.sources}
              onSelectSource={setSelectedSource}
            />
          ))}
        </div>
      </ArchiveSection>

      <ArchiveSection
        id="trait-evidence"
        index="03"
        eyebrow="Claim ledger"
        title="Trait Evidence"
        description="Open a card to see the evidence, interpretation, confidence label, limitations, and source links behind each claim."
      >
        <div className="space-y-3">
          {profile.traitEvidence.map((entry) => (
            <EvidenceEntryCard
              key={entry.id}
              entry={entry}
              sources={profile.sources}
              onSelectSource={setSelectedSource}
            />
          ))}
        </div>
        <SourceDrawer source={selectedSource} onClose={() => setSelectedSource(null)} />
      </ArchiveSection>

      <ArchiveSection
        id="evolutionary-context"
        index="04"
        eyebrow="Lineage record"
        title="Evolutionary Context"
        description="Classification gives the record a place in the tree. Specific evolutionary claims remain limited until source-linked phylogenetic evidence is added."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border/45 bg-card/55 p-4 md:p-5">
            <div className="flex items-center gap-2 text-amber-300/75">
              <GitBranch className="h-4 w-4" />
              <h3 className="text-base font-display font-semibold text-foreground">
                Taxonomic placement
              </h3>
            </div>
            <div className="mt-4 space-y-3 text-sm font-body">
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/50 font-display">
                  Clade / class
                </p>
                <p className="mt-1 text-foreground/80">{profile.evolutionaryContext.clade}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/50 font-display">
                  Classification
                </p>
                <p className="mt-1 leading-relaxed text-foreground/80">
                  {profile.evolutionaryContext.classification}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/45 bg-card/55 p-4 md:p-5">
            <div className="flex items-center gap-2 text-amber-300/75">
              <Layers3 className="h-4 w-4" />
              <h3 className="text-base font-display font-semibold text-foreground">
                Relationships and context
              </h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/75 font-body">
              {(profile.evolutionaryContext.relationships ?? []).map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400/55" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Derived traits", profile.evolutionaryContext.derivedTraits],
            ["Ancestral traits", profile.evolutionaryContext.ancestralTraits],
          ].map(([label, items]) => (
            <div key={label} className="rounded-xl border border-amber-500/15 bg-amber-500/[0.025] p-4">
              <p className="text-[9px] uppercase tracking-[0.18em] text-amber-400/65 font-display">
                {label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground/75 font-body">
                {(items as string[] | undefined)?.join(" ") ?? "Not entered"}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground/75 font-body">
          {profile.evolutionaryContext.evolutionarySignificance}
        </p>
      </ArchiveSection>

      <ArchiveSection
        id="genetic-context"
        index="05"
        eyebrow="Limits of the record"
        title="Genetic & Developmental Context"
        description="This area distinguishes fossil interpretation from genetic evidence and does not generate or imply dinosaur genomes."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.035] p-4 md:p-5">
            <div className="flex items-center gap-2 text-violet-300/85">
              <Dna className="h-4 w-4" />
              <h3 className="text-base font-display font-semibold text-foreground">
                Direct genetic evidence
              </h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground/80 font-body">
              {profile.geneticContext.directEvidenceStatus}
            </p>
          </div>
          <div className="rounded-xl border border-border/45 bg-card/55 p-4 md:p-5">
            <div className="flex items-center gap-2 text-amber-300/75">
              <Sparkles className="h-4 w-4" />
              <h3 className="text-base font-display font-semibold text-foreground">
                Comparative and developmental context
              </h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground/80 font-body">
              {[
                ...(profile.geneticContext.comparativeEvidence ?? []),
                ...(profile.geneticContext.developmentalContext ?? []),
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400/55" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/18 bg-amber-500/[0.03] p-4 md:p-5">
          <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-amber-400/70 font-display">
            <ShieldQuestion className="h-3.5 w-3.5" />
            What this record cannot determine genetically
          </p>
          <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-muted-foreground/75 font-body md:grid-cols-2">
            {(profile.geneticContext.limitations ?? []).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400/50" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </ArchiveSection>

      {!!profile.scientificDebates?.length && (
        <ArchiveSection
          id="scientific-debates"
          index="06"
          eyebrow="Competing interpretations"
          title="Scientific Debates"
          description="Where the evidence is contested, the archive keeps competing interpretations visible instead of choosing a winner without support."
        >
          <div className="space-y-4">
            {profile.scientificDebates.map((debate) => (
              <div key={debate.topic} className="rounded-xl border border-violet-500/20 bg-violet-500/[0.025] p-4 md:p-5">
                <h3 className="text-base font-display font-semibold text-foreground">{debate.topic}</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {debate.interpretations.map((interpretation) => (
                    <div key={interpretation.position} className="rounded-lg border border-border/35 bg-card/45 p-3">
                      <p className="text-sm font-display font-semibold text-violet-200/85">{interpretation.position}</p>
                      <ul className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground/75 font-body">
                        {interpretation.supportingEvidence.map((item) => <li key={item}>• {item}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/75 font-body">{debate.currentStatus}</p>
              </div>
            ))}
          </div>
        </ArchiveSection>
      )}

      <ArchiveSection
        id="research-history"
        index={profile.scientificDebates?.length ? "07" : "06"}
        eyebrow="Changing knowledge"
        title="Research History"
        description="This timeline records what is currently entered in the archive and leaves room for future taxonomic revisions and reinterpretations."
      >
        <div className="space-y-3">
          {profile.researchHistory.map((entry) => (
            <div key={`${entry.year ?? "undated"}-${entry.title}`} className="flex gap-4 rounded-xl border border-border/45 bg-card/55 p-4 md:p-5">
              <div className="flex shrink-0 flex-col items-center">
                <History className="h-4 w-4 text-amber-300/75" />
                <div className="mt-2 h-full w-px bg-border/40" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.18em] text-amber-400/60 font-display">
                  {entry.year ?? "Undated archive entry"}
                </p>
                <h3 className="mt-1 text-base font-display font-semibold text-foreground">{entry.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground/80 font-body">{entry.description}</p>
              </div>
            </div>
          ))}
        </div>
      </ArchiveSection>

      <ArchiveSection
        id="open-questions"
        index={profile.scientificDebates?.length ? "08" : "07"}
        eyebrow="Unresolved record"
        title="What We Still Don't Know"
        description="Scientific transparency includes the boundaries of the evidence. These questions are intentionally not filled with speculation."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {profile.openQuestions.map((question) => (
            <article key={question.question} className="rounded-xl border border-amber-500/18 bg-amber-500/[0.03] p-4 md:p-5">
              <div className="flex items-start gap-3">
                <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/75" />
                <div className="min-w-0">
                  <h3 className="text-base font-display font-semibold leading-snug text-foreground">{question.question}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/75 font-body">{question.currentUnderstanding}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground/75 font-body">{question.uncertainty}</p>
                  <div className="mt-3">
                    <SourceReferences
                      sourceIds={question.sourceIds}
                      sources={profile.sources}
                      onSelect={setSelectedSource}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </ArchiveSection>

      <ArchiveSection
        id="scientific-sources"
        index={profile.scientificDebates?.length ? "09" : "08"}
        eyebrow="Reference cabinet"
        title="Scientific Sources"
        description="Sources are stored once with stable IDs and reused by evidence entries. No unverified citation is presented as established research."
      >
        <ScientificSourcesPanel sources={profile.sources} />
      </ArchiveSection>
    </div>
  );
}
