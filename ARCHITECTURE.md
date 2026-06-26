# YDNT ARCHITECTURE
# youdontneedthis.us — Complete System Reference
# Last updated: June 26, 2026
# Maintained in: youdontneedthis-site repo (root)
# Read by: All AI agents working on either repo

---

## READ THIS FIRST — THE FOOD TRUCK ANALOGY

This site works like a food truck operation:

| Analogy | Reality |
|---------|---------|
| The Menu | `products.csv` (downloaded from Google Sheets) |
| The Kitchen | `youdontneedthis-inventory` repo (photos, videos, thumbnails) |
| The Printer | `build.js` (reads menu + kitchen, outputs one HTML file) |
| The Laminated Menu Card | `dist/index.html` (the actual website file) |
| The Window | GitHub Pages (serves the card to customers) |
| The Customer | Anyone visiting youdontneedthis.us |

**The Golden Rule:** Every time the Menu OR Kitchen changes, you MUST run the Printer
and push the new card to the Window. The Window has no printer of its own.

---

## THE FOUR SOURCES OF TRUTH (never violate hierarchy)

1. **Google Sheets** → master product data → exported as `products.csv`
2. **youdontneedthis-inventory repo** → all media (photos, videos, thumbnails)
3. **build.js** → reads both, generates `dist/index.html`
4. **ARCHITECTURE.md** → this file → authoritative system reference for all agents

If any agent is uncertain about system behavior, check this file before asking Nicholas.
If this file doesn't answer the question, flag it as an ARCHITECTURE GAP and update this file.

---

## REPO LOCATIONS

```
LOCAL (Mac):
  Site:      /Users/nicholasdemeter/Documents/youdontneedthis-site
  Inventory: /Users/nicholasdemeter/Documents/youdontneedthis-inventory
  ↑ MUST be siblings in Documents/ — build.js resolves inventory at ../youdontneedthis-inventory

GITHUB:
  Site:      https://github.com/NicholasDemeter/youdontneedthis-site
  Inventory: https://github.com/NicholasDemeter/youdontneedthis-inventory
  Live site: https://youdontneedthis.us
```

---

## HOW DEPLOYMENT WORKS

```
1. Nicholas edits Google Sheet
2. Downloads → replaces products.csv in site repo
3. Adds/edits photos in inventory repo (local Mac)
4. Runs: node build.js  ← NEVER skip. Reads CSV + local inventory. Outputs dist/index.html
5. Verifies locally: open dist/index.html in browser
6. git add dist/index.html products.csv
7. git commit -m "descriptive message"
8. git push origin main  (site repo)
9. GitHub Actions deploys dist/ to GitHub Pages
10. Wait 2-3 min → verify with curl (NOT browser)
```

**CRITICAL — WHY build.js MUST RUN LOCALLY:**
GitHub Actions does NOT have access to the local inventory repo.
If build.js runs on GitHub's servers it finds no photos → generates placeholders.
Always build locally first, commit dist/index.html, then push.
This was the root cause of the June 2026 image outage.

---

## INVENTORY PUSH COMMAND (branch mismatch — known issue)

```bash
cd /Users/nicholasdemeter/Documents/youdontneedthis-inventory
git add .
git commit -m "descriptive message"
git push origin master:main
# If rejected: git push origin master:main --force
# Only use --force if local is confirmed newer than GitHub
```

Local branch is `master`, GitHub is `main`. Functional but inconsistent. Rename when convenient.

**After every inventory push → must also rebuild and push site repo.**
Pushing inventory alone does NOT update the live site.

---

## SESSION START CHECKLIST

Run these at the start of EVERY session before touching anything:

```bash
git -C /Users/nicholasdemeter/Documents/youdontneedthis-site status
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory status
curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"
# Expected: 0. If 2 = old cache still live, wait 2-3 min and retry.
```

If any output is unexpected — stop and diagnose before proceeding.

---

## DO NOT PROCEED WITHOUT ASKING NICHOLAS

Never assume. Always ask Nicholas if:
- A LOT folder in staging matches an existing inventory item
- A new LOT number assignment is needed (check tail of products.csv first)
- Category assignment for a new item
- Pricing or description decisions
- Whether to delete or archive a sold item
- Any structural change to build.js or deploy.yml

