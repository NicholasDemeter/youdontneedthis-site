# SKILL-new-lot.md
# YDNT — New Item Intake (raw photos → live on site)

## SELF-CORRECTION RULE
If anything (a folder, a column, a count, a path) doesn't match this skill or
ARCHITECTURE.md, STOP and ask Nicholas. If a document is wrong, propose the fix and
update it with approval in the same session.

## NEVER ASSUME
Never auto-assign a LOT number, auto-merge a duplicate, or invent price/category/specs.
Those are Nicholas's decisions. Ask.

## STAGING LOCATION
Raw items start here: `~/Documents/YDNT_HERMES_Agent_Folder/LOTS_to_be_Cleaned`

---

## PHASE 1 — INTAKE ASSESSMENT (ask before touching anything)

1. Scan staging:
```bash
ls "$HOME/Documents/YDNT_HERMES_Agent_Folder/LOTS_to_be_Cleaned"
```
2. Check each staged item against existing inventory for duplicates:
```bash
ls ~/Documents/youdontneedthis-inventory | grep -i "KEYWORD"   # distinctive word from the item
```
3. For anything that looks like a match, ask Nicholas: replace existing / add as new LOT / skip.
4. Determine the LOT number for genuinely new items. Find the current highest:
```bash
python3 -c "
import csv, re, os
rows=list(csv.DictReader(open(os.path.expanduser('~/Documents/youdontneedthis-site/products.csv'))))
nums=sorted(int(re.match(r'LOT_(\d+)',r['LOT']).group(1)) for r in rows if re.match(r'LOT_(\d+)',r['LOT']))
print('highest LOT:', f'LOT_{nums[-1]:03d}' if nums else 'none')
"
```
Ask Nicholas to confirm the new number (next in sequence, or fill a gap). LOT numbers are
never reused once retired.

---

## PHASE 2 — BUILD THE INVENTORY FOLDER

The ONLY hard rule for matching: the folder name must start with `LOT_###_` —
capital LOT, three zero-padded digits, underscore. Everything after is for humans and is
ignored by the code. Seed the readable part from the item's official name, sanitized
(spaces → underscores, strip quotes/slashes/apostrophes and other illegal characters).

```bash
LOT="LOT_###_Sanitized_Official_Name"
mkdir -p ~/Documents/youdontneedthis-inventory/"$LOT"/Photos
mkdir -p ~/Documents/youdontneedthis-inventory/"$LOT"/Videos   # optional; fine if left empty
```

Move and rename photos into Photos/, sequential and natural-sorting:
`LOT_###_01.jpg`, `LOT_###_02.jpg`, ... (minimum 3 recommended).
Accepted images: .jpg .jpeg .png .gif .webp — convert anything else first.

Videos (if any) go in Videos/, e.g. `LOT_###_VIDEO_01.mp4`.
Accepted: .mp4 .mov .webm — prefer .mp4. (build.js appends videos to the gallery.)

Thumbnail: derive it from the FIRST photo by natural sort — i.e. LOT_###_01 (the file
that sorts to the top of Photos/ by name, NOT a subjective "best" pick). Copy that first
photo, compress it to thumbnail size, place the copy in the folder ROOT (not Photos/), and
name it so it contains the word THUMBNAIL, e.g. `LOT_###_THUMBNAIL.jpg`.

Why first-by-name and not "best": the card shows the THUMBNAIL file; the LOT page gallery
leads with the first photo in Photos/. Deriving the thumbnail from that same first photo
keeps the card and the LOT page's opening image consistent. "Best" is subjective and not
reproducible — always use the natural-sort first photo.

---

## PHASE 3 — COMPRESS TO STANDARD (see SKILL-cleanup.md for the batch tooling)

| File | Target size |
|------|-------------|
| Thumbnail | 100KB–200KB |
| Each photo | 300KB–400KB |
| Each video | under 10MB |

Under-compressing (below the lower bound) is also a compliance miss, not just oversize.

Verify compliance:
```bash
ls ~/Documents/youdontneedthis-inventory/"$LOT"/           # THUMBNAIL + Photos/ (+ Videos/)
ls ~/Documents/youdontneedthis-inventory/"$LOT"/Photos/    # the images
```

---

## PHASE 4 — RESEARCH COPY & DELIVER THE CSV ROW

Research the item (official name, specs, market price, a witty on-brand description, a
reference URL). Assemble ONE row matching the CSV's 10 columns IN THIS EXACT ORDER:

```
LOT, OFFICIAL_NAME, COOLNESS_RATING, TAGLINE, DESCRIPTION,
SPECIFICATIONS, PRICE, CATEGORY, PRICE ESTIMATE HYPERLINKS, SUBCATEGORY
```

There is NO FOLDER_NAME column — do not add one. The LOT id (column A) is the only link
to the folder.

Nicholas must supply (do not guess): PRICE, CATEGORY, COOLNESS_RATING (items rated 6 appear
in Featured), reference URL, and SUBCATEGORY if the item belongs to a special section. ASK
for these before assembling the row — do not invent them.

CATEGORY values populate the dropdown dynamically — reuse an existing category string when
the item fits one. Check current values:
```bash
python3 -c "import csv,collections,os;print('\n'.join(sorted(set(r['CATEGORY'] for r in csv.DictReader(open(os.path.expanduser('~/Documents/youdontneedthis-site/products.csv')))))))"
```
SUBCATEGORY only matters for special on-site sections; the two the build groups are
`Portable Workstations` and `Coolest Gadgets` — match exactly to land in those sections.

### YOU CANNOT EDIT THE GOOGLE SHEET — deliver a Google Apps Script instead
The master data lives in a Google Sheet that you have NO access to. You therefore must NOT
try to edit it, and editing the local products.csv directly is not the workflow (it would be
overwritten on the next Sheet export). Instead, produce a Google Apps Script that Nicholas
runs from the Sheet (Extensions → Apps Script → paste → Run) to append the new row. Template:

```javascript
function addNewLot() {
  // Appends one new YDNT product row. Review the values before running.
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = [
    "LOT_###",                 // LOT  (must match the inventory folder prefix exactly)
    "Official Product Name",   // OFFICIAL_NAME
    "5",                       // COOLNESS_RATING  (Nicholas-supplied; 6 = Featured)
    "Cheeky one-line tagline", // TAGLINE
    "Witty on-brand description explaining why you do NOT need this.", // DESCRIPTION
    "Spec | value | Spec | value", // SPECIFICATIONS
    "$0",                      // PRICE  (Nicholas-supplied)
    "Category",                // CATEGORY  (Nicholas-supplied; reuse existing string)
    "https://reference-url",   // PRICE ESTIMATE HYPERLINKS
    ""                         // SUBCATEGORY  (blank, or Portable Workstations / Coolest Gadgets)
  ];
  sheet.appendRow(row);
}
```

Fill every value, show the completed script to Nicholas, and STOP. Nicholas runs it, then
downloads the updated Sheet as CSV and replaces ~/Documents/youdontneedthis-site/products.csv.
Only after that replacement do you rebuild and push (SKILL-push.md). Do NOT proceed to build
until Nicholas confirms the Sheet is updated and the new CSV is in place.

---

## PRE-PUSH PROTOCOL (verify with real commands, not from memory)

Before any git action, produce a review list for Nicholas:

1. New LOT folder name(s) created this session.
2. For each: thumbnail filename + size, every photo filename + size — confirm ranges with
   an actual `du -k`, not the compression command's exit status.
3. Any photos added to pre-existing folders: filenames + sizes; note any pre-existing files
   still out of range (that's a separate SKILL-cleanup pass, not a silent fix).
4. New CSV rows added (LOT, OFFICIAL_NAME, PRICE, CATEGORY, SUBCATEGORY).
5. Full-file CSV integrity, parsed with a CSV-aware tool (commas live inside fields):
```bash
python3 -c "
import csv, os
rows=list(csv.DictReader(open(os.path.expanduser('~/Documents/youdontneedthis-site/products.csv'))))
lots=[r['LOT'].strip() for r in rows]
dupes=[l for l in set(lots) if lots.count(l)>1]
print('total rows:', len(rows))
print('duplicate LOTs:', dupes or 'none')
print('columns:', list(rows[0].keys()))
"
```
   A file missing a trailing newline before an append silently merges two rows — this only
   shows up in a full parse, not a grep. Confirm row count is sane and no duplicate LOTs.
6. Folder existence: for every new/edited LOT, confirm an inventory folder starts with its
   `LOT_###_`.

Only after all six are clean and shown to Nicholas, proceed to SKILL-push.md.

---

## NOTES
- Minimum 3 photos keeps a card from looking sparse.
- Thumbnail must stay in the folder ROOT and contain "THUMBNAIL".
- Remove sold items from the Sheet and delete their inventory folder (don't reuse the LOT).
- .DS_Store appears on Mac; never commit it.
