"use client";

import React from "react";
import { ProcessingState } from "@/lib/types";

interface ProcessingStatusProps {
  state: ProcessingState;
  fileName: string;
  error?: string | null;
}

const STEPS = [
  { id: "validating", label: "File Validation" },
  { id: "scanning", label: "Metadata Scanning" },
  { id: "analyzing", label: "Risk Analysis" },
  { id: "sanitizing", label: "Metadata Removal" },
  { id: "verifying", label: "Result Verification" },
];

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  state,
  fileName,
  error,
}) => {
  const getStepIndex = (st: ProcessingState) => {
    switch (st) {
      case "validating":
        return 0;
      case "scanning":
        return 1;
      case "analyzing":
        return 2;
      case "sanitizing":
        return 3;
      case "verifying":
        return 4;
      case "complete":
        return 5;
      case "failed":
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(state);

  return (
    <div className="processing-card">
      <div className="processing-header">
        <h3 className="processing-title">Processing File</h3>
        <p className="processing-filename">{fileName}</p>
      </div>

      {state === "failed" ? (
        <div className="processing-error-state">
          <div className="error-badge">Processing Failed</div>
          <p className="error-detail">{error || "An unexpected processing error occurred."}</p>
        </div>
      ) : (
        <div className="steps-wrapper">
          {STEPS.map((step, idx) => {
            const isDone = currentIndex > idx;
            const isCurrent = currentIndex === idx;

            return (
              <div
                key={step.id}
                className={`step-item ${isDone ? "step-done" : ""} ${
                  isCurrent ? "step-active" : ""
                }`}
              >
                <div className="step-indicator">
                  {isDone ? (
                    <span className="step-check">✓</span>
                  ) : isCurrent ? (
                    <span className="step-spinner"></span>
                  ) : (
                    <span className="step-dot"></span>
                  )}
                </div>
                <div className="step-label-box">
                  <span className="step-label">{step.label}</span>
                  <span className="step-status">
                    {isDone ? "Completed" : isCurrent ? "In progress..." : "Pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
