import { JpegSanitizer } from "../sanitizers/jpeg";
import { PngSanitizer } from "../sanitizers/png";
import { OoxmlSanitizer } from "../sanitizers/ooxml";
import { PdfSanitizer } from "../sanitizers/pdf";
import {
  FormatCapability,
  MetadataFinding,
  SanitizationReport,
  SanitizationResult,
  Sanitizer,
  VerificationResult,
} from "../types";
import { getCapability } from "./capabilities";
import { calculatePrivacyScore } from "./risk";
import { validateFileBasics, validateMagicBytes } from "../validation";
import { v4 as uuidv4 } from "uuid";

export class SanitizationEngine {
  private sanitizers: Sanitizer[] = [
    new JpegSanitizer(),
    new PngSanitizer(),
    new OoxmlSanitizer(),
    new PdfSanitizer(),
  ];

  getSanitizer(fileName: string, mimeType: string): Sanitizer | null {
    for (const sanitizer of this.sanitizers) {
      if (sanitizer.canHandle(fileName, mimeType)) {
        return sanitizer;
      }
    }
    return null;
  }

  async runPipeline(
    file: File,
    onProgress?: (step: string, percent: number) => void
  ): Promise<{
    result: SanitizationResult;
    verification: VerificationResult;
    report: SanitizationReport;
  }> {
    onProgress?.("VALIDATING", 10);

    const validation = validateFileBasics(file.name, file.size, file.type);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const arrayBuffer = await file.arrayBuffer();

    if (!validateMagicBytes(arrayBuffer, validation.extension)) {
      throw new Error(
        `File magic bytes mismatch for .${validation.extension}. The file content does not match its extension or may be corrupted.`
      );
    }

    const sanitizer = this.getSanitizer(file.name, file.type);
    if (!sanitizer) {
      throw new Error(
        `No processing engine available for format: ${validation.format}`
      );
    }

    onProgress?.("SCANNING", 30);
    const initialFindings = await sanitizer.scan(arrayBuffer, file.name);

    onProgress?.("ANALYZING", 50);
    // Initial risk assessment
    const scoreBeforeOnly = calculatePrivacyScore(initialFindings, initialFindings);

    onProgress?.("SANITIZING", 70);
    const sanitizationResult = await sanitizer.sanitize(arrayBuffer, file.name);

    onProgress?.("VERIFYING", 90);
    const verificationResult = await sanitizer.verify(
      initialFindings,
      sanitizationResult.cleanedBuffer,
      file.name
    );

    onProgress?.("COMPLETE", 100);

    const finalScore = calculatePrivacyScore(
      initialFindings,
      verificationResult.postScanFindings
    );

    const capability = getCapability(validation.format);

    const report: SanitizationReport = {
      reportId: `REP-${uuidv4().substring(0, 8).toUpperCase()}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || `application/${validation.extension}`,
      format: validation.format,
      processingTimestamp: new Date().toISOString(),
      totalFindings: initialFindings.length,
      removedCount: verificationResult.verifiedRemovedCount,
      remainingCount: verificationResult.unremovedFindings.length,
      beforeScore: finalScore.beforeScore,
      afterScore: finalScore.afterScore,
      beforeRiskLevel: finalScore.beforeRiskLevel,
      afterRiskLevel: finalScore.afterRiskLevel,
      findings: verificationResult.postScanFindings,
      capabilities: capability,
      limitations: capability.limitations,
      verificationStatus: verificationResult.verified
        ? verificationResult.unremovedFindings.length === 0
          ? "VERIFIED"
          : "PARTIAL"
        : "FAILED",
      disclaimer:
        "Risk level and privacy score are informational assessments based on detected metadata. CleanFile does not guarantee forensic sanitization, anonymity, or complete removal of uninspected structures.",
    };

    return {
      result: sanitizationResult,
      verification: verificationResult,
      report,
    };
  }
}

export const globalEngine = new SanitizationEngine();
