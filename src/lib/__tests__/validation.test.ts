import { describe, expect, it } from "vitest";
import {
  validateFileBasics,
  validateMagicBytes,
  sanitizeXmlString,
  MAX_FILE_SIZE_BYTES,
} from "../validation";

describe("File Validation & Security", () => {
  it("rejects empty files", () => {
    const res = validateFileBasics("document.docx", 0);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.code).toBe("EMPTY_FILE");
    }
  });

  it("rejects files exceeding MAX_FILE_SIZE_BYTES", () => {
    const res = validateFileBasics("huge.pdf", MAX_FILE_SIZE_BYTES + 1);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.code).toBe("FILE_TOO_LARGE");
    }
  });

  it("rejects unsupported extensions", () => {
    const res = validateFileBasics("script.exe", 100);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.code).toBe("UNSUPPORTED_FORMAT");
    }
  });

  it("accepts valid supported extensions", () => {
    const formats = ["docx", "xlsx", "pptx", "pdf", "jpg", "jpeg", "png"];
    for (const fmt of formats) {
      const res = validateFileBasics(`test.${fmt}`, 1000);
      expect(res.valid).toBe(true);
    }
  });

  it("validates magic bytes for JPEG", () => {
    const buf = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]).buffer;
    expect(validateMagicBytes(buf, "jpg")).toBe(true);
    expect(validateMagicBytes(buf, "pdf")).toBe(false);
  });

  it("validates magic bytes for PNG", () => {
    const buf = new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer;
    expect(validateMagicBytes(buf, "png")).toBe(true);
  });

  it("validates magic bytes for PDF", () => {
    const buf = new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer;
    expect(validateMagicBytes(buf, "pdf")).toBe(true);
  });

  it("validates magic bytes for OOXML (ZIP)", () => {
    const buf = new Uint8Array([0x50, 0x4b, 0x03, 0x04]).buffer;
    expect(validateMagicBytes(buf, "docx")).toBe(true);
    expect(validateMagicBytes(buf, "xlsx")).toBe(true);
    expect(validateMagicBytes(buf, "pptx")).toBe(true);
  });

  it("sanitizes inline DTD/XXE declarations from XML strings", () => {
    const maliciousXml = `<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><root>&xxe;</root>`;
    const sanitized = sanitizeXmlString(maliciousXml);
    expect(sanitized).not.toContain("<!DOCTYPE");
    expect(sanitized).toBe("<root>&xxe;</root>");
  });
});
