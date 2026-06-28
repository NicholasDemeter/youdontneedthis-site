# SKILL-verify-live.md
# YDNT — Live Site Verification

## SELF-CORRECTION RULE
If a result contradicts this skill or ARCHITECTURE.md, STOP and ask Nicholas. If a document
is wrong, propose the fix and update it with approval in the same session.

## GOLDEN RULE
Browser cache is never ground truth. Verify with curl. Never report "the site is updated"
without the checks below.

---

## STEP 1 — IS THE RIGHT BUILD LIVE?
```bash
curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"
```
0 = correct build is live. Non-zero = old cache; wait a few minutes and retry, do NOT push
again. Still non-zero after ~10 min = check the GitHub Actions run.

## STEP 2 — WHAT COMMIT IS LIVE ON GITHUB?
```bash
curl -s https://api.github.com/repos/NicholasDemeter/youdontneedthis-site/commits/main \
 | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['sha'][:7], d['commit']['message'])"
```
Should match your most recent commit.

## STEP 3 — DID THE DEPLOY WORKFLOW RUN?
Open: https://github.com/NicholasDemeter/youdontneedthis-site/actions
Latest run should be green and triggered by your commit. Red = open it for the error.
Missing = workflow didn't trigger; confirm the deploy file exists under .github/workflows/.

## STEP 4 — CACHE AGE
```bash
curl -s -I https://youdontneedthis.us | grep -i "age\|cache\|last-modified\|etag"
```
A very old last-modified = an old file is being served.

## STEP 5 — ARE IMAGES ACTUALLY RENDERING? (the reliable check)
The placeholder STRING appears once per item in the page's data, so counting it overstates
the problem. Count ACTUAL rendered placeholders instead:
```bash
curl -s https://youdontneedthis.us | grep -o 'src="data:image' | wc -l
```
This is the true number of items showing "No Image Available" on the page. Interpret it
against SKILL-sync-check Check 4 (the current list of CSV items with no folder). If this
number is far higher than that list — effectively the whole catalogue — a build ran WITHOUT
local inventory (see Failure Modes). If it equals the Check-4 list, the site is correct.

## STEP 6 — TEST ONE REAL IMAGE URL
```bash
# Get the served inventory branch from build.js so the URL is correct:
grep "INVENTORY_REPO_BASE" ~/Documents/youdontneedthis-site/build.js
# Then test any real thumbnail (substitute a folder that exists):
curl -s -o /dev/null -w "%{http_code}" \
 "https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/<branch>/<LOT_folder>/<THUMBNAIL file>"
```
200 = image exists and is reachable. 404 = not on GitHub (confirm the inventory push landed,
and that you used the branch from INVENTORY_REPO_BASE — site repo and inventory repo do not
necessarily share a branch name).

## STEP 7 — VISUAL CHECK (Nicholas, last)
Only after 1–6 are clean. Hard refresh (Cmd+Shift+R) or incognito. Confirm hero video,
special sections, cards, dropdown. The agent cannot see the render — it reports, Nicholas confirms.

---

## FAILURE MODES

### Site not updating after push
1. Did the Actions workflow run (Step 3)?  2. Cache age within limits (Step 4)?
3. Does the live commit match yours (Step 2)?

### Whole-catalogue placeholders (Step 5 number is huge)
A build ran without local inventory — almost always GitHub Actions running build.js, which
cannot see the local inventory folders. Fix: build locally, commit dist/index.html, push.
The deploy workflow must only SERVE the committed dist/index.html, never run build.js.

### A handful of placeholders (Step 5 matches the Check-4 list)
Those specific items have no inventory folder yet. Add the folder (SKILL-new-lot.md) or
remove the row from the CSV. This is expected, not a malfunction.

### Push rejected / auth error
STOP. Report the exact error to Nicholas. Do not switch to SSH/gh-CLI/--force on your own.

### Whole-site blank images but files ARE on GitHub (200 on direct curl)
Check INVENTORY_REPO_BASE in build.js. It MUST end in `/main`. The inventory's local
branch is `master` but it is pushed to GitHub's `main`, so images live on `main`. If the
constant says `/master`, every image URL 404s. Fix the constant to `/main`, rebuild, push.
