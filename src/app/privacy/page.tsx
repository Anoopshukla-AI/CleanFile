import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Model & Limitations — CleanFile",
  description:
    "Learn what CleanFile inspects, what it removes, and what it does not guarantee. Technical transparency by design.",
};

export default function PrivacyPage() {
  return (
    <main className="app-container" style={{ paddingTop: "40px", paddingBottom: "80px" }}>
      <nav className="navbar">
        <Link href="/" className="brand-logo">
          <div className="brand-icon">C</div>
          <span>CleanFile</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">
            Home & Scanner
          </Link>
          <Link href="/privacy" className="nav-link active" style={{ color: "var(--accent-cyan)" }}>
            Privacy Model
          </Link>
        </div>
      </nav>

      <article className="privacy-article" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <header style={{ marginBottom: "40px" }}>
          <h1 className="hero-title" style={{ fontSize: "40px", textAlign: "left" }}>
            Privacy Model & Technical Limitations
          </h1>
          <p className="hero-subtitle" style={{ textAlign: "left", margin: "0" }}>
            CleanFile is built on absolute technical honesty. We transparently show what was detected, what was removed, and what remains.
          </p>
        </header>

        <section className="info-card" style={{ marginBottom: "32px" }}>
          <h2 className="info-card-title">What CleanFile Does</h2>
          <div className="info-card-body">
            <p>
              CleanFile operates entirely within your web browser (client-side processing). It scans supported document structures (DOCX, XLSX, PPTX, PDF) and image files (JPG, PNG) for embedded metadata headers.
            </p>
            <ul style={{ marginTop: "16px", paddingLeft: "20px", lineHeight: "1.8" }}>
              <li>Extracts embedded author, company, date, software, and device details.</li>
              <li>Strips metadata headers directly at the byte level without altering document body text, formulas, slides, or image pixels.</li>
              <li>Re-scans the resulting sanitized file to produce a verified before/after report.</li>
            </ul>
          </div>
        </section>

        <section className="info-card" style={{ marginBottom: "32px" }}>
          <h2 className="info-card-title text-warning">What CleanFile Does NOT Guarantee</h2>
          <div className="info-card-body">
            <p style={{ marginBottom: "16px" }}>
               CleanFile is <strong>NOT</strong> an AI-detection bypass tool, an anonymization proxy, or a forensic wiping standard.
            </p>

            <ul style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
              <li>
                <strong>Not AI-Undetectable:</strong> Metadata removal does not make document text "human-written" or "AI undetectable".
              </li>
              <li>
                <strong>Not Complete Forensic Wiping:</strong> CleanFile does not guarantee that external forensic tools or government agencies cannot link a file to an author via stylistic analysis or uninspected internal binary streams.
              </li>
              <li>
                <strong>Not Uninspected Structure Removal:</strong> In PDF files, V1 does not remove annotations, embedded attachments, JavaScript, or incremental save history. In Word documents, tracked changes inside the body XML are reported but not modified.
              </li>
              <li>
                <strong>Not Anonymity:</strong> Metadata removal reduces unnecessary operational leakage; it does not promise cryptographic anonymity.
              </li>
            </ul>
          </div>
        </section>

        <section className="info-card">
          <h2 className="info-card-title">Data Storage & Zero Transmission</h2>
          <div className="info-card-body">
            <p>
              Because CleanFile uses modern WebAssembly and pure JavaScript binary parsers directly inside your web browser memory:
            </p>
            <ul style={{ marginTop: "16px", paddingLeft: "20px", lineHeight: "1.8" }}>
              <li><strong>Your files are never uploaded to any remote server.</strong></li>
              <li><strong>No document contents or metadata values are ever logged or stored.</strong></li>
              <li><strong>No user accounts or databases exist.</strong></li>
            </ul>
          </div>
        </section>

        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <Link href="/" className="btn btn-primary btn-lg">
            Return to CleanFile Scanner
          </Link>
        </div>
      </article>
    </main>
  );
}
