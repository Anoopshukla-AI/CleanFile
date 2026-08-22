import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CleanFile — Clean your files. Verify what was removed.",
  description:
    "Scan and remove embedded metadata from DOCX, XLSX, PPTX, PDF, JPG, and PNG files before sharing. 100% in-browser privacy & verification platform.",
  keywords: [
    "metadata remover",
    "exif cleaner",
    "docx metadata",
    "pdf metadata",
    "privacy verification",
    "clean files",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
