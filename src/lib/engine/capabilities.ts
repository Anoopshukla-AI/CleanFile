import { FormatCapability } from "../types";

export const CAPABILITY_MATRIX: Record<string, FormatCapability> = {
  JPG: {
    format: "JPG / JPEG",
    scan: true,
    clean: true,
    verify: true,
    supportedFields: [
      "GPS Coordinates",
      "Camera Make",
      "Camera Model",
      "Software / Firmware",
      "Creation Date / Timestamp",
      "Author / Artist",
      "Copyright",
      "Image Description",
      "Keywords / Tags",
      "Orientation & Technical EXIF",
    ],
    limitations: [
      "Does not modify image pixels unless required for specific operations.",
      "Embedded IPTC/XMP segments stored in separate APP blocks may require dedicated structural stripping.",
      "Does not guarantee removal of physical objects or forensic visual elements within the image.",
    ],
  },
  JPEG: {
    format: "JPG / JPEG",
    scan: true,
    clean: true,
    verify: true,
    supportedFields: [
      "GPS Coordinates",
      "Camera Make",
      "Camera Model",
      "Software / Firmware",
      "Creation Date / Timestamp",
      "Author / Artist",
      "Copyright",
      "Image Description",
      "Keywords / Tags",
      "Orientation & Technical EXIF",
    ],
    limitations: [
      "Does not modify image pixels unless required for specific operations.",
      "Embedded IPTC/XMP segments stored in separate APP blocks may require dedicated structural stripping.",
      "Does not guarantee removal of physical objects or forensic visual elements within the image.",
    ],
  },
  PNG: {
    format: "PNG",
    scan: true,
    clean: true,
    verify: true,
    supportedFields: [
      "Software / Tool",
      "Author / Creator",
      "Description / Title",
      "Copyright",
      "Creation Time",
      "Custom tEXt / iTXt / zTXt Key-Value Chunks",
      "Embedded eXIf Chunk",
    ],
    limitations: [
      "Only removes metadata chunks (tEXt, iTXt, zTXt, eXIf). Critical image chunks (IHDR, PLTE, IDAT, IEND) are preserved.",
      "Does not re-encode pixel data; preserves 100% original visual fidelity.",
      "Does not inspect custom non-standard ancillary chunks.",
    ],
  },
  DOCX: {
    format: "DOCX (Word Document)",
    scan: true,
    clean: true,
    verify: true,
    supportedFields: [
      "Core Properties (Author, Title, Subject, Keywords, Description, Last Modified By, Revision Number, Created Date, Modified Date)",
      "Extended Properties (Application, Version, Company, Manager, Total Edit Time)",
      "Custom Properties",
      "Document Comments / Notes",
    ],
    limitations: [
      "Tracked changes (revision markup) inside document body XML are reported but not auto-accepted/rejected in V1 to prevent structural alteration.",
      "Embedded OLE objects, macros, and external hyperlinked metadata are not inspected in V1.",
      "Document content text, formatting, styles, and layout remain completely preserved.",
    ],
  },
  XLSX: {
    format: "XLSX (Excel Workbook)",
    scan: true,
    clean: true,
    verify: true,
    supportedFields: [
      "Core Properties (Author, Title, Subject, Keywords, Last Modified By, Created Date, Modified Date)",
      "Extended Properties (Application, Version, Company, Manager)",
      "Custom Properties",
      "Cell Comments & Threaded Notes",
    ],
    limitations: [
      "Spreadsheet cell values, formulas, formatting, charts, macro sheets, and pivot tables are strictly preserved and unaltered.",
      "VBA macro signatures are not removed in V1.",
      "External data connections and OLE links are not inspected.",
    ],
  },
  PPTX: {
    format: "PPTX (PowerPoint Presentation)",
    scan: true,
    clean: true,
    verify: true,
    supportedFields: [
      "Core Properties (Author, Title, Subject, Keywords, Last Modified By, Created Date, Modified Date)",
      "Extended Properties (Application, Version, Company)",
      "Custom Properties",
      "Slide Comments & Modern Annotations",
    ],
    limitations: [
      "Slides, graphics, animations, slide notes (speaker notes), layouts, and master themes are preserved.",
      "Embedded media metadata (e.g. video EXIF inside PPTX package) is not altered.",
    ],
  },
  PDF: {
    format: "PDF (Portable Document Format)",
    scan: true,
    clean: true,
    verify: true,
    supportedFields: [
      "Document Information Dictionary (Author, Title, Subject, Creator, Producer, Keywords, CreationDate, ModDate)",
      "Catalog XMP Metadata Stream",
    ],
    limitations: [
      "Current PDF processing engine does not remove PDF annotations or form fields.",
      "Does not strip embedded files or attachments.",
      "Does not remove embedded JavaScript or action scripts.",
      "Does not flatten incremental-save history or unreferenced PDF objects.",
      "XMP removal may break PDF/A compliance certificates embedded in document headers.",
    ],
  },
};

export function getCapability(format: string): FormatCapability {
  const upper = format.toUpperCase();
  if (CAPABILITY_MATRIX[upper]) {
    return CAPABILITY_MATRIX[upper];
  }
  return {
    format: upper,
    scan: false,
    clean: false,
    verify: false,
    supportedFields: [],
    limitations: [
      "This file format is not currently supported by CleanFile.",
    ],
  };
}
