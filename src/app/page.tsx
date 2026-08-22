"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UploadZone } from "@/components/UploadZone";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { ResultScreen } from "@/components/ResultScreen";
import { FormatBadge } from "@/components/FormatBadge";
import { globalEngine } from "@/lib/engine";
import { CAPABILITY_MATRIX } from "@/lib/engine/capabilities";
import { ProcessingState, SanitizationReport, SanitizationResult } from "@/lib/types";

export default function HomePage() {
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [sanitizationResult, setSanitizationResult] = useState<SanitizationResult | null>(null);
  const [report, setReport] = useState<SanitizationReport | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setProcessingState("validating");

    try {
      const pipelineOutput = await globalEngine.runPipeline(file, (stepState, _percent) => {
        setProcessingState(stepState.toLowerCase() as ProcessingState);
      });

      setSanitizationResult(pipelineOutput.result);
      setReport(pipelineOutput.report);
      setProcessingState("complete");
    } catch (err: any) {
      console.error("Pipeline failure:", err);
      setErrorMessage(err.message || "An unexpected error occurred during sanitization.");
      setProcessingState("failed");
    }
  };

  const handleReset = () => {
    setProcessingState("idle");
    setSelectedFile(null);
    setSanitizationResult(null);
    setReport(null);
    setErrorMessage(null);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="brand-logo" onClick={handleReset} style={{ cursor: "pointer" }}>
          <div className="brand-icon">C</div>
          <span>CleanFile</span>
        </div>

        <div className="nav-links">
          <a href="#how-it-works" className="nav-link">
            How It Works
          </a>
          <a href="#why-it-matters" className="nav-link">
            Why This Matters
          </a>
          <a href="#capabilities" className="nav-link">
            Capabilities
          </a>
          <Link href="/privacy" className="nav-link">
            Privacy & Limitations
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <main>
        {/* State Machine Views */}
        {processingState === "idle" && (
          <section className="hero-section">
            <h1 className="hero-title">
              Clean your files. <br /> Verify what was removed.
            </h1>
            <p className="hero-subtitle">
              Scan and remove supported embedded metadata before sharing documents and images.
            </p>

            <div className="trust-indicators-row" style={{ marginBottom: "36px" }}>
              <span className="trust-tag">🛡️ Privacy-first</span>
              <span className="trust-tag">🔍 No AI analysis</span>
              <span className="trust-tag">🔒 Zero permanent file storage</span>
              <span className="trust-tag">📊 Transparent verification</span>
            </div>

            <UploadZone onFileSelect={handleFileSelect} />
          </section>
        )}

        {processingState !== "idle" && processingState !== "complete" && selectedFile && (
          <ProcessingStatus
            state={processingState}
            fileName={selectedFile.name}
            error={errorMessage}
          />
        )}

        {processingState === "failed" && (
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <button onClick={handleReset} className="btn btn-secondary">
              Try Another File
            </button>
          </div>
        )}

        {processingState === "complete" && sanitizationResult && report && (
          <ResultScreen
            sanitizationResult={sanitizationResult}
            report={report}
            onReset={handleReset}
          />
        )}

        {/* Informational Sections */}
        {processingState === "idle" && (
          <>
            {/* How It Works */}
            <section id="how-it-works" className="info-card" style={{ marginBottom: "60px" }}>
              <h2 className="hero-title" style={{ fontSize: "32px", marginBottom: "16px" }}>
                Scan → Sanitize → Verify
              </h2>
              <p className="hero-subtitle" style={{ fontSize: "16px", marginBottom: "32px" }}>
                Never trust a simple &quot;Done!&quot; message. CleanFile proves what was removed and reports what remains.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "20px",
                }}
              >
                <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                  <div style={{ color: "var(--accent-cyan)", fontWeight: "800", fontSize: "20px", marginBottom: "8px" }}>
                    01. Scan
                  </div>
                  <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Deep Header Scan</h3>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    Inspects OOXML package XMLs, EXIF/PNG chunks, and PDF Info dictionaries.
                  </p>
                </div>

                <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                  <div style={{ color: "var(--accent-cyan)", fontWeight: "800", fontSize: "20px", marginBottom: "8px" }}>
                    02. Sanitize
                  </div>
                  <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Safe Byte Stripping</h3>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    Removes identifying metadata without touching document text, formulas, or image pixels.
                  </p>
                </div>

                <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                  <div style={{ color: "var(--accent-cyan)", fontWeight: "800", fontSize: "20px", marginBottom: "8px" }}>
                    03. Verify
                  </div>
                  <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Post-Clean Re-Scan</h3>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    Re-opens the generated file to independently confirm metadata removal.
                  </p>
                </div>

                <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                  <div style={{ color: "var(--accent-cyan)", fontWeight: "800", fontSize: "20px", marginBottom: "8px" }}>
                    04. Report
                  </div>
                  <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Transparent Audit</h3>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    Produces a downloadable report detailing removed fields, remaining items, and exact reasons.
                  </p>
                </div>
              </div>
            </section>

            {/* Why This Matters */}
            <section id="why-it-matters" style={{ marginBottom: "60px" }}>
              <h2 className="hero-title" style={{ fontSize: "32px", textAlign: "center", marginBottom: "32px" }}>
                Why CleanFile Matters
              </h2>

              <div className="info-section-grid" style={{ margin: "0" }}>
                <div className="info-card">
                  <h3 className="info-card-title">📄 Job Applications</h3>
                  <p className="info-card-body">
                    Remove internal author names, draft revision counts, and company templates before submitting resumes or work samples.
                  </p>
                </div>

                <div className="info-card">
                  <h3 className="info-card-title">💼 Client Proposals</h3>
                  <p className="info-card-body">
                    Strip internal software tags, total editing time, and past manager metadata before emailing quotes or PDFs to external clients.
                  </p>
                </div>

                <div className="info-card">
                  <h3 className="info-card-title">📰 Public Documents</h3>
                  <p className="info-card-body">
                    Reduce unnecessary identifying metadata before publishing reports, whitepapers, or leaks to public repositories.
                  </p>
                </div>

                <div className="info-card">
                  <h3 className="info-card-title">📷 Photos & Imagery</h3>
                  <p className="info-card-body">
                    Strip exact GPS latitude/longitude coordinates, camera serial numbers, and creation timestamps from photos prior to uploading online.
                  </p>
                </div>
              </div>
            </section>

            {/* Capability Matrix */}
            <section id="capabilities" style={{ marginBottom: "60px" }}>
              <h2 className="hero-title" style={{ fontSize: "32px", textAlign: "center", marginBottom: "12px" }}>
                Supported Capability Matrix
              </h2>
              <p className="hero-subtitle" style={{ fontSize: "16px", textAlign: "center", marginBottom: "40px" }}>
                CleanFile never pretends every format supports every field. Here is our exact capability spec.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "24px",
                }}
              >
                {Object.values(CAPABILITY_MATRIX).map((cap, idx) => (
                  <FormatBadge key={idx} capability={cap} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <a href="#how-it-works" className="nav-link">
            How It Works
          </a>
          <a href="#capabilities" className="nav-link">
            Format Matrix
          </a>
          <Link href="/privacy" className="nav-link">
            Privacy Model
          </Link>
        </div>
        <p>© CleanFile Privacy Platform. 100% Client-Side Metadata Sanitization.</p>
        <p style={{ fontSize: "12px", marginTop: "8px", color: "var(--text-muted)" }}>
          CleanFile is an informational privacy tool. Metadata removal does not guarantee legal anonymity or complete forensic sanitization.
        </p>
      </footer>
    </div>
  );
}
