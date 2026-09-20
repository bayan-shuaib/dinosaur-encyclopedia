import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  FlaskConical,
  MapPin,
  Microscope,
  Search,
  ShieldQuestion,
  Skull,
  Tags,
} from "lucide-react";
import type { Dinosaur } from "@/data/types";
import type { ScientificSource } from "@/data/scientificEvidence";
import type { ScientificPaper, SpecimenRecord } from "@/data/specimenArchive";

interface Props {
  dino: Dinosaur;
  specimens: SpecimenRecord[];
  papers: ScientificPaper[];
  sources: ScientificSource[];
}

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
    <section id={id} className="scroll-mt-24 space-y-5">
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
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "verified" | "limited";
}) {
  const styles = {
    neutral: "border-border/50 bg-secondary/40 text-muted-foreground",
    verified: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    limited: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  };
  return (
    <span className={`inline-flex items-center rounded-sm border px-2 py-1 text-[9px] uppercase tracking-[0.12em] font-display ${styles[tone]}`}>
      {children}
    </span>
  );
}

function SourceReferences({
  sourceIds,
  sources,
}: {
  sourceIds: string[];
  sources: ScientificSource[];
}) {
  const sourceMap = useMemo(
    () => new Map(sources.map((source) => [source.id, source])),
    [sources],
  );
  const linked = sourceIds
    .map((id) => sourceMap.get(id))
    .filter((source): source is ScientificSource => Boolean(source));

  if (!linked.length) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground/55 font-body">
        <ShieldQuestion className="h-3 w-3" />
        Source review pending
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {linked.map((source) => (
        <a
          key={source.id}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-1.5 rounded-sm border border-amber-500/25 bg-amber-500/[0.05] px-2 py-1 text-[10px] text-amber-200/80 hover:bg-amber-500/10 font-display"
        >
          <BookOpen className="h-3 w-3 shrink-0" />
          <span className="truncate">{source.title}</span>
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      ))}
    </div>
  );
}

