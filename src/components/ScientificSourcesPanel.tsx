import { useState } from "react";
import { ExternalLink, FileText, ShieldCheck, X } from "lucide-react";
import type { ScientificSource } from "@/data/scientificEvidence";

const accessLabels: Record<string, string> = {
  open_access: "Open access",
  free_to_read: "Free to read",
  paywalled: "Publisher access",
  repository_available: "Repository available",
  unknown: "Access status unknown",
};

const kindLabels: Record<string, string> = {
  paper: "Research paper",
  book: "Book",
  museum: "Museum record",
  university: "University source",
  database: "Scientific database",
  reference: "Institutional reference",
};

function SourceCard({ source, onSelect }: { source: ScientificSource; onSelect: () => void }) {
  return (
    <article className="rounded-xl border border-border/45 bg-card/55 p-4 transition-colors hover:border-amber-500/30">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/[0.06] text-amber-300/80">
          <FileText className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <button type="button" onClick={onSelect} className="text-left text-sm font-display font-semibold leading-snug text-foreground hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60">
              {source.title}
            </button>
            {source.verificationStatus === "verified" && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-emerald-300 font-display">
                <ShieldCheck className="size-3" aria-hidden="true" /> Verified
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground/75 font-body">
            {[source.authors, source.year, source.journal ?? source.publisher].filter(Boolean).join(" · ") || "Bibliographic details are still being curated."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-sm border border-border/50 bg-secondary/40 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground font-display">{kindLabels[source.kind]}</span>
            <span className="rounded-sm border border-border/50 bg-secondary/40 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground font-display">{accessLabels[source.accessStatus ?? "unknown"]}</span>
            {(source.url || source.doi || source.repositoryUrl) && (
              <a href={source.url ?? source.repositoryUrl ?? `https://doi.org/${source.doi}`} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-[10px] text-amber-300 hover:text-amber-200 font-display focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60">
                Open source <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ScientificSourcesPanel({ sources, title = "Scientific Sources" }: { sources: ScientificSource[]; title?: string }) {
  const [selected, setSelected] = useState<ScientificSource | null>(null);
  return (
    <section className="space-y-4" aria-labelledby="scientific-sources-title" data-testid="scientific-sources-panel">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.24em] text-amber-400/60 font-display">Research register</p>
          <h2 id="scientific-sources-title" className="mt-1 text-xl font-display font-bold tracking-tight text-foreground">{title}</h2>
        </div>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/55 font-display">{sources.length} linked</span>
      </div>
      {sources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/50 bg-card/30 px-5 py-6 text-sm leading-relaxed text-muted-foreground/75 font-body">
          Scientific sources for this section are currently being curated. Dinopedia does not attach unverified references to existing claims.
        </div>
      ) : (
        <div className="grid gap-3">{sources.map((source) => <SourceCard key={source.id} source={source} onSelect={() => setSelected(source)} />)}</div>
      )}
      {selected && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-4" role="dialog" aria-label={`Details for ${selected.title}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-amber-400/65 font-display">Source record</p>
              <h3 className="mt-1 text-base font-display font-semibold text-foreground">{selected.title}</h3>
            </div>
            <button type="button" onClick={() => setSelected(null)} aria-label="Close source details" className="rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"><X className="size-4" /></button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground/80 font-body">{selected.summary ?? "Dinopedia has not added an original summary for this source yet."}</p>
          {selected.supports && <p className="mt-3 border-l-2 border-amber-500/35 pl-3 text-sm leading-relaxed text-foreground/80 font-body"><span className="font-display text-amber-300/80">Supports: </span>{selected.supports}</p>}
          {selected.doi && <p className="mt-3 font-mono text-xs text-muted-foreground/70">DOI: {selected.doi}</p>}
        </div>
      )}
    </section>
  );
}

export function CitationIndicator({ source, onSelect }: { source: ScientificSource; onSelect: () => void }) {
  return <button type="button" onClick={onSelect} aria-label={`Open citation: ${source.title}`} className="inline-flex items-center gap-1 rounded-sm border border-amber-500/25 bg-amber-500/[0.05] px-2 py-1 text-[10px] text-amber-200/80 font-display hover:border-amber-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"><FileText className="size-3" aria-hidden="true" /> Source</button>;
}

export default ScientificSourcesPanel;
