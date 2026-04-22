import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CSV_PATH = path.join(__dirname, 'products.csv');
const DIST_DIR = path.join(__dirname, 'dist');
const OUTPUT_PATH = path.join(DIST_DIR, 'index.html');
const INVENTORY_REPO_BASE = 'https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/main';
const INVENTORY_API_BASE = 'https://api.github.com/repos/NicholasDemeter/youdontneedthis-inventory/contents';
const HERO_VIDEO_URL = `${INVENTORY_REPO_BASE}/Carousel_HERO/Hero_Media.mp4`;
const WHATSAPP_NUMBER = '256780923638';
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="18" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image Available%3C/text%3E%3C/svg%3E';

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

// Fetch all photos for a LOT from GitHub API
// Returns every file in Photos/ that starts with LOT_### (any naming pattern)
async function getPhotoUrls(lotNumber, allFolders) {
  if (!lotNumber) return { thumbnail: PLACEHOLDER_IMAGE, photos: [] };

  const prefix = `LOT_${lotNumber}`;
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'YDNT-Build-Script',
    ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
  };

  // Find folder in inventory repo that starts with LOT_### prefix — ignore Column B entirely
  const lotFolder = allFolders.find(
    item => item.type === 'dir' && item.name.toUpperCase().startsWith(prefix.toUpperCase() + '_')
  );

  if (!lotFolder) {
    console.warn(`  ⚠ No folder found for ${prefix}`);
    return { thumbnail: PLACEHOLDER_IMAGE, photos: [] };
  }

  const folderName = lotFolder.name;
  const thumbnailUrl = `${INVENTORY_REPO_BASE}/${folderName}/${prefix}_THUMBNAIL.jpg`;

  try {
    const photosResponse = await fetch(`${INVENTORY_API_BASE}/${encodeURIComponent(folderName)}/Photos`, { headers });
    if (!photosResponse.ok) {
      console.warn(`  ⚠ No Photos folder in ${folderName}`);
      return { thumbnail: thumbnailUrl, photos: [] };
    }

    const photoFiles = await photosResponse.json();
    const photos = photoFiles
      .filter(f => f.type === 'file' && f.name.toUpperCase().startsWith(prefix.toUpperCase()))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map(f => `${INVENTORY_REPO_BASE}/${folderName}/Photos/${f.name}`);

    return { thumbnail: thumbnailUrl, photos };

  } catch (err) {
    console.warn(`  ⚠ Failed to fetch photos for ${prefix}: ${err.message}`);
    return { thumbnail: thumbnailUrl, photos: [] };
  }
}

