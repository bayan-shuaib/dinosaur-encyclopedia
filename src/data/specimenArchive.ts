import { dinosaurs } from "./dinosaurs";
import {
  scientificEvidenceProfiles,
  type ScientificSource,
  type SourceAccessStatus,
  type SourceVerificationStatus,
} from "./scientificEvidence";

export type SpecimenPreservationStatus =
  | "extensive"
  | "partial"
  | "fragmentary"
  | "isolated"
  | "unknown";

export type SpecimenEvidenceCategory =
  | "skeletal"
  | "dental"
  | "integumentary"
  | "trace_fossil"
  | "pathology"
  | "reproductive"
  | "soft_tissue"
  | "other";

export interface SpecimenRecord {
  id: string;
  speciesId: string;
  name: string;
  catalogNumber: string;
  institution: string;
  country?: string;
  locality?: string;
  geologicalFormation?: string;
  geologicalAge?: string;
  discoveryYear?: number;
  discoveryDescription: string;
  discoverer?: string;
  preservationStatus: SpecimenPreservationStatus;
  completeness?: string;
  preservedElements: string[];
  evidenceCategories: SpecimenEvidenceCategory[];
  specimenSummary: string;
  scientificSignificance: string;
  limitations: string[];
  relatedEvidenceIds: string[];
  relatedPaperIds: string[];
  sourceIds: string[];
  officialLinks: string[];
  imageCredits?: string[];
  verificationStatus: SourceVerificationStatus;
}

export type LiteratureType =
  | "research_article"
  | "review"
  | "book"
  | "book_chapter"
  | "conference_paper"
  | "thesis"
  | "database"
  | "other";

export type LiteratureAccessStatus = SourceAccessStatus;
export type LiteratureVerificationStatus = SourceVerificationStatus;

export interface ScientificPaper {
  id: string;
  title: string;
  authors?: string;
  year?: number;
  journal?: string;
  publisher?: string;
  doi?: string;
  officialUrl?: string;
  repositoryUrl?: string;
  literatureType: LiteratureType;
  accessStatus: LiteratureAccessStatus;
  abstractSummary?: string;
  researchQuestions?: string[];
  speciesIds: string[];
  specimenIds: string[];
  evidenceEntryIds: string[];
  sourceIds: string[];
  verificationStatus: LiteratureVerificationStatus;
  notes?: string;
}

export const specimenSources: ScientificSource[] = [
  {
    id: "source-field-museum-sue",
    title: "SUE the T. rex",
    publisher: "Field Museum",
    url: "https://www.fieldmuseum.org/blog/sue-t-rex",
    kind: "museum",
    accessStatus: "free_to_read",
    verificationStatus: "verified",
  },
  {
    id: "source-royal-saskatchewan-scotty",
    title: "CN T. rex Gallery",
    publisher: "Royal Saskatchewan Museum",
    url: "https://royalsaskmuseum.ca/visit/exhibits/cn-trex-gallery",
    kind: "museum",
    accessStatus: "free_to_read",
    verificationStatus: "verified",
  },
  {
    id: "source-black-hills-trex-chart",
    title: "Specimen Catalog for Tyrannosaurus rex",
    publisher: "Black Hills Institute",
    url: "https://www.bhigr.com/t-rex-specimen-chart",
    kind: "museum",
    accessStatus: "free_to_read",
    verificationStatus: "verified",
  },
];

