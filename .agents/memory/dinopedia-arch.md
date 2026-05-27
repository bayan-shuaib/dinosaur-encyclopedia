---
name: Dinopedia architecture
description: Key component relationships and data flow for the Dinopedia encyclopedia app.
---

## Core data flow

`DinosaurPage` → `SpeciesContent` → sections + exhibits + dictionary

`SpeciesContent.tsx` owns:
- Life/Scientific mode toggle state
- `activeSectionId` (driven by NarrationPlayer callback)
- Section building (`buildLifeSections`, `buildScientificSections`)
- Renders: NarrationPlayer, SectionBlock list, SectionExhibit per section, FunFactsBlock, NomenclatureDictionary

## Key exports from SpeciesContent
- `Section` interface (used by NomenclatureDictionary)

## Exhibit system
- `src/components/exhibits/MuseumExhibits.tsx` — all exhibit components
- `SectionExhibit` component: takes `{ sectionId, dino, mode }` → returns correct exhibit or null
- Life mode: diet→BiteForceLab (carnivores), behavior→LocomotionLab, role→EcologicalExhibit
- Scientific mode: bite→BiteForceLab, speed→LocomotionLab, intel→SensoryExhibit

## Dictionary system
- `src/data/scientificDictionary.ts` — 34 terms with triggers, definitions, significance
- `NomenclatureDictionary.tsx` — detects terms from section body text via substring match on triggers
- Category filter tabs, expandable cards, species-relevance blurb per term

## Narration system
- `NarrationPlayer.tsx` — always rendered, HEAD-checks `/audio/{id}/{mode}.mp3`
- States: checking → available (HTML5 player) | unavailable (premium placeholder)
- `onActiveSectionId` callback drives auto-expand in SpeciesContent
- Transcript: `/audio/{id}/{mode}.json` with `{ sectionId, sectionTitle, text, start, end }[]`

**Why:** These are non-obvious relationships; the files don't fully document which component controls which state.
**How to apply:** When adding features to species pages, understand that SpeciesContent is the orchestrator — extend it rather than creating parallel state elsewhere.
