# SKILL-sync-check.md
# YDNT — Three Sources of Truth Sync Check
# Save to: /Users/nicholasdemeter/Documents/youdontneedthis-site/skills/SKILL-sync-check.md

## DRAFT STATUS — June 22, 2026
## This skill is complete and not contingent on the image loading issue.
## Run this at the START of every session before touching anything.

---

## THE THREE SOURCES OF TRUTH
1. Google Sheets → products.csv → site repo
2. youdontneedthis-inventory repo (local + GitHub)
3. dist/index.html (built from 1+2, served by GitHub Pages)

All three must align. If any one is out of sync, the site shows wrong content.

---

## SESSION START — RUN THESE EVERY TIME

```bash
# 1. Site repo local status
git -C /Users/nicholasdemeter/Documents/youdontneedthis-site status

# 2. Inventory repo local status  
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory status

# 3. What's live on GitHub site repo
curl -s https://api.github.com/repos/NicholasDemeter/youdontneedthis-site/commits/main | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['sha'][:7], d['commit']['message'])"

# 4. Is live site current
curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"
```

Interpret results:
- Site repo shows modified files = uncommitted local changes exist
- Inventory repo shows modified files = unpushed inventory changes exist  
- GitHub commit doesn't match local = local ahead or behind GitHub
- curl returns 2 = old build is live

---

## FULL SYNC CHECK — RUN BEFORE ANY PUSH

### Check 1 — Local vs GitHub (site repo)
```bash
git -C /Users/nicholasdemeter/Documents/youdontneedthis-site diff origin/main --name-only
```
Empty output = in sync. Files listed = local has changes not on GitHub.

### Check 2 — Local vs GitHub (inventory repo)
```bash
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory fetch origin
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory log --oneline master...origin/main
```
Empty output = in sync. Commits listed = diverged (needs resolution).

### Check 3 — CSV vs inventory folders
```bash
# How many LOTs in CSV?
tail -n +2 /Users/nicholasdemeter/Documents/youdontneedthis-site/products.csv | grep -c "^LOT_"

# How many LOT folders in inventory?
ls /Users/nicholasdemeter/Documents/youdontneedthis-inventory | grep -c "^LOT_"
```
Numbers don't need to match exactly (some LOTs may have no folder yet)
BUT: any LOT in CSV without a folder = panel with no images on live site

### Check 4 — Find LOTs in CSV with no inventory folder
```bash
node -e "
const fs = require('fs');
const path = require('path');
const csv = fs.readFileSync('/Users/nicholasdemeter/Documents/youdontneedthis-site/products.csv', 'utf-8');
const inv = '/Users/nicholasdemeter/Documents/youdontneedthis-inventory';
const lines = csv.trim().split('\n').slice(1);
const invFolders = fs.readdirSync(inv);
const missing = [];
lines.forEach(line => {
  const lot = line.split(',')[0].trim();
  if (!lot.startsWith('LOT_')) return;
  const num = lot.match(/LOT_(\d+)/)?.[1];
  if (!num) return;
  const found = invFolders.find(f => f.toUpperCase().startsWith('LOT_' + num + '_'));
  if (!found) missing.push(lot);
});
console.log('LOTs in CSV with no inventory folder:', missing.length);
console.log(missing.join('\n'));
"
```
These LOTs will show panels with no images. Expected: LOT_023, LOT_064.
Any others = either missing photos or naming mismatch.

### Check 5 — FOLDER_NAME column integrity
```bash
node -e "
const fs = require('fs');
const csv = fs.readFileSync('/Users/nicholasdemeter/Documents/youdontneedthis-site/products.csv', 'utf-8');
const lines = csv.trim().split('\n');
const headers = lines[0].split(',');
const folderIdx = headers.indexOf('FOLDER_NAME');
const inv = '/Users/nicholasdemeter/Documents/youdontneedthis-inventory';
const invFolders = fs.readdirSync(inv);
let mismatches = 0;
lines.slice(1).forEach(line => {
  const vals = line.split(',');
  const folderName = vals[folderIdx]?.trim().replace(/^\"|\"$/g,'');
  if (!folderName) return;
  const exact = invFolders.includes(folderName);
  if (!exact) { console.log('MISMATCH:', folderName); mismatches++; }
});
console.log('Total mismatches:', mismatches);
"
```
Any mismatch = that LOT will fall back to prefix matching (usually OK but worth knowing).

---

## INTERPRETING RESULTS

| Situation | Action |
|-----------|--------|
| Everything in sync | Proceed with push |
| Site repo has uncommitted changes | Review, commit or discard |
| Inventory diverged from GitHub | Check which is newer, push or force push |
| LOTs missing from inventory | Note them — panels will show no images |
| FOLDER_NAME mismatches | Not blocking but flag for cleanup |
| Live site showing old build | Wait for cache expiry (10 min max) |

---

## KNOWN PERMANENT EXCEPTIONS
- LOT_023 (DEVALIET EARDRUM SPECIAL) — no inventory folder, remove from CSV when ready
- LOT_064 (PrinCube) — no inventory folder, remove from CSV when ready
- Inventory local branch is `master`, GitHub is `main` — this is normal, use `push origin master:main`
- .DS_Store always shows as modified in site repo — ignore it, never commit it