function SpecimenCard({
  specimen,
  selected,
  onSelect,
}: {
  specimen: SpecimenRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group w-full rounded-xl border p-4 text-left transition-colors md:p-5 ${
        selected
          ? "border-amber-500/45 bg-amber-500/[0.07]"
          : "border-border/45 bg-card/55 hover:border-amber-500/25 hover:bg-card/75"
      }`}
      data-testid={`specimen-card-${specimen.id}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/[0.06] text-amber-300/80">
          <Skull className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-amber-400/60 font-display">
                {specimen.catalogNumber}
              </p>
              <h3 className="mt-1 text-lg font-display font-semibold text-foreground">
                {specimen.name}
              </h3>
            </div>
            <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${selected ? "translate-x-1 text-amber-300" : "text-muted-foreground/50 group-hover:translate-x-1"}`} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground/75 font-body">
            {specimen.institution}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatusBadge tone={specimen.verificationStatus === "verified" ? "verified" : "limited"}>
              {specimen.verificationStatus === "verified" ? "Verified record" : "Needs review"}
            </StatusBadge>
            <StatusBadge>{specimen.preservationStatus}</StatusBadge>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/75 font-body">
            {specimen.specimenSummary}
          </p>
        </div>
      </div>
    </button>
  );
}

function SpecimenDetail({
  specimen,
  sources,
}: {
  specimen: SpecimenRecord;
  sources: ScientificSource[];
}) {
  return (
    <motion.article
      key={specimen.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-500/25 bg-amber-500/[0.035] p-4 md:p-6"
      data-testid="specimen-detail"
    >
      <div className="flex flex-col gap-4 border-b border-border/35 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.22em] text-amber-400/65 font-display">
            Individual specimen profile
          </p>
          <h3 className="mt-2 text-2xl font-display font-bold text-foreground">{specimen.name}</h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground/75">{specimen.catalogNumber}</p>
        </div>
        <StatusBadge tone={specimen.verificationStatus === "verified" ? "verified" : "limited"}>
          {specimen.verificationStatus === "verified" ? "Source-linked record" : "Requires review"}
        </StatusBadge>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-amber-400/60 font-display">Identity</p>
            <dl className="mt-2 space-y-2 text-sm font-body">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground/55">Institution</dt><dd className="text-right text-foreground/80">{specimen.institution}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground/55">Species</dt><dd className="text-right text-foreground/80">{specimen.speciesId}</dd></div>
              {specimen.country && <div className="flex justify-between gap-3"><dt className="text-muted-foreground/55">Country</dt><dd className="text-right text-foreground/80">{specimen.country}</dd></div>}
            </dl>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-amber-400/60 font-display">Discovery</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80 font-body">{specimen.discoveryDescription}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground/70 font-body">
              {specimen.discoveryYear && <span>{specimen.discoveryYear}</span>}
              {specimen.locality && <span>· {specimen.locality}</span>}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-amber-400/60 font-display">Preservation</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge>{specimen.preservationStatus}</StatusBadge>
              {specimen.completeness && <StatusBadge>{specimen.completeness}</StatusBadge>}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {specimen.preservedElements.map((element) => <StatusBadge key={element}>{element}</StatusBadge>)}
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-amber-400/60 font-display">Evidence categories</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {specimen.evidenceCategories.map((category) => <StatusBadge key={category}>{category.replace("_", " ")}</StatusBadge>)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-border/35 pt-5 md:grid-cols-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-amber-400/60 font-display">Scientific significance</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80 font-body">{specimen.scientificSignificance}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-amber-400/60 font-display">Specimen summary</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80 font-body">{specimen.specimenSummary}</p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-amber-500/15 bg-amber-500/[0.03] p-3.5">
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-amber-400/70 font-display">
          <ShieldQuestion className="h-3.5 w-3.5" />
          Limitations and open boundaries
        </p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground/75 font-body">
          {specimen.limitations.map((limitation) => <li key={limitation}>• {limitation}</li>)}
        </ul>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55 font-display">Evidence connections</p>
          <p className="mt-2 font-mono text-xs text-foreground/75">{specimen.relatedEvidenceIds.length ? specimen.relatedEvidenceIds.join(", ") : "None linked yet"}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55 font-display">Research papers</p>
          <p className="mt-2 font-mono text-xs text-foreground/75">{specimen.relatedPaperIds.length ? specimen.relatedPaperIds.join(", ") : "No papers linked yet"}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55 font-display">Sources</p>
          <div className="mt-2"><SourceReferences sourceIds={specimen.sourceIds} sources={sources} /></div>
        </div>
      </div>

      {specimen.officialLinks.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-border/35 pt-4">
          {specimen.officialLinks.map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200 font-display">
              Official institution page <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      )}
    </motion.article>
  );
}

export function SpecimenArchiveMode({ dino, specimens, papers, sources }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(specimens[0]?.id ?? null);
  const selectedSpecimen = specimens.find((specimen) => specimen.id === selectedId) ?? null;
  const institutions = [...new Set(specimens.map((specimen) => specimen.institution))];

  return (
    <div className="min-w-0 space-y-16 md:space-y-24" data-testid="specimen-archive-mode">
      <header className="relative overflow-hidden rounded-xl border border-amber-500/25 bg-amber-500/[0.035] p-5 md:p-7">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/55 to-transparent" />
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-amber-400/65 font-display">
              <Skull className="h-3.5 w-3.5" />
              Curated specimen archive · {dino.name}
            </div>
            <h1 className="mt-3 text-2xl font-display font-bold tracking-tight text-foreground md:text-4xl">
              Specimen Archive
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground/80 font-body">
              Individual fossils connect species-level interpretations to the physical record. This is a curated and expanding archive, not a claim to contain every specimen ever discovered.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg border border-border/40 bg-card/55 px-4 py-2.5">
              <p className="text-lg font-display font-bold tabular-nums text-amber-200/90">{specimens.length}</p>
              <p className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground/55 font-display">Records</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-card/55 px-4 py-2.5">
              <p className="text-lg font-display font-bold tabular-nums text-amber-200/90">{papers.length}</p>
              <p className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground/55 font-display">Papers</p>
            </div>
          </div>
        </div>
      </header>

      <ArchiveSection
        id="specimen-overview"
        index="01"
        eyebrow="Archive assessment"
        title="Specimen Overview"
        description="Specimen-level research shows how individual fossils contribute evidence while keeping the limits of each record visible."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/45 bg-card/55 p-4">
            <p className="text-[9px] uppercase tracking-[0.16em] text-amber-400/60 font-display">Documented specimens</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80 font-body">{specimens.length ? `${specimens.length} curated record${specimens.length === 1 ? "" : "s"} in this species archive.` : "No specimen records have been added to the current Dinopedia archive."}</p>
          </div>
          <div className="rounded-lg border border-border/45 bg-card/55 p-4">
            <p className="text-[9px] uppercase tracking-[0.16em] text-amber-400/60 font-display">Institutions</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80 font-body">{institutions.length ? institutions.join(" · ") : "None entered yet"}</p>
          </div>
          <div className="rounded-lg border border-border/45 bg-card/55 p-4">
            <p className="text-[9px] uppercase tracking-[0.16em] text-amber-400/60 font-display">Research status</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80 font-body">{specimens.length ? "Source-linked specimen records" : "Awaiting specimen research"}</p>
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/18 bg-amber-500/[0.03] p-4 md:p-5">
          <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-amber-400/70 font-display">
            <Microscope className="h-3.5 w-3.5" />
            What specimen research contributes
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground/80 font-body">
            A species profile describes patterns across evidence. A specimen record keeps the identity, locality, preservation, and limitations of one fossil visible so those broader interpretations can be reviewed rather than treated as abstract facts.
          </p>
        </div>
      </ArchiveSection>

      <ArchiveSection
        id="specimen-directory"
        index="02"
        eyebrow="Curated records"
        title="Specimen Directory"
        description="Select an individual specimen to open its full archive profile."
      >
        {specimens.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {specimens.map((specimen) => (
              <SpecimenCard
                key={specimen.id}
                specimen={specimen}
                selected={selectedId === specimen.id}
                onSelect={() => setSelectedId(specimen.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border/45 bg-card/45 p-5">
            <div className="flex items-start gap-3">
              <Search className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
              <div>
                <h3 className="text-base font-display font-semibold text-foreground">No specimen records added yet</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground/75 font-body">
                  No specimen records have been added to the current Dinopedia archive for {dino.name}. This does not mean that no specimens exist; it means this curated archive is awaiting verified entries.
                </p>
              </div>
            </div>
          </div>
        )}
      </ArchiveSection>

      {selectedSpecimen && (
        <ArchiveSection
          id="specimen-profile"
          index="03"
          eyebrow="Individual record"
          title="Specimen Profile"
          description="Identity, discovery, preservation, significance, evidence connections, and source records for the selected fossil."
        >
          <SpecimenDetail specimen={selectedSpecimen} sources={sources} />
        </ArchiveSection>
      )}

      <ArchiveSection
        id="specimen-literature"
        index={selectedSpecimen ? "04" : "03"}
        eyebrow="Research navigation"
        title="Scientific Literature"
        description="Literature records connect papers to species, specimens, evidence entries, and legitimate source links without reproducing copyrighted papers."
      >
        {papers.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {papers.map((paper) => (
              <article key={paper.id} className="rounded-xl border border-border/45 bg-card/55 p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/75" />
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-amber-400/60 font-display">{paper.literatureType.replace("_", " ")}</p>
                    <h3 className="mt-1 text-base font-display font-semibold text-foreground">{paper.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground/75 font-body">{paper.abstractSummary ?? "Summary not entered yet."}</p>
                    <div className="mt-3 flex flex-wrap gap-2"><StatusBadge>{paper.accessStatus.replace("_", " ")}</StatusBadge><StatusBadge tone={paper.verificationStatus === "verified" ? "verified" : "limited"}>{paper.verificationStatus.replace("_", " ")}</StatusBadge></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border/45 bg-card/45 p-5">
            <div className="flex items-start gap-3">
              <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
              <div>
                <h3 className="text-base font-display font-semibold text-foreground">No literature records added yet</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground/75 font-body">
                  The registry is ready for reviewed metadata, official links, access status, and evidence connections. No paper record is displayed until its metadata has been verified.
                </p>
              </div>
            </div>
          </div>
        )}
      </ArchiveSection>

      <ArchiveSection
        id="specimen-sources"
        index={selectedSpecimen ? "05" : "04"}
        eyebrow="Reference cabinet"
        title="Specimen Sources"
        description="Official institution pages are linked directly. Copyrighted papers are not copied or rehosted."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {sources.map((source) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="rounded-xl border border-border/45 bg-card/55 p-4 transition-colors hover:border-amber-500/30">
              <div className="flex items-start gap-3">
                <Tags className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/75" />
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-amber-400/60 font-display">{source.kind} · {source.verificationStatus?.replace("_", " ")}</p>
                  <p className="mt-1 text-base font-display font-semibold text-foreground">{source.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground/75 font-body">{source.publisher}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/55" />
              </div>
            </a>
          ))}
        </div>
      </ArchiveSection>
    </div>
  );
}