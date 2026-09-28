import { ExternalLink, FlaskConical, ShieldCheck } from 'lucide-react';
import { getSourcesForRecord } from '@/data/scientificSources';

interface Props { recordId: string; }

export function ScientificSources({ recordId }: Props) {
  const sources = getSourcesForRecord(recordId);

  return (
    <section className="scientific-sources" aria-labelledby="scientific-sources-title" data-testid="scientific-sources">
      <div className="flex items-start gap-4">
        <div className="museum-icon-box"><FlaskConical aria-hidden="true" /></div>
        <div>
          <p className="section-label mb-1">Research archive</p>
          <h2 id="scientific-sources-title" className="text-2xl md:text-3xl font-display font-bold tracking-tight">Scientific Sources</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Sources are connected to specific claims only after their relationship has been checked. Interpretations are labelled rather than presented as direct observation.
          </p>
        </div>
      </div>

      {sources.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-amber-500/25 bg-amber-500/[0.025] p-5 md:p-6">
          <p className="flex items-center gap-2 text-sm font-display font-semibold text-foreground">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-amber-300/75" />
            Sources for this species are currently being curated.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Existing museum text is not treated as individually verified evidence until a legitimate source is linked to it.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {sources.map(({ source, relationship }) => (
            <article key={source.id} className="rounded-xl border border-border/60 bg-card/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold text-foreground">{source.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{source.authors?.join(', ') || 'Author information unavailable'}{source.year ? ` · ${source.year}` : ''}</p>
                </div>
                <span className="rounded-sm border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-emerald-200">Verified</span>
              </div>
              <p className="mt-3 border-l-2 border-amber-400/40 pl-3 text-sm leading-relaxed text-foreground/80">{relationship.supports}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{source.journal || source.publisher || source.sourceType}</span>
                {source.doi && <span>DOI: {source.doi}</span>}
                {(source.officialUrl || source.repositoryUrl) && <a className="inline-flex items-center gap-1 text-amber-200 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={source.officialUrl || source.repositoryUrl} target="_blank" rel="noreferrer">Open legitimate source <ExternalLink aria-hidden="true" /></a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