// Format price for display
function formatPrice(price) {
  if (!price || price.toLowerCase() === 'make an offer' || price.trim() === '') {
    return 'Make an offer';
  }
  return price;
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

  // Generate product data JSON (photos already resolved via API)
  const productData = sorted.map(p => {
    const lotNumber = extractLotNumber(p.LOT);
    const coolness = parseCoolnessRating(p.COOLNESS_RATING);

    return {
      lot: p.LOT,
      folderName: p.FOLDER_NAME,
      lotNumber: lotNumber,
      name: p.OFFICIAL_NAME || '',
      coolness: coolness,
      tagline: p.TAGLINE || '',
      description: p.DESCRIPTION || '',
      specs: p.SPECIFICATIONS || '',
      price: formatPrice(p.PRICE),
      category: p.CATEGORY || '',
      thumbnail: p._thumbnail || PLACEHOLDER_IMAGE,
      photos: p._photos || [],
      referenceUrl: p['PRICE ESTIMATE HYPERLINKS'] || ''
    };
  });

  // Filter hot items (coolness >= 6)
  const hotItems = productData.filter(p => p.coolness >= 6);

  // Generate coolness star HTML
  function generateCoolnessStars(rating) {
    const filled = Math.min(Math.max(rating, 0), 10);
    const empty = 10 - filled;
    return '★'.repeat(filled) + '☆'.repeat(empty);
  }

  // Generate hot items carousel HTML
  const hotItemsHTML = hotItems.length > 0 ? `
    <section class="hot-items-section">
      <h2 class="hot-items-title">🔥 Hot Items</h2>
      <div class="hot-items-carousel">
        ${hotItems.map((product, index) => `
          <div class="hot-item" data-lot-index="${productData.indexOf(product)}" onclick="openExpanded(${productData.indexOf(product)})">
            <img src="${product.thumbnail}" alt="${product.name}" class="hot-item-thumbnail" onerror="this.src='${PLACEHOLDER_IMAGE}'">
            <div class="hot-item-name">${product.name}</div>
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  // Generate product cards HTML
  const cardsHTML = productData.map((product, index) => {
    const coolnessStars = generateCoolnessStars(product.coolness);
    return `
    <div class="lot-card" data-lot-index="${index}" onclick="openExpanded(${index})">
      <div class="lot-card-content">
        <img src="${product.thumbnail}" alt="${product.name}" class="lot-thumbnail" onerror="this.src='${PLACEHOLDER_IMAGE}'">
        <div class="lot-info">
          <div class="lot-number">${product.lot}</div>
          <h3 class="lot-name">${product.name}</h3>
          <p class="lot-tagline">${product.tagline}</p>
          <div class="lot-footer">
            <span class="lot-price-badge">${product.price}</span>
            <span class="lot-coolness" title="Coolness Rating: ${product.coolness}/10">${coolnessStars}</span>
          </div>
        </div>
      </div>
    </div>
    `;
  }).join('');

  // Generate product data script
  const productsScript = `window.PRODUCTS = ${JSON.stringify(productData, null, 2)};`;

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
      font-size: clamp(3rem, 10vw, 7rem);
      font-weight: 900;
      line-height: 1;
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
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 3rem;
    }

    .hero-btn-primary {
      background: #7c3aed;
      color: #fff;
      padding: 0.8rem 2rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: background 0.2s;
    }
    .hero-btn-primary:hover { background: #6d28d9; }

    .hero-btn-secondary {
      background: #FFD700;
      color: #000;
      padding: 0.8rem 2rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: background 0.2s;
    }
    .hero-btn-secondary:hover { background: #f0c800; }

    .hero-stats {
      display: flex;
      gap: 3rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .hero-stat { text-align: center; }
    .hero-stat-value { font-size: 2rem; font-weight: 700; color: #7c3aed; }
    .hero-stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #888; }

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
      justify-content: space-between;
      align-items: center;
    }

    .lot-price-badge {
      background: #222;
      color: #FFD700;
      padding: 0.3rem 0.7rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      border: 1px solid #333;
    }

    .lot-coolness { font-size: 0.8rem; color: #ffd700; }

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

    .lot-details-price { font-size: 1.4rem; font-weight: 600; color: #FFD700; }

    .lot-details-coolness { font-size: 0.85rem; color: #ffd700; }

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
      margin-top: 0.5rem;
      transition: background 0.2s;
    }

    .lot-contact-button:hover { background: #20ba5a; }

    @media (max-width: 768px) {
      .hero-title { font-size: 3rem; }
      .lot-expanded-content { grid-template-columns: 1fr; padding: 1.5rem; }
      .lot-details-header { padding-top: 0; }
      .lots-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
      .lot-thumbnail { height: 160px; }
    }
  </style>
</head>
<body>

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
        <a href="#collection" class="hero-btn-primary">⚡ Explore Collection</a>
        <a href="#hot-items" class="hero-btn-secondary">Featured Items</a>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-value">100+</div>
          <div class="hero-stat-label">Premium Items</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-value">$2M+</div>
          <div class="hero-stat-label">Total Value</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-value">5★</div>
          <div class="hero-stat-label">Curation Rating</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Hot Items Carousel -->
  <div id="hot-items">
    ${hotItemsHTML}
  </div>

  <!-- Main Collection -->
  <main id="collection">
    <h2 class="section-title">Full Collection</h2>
    <div class="lots-grid">
      ${cardsHTML}
    </div>
  </main>

  <script>
    ${productsScript}

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

      const expandedHTML = \`
        <div class="lot-expanded" id="lotExpanded" onclick="handleOverlayClick(event)">
          <div class="lot-expanded-content">
            <button class="lot-expanded-close" onclick="closeExpanded()">✕</button>
            <div class="lot-gallery">
              <div class="lot-gallery-main" id="galleryMain">
                \${mediaElement(mainMedia, product.name, '')}
              </div>
              <div class="lot-gallery-thumbs">\${thumbsHTML}</div>
            </div>
            <div class="lot-details">
              <div class="lot-details-header">
                <div class="lot-details-number">\${product.lot}</div>
                <h2 class="lot-details-name">\${product.name}</h2>
                <p class="lot-details-tagline">\${product.tagline}</p>
                <div class="lot-details-price">\${product.price}</div>
                <div class="lot-details-coolness">\${generateCoolnessStars(product.coolness)}</div>
              </div>
              \${product.description ? \`<div class="lot-details-section"><h4>Description</h4><p>\${product.description}</p></div>\` : ''}
              \${product.specs ? \`<div class="lot-details-section"><h4>Specifications</h4><div class="lot-details-specs">\${product.specs}</div></div>\` : ''}
              <a href="\${whatsappUrl}" target="_blank" class="lot-contact-button">💬 Contact via WhatsApp</a>
            </div>
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
    console.log('Fetching photo listings from GitHub API...');

    // Fetch inventory repo root folder list ONCE
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'YDNT-Build-Script',
      ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
    };
    const rootResponse = await fetch(INVENTORY_API_BASE, { headers });
    if (!rootResponse.ok) {
      console.error(`Failed to fetch inventory repo root: ${rootResponse.status}`);
      process.exit(1);
    }
    const allFolders = await rootResponse.json();
    console.log(`✓ Found ${allFolders.filter(f => f.type === 'dir').length} folders in inventory repo`);

    // Fetch photos for each LOT using prefix matching — Column B is ignored
    for (const product of products) {
      if (!product.LOT) continue;
      const lotNumber = extractLotNumber(product.LOT);
      const result = await getPhotoUrls(lotNumber, allFolders);
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
