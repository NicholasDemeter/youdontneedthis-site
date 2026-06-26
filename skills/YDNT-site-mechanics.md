# YDNT Site Mechanics
# youdontneedthis.us — How This Site Actually Works
# Version: DRAFT — June 22, 2026
# Status: Images not loading on live site (ACTIVE ISSUE — see ? marks below)

---

## THE FOOD TRUCK ANALOGY

Think of the site as a food truck operation:

| Analogy | Reality |
|---------|---------|
| The Menu | `products.csv` (downloaded from Google Sheets) |
| The Kitchen | `youdontneedthis-inventory` repo (photos, videos, thumbnails) |
| The Printer | `build.js` (reads menu + kitchen, prints one HTML file) |
| The Laminated Menu Card | `dist/index.html` (the actual website file, 318KB) |
| The Window | GitHub Pages (shows the card to customers) |
| The Customer | Anyone visiting youdontneedthis.us |

**The Golden Rule:** Every time menu OR kitchen changes, you MUST run the printer and put a new card in the window.

---

## SCHEMATIC — HOW A PAGE UPDATE FLOWS

```
NICHOLAS
   │
   ├─── 1. Edits Google Sheet (adds/removes items, updates prices)
   │         └── Downloads as products.csv
   │                   └── Replaces local file in site repo
   │
   ├─── 2. Adds/edits photos in inventory repo (local Mac)
   │         Location: /Users/nicholasdemeter/Documents/youdontneedthis-inventory
   │
   ├─── 3. Runs: node build.js
   │         └── Reads products.csv
   │         └── Reads local inventory folders
   │         └── Builds GitHub image URLs  ← ? SEE ISSUE #1 BELOW
   │         └── Outputs: dist/index.html (self-contained, 318KB)
   │
   ├─── 4. Verifies locally: open dist/index.html in browser
   │
   ├─── 5. git push origin main (site repo)
   │         └── GitHub receives dist/index.html
   │         └── GitHub Actions workflow triggers (.github/workflows/deploy.yml)
   │                   └── Deploys dist/ folder to GitHub Pages
   │                             └── ? SEE ISSUE #2 BELOW
   │
   └─── 6. youdontneedthis.us serves new page (after ~2-3 min cache expiry)
```

---

## THE THREE SOURCES OF TRUTH

```
SOURCE 1: Google Sheets
   URL: https://docs.google.com/spreadsheets/d/17OHlKS3aTwR0ane3qJefjXm6SPHpI6KqYO0Qg4jFyvk/
   Role: Master product data (names, prices, descriptions, specs, categories)
   Output: products.csv → saved to site repo
   Rule: If item not in Sheet → not on website. Period.

SOURCE 2: youdontneedthis-inventory (GitHub repo)
   Local:  /Users/nicholasdemeter/Documents/youdontneedthis-inventory
   GitHub: https://github.com/NicholasDemeter/youdontneedthis-inventory
   Role: All photos, videos, thumbnails
   Rule: If no matching folder → item shows on site with NO images

SOURCE 3: youdontneedthis-site (GitHub repo)
   Local:  /Users/nicholasdemeter/Documents/youdontneedthis-site
   GitHub: https://github.com/NicholasDemeter/youdontneedthis-site
   Role: Site code + build script + products.csv + generated HTML
   Key files: build.js, products.csv, dist/index.html
```

---

## HOW IMAGES GET FROM YOUR MAC TO THE WEBSITE

```
YOUR MAC
Local inventory folder
/Users/nicholasdemeter/Documents/youdontneedthis-inventory/LOT_002_.../Photos/LOT_002_01.jpg
   │
   │  [build.js reads this at build time]
   │
   ▼
build.js constructs a GitHub URL:
https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/main/LOT_002_.../Photos/LOT_002_01.jpg
   │
   │  [this URL is baked into dist/index.html]
   │
   ▼
Browser on youdontneedthis.us loads that URL directly from GitHub
   │
   │  ? ISSUE #1: Images confirmed at 200 (URL is valid, file is on GitHub)
   │  ? BUT: Images not rendering in browser on live site
   │  ? UNKNOWN: Whether this is CORS, browser security policy,
   │  ? GitHub rate limiting, or something else entirely
   │
   ▼
? Image appears on site (UNCONFIRMED AS OF JUNE 22, 2026)
```

---

## FOLDER MATCHING — HOW build.js FINDS YOUR PHOTOS

