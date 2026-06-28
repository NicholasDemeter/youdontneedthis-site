# SKILL-push.md
# YDNT — Push an Update to the Live Site

## SELF-CORRECTION RULE
If a step's result doesn't match expectations, STOP and ask Nicholas. If a document is
the cause, propose the fix and update it with approval before continuing.

## PUSH GATE — never push without Nicholas's explicit approval this session.
Build → verify locally → report → wait for "push it" → only then git push.
A general "go ahead" from a prior task does not carry forward.

---

## STEP 0 — SYNC CHECK FIRST
Run SKILL-sync-check.md. Resolve anything unexpected before continuing.

## STEP 1 — UPDATE products.csv (if data changed)
Nicholas edits the Google Sheet, downloads as CSV, and replaces:
`~/Documents/youdontneedthis-site/products.csv`
Sanity-check the row count with a real parser:
```bash
python3 -c "import csv;print('rows:',sum(1 for _ in csv.DictReader(open('$HOME/Documents/youdontneedthis-site/products.csv'))))"
```

## STEP 2 — UPDATE INVENTORY (if media changed)
Push new/changed LOT folders FIRST:
```bash
cd ~/Documents/youdontneedthis-inventory
git add .
git commit -m "describe the media change"
git push origin master:main
```
Confirm the push succeeded before Step 3. Pushing inventory alone does NOT update the
live site — the site only changes when a freshly-built dist/index.html is pushed.

## STEP 3 — BUILD LOCALLY (never skip)
```bash
cd ~/Documents/youdontneedthis-site
node build.js
```
Expect "✓ Build complete!" Warnings about a missing folder mean that LOT will show no
images — note them. Any ERROR = stop and fix.

## STEP 4 — VERIFY THE BUILD HAS REAL IMAGES
```bash
grep -c "No Image Available" dist/index.html
```
This counts a placeholder string. Any non-trivial count means that many CSV items lack a
matching folder. Cross-check against SKILL-sync-check Check 4. If the count is unexpectedly
high (e.g. most of the catalogue), DO NOT PUSH — that pattern means build.js could not see
the inventory. Diagnose first (SKILL-verify-live.md).

## STEP 5 — VERIFY LOCALLY IN BROWSER
```bash
open ~/Documents/youdontneedthis-site/dist/index.html
```
Confirm: hero video plays, special sections populate, product cards show thumbnails,
dropdown filters. VISUAL CHECK IS NICHOLAS'S CALL — you cannot see the render. Report what
to look at; do not claim a visual passed. If anything is wrong, DO NOT PUSH.

## STEP 6 — REPORT & GET APPROVAL (the gate)
Tell Nicholas exactly what changed and what you confirmed. Wait for explicit approval.

## STEP 7 — COMMIT AND PUSH SITE
```bash
cd ~/Documents/youdontneedthis-site
git add dist/index.html products.csv
git commit -m "Rebuild: describe what changed"
git push origin main
```
If the push is rejected or any auth/credential error appears: STOP. Report the exact error.
Do NOT switch methods, use --force, or invent a workaround on your own.

## STEP 8 — CONFIRM GITHUB RECEIVED IT
```bash
curl -s https://api.github.com/repos/NicholasDemeter/youdontneedthis-site/commits/main \
 | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['sha'][:7], d['commit']['message'])"
```
Should show your commit. If not, the push did not land.

## STEP 9 — CONFIRM LIVE (wait ~2-3 min)
```bash
curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"   # expect 0
curl -s https://youdontneedthis.us | grep -o 'src="data:image' | wc -l     # rendered placeholders
```
The second command counts ACTUAL rendered placeholders (the reliable image check). A high
number across the whole site means a build ran without inventory — see SKILL-verify-live.md.

## DON'T
- Never push a dist/index.html built by GitHub Actions (it has placeholders).
- Never delete CNAME or the .github/workflows deploy file.
- Never commit .DS_Store.
