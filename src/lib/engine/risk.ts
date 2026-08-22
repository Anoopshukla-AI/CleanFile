import { MetadataFinding, PrivacyScoreResult, RiskLevel } from "../types";

const SEVERITY_WEIGHTS = {
  high: 15,
  medium: 8,
  low: 3,
  info: 1,
};

export function calculatePrivacyScore(
  beforeFindings: MetadataFinding[],
  afterFindings: MetadataFinding[]
): PrivacyScoreResult {
  const calculateScore = (findings: MetadataFinding[]): number => {
    if (findings.length === 0) return 100;

    let penalty = 0;
    for (const f of findings) {
      if (f.detected && !f.removed) {
        penalty += SEVERITY_WEIGHTS[f.severity] || 3;
      }
    }
    return Math.max(0, Math.min(100, 100 - penalty));
  };

  // For initial scan before cleaning, calculate based on detected findings
  const initialPenalty = beforeFindings.reduce((sum, f) => {
    return sum + (SEVERITY_WEIGHTS[f.severity] || 3);
  }, 0);

  const beforeScore = Math.max(0, Math.min(100, 100 - initialPenalty));
  const afterScore = calculateScore(afterFindings);
  const scoreDelta = afterScore - beforeScore;

  const determineRiskLevel = (score: number, findings: MetadataFinding[]): RiskLevel => {
    const hasHighSeverity = findings.some(
      (f) => f.severity === "high" && (!f.removed || findings === beforeFindings)
    );
    if (hasHighSeverity || score < 60) return "HIGH";
    if (score < 85) return "MEDIUM";
    return "LOW";
  };

  const beforeRiskLevel = determineRiskLevel(beforeScore, beforeFindings);
  const afterRiskLevel = determineRiskLevel(afterScore, afterFindings);

  let explanation = "";
  if (beforeFindings.length === 0) {
    explanation = "No supported removable metadata detected by CleanFile.";
  } else if (afterScore === 100) {
    explanation = "All detected removable metadata was successfully removed.";
  } else {
    const unremovedCount = afterFindings.filter((f) => !f.removed).length;
    explanation = `${unremovedCount} finding(s) remain that could not be sanitized by current processing engines.`;
  }

  return {
    beforeScore,
    afterScore,
    scoreDelta,
    beforeRiskLevel,
    afterRiskLevel,
    explanation,
  };
}

export function assessFindingSeverity(
  field: string,
  category: string,
  value: string
): "info" | "low" | "medium" | "high" {
  const fieldLower = field.toLowerCase();
  const valueLower = value.toLowerCase();

  // High severity: GPS, personal location, explicit PII, embedded comments
  if (
    fieldLower.includes("gps") ||
    fieldLower.includes("latitude") ||
    fieldLower.includes("longitude") ||
    fieldLower.includes("location") ||
    category === "location" ||
    fieldLower.includes("comment") ||
    category === "comments"
  ) {
    return "high";
  }

  // Medium severity: Author, Company, Software, Last Modified By, Timestamps
  if (
    fieldLower.includes("author") ||
    fieldLower.includes("creator") ||
    fieldLower.includes("last modified by") ||
    fieldLower.includes("company") ||
    fieldLower.includes("manager") ||
    fieldLower.includes("software") ||
    fieldLower.includes("producer") ||
    category === "identity" ||
    category === "timestamps"
  ) {
    return "medium";
  }

  // Low severity: Title, Subject, Keywords, Application stats
  if (
    fieldLower.includes("title") ||
    fieldLower.includes("subject") ||
    fieldLower.includes("keywords") ||
    fieldLower.includes("description") ||
    category === "document" ||
    category === "application"
  ) {
    return "low";
  }

  return "info";
}
