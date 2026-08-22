export type FindingCategory =
  | "identity"
  | "document"
  | "application"
  | "location"
  | "device"
  | "timestamps"
  | "comments"
  | "technical"
  | "other";

export type Severity = "info" | "low" | "medium" | "high";

export type MetadataFinding = {
  id: string;
  category: FindingCategory;
  field: string;
  value: string;
  detected: boolean;
  removable: boolean;
  removed: boolean;
  severity: Severity;
  limitation?: string;
};

export type FormatCapability = {
  format: string;
  scan: boolean;
  clean: boolean;
  verify: boolean;
  supportedFields: string[];
  limitations: string[];
};

export type ProcessingState =
  | "idle"
  | "validating"
  | "scanning"
  | "analyzing"
  | "sanitizing"
  | "verifying"
  | "complete"
  | "failed";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type PrivacyScoreResult = {
  beforeScore: number;
  afterScore: number;
  scoreDelta: number;
  beforeRiskLevel: RiskLevel;
  afterRiskLevel: RiskLevel;
  explanation: string;
};

export type SanitizationResult = {
  cleanedBuffer: ArrayBuffer;
  cleanedFileName: string;
  findings: MetadataFinding[];
  removedCount: number;
  unremovedCount: number;
  sanitizationTimestamp: string;
};

export type VerificationResult = {
  verified: boolean;
  postScanFindings: MetadataFinding[];
  verifiedRemovedCount: number;
  unremovedFindings: MetadataFinding[];
  integrityCheckPassed: boolean;
  notes: string[];
};

export type SanitizationReport = {
  reportId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  format: string;
  processingTimestamp: string;
  totalFindings: number;
  removedCount: number;
  remainingCount: number;
  beforeScore: number;
  afterScore: number;
  beforeRiskLevel: RiskLevel;
  afterRiskLevel: RiskLevel;
  findings: MetadataFinding[];
  capabilities: FormatCapability;
  limitations: string[];
  verificationStatus: "VERIFIED" | "PARTIAL" | "FAILED";
  disclaimer: string;
};

export interface Sanitizer {
  canHandle(fileName: string, mimeType: string): boolean;
  scan(buffer: ArrayBuffer, fileName: string): Promise<MetadataFinding[]>;
  sanitize(buffer: ArrayBuffer, fileName: string): Promise<SanitizationResult>;
  verify(
    originalFindings: MetadataFinding[],
    cleanedBuffer: ArrayBuffer,
    fileName: string
  ): Promise<VerificationResult>;
}
