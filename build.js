import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CSV_PATH = path.join(__dirname, 'products.csv');
const DIST_DIR = path.join(__dirname, 'dist');
const OUTPUT_PATH = path.join(DIST_DIR, 'index.html');
const INVENTORY_REPO_BASE = 'https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/main';
const HERO_VIDEO_URL = `${INVENTORY_REPO_BASE}/Carousel_HERO/Hero_Media.mp4`;
const WHATSAPP_NUMBER = '256780923638'; // Replace with actual number (no spaces, dashes, or brackets)
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

    // Simple CSV parsing - handles basic cases
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

// Generate photo URLs for a LOT
function generatePhotoUrls(folderName, lotNumber) {
  if (!folderName || !lotNumber) {
    return {
      thumbnail: PLACEHOLDER_IMAGE,
      photos: []
    };
  }

  const thumbnailUrl = `${INVENTORY_REPO_BASE}/${folderName}/LOT_${lotNumber}_THUMBNAIL.jpg`;
  const photos = [];

  // Generate URLs for photos 1 through 20
  for (let i = 1; i <= 20; i++) {
    photos.push(`${INVENTORY_REPO_BASE}/${folderName}/Photos/LOT_${lotNumber}_${i}.jpg`);
  }

  return {
    thumbnail: thumbnailUrl,
    photos: photos
  };
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

  // Generate product data JSON
  const productData = sorted.map(p => {
    const lotNumber = extractLotNumber(p.LOT);
    const photoUrls = generatePhotoUrls(p.FOLDER_NAME, lotNumber);
    const coolness = parseCoolnessRating(p.COOLNESS_RATING);

    return {
      lot: p.LOT,
      folderName: p.FOLDER_NAME,
      name: p.OFFICIAL_NAME || '',
      coolness: coolness,
      tagline: p.TAGLINE || '',
      description: p.DESCRIPTION || '',
      specs: p.SPECIFICATIONS || '',
      price: formatPrice(p.PRICE),
      category: p.CATEGORY || '',
      thumbnail: photoUrls.thumbnail,
      photos: photoUrls.photos,
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
          <div class="hot-item-card" data-lot-index="${productData.indexOf(product)}">
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
    <div class="lot-card" data-lot-index="${index}">
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
  const productsScript = `
    window.PRODUCTS = ${JSON.stringify(productData, null, 2)};
  `;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Premium tech items curated by youdontneedthis">
  <title>youdontneedthis — Premium Tech Items</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      line-height: 1.6;
    }

    /* Hero Section */
    .hero {
      position: relative;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #0a0a0a;
    }

    .hero-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 2;
    }

    .hero-particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 3;
    }

    .particle {
      position: absolute;
      width: 2px;
      height: 2px;
      background: rgba(255, 215, 0, 0.6);
      border-radius: 50%;
      animation: float linear infinite;
    }

    @keyframes float {
      0% {
        transform: translateY(0) translateX(0);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(-100vh) translateX(100px);
        opacity: 0;
      }
    }

    .hero-content {
      position: relative;
      z-index: 4;
      text-align: center;
      max-width: 900px;
      padding: 2rem;
    }

    .hero-title {
      font-size: clamp(2.5rem, 8vw, 5rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.1;
      margin-bottom: 1rem;
    }

    .hero-title-part1 {
      color: #8b5cf6;
      display: block;
    }

    .hero-title-part2 {
      color: #ffd700;
      display: block;
    }

    .hero-subtitle {
      font-size: clamp(0.95rem, 2vw, 1.2rem);
      color: #bbb;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .hero-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 3rem;
      flex-wrap: wrap;
    }

    .hero-button {
      padding: 0.8rem 1.8rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .hero-button-primary {
      background: #8b5cf6;
      color: #fff;
    }

    .hero-button-primary:hover {
      background: #7c3aed;
      transform: translateY(-2px);
    }

    .hero-button-secondary {
      background: #ffd700;
      color: #000;
    }

    .hero-button-secondary:hover {
      background: #ffed4e;
      transform: translateY(-2px);
    }

    .hero-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }

    .hero-stat {
      text-align: center;
    }

    .hero-stat-value {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      font-weight: 700;
      color: #ffd700;
      margin-bottom: 0.5rem;
    }

    .hero-stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #999;
    }

    header {
      background: transparent;
      border-bottom: none;
      padding: 2rem 1rem;
      text-align: center;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 5;
    }

    header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 0;
      color: #e0e0e0;
    }

    header p {
      display: none;
    }

    main {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1rem;
      background: #0a0a0a;
      position: relative;
      z-index: 0;
    }

    /* Hot Items Carousel */
    .hot-items-section {
      margin-bottom: 3rem;
    }

    .hot-items-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #ffd700;
    }

    .hot-items-carousel {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }

    .hot-items-carousel::-webkit-scrollbar {
      height: 6px;
    }

    .hot-items-carousel::-webkit-scrollbar-track {
      background: #1a1a1a;
      border-radius: 3px;
    }

    .hot-items-carousel::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 3px;
    }

    .hot-items-carousel::-webkit-scrollbar-thumb:hover {
      background: #666;
    }

    .hot-item-card {
      flex: 0 0 160px;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .hot-item-card:hover {
      border-color: #555;
      background: #222;
    }

    .hot-item-thumbnail {
      width: 100%;
      height: 120px;
      object-fit: cover;
      background: #111;
    }

    .hot-item-name {
      padding: 0.75rem;
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.2;
      color: #e0e0e0;
      flex: 1;
      display: flex;
      align-items: center;
    }

    /* Main Grid */
    .lots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .lot-card {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .lot-card:hover {
      border-color: #555;
      background: #222;
    }

    .lot-card-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .lot-thumbnail {
      width: 100%;
      height: 200px;
      object-fit: cover;
      background: #111;
    }

    .lot-info {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .lot-number {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.5rem;
    }

    .lot-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }

    .lot-tagline {
      font-size: 0.9rem;
      color: #999;
      margin-bottom: 1rem;
      flex: 1;
    }

    .lot-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .lot-price-badge {
      background: #333;
      color: #fff;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .lot-coolness {
      font-size: 0.9rem;
      color: #ffd700;
      letter-spacing: 0.05em;
    }

    /* Expanded view */
    .lot-expanded {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      overflow-y: auto;
    }

    .lot-expanded-content {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 12px;
      max-width: 900px;
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
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      color: #999;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
    }

    .lot-expanded-close:hover {
      color: #fff;
    }

    .lot-gallery {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .lot-gallery-main {
      width: 100%;
      aspect-ratio: 1;
      background: #111;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lot-gallery-main img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .lot-gallery-thumbs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
    }

    .lot-gallery-thumb {
      aspect-ratio: 1;
      background: #111;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s;
    }

    .lot-gallery-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .lot-gallery-thumb.active {
      border-color: #666;
    }

    .lot-gallery-thumb:hover {
      border-color: #555;
    }

    .lot-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .lot-details-header {
      padding-top: 2rem;
    }

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
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }

    .lot-details-tagline {
      font-size: 1rem;
      color: #999;
      margin-bottom: 1rem;
    }

    .lot-details-price {
      font-size: 1.5rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 0.5rem;
    }

    .lot-details-coolness {
      font-size: 0.9rem;
      color: #ffd700;
      margin-bottom: 1.5rem;
    }

    .lot-details-section {
      border-top: 1px solid #333;
      padding-top: 1rem;
    }

    .lot-details-section h4 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #999;
      margin-bottom: 0.5rem;
    }

    .lot-details-section p {
      font-size: 0.95rem;
      line-height: 1.6;
      color: #e0e0e0;
    }

    .lot-details-specs {
      font-size: 0.9rem;
      line-height: 1.8;
      color: #ccc;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .lot-contact-button {
      background: #25d366;
      color: #000;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      text-decoration: none;
      display: inline-block;
      text-align: center;
      margin-top: 1rem;
    }

    .lot-contact-button:hover {
      background: #20ba5a;
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: clamp(1.8rem, 6vw, 3rem);
      }

      .hero-buttons {
        gap: 0.75rem;
      }

      .hero-button {
        padding: 0.6rem 1.2rem;
        font-size: 0.9rem;
      }

      .hero-stats {
        gap: 1rem;
      }

      .lots-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }

      .lot-expanded-content {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 1.5rem;
        max-height: 95vh;
      }

      .lot-details-header {
        padding-top: 0;
      }

      .lot-details-name {
        font-size: 1.4rem;
      }

      .lot-details-price {
        font-size: 1.2rem;
      }

      .lot-gallery-thumbs {
        grid-template-columns: repeat(3, 1fr);
      }

      .hot-items-carousel {
        gap: 0.75rem;
      }

      .hot-item-card {
        flex: 0 0 140px;
      }

      .hot-item-thumbnail {
        height: 100px;
      }

      .hot-item-name {
        font-size: 0.75rem;
        padding: 0.5rem;
      }
    }

    @media (max-width: 480px) {
      .hero-title {
        font-size: clamp(1.5rem, 5vw, 2.2rem);
      }

      .hero-subtitle {
        font-size: 0.9rem;
      }

      .hero-buttons {
        flex-direction: column;
        gap: 0.5rem;
      }

      .hero-button {
        width: 100%;
        justify-content: center;
      }

      main {
        padding: 1rem 0.5rem;
      }

      .lots-grid {
        grid-template-columns: 1fr;
      }

      .lot-expanded-content {
        padding: 1rem;
      }

      .lot-expanded-close {
        top: 0.5rem;
        right: 0.5rem;
      }

      .hot-items-carousel {
        gap: 0.5rem;
      }

      .hot-item-card {
        flex: 0 0 120px;
      }

      .hot-item-thumbnail {
        height: 90px;
      }

      .hot-item-name {
        font-size: 0.7rem;
        padding: 0.4rem;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>youdontneedthis</h1>
  </header>

  <section class="hero">
    <video class="hero-video" autoplay muted loop playsinline>
      <source src="${HERO_VIDEO_URL}" type="video/mp4">
      Your browser does not support the video tag.
    </video>
    <div class="hero-overlay"></div>
    <div class="hero-particles" id="particlesContainer"></div>
    <div class="hero-content">
      <h1 class="hero-title">
        <span class="hero-title-part1">YOU DON'T</span>
        <span class="hero-title-part2">NEED THIS</span>
      </h1>
      <p class="hero-subtitle">
        Curated premium tech for those who appreciate the extraordinary.<br>
        100+ exclusive items that redefine luxury gadgetry.
      </p>
      <div class="hero-buttons">
        <button class="hero-button hero-button-primary" onclick="scrollToCollection()">⚡ Explore Collection</button>
        <button class="hero-button hero-button-secondary" onclick="scrollToFeatured()">Featured Items</button>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-value">100+</div>
          <div class="hero-stat-label">Premium Items</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-value">\$2M+</div>
          <div class="hero-stat-label">Total Value</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-value">5 ★</div>
          <div class="hero-stat-label">Curation Rating</div>
        </div>
      </div>
    </div>
  </section>

  <main>
    ${hotItemsHTML}
    <div class="lots-grid" id="lotsGrid">
      ${cardsHTML}
    </div>
  </main>

  <script>
    ${productsScript}

    // Particle animation
    function createParticles() {
      const container = document.getElementById('particlesContainer');
      const particleCount = Math.floor(window.innerWidth / 100);
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 8 + 12) + 's';
        particle.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(particle);
      }
    }

    createParticles();

    // Scroll functions
    function scrollToCollection() {
      document.getElementById('lotsGrid').scrollIntoView({ behavior: 'smooth' });
    }

    function scrollToFeatured() {
      const hotItems = document.querySelector('.hot-items-section');
      if (hotItems) {
        hotItems.scrollIntoView({ behavior: 'smooth' });
      } else {
        scrollToCollection();
      }
    }

    // Expanded view management
    let currentExpandedIndex = null;

    function generateCoolnessStars(rating) {
      const filled = Math.min(Math.max(rating, 0), 10);
      const empty = 10 - filled;
      return '★'.repeat(filled) + '☆'.repeat(empty);
    }

    function openExpanded(index) {
      const product = window.PRODUCTS[index];
      if (!product) return;

      const validPhotos = product.photos.filter(url => url);
      const mainImage = validPhotos.length > 0 ? validPhotos[0] : product.thumbnail;

      const thumbsHTML = validPhotos.map((photo, i) => \`
        <div class="lot-gallery-thumb \${i === 0 ? 'active' : ''}" onclick="switchPhoto(this, event)">
          <img src="\${photo}" alt="Photo \${i + 1}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
        </div>
      \`).join('');

      const contactMessage = encodeURIComponent(\`Hi, I'm interested in \${product.lot} - \${product.name}\`);
      const whatsappUrl = \`https://wa.me/${WHATSAPP_NUMBER}?text=\${contactMessage}\`;

      const expandedHTML = \`
        <div class="lot-expanded" onclick="closeExpanded(event)">
          <div class="lot-expanded-content" onclick="event.stopPropagation()">
            <button class="lot-expanded-close" onclick="closeExpanded()">✕</button>
            
            <div class="lot-gallery">
              <div class="lot-gallery-main">
                <img id="mainImage" src="\${mainImage}" alt="\${product.name}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
              </div>
              <div class="lot-gallery-thumbs">
                \${thumbsHTML}
              </div>
            </div>

            <div class="lot-details">
              <div class="lot-details-header">
                <div class="lot-details-number">\${product.lot}</div>
                <h2 class="lot-details-name">\${product.name}</h2>
                <p class="lot-details-tagline">\${product.tagline}</p>
                <div class="lot-details-price">\${product.price}</div>
                <div class="lot-details-coolness" title="Coolness Rating: \${product.coolness}/10">
                  \${generateCoolnessStars(product.coolness)}
                </div>
              </div>

              \${product.description ? \`
                <div class="lot-details-section">
                  <h4>Description</h4>
                  <p>\${product.description}</p>
                </div>
              \` : ''}

              \${product.specs ? \`
                <div class="lot-details-section">
                  <h4>Specifications</h4>
                  <div class="lot-details-specs">\${product.specs}</div>
                </div>
              \` : ''}

              <a href="\${whatsappUrl}" target="_blank" class="lot-contact-button">Contact via WhatsApp</a>
            </div>
          </div>
        </div>
      \`;

      document.body.insertAdjacentHTML('beforeend', expandedHTML);
      currentExpandedIndex = index;
    }

    function closeExpanded(event) {
      if (event && event.target.className !== 'lot-expanded') return;
      const expanded = document.querySelector('.lot-expanded');
      if (expanded) expanded.remove();
      currentExpandedIndex = null;
    }

    function switchPhoto(thumbElement, event) {
      event.stopPropagation();
      const mainImage = document.getElementById('mainImage');
      const newSrc = thumbElement.querySelector('img').src;
      mainImage.src = newSrc;

      document.querySelectorAll('.lot-gallery-thumb').forEach(t => t.classList.remove('active'));
      thumbElement.classList.add('active');
    }

    // Event listeners for main grid cards
    document.querySelectorAll('.lot-card').forEach((card, index) => {
      card.addEventListener('click', () => openExpanded(index));
    });

    // Event listeners for hot items carousel cards
    document.querySelectorAll('.hot-item-card').forEach((card) => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.lotIndex);
        openExpanded(index);
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && currentExpandedIndex !== null) {
        closeExpanded();
      }
    });
  </script>
</body>
</html>`;

  return html;
}

// Main build function
function build() {
  try {
    // Read CSV file
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

    // Generate HTML
    const html = generateHTML(products);

    // Create dist directory if it doesn't exist
    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    // Write HTML file
    fs.writeFileSync(OUTPUT_PATH, html, 'utf-8');
    console.log(`✓ Generated ${OUTPUT_PATH}`);
    console.log('✓ Build complete!');

  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

// Run build
build();
