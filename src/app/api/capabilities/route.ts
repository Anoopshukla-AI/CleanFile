import { NextResponse } from "next/server";
import { CAPABILITY_MATRIX } from "@/lib/engine/capabilities";

export async function GET() {
  return NextResponse.json({
    success: true,
    capabilities: CAPABILITY_MATRIX,
    supportedFormats: ["DOCX", "XLSX", "PPTX", "PDF", "JPG", "JPEG", "PNG"],
    processingModel: "100% Client-Side In-Browser Processing",
    privacyNotice: "Files are parsed and sanitized entirely in memory inside your web browser. No file contents or metadata values are transmitted to or stored on any server.",
  });
}
