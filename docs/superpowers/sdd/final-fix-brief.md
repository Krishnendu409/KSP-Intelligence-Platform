# Final Review Remediation Brief

You are dispatched to resolve all findings from the senior code reviewer in a single wave.

### Finding 1 (Critical): Missing `login_page` and `error_page` schema in client-package.json
Modify `C:/Users/krish/Downloads/KSP/KSP/frontend/public/client-package.json` to explicitly include both properties:
```json
{
  "name": "ksp_tactical_hub_client",
  "version": "1.0.0",
  "homepage": "index.html",
  "login_page": "index.html",
  "error_page": "index.html",
  "404": "404.html"
}
```

### Finding 2 (Important): Accurate status code reporting for SPA routing on Catalyst CDN
In `C:/Users/krish/Downloads/KSP/KSP/docs/superpowers/sdd/task-2-report.md`, explicitly document that accessing deep SPA routes (like `/app/dashboard`) on Zoho Catalyst Cloud CDN returns an HTTP status code of `404 Not Found` while serving the complete `404.html` (identical copy of `index.html`) body to execute client-side React routing. Do not obscure or misrepresent this normal Catalyst CDN behavior as a 200 OK.

### Finding 3 (Minor): UTF-16LE encoding in diff files
Whenever saving output or diffs to files in PowerShell, explicitly append `| Out-File -Encoding utf8 -FilePath <path>` rather than using standard `>` redirection.

---

### Execution Checklist:
1. Edit `frontend/public/client-package.json` with the complete JSON schema above.
2. Update `docs/superpowers/sdd/task-2-report.md` with accurate technical explanations of Catalyst's HTTP 404 SPA fallback behavior.
3. Run `cd C:\Users\krish\Downloads\KSP\KSP\frontend ; npm run build` to update `dist/client-package.json`.
4. Run `cd C:\Users\krish\Downloads\KSP\KSP ; & "$env:APPDATA\npm\catalyst.cmd" deploy 2>&1` to push the final schema to Catalyst Cloud.
5. Re-generate UTF-8 review diffs:
   - `git diff 544a44e 22d04d1 | Out-File -Encoding utf8 -FilePath docs\superpowers\sdd\task-1-review.diff`
   - `git diff 22d04d1 7575f82 | Out-File -Encoding utf8 -FilePath docs\superpowers\sdd\task-2-review.diff`
6. Commit all fixes and push to remote main:
   ```bash
   git add .
   git commit -m "fix(client): configure login and error page schemas and document SPA 404 status behavior"
   git push origin main
   ```
7. Re-generate final whole-branch review diff in UTF-8:
   `git log -n 5 --stat -p | Out-File -Encoding utf8 -FilePath docs\superpowers\sdd\final-review.diff`

Reply back with your status (DONE), final commit hash, and summary.
