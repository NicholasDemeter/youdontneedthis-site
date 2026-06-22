# SKILL-push.md
# YDNT — Complete Push Workflow
# Save to: /Users/nicholasdemeter/Documents/youdontneedthis-site/skills/SKILL-push.md

## WHEN TO USE THIS SKILL
Any time you need to update the live site at youdontneedthis.us

## PREREQUISITE — RUN SYNC CHECK FIRST
Before anything else, confirm all three sources of truth are aligned:
```bash
git -C /Users/nicholasdemeter/Documents/youdontneedthis-site status
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory status
```
If either shows unexpected changes — STOP. Resolve before proceeding.

## STEP 1 — UPDATE PRODUCTS.CSV (if needed)
1. Edit Google Sheet
2. File → Download → CSV
3. Replace: /Users/nicholasdemeter/Documents/youdontneedthis-site/products.csv
4. Verify row count looks right before proceeding

## STEP 2 — UPDATE INVENTORY (if needed)
Push any new/changed LOT folders to inventory repo first:
```bash
cd /Users/nicholasdemeter/Documents/youdontneedthis-inventory
git add .
git commit -m "description of changes"
git push origin master:main
```
Verify push succeeded before proceeding to Step 3.

## STEP 3 — BUILD LOCALLY (never skip)
```bash
cd /Users/nicholasdemeter/Documents/youdontneedthis-site
node build.js
```
Expected output: "✓ Build complete!" with dot progress for each product.
Warnings about missing folders are OK — they mean that LOT will show no images.
Any ERROR = stop and fix before proceeding.

## STEP 4 — VERIFY BUILD HAS REAL IMAGES (never skip)
```bash
grep -c "No Image Available" dist/index.html
```
Expected: a LOW number (2-5 max for known missing LOTs like LOT_023, LOT_064)
If returns 50+ — images are not loading. DO NOT PUSH. Diagnose first.

## STEP 5 — VERIFY LOCALLY IN BROWSER
```bash
open /Users/nicholasdemeter/Documents/youdontneedthis-site/dist/index.html
```
Visually confirm:
- Hero video playing
- Hot items carousel showing images
- Product cards showing thumbnails
- Dropdown filter working
- No hero stats block (100+, $2M+, 5★)

If anything looks wrong — DO NOT PUSH. Fix first.

## STEP 6 — COMMIT AND PUSH SITE
```bash
cd /Users/nicholasdemeter/Documents/youdontneedthis-site
git add dist/index.html products.csv
git commit -m "Rebuild: [describe what changed]"
git push origin main
```
If push rejected due to unstaged changes:
```bash
git stash push -m "temp stash before push"
git pull --rebase origin main
git push origin main
git stash pop
```

## STEP 7 — VERIFY GITHUB RECEIVED THE PUSH
```bash
curl -s https://api.github.com/repos/NicholasDemeter/youdontneedthis-site/commits/main | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['sha'][:7], d['commit']['message'])"
```
Should return your commit SHA and message. If not — push failed silently.

## STEP 8 — VERIFY LIVE SITE (wait 2-3 minutes first)
```bash
curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"
```
Expected: 0
If returns 2: old cache. Wait 2 more minutes and retry. Do NOT push again.
If returns 2 after 10 minutes: check GitHub Actions tab for failed workflow.

## STEP 9 — CHECK IMAGE COUNT ON LIVE SITE
```bash
curl -s https://youdontneedthis.us | grep -c "No Image Available"
```
Expected: same low number as Step 4.
If returns 100+: GitHub Actions rebuilt without local inventory. See SKILL-troubleshoot.md.

## VERIFICATION COMPLETE
All steps green = wish granted. Site is live with correct content and images.

## KNOWN GOTCHAS
- Never push dist/index.html built by GitHub Actions — it has placeholder images
- Always build locally where inventory exists before pushing
- CNAME file at repo root — never delete it
- .github/workflows/deploy.yml — never delete it
- .DS_Store should not be committed — it will show as modified but ignore it