---

## FOLDER MATCHING — HOW build.js FINDS PHOTOS

```
products.csv row:
LOT = "LOT_002"
FOLDER_NAME = "LOT_002_Microsoft_Surface_Studio_2_All_in_One_Desktop"

build.js matching logic (in order):
  1. Exact FOLDER_NAME match → use it
  2. Prefix match: any folder starting with "LOT_002_" → use it
  3. Neither matches → show placeholder ("No Image Available")

RULES:
✅ LOT ID format: LOT_### (always 3 digits, zero-padded)
✅ Folder MUST have content after number: LOT_069_Apple_Watch ✅
❌ LOT_069 alone (nothing after underscore) → may not match
✅ Case insensitive matching
✅ Photos: must be in Photos/ subfolder
✅ Thumbnail: must contain "THUMBNAIL" in filename, in LOT root (not Photos/)
✅ Videos: must be in Videos/ subfolder
✅ Accepted image formats: .jpg .jpeg .png .gif .webp
✅ Accepted video formats: .mp4 .mov .webm
```

---

## INVENTORY REPO — FOLDER STRUCTURE (strict, never deviate)

```
youdontneedthis-inventory/
├── Carousel_HERO/
│   └── Hero_Media.mp4           ← hero video. NEVER DELETE.
├── LOT_001_ITEM_NAME/
│   ├── LOT_001_THUMBNAIL.jpg    ← MUST be in root, not in Photos/
│   ├── Photos/
│   │   ├── LOT_001_01.jpg
│   │   ├── LOT_001_02.jpg
│   │   └── LOT_001_03.jpg       ← minimum 3 photos
│   └── Videos/
│       └── LOT_001_VIDEO_01.mp4
└── [more LOT folders...]
```

**File size limits:**
| Type | Max Size |
|------|----------|
| Thumbnail | 200KB |
| Photos | 400KB each |
| Videos | 10MB each |

---

## SITE REPO — WHAT LIVES WHERE

```
youdontneedthis-site/
├── ARCHITECTURE.md   ← THIS FILE. Single source of truth. Keep updated.
├── CLAUDE.md         ← Short stub pointing here. Auto-read by Claude Code.
├── build.js          ← THE ENGINE. Never delete.
├── products.csv      ← Source of truth #1. Replace with Google Sheets export.
├── CNAME             ← Contains "youdontneedthis.us". NEVER DELETE.
├── dist/
│   └── index.html   ← Generated by build.js. NEVER edit directly.
├── .github/
│   └── workflows/
│       └── deploy.yml ← Tells GitHub how to publish. NEVER DELETE.
└── skills/
    ├── SKILL-push.md
    ├── SKILL-new-lot.md
    ├── SKILL-verify-live.md
    ├── SKILL-sync-check.md
    └── SKILL-cleanup.md

DEAD WEIGHT (never edit, ignore entirely):
  app/ components/ hooks/ lib/ types/
  next.config.mjs tsconfig.json pnpm-lock.yaml postcss.config.mjs components.json
  Root index.html (622 bytes) styles.css app.js
  Stale branches: v0/nicholasdemeter, vercel/react-server-components-cve, YDNT_Sandbox
```

---

## CSS MODIFICATION RULES

All CSS lives inside `build.js` as a template literal. dist/index.html is generated output.

```
CORRECT WORKFLOW:
1. Edit CSS inside build.js (inside the <style> tag template literal)
2. Run: node build.js
3. Verify: open dist/index.html in browser
4. Commit both build.js AND dist/index.html
5. Push

NEVER:
- Edit CSS in dist/index.html (regenerated on every build, changes are lost)
- Add external .css files (site is intentionally single-file HTML)
- Scatter mobile CSS outside the @media blocks
```

**Mobile breakpoints — two blocks only:**
```
Desktop:  > 768px   (main CSS block, no media query)
Tablet:   ≤ 768px   (@media (max-width: 768px))
Phone:    ≤ 480px   (@media (max-width: 480px))
```

---

## MOBILE-CRITICAL PATTERNS (DO NOT BREAK)

**iOS Safari video — requires playsinline:**
```html
<video class="hero-video" autoplay muted loop playsinline>
```
Without `playsinline`, video fails silently on iOS Safari. No error. No playback. Just black.

