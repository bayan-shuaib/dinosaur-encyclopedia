import { dinosaurs } from "./dinosaurs";
import type { Dinosaur } from "./types";

export type EvidenceType =
  | "direct"
  | "inferred"
  | "reconstructed"
  | "hypothesis"
  | "unknown";

export type ConfidenceLevel =
  | "strong"
  | "moderate"
  | "limited"
  | "hypothesis"
  | "unknown";

export type EvidenceCategory =
  | "anatomical"
  | "locomotion"
  | "ecological"
  | "behavioral"
  | "feeding"
  | "sensory"
  | "growth"
  | "integumentary"
  | "reproductive"
  | "physiological"
  | "evolutionary"
  | "genetic"
  | "trace_fossil"
  | "pathology"
  | "other";

export type SourceAccessStatus =
  | "open_access"
  | "free_to_read"
  | "paywalled"
  | "repository_available"
  | "unknown";

export type SourceVerificationStatus =
  | "verified"
  | "partially_verified"
  | "needs_review";

export interface ScientificSource {
  id: string;
  title: string;
  authors?: string;
  year?: number;
  publisher?: string;
  journal?: string;
  url?: string;
  doi?: string;
  repositoryUrl?: string;
  accessStatus?: SourceAccessStatus;
  verificationStatus?: SourceVerificationStatus;
  kind:
    | "paper"
    | "book"
    | "museum"
    | "university"
    | "database"
    | "reference";
}

export interface EvidenceEntry {
  id: string;
  claim: string;
  category: EvidenceCategory;
  evidenceType: EvidenceType;
  evidence: string;
  interpretation: string;
  confidence: ConfidenceLevel;
  sourceIds: string[];
  relatedSpecimenIds?: string[];
  relatedPaperIds?: string[];
  competingInterpretations?: string[];
  limitations?: string[];
}

export interface DirectEvidence {
  id: string;
  type: string;
  description: string;
  significance: string;
  sourceIds: string[];
  relatedSpecimenIds?: string[];
  relatedPaperIds?: string[];
}

export interface EvolutionaryContext {
  clade?: string;
  classification?: string;
  relationships?: string[];
  derivedTraits?: string[];
  ancestralTraits?: string[];
  evolutionarySignificance?: string;
  sourceIds?: string[];
}

export interface GeneticContext {
  directEvidenceStatus: string;
  comparativeEvidence?: string[];
  developmentalContext?: string[];
  limitations?: string[];
  sourceIds?: string[];
}

export interface ResearchHistoryEntry {
  year?: number;
  title: string;
  description: string;
  sourceIds: string[];
  relatedSpecimenIds?: string[];
  relatedEvidenceIds?: string[];
}

export interface OpenQuestion {
  question: string;
  currentUnderstanding: string;
  uncertainty: string;
  sourceIds: string[];
  relatedSpecimenIds?: string[];
}

export interface ScientificDebate {
  topic: string;
  interpretations: {
    position: string;
    supportingEvidence: string[];
    sourceIds: string[];
    relatedSpecimenIds?: string[];
    relatedPaperIds?: string[];
  }[];
  currentStatus: string;
}

export interface ScientificEvidenceProfile {
  speciesId: string;
  evidenceOverview: {
    summary: string;
    fossilCompleteness?: string;
    preservation?: string;
    importantMaterial?: string[];
    geologicalContext?: string;
    importantLocalities?: string[];
    overallStatus?: string;
    limitations?: string[];
  };
  directEvidence: DirectEvidence[];
  traitEvidence: EvidenceEntry[];
  evolutionaryContext: EvolutionaryContext;
  geneticContext: GeneticContext;
  researchHistory: ResearchHistoryEntry[];
  openQuestions: OpenQuestion[];
  sources: ScientificSource[];
  scientificDebates?: ScientificDebate[];
}

