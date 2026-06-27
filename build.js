import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CSV_PATH = path.join(__dirname, 'products.csv');
const DIST_DIR = path.join(__dirname, 'dist');
const OUTPUT_PATH = path.join(DIST_DIR, 'index.html');
const INVENTORY_REPO_BASE = 'https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/master';
const LOCAL_INVENTORY_PATH = path.resolve(__dirname, '..', 'youdontneedthis-inventory');
const HERO_VIDEO_URL = `${INVENTORY_REPO_BASE}/Carousel_HERO/Hero_Media.mp4`;
const WHATSAPP_NUMBER = '256780923638';
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="18" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image Available%3C/text%3E%3C/svg%3E';

// NEW: Categories are now DYNAMIC from CSV (no hardcoding)
// DROPDOWN_CATEGORIES will be generated from products.csv Column I at build time

// Parse CSV file
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    const product = {};
    headers.forEach((header, index) => {
      product[header] = values[index] || '';
    });

    products.push(product);
  }

  return products;
}

// Extract LOT number from LOT column (e.g., "LOT_069" -> "069")
function extractLotNumber(lotString) {
  const match = lotString.match(/LOT_(\d+)/);
  return match ? match[1] : null;
}

// Parse coolness rating - handles "4 Stars", "6 stars", or plain "7"
function parseCoolnessRating(ratingString) {
  if (!ratingString) return 0;
  const match = ratingString.toString().match(/\d+/);
  return match ? Math.min(Math.max(parseInt(match[0]), 0), 10) : 0;
}

