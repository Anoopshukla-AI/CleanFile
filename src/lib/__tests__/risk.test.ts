import { describe, expect, it } from "vitest";
import { calculatePrivacyScore, assessFindingSeverity } from "../engine/risk";
import { MetadataFinding } from "../types";

describe("Privacy Risk & Scoring Engine", () => {
  it("calculates 100/100 when no findings are detected", () => {
    const res = calculatePrivacyScore([], []);
    expect(res.beforeScore).toBe(100);
    expect(res.afterScore).toBe(100);
    expect(res.scoreDelta).toBe(0);
    expect(res.beforeRiskLevel).toBe("LOW");
    expect(res.afterRiskLevel).toBe("LOW");
  });

  it("calculates correct score penalties and delta for findings", () => {
    const findingHigh: MetadataFinding = {
      id: "1",
      category: "location",
      field: "GPS Latitude",
      value: "37.7749 N",
      detected: true,
      removable: true,
      removed: false,
      severity: "high",
    };

    const findingMedium: MetadataFinding = {
      id: "2",
      category: "identity",
      field: "Author",
      value: "John Doe",
      detected: true,
      removable: true,
      removed: false,
      severity: "medium",
    };

    const beforeFindings = [findingHigh, findingMedium]; // penalty = 15 + 8 = 23 -> score = 77

    // Case 1: After cleaning, all removed
    const afterFindingsCleaned: MetadataFinding[] = [
      { ...findingHigh, removed: true },
      { ...findingMedium, removed: true },
    ];

    const res = calculatePrivacyScore(beforeFindings, afterFindingsCleaned);
    expect(res.beforeScore).toBe(77);
    expect(res.afterScore).toBe(100);
    expect(res.scoreDelta).toBe(23);
    expect(res.beforeRiskLevel).toBe("HIGH"); // Has high severity finding
    expect(res.afterRiskLevel).toBe("LOW");
  });

  it("assesses field severities accurately", () => {
    expect(assessFindingSeverity("GPS Longitude", "location", "122.4194 W")).toBe("high");
    expect(assessFindingSeverity("Author", "identity", "Jane Smith")).toBe("medium");
    expect(assessFindingSeverity("Software", "application", "Word 16.0")).toBe("medium");
    expect(assessFindingSeverity("Document Title", "document", "Annual Report")).toBe("low");
  });
});
