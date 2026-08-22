"use client";

import React from "react";
import { SanitizationReport, SanitizationResult } from "@/lib/types";
import { PrivacyScoreGauge } from "./PrivacyScore";
import { ReportDownloadModal } from "./ReportDownload";

interface ResultScreenProps {
  sanitizationResult: SanitizationResult;
  report: SanitizationReport;
  onReset: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  sanitizationResult,
  report,
  onReset,
}) => {
  const handleDownloadCleanFile = () => {
    const blob = new Blob([sanitizationResult.cleanedBuffer], {
      type: report.fileType,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = sanitizationResult.cleanedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const removedFindings = report.findings.filter((f) => f.removed);
  const remainingFindings = report.findings.filter((f) => !f.removed);

  return (
    <div className="result-screen-container">
      <div className="result-header">
        <div className="status-badge-complete">✓ SANITIZATION COMPLETE</div>
        <h1 className="result-title">Sanitization Complete</h1>
        <p className="result-filename">{report.fileName}</p>

        <div className="summary-counter-pills">
          <span className="pill pill-detected">
            {report.totalFindings} findings detected
          </span>
          <span className="pill pill-removed">
            {report.removedCount} removed
          </span>
          {report.remainingCount > 0 ? (
            <span className="pill pill-remaining">
              {report.remainingCount} could not be removed
            </span>
          ) : (
            <span className="pill pill-zero-remaining">
              0 remaining
            </span>
          )}
        </div>
      </div>

      <div className="scores-comparison-row">
        <PrivacyScoreGauge
          score={report.beforeScore}
          label="Score Before"
          riskLevel={report.beforeRiskLevel}
          size="md"
        />

        <div className="score-arrow-divider">
          <svg className="arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="delta-text">
            +{report.afterScore - report.beforeScore} pts
          </span>
        </div>

        <PrivacyScoreGauge
          score={report.afterScore}
          label="Score After"
          riskLevel={report.afterRiskLevel}
          size="md"
        />
      </div>

      <div className="primary-actions-bar">
        <button
          onClick={handleDownloadCleanFile}
          className="btn btn-primary btn-lg glow-button"
        >
          <span className="btn-icon">⬇</span>
          <span>Download Clean File</span>
        </button>

        <button onClick={onReset} className="btn btn-tertiary">
          <span>Scan Another File</span>
        </button>
      </div>

      <div className="findings-breakdown-grid">
        {/* Removed Section */}
        <div className="findings-column-card card-removed">
          <h3 className="column-title">
            <span className="title-icon icon-success">✓</span>
            <span>REMOVED ({removedFindings.length})</span>
          </h3>

          {removedFindings.length === 0 ? (
            <p className="empty-message">No metadata fields were removable.</p>
          ) : (
            <ul className="results-list">
              {removedFindings.map((f) => (
                <li key={f.id} className="result-list-item item-removed">
                  <span className="check-mark">✓</span>
                  <div className="item-details">
                    <span className="item-field">{f.field}</span>
                    <span className="item-category text-muted">({f.category})</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Remaining Section */}
        <div className="findings-column-card card-remaining">
          <h3 className="column-title">
            <span className="title-icon icon-warning">⚠</span>
            <span>REMAINING ({remainingFindings.length})</span>
          </h3>

          {remainingFindings.length === 0 ? (
            <div className="empty-message success-message">
              <span className="icon">🎉</span>
              <span>All detected removable metadata was successfully cleaned!</span>
            </div>
          ) : (
            <ul className="results-list">
              {remainingFindings.map((f) => (
                <li key={f.id} className="result-list-item item-remaining">
                  <span className="warn-mark">⚠</span>
                  <div className="item-details">
                    <span className="item-field">{f.field}</span>
                    <div className="reason-box">
                      <span className="reason-label">Reason:</span>{" "}
                      <span className="reason-text">
                        {f.limitation || "Current sanitizer engine does not support safe removal of this field."}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="report-download-section">
        <ReportDownloadModal report={report} />
      </div>
    </div>
  );
};
