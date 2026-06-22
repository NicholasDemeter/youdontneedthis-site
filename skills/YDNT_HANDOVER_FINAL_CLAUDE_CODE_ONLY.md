# YDNT Handover Document — FINAL
# Date: June 22, 2026
# Outgoing: Claude Sonnet 4.6 (long session, context near limit)
# Incoming: New Claude session
# Human: Nicholas Demeter (Skibidi), Kampala Uganda, vibe coder

---

## READ THIS ENTIRE DOCUMENT BEFORE RESPONDING. NO EXCEPTIONS.
## YOUR FIRST ACTION IS THE SESSION START COMMANDS AT THE BOTTOM. NOTHING ELSE.

---

## WISHES — STATUS

1. ✅ Push local repos to GitHub — DONE
2. ✅ Site updates with changes — DONE (images loading, dropdown working partially)
3. ✅ Skills documented — DONE (see files list below)

---

## WHAT WAS ACCOMPLISHED TODAY (June 22, 2026)

### Inventory repo — FIXED
- Was diverged: local on `master`, GitHub on `main`
- Force pushed local to GitHub: `git push origin master:main --force`
- Local inventory is ground truth

### Site repo — REBUILT AND DEPLOYED
- Ran `node build.js` locally
- Removed hero stats block (100+, $2M+, 5★) — confirmed gone
- Stars hidden on cards via CSS `display: none`
- Category dropdown working (partial — see open issue below)
- Committed and pushed: `8eb2b28`

### GitHub Actions workflow — CREATED AND FIXED
- Created `.github/workflows/deploy.yml`
- First version had `node build.js` step — WRONG (GitHub servers have no inventory access)
- Removed build step — workflow now deploys pre-built `dist/` folder as-is
- Final commit: `1f84d4b` — green deployment confirmed
- Images now loading on live site ✅

### ROOT CAUSE OF IMAGE FAILURE (resolved)
The deploy.yml workflow was running `node build.js` on GitHub's servers.
GitHub Actions only checks out the site repo — the sibling inventory folder
`../youdontneedthis-inventory` does NOT exist on GitHub's servers.
So build.js generated 207 placeholder images instead of real ones.
Fix: removed build step from workflow. Build MUST happen locally before every push.

### Skills files created
All saved to `/mnt/user-data/outputs/` — Nicholas has downloaded them:
- `CLAUDE.md` → site repo root
- `CLAUDE-inventory.md` → inventory repo root (rename to CLAUDE.md)
- `skills/README.md` → skills cover page and status table
- `skills/SKILL-push.md` → complete push workflow ✅ verified
- `skills/SKILL-new-lot.md` → new item intake ⚠️ draft, untested
- `skills/SKILL-sync-check.md` → session start checklist ✅ verified
- `skills/SKILL-verify-live.md` → live site verification ✅ verified
- `skills/SKILL-cleanup.md` → file compression/naming ⚠️ draft, untested
- `YDNT-site-mechanics.md` → full technical schematic ✅ complete
- `YDNT-site-mechanics-plain.md` → plain language version ✅ (in repo root, move to skills/)

---

## OPEN ISSUES (your job, incoming agent)

### ISSUE #1 — Dropdown filter not working for all categories (ACTIVE)
**Symptoms:** Some category filters show no results or wrong results
**Root cause (diagnosed, not yet fixed):**
Category strings in `products.csv` must EXACTLY match the 7 strings in
`DROPDOWN_CATEGORIES` array in `build.js`. Any mismatch = item invisible when filtered.
**Known mismatches suspected:**
- `Studio | Party | Music` — NOT in dropdown categories array
- Possible spelling variations in CSV vs code
**Fix:** Run this diagnostic in Claude Code first:
```
Read CLAUDE.md first. Then run this diagnostic only — do not change anything:
Check how many products in products.csv have a CATEGORY value that does NOT exactly 
match one of the 7 strings in the DROPDOWN_CATEGORIES array in build.js.
List the mismatched category values and how many products have each one.
```
Then either: (a) fix CSV categories to match code, or (b) add missing categories to build.js