// Fetch all photos for a LOT from the local inventory folder and build raw GitHub URLs
function getPhotoUrls(lotNumber, folderName) {
  if (!lotNumber && !folderName) return { thumbnail: PLACEHOLDER_IMAGE, photos: [] };

  const localExists = fs.existsSync(LOCAL_INVENTORY_PATH) && fs.statSync(LOCAL_INVENTORY_PATH).isDirectory();
  let lotFolderName = null;

  if (folderName) {
    const candidatePath = path.join(LOCAL_INVENTORY_PATH, folderName);
    if (localExists && fs.existsSync(candidatePath) && fs.statSync(candidatePath).isDirectory()) {
      lotFolderName = folderName;
    }
  }

  if (!lotFolderName && lotNumber && localExists) {
    const entries = fs.readdirSync(LOCAL_INVENTORY_PATH, { withFileTypes: true });
    const match = entries.find(entry =>
      entry.isDirectory() && entry.name.toUpperCase().startsWith(`LOT_${lotNumber}_`.toUpperCase())
    );
    if (match) lotFolderName = match.name;
  }

  if (!lotFolderName) {
    const missingRef = folderName || `LOT_${lotNumber}`;
    console.warn(`  ⚠ No local inventory folder found for ${missingRef}`);
    return { thumbnail: PLACEHOLDER_IMAGE, photos: [] };
  }

  const folderPath = path.join(LOCAL_INVENTORY_PATH, lotFolderName);
  let thumbnailUrl = PLACEHOLDER_IMAGE;

  const folderEntries = fs.existsSync(folderPath)
    ? fs.readdirSync(folderPath)
    : [];

  const thumbFile = folderEntries.find(name => name.toUpperCase().includes('THUMBNAIL'));
  if (thumbFile) {
    thumbnailUrl = `${INVENTORY_REPO_BASE}/${encodeURIComponent(lotFolderName)}/${encodeURIComponent(thumbFile)}`;
  }

  const photosDir = path.join(folderPath, 'Photos');
  const photos = (fs.existsSync(photosDir) && fs.statSync(photosDir).isDirectory())
    ? fs.readdirSync(photosDir)
        .filter(name => /\.(jpe?g|png|gif|webp)$/i.test(name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map(name => `${INVENTORY_REPO_BASE}/${encodeURIComponent(lotFolderName)}/Photos/${encodeURIComponent(name)}`)
    : [];

  return { thumbnail: thumbnailUrl, photos };
}

// Format price for display
function formatPrice(price) {
  if (!price || price.toLowerCase() === 'make an offer' || price.trim() === '') {
    return 'Make an offer';
  }
  return price;
}

// Generate SEO tags for search functionality
function generateSEOTags(product) {
  const tags = [];
  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const lot = product.lot || '';
  
  // Laptops & Tablets
  if (name.includes('surface') || name.includes('laptop') || name.includes('chromebook') || 
      name.includes('tablet') || name.includes('pixelbook') || 
      lot.match(/LOT_00[126]|LOT_066|LOT_113|LOT_129/)) {
    tags.push('laptop', 'tablet', 'portable computer');
  }
  
  // Mini PCs
  if (name.includes('mini') || name.includes('minisforum') || name.includes('khadas') || 
      name.includes('mac mini') || lot.match(/LOT_003|LOT_065|LOT_111|LOT_120/)) {
    tags.push('mini pc', 'desktop', 'computer');
  }
  
  // Monitors
  if (name.includes('monitor') || name.includes('display') || name.includes('screen') ||
      lot.match(/LOT_00[56]|LOT_011|LOT_045|LOT_047|LOT_070|LOT_078|LOT_117/)) {
    tags.push('monitor', 'portable monitor', 'screen', 'display');
  }
  
  // Phone Accessories
  if (name.includes('moment') || name.includes('shiftcam') || name.includes('gimbal') ||
      name.includes('phone') || name.includes('mobile') || 
      lot.match(/LOT_004|LOT_01[79]|LOT_020|LOT_044|LOT_053|LOT_055|LOT_067|LOT_086|LOT_088|LOT_10[1-9]|LOT_123|LOT_124/)) {
    tags.push('phone accessories', 'mobile accessories');
    if (name.includes('lens')) tags.push('phone camera lens', 'mobile photography');
    if (name.includes('gimbal')) tags.push('gimbal', 'stabilizer');
  }
  
  // Audio
  if (name.includes('speaker') || name.includes('soundbar') || name.includes('audio') ||
      name.includes('devialet') || name.includes('bose') || name.includes('headphone') ||
      lot.match(/LOT_02[36]|LOT_031|LOT_071|LOT_073|LOT_074|LOT_08[0-5]|LOT_097|LOT_127|LOT_128|LOT_130|LOT_131/)) {
    tags.push('audio', 'speaker');
    if (name.includes('soundbar')) tags.push('soundbar');
    if (name.includes('headphone') || name.includes('earbud')) tags.push('headphones', 'earbuds');
  }
  
  // Motorcycle / Boda Boda
  if (name.includes('helmet') || name.includes('motorcycle') || name.includes('sena') ||
      lot.match(/LOT_018|LOT_02[45]|LOT_091|LOT_09[89]|LOT_100|LOT_118/)) {
    tags.push('motorcycle', 'boda boda', 'helmet');
  }
  
  // Cameras
  if (name.includes('camera') || name.includes('gopro') || name.includes('webcam') ||
      lot.match(/LOT_021|LOT_049|LOT_052|LOT_108|LOT_116|LOT_132|LOT_133/)) {
    tags.push('camera');
  }
  
  // Security
  if (name.includes('safe') || name.includes('security') || name.includes('gps') ||
      lot.match(/LOT_036|LOT_037|LOT_050|LOT_062|LOT_068|LOT_094/)) {
    tags.push('security', 'safe');
  }
  
  // Premium Tech
  if (name.includes('xreal') || name.includes('ar glass') || name.includes('plaud') ||
      name.includes('apple watch ultra') || 
      lot.match(/LOT_007|LOT_015|LOT_028|LOT_030|LOT_040|LOT_041|LOT_042|LOT_043|LOT_064|LOT_069|LOT_077|LOT_132/)) {
    tags.push('premium tech', 'smart device');
    if (name.includes('ar') || name.includes('xreal')) tags.push('ar glasses');
    if (name.includes('watch')) tags.push('smart watch');
  }
  
  return [...new Set(tags)];
}

// Generate HTML
function generateHTML(products) {
  // Sort by coolness rating (highest first)
  const sorted = products
    .filter(p => p.LOT && p.LOT.trim())
    .sort((a, b) => {
      const coolnessA = parseCoolnessRating(a.COOLNESS_RATING);
      const coolnessB = parseCoolnessRating(b.COOLNESS_RATING);
      return coolnessB - coolnessA;
    });

  // Generate product data JSON (photos already resolved from local inventory folder)
  const productData = sorted.map(p => {
    const lotNumber = extractLotNumber(p.LOT);
    const coolness = parseCoolnessRating(p.COOLNESS_RATING);
    
    const productObj = {
      lot: p.LOT,
      folderName: p.FOLDER_NAME,
      lotNumber: lotNumber,
      name: p.OFFICIAL_NAME || '',
      coolness: coolness,
      tagline: p.TAGLINE || '',
      description: p.DESCRIPTION || '',
      specs: p.SPECIFICATIONS || '',
      price: formatPrice(p.PRICE),
      category: p.CATEGORY || '',  // DIRECT from CSV (Column I) - new categories already applied
      subcategory: p.SUBCATEGORY || '',  // NEW (Column K)
      thumbnail: p._thumbnail || PLACEHOLDER_IMAGE,
      photos: p._photos || [],
      referenceUrl: p['PRICE ESTIMATE HYPERLINKS'] || ''
    };
    
    productObj.seoTags = generateSEOTags(productObj);
    
    return productObj;
  });

  // Extract unique categories dynamically from CSV (Column I)
  const DROPDOWN_CATEGORIES = [...new Set(
    productData.map(p => p.category).filter(c => c && c.trim())
  )].sort();
  
  // Filter items by subcategory for special sections
  const portableWorkstations = productData.filter(p => p.subcategory === 'Portable Workstations');
  const coolestGadgets = productData.filter(p => p.subcategory === 'Coolest Gadgets');
  
  // Filter featured items (coolness === 6)
  const featuredItems = productData.filter(p => p.coolness === 6);
  
  // Sort remaining items by coolness (5 → 4 → 3 → 2 → 1)
  const sortedByLowerCoolness = productData
    .filter(p => p.coolness < 6)
    .sort((a, b) => b.coolness - a.coolness);
  
  // Final display order: Featured first, then sorted rest
  const displayOrder = [...featuredItems, ...sortedByLowerCoolness];

  // Generate coolness star HTML
  function generateCoolnessStars(rating) {
    const filled = Math.min(Math.max(rating, 0), 10);
    const empty = 10 - filled;
    return '★'.repeat(filled) + '☆'.repeat(empty);
  }

  // Generate special section HTML
  function generateSpecialSection(title, items, sectionId, emoji) {
    if (items.length === 0) return '';
    
    // Special handling for Mobile Work Bundles: show LOT_076 stands at top
    let standsCallout = '';
    if (sectionId === 'portable-workstations') {
      const lot076 = productData.find(p => p.lot === 'LOT_076');
      if (lot076) {
        const lot076Index = productData.indexOf(lot076);
        const lot076Images = lot076.photos.length > 0 ? lot076.photos : [lot076.thumbnail];
        
        standsCallout = `
        <div class="stands-callout">
          <h3 class="stands-callout-title">Mix and Match</h3>
          <p class="stands-callout-text">
            Complete your mobile workstation with professional mounting solutions. 
            Choose from adjustable tripods, magnetic mounts, VESA brackets, and clamp arms 
            to transform any surface into a stable dual-screen setup.
          </p>
          <div class="stands-preview-grid">
            ${lot076Images.map(imgUrl => `
              <div class="stands-preview-item" onclick="openExpanded(${lot076Index})">
                <img src="${imgUrl}" alt="${lot076.name}" class="stands-preview-thumb" onerror="this.src='${PLACEHOLDER_IMAGE}'">
              </div>
            `).join('')}
          </div>
        </div>
        `;
      }
    }
    
    return `
    <section class="special-section" id="${sectionId}">
      <h2 class="section-title">${emoji} ${title}</h2>
      ${standsCallout}
      <div class="lots-grid">
        ${items.map((product) => {
          const originalIndex = productData.indexOf(product);
          const coolnessStars = generateCoolnessStars(product.coolness);
          return `
            <div class="lot-card" data-lot-index="${originalIndex}" onclick="openExpanded(${originalIndex})">
              <div class="lot-card-content">
                <img src="${product.thumbnail}" alt="${product.name}" class="lot-thumbnail" onerror="this.src='${PLACEHOLDER_IMAGE}'">
                <div class="lot-info">
                  <div class="lot-number">${product.lot}</div>
                  <h3 class="lot-name">${product.name}</h3>
                  <p class="lot-tagline">${product.tagline}</p>
                  <div class="lot-footer">
                    <span class="lot-price-badge">${product.price}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
    `;
  }

  // Generate special sections
  const portableWorkstationsHTML = generateSpecialSection(
    'Mobile Work Bundles',
    portableWorkstations,
    'portable-workstations',
    '' // Removed briefcase emoji - cleaner look
  );
  
  const coolestGadgetsHTML = generateSpecialSection(
    'The Coolest Stuff You Don\'t Need',
    coolestGadgets,
    'coolest-gadgets',
    '🔥'
  );

  // Generate Featured Items carousel HTML
  const featuredItemsHTML = featuredItems.length > 0 ? `
    <section class="hot-items-section" id="featured-stuff">
      <h2 class="hot-items-title">⭐ Featured Stuff</h2>
      <div class="hot-items-carousel">
        ${featuredItems.map((product) => `
          <div class="hot-item" data-lot-index="${productData.indexOf(product)}" onclick="openExpanded(${productData.indexOf(product)})">
            <img src="${product.thumbnail}" alt="${product.name}" class="hot-item-thumbnail" onerror="this.src='${PLACEHOLDER_IMAGE}'">
            <div class="hot-item-name">${product.name}</div>
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  // Generate product cards HTML
  // Generate product cards HTML using displayOrder (Featured 6★ first, then 5→4→3→2→1)
  const cardsHTML = displayOrder.map((product) => {
    const originalIndex = productData.indexOf(product);  // Preserve original index for openExpanded()
    const coolnessStars = generateCoolnessStars(product.coolness);
    return `
    <div class="lot-card" data-lot-index="${originalIndex}" onclick="openExpanded(${originalIndex})">
      <div class="lot-card-content">
        <img src="${product.thumbnail}" alt="${product.name}" class="lot-thumbnail" onerror="this.src='${PLACEHOLDER_IMAGE}'">
        <div class="lot-info">
          <div class="lot-number">${product.lot}</div>
          <h3 class="lot-name">${product.name}</h3>
          <p class="lot-tagline">${product.tagline}</p>
          <div class="lot-footer">
            <span class="lot-price-badge">${product.price}</span>
          </div>
        </div>
      </div>
    </div>
    `;
  }).join('');

  // Generate product data script
  const productsScript = `window.PRODUCTS = ${JSON.stringify(productData, null, 2)};`;
  const dropdownCategoriesScript = `window.DROPDOWN_CATEGORIES = ${JSON.stringify(DROPDOWN_CATEGORIES, null, 2)};`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Premium tech items curated by youdontneedthis">
  <title>youdontneedthis — Premium Tech Items</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      line-height: 1.6;
    }

    /* Hero */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: hidden;
      padding: 2rem;
    }

    .hero-video {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      z-index: 0;
      opacity: 0.4;
    }

    .hero-overlay {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 100%);
      z-index: 1;
    }

    .hero-particles {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 2;
      pointer-events: none;
    }

    .hero-content {
      position: relative;
      z-index: 3;
    }

    .hero-title {
      font-size: clamp(2.5rem, 8vw, 7rem);
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.03em;
      margin-bottom: 1rem;
    }

    .hero-title .line1 { color: #ffffff; display: block; }
    .hero-title .line2 { color: #FFD700; display: block; }

    .hero-subtitle {
      font-size: 1.2rem;
      color: #ccc;
      margin-bottom: 0.5rem;
    }

    .hero-tagline {
      font-size: 0.95rem;
      color: #888;
      margin-bottom: 2.5rem;
    }

    .hero-buttons {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      align-items: center;
      width: 100%;
      max-width: 800px;
      margin: 0 auto 3rem;
    }

    /* Special Section Buttons */
    .special-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
      width: 100%;
    }

    .special-btn {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05));
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      color: #fff;
      border: 2px solid transparent;
      background-clip: padding-box;
      position: relative;
      padding: 0.9rem 2rem;
      border-radius: 16px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        0 8px 32px 0 rgba(31, 38, 135, 0.15),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.3);
    }

    .special-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 14px;
      padding: 2px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    .special-btn:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1));
      transform: translateY(-2px);
      box-shadow: 
        0 12px 40px 0 rgba(31, 38, 135, 0.25),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.4);
    }

    .special-btn:active {
      transform: translateY(0) scale(0.98);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.3),
                  inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    /* Search Wrapper */
    .search-wrapper {
      display: flex;
      gap: 0.8rem;
      width: 100%;
      flex-wrap: wrap;
      justify-content: center;
    }

    /* Search Container */
    .search-container {
      position: relative;
      flex: 1;
      min-width: 280px;
      max-width: 500px;
    }

    .search-input {
      width: 100%;
      padding: 1rem 1.2rem;
      font-size: 0.95rem;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      color: #fff;
      outline: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),
                  inset 0 1px 2px rgba(255, 255, 255, 0.1);
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .search-input:focus {
      border-color: rgba(102, 126, 234, 0.6);
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3),
                  inset 0 1px 3px rgba(255, 255, 255, 0.15);
    }

    /* Category Dropdown */
    .category-dropdown-container {
      position: relative;
      display: inline-block;
    }

    .category-dropdown-btn {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05));
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      color: #fff;
      border: 2px solid transparent;
      background-clip: padding-box;
      padding: 0.9rem 2rem;
      border-radius: 16px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 0.6rem;
      box-shadow: 
        0 8px 32px 0 rgba(31, 38, 135, 0.15),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.3);
      white-space: nowrap;
      position: relative;
    }

    .category-dropdown-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 14px;
      padding: 2px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    .category-dropdown-btn:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1));
      transform: translateY(-2px);
      box-shadow: 
        0 12px 40px 0 rgba(31, 38, 135, 0.25),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.4);
    }

    .category-dropdown-btn:active {
      transform: translateY(0) scale(0.98);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.3),
                  inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .dropdown-arrow {
      font-size: 0.75rem;
      transition: transform 0.3s;
    }

    .category-dropdown-btn:hover .dropdown-arrow {
      transform: translateY(2px);
    }

    .category-dropdown-content {
      position: absolute;
      top: 100%;
      left: 0;
      background: rgba(26, 26, 26, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      min-width: 250px;
      max-height: 400px;
      overflow-y: auto;
      z-index: 1000;
      margin-top: 0.5rem;
      display: none;
      flex-direction: column;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    }

    .category-dropdown-content.active {
      display: flex;
    }

    .category-item {
      padding: 0.9rem 1.2rem;
      color: #e0e0e0;
      cursor: pointer;
      transition: background 0.2s;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.9rem;
    }

    .category-item:last-child {
      border-bottom: none;
    }

    .category-item:hover {
      background: rgba(102, 126, 234, 0.2);
      color: #ffd700;
    }

    .category-item.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }

    .category-reset-btn {
      padding: 0.9rem 1.2rem;
      color: #999;
      cursor: pointer;
      transition: background 0.2s;
      border-top: 1px solid #333;
      font-size: 0.85rem;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .category-reset-btn:hover {
      background: #2a2a2a;
      color: #ddd;
    }

    /* Search Bar */
    .search-container {
      position: relative;
      margin-bottom: 1rem;
      width: 100%;
      max-width: 500px;
    }
    
    .search-input {
      width: 100%;
      padding: 1rem 1.5rem;
      font-size: 1rem;
      border: 2px solid #ffcc00;
      border-radius: 50px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }
    
    .search-input:focus {
      outline: none;
      border-color: #bb86fc;
      box-shadow: 0 0 20px rgba(187, 134, 252, 0.5);
    }
    
    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    
    .search-results {
      position: absolute;
      top: 110%;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(15px);
      border-radius: 15px;
      max-height: 400px;
      overflow-y: auto;
      z-index: 1000;
      display: none;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
    }
    
    .search-results.active {
      display: block;
    }
    
    .search-result-item {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      transition: background 0.2s ease;
    }
    
    .search-result-item:hover {
      background: rgba(255, 204, 0, 0.1);
    }
    
    .search-tag-match {
      color: #ffcc00;
      font-weight: bold;
    }

    /* Hot Items */
    .hot-items-section {
      padding: 2rem 1rem;
      background: #111;
      border-bottom: 1px solid #222;
    }

    .hot-items-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      padding: 0 1rem;
    }

    .hot-items-carousel {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      padding: 0 1rem 1rem;
      scrollbar-width: thin;
      scrollbar-color: #333 #111;
    }

    .hot-items-carousel::-webkit-scrollbar { height: 4px; }
    .hot-items-carousel::-webkit-scrollbar-track { background: #111; }
    .hot-items-carousel::-webkit-scrollbar-thumb { background: #444; border-radius: 2px; }

    .hot-item {
      flex-shrink: 0;
      width: 160px;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .hot-item:hover { transform: translateY(-3px); }

    .hot-item-thumbnail {
      width: 160px;
      height: 160px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #333;
      display: block;
      margin-bottom: 0.5rem;
    }

    .hot-item-name {
      font-size: 0.8rem;
      color: #ccc;
      text-align: center;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    /* Main grid */
    main {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    /* Special Sections */
    .special-section {
      padding: 3rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      position: relative;
    }

    .special-section:first-of-type {
      margin-top: 2rem;
    }

    /* Stands Callout (for Mobile Work Bundles) */
    .stands-callout {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2.5rem;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .stands-callout-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 0.8rem;
    }

    .stands-callout-text {
      color: rgba(255, 255, 255, 0.75);
      line-height: 1.6;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .stands-preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
      gap: 0.75rem;
      max-width: 100%;
    }

    .stands-preview-item {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.3);
    }

    .stands-preview-item:hover {
      transform: translateY(-4px);
      border-color: rgba(255, 215, 0, 0.5);
      box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);
    }

    .stands-preview-thumb {
      width: 100%;
      height: 120px;
      object-fit: cover;
      display: block;
    }
    }

    /* Home Button - Always visible, top-right, modern glassy style */
    .home-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, rgba(83, 167, 234, 0.25), rgba(83, 167, 234, 0.15));
      backdrop-filter: blur(15px) saturate(180%);
      -webkit-backdrop-filter: blur(15px) saturate(180%);
      color: #fff;
      border: 2px solid rgba(83, 167, 234, 0.4);
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 32px 0 rgba(83, 167, 234, 0.2);
      z-index: 1001;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .home-btn.visible {
      display: flex; /* Legacy class kept for compatibility */
    }

    .home-btn:hover {
      background: linear-gradient(135deg, rgba(83, 167, 234, 0.35), rgba(83, 167, 234, 0.25));
      border-color: rgba(83, 167, 234, 0.6);
      transform: translateY(-2px);
      box-shadow: 0 12px 40px 0 rgba(83, 167, 234, 0.35);
    }

    .home-btn:active {
      transform: translateY(0) scale(0.98);
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #fff;
    }

    .lots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .lot-card {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      display: block;
    }

    .lot-card.hidden {
      display: none;
    }

    .lot-card:hover {
      border-color: #555;
      transform: translateY(-2px);
    }

    .lot-thumbnail {
      width: 100%;
      height: 200px;
      object-fit: cover;
      background: #111;
      display: block;
    }

    .lot-info { padding: 1rem; }

    .lot-number {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.4rem;
    }

    .lot-name {
      font-size: 1.05rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }

    .lot-tagline {
      font-size: 0.85rem;
      color: #999;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .lot-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.75rem;
      padding-right: 0.5rem;
    }

    .lot-price-badge {
      background: #222;
      color: #FFD700;
      padding: 0.4rem 0.9rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      border: 1px solid #333;
      margin-left: auto;
    }

    .lot-coolness {
      display: none;
    }

    /* Expanded modal */
    .lot-expanded {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .lot-expanded-content {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 12px;
      max-width: 960px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      padding: 2rem;
      position: relative;
    }

    .lot-expanded-close {
      position: absolute;
      top: 1rem; right: 1rem;
      background: #333;
      border: none;
      color: #fff;
      width: 32px; height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .lot-expanded-close:hover { background: #555; }

    .lot-gallery-main {
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
      border-radius: 8px;
      background: #111;
      margin-bottom: 0.75rem;
    }

    .lot-gallery-main img, .lot-gallery-main video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .lot-gallery-thumbs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
    }

    .lot-gallery-thumb {
      aspect-ratio: 1;
      overflow: hidden;
      border-radius: 4px;
      border: 2px solid transparent;
      cursor: pointer;
      background: #111;
    }

    .lot-gallery-thumb.active { border-color: #FFD700; }
    .lot-gallery-thumb:hover { border-color: #555; }

    .lot-gallery-thumb img, .lot-gallery-thumb video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .lot-details { display: flex; flex-direction: column; gap: 1.2rem; }

    .lot-details-header { padding-top: 1rem; }

    .lot-details-number {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.5rem;
    }

    .lot-details-name {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
      line-height: 1.2;
    }

    .lot-details-tagline { font-size: 1rem; color: #999; margin-bottom: 0.5rem; }

    /* Price now appears right-aligned after description */
    .lot-details-price-right {
      font-size: 1.4rem;
      font-weight: 700;
      color: #FFD700;
      text-align: right;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 215, 0, 0.2);
    }

    .lot-details-section { border-top: 1px solid #2a2a2a; padding-top: 1rem; }

    .lot-details-section h4 {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #666;
      margin-bottom: 0.5rem;
    }

    .lot-details-section p {
      font-size: 0.9rem;
      line-height: 1.6;
      color: #ddd;
    }

    .lot-details-specs {
      font-size: 0.85rem;
      line-height: 1.8;
      color: #bbb;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .lot-action-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .lot-price-button {
      background: #FFD700;
      color: #000;
      border: none;
      padding: 0.9rem 1.5rem;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      display: block;
      text-align: center;
      transition: background 0.2s;
    }

    .lot-price-button:hover { background: #FFC700; }

    .lot-contact-button {
      background: #25d366;
      color: #000;
      border: none;
      padding: 0.9rem 1.5rem;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      display: block;
      text-align: center;
      transition: background 0.2s;
    }

    .lot-contact-button:hover { background: #20ba5a; }

    @media (max-width: 768px) {
      .hero-video {
        opacity: 0.65;
        width: 100%;
        height: 100%;
        min-height: 100svh;
        object-fit: cover;
        object-position: center;
      }
      .hero {
        min-height: 100svh;
        overflow: hidden;
      }
      .hero-title { font-size: 3rem; }
      .hero-buttons { flex-direction: column; gap: 1.2rem; }
      .special-buttons { flex-direction: column; width: 100%; }
      .special-btn { 
        width: 100%; 
        max-width: 280px;
        padding: 0.75rem 1.5rem;
        font-size: 0.9rem;
        justify-content: center; 
      }
      .search-wrapper { flex-direction: column; width: 100%; }
      .search-container { max-width: 100%; }
      .category-dropdown-btn { width: 100%; justify-content: center; }
      .category-dropdown-content { 
        position: fixed; 
        top: 50%; 
        left: 50%; 
        transform: translate(-50%, -50%); 
        width: 90%; 
        max-width: 90%; 
        min-width: auto; 
      }
      .lot-expanded-content { grid-template-columns: 1fr; padding: 1.5rem; }
      .lot-details-header { padding-top: 0; }
      .lots-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
      .lot-thumbnail { height: 160px; }
      .special-section { padding: 2rem 1rem; }
      .stands-callout { padding: 1.5rem; }
      .stands-preview-grid { grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
      .stands-preview-thumb { height: 90px; }
      .home-btn { top: 16px; right: 16px; padding: 0.6rem 1.2rem; font-size: 0.85rem; }
    }

    @media (max-width: 480px) {
      .lots-grid { grid-template-columns: 1fr; gap: 0.75rem; }
      .lot-thumbnail { height: 200px; }
    }
  </style>
</head>
<body>

  <!-- Home Button (always visible, top-right) -->
  <button class="home-btn" id="homeBtn" onclick="scrollToTop()">
    HOME
  </button>

  <!-- Hero Section -->
  <section class="hero" id="hero">
    <video class="hero-video" autoplay muted loop playsinline>
      <source src="${HERO_VIDEO_URL}" type="video/mp4">
    </video>
    <div class="hero-overlay"></div>
    <canvas class="hero-particles" id="heroParticles"></canvas>
    <div class="hero-content">
      <h1 class="hero-title">
        <span class="line1">YOU DON'T</span>
        <span class="line2">NEED THIS</span>
      </h1>
      <p class="hero-subtitle">Curated premium tech for those who appreciate the extraordinary.</p>
      <p class="hero-tagline">100+ exclusive items that redefine luxury gadgetry.</p>
      <div class="hero-buttons">
        <!-- Three Special Section Buttons -->
        <div class="special-buttons">
          <button class="special-btn" onclick="scrollToSection('portable-workstations')">
            Mobile Work Bundles
          </button>
          <button class="special-btn" onclick="scrollToSection('coolest-gadgets')">
            Coolest Stuff
          </button>
          <button class="special-btn" onclick="scrollToSection('featured-stuff')">
            Featured
          </button>
        </div>
        
        <!-- Search Bar with Category Dropdown -->
        <div class="search-wrapper">
          <div class="search-container">
            <input 
              type="text" 
              id="searchInput" 
              class="search-input" 
              placeholder="🔍 Search gadgets, laptops, cameras..."
              oninput="handleSearch(this.value)"
            />
            <div class="search-results" id="searchResults"></div>
          </div>
          <div class="category-dropdown-container">
            <button class="category-dropdown-btn" id="categoryBtn" onclick="toggleCategoryDropdown()">
              <span>Categories</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            <div class="category-dropdown-content" id="categoryDropdown"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Special Sections -->
  ${portableWorkstationsHTML}
  ${coolestGadgetsHTML}

  <!-- Hot Items Carousel -->
  <div id="featured-stuff">
    ${featuredItemsHTML}
  </div>

  <!-- Main Collection -->
  <main id="collection">
    <h2 class="section-title">Full Collection</h2>
    <div class="lots-grid">
      ${cardsHTML}
    </div>
  </main>

  <script>
    ${dropdownCategoriesScript}
    ${productsScript}

    let currentCategory = null;

    // Initialize category dropdown
    (function() {
      const categories = window.DROPDOWN_CATEGORIES;
      const dropdownContent = document.getElementById('categoryDropdown');
      
      categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.textContent = cat;
        item.onclick = (e) => {
          e.stopPropagation();
          filterByCategory(cat);
          updateDropdownUI(cat);
          toggleCategoryDropdown();
          document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
        };
        dropdownContent.appendChild(item);
      });

      // Add reset button
      const resetBtn = document.createElement('div');
      resetBtn.className = 'category-reset-btn';
      resetBtn.textContent = 'Show All';
      resetBtn.onclick = (e) => {
        e.stopPropagation();
        filterByCategory(null);
        updateDropdownUI(null);
        toggleCategoryDropdown();
      };
      dropdownContent.appendChild(resetBtn);
    })();

    // Smooth scroll to section
    function scrollToSection(sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Scroll to top
    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Show/hide home button based on scroll position
    window.addEventListener('scroll', function() {
      const homeBtn = document.getElementById('homeBtn');
      if (window.scrollY > 600) {
        homeBtn.classList.add('visible');
      } else {
        homeBtn.classList.remove('visible');
      }
    });

    function toggleCategoryDropdown() {
      const dropdown = document.getElementById('categoryDropdown');
      dropdown.classList.toggle('active');
      document.addEventListener('click', closeCategoryDropdownOnClick);
    }

    function closeCategoryDropdownOnClick(e) {
      const dropdown = document.getElementById('categoryDropdown');
      const btn = document.getElementById('categoryBtn');
      if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.classList.remove('active');
        document.removeEventListener('click', closeCategoryDropdownOnClick);
      }
    }

    function filterByCategory(category) {
      currentCategory = category;
      const cards = document.querySelectorAll('.lot-card');
      cards.forEach(card => {
        const indexStr = card.getAttribute('data-lot-index');
        const index = parseInt(indexStr);
        const product = window.PRODUCTS[index];
        
        if (!category) {
          card.classList.remove('hidden');
        } else {
          card.classList.toggle('hidden', product.category !== category);
        }
      });
    }

    function updateDropdownUI(category) {
      const items = document.querySelectorAll('.category-item');
      items.forEach(item => {
        item.classList.toggle('active', item.textContent === category);
      });
    }

    // Search functionality
    function handleSearch(query) {
      const searchResults = document.getElementById('searchResults');
      const input = query.toLowerCase().trim();
      
      if (input.length < 2) {
        searchResults.classList.remove('active');
        return;
      }
      
      const matches = window.PRODUCTS.filter(p => {
        const name = p.name.toLowerCase();
        const desc = p.description.toLowerCase();
        const tags = p.seoTags || [];
        
        return name.includes(input) || 
               desc.includes(input) || 
               tags.some(tag => tag.includes(input));
      });
      
      if (matches.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No items found</div>';
        searchResults.classList.add('active');
        return;
      }
      
      // Group by matching tags
      const tagGroups = {};
      matches.forEach(p => {
        const matchingTags = (p.seoTags || []).filter(tag => tag.includes(input));
        matchingTags.forEach(tag => {
          if (!tagGroups[tag]) tagGroups[tag] = [];
          tagGroups[tag].push(p);
        });
      });
      
      let html = '';
      
      // Show tag groups
      Object.keys(tagGroups).slice(0, 5).forEach(tag => {
        const count = tagGroups[tag].length;
        const escapedTag = tag.replace(/'/g, "\\'");
        html += '<div class="search-result-item" onclick="filterByTag(\\'' + escapedTag + '\\');">';
        html += '<span class="search-tag-match">' + tag + '</span> → ' + count + ' item' + (count > 1 ? 's' : '');
        html += '</div>';
      });
      
      // Show individual products
      matches.slice(0, 5).forEach(p => {
        const escapedLot = p.lot.replace(/'/g, "\\'");
        html += '<div class="search-result-item" onclick="scrollToProduct(\\'' + escapedLot + '\\');">';
        html += p.name + ' <span style="color: #ffcc00;">' + p.price + '</span>';
        html += '</div>';
      });
      
      searchResults.innerHTML = html;
      searchResults.classList.add('active');
    }
    
    function filterByTag(tag) {
      const cards = document.querySelectorAll('.lot-card');
      
      cards.forEach(card => {
        const indexStr = card.getAttribute('data-lot-index');
        const index = parseInt(indexStr);
        const product = window.PRODUCTS[index];
        const tags = product.seoTags || [];
        
        if (tags.includes(tag)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
      
      document.getElementById('searchResults').classList.remove('active');
      document.getElementById('searchInput').value = '';
      document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
    }
    
    function scrollToProduct(lotId) {
      const cards = document.querySelectorAll('.lot-card');
      cards.forEach(card => {
        const indexStr = card.getAttribute('data-lot-index');
        const index = parseInt(indexStr);
        const product = window.PRODUCTS[index];
        
        if (product.lot === lotId) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      
      document.getElementById('searchResults').classList.remove('active');
      document.getElementById('searchInput').value = '';
    }
    
    // Close search on outside click
    document.addEventListener('click', (e) => {
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(e.target)) {
        document.getElementById('searchResults').classList.remove('active');
      }
    });

    // Particle animation
    (function() {
      const canvas = document.getElementById('heroParticles');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let particles = [];

      function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }

      function createParticles() {
        particles = [];
        for (let i = 0; i < 80; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.3,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.5 + 0.1
          });
        }
      }

      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = \`rgba(255,215,0,\${p.opacity})\`;
          ctx.fill();
          p.x += p.dx;
          p.y += p.dy;
          if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        });
        requestAnimationFrame(animate);
      }

      resize();
      createParticles();
      animate();
      window.addEventListener('resize', () => { resize(); createParticles(); });
    })();

    // Expanded view
    let currentExpandedIndex = null;

    function generateCoolnessStars(rating) {
      const filled = Math.min(Math.max(rating, 0), 10);
      return '★'.repeat(filled) + '☆'.repeat(10 - filled);
    }

    function isVideo(url) {
      return url && (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.mov') || url.toLowerCase().endsWith('.webm'));
    }

    function mediaElement(url, alt, className) {
      if (isVideo(url)) {
        return \`<video src="\${url}" class="\${className}" controls muted loop playsinline></video>\`;
      }
      return \`<img src="\${url}" alt="\${alt}" class="\${className}" onerror="this.src='${PLACEHOLDER_IMAGE}'">\`;
    }

    function openExpanded(index) {
      const product = window.PRODUCTS[index];
      if (!product) return;

      const allMedia = product.photos.length > 0 ? product.photos : [product.thumbnail];
      const mainMedia = allMedia[0];

      const thumbsHTML = allMedia.map((url, i) => \`
        <div class="lot-gallery-thumb \${i === 0 ? 'active' : ''}" onclick="switchMedia(this, '\${url}', '\${product.name}')">
          \${mediaElement(url, 'Photo ' + (i+1), '')}
        </div>
      \`).join('');

      const contactMessage = encodeURIComponent(\`Hi, I'm interested in \${product.lot} - \${product.name}\`);
      const whatsappUrl = \`https://wa.me/${WHATSAPP_NUMBER}?text=\${contactMessage}\`;

      // Special layout for LOT_076 (stands): description above gallery
      const isStandsCollection = product.lot === 'LOT_076';

      const expandedHTML = \`
        <div class="lot-expanded" id="lotExpanded" onclick="handleOverlayClick(event)">
          <div class="lot-expanded-content">
            <button class="lot-expanded-close" onclick="closeExpanded()">✕</button>
            \${isStandsCollection ? \`
              <div class="lot-details-header">
                <div class="lot-details-number">\${product.lot}</div>
                <h2 class="lot-details-name">\${product.name}</h2>
                <p class="lot-details-tagline">\${product.tagline}</p>
              </div>
              \${product.description ? \`<div class="lot-details-section"><h4>What's Included</h4><p>\${product.description}</p><div class="lot-details-price-right">\${product.price}</div></div>\` : ''}
              \${product.specs ? \`<div class="lot-details-section"><h4>Specifications</h4><div class="lot-details-specs">\${product.specs}</div></div>\` : ''}
            \` : ''}
            <div class="lot-gallery">
              <div class="lot-gallery-main" id="galleryMain">
                \${mediaElement(mainMedia, product.name, '')}
              </div>
              <div class="lot-gallery-thumbs">\${thumbsHTML}</div>
            </div>
            \${!isStandsCollection ? \`
              <div class="lot-details">
                <div class="lot-details-header">
                  <div class="lot-details-number">\${product.lot}</div>
                  <h2 class="lot-details-name">\${product.name}</h2>
                  <p class="lot-details-tagline">\${product.tagline}</p>
                </div>
                \${product.description ? \`<div class="lot-details-section"><h4>Description</h4><p>\${product.description}</p><div class="lot-details-price-right">\${product.price}</div></div>\` : ''}
                \${product.specs ? \`<div class="lot-details-section"><h4>Specifications</h4><div class="lot-details-specs">\${product.specs}</div></div>\` : ''}
                <div class="lot-action-buttons">
                  \${product.referenceUrl ? \`<a href="\${product.referenceUrl}" target="_blank" rel="noopener noreferrer" class="lot-price-button">💰 Check Current Price</a>\` : ''}
                  <a href="\${whatsappUrl}" target="_blank" class="lot-contact-button">💬 Contact via WhatsApp</a>
                </div>
              </div>
            \` : \`
              <div class="lot-action-buttons" style="margin-top: 1.5rem;">
                <a href="\${whatsappUrl}" target="_blank" class="lot-contact-button">💬 Contact via WhatsApp</a>
              </div>
            \`}
          </div>
        </div>
      \`;

      document.body.insertAdjacentHTML('beforeend', expandedHTML);
      document.body.style.overflow = 'hidden';
      currentExpandedIndex = index;
    }

    function handleOverlayClick(event) {
      if (event.target.id === 'lotExpanded') closeExpanded();
    }

    function closeExpanded() {
      const expanded = document.getElementById('lotExpanded');
      if (expanded) expanded.remove();
      document.body.style.overflow = '';
      currentExpandedIndex = null;
    }

    function switchMedia(thumbEl, url, altText) {
      const main = document.getElementById('galleryMain');
      main.innerHTML = mediaElement(url, altText, '');
      document.querySelectorAll('.lot-gallery-thumb').forEach(t => t.classList.remove('active'));
      thumbEl.classList.add('active');
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeExpanded();
    });
  </script>
</body>
</html>`;

  return html;
}

// Main build function — async to support GitHub API calls
async function build() {
  try {
    if (!fs.existsSync(CSV_PATH)) {
      console.error(`Error: products.csv not found at ${CSV_PATH}`);
      process.exit(1);
    }

    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const products = parseCSV(csvContent);

    if (products.length === 0) {
      console.warn('Warning: No products found in CSV');
    }

    console.log(`✓ Parsed ${products.length} products from CSV`);
  const localInventoryExists = fs.existsSync(LOCAL_INVENTORY_PATH) && fs.statSync(LOCAL_INVENTORY_PATH).isDirectory();
  if (!localInventoryExists) {
    console.warn(`Warning: Local inventory folder not found at ${LOCAL_INVENTORY_PATH}. Photo discovery will fall back to placeholders.`);
  }

  for (const product of products) {
    if (!product.LOT && !product.FOLDER_NAME) continue;
    const lotNumber = extractLotNumber(product.LOT);
    const result = getPhotoUrls(lotNumber, product.FOLDER_NAME);
    product._thumbnail = result.thumbnail;
    product._photos = result.photos;
    process.stdout.write('.');
  }

    console.log('\n✓ Photo listings fetched');

    const html = generateHTML(products);

    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, html, 'utf-8');
    console.log(`✓ Generated ${OUTPUT_PATH}`);
    console.log('✓ Build complete!');

  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

build();
