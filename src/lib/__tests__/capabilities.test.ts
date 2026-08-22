import { describe, expect, it } from "vitest";
import { getCapability, CAPABILITY_MATRIX } from "../engine/capabilities";

describe("Capability Matrix", () => {
  it("provides capabilities for all 7 supported formats", () => {
    const formats = ["DOCX", "XLSX", "PPTX", "PDF", "JPG", "JPEG", "PNG"];
    for (const fmt of formats) {
      const cap = getCapability(fmt);
      expect(cap.scan).toBe(true);
      expect(cap.clean).toBe(true);
      expect(cap.verify).toBe(true);
      expect(cap.supportedFields.length).toBeGreaterThan(0);
      expect(cap.limitations.length).toBeGreaterThan(0);
    }
  });

  it("handles unsupported formats gracefully", () => {
    const cap = getCapability("EXE");
    expect(cap.scan).toBe(false);
    expect(cap.clean).toBe(false);
    expect(cap.limitations[0]).toContain("not currently supported");
  });
});