const initialSpecimens: SpecimenRecord[] = [
  {
    id: "specimen-tyrannosaurus-sue",
    speciesId: "tyrannosaurus-rex",
    name: "SUE",
    catalogNumber: "FMNH PR 2081",
    institution: "Field Museum",
    country: "United States",
    locality: "South Dakota, United States",
    geologicalAge: "Late Cretaceous; approximately 67 million years old",
    discoveryYear: 1990,
    discoveryDescription:
      "The Field Museum records that Sue Hendrickson discovered the specimen during a commercial excavation trip in South Dakota.",
    discoverer: "Sue Hendrickson",
    preservationStatus: "extensive",
    completeness: "Approximately 90% by bulk, according to the Field Museum record.",
    preservedElements: ["Large articulated skeleton", "Skull and teeth"],
    evidenceCategories: ["skeletal", "dental", "pathology"],
    specimenSummary:
      "A highly complete Tyrannosaurus rex specimen and a major museum research resource.",
    scientificSignificance:
      "The specimen has contributed to research on tyrannosaur anatomy, growth, pathology, and life history.",
    limitations: [
      "This is a curated specimen record, not a claim that the archive contains every T. rex specimen.",
    ],
    relatedEvidenceIds: ["catalogue-skeletal-record"],
    relatedPaperIds: [],
    sourceIds: ["source-field-museum-sue"],
    officialLinks: ["https://www.fieldmuseum.org/blog/sue-t-rex"],
    verificationStatus: "verified",
  },
  {
    id: "specimen-tyrannosaurus-stan",
    speciesId: "tyrannosaurus-rex",
    name: "STAN",
    catalogNumber: "BHIGR-3033",
    institution: "Black Hills Institute",
    country: "United States",
    locality: "South Dakota, United States",
    geologicalAge: "Late Cretaceous",
    discoveryYear: 1992,
    discoveryDescription:
      "The Black Hills Institute specimen catalogue lists STAN as discovered in South Dakota in 1992.",
    discoverer: "Sacrison",
    preservationStatus: "partial",
    completeness: "70% in the Black Hills Institute specimen catalogue.",
    preservedElements: ["Partial skeleton", "Skull greater than 10%"],
    evidenceCategories: ["skeletal", "dental", "pathology"],
    specimenSummary:
      "A documented T. rex specimen represented in the Black Hills Institute catalogue.",
    scientificSignificance:
      "Its catalogue record provides a specimen-level anchor for future source-linked anatomical research.",
    limitations: [
      "The current Dinopedia record does not yet attach research papers to this specimen.",
    ],
    relatedEvidenceIds: ["catalogue-skeletal-record"],
    relatedPaperIds: [],
    sourceIds: ["source-black-hills-trex-chart"],
    officialLinks: ["https://www.bhigr.com/t-rex-specimen-chart"],
    verificationStatus: "verified",
  },
  {
    id: "specimen-tyrannosaurus-scotty",
    speciesId: "tyrannosaurus-rex",
    name: "Scotty",
    catalogNumber: "RSM P2523.8",
    institution: "Royal Saskatchewan Museum",
    country: "Canada",
    locality: "Frenchman River Valley, Saskatchewan, Canada",
    geologicalAge: "Late Cretaceous",
    discoveryYear: 1991,
    discoveryDescription:
      "The Royal Saskatchewan Museum records discovery by an RSM research team in Saskatchewan's Frenchman River Valley in 1991.",
    discoverer: "Royal Saskatchewan Museum research team",
    preservationStatus: "partial",
    completeness: "65% complete according to the Royal Saskatchewan Museum gallery record.",
    preservedElements: ["Partial skeleton"],
    evidenceCategories: ["skeletal", "pathology"],
    specimenSummary:
      "A Royal Saskatchewan Museum T. rex specimen whose preparation continued for more than two decades.",
    scientificSignificance:
      "The museum's gallery record describes the specimen as an important source for research into T. rex size, age, and pathology.",
    limitations: [
      "Comparisons of body size between large T. rex specimens remain dependent on measurement methods and source context.",
    ],
    relatedEvidenceIds: ["catalogue-skeletal-record"],
    relatedPaperIds: [],
    sourceIds: ["source-royal-saskatchewan-scotty"],
    officialLinks: ["https://royalsaskmuseum.ca/visit/exhibits/cn-trex-gallery"],
    verificationStatus: "partially_verified",
  },
];

export const specimenRecords: SpecimenRecord[] = initialSpecimens;

export const specimenRegistry: Record<string, SpecimenRecord[]> = Object.fromEntries(
  dinosaurs.map((dino) => [
    dino.id,
    specimenRecords.filter((specimen) => specimen.speciesId === dino.id),
  ]),
);

export const scientificPapers: ScientificPaper[] = [];

export function getSpecimensForSpecies(speciesId: string): SpecimenRecord[] {
  return specimenRegistry[speciesId] ?? [];
}

export interface SpecimenArchiveCoverage {
  totalSpecimens: number;
  duplicateSpecimenIds: string[];
  orphanSpecimens: string[];
  invalidSpeciesReferences: string[];
  invalidEvidenceReferences: string[];
  invalidPaperReferences: string[];
  invalidSourceReferences: string[];
  recordsRequiringReview: string[];
  totalLiteratureRecords: number;
  invalidPaperIds: string[];
  invalidPaperSpeciesReferences: string[];
  invalidPaperSpecimenReferences: string[];
  invalidPaperEvidenceReferences: string[];
  invalidPaperSourceReferences: string[];
  literatureRecordsRequiringReview: string[];
}

export function validateSpecimenArchiveCoverage(): SpecimenArchiveCoverage {
  const speciesIds = new Set(dinosaurs.map((dino) => dino.id));
  const specimenIds = new Set(specimenRecords.map((specimen) => specimen.id));
  const paperIds = new Set(scientificPapers.map((paper) => paper.id));
  const sourceIds = new Set(specimenSources.map((source) => source.id));
  const evidenceIds = new Set(
    Object.values(scientificEvidenceProfiles).flatMap((profile) => [
      ...profile.directEvidence.map((entry) => entry.id),
      ...profile.traitEvidence.map((entry) => entry.id),
    ]),
  );
  const specimenIdCounts = new Map<string, number>();
  const paperIdCounts = new Map<string, number>();

  specimenRecords.forEach((specimen) => {
    specimenIdCounts.set(specimen.id, (specimenIdCounts.get(specimen.id) ?? 0) + 1);
  });
  scientificPapers.forEach((paper) => {
    paperIdCounts.set(paper.id, (paperIdCounts.get(paper.id) ?? 0) + 1);
  });

  return {
    totalSpecimens: specimenRecords.length,
    duplicateSpecimenIds: [...specimenIdCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([id]) => id),
    orphanSpecimens: specimenRecords
      .filter((specimen) => !speciesIds.has(specimen.speciesId))
      .map((specimen) => specimen.id),
    invalidSpeciesReferences: specimenRecords
      .filter((specimen) => !speciesIds.has(specimen.speciesId))
      .map((specimen) => `${specimen.id}:${specimen.speciesId}`),
    invalidEvidenceReferences: specimenRecords.flatMap((specimen) =>
      specimen.relatedEvidenceIds
        .filter((id) => !evidenceIds.has(id))
        .map((id) => `${specimen.id}:${id}`),
    ),
    invalidPaperReferences: specimenRecords.flatMap((specimen) =>
      specimen.relatedPaperIds
        .filter((id) => !paperIds.has(id))
        .map((id) => `${specimen.id}:${id}`),
    ),
    invalidSourceReferences: specimenRecords.flatMap((specimen) =>
      specimen.sourceIds
        .filter((id) => !sourceIds.has(id))
        .map((id) => `${specimen.id}:${id}`),
    ),
    recordsRequiringReview: specimenRecords
      .filter((specimen) => specimen.verificationStatus !== "verified")
      .map((specimen) => specimen.id),
    totalLiteratureRecords: scientificPapers.length,
    invalidPaperIds: [...paperIdCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([id]) => id),
    invalidPaperSpeciesReferences: scientificPapers.flatMap((paper) =>
      paper.speciesIds
        .filter((id) => !speciesIds.has(id))
        .map((id) => `${paper.id}:${id}`),
    ),
    invalidPaperSpecimenReferences: scientificPapers.flatMap((paper) =>
      paper.specimenIds
        .filter((id) => !specimenIds.has(id))
        .map((id) => `${paper.id}:${id}`),
    ),
    invalidPaperEvidenceReferences: scientificPapers.flatMap((paper) =>
      paper.evidenceEntryIds
        .filter((id) => !evidenceIds.has(id))
        .map((id) => `${paper.id}:${id}`),
    ),
    invalidPaperSourceReferences: scientificPapers.flatMap((paper) =>
      paper.sourceIds
        .filter((id) => !sourceIds.has(id))
        .map((id) => `${paper.id}:${id}`),
    ),
    literatureRecordsRequiringReview: scientificPapers
      .filter((paper) => paper.verificationStatus !== "verified")
      .map((paper) => paper.id),
  };
}

export const specimenArchiveCoverage = validateSpecimenArchiveCoverage();