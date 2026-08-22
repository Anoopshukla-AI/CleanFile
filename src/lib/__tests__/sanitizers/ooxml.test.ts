import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { OoxmlSanitizer } from "../../sanitizers/ooxml";

async function createMockDocxWithMetadata(): Promise<ArrayBuffer> {
  const zip = new JSZip();

  const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">
  <dc:creator>Alice Smith</dc:creator>
  <cp:lastModifiedBy>Bob Jones</cp:lastModifiedBy>
  <dc:title>Confidential Q3 Strategy</dc:title>
  <cp:keywords>internal, secret</cp:keywords>
</cp:coreProperties>`;

  const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Microsoft Office Word</Application>
  <Company>Acme Corp</Company>
</Properties>`;

  zip.file("docProps/core.xml", coreXml);
  zip.file("docProps/app.xml", appXml);
  zip.file("word/document.xml", "<w:document><w:body><w:p><w:r><w:t>Hello World Document Content</w:t></w:r></w:p></w:body></w:document>");

  return await zip.generateAsync({ type: "arraybuffer" });
}

describe("OOXML (DOCX/XLSX/PPTX) Sanitizer Integration", () => {
  const sanitizer = new OoxmlSanitizer();

  it("handles DOCX, XLSX, and PPTX extensions", () => {
    expect(sanitizer.canHandle("report.docx", "")).toBe(true);
    expect(sanitizer.canHandle("budget.xlsx", "")).toBe(true);
    expect(sanitizer.canHandle("slides.pptx", "")).toBe(true);
    expect(sanitizer.canHandle("image.jpg", "")).toBe(false);
  });

  it("scans and extracts core and app properties from DOCX ZIP", async () => {
    const docxBuf = await createMockDocxWithMetadata();
    const findings = await sanitizer.scan(docxBuf);

    expect(findings.length).toBeGreaterThanOrEqual(4);
    const author = findings.find((f) => f.field === "Author / Creator");
    expect(author?.value).toBe("Alice Smith");

    const title = findings.find((f) => f.field === "Document Title");
    expect(title?.value).toBe("Confidential Q3 Strategy");

    const company = findings.find((f) => f.field === "Company");
    expect(company?.value).toBe("Acme Corp");
  });

  it("sanitizes DOCX by clearing metadata while preserving document body XML", async () => {
    const docxBuf = await createMockDocxWithMetadata();
    const result = await sanitizer.sanitize(docxBuf, "proposal.docx");

    expect(result.cleanedFileName).toBe("proposal-clean.docx");
    expect(result.removedCount).toBeGreaterThan(0);

    // Verify document content was untouched
    const zip = await JSZip.loadAsync(result.cleanedBuffer);
    const bodyXml = await zip.file("word/document.xml")?.async("string");
    expect(bodyXml).toContain("Hello World Document Content");

    // Verify metadata was cleared
    const postFindings = await sanitizer.scan(result.cleanedBuffer);
    expect(postFindings.length).toBe(0);
  });
});
