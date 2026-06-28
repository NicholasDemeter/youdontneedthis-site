# SKILL-cleanup.md
# YDNT — Inventory Compliance & Cleanup

## SELF-CORRECTION RULE
If a path, count, or result is inconsistent with this skill or ARCHITECTURE.md, STOP and
ask Nicholas. If a document is the cause, propose the fix and update it with approval.

## TOOLS USED HERE
ImageMagick (`convert`, `mogrify`) for images, `ffmpeg` for video. Confirm first:
```bash
which convert ffmpeg mogrify
# if missing: brew install imagemagick && brew install ffmpeg
```

---

## FILE STANDARDS (non-negotiable)

| Type | Location | Naming | Size |
|------|----------|--------|------|
| Thumbnail | LOT folder ROOT | contains "THUMBNAIL", e.g. LOT_###_THUMBNAIL.jpg | 100KB–200KB |
| Photos | Photos/ subfolder | LOT_###_01.jpg, _02.jpg … | 300KB–400KB each |
| Videos | Videos/ subfolder | LOT_###_VIDEO_01.mp4 | under 10MB each |

Matching depends ONLY on the folder starting with `LOT_###_`. Renaming the readable part
of a folder never breaks anything as long as that prefix is intact and correctly formatted
(capital LOT, three zero-padded digits, underscore).

---

## STEP 1 — FULL INVENTORY AUDIT
```bash
node -e "
const fs=require('fs'),path=require('path');
const inv=process.env.HOME+'/Documents/youdontneedthis-inventory';
const lots=fs.readdirSync(inv).filter(f=>/^LOT_/i.test(f));
const r={noThumb:[],noPhotos:[],fewPhotos:[],badPrefix:[]};
lots.forEach(lot=>{
  if(!/^LOT_\d{3}_/.test(lot)) r.badPrefix.push(lot);   // flags lot_, LOT_12_, etc.
  const p=path.join(inv,lot), files=fs.readdirSync(p);
  if(!files.some(f=>f.toUpperCase().includes('THUMBNAIL'))) r.noThumb.push(lot);
  const ph=path.join(p,'Photos');
  const n=fs.existsSync(ph)?fs.readdirSync(ph).filter(f=>/\.(jpe?g|png|gif|webp)$/i.test(f)).length:0;
  if(n===0) r.noPhotos.push(lot); else if(n<3) r.fewPhotos.push(lot+' ('+n+')');
});
const show=(t,a)=>console.log(t+':',a.length,a.length?'\n  '+a.join('\n  '):'');
show('Malformed LOT prefix (WILL break matching)',r.badPrefix);
show('Missing thumbnail',r.noThumb);
show('No photos',r.noPhotos);
show('Fewer than 3 photos',r.fewPhotos);
"
```
The "Malformed LOT prefix" list is the critical one — those folders won't match the CSV.
Report it; fixing means renaming the prefix to the strict `LOT_###_` form.

---

## STEP 2 — COMPRESS THUMBNAILS (target 100KB–200KB)
```bash
cd ~/Documents/youdontneedthis-inventory
for thumb in LOT_*/*THUMBNAIL*; do
  [ -f "$thumb" ] || continue
  size=$(du -k "$thumb" | cut -f1)
  if [ "$size" -gt 200 ]; then
    echo "Compressing $thumb (${size}KB)"
    convert "$thumb" -resize 800x800\> -quality 80 "$thumb"
  elif [ "$size" -lt 100 ]; then
    echo "FLAG (too small): $thumb (${size}KB) — re-derive from a higher-res original if available"
  fi
done
```

## STEP 3 — COMPRESS PHOTOS (target 300KB–400KB each)
```bash
cd ~/Documents/youdontneedthis-inventory
for img in LOT_*/Photos/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp}; do
  [ -f "$img" ] || continue
  size=$(du -k "$img" | cut -f1)
  if [ "$size" -gt 400 ]; then
    echo "Compressing $img (${size}KB)"
    convert "$img" -resize 1200x1200\> -quality 82 "$img"
  elif [ "$size" -lt 300 ]; then
    echo "FLAG (too small): $img (${size}KB) — re-derive from a higher-res original if available"
  fi
done
```

## STEP 4 — COMPRESS VIDEOS (target under 10MB) — test on ONE first
```bash
ffmpeg -i "INPUT.mp4" -vcodec h264 -acodec aac -crf 28 -preset medium "OUTPUT.mp4"
# If output is under 10MB and looks acceptable, then batch the rest.
```

## STEP 5 — RENAME PHOTOS TO SEQUENTIAL FORMAT (per LOT, with confirmation)
```bash
# Confirm the LOT number with Nicholas first. Replace the folder name below.
cd ~/Documents/youdontneedthis-inventory/LOT_###_<folder>/Photos
n=1
for f in $(ls | sort -V); do
  ext="${f##*.}"
  mv "$f" "LOT_###_$(printf '%02d' $n).${ext:l}"   # zsh lowercases ext
  n=$((n+1))
done
```
Never batch-rename across all LOTs without per-LOT confirmation.

---

## STEP 6 — PUSH INVENTORY, THEN REBUILD SITE
```bash
git -C ~/Documents/youdontneedthis-inventory add .
git -C ~/Documents/youdontneedthis-inventory commit -m "Cleanup: describe what changed"
git -C ~/Documents/youdontneedthis-inventory push origin master:main
```
Then follow SKILL-push.md to rebuild and push the site (inventory alone changes nothing live).

---

## NOTES
- .DS_Store appears in every Mac folder — harmless, never commit it.
- Mixed .jpg / .JPG — build.js is case-insensitive, but standardize to lowercase for tidiness.
- A LOT's Videos/ folder may be empty or absent — build.js only includes videos if present.
- Never rename a thumbnail to something without "THUMBNAIL" in it.
