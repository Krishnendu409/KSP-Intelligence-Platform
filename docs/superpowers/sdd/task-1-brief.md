### Task 1: Configure Client Package Schema & SPA Fallback Build

**Files:**
- Modify: `C:/Users/krish/Downloads/KSP/KSP/frontend/public/client-package.json:1-6`
- Modify: `C:/Users/krish/Downloads/KSP/KSP/frontend/package.json:5-15`

**Interfaces:**
- Consumes: Existing Vite build output (`frontend/dist/index.html`)
- Produces: Correctly configured Catalyst hosting schema (`homepage`: `"index.html"`, `404`: `"404.html"`) and duplicate fallback file `frontend/dist/404.html`.

- [ ] **Step 1: Write correct homepage and 404 mapping in client-package.json**
Modify `C:/Users/krish/Downloads/KSP/KSP/frontend/public/client-package.json` to exactly:
```json
{
  "name": "ksp_tactical_hub_client",
  "version": "1.0.0",
  "homepage": "index.html",
  "404": "404.html"
}
```

- [ ] **Step 2: Update frontend/package.json build script to generate SPA 404 fallback**
In `C:/Users/krish/Downloads/KSP/KSP/frontend/package.json`, update `"scripts"` so `"build"` includes copying `index.html` to `404.html`:
```json
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build && node -e \"fs.copyFileSync('dist/index.html', 'dist/404.html')\"",
    "lint": "eslint .",
    "preview": "vite preview"
  },
```

- [ ] **Step 3: Run frontend build to generate static client package**
Run command in terminal: `cd C:\Users\krish\Downloads\KSP\KSP\frontend ; npm run build`
Expected: Complete build success with `dist/index.html`, `dist/404.html`, and `dist/client-package.json` generated without errors.

- [ ] **Step 4: Verify build files exist in dist directory**
Run command: `Get-ChildItem -Path C:\Users\krish\Downloads\KSP\KSP\frontend\dist -Include "index.html","404.html","client-package.json" -Recurse | Select-Object Name, Length`
Expected: Output listing `index.html`, `404.html`, and `client-package.json`.

- [ ] **Step 5: Commit task 1 configuration changes**
```bash
git add frontend/public/client-package.json frontend/package.json
git commit -m "fix(client): set Catalyst homepage to index.html and automate 404 SPA fallback"
```

**Instructions for Implementer:**
Execute all 5 steps sequentially without placeholders. Once finished, write a full report to `C:/Users/krish/Downloads/KSP/KSP/docs/superpowers/sdd/task-1-report.md` recording your commit hash, verification output, and status. Reply in chat with only your status (e.g. DONE), commit hash, a one-line test summary, and any concerns.
