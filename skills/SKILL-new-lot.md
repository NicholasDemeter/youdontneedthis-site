# SKILL-new-lot.md
# YDNT — New Item Intake Workflow
# Save to: /Users/nicholasdemeter/Documents/youdontneedthis-site/skills/SKILL-new-lot.md

## OVERVIEW
This skill governs adding a new item to YDNT from raw photos/videos to live on site.
It involves THREE phases: Prep, Inventory, and Publish.
Never proceed to next phase without completing all gates in current phase.

---

## STAGING LOCATION
All new items start here before processing:
`/Users/nicholasdemeter/Desktop/YDNT_BACKUP/To Clean for YDNT`

---

## PHASE 1 — INTAKE ASSESSMENT (ask before touching anything)

### Step 1 — Scan staging folder
```bash
ls '/Users/nicholasdemeter/Desktop/YDNT_BACKUP/To Clean for YDNT'
```

### Step 2 — Check for duplicates against inventory repo
For EACH folder in staging, run:
```bash
ls /Users/nicholasdemeter/Documents/youdontneedthis-inventory | grep -i "KEYWORD"
```
Replace KEYWORD with distinctive word from staging folder name.

### Step 3 — ASK NICHOLAS before proceeding
For each item found, report:
- "LOT_XXX in staging appears to match LOT_YYY already in inventory ([name]). 
   Do you want to: (a) replace existing, (b) add as new LOT, or (c) skip?"
- NEVER assume. NEVER auto-merge. ALWAYS ask.

### Step 4 — Determine LOT number for genuinely new items
```bash
# Check current tail of products.csv
tail -5 /Users/nicholasdemeter/Documents/youdontneedthis-site/products.csv | cut -d',' -f1
```
Ask Nicholas: "The last LOT in products.csv is LOT_###. Should the new item be LOT_### 
(next in sequence) or fill a gap? Please confirm the LOT number."

---

## PHASE 2 — FOLDER COMPLIANCE

### Step 1 — Create compliant folder structure
```bash
mkdir -p "/Users/nicholasdemeter/Documents/youdontneedthis-inventory/LOT_###_ITEM_NAME/Photos"
mkdir -p "/Users/nicholasdemeter/Documents/youdontneedthis-inventory/LOT_###_ITEM_NAME/Videos"
```
Folder naming rules:
- Must start with `LOT_###_` (3-digit zero-padded number + underscore)
- Use underscores not spaces
- Keep it descriptive but not too long

### Step 2 — Move and rename photos
Move all photos to `Photos/` subfolder.
Rename sequentially:
- `LOT_###_01.jpg`
- `LOT_###_02.jpg`
- `LOT_###_03.jpg` (minimum 3 photos required)

Accepted formats: `.jpg .jpeg .png .gif .webp`
Convert any other formats before adding.

### Step 3 — Move and rename videos (if any)
Move all videos to `Videos/` subfolder.
Rename:
- `LOT_###_VIDEO_01.mp4`
- `LOT_###_VIDEO_02.mp4`

Accepted formats: `.mp4 .mov .webm`
Convert `.mov` to `.mp4` where possible for compatibility.

### Step 4 — Create thumbnail
Best photo from the set becomes the thumbnail.
Place in LOT ROOT (not in Photos subfolder).
Name: `LOT_###_THUMBNAIL.jpg`
Target size: under 200KB

### Step 5 — Compress all files
Thumbnails: 100KB–200KB (not larger than 200KB, not smaller than 100KB)
Photos: 300KB–400KB each (not larger than 400KB, not smaller than 300KB)
Videos: under 10MB each

Use Claude Code with ImageMagick or ffmpeg:
```bash
# Compress photos
mogrify -resize 1200x1200\> -quality 85 "Photos/*.jpg"

# Compress thumbnail  
convert "LOT_###_THUMBNAIL.jpg" -resize 800x800\> -quality 85 "LOT_###_THUMBNAIL.jpg"

# Compress videos (if ffmpeg available)
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -crf 28 output.mp4
```

### Step 6 — Verify compliance
```bash
ls LOT_###_ITEM_NAME/           # should show THUMBNAIL + Photos/ + Videos/
ls LOT_###_ITEM_NAME/Photos/    # should show 3+ images
ls LOT_###_ITEM_NAME/Videos/    # empty is OK
```

---

## PHASE 3 — COPY AND CSV POPULATION

### Step 1 — Research item (Claude.ai session, not Claude Code)
Open claude.ai and provide:
- Item name / model number
- Any Amazon/eBay/manufacturer links you have
- Photos if helpful for identification

Ask Claude to find:
- Official product name
- Full specifications
- Current market price (Amazon/eBay)
- Product description (match tone of existing items — witty, direct)
- Category (must match one of the 7 dropdown categories exactly)

### Step 2 — Questions Claude will always ask Nicholas
These cannot be automated — Nicholas must answer:
1. "What price do you want to list this at?"
2. "Which category? [list the 7 options]"
3. "What's your coolness rating? (1-10, items rated 6+ appear in Hot Items carousel)"
4. "Do you have a reference URL for price comparison? (Amazon/eBay preferred)"

### Step 3 — Update Google Sheet
Add new row to products Google Sheet:
https://docs.google.com/spreadsheets/d/17OHlKS3aTwR0ane3qJefjXm6SPHpI6KqYO0Qg4jFyvk/

Column order (must match exactly):
LOT, FOLDER_NAME, OFFICIAL_NAME, COOLNESS_RATING, TAGLINE, DESCRIPTION, 
SPECIFICATIONS, PRICE, CATEGORY, PRICE ESTIMATE HYPERLINKS

FOLDER_NAME must match EXACTLY the folder name in inventory repo.
Category must be one of the 7 exact strings in DROPDOWN_CATEGORIES in build.js.

### Step 4 — Download and replace products.csv
File → Download → Comma Separated Values
Replace: `/Users/nicholasdemeter/Documents/youdontneedthis-site/products.csv`

### Step 5 — Remove sold items
Before downloading, verify sold items are deleted from Google Sheet.
Corresponding LOT folders should also be removed from inventory repo.

---

## PRE-PUSH PROTOCOL (run before SKILL-push.md, every time)

Before touching git, produce an inline review list for Nicholas covering ALL of the following.
Do not skip straight to pushing on the assumption a step is "probably fine" — verify each item
with an actual command, not from memory of what you intended to do.

1. **New LOT folder names** — list every new LOT_### folder created in the inventory repo this session.
2. **New LOT folders — thumbnail + photo names and sizes** — for each new folder, list the thumbnail
   filename/size and every photo filename/size. Confirm each is in range (100-200KB thumbnail,
   300-400KB photo) with an actual `du -k` check, not an assumption from the compression command's exit code.
3. **New images added to existing LOTs** — for any staging photos merged into already-existing LOT
   folders (supplemental photos, placeholder replacements), list filenames/sizes added. Note explicitly
   if any pre-existing photos in that folder are still out of range — that's a separate cleanup
   (SKILL-cleanup.md), not something to silently fix or silently ignore.
4. **New items added to products.csv** — list every new LOT row added (LOT, FOLDER_NAME, PRICE, CATEGORY).
   Verify with a CSV-aware parser (python `csv` module, not `cut -d','`) since description/tagline fields
   contain embedded commas that break naive column splitting.
5. **products.csv integrity check** — after any edit (sed, heredoc append, manual append), reparse the
   whole file with `csv.DictReader` and confirm: total row count is sane, zero duplicate LOT values,
   and every new LOT appears exactly once. A file missing a trailing newline before an append will silently
   merge the last existing row with the first appended row — this will NOT show up in a quick `grep`,
   only in a full CSV-aware reparse.
6. **FOLDER_NAME -> folder existence check** — for every LOT touched, confirm `FOLDER_NAME` in the CSV
   points to a folder that actually exists in the inventory repo.

Only after all 6 are confirmed clean and the list has been shown to Nicholas for review should you
proceed to SKILL-push.md.

---

## PHASE 4 — PUSH (follow SKILL-push.md)

After phases 1-3 and the PRE-PUSH PROTOCOL above are complete:
1. Push inventory repo first (new LOT folder)
2. Run node build.js locally
3. Verify locally (grep -c "No Image Available" dist/index.html should be low)
4. Push site repo
5. Verify live site

---

## KNOWN GOTCHAS

- FOLDER_NAME in CSV should match the inventory folder name character for character, but this is not strict for image loading: build.js tries an exact FOLDER_NAME match first, then falls back to scanning for any folder starting with `LOT_###_` if that fails. Only the `LOT_###_` prefix is required for the backend to find images — everything after it is cosmetic for matching purposes, but still matters for keeping FOLDER_NAME accurate for anyone reading the CSV, and for lot card/page content correctness
- Category string must match EXACTLY — copy from build.js DROPDOWN_CATEGORIES array
- Minimum 3 photos per LOT or card looks sparse
- Thumbnails must land between 100KB and 200KB; photos between 300KB and 400KB — too-aggressive compression (undershooting the lower bound) is also a compliance failure, not just oversized files
- Thumbnail must be in LOT ROOT not in Photos/ subfolder
- Videos are supported in modal gallery but add to page weight — keep under 10MB
- LOT numbers are never reused once deleted (to avoid ghost data)
- .DS_Store files will appear in folders on Mac — they are harmless but don't commit them

---

## THE 7 VALID CATEGORIES (copy exactly)
1. `Computers | Monitors | Office | Peripherals`
2. `Photography | Videography | Related`
3. `State-of-the-Art`
4. `Motorcycle | Camping | Outdoor`
5. `Audiophile | Hi-Fidelity | Sound`
6. `Security | Data | Surveillance`
7. `Jewelery | Bags | Leather`