```
products.csv row:
LOT = "LOT_002"
FOLDER_NAME = "LOT_002_Microsoft_Surface_Studio_2_All_in_One_Desktop"

build.js matching logic (in order):
   1. Try exact FOLDER_NAME match against local inventory
      → "LOT_002_Microsoft_Surface_Studio_2_All_in_One_Desktop" exists? ✅ USE IT
   
   2. If no exact match, try PREFIX match:
      → Find any folder starting with "LOT_002_" ✅ USE IT
   
   3. If neither match:
      → Show placeholder image (grey "No Image Available" box)

CRITICAL RULES:
✅ Folder MUST have something after LOT_### → "LOT_002_anything" works
❌ "LOT_002" alone (no underscore after) → may not match
✅ Case insensitive matching
✅ Accepted photo formats: .jpg .jpeg .png .gif .webp
```

---

## CSS MODIFICATION RULES

**CRITICAL:** All CSS lives inside `build.js` as a template literal, NOT in `dist/index.html`.

```
CORRECT WORKFLOW:
1. Edit CSS inside build.js (around line 394-1242, inside the <style> tag)
2. Run: node build.js
3. Verify: open dist/index.html in browser
4. Commit both build.js AND dist/index.html
5. Push

NEVER:
- Edit CSS in dist/index.html directly (it's regenerated on every build)
- Add external .css files (entire site is single-file HTML)
```

**Mobile CSS Location:**
- Desktop styles: Lines ~394-1214 (main CSS block)
- Mobile overrides: Single `@media (max-width: 768px)` block at line ~1215
- Small phone overrides: `@media (max-width: 480px)` block (if present)

**The Rule:** Mobile CSS changes ONLY go in the @media blocks. Never scatter !important 
or mobile-specific rules in the main CSS block.

---

## WHAT LIVES WHERE IN THE SITE REPO

```
youdontneedthis-site/
│
├── build.js          ← THE ENGINE. Reads CSV + inventory, builds site. Never delete.
├── products.csv      ← SOURCE OF TRUTH #1. Replace with Google Sheets export.
├── CLAUDE.md         ← AI context file. Read by Claude Code automatically.
│
├── dist/
│   └── index.html   ← THE LIVE WEBSITE FILE. Generated by build.js. Never edit directly.
│
├── .github/
│   └── workflows/
│       └── deploy.yml ← Tells GitHub how to publish. Never delete.
│
├── CNAME             ← Contains "youdontneedthis.us". Never delete.
│
├── skills/           ← AI workflow guides
│   ├── SKILL-push.md
│   ├── SKILL-new-lot.md
│   ├── SKILL-verify-live.md
│   ├── SKILL-sync-check.md
│   └── SKILL-cleanup.md
│
└── [DEAD WEIGHT — ignore, schedule for deletion]
    ├── app/
    ├── components/
    ├── hooks/
    ├── lib/
    ├── types/
    ├── next.config.mjs
    ├── tsconfig.json
    ├── pnpm-lock.yaml
    ├── postcss.config.mjs
    ├── components.json
    ├── index.html (root, 622 bytes — NOT the live site)
    ├── styles.css (root)
    └── app.js (root)
```

---

## WHAT LIVES WHERE IN THE INVENTORY REPO

```
youdontneedthis-inventory/
│
├── Carousel_HERO/
│   └── Hero_Media.mp4     ← Background video on homepage. Never delete.
│
├── LOT_001_ITEM_NAME/
│   ├── LOT_001_THUMBNAIL.jpg   ← Must contain "THUMBNAIL" in name. In ROOT only.
│   ├── Photos/
│   │   ├── LOT_001_01.jpg      ← Sequential naming
│   │   ├── LOT_001_02.jpg
│   │   └── LOT_001_03.jpg      ← Minimum 3
│   └── Videos/
│       └── LOT_001_VIDEO_01.mp4
│
└── [more LOT folders...]
```

---

## KNOWN ISSUES AS OF JUNE 22, 2026

### ? ISSUE #1 — Images not rendering on live site (ACTIVE, UNRESOLVED)
**Symptoms:** Cards show alt text instead of photos. Hot items carousel shows text only.
**What we know:**
- build.js generates correct GitHub raw URLs ✅
- Images confirmed present on GitHub inventory repo (HTTP 200) ✅
- Local build works correctly ✅
- URLs are correctly baked into dist/index.html ✅
**What we don't know:**
- Why browser is not rendering images that return 200
- Whether this is CORS headers, GitHub rate limiting, or browser security policy
- Whether this was ever working or has always been broken
**Next diagnostic:** Check browser console errors on youdontneedthis.us (F12 → Console tab)

### ? ISSUE #2 — GitHub Actions workflow behavior
**What we know:**
- Workflow exists at .github/workflows/deploy.yml ✅
- Workflow triggers on push to main ✅
- Workflow deploys dist/ folder to GitHub Pages ✅
- Workflow does NOT run build.js (intentional — build happens locally) ✅
**What we don't know:**
- Whether previous workflow runs that DID run build.js corrupted anything

### ISSUE #3 — Inventory branch naming (LOW PRIORITY)
Local inventory branch is `master`, GitHub is `main`.
Push command: `git push origin master:main`
Functional but inconsistent. Rename when convenient.

---

## SITE FEATURES (confirmed working June 22, 2026)

| Feature | Status |
|---------|--------|
| Hero video (background) | ✅ Working |
| Hero copy (YOU DON'T / NEED THIS) | ✅ Working |
| Explore Collection dropdown (7 categories) | ✅ Working |
| Featured Items button | ✅ Working |
| Hot Items carousel (coolness ≥ 6) | ✅ Working (no images yet) |
| Product cards with copy | ✅ Working (no images yet) |
| Category filter (hide/show cards) | ✅ Working |
| Stars hidden on cards | ✅ Working |
| Hero stats block removed (100+, $2M+, 5★) | ✅ Working |
| WhatsApp contact button | ✅ Working |
| Modal gallery with photos | ? Untested (no images loading) |
| Modal gallery with videos | ? Untested |
| Mobile responsive layout | ? Untested |
| Thumbnail images on cards | ❌ NOT WORKING (active issue) |
| Photo gallery in modal | ❌ NOT WORKING (active issue) |

---

## VERIFICATION COMMANDS (copy-paste ready)

```bash
# Is correct build live?
curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"
# Expected: 0

# Are images loading? (counts placeholder text)
curl -s https://youdontneedthis.us | grep -c "No Image Available"
# Expected: 2-5 (only LOT_023 and LOT_064)
# If 100+: images broken

# Test specific image URL
curl -s -o /dev/null -w "%{http_code}" "https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/main/LOT_002_Microsoft_Surface_Studio_2_All_in_One_Desktop/LOT_002_THUMBNAIL.jpg"
# Expected: 200

# What commit is on GitHub?
curl -s https://api.github.com/repos/NicholasDemeter/youdontheedthis-site/commits/main | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['sha'][:7], d['commit']['message'])"

# Cache status
curl -s -I https://youdontneedthis.us | grep -i "age\|last-modified"
```

---

## ROOT CAUSE FOUND — June 22, 2026 (UPDATE)

### Why Images Were Never Loading — The Definitive Answer

**The CI/CD Problem (now understood and fixed):**

```
WHAT HAPPENED:
1. deploy.yml was created with a "node build.js" step
2. GitHub Actions checked out ONLY the site repo on its servers
3. ../youdontneedthis-inventory (sibling folder) does NOT exist on GitHub's servers
4. build.js ran in CI, found no inventory, generated 207 placeholders
5. That broken build was deployed — NOT our locally-built dist/index.html

THE FIX:
- Removed "node build.js" step from deploy.yml
- CI now deploys whatever dist/index.html is already committed
- build.js MUST always run locally (where inventory exists) before every push
- This is not a bug — it is the correct architecture going forward

CONFIRMED BY:
- Claude Code diagnostic June 22, 2026
- cache-busted curl showed 1 placeholder, 0 raw GitHub URLs, 0 PREMIUM ITEMS
- Previous deployments confirmed: April 22 was last good deploy before today
- All commits between April 22 and June 22 were never deployed (no deploy.yml existed)
```

**The Non-Negotiable Rule This Creates:**

```
BEFORE EVERY PUSH:
1. node build.js (locally, where inventory exists)
2. grep -c "No Image Available" dist/index.html → must be LOW (2-5 max)
3. ONLY THEN: git push origin main

NEVER:
- Push without rebuilding locally first
- Let GitHub Actions run build.js (it has no inventory access)
- Trust that a push = correct images on live site without verification
```

**Why This Was So Hard To Find:**
- deploy.yml didn't exist for 2 months → no deployments happened
- When we added deploy.yml WITH build step → first deploy used CI rebuild → placeholders
- Images at correct URLs (200 response) but wrong build was live
- Browser cache served April 22 build intermittently confusing diagnosis
