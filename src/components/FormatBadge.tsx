"use client";

import React from "react";
import { FormatCapability } from "@/lib/types";

interface FormatBadgeProps {
  capability: FormatCapability;
}

export const FormatBadge: React.FC<FormatBadgeProps> = ({ capability }) => {
  return (
    <div className="format-badge-card">
      <div className="format-badge-header">
        <span className="format-name">{capability.format}</span>
        <div className="format-capabilities-pills">
          {capability.scan && <span className="pill pill-green">Scan</span>}
          {capability.clean && <span className="pill pill-blue">Clean</span>}
          {capability.verify && <span className="pill pill-purple">Verify</span>}
        </div>
      </div>

      <div className="format-section">
        <h4 className="section-title">Supported Fields</h4>
        <ul className="field-list">
          {capability.supportedFields.slice(0, 4).map((f, i) => (
            <li key={i} className="field-item">
              <span className="bullet">✓</span> {f}
            </li>
          ))}
          {capability.supportedFields.length > 4 && (
            <li className="field-item text-muted">
              + {capability.supportedFields.length - 4} more fields
            </li>
          )}
        </ul>
      </div>

      <div className="format-section">
        <h4 className="section-title text-warning">Engine Limitations</h4>
        <ul className="limitation-list">
          {capability.limitations.map((lim, i) => (
            <li key={i} className="limitation-item">
              <span className="bullet">⚠</span> {lim}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
