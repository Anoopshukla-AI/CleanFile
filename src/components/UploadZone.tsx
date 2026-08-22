"use client";

import React, { useRef, useState } from "react";
import { validateFileBasics } from "@/lib/validation";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setErrorMessage(null);
    const validation = validateFileBasics(file.name, file.size, file.type);
    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleBoxClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="upload-zone-wrapper">
      <div
        className={`upload-card ${isDragging ? "dragging" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBoxClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Upload file for metadata scanning and sanitization"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".docx,.xlsx,.pptx,.pdf,.jpg,.jpeg,.png"
          className="hidden-file-input"
          disabled={disabled}
        />

        <div className="upload-icon-box">
          <svg
            className="upload-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <div className="upload-prompt">
          <h3 className="prompt-title">Drop your file here</h3>
          <p className="prompt-subtitle">
            or <span className="browse-link">browse files</span> from your device
          </p>
        </div>

        <div className="supported-formats-pills">
          <span className="format-chip">DOCX</span>
          <span className="format-chip">XLSX</span>
          <span className="format-chip">PPTX</span>
          <span className="format-chip">PDF</span>
          <span className="format-chip">JPG</span>
          <span className="format-chip">PNG</span>
        </div>

        <div className="privacy-guarantee">
          <span className="shield-icon">🔒</span>
          <span>100% In-Browser Sanitization • Files Never Leave Your Device</span>
        </div>
      </div>

      {errorMessage && (
        <div className="upload-error-box alert-warning" role="alert">
          <span className="error-icon">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
