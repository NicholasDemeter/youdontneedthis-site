# SKILL-cleanup.md
# YDNT — Inventory Compliance and Cleanup
# Save to: /Users/nicholasdemeter/Documents/youdontneedthis-site/skills/SKILL-cleanup.md

## DRAFT STATUS — June 22, 2026
## This skill is a DRAFT. The compression commands need to be tested.
## Verify ImageMagick and ffmpeg are installed before running any compress commands.
## Image loading on live site is UNRESOLVED — cleanup may help or may be unrelated.

---

## FILE STANDARDS (non-negotiable)

| File Type | Location | Naming | Max Size |
|-----------|----------|--------|----------|
| Thumbnail | LOT root | LOT_###_THUMBNAIL.jpg | 200KB |
| Photos | Photos/ subfolder | LOT_###_01.jpg, _02.jpg... | 400KB each |
| Videos | Videos/ subfolder | LOT_###_VIDEO_01.mp4 | 10MB each |

Minimum: 3 photos per LOT
All subfolders must exist even if empty (Photos/ and Videos/)

---

## STEP 1 — CHECK TOOLS ARE AVAILABLE
```bash
which convert    # ImageMagick for images
which ffmpeg     # for videos
which mogrify    # ImageMagick batch tool
```
If any return "not found":
```bash
brew install imagemagick
brew install ffmpeg
```

---

## STEP 2 — FULL INVENTORY AUDIT
Run this to get a complete compliance report:
```bash
node -e "
const fs = require('fs');
const path = require('path');
const inv = '/Users/nicholasdemeter/Documents/youdontneedthis-inventory';
const lots = fs.readdirSync(inv).filter(f => f.startsWith('LOT_'));
const report = {noThumb: [], noPhotos: [], fewPhotos: [], noVideosFolder: []};
lots.forEach(lot => {
  const lotPath = path.join(inv, lot);
  const files = fs.readdirSync(lotPath);
  const hasThumb = files.some(f => f.toUpperCase().includes('THUMBNAIL'));
  const photosPath = path.join(lotPath, 'Photos');
  const hasPhotos = fs.existsSync(photosPath);
  const photoCount = hasPhotos ? fs.readdirSync(photosPath).filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f)).length : 0;
  const hasVideos = fs.existsSync(path.join(lotPath, 'Videos'));
  if (!hasThumb) report.noThumb.push(lot);
  if (!hasPhotos || photoCount === 0) report.noPhotos.push(lot);
  else if (photoCount < 3) report.fewPhotos.push(lot + ' (' + photoCount + ' photos)');
  if (!hasVideos) report.noVideosFolder.push(lot);
});
console.log('Missing thumbnail:', report.noThumb.length, '\n', report.noThumb.join('\n'));
console.log('Missing photos:', report.noPhotos.length, '\n', report.noPhotos.join('\n'));
console.log('Fewer than 3 photos:', report.fewPhotos.length, '\n', report.fewPhotos.join('\n'));
console.log('Missing Videos folder:', report.noVideosFolder.length);
"
```

---

## STEP 3 — CREATE MISSING SUBFOLDERS
```bash
# Create Videos folder for ALL LOTs that are missing it
for dir in /Users/nicholasdemeter/Documents/youdontneedthis-inventory/LOT_*/; do
  mkdir -p "$dir/Photos"
  mkdir -p "$dir/Videos"
done
```

---

## STEP 4 — COMPRESS THUMBNAILS
```bash
cd /Users/nicholasdemeter/Documents/youdontneedthis-inventory
for thumb in LOT_*/*THUMBNAIL*; do
  size=$(du -k "$thumb" | cut -f1)
  if [ "$size" -gt 200 ]; then
    echo "Compressing $thumb (${size}KB)"
    convert "$thumb" -resize 800x800\> -quality 80 "$thumb"
  fi
done
```

## STEP 5 — COMPRESS PHOTOS
```bash
cd /Users/nicholasdemeter/Documents/youdontneedthis-inventory
for photosDir in LOT_*/Photos/; do
  for img in "$photosDir"*.{jpg,jpeg,JPG,JPEG,png,PNG}; do
    [ -f "$img" ] || continue
    size=$(du -k "$img" | cut -f1)
    if [ "$size" -gt 400 ]; then
      echo "Compressing $img (${size}KB)"
      convert "$img" -resize 1200x1200\> -quality 82 "$img"
    fi
  done
done
```

## STEP 6 — COMPRESS VIDEOS (DRAFT — test on one video first)
```bash
# Test on single video first before batch
ffmpeg -i "INPUT.mp4" -vcodec h264 -acodec aac -crf 28 -preset medium "OUTPUT.mp4"
# If output is under 10MB and quality is acceptable, proceed with batch
```

---

## STEP 7 — RENAME PHOTOS TO SEQUENTIAL FORMAT
```bash
# For a specific LOT — replace LOT_002 and folder name as needed
cd "/Users/nicholasdemeter/Documents/youdontneedthis-inventory/LOT_002_Microsoft_Surface_Studio_2_All_in_One_Desktop/Photos"
counter=1
for f in $(ls | sort); do
  ext="${f##*.}"
  new="LOT_002_$(printf '%02d' $counter).${ext,,}"
  mv "$f" "$new"
  ((counter++))
done
```
NOTE: Ask Nicholas to confirm LOT number before running rename commands.
Never batch rename across all LOTs without per-LOT confirmation.

---

## STEP 8 — DEAD WEIGHT CLEANUP IN SITE REPO
These files serve no function and should be deleted in a dedicated cleanup session:
```
app/
components/
hooks/
lib/
types/
next.config.mjs
tsconfig.json
pnpm-lock.yaml
postcss.config.mjs
components.json
index.html (root, 622 bytes)
styles.css (root)
app.js (root)
```
AND delete stale branches:
```bash
git push origin --delete v0/nicholasdemeter-5c8450d7
git push origin --delete YDNT_Sandbox
git push origin --delete feature/explore-collection-dropdown
```
WARNING: Do not delete `main` branch. Do not delete `.github/` folder. Do not delete `CNAME`.

---

## STEP 9 — VERIFY AND PUSH INVENTORY
After any cleanup:
```bash
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory add .
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory commit -m "Cleanup: [describe what changed]"
git -C /Users/nicholasdemeter/Documents/youdontneedthis-inventory push origin master:main
```
Then follow SKILL-push.md to rebuild and push site.

---

## KNOWN GOTCHAS
- .DS_Store files appear in every folder on Mac — harmless, don't commit them
- Some LOTs have Specs/ subfolder — leave it alone, build.js ignores it
- Mixed .jpg and .JPG extensions — build.js handles case-insensitive, but standardize to lowercase for cleanliness
- Never rename the THUMBNAIL file to anything that doesn't contain "THUMBNAIL"
- Videos folder can be empty — that's fine, build.js only loads videos if they exist
