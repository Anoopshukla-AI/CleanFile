"use client";

import React from "react";
import { MetadataFinding } from "@/lib/types";

interface ScanReportProps {
  findings: MetadataFinding[];
  fileName: string;
  beforeScore: number;
}

export const ScanReport: React.FC<ScanReportProps> = ({
  findings,
  fileName,
  beforeScore,
}) => {
  const highSeverityCount = findings.filter((f) => f.severity === "high").length;
  const mediumSeverityCount = findings.filter((f) => f.severity === "medium").length;
  const lowSeverityCount = findings.filter((f) => f.severity === "low").length;
  const infoSeverityCount = findings.filter((f) => f.severity === "info").length;

  // Group findings by category
  const categoriesMap: Record<string, MetadataFinding[]> = {};
  for (const f of findings) {
    if (!categoriesMap[f.category]) {
      categoriesMap[f.category] = [];
    }
    categoriesMap[f.category].push(f);
  }

  const categoryLabels: Record<string, string> = {
    identity: "Personal & Identity Information",
    document: "Document Information",
    application: "Application & Software Information",
    location: "GPS & Location Data",
    device: "Device & Hardware Details",
    timestamps: "Timestamps & Creation History",
    comments: "Comments & Embedded Notes",
    technical: "Technical Metadata",
    other: "Other Metadata",
  };

  return (
    <div className="scan-report-container">
      <div className="report-summary-header">
        <div className="summary-title-box">
          <span className="badge-tag">SCAN COMPLETE</span>
          <h2 className="report-filename">{fileName}</h2>
          <p className="summary-subtitle">
            {findings.length} metadata finding(s) detected in file structure
          </p>
        </div>

        <div className="severity-counts-bar">
          <div className="severity-count-item count-high">
            <span className="count-num">{highSeverityCount}</span>
            <span className="count-label">HIGH</span>
          </div>
          <div className="severity-count-item count-medium">
            <span className="count-num">{mediumSeverityCount}</span>
            <span className="count-label">MEDIUM</span>
          </div>
          <div className="severity-count-item count-low">
            <span className="count-num">{lowSeverityCount}</span>
            <span className="count-label">LOW</span>
          </div>
          {infoSeverityCount > 0 && (
            <div className="severity-count-item count-info">
              <span className="count-num">{infoSeverityCount}</span>
              <span className="count-label">INFO</span>
            </div>
          )}
        </div>
      </div>

      <div className="findings-categories-list">
        {Object.entries(categoriesMap).map(([catKey, catFindings]) => (
          <div key={catKey} className="category-group-card">
            <h3 className="category-group-title">
              {categoryLabels[catKey] || catKey.toUpperCase()}
              <span className="category-count">({catFindings.length})</span>
            </h3>

            <div className="findings-grid">
              {catFindings.map((finding) => (
                <div key={finding.id} className="finding-row-item">
                  <div className="finding-main-info">
                    <span className={`severity-tag tag-${finding.severity}`}>
                      {finding.severity.toUpperCase()}
                    </span>
                    <span className="finding-field-name">{finding.field}</span>
                  </div>
                  <div className="finding-value-box">
                    <span className="finding-value-text">{finding.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
