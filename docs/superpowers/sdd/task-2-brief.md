### Task 2: Deploy Web Client to Zoho Catalyst Cloud & Test Live Endpoints

**Files:**
- Modify: None (Deploys built static files in `frontend/dist` to Zoho Catalyst)
- Test: Live remote CDN endpoint `https://datathon-60076843504.development.catalystserverless.in/app/index.html`

**Interfaces:**
- Consumes: Built client bundle from `frontend/dist/` (with `index.html`, `404.html`, and `client-package.json`)
- Produces: Live public web client accessible at `https://datathon-60076843504.development.catalystserverless.in/app/index.html` and SPA fallback routing.

- [ ] **Step 1: Execute Catalyst CLI deploy command for web client and functions**
Run command: `cd C:\Users\krish\Downloads\KSP\KSP ; & "$env:APPDATA\npm\catalyst.cmd" deploy 2>&1`
Expected: Output showing `√ DEPLOYMENT SUCCESSFUL: ksp_tactical_hub_client` with `ACCESS URL: https://datathon-60076843504.development.catalystserverless.in/app/index.html` and `√ DEPLOYMENT SUCCESSFUL: ksp_api`. Note: if Catalyst CLI takes a few seconds or logs warnings, verify that the deployment SUCCESS messages appear at the end.

- [ ] **Step 2: Execute live endpoint HTTP verification against deployed app link**
Run command: `Invoke-WebRequest -Uri "https://datathon-60076843504.development.catalystserverless.in/app/index.html" -Method Get -UseBasicParsing -TimeoutSec 10 | Select-Object StatusCode, StatusDescription`
Expected: `StatusCode: 200, StatusDescription: OK`.

- [ ] **Step 3: Execute live endpoint HTTP verification against SPA fallback route**
Run command: `Invoke-WebRequest -Uri "https://datathon-60076843504.development.catalystserverless.in/app/dashboard" -Method Get -UseBasicParsing -TimeoutSec 10 | Select-Object StatusCode, StatusDescription`
Expected: `StatusCode: 200, StatusDescription: OK` (served via 404 fallback to React Router).

- [ ] **Step 4: Commit deployment verification notes and push to GitHub repository**
Run command: `cd C:\Users\krish\Downloads\KSP\KSP ; git add . ; git commit -m "chore(release): verify live Catalyst prototype URL at /app/index.html for submission" ; git push -u origin main`
Expected: Clean git push to origin main without syntax or network errors.

**Instructions for Implementer:**
Execute all 4 steps sequentially without placeholders. If `catalyst deploy` returns any warnings, confirm that DEPLOYMENT SUCCESSFUL appears. Once finished, write a full report to `C:/Users/krish/Downloads/KSP/KSP/docs/superpowers/sdd/task-2-report.md` recording your deploy output, HTTP verification results, commit hash, and status. Reply in chat with only your status (e.g. DONE), commit hash, a one-line test summary, and any concerns.
