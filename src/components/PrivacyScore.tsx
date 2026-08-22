"use client";

import React from "react";
import { RiskLevel } from "@/lib/types";

interface PrivacyScoreProps {
  score: number;
  label: string;
  riskLevel?: RiskLevel;
  size?: "sm" | "md" | "lg";
}

export const PrivacyScoreGauge: React.FC<PrivacyScoreProps> = ({
  score,
  label,
  riskLevel,
  size = "md",
}) => {
  const getScoreColor = (val: number) => {
    if (val >= 85) return "#00e6a8"; // Cyan Emerald
    if (val >= 60) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  const color = getScoreColor(score);
  const strokeDashoffset = 283 - (283 * score) / 100;

  return (
    <div className={`score-container size-${size}`}>
      <div className="score-ring-wrapper">
        <svg className="score-ring-svg" viewBox="0 0 100 100">
          <circle
            className="score-ring-bg"
            cx="50"
            cy="50"
            r="45"
            strokeWidth="8"
          />
          <circle
            className="score-ring-fill"
            cx="50"
            cy="50"
            r="45"
            strokeWidth="8"
            stroke={color}
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="score-center-text">
          <span className="score-number" style={{ color }}>
            {score}
          </span>
          <span className="score-max">/100</span>
        </div>
      </div>
      <div className="score-label-box">
        <span className="score-label">{label}</span>
        {riskLevel && (
          <span className={`risk-badge risk-${riskLevel.toLowerCase()}`}>
            {riskLevel} RISK
          </span>
        )}
      </div>
    </div>
  );
};
