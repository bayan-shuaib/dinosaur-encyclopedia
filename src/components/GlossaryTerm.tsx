import { useState } from 'react';
import { DICTIONARY, DictionaryEntry } from '@/data/scientificDictionary';

export function GlossaryTerm({ entry, children }: { entry: DictionaryEntry; children: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline">
      <button type="button" className="glossary-term" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={`Define ${entry.term}`}>
        {children}
      </button>
      {open && (
        <span role="dialog" className="glossary-popover" onClick={(event) => event.stopPropagation()}>
          <span className="block text-[9px] uppercase tracking-[0.18em] text-amber-300/70">{entry.category}</span>
          <strong className="mt-1 block font-display text-sm text-foreground">{entry.term}</strong>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{entry.definition.split('. ')[0]}.</span>
        </span>
      )}
    </span>
  );
}

const entries = [...DICTIONARY].sort((a, b) => b.triggers.join('').length - a.triggers.join('').length);
const triggerPattern = new RegExp(`\\b(${entries.flatMap((entry) => entry.triggers).map((trigger) => trigger.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')).join('|')})\\b`, 'gi');

export function withGlossaryTerms(text: string) {
  const parts = text.split(triggerPattern);
  return parts.map((part, index) => {
    const entry = entries.find((candidate) => candidate.triggers.some((trigger) => trigger.toLowerCase() === part.toLowerCase()));
    return entry ? <GlossaryTerm key={`${entry.term}-${index}`} entry={entry}>{part}</GlossaryTerm> : part;
  });
}
