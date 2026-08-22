import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { PdfSanitizer } from "../../sanitizers/pdf";

async function createMockPdfWithMetadata(): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.addPage([600, 400]);

  pdfDoc.setAuthor("Charlie Brown");
  pdfDoc.setTitle("Project Spec 2026");
  pdfDoc.setSubject("Private Technical Brief");
  pdfDoc.setCreator("Custom PDF Generator v1.0");
  pdfDoc.setProducer("Internal Converter Engine");

  const uint8 = await pdfDoc.save();
  return uint8.buffer as ArrayBuffer;
}

describe("PDF Sanitizer Integration", () => {
  const sanitizer = new PdfSanitizer();

  it("handles PDF files", () => {
    expect(sanitizer.canHandle("doc.pdf", "application/pdf")).toBe(true);
    expect(sanitizer.canHandle("doc.docx", "")).toBe(false);
  });

  it("scans and detects Info Dictionary metadata in PDF", async () => {
    const pdfBuf = await createMockPdfWithMetadata();
    const findings = await sanitizer.scan(pdfBuf);

    expect(findings.length).toBeGreaterThanOrEqual(4);
    const author = findings.find((f) => f.field === "Author");
    expect(author?.value).toBe("Charlie Brown");

    const title = findings.find((f) => f.field === "Title");
    expect(title?.value).toBe("Project Spec 2026");
  });

  it("sanitizes PDF by clearing Info Dictionary fields", async () => {
    const pdfBuf = await createMockPdfWithMetadata();
    const result = await sanitizer.sanitize(pdfBuf, "brief.pdf");

    expect(result.cleanedFileName).toBe("brief-clean.pdf");
    expect(result.removedCount).toBeGreaterThan(0);

    // Verify post scan clears original metadata fields
    const postFindings = await sanitizer.scan(result.cleanedBuffer);
    const postAuthor = postFindings.find((f) => f.field === "Author");
    const postTitle = postFindings.find((f) => f.field === "Title");
    expect(postAuthor).toBeUndefined();
    expect(postTitle).toBeUndefined();
  });
});
