import { describe, expect, it } from "vitest";
import { dinosaurs } from "@/data/dinosaurs";
import {
  getSpecimensForSpecies,
  scientificPapers,
  specimenArchiveCoverage,
  specimenRecords,
  validateSpecimenArchiveCoverage,
} from "@/data/specimenArchive";

describe("specimen archive coverage", () => {
  it("keeps specimen and literature references valid", () => {
    const coverage = validateSpecimenArchiveCoverage();

    expect(coverage.totalSpecimens).toBe(specimenRecords.length);
    expect(coverage.duplicateSpecimenIds).toEqual([]);
    expect(coverage.orphanSpecimens).toEqual([]);
    expect(coverage.invalidSpeciesReferences).toEqual([]);
    expect(coverage.invalidEvidenceReferences).toEqual([]);
    expect(coverage.invalidPaperReferences).toEqual([]);
    expect(coverage.invalidSourceReferences).toEqual([]);
    expect(coverage.totalLiteratureRecords).toBe(scientificPapers.length);
    expect(coverage.invalidPaperIds).toEqual([]);
    expect(coverage.invalidPaperSpeciesReferences).toEqual([]);
    expect(coverage.invalidPaperSpecimenReferences).toEqual([]);
    expect(coverage.invalidPaperEvidenceReferences).toEqual([]);
    expect(coverage.invalidPaperSourceReferences).toEqual([]);
  });

  it("provides an honest empty archive for species without records", () => {
    expect(getSpecimensForSpecies("tyrannosaurus-rex").length).toBeGreaterThan(0);
    expect(getSpecimensForSpecies(dinosaurs.find((dino) => dino.id !== "tyrannosaurus-rex")!.id)).toEqual([]);
    expect(specimenArchiveCoverage.recordsRequiringReview).toEqual([
      "specimen-tyrannosaurus-scotty",
    ]);
  });
});