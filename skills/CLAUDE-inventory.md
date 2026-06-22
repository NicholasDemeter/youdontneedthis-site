# YDNT Inventory Repo — Claude Context File
# Place this file at: /Users/nicholasdemeter/Documents/youdontneedthis-inventory/CLAUDE.md
# Read this entire file before doing anything. No exceptions.

---

## WHAT THIS REPO IS

This is the media repository for youdontneedthis.us — a curated tech resale site.
It contains ALL photos, videos, and thumbnails for every item listed on the site.
This repo does NOT contain any site code, HTML, CSS, or JavaScript.

---

## SISTER REPO (site code lives here)
`/Users/nicholasdemeter/Documents/youdontneedthis-site`
GitHub: https://github.com/NicholasDemeter/youdontneedthis-site

---

## HOW THIS REPO CONNECTS TO THE LIVE SITE

1. `build.js` in the site repo reads this inventory at build time
2. It constructs raw GitHub URLs for all images
3. Those URLs are baked into `dist/index.html`
4. GitHub Pages serves that file at youdontneedthis.us

**Pushing this inventory repo alone does NOT update the live site.**
After pushing inventory, you must also run `node build.js` in the site repo and push that too.

---

## FOLDER STRUCTURE (strict — never deviate)

```
youdontneedthis-inventory/
├── Carousel_HERO/
│   └── Hero_Media.mp4          ← hero video on site homepage
├── LOT_001_ITEM_NAME/
│   ├── LOT_001_THUMBNAIL.jpg   ← MUST be in root, not in Photos/
│   ├── Photos/
│   │   ├── LOT_001_01.jpg
│   │   ├── LOT_001_02.jpg
│   │   └── LOT_001_03.jpg      ← minimum 3 photos
│   └── Videos/
│       └── LOT_001_VIDEO_01.mp4
├── LOT_002_ITEM_NAME/
└── ...
```

---

## CRITICAL MATCHING RULES

build.js matches folders using this logic (in order):
1. Tries exact `FOLDER_NAME` from products.csv first
2. Falls back to prefix match: folder name must START WITH `LOT_###_` (number + underscore)
3. If neither matches → placeholder image shown on site

**This means:**
- Every folder MUST have content after the LOT number: `LOT_069_Apple_Watch` ✅
- `LOT_069` with nothing after — may not match reliably ❌
- Folder names are case-insensitive in matching but keep consistent casing

---

## FILE STANDARDS

| Type | Location | Naming Convention | Max Size |
|------|----------|-------------------|----------|
| Thumbnail | LOT root (not Photos/) | LOT_###_THUMBNAIL.jpg | 200KB |
| Photos | Photos/ subfolder | LOT_###_01.jpg, _02.jpg... | 400KB |
| Videos | Videos/ subfolder | LOT_###_VIDEO_01.mp4 | 10MB |

Accepted image formats: .jpg .jpeg .png .gif .webp (case insensitive)
Accepted video formats: .mp4 .mov .webm

---

## BRANCH SITUATION (known issue)

Local branch: `master`
GitHub branch: `main`

Push command:
```bash
git push origin master:main
```

If rejected (non-fast-forward):
```bash
git push origin master:main --force
```
Only use --force if you have confirmed local is newer than GitHub.

---

## GOLDEN RULES

1. Never delete Carousel_HERO/ — it contains the hero video for the site
2. Never commit .DS_Store files
3. Minimum 3 photos per LOT
4. Thumbnail must contain "THUMBNAIL" in filename — build.js searches for this string
5. Photos must be in Photos/ subfolder — build.js only looks there
6. Videos must be in Videos/ subfolder — build.js only looks there
7. After pushing this repo, always rebuild and push the site repo too

---

## PUSH COMMAND
```bash
cd /Users/nicholasdemeter/Documents/youdontneedthis-inventory
git add .
git commit -m "descriptive message"
git push origin master:main
```

---

## KNOWN MISSING FOLDERS (as of June 22, 2026)
- LOT_023 (DEVALIET EARDRUM SPECIAL) — no folder, shows placeholder on site
- LOT_064 (PrinCube) — no folder, shows placeholder on site
These should be removed from products.csv or folders added.

---

## STAGING LOCATION FOR NEW ITEMS
`/Users/nicholasdemeter/Desktop/YDNT_BACKUP/To Clean for YDNT`
See SKILL-new-lot.md in site repo for full intake workflow.
