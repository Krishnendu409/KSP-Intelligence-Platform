# Catalyst Web Client URL and SPA Routing Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the Zoho Catalyst web client deployment URL configuration so `https://datathon-60076843504.development.catalystserverless.in/app/index.html` serves as the official accessible prototype link and SPA routes fall back seamlessly to a cloned `404.html`.

**Architecture:** Update `frontend/public/client-package.json` to declare `"homepage": "index.html"` and `"404": "404.html"` as expected by Zoho Catalyst client hosting schema, and add a post-build step in frontend to duplicate `index.html` to `404.html` for client-side React routing fallback.

**Tech Stack:** React 19, Vite 6, Zoho Catalyst Serverless Web Hosting (zcatalyst-cli), PowerShell / Node scripts.

## Global Constraints

Strictly comply with Zoho Catalyst CLI web client hosting directory structure and client-package.json schema requirements (`homepage` cannot equal `404`). Preserve all existing React codebase logic and API endpoints. No placeholders or incomplete commands permitted.

---

### Task 1: Configure Client Package Schema & SPA Fallback Build

**Files:**
- Modify: `C:/Users/krish/Downloads/KSP/KSP/frontend/public/client-package.json:1-6`
- Modify: `C:/Users/krish/Downloads/KSP/KSP/frontend/package.json:5-15`

**Interfaces:**
- Consumes: Existing Vite build output (`frontend/dist/index.html`)
- Produces: Correctly configured Catalyst hosting schema (`homepage`: `"index.html"`, `404`: `"404.html"`) and duplicate fallback file `frontend/dist/404.html`.

- [ ] **Step 1: Write correct homepage and 404 mapping in client-package.json**

```json
{
  "name": "ksp_tactical_hub_client",
  "version": "1.0.0",
  "homepage": "index.html",
  "404": "404.html"
}
```

- [ ] **Step 2: Update frontend/package.json build script to generate SPA 404 fallback**

```json
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build && node -e \"fs.copyFileSync('dist/index.html', 'dist/404.html')\"",
    "lint": "eslint .",
    "preview": "vite preview"
  },
```

- [ ] **Step 3: Run frontend build to generate static client package**

Run: `cd C:\Users\krish\Downloads\KSP\KSP\frontend ; npm run build`
Expected: Complete build success with `dist/index.html`, `dist/404.html`, and `dist/client-package.json` generated without errors.

- [ ] **Step 4: Verify build files exist in dist directory**

Run: `Get-ChildItem -Path C:\Users\krish\Downloads\KSP\KSP\frontend\dist -Include "index.html","404.html","client-package.json" -Recurse | Select-Object Name, Length`
Expected: Output listing `index.html`, `404.html` (identical size to index.html), and `client-package.json`.

- [ ] **Step 5: Commit task 1 configuration changes**

```bash
git add frontend/public/client-package.json frontend/package.json
git commit -m "fix(client): set Catalyst homepage to index.html and automate 404 SPA fallback"
```

---

### Task 2: Deploy Web Client to Zoho Catalyst Cloud & Test Live Endpoints

**Files:**
- Modify: None (Deploys built static files in `frontend/dist` to Zoho Catalyst)
- Test: Live remote CDN endpoint `https://datathon-60076843504.development.catalystserverless.in/app/index.html`

**Interfaces:**
- Consumes: Built client bundle from `frontend/dist/`
- Produces: Live public web client accessible at `https://datathon-60076843504.development.catalystserverless.in/app/index.html`.

- [ ] **Step 1: Execute Catalyst CLI deploy command for web client and functions**

Run: `cd C:\Users\krish\Downloads\KSP\KSP ; & "$env:APPDATA\npm\catalyst.cmd" deploy 2>&1`
Expected: Output showing `√ DEPLOYMENT SUCCESSFUL: ksp_tactical_hub_client` with `ACCESS URL: https://datathon-60076843504.development.catalystserverless.in/app/index.html` and `√ DEPLOYMENT SUCCESSFUL: ksp_api`.

- [ ] **Step 2: Execute live endpoint HTTP verification against deployed app link**

Run: `Invoke-WebRequest -Uri "https://datathon-60076843504.development.catalystserverless.in/app/index.html" -Method Get -UseBasicParsing | Select-Object StatusCode, StatusDescription`
Expected: `StatusCode: 200, StatusDescription: OK`.

- [ ] **Step 3: Execute live endpoint HTTP verification against SPA fallback route**

Run: `Invoke-WebRequest -Uri "https://datathon-60076843504.development.catalystserverless.in/app/dashboard" -Method Get -UseBasicParsing | Select-Object StatusCode, StatusDescription`
Expected: `StatusCode: 200, StatusDescription: OK` (served via 404 fallback to React Router).

- [ ] **Step 4: Commit deployment verification notes and push to GitHub repository**

```bash
git add .
git commit -m "chore(release): verify live Catalyst prototype URL at /app/index.html for submission"
git push -u origin main
```
