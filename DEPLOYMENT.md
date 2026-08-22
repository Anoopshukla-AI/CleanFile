# CleanFile — Cloudflare Deployment Guide

This guide details how to deploy **CleanFile** to Cloudflare Workers using `@opennextjs/cloudflare`.

---

## 1. Prerequisites

- [Node.js](https://nodejs.org/) v18.18+ or v20+
- A [Cloudflare Account](https://dash.cloudflare.com/sign-up)
- `wrangler` CLI (installed as a devDependency in this project)

---

## 2. Local Development

Run the local Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To preview the app locally inside the Cloudflare Worker runtime (Wrangler environment):

```bash
npx opennextjs-cloudflare dev
```

---

## 3. Environment Variables & Compatibility

Ensure your `wrangler.jsonc` file includes the mandatory `nodejs_compat` flag:

```json
{
  "name": "cleanfile",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-04-01",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

No environment variables or secret API keys are required for the MVP because all file scanning, sanitization, and verification occur **100% client-side** inside the browser memory.

---

## 4. Build Process

Compile the Next.js app and transform the output into a Cloudflare Worker bundle using `@opennextjs/cloudflare`:

```bash
npx opennextjs-cloudflare build
```

This generates:
- `.open-next/worker.js` (Worker bundle)
- `.open-next/assets` (Static HTML/CSS/JS assets)

---

## 5. Deploying to Cloudflare Workers

Authenticate Wrangler with your Cloudflare account (if not already logged in):

```bash
npx wrangler login
```

Deploy the application to Cloudflare Workers:

```bash
npx opennextjs-cloudflare deploy
```

Once deployment completes, Wrangler will output your worker URL (e.g. `https://cleanfile.<your-subdomain>.workers.dev`).

---

## 6. Custom Domain Setup

To configure a custom domain (e.g., `cleanfile.app`):

1. Go to your Cloudflare Dashboard → Workers & Pages → `cleanfile`.
2. Click **Settings** → **Triggers** → **Custom Domains**.
3. Click **Add Custom Domain** and enter `cleanfile.app`.
4. Cloudflare will automatically route DNS traffic to your Worker and issue an SSL certificate.

---

## 7. Upload Limits & Worker Runtime Considerations

- **Maximum Upload File Size:** 50 MB (client-side in-browser processing limit).
- **Worker Memory:** Client-side processing means zero memory pressure on the Cloudflare Worker.
- **Worker CPU Time:** Only static asset serving and `/api/capabilities` routes run on the Worker, keeping execution times under 5ms.
- **Native Binaries:** CleanFile does not rely on ExifTool, ImageMagick, or any Linux C binaries, ensuring 100% runtime compatibility.