function materialLabel(material: string): string {
  if (/egg/i.test(material)) return "Eggs";
  if (/embry/i.test(material)) return "Embryos";
  if (/skin|feather|integument/i.test(material)) return "Integument";
  if (/track/i.test(material)) return "Trackways";
  if (/tooth|teeth|jaw|skull/i.test(material)) return "Cranial material";
  if (/patholog|injur|fracture/i.test(material)) return "Pathology";
  return "Skeletal material";
}

function preservationLabel(completeness: number): string {
  if (completeness >= 75) return "Relatively well represented in the current catalogue";
  if (completeness >= 40) return "Partially represented in the current catalogue";
  return "Fragmentary representation in the current catalogue";
}

/**
 * Baseline profiles deliberately describe the state of Dinopedia's own
 * catalogue record. They do not turn derived indexes or generated prose into
 * source-backed scientific claims. Verified research can replace individual
 * profiles later without changing the UI contract.
 */
function createBaselineProfile(dino: Dinosaur): ScientificEvidenceProfile {
  const skeleton = dino.skeletonData;
  const relatedNames = dino.relatedIds
    .map((id) => dinosaurs.find((candidate) => candidate.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const materialTypes = Array.from(
    new Set(skeleton.recoveredBones.map(materialLabel)),
  );
  const knownElements = skeleton.recoveredBones.slice(0, 6).join(", ");
  const missingElements = skeleton.missingBones.slice(0, 5).join(", ");

  return {
    speciesId: dino.id,
    evidenceOverview: {
      summary: `This baseline evidence profile records what the Dinopedia catalogue currently knows about ${dino.name}. It separates catalogue metadata from source-verified research so uncertainty remains visible.`,
      fossilCompleteness: `Archive record: ${skeleton.completeness}% skeletal coverage`,
      preservation: preservationLabel(skeleton.completeness),
      importantMaterial: skeleton.recoveredBones.slice(0, 6),
      geologicalContext: `${dino.discovery.location} · ${dino.period} (${dino.periodRange.end}–${dino.periodRange.start} Mya)`,
      importantLocalities: [dino.discovery.location],
      overallStatus:
        skeleton.completeness >= 75
          ? "Extensive catalogue representation; source review still required"
          : skeleton.completeness >= 40
            ? "Moderate catalogue representation; source review still required"
            : "Limited or fragmentary catalogue representation",
      limitations: [
        "This baseline profile does not contain specimen-level citations yet.",
        "Soft tissues, exact coloration, detailed behavior, and many physiological traits remain unresolved here.",
        ...(missingElements
          ? [`The archive lists these missing or poorly represented elements: ${missingElements}.`]
          : []),
      ],
    },
    directEvidence: [
      {
        id: "catalogue-skeletal-material",
        type: "Skeletal material",
        description: `The current catalogue lists: ${knownElements || "No specific elements have been entered."}`,
        significance:
          "These are the physical materials represented in the current Dinopedia record; specimen-level interpretation still requires verified sources.",
        sourceIds: [],
      },
      ...materialTypes
        .filter((type) => type !== "Skeletal material")
        .map((type) => ({
          id: `catalogue-${type.toLowerCase().replace(/\s+/g, "-")}`,
          type,
          description: `The current catalogue includes ${type.toLowerCase()} among its recorded recovered material.`,
          significance:
            "This entry preserves the catalogue's material label without claiming a broader species-wide conclusion.",
          sourceIds: [],
        })),
    ],
    traitEvidence: [
      {
        id: "catalogue-skeletal-record",
        claim: "A skeletal record is available for this species.",
        category: "anatomical",
        evidenceType: "direct",
        evidence: `The catalogue records ${skeleton.recoveredBones.length} recovered material labels and ${skeleton.missingBones.length} missing or poorly represented labels.`,
        interpretation:
          "The record can support a structured discussion of anatomy, but its completeness should not be mistaken for a measure of scientific certainty.",
        confidence: "limited",
        sourceIds: [],
        limitations: [
          "No specimen-level source is attached to this baseline entry.",
          "Completeness values are catalogue metadata, not a statistical confidence score.",
        ],
      },
      {
        id: "catalogue-taxonomic-placement",
        claim: `${dino.name} is placed in the ${dino.classification.family} family and ${dino.group} group in the current archive.`,
        category: "evolutionary",
        evidence: `The structured catalogue classification lists ${dino.classification.order}, ${dino.classification.family}, and ${dino.classification.genus}.`,
        interpretation:
          "This is the current archive placement. The evidence mode intentionally leaves source review and competing phylogenetic analyses visible as future work.",
        confidence: "limited",
        sourceIds: [],
        limitations: ["No source-linked phylogenetic analysis is attached to this baseline entry."],
      },
      {
        id: "catalogue-body-reconstruction",
        claim: "Body proportions are represented as a reconstruction in the archive.",
        category: "anatomical",
        evidence: `The catalogue records approximately ${dino.length} m length, ${dino.height} m height, and ${dino.weight} kg mass.`,
        interpretation:
          "These values support the existing museum display, but their specimen basis and uncertainty range are not documented in this baseline profile.",
        confidence: "unknown",
        sourceIds: [],
        limitations: ["Do not read these display values as direct measurements of every individual."],
      },
      {
        id: "catalogue-locomotion",
        claim: "Locomotion remains a reconstruction question in this archive.",
        category: "locomotion",
        evidence: "No source-linked trackway or biomechanical study is attached to the baseline profile.",
        interpretation:
          "Existing Anatomy and Life modes may discuss locomotion, but this research mode does not mark a specific gait as established without a source.",
        confidence: "unknown",
        sourceIds: [],
        limitations: ["Trackway evidence and model-specific uncertainty require future research entries."],
      },
      {
        id: "catalogue-genetic-limit",
        claim: "No species-specific genetic record has been entered for this archive entry.",
        category: "genetic",
        evidence: "The Dinopedia data model contains no genome or species-specific sequence field.",
        interpretation:
          "The absence of a genetic record in Dinopedia is not evidence that a trait is impossible; it is a boundary on what this archive currently represents.",
        confidence: "unknown",
        sourceIds: [],
        limitations: ["No DNA sequence or genome is inferred or generated."],
      },
    ],
    evolutionaryContext: {
      clade: dino.classification.class,
      classification: `${dino.classification.order} · ${dino.classification.family} · ${dino.classification.genus}`,
      relationships:
        relatedNames.length > 0
          ? relatedNames.map((name) => `Related catalogue entry: ${name}`)
          : ["No related species have been linked in the current catalogue."],
      derivedTraits: [
        "Species-specific derived traits require source-linked phylogenetic review.",
      ],
      ancestralTraits: [
        "Ancestral trait history is not asserted in this baseline profile.",
      ],
      evolutionarySignificance:
        "The current archive provides a taxonomic starting point. Stronger evolutionary claims should be added with sources and, where relevant, competing interpretations.",
      sourceIds: [],
    },
    geneticContext: {
      directEvidenceStatus:
        "No species-specific genetic evidence is stored in the Dinopedia record.",
      comparativeEvidence: [
        "Comparative biology may eventually use living relatives, but no species-specific comparison is attached here.",
      ],
      developmentalContext: [
        "No developmental interpretation is entered in this baseline profile.",
      ],
      limitations: [
        "No dinosaur DNA sequence is generated or implied.",
        "Genetic mechanisms cannot be inferred from this catalogue alone.",
      ],
      sourceIds: [],
    },
    researchHistory: [
      {
        year: dino.discovery.year,
        title: "Discovery metadata in the archive",
        description: `The current catalogue records ${dino.discovery.discoverer} and ${dino.discovery.location} for the discovery entry. A verified publication history is not attached yet.`,
        sourceIds: [],
      },
    ],
    openQuestions: [
      {
        question: `Which specimen-level studies support the current reconstruction of ${dino.name}?`,
        currentUnderstanding:
          "The archive contains structured anatomy and discovery metadata, but not a verified source list for this species.",
        uncertainty:
          "Without linked primary sources, the strength and scope of individual claims cannot be evaluated here.",
        sourceIds: [],
      },
      {
        question: "Which soft tissues and behaviors remain unknown?",
        currentUnderstanding:
          "The existing record focuses on skeletal and catalogue-level information.",
        uncertainty:
          "Coloration, soft tissue, exact behavior, and many physiological details are not directly preserved in the current record.",
        sourceIds: [],
      },
    ],
    sources: [],
    scientificDebates: [],
  };
}

export const scientificEvidenceProfiles: Record<string, ScientificEvidenceProfile> =
  Object.fromEntries(
    dinosaurs.map((dino) => [dino.id, createBaselineProfile(dino)]),
  );

export interface ScientificEvidenceCoverage {
  totalSpecies: number;
  totalProfiles: number;
  missingProfiles: string[];
  orphanProfiles: string[];
  duplicateSpeciesIds: string[];
  invalidSourceReferences: string[];
}

export function validateScientificEvidenceCoverage(): ScientificEvidenceCoverage {
  const speciesIds = dinosaurs.map((dino) => dino.id);
  const speciesIdSet = new Set(speciesIds);
  const profileIds = Object.keys(scientificEvidenceProfiles);
  const profileIdSet = new Set(profileIds);
  const speciesCounts = new Map<string, number>();

  speciesIds.forEach((id) => {
    speciesCounts.set(id, (speciesCounts.get(id) ?? 0) + 1);
  });

  const invalidSourceReferences = Object.values(scientificEvidenceProfiles).flatMap(
    (profile) => {
      const sourceIds = new Set(profile.sources.map((source) => source.id));
      const referencedIds = [
        ...profile.directEvidence.flatMap((entry) => entry.sourceIds),
        ...profile.traitEvidence.flatMap((entry) => entry.sourceIds),
        ...(profile.evolutionaryContext.sourceIds ?? []),
        ...(profile.geneticContext.sourceIds ?? []),
        ...profile.researchHistory.flatMap((entry) => entry.sourceIds),
        ...profile.openQuestions.flatMap((entry) => entry.sourceIds),
        ...(profile.scientificDebates ?? []).flatMap((debate) =>
          debate.interpretations.flatMap((interpretation) => interpretation.sourceIds),
        ),
      ];
      return referencedIds
        .filter((sourceId) => !sourceIds.has(sourceId))
        .map((sourceId) => `${profile.speciesId}:${sourceId}`);
    },
  );

  return {
    totalSpecies: speciesIdSet.size,
    totalProfiles: profileIdSet.size,
    missingProfiles: speciesIds.filter((id) => !profileIdSet.has(id)),
    orphanProfiles: profileIds.filter((id) => !speciesIdSet.has(id)),
    duplicateSpeciesIds: [...speciesCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([id]) => id),
    invalidSourceReferences,
  };
}

export function getScientificEvidenceProfile(
  speciesId: string,
): ScientificEvidenceProfile {
  const profile = scientificEvidenceProfiles[speciesId];
  if (!profile) {
    throw new Error(`Missing scientific evidence profile for species: ${speciesId}`);
  }
  return profile;
}

export const scientificEvidenceCoverage = validateScientificEvidenceCoverage();

if (
  import.meta.env.DEV &&
  (scientificEvidenceCoverage.missingProfiles.length > 0 ||
    scientificEvidenceCoverage.orphanProfiles.length > 0 ||
    scientificEvidenceCoverage.duplicateSpeciesIds.length > 0 ||
    scientificEvidenceCoverage.invalidSourceReferences.length > 0)
) {
  console.warn("Scientific evidence coverage validation failed", scientificEvidenceCoverage);
}