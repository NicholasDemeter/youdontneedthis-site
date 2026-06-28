# SKILL-sync-check.md
# YDNT — Session Start & Sync Check
# Run at the START of every session, before touching anything.

## SELF-CORRECTION RULE
If any result below is inconsistent with what this skill or ARCHITECTURE.md describes,
STOP and ask Nicholas. If the cause is a stale/incorrect document, propose the exact fix
and update the source of truth with approval — same session.

---

## THE THREE THINGS THAT MUST AGREE
1. products.csv (site repo)        — what items exist and their data
2. inventory folders (inventory repo) — the media for those items
3. dist/index.html (built, served)  — the page, built from 1 + 2

If these drift apart, the live site shows wrong or imageless content.

---

## SESSION START — RUN EVERY TIME

```bash
# 1. Site repo status
git -C ~/Documents/youdontneedthis-site status

# 2. Inventory repo status
git -C ~/Documents/youdontneedthis-inventory status

# 3. What commit is live on GitHub (site repo)
curl -s https://api.github.com/repos/NicholasDemeter/youdontneedthis-site/commits/main \
 | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['sha'][:7], d['commit']['message'])"

# 4. Is the current build live (not a stale cache)?
curl -s https://youdontneedthis.us | grep -c "PREMIUM ITEMS\|hero-stats"
#   0 = current build is live.  non-zero = older cache; wait and retry.
```

Report the four results to Nicholas, then wait for the task. Do not act yet.

---

## FULL SYNC CHECK — RUN BEFORE ANY PUSH

### Check 1 — local vs GitHub (site repo)
```bash
git -C ~/Documents/youdontneedthis-site diff origin/main --name-only
```
Empty = in sync. Files listed = local has unpushed changes.

### Check 2 — local vs GitHub (inventory repo)
```bash
git -C ~/Documents/youdontneedthis-inventory fetch origin
git -C ~/Documents/youdontneedthis-inventory log --oneline master...origin/main
```
Empty = in sync. Commits listed = diverged; resolve before pushing.

### Check 3 — CSV item count vs inventory folder count
```bash
# LOTs in the CSV (uses a real CSV parser; fields contain commas)
python3 -c "import csv;print(sum(1 for r in csv.DictReader(open('$HOME/Documents/youdontneedthis-site/products.csv')) if r['LOT'].strip().startswith('LOT_')))"

# LOT folders in inventory
ls ~/Documents/youdontneedthis-inventory | grep -c '^LOT_'
```
They need not be equal (an item can lack a folder), but every CSV LOT without a folder
will render with no images on the live site. Use Check 4 to list them.

### Check 4 — which CSV items have NO matching inventory folder
```bash
python3 -c "
import csv, os, re
csv_path = os.path.expanduser('~/Documents/youdontneedthis-site/products.csv')
inv = os.path.expanduser('~/Documents/youdontneedthis-inventory')
folders = [f for f in os.listdir(inv) if f.upper().startswith('LOT_')]
missing = []
for r in csv.DictReader(open(csv_path)):
    lot = r['LOT'].strip()
    m = re.match(r'LOT_(\d+)', lot)
    if not m: continue
    num = m.group(1)
    if not any(f.upper().startswith(f'LOT_{num}_') for f in folders):
        missing.append(lot)
print('CSV items with no inventory folder:', len(missing))
print('\n'.join(missing))
"
```
There is no "expected" list of missing folders. Whatever appears here is the current,
real set of items that will show placeholders. For each, the fix is either add the
folder (SKILL-new-lot.md) or remove the row from the CSV. Report the list to Nicholas;
do not assume any of them are "known/acceptable."

---

## INTERPRETING RESULTS

| Situation | Action |
|-----------|--------|
| Everything in sync | Proceed |
| Site repo has uncommitted changes | Review with Nicholas; commit or discard |
| Inventory diverged from GitHub | Determine which is newer before pushing |
| CSV items missing folders (Check 4) | Report the list; add folders or remove rows |
| Live site on old build | Wait for cache (a few minutes), recheck |
| .DS_Store shows as modified | Normal; never commit it |
