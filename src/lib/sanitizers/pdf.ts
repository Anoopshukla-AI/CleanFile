import { PDFDocument, PDFName } from "pdf-lib";
import { v4 as uuidv4 } from "uuid";
import {
  MetadataFinding,
  SanitizationResult,
  Sanitizer,
  VerificationResult,
} from "../types";
import { assessFindingSeverity } from "../engine/risk";

export class PdfSanitizer implements Sanitizer {
  canHandle(fileName: string, mimeType: string): boolean {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ext === "pdf" || mimeType === "application/pdf";
  }

  async scan(buffer: ArrayBuffer): Promise<MetadataFinding[]> {
    const findings: MetadataFinding[] = [];

    try {
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      const infoFields = [
        { field: "Author", value: pdfDoc.getAuthor(), category: "identity" },
        { field: "Creator", value: pdfDoc.getCreator(), category: "application" },
        { field: "Producer", value: pdfDoc.getProducer(), category: "application" },
        { field: "Title", value: pdfDoc.getTitle(), category: "document" },
        { field: "Subject", value: pdfDoc.getSubject(), category: "document" },
        { field: "Keywords", value: pdfDoc.getKeywords(), category: "document" },
      ];

      for (const item of infoFields) {
        if (
          item.value &&
          item.value.trim() !== "" &&
          !item.value.includes("pdf-lib")
        ) {
          const val = item.value.trim();
          const severity = assessFindingSeverity(item.field, item.category, val);
          findings.push({
            id: uuidv4(),
            category: item.category as any,
            field: item.field,
            value: val,
            detected: true,
            removable: true,
            removed: false,
            severity,
          });
        }
      }

      // Check dates (ignore epoch 0 dates set during sanitization)
      const creationDate = pdfDoc.getCreationDate();
      if (creationDate && creationDate.getTime() > 0) {
        findings.push({
          id: uuidv4(),
          category: "timestamps",
          field: "Creation Date",
          value: creationDate.toISOString(),
          detected: true,
          removable: true,
          removed: false,
          severity: "medium",
        });
      }

      const modDate = pdfDoc.getModificationDate();
      if (modDate && modDate.getTime() > 0) {
        findings.push({
          id: uuidv4(),
          category: "timestamps",
          field: "Modification Date",
          value: modDate.toISOString(),
          detected: true,
          removable: true,
          removed: false,
          severity: "medium",
        });
      }

      // Check Catalog XMP Metadata stream
      const catalog = pdfDoc.catalog;
      if (catalog.has(PDFName.of("Metadata"))) {
        findings.push({
          id: uuidv4(),
          category: "technical",
          field: "XMP Metadata Stream",
          value: "Embedded PDF XML Metadata Stream in Document Catalog",
          detected: true,
          removable: true,
          removed: false,
          severity: "medium",
        });
      }
    } catch (err) {
      console.warn("PDF scanning warning:", err);
    }

    return findings;
  }

  async sanitize(
    buffer: ArrayBuffer,
    fileName: string
  ): Promise<SanitizationResult> {
    const originalFindings = await this.scan(buffer);

    let cleanedBuffer = buffer;

    try {
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // Set explicit empty strings for Info Dictionary fields
      pdfDoc.setTitle("");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setKeywords([]);
      pdfDoc.setCreator("");
      pdfDoc.setProducer("");
      pdfDoc.setCreationDate(new Date(0));
      pdfDoc.setModificationDate(new Date(0));

      // Remove XMP Metadata stream from Catalog
      const catalog = pdfDoc.catalog;
      if (catalog.has(PDFName.of("Metadata"))) {
        catalog.delete(PDFName.of("Metadata"));
      }

      const uint8Array = await pdfDoc.save({ useObjectStreams: false });
      cleanedBuffer = uint8Array.buffer as ArrayBuffer;
    } catch (err) {
      console.warn("PDF sanitization warning:", err);
    }

    const verification = await this.verify(originalFindings, cleanedBuffer, fileName);

    const baseName = fileName.replace(/\.[^/.]+$/, "");
    const cleanedFileName = `${baseName}-clean.pdf`;

    return {
      cleanedBuffer,
      cleanedFileName,
      findings: verification.postScanFindings,
      removedCount: verification.verifiedRemovedCount,
      unremovedCount: verification.unremovedFindings.length,
      sanitizationTimestamp: new Date().toISOString(),
    };
  }

  async verify(
    originalFindings: MetadataFinding[],
    cleanedBuffer: ArrayBuffer,
    _fileName: string
  ): Promise<VerificationResult> {
    let integrityCheckPassed = false;
    let postScanFindingsRaw: MetadataFinding[] = [];

    try {
      const pdfDoc = await PDFDocument.load(cleanedBuffer, { ignoreEncryption: true });
      integrityCheckPassed = pdfDoc.getPageCount() > 0;
      postScanFindingsRaw = await this.scan(cleanedBuffer);
    } catch (err) {
      integrityCheckPassed = false;
    }

    const remainingFieldsSet = new Set(postScanFindingsRaw.map((f) => f.field));

    const postScanFindings: MetadataFinding[] = originalFindings.map((finding) => {
      const isStillPresent = remainingFieldsSet.has(finding.field);
      return {
        ...finding,
        removed: !isStillPresent,
        limitation: isStillPresent
          ? "Current PDF engine does not support safe removal of this specific internal structure."
          : undefined,
      };
    });

    const removedCount = postScanFindings.filter((f) => f.removed).length;
    const unremoved = postScanFindings.filter((f) => !f.removed);

    return {
      verified: integrityCheckPassed,
      postScanFindings,
      verifiedRemovedCount: removedCount,
      unremovedFindings: unremoved,
      integrityCheckPassed,
      notes: [
        "PDF Info Dictionary and Catalog XMP stream cleared.",
        "Limitation: Annotations, form fields, embedded files, and incremental-save history are not altered.",
      ],
    };
  }
}
