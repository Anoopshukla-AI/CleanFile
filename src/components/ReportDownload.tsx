"use client";

import React, { useState } from "react";
import { SanitizationReport } from "@/lib/types";
import { generateTextReport } from "@/lib/engine/report";

interface ReportDownloadProps {
  report: SanitizationReport;
}

export const ReportDownloadModal: React.FC<ReportDownloadProps> = ({ report }) => {
  const [includeValues, setIncludeValues] = useState(false);

  const handleDownloadReport = () => {
    const textContent = generateTextReport(report, includeValues);
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.fileName.replace(/\.[^/.]+$/, "")}-sanitization-report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="report-download-box">
      <h3 className="box-title">Sanitization Report</h3>
      <p className="box-description">
        Download a verifiable text summary of the scan results, removed metadata fields, and remaining unremoved items.
      </p>

      <div className="report-option-toggle">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={includeValues}
            onChange={(e) => setIncludeValues(e.target.checked)}
            className="toggle-checkbox"
          />
          <span>Include detected metadata values in report file</span>
        </label>
        <span className="toggle-hint text-muted">
          (Default off to protect privacy in exported text files)
        </span>
      </div>

      <button
        onClick={handleDownloadReport}
        className="btn btn-secondary btn-download-report"
      >
        <span className="icon">📄</span>
        <span>Download Sanitization Report (.txt)</span>
      </button>
    </div>
  );
};