### ISSUE #2 — Dead weight in site repo (LOW PRIORITY, safe to defer)
Confirmed unnecessary files (do NOT delete CNAME or .github/):
- `app/` `components/` `hooks/` `lib/` `styles/` `types/` `public/`
- `next.config.mjs` `postcss.config.mjs` `components.json` `tsconfig.json`
- `package.json` `pnpm-lock.yaml`
- Root `app.js` `index.html` (622 bytes) `styles.css`
Safe deletion prompt for Claude Code:
```
Delete only these specific files and folders, nothing else:
app/ components/ hooks/ lib/ types/ styles/ public/
next.config.mjs postcss.config.mjs components.json tsconfig.json package.json pnpm-lock.yaml
app.js index.html styles.css
Do NOT touch: build.js products.csv dist/ .github/ CNAME CLAUDE.md skills/
List what you will delete and wait for my confirmation before proceeding.
```

### ISSUE #3 — New LOT intake (NEXT MAJOR WORKSTREAM)
Staging location: `/Users/nicholasdemeter/Desktop/YDNT_BACKUP/To Clean for YDNT`
Contents:
- 7 DUPLICATES (already in inventory): LOT_007, 046, 052, 069, 108, 111, 125
- 5 GENUINELY NEW: LOT_129, 130, 131, 132, 133
Use SKILL-new-lot.md. Start with duplicate detection before touching anything.
First prompt:
```
Read CLAUDE.md and skills/SKILL-new-lot.md.
Scan /Users/nicholasdemeter/Desktop/YDNT_BACKUP/To Clean for YDNT
and compare against /Users/nicholasdemeter/Documents/youdontneedthis-inventory.
Report duplicates and new items. Do not move or rename anything yet.
```

### ISSUE #4 — Inventory branch naming (COSMETIC, LOW PRIORITY)
Local branch: `master` / GitHub: `main`
Always push with: `git push origin master:main`
Fix when convenient: `git branch -m master main && git push origin -u main`

---

## ARCHITECTURE — GROUND TRUTH

### The Food Truck Analogy
- Menu = `products.csv` (from Google Sheets)
- Kitchen = `youdontneedthis-inventory` repo
- Printer = `build.js` (runs LOCALLY, never on GitHub)
- Window = `dist/index.html` served by GitHub Pages

### Repo locations
- Site: `/Users/nicholasdemeter/Documents/youdontneedthis-site`
- Inventory: `/Users/nicholasdemeter/Documents/youdontneedthis-inventory`
- MUST be siblings in Documents/ — build.js resolves `../youdontneedthis-inventory`

### GitHub
- Site: https://github.com/NicholasDemeter/youdontneedthis-site
- Inventory: https://github.com/NicholasDemeter/youdontneedthis-inventory
- Live: https://youdontneedthis.us

### The ONLY correct update workflow
```
1. Edit Google Sheet
2. Download → replace products.csv in site repo
3. cd /Users/nicholasdemeter/Documents/youdontneedthis-site
4. node build.js  ← LOCAL ONLY. NEVER skip.
5. grep -c "No Image Available" dist/index.html  ← must be LOW (2-5 max)
6. open dist/index.html  ← verify locally in browser
7. git add dist/index.html products.csv
8. git commit -m "description"
9. git push origin main
10. Wait 2-3 min
11. curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"  ← must be 0
12. curl -s https://youdontneedthis.us | grep -c "No Image Available"  ← must be 2-5
```

### Critical matching rules
- LOT format: `LOT_###` (3 digits, zero-padded)
- Folder MUST have content after number: `LOT_069_anything` ✅
- Photos: in `Photos/` subfolder only
- Thumbnail: file with "THUMBNAIL" anywhere in name, in LOT root
- Extensions: `.jpg .jpeg .png .gif .webp` (case insensitive)
- Videos: in `Videos/` subfolder, `.mp4 .mov .webm`

