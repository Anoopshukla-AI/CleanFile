<div align="center">
  <h1>🛡️ CleanFile</h1>
  <p><strong>Privacy File Sanitization & Verification Platform</strong></p>
  <p><em>Clean your files. Verify what was removed. Share with confidence.</em></p>

  <p>
    <a href="https://github.com/Anoopshukla-AI/CleanFile/actions"><img alt="Build Status" src="https://img.shields.io/badge/build-passing-success"></a>
    <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-15.0-black?logo=next.js"></a>
    <a href="https://reactjs.org/"><img alt="React" src="https://img.shields.io/badge/React-19.0-blue?logo=react"></a>
    <a href="https://tailwindcss.com/"><img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css"></a>
    <a href="https://workers.cloudflare.com/"><img alt="Cloudflare Workers" src="https://img.shields.io/badge/Deployed_on-Cloudflare-F38020?logo=cloudflare"></a>
  </p>
</div>

---

## 🌟 Overview

**CleanFile** is an enterprise-grade file privacy platform that scans supported file formats for embedded metadata and hidden structural privacy-relevant information, safely removes these artifacts, and produces a transparent, cryptographically verifiable sanitization report.

> **Note:** CleanFile is built for data privacy, compliance, and opsec. It is **NOT** an AI-detection bypass tool. CleanFile does not make documents "human-written" or "undetectable." It guarantees only that extraneous and potentially identifying technical metadata is scrubbed.

## ✨ Features

- **Client-Side First:** Your files never leave your device. All processing occurs securely within your browser to guarantee zero data leakage.
- **Deep Scanning Engine:** Thoroughly inspects files down to the byte level to locate EXIF, XMP, ICC profiles, application markers, and custom metadata streams.
- **Transparent Reporting:** Generates an easy-to-read, comprehensive risk and sanitization report comparing the file's privacy state before and after cleaning.
- **Edge-Ready:** Built to deploy effortlessly on Cloudflare Workers for ultra-fast, globally distributed serving of the application frontend.

### 📄 Supported Formats

CleanFile provides deep integration and bespoke scrubbing logic for the most common privacy-leaking file formats:

| Format | Extension | Capabilities |
| :--- | :--- | :--- |
| **JPEG** | `.jpg`, `.jpeg` | Strips EXIF headers, ICC color profiles, Adobe APP13 data, XML/XMP packets, and custom comments while preserving the visual image payload. |
| **PNG** | `.png` | Removes `tEXt`, `zTXt`, `iTXt` metadata chunks, XMP payloads, time chunks, and non-essential proprietary blocks. |
| **PDF** | `.pdf` | Clears the Document Info dictionary (Author, Creator, Producer, CreationDate, ModDate), zeroizes metadata dates, purges XMP streams, and flattens interactive properties. |
| **Office** | `.docx`, `.xlsx` | Purges `core.xml` and `app.xml` properties, clears creator/lastModifiedBy tokens, removes tracked revision logs, and resets internal timestamps. |

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ (20.x recommended)
- npm or pnpm

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anoopshukla-AI/CleanFile.git
   cd CleanFile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open the App**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

CleanFile is built on modern web primitives and a modular sanitization core:

- **Framework:** Next.js App Router (React Server Components + Client Components)
- **Styling:** Tailwind CSS + Lucide React icons for a beautiful, responsive interface.
- **Core Engine (`src/lib/engine`)**: An orchestration pipeline that validates files, selects the appropriate sanitizer, computes privacy risk scores, and generates detailed reports.
- **Format Sanitizers (`src/lib/sanitizers`)**: Specialized, highly-tested modules utilizing low-level parsers (`pdf-lib`, `piexifjs`, `jszip`) to manipulate file structures directly.

## 🚢 Deployment

CleanFile is architected to deploy natively to **Cloudflare Workers**. 

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying the application to the edge.

```bash
# Build the application
npm run build

# Deploy via Wrangler
npx wrangler pages deploy out
```

## 🧪 Testing

The core engine and format sanitizers are extensively tested using **Vitest**. To run the test suite:

```bash
npm run test
```

## 🔒 Privacy & Security

We take your privacy seriously. The core of CleanFile operates entirely via Web APIs and WebAssembly in the browser. 
- **Zero-Storage Policy:** We do not track, log, or persist the contents of any files uploaded.
- **Open Source Security:** Every line of sanitization logic is completely open source and verifiable.

Please review our [Privacy Model & Limitations](/privacy) documentation within the app for a detailed breakdown of what we can and cannot sanitize.

---

<div align="center">
  <p>Built with 🥷 precision by <a href="https://github.com/Anoopshukla-AI">Anoopshukla-AI</a></p>
</div>