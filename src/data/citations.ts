export type ScientificSourceType = 'paper' | 'museum' | 'university' | 'scientificDatabase' | 'book' | 'institutionalReference' | 'other';
export type AccessStatus = 'openAccess' | 'freeToRead' | 'paywalled' | 'repositoryAvailable' | 'unknown';
export type VerificationState = 'verified' | 'unverified';
export type EvidenceType = 'direct' | 'inferred' | 'reconstructed' | 'hypothesis' | 'unknown';

export interface ScientificSource {
  id: string;
  title: string;
  authors?: string[];
  year?: number;
  journal?: string;
  publisher?: string;
  doi?: string;
  officialUrl?: string;
  repositoryUrl?: string;
  sourceType: ScientificSourceType;
  accessStatus: AccessStatus;
  verification: VerificationState;
  summary?: string;
  notes?: string;
}

export interface SourceRelationship {
  sourceId: string;
  supports: string;
  evidenceType: EvidenceType;
  scope: 'species' | 'evidence' | 'specimen' | 'term';
  entityId: string;
}

/** Intentionally conservative: only sources that have been verified should be added here. */
export const SCIENTIFIC_SOURCES: ScientificSource[] = [];
export const SOURCE_RELATIONSHIPS: SourceRelationship[] = [];

export function getSourcesForSpecies(speciesId: string): ScientificSource[] {
  const ids = new Set(SOURCE_RELATIONSHIPS.filter(r => r.scope === 'species' && r.entityId === speciesId).map(r => r.sourceId));
  return SCIENTIFIC_SOURCES.filter(source => ids.has(source.id));
}

export function getRelationshipsForSource(sourceId: string): SourceRelationship[] {
  return SOURCE_RELATIONSHIPS.filter(r => r.sourceId === sourceId);
}

export function validateCitationRegistry(sources = SCIENTIFIC_SOURCES, relationships = SOURCE_RELATIONSHIPS): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const source of sources) {
    if (!source.id || ids.has(source.id)) errors.push(`Duplicate or missing source id: ${source.id || '(empty)'}`);
    ids.add(source.id);
    if (!source.title) errors.push(`Source ${source.id} is missing a title`);
    if (!source.verification) errors.push(`Source ${source.id} is missing verification state`);
    for (const url of [source.officialUrl, source.repositoryUrl].filter(Boolean)) {
      try { new URL(url as string); } catch { errors.push(`Source ${source.id} has a malformed URL`); }
    }
  }
  for (const relationship of relationships) {
    if (!ids.has(relationship.sourceId)) errors.push(`Relationship references unknown source: ${relationship.sourceId}`);
    if (!relationship.entityId || !relationship.supports) errors.push(`Relationship for ${relationship.sourceId} is incomplete`);
  }
  return errors;
}

export const citationRegistryErrors = validateCitationRegistry();
if (import.meta.env?.DEV && citationRegistryErrors.length) console.warn('[Dinopedia] Citation registry validation:', citationRegistryErrors);

export function formatSourceType(type: ScientificSourceType): string {
  return { paper: 'Research paper', museum: 'Museum', university: 'University', scientificDatabase: 'Scientific database', book: 'Book', institutionalReference: 'Institutional reference', other: 'Reference' }[type];
}

export function formatAccessStatus(status: AccessStatus): string {
  return { openAccess: 'Open access', freeToRead: 'Free to read', paywalled: 'Publisher access', repositoryAvailable: 'Repository copy', unknown: 'Access status unknown' }[status];
}

export function formatEvidenceType(type: EvidenceType): string {
  return { direct: 'Direct evidence', inferred: 'Inferred', reconstructed: 'Reconstructed', hypothesis: 'Hypothesis', unknown: 'Evidence status unknown' }[type];
}

export function getSourcesForEntity(entityId: string, scope: SourceRelationship['scope']): ScientificSource[] {
  const ids = new Set(SOURCE_RELATIONSHIPS.filter(r => r.entityId === entityId && r.scope === scope).map(r => r.sourceId));
  return SCIENTIFIC_SOURCES.filter(source => ids.has(source.id));
}

export function getSourceRelationships(entityId: string, scope: SourceRelationship['scope']): SourceRelationship[] {
  return SOURCE_RELATIONSHIPS.filter(r => r.entityId === entityId && r.scope === scope);
}

export type { ScientificSource as Source };
export const sourceRegistry = SCIENTIFIC_SOURCES;
export const sourceRelationships = SOURCE_RELATIONSHIPS;
export const validateSources = validateCitationRegistry;

export function getSourcesForSpecimen(specimenId: string) { return getSourcesForEntity(specimenId, 'specimen'); }
export function getSourcesForEvidence(evidenceId: string) { return getSourcesForEntity(evidenceId, 'evidence'); }
export function getSourcesForTerm(termId: string) { return getSourcesForEntity(termId, 'term'); }
export function getSpeciesRelationships(speciesId: string) { return getSourceRelationships(speciesId, 'species'); }
export function getEvidenceRelationships(evidenceId: string) { return getSourceRelationships(evidenceId, 'evidence'); }
export function getSpecimenRelationships(specimenId: string) { return getSourceRelationships(specimenId, 'specimen'); }
export function getTermRelationships(termId: string) { return getSourceRelationships(termId, 'term'); }
export function getSourceById(sourceId: string) { return SCIENTIFIC_SOURCES.find(source => source.id === sourceId); }
export function isSourceVerified(source: ScientificSource) { return source.verification === 'verified'; }
export function getVerifiedSources(sources = SCIENTIFIC_SOURCES) { return sources.filter(isSourceVerified); }
export function getSourceCountForSpecies(speciesId: string) { return getSourcesForSpecies(speciesId).length; }
export function getRelationshipCountForSource(sourceId: string) { return getRelationshipsForSource(sourceId).length; }
export function hasSourcesForSpecies(speciesId: string) { return getSourceCountForSpecies(speciesId) > 0; }
export function hasSourcesForEntity(entityId: string, scope: SourceRelationship['scope']) { return getSourcesForEntity(entityId, scope).length > 0; }
export function getUnverifiedSources(sources = SCIENTIFIC_SOURCES) { return sources.filter(source => source.verification === 'unverified'); }
export function getOpenLinks(source: ScientificSource) { return [source.officialUrl, source.repositoryUrl].filter(Boolean) as string[]; }
export function sourceSupports(sourceId: string, entityId: string) { return SOURCE_RELATIONSHIPS.some(r => r.sourceId === sourceId && r.entityId === entityId); }

export default SCIENTIFIC_SOURCES;