**Viewport units — use svh not vh:**
```css
.hero { min-height: 100svh; }  /* NOT 100vh */
```
Accounts for iOS Safari's collapsing address bar. Prevents layout shift on scroll.

**Button width pattern on mobile:**
```css
@media (max-width: 768px) {
  .special-btn {
    width: 100%;
    max-width: 280px;   /* cap — no full-width stretch */
    margin: 0 auto;
  }
}
```

**Product grid responsive:**
```css
@media (max-width: 768px) {
  .lots-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
}
@media (max-width: 480px) {
  .lots-grid { grid-template-columns: 1fr; }
  .lot-thumbnail { height: 200px; }
}
```

---

## HOW IMAGES GET FROM MAC TO THE BROWSER

```
Local file:
/Users/nicholasdemeter/Documents/youdontneedthis-inventory/LOT_002_.../Photos/LOT_002_01.jpg
  ↓
build.js constructs GitHub raw URL:
https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/master/LOT_002_.../Photos/LOT_002_01.jpg
  ↓
URL baked into dist/index.html
  ↓
Visitor's browser fetches image directly from GitHub
```

---

## SITE FEATURES (confirmed working June 26, 2026)

| Feature | Status |
|---------|--------|
| Hero video (background) | ✅ Working |
| Hero copy (YOU DON'T / NEED THIS) | ✅ Working |
| Category dropdown (7 categories) | ✅ Working |
| Featured Items button | ✅ Working |
| Hot Items carousel (coolness ≥ 6) | ✅ Working |
| Product cards with thumbnails | ✅ Working |
| Category filter (hide/show cards) | ✅ Working |
| WhatsApp contact button | ✅ Working |
| Modal gallery with photos | ✅ Working |
| Modal gallery with videos | ✅ Working |
| Mobile responsive layout (768px + 480px) | ✅ Working |
| Stars hidden (internal use only) | ✅ Working |

---

## VERIFICATION COMMANDS

```bash
# Is correct build live?
curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"
# Expected: 0

# Are images loading?
curl -s https://youdontneedthis.us | grep -c "No Image Available"
# Expected: 2-5 (LOT_023 and LOT_064 have no folders — known)
# If 100+: build.js ran on GitHub servers without inventory. Rebuild locally and push.

# Test a specific image URL
curl -s -o /dev/null -w "%{http_code}" "https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/master/LOT_002_Microsoft_Surface_Studio_2_All_in_One_Desktop/LOT_002_THUMBNAIL.jpg"
# Expected: 200

# What commit is live on GitHub?
curl -s https://api.github.com/repos/NicholasDemeter/youdontneedthis-site/commits/main | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['sha'][:7], d['commit']['message'])"

# Cache status
curl -s -I https://youdontneedthis.us | grep -i "age\|last-modified"

# Is local site repo in sync with GitHub?
git -C /Users/nicholasdemeter/Documents/youdontneedthis-site diff origin/main --name-only

# Is local inventory in sync with GitHub?
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory status
```

---

## KNOWN ISSUES (as of June 26, 2026)

| Issue | Priority | Notes |
|-------|----------|-------|
| Inventory local branch `master` vs GitHub `main` | Low | Use `git push origin master:main`. Rename when convenient. |
| LOT_023 (DEVALIET EARDRUM SPECIAL) — no folder | Low | Shows placeholder. Add folder or remove from CSV. |
| LOT_064 (PrinCube) — no folder | Low | Shows placeholder. Add folder or remove from CSV. |
| Dead weight files in site repo | Low | Next.js scaffolding. Ignore. Delete when convenient. |

---

## GOLDEN RULES (violations break the live site)

1. Never edit `dist/index.html` directly — always regenerate via `node build.js`
2. Never run `build.js` on GitHub Actions (no inventory access there)
3. Never push inventory without also rebuilding and pushing site repo
4. Never delete `CNAME`, `deploy.yml`, or `Carousel_HERO/`
5. Never commit `.DS_Store` files
6. Always verify with curl — browser cache lies
7. Not in `products.csv` → not on site. Period.
8. In CSV but no matching inventory folder → shows placeholder, not broken