### Golden rules
1. Not in products.csv → not on site
2. In CSV, no matching folder → panel with no images
3. Local ≠ GitHub → site shows wrong content
4. Pushing inventory alone → does NOT update site
5. build.js on GitHub servers → placeholder images (NO inventory access)
6. NEVER edit dist/index.html directly

### The 7 valid dropdown categories (exact strings — copy precisely)
1. `Computers | Monitors | Office | Peripherals`
2. `Photography | Videography | Related`
3. `State-of-the-Art`
4. `Motorcycle | Camping | Outdoor`
5. `Audiophile | Hi-Fidelity | Sound`
6. `Security | Data | Surveillance`
7. `Jewelery | Bags | Leather`

### Known permanent exceptions
- LOT_023 (DEVALIET) — no folder, shows placeholder. Remove from CSV when ready.
- LOT_064 (PrinCube) — no folder, shows placeholder. Remove from CSV when ready.
- `Studio | Party | Music` category in CSV — NOT in dropdown, items invisible when filtered
- CNAME file — keep forever, do not delete
- .DS_Store — always shows modified, never commit it

---

## NEVER DO THESE THINGS

- Run `node build.js` on GitHub's servers or in any CI step
- Delete `CNAME` or `.github/workflows/deploy.yml`
- Edit `dist/index.html` directly
- Push without running build.js locally first
- Trust browser cache — always use curl
- Make assumptions about LOT numbers, categories, or pricing — ask Nicholas
- Delete Next.js dead weight without explicit confirmation from Nicholas first

---

## VERIFICATION COMMANDS (copy-paste ready)

```bash
# Session start — run all three
git -C /Users/nicholasdemeter/Documents/youdontneedthis-site status
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory status
curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"

# Is correct build live? (expect 0)
curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"

# Are images loading? (expect 2-5)
curl -s https://youdontneedthis.us | grep -c "No Image Available"

# What commit is on GitHub?
curl -s https://api.github.com/repos/NicholasDemeter/youdontneedthis-site/commits/main | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['sha'][:7], d['commit']['message'])"

# Push inventory
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory push origin master:main

# If inventory push rejected
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory push origin master:main --force

# If site push rejected (unstaged changes)
git stash push -m "temp" && git pull --rebase origin main && git push origin main && git stash pop

# Test specific image URL (expect 200)
curl -s -o /dev/null -w "%{http_code}" "https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/main/LOT_002_Microsoft_Surface_Studio_2_All_in_One_Desktop/LOT_002_THUMBNAIL.jpg"
```

---

## YOUR FIRST ACTIONS AS INCOMING AGENT

DO THESE IN ORDER. DO NOT SKIP. DO NOT PROCEED WITHOUT OUTPUT FROM EACH.

```bash
# 1. Site repo status
git -C /Users/nicholasdemeter/Documents/youdontneedthis-site status

# 2. Inventory repo status
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory status

# 3. Is correct build live?
curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"

# 4. Are images loading?
curl -s https://youdontneedthis.us | grep -c "No Image Available"
```

Report results to Nicholas before taking any action.
Expected: site repo clean or only .DS_Store modified | inventory clean | curl returns 0 | curl returns 2-5

If anything unexpected — STOP and report. Do not assume. Do not fix without asking.

---

## NICHOLAS'S WORKING STYLE (respect this)

- Vibe coder — no traditional programming background
- Uses precise terminology when guided (ship, deploy, build, repo, stack)
- Demands N/S (necessary and sufficient) validation before action
- Fail-fast — identify problems early, not after 2 hours of wrong assumptions
- Never trust "definitive" pronouncements — verify everything with output
- Ask one question at a time when clarification needed
- No "groundhog day" — document everything so next session starts informed
- WhatsApp: 256780923638 (for site contact button context only)
