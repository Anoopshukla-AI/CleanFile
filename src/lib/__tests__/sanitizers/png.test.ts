import { describe, expect, it } from "vitest";
import { PngSanitizer } from "../../sanitizers/png";

function createMockPngWithMetadata(): ArrayBuffer {
  // 8-byte PNG signature
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  // Helper to build chunk: 4 bytes length, 4 bytes type, data, 4 bytes CRC
  const makeChunk = (type: string, data: number[]): number[] => {
    const len = data.length;
    const lenBytes = [(len >> 24) & 0xff, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff];
    const typeBytes = [type.charCodeAt(0), type.charCodeAt(1), type.charCodeAt(2), type.charCodeAt(3)];
    const crc = [0x00, 0x00, 0x00, 0x00]; // mock CRC
    return [...lenBytes, ...typeBytes, ...data, ...crc];
  };

  // IHDR chunk (13 bytes data)
  const ihdr = makeChunk("IHDR", [0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]);

  // tEXt metadata chunk: Author\0Jane Doe
  const textAuthorKey = "Author".split("").map((c) => c.charCodeAt(0));
  const textAuthorVal = "Jane Doe".split("").map((c) => c.charCodeAt(0));
  const textData = [...textAuthorKey, 0, ...textAuthorVal];
  const tEXtChunk = makeChunk("tEXt", textData);

  // IEND chunk (0 bytes data)
  const iend = makeChunk("IEND", []);

  const total = [...sig, ...ihdr, ...tEXtChunk, ...iend];
  const u8 = new Uint8Array(total);
  return u8.buffer;
}

describe("PNG Sanitizer Integration", () => {
  const sanitizer = new PngSanitizer();

  it("handles .png files", () => {
    expect(sanitizer.canHandle("photo.png", "image/png")).toBe(true);
    expect(sanitizer.canHandle("doc.docx", "application/zip")).toBe(false);
  });

  it("scans and detects tEXt metadata chunks in PNG", async () => {
    const pngBuf = createMockPngWithMetadata();
    const findings = await sanitizer.scan(pngBuf);

    expect(findings.length).toBeGreaterThan(0);
    const authorFinding = findings.find((f) => f.field === "Author");
    expect(authorFinding).toBeDefined();
    expect(authorFinding?.value).toBe("Jane Doe");
  });

  it("sanitizes PNG by removing tEXt chunk while preserving critical chunks", async () => {
    const pngBuf = createMockPngWithMetadata();
    const result = await sanitizer.sanitize(pngBuf, "sample.png");

    expect(result.cleanedFileName).toBe("sample-clean.png");
    expect(result.removedCount).toBe(1);

    // Re-scan cleaned buffer
    const postFindings = await sanitizer.scan(result.cleanedBuffer);
    expect(postFindings.length).toBe(0);
  });
});
