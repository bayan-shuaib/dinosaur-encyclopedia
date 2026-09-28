export type ScientificSourceType =
  | 'paper'
  | 'museum'
  | 'university'
  | 'scientificDatabase'
  | 'book'
  | 'institutionalReference'
  | 'other';

export type SourceAccessStatus = 'openAccess' | 'freeToRead' | 'paywalled' | 'repositoryAvailable' | 'unknown';
export type VerificationState = 'verified' | 'unverified';

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
  accessStatus: SourceAccessStatus;
  verified: VerificationState;
  notes?: string;
}

/** Curated records only. Keep this empty until a source has been checked. */
export const SCIENTIFIC_SOURCES: ScientificSource[] = [];

export interface SourceRelationship {
  sourceId: string;
  supports: string;
  evidenceType?: 'direct' | 'inferred' | 'reconstructed' | 'hypothesis' | 'unknown';
}

export const SOURCE_RELATIONSHIPS: Record<string, SourceRelationship[]> = {};

export function validateScientificSources(
  sources: ScientificSource[] = SCIENTIFIC_SOURCES,
  relationships: Record<string, SourceRelationship[]> = SOURCE_RELATIONSHIPS,
) {
  const errors: string[] = [];
  const ids = new Set<string>();
  const urlPattern = /^https?:\/\//i;

  sources.forEach((source) => {
    if (!source.id.trim() || !source.title.trim()) errors.push(`Source is missing an id or title: ${source.id || '(unknown)'}`);
    if (ids.has(source.id)) errors.push(`Duplicate source id: ${source.id}`);
    ids.add(source.id);
    if (!source.verified) errors.push(`Source is missing verification state: ${source.id}`);
    if (source.officialUrl && !urlPattern.test(source.officialUrl)) errors.push(`Malformed official URL: ${source.id}`);
    if (source.repositoryUrl && !urlPattern.test(source.repositoryUrl)) errors.push(`Malformed repository URL: ${source.id}`);
  });

  Object.entries(relationships).forEach(([recordId, links]) => {
    links.forEach((link) => {
      if (!ids.has(link.sourceId)) errors.push(`${recordId} references missing source: ${link.sourceId}`);
      if (!link.supports.trim()) errors.push(`${recordId} has an empty support statement`);
    });
  });

  return { valid: errors.length === 0, errors };
}

export function getSourcesForRecord(recordId: string) {
  const sourceIds = SOURCE_RELATIONSHIPS[recordId] ?? [];
  return sourceIds
    .map((relationship) => ({ relationship, source: SCIENTIFIC_SOURCES.find((source) => source.id === relationship.sourceId) }))
    .filter((entry): entry is { relationship: SourceRelationship; source: ScientificSource } => Boolean(entry.source));
}

export function getVerifiedSourcesForRecord(recordId: string) {
  return getSourcesForRecord(recordId).filter(({ source }) => source.verified === 'verified');
}

export function getSourceValidationErrors() {
  return validateScientificSources().errors;
}

export type EvidenceType = NonNullable<SourceRelationship['evidenceType']>;
export type SpecimenSourceLinks = Record<string, SourceRelationship[]>;
export const SPECIMEN_SOURCE_RELATIONSHIPS: SpecimenSourceLinks = {};
export const EVIDENCE_SOURCE_RELATIONSHIPS: Record<string, SourceRelationship[]> = {};

export type { SourceRelationship as ScientificSourceRelationship };
