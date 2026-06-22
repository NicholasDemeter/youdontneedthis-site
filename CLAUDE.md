# YDNT Site Repo — Claude Context File
# Place this file at: /Users/nicholasdemeter/Documents/youdontneedthis-site/CLAUDE.md
# Read this entire file before doing anything. No exceptions.

---

## THE FOOD TRUCK ANALOGY (read this first)

This site works like a food truck with three things that must stay in sync:

1. **The Menu** = `products.csv` (downloaded from Google Sheets)
2. **The Kitchen** = `youdontneedthis-inventory` repo (photos, videos, thumbnails)
3. **The Printer** = `build.js` (reads menu + kitchen, prints one HTML file)
4. **The Window** = `dist/index.html` served by GitHub Pages

Every time menu or kitchen changes, you MUST run the printer and push the new card.
**Pushing inventory alone does nothing to the live site.**

---

## THREE SOURCES OF TRUTH (never violate hierarchy)

1. Google Sheets → downloaded as `products.csv` → authoritative for all product data
2. `youdontneedthis-inventory` repo → authoritative for all media
3. `build.js` → reads both, generates `dist/index.html`

---

## REPO LOCATIONS (local Mac)

- Site: `/Users/nicholasdemeter/Documents/youdontneedthis-site`
- Inventory: `/Users/nicholasdemeter/Documents/youdontneedthis-inventory`
- These MUST be siblings in Documents/ — build.js resolves inventory at `../youdontneedthis-inventory`

## GITHUB REPOS

- Site: https://github.com/NicholasDemeter/youdontneedthis-site
- Inventory: https://github.com/NicholasDemeter/youdontneedthis-inventory
- Live site: https://youdontneedthis.us

---

## HOW DEPLOYMENT WORKS (confirmed June 22, 2026)

GitHub Actions workflow at `.github/workflows/deploy.yml` triggers on every push to `main`.
It runs `node build.js` on GitHub's servers and deploys `dist/` to GitHub Pages.

**CRITICAL:** The workflow runs build.js on GitHub's servers where local inventory doesn't exist.
The current build.js reads from LOCAL inventory at build time.
This means: always run `node build.js` locally first, commit `dist/index.html`, THEN push.
The GitHub Actions workflow is a safety net, not the primary build mechanism.

---

## THE ONLY CORRECT UPDATE WORKFLOW

```
1. Edit Google Sheet
2. Download → replace products.csv in site repo
3. cd /Users/nicholasdemeter/Documents/youdontneedthis-site
4. node build.js  ← NEVER skip this
5. open dist/index.html  ← verify locally in browser
6. git add dist/index.html products.csv
7. git commit -m "descriptive message"
8. git push origin main
9. Wait 2-3 minutes
10. VERIFY: curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"
    → must return 0
```

---

## CRITICAL MATCHING RULES (never change these)

- LOT ID format: `LOT_###` (always 3 digits, zero-padded)
- Folder match: `build.js` uses `LOT_${number}_` prefix — folder MUST have content after the number
- Example: `LOT_069_Apple_Watch_Ultra_2` matches LOT_069 ✅
- Example: `LOT_069` with nothing after — does NOT match ✅
- Photos: must live in `Photos/` subfolder
- Thumbnail: any file with "THUMBNAIL" anywhere in name, in LOT root
- Accepted extensions: `.jpg .jpeg .png .gif .webp` (case insensitive)
- Videos: must live in `Videos/` subfolder, `.mp4 .mov .webm` supported

---

## GOLDEN RULES

1. Not in products.csv → won't appear on site
2. In CSV but no matching folder → panel renders with NO images
3. Local repos not matching GitHub → site shows wrong content
4. Pushing inventory alone → does NOT update site
5. Never edit dist/index.html directly — always regenerate via node build.js

---

## WHAT IS DEAD WEIGHT (never edit, schedule for deletion)

These files exist in the repo but are NEVER deployed and serve NO function:
- `app/` `components/` `hooks/` `lib/` `types/` — Next.js scaffolding from v0.dev
- `next.config.mjs` `tsconfig.json` `pnpm-lock.yaml` `postcss.config.mjs` `components.json`
- Root `index.html` (622 bytes) `styles.css` `app.js`
- Stale branches: `v0/nicholasdemeter` `vercel/react-server-components-cve` `YDNT_Sandbox`
- `.DS_Store` should never be committed — add to .gitignore

Do NOT edit these. Do NOT ask questions about these. Ignore them entirely.

---

## VERIFICATION COMMANDS (use these, not browser)

```bash
# Is the live site updated?
curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"
# Expected: 0 = new build live | 2 = old cache (wait 2-3 min and retry)

# What commit is live on GitHub?
curl -s https://api.github.com/repos/NicholasDemeter/youdontneedthis-site/commits/main | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['sha'][:7], d['commit']['message'])"

# Is local in sync with GitHub?
git -C /Users/nicholasdemeter/Documents/youdontneedthis-site diff origin/main --name-only

# Is inventory in sync with GitHub?
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory status
```

---

## SESSION START CHECKLIST

Run these three commands at the start of EVERY session before touching anything:

```bash
git -C /Users/nicholasdemeter/Documents/youdontneedthis-site status
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory status
curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"
```

If any output is unexpected — stop and diagnose before proceeding.

---

## KNOWN ISSUES / WATCH POINTS

- Inventory repo local branch is `master`, GitHub is `main`
  Push command: `git push origin master:main`
  If rejected: `git push origin master:main --force` (only if local is confirmed newer)

- If push rejected due to unstaged changes before rebase:
  `git stash push -m "description"` → rebase → `git stash pop`

- CNAME file at repo root contains `youdontneedthis.us` — never delete this file

- GitHub Actions workflow at `.github/workflows/deploy.yml` — never delete this file

- Browser cache is NOT ground truth. Always use curl for verification.

---

## CURRENT SITE FEATURES (as of June 22, 2026)

- Hero video from `Carousel_HERO/Hero_Media.mp4` in inventory repo
- Hot items carousel: products with coolness rating ≥ 6
- Category dropdown: 7 categories, filters by hiding/showing cards
- Stars: hidden via CSS `display: none` — class exists in HTML but not visible
- Cards sorted by coolness rating (highest first)
- WhatsApp contact: 256780923638
- Modal gallery: supports both images and videos
- Placeholder image shown when no inventory folder found

---

## WHAT TO ASK NICHOLAS BEFORE PROCEEDING

Never assume. Always ask Nicholas if:
- A LOT folder in staging matches an existing inventory item
- A new LOT number assignment is needed (check tail of products.csv first)
- Category assignment for a new item
- Pricing decision
- Whether to delete or archive a sold item

---

## SKILLS FILES (in /skills folder)

- `SKILL-push.md` — complete push sequence with verification gates
- `SKILL-new-lot.md` — new item intake workflow
- `SKILL-cleanup.md` — inventory compliance and file standards
- `SKILL-sync-check.md` — verify all three sources of truth before any push
- `SKILL-verify-live.md` — live site verification protocol
