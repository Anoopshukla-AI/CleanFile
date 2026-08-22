export const ALLOWED_EXTENSIONS = [
  "docx",
  "xlsx",
  "pptx",
  "pdf",
  "jpg",
  "jpeg",
  "png",
] as const;

export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  jpg: ["image/jpeg", "image/jpg"],
  jpeg: ["image/jpeg", "image/jpg"],
  png: ["image/png"],
  pdf: ["application/pdf"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-zip-compressed",
  ],
  xlsx: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/x-zip-compressed",
  ],
  pptx: [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
  ],
};

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export type FileValidationError = {
  valid: false;
  code:
    | "UNSUPPORTED_FORMAT"
    | "FILE_TOO_LARGE"
    | "CORRUPT_FILE"
    | "INVALID_MAGIC_BYTES"
    | "EMPTY_FILE";
  message: string;
};

export type FileValidationSuccess = {
  valid: true;
  extension: string;
  format: string;
};

export type FileValidationResult = FileValidationError | FileValidationSuccess;

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].toLowerCase();
}

export function validateFileBasics(
  fileName: string,
  fileSize: number,
  mimeType?: string
): FileValidationResult {
  if (fileSize <= 0) {
    return {
      valid: false,
      code: "EMPTY_FILE",
      message: "The selected file is empty (0 bytes).",
    };
  }

  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      code: "FILE_TOO_LARGE",
      message: `File size (${(fileSize / (1024 * 1024)).toFixed(
        1
      )} MB) exceeds the maximum processing limit of 50 MB.`,
    };
  }

  const ext = getFileExtension(fileName);
  if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
    return {
      valid: false,
      code: "UNSUPPORTED_FORMAT",
      message: `The file extension .${ext || "unknown"} is not supported. Supported formats: DOCX, XLSX, PPTX, PDF, JPG, JPEG, PNG.`,
    };
  }

  return {
    valid: true,
    extension: ext,
    format: ext.toUpperCase(),
  };
}

export function validateMagicBytes(
  buffer: ArrayBuffer,
  extension: string
): boolean {
  if (buffer.byteLength < 4) return false;
  const view = new DataView(buffer);
  const bytes = [
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  ];

  switch (extension) {
    case "jpg":
    case "jpeg":
      // JPEG magic: 0xFF 0xD8 0xFF
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

    case "png":
      // PNG magic: 0x89 0x50 0x4E 0x47 (\x89PNG)
      return (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
      );

    case "pdf":
      // PDF magic: 0x25 0x50 0x44 0x46 (%PDF)
      return (
        bytes[0] === 0x25 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x44 &&
        bytes[3] === 0x46
      );

    case "docx":
    case "xlsx":
    case "pptx":
      // ZIP magic for OOXML: 0x50 0x4B 0x03 0x04 (PK\x03\x04)
      return (
        bytes[0] === 0x50 &&
        bytes[1] === 0x4b &&
        bytes[2] === 0x03 &&
        bytes[3] === 0x04
      );

    default:
      return false;
  }
}

/**
  * Sanitizes XML content string by removing inline DTD declarations and entity expansions
  * to mitigate XXE (XML External Entity) attacks before passing to DOMParser.
  */
export function sanitizeXmlString(xmlContent: string): string {
  // Strip DOCTYPE declarations containing internal/external DTD definitions safely
  return xmlContent.replace(/<!DOCTYPE[\s\S]*?(?:\[[\s\S]*?\]\s*)?>/gi, "");
}
