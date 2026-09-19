import { describe, expect, it } from "vitest";
import { dinosaurs } from "@/data/dinosaurs";
import {
  getScientificEvidenceProfile,
  validateScientificEvidenceCoverage,
} from "@/data/scientificEvidence";

describe("scientific evidence coverage", () => {
  it("provides exactly one profile for every catalogue species", () => {
    const coverage = validateScientificEvidenceCoverage();

    expect(coverage.totalSpecies).toBe(dinosaurs.length);
    expect(coverage.totalProfiles).toBe(dinosaurs.length);
    expect(coverage.missingProfiles).toEqual([]);
    expect(coverage.orphanProfiles).toEqual([]);
    expect(coverage.duplicateSpeciesIds).toEqual([]);
    expect(coverage.invalidSourceReferences).toEqual([]);
  });

  it("keeps the evidence profile lookup keyed by species ID", () => {
    const profile = getScientificEvidenceProfile("tyrannosaurus-rex");

    expect(profile.speciesId).toBe("tyrannosaurus-rex");
    expect(profile.geneticContext.directEvidenceStatus).toMatch(/No species-specific genetic evidence/);
    expect(profile.sources).toEqual([]);
  });
});