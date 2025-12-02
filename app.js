// ==========================
// YDNT FINAL STACK (No Categories)
// ==========================

let siteConfig = { assetsBase: "../2. youdontneedthis-inventory" };
let allProducts = [];

async function loadConfig() {
  try {
    const res = await fetch('site_config.json');
    if (res.ok) siteConfig = await res.json();
  } catch (_) {}
}

function csvToObjects(csv) {
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines.shift().split(',').map(h => h.trim());
  return lines.map(line => {
    const cells = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; continue; }
      if (c === '"') { inQ = !inQ; continue; }
      if (c === ',' && !inQ) { cells.push(cur); cur = ''; continue; }
      cur += c;
    }
    cells.push(cur);
    const obj = {};
    headers.forEach((h, idx) => obj[h] = (cells[idx] ?? '').trim());
    return obj;
  });
}

function firstSentence(text) {
  if (!text) return '';
  const m = text.match(/(.+?[.!?])(\s|$)/);
  return m ? m[1] : text;
}

function buildThumbURL(p) {
  return `${siteConfig.assetsBase}/${p.FOLDER_NAME}/${p.LOT}_THUMBNAIL.jpg`;
}

function priceChipText(p) {
  return (p.PRICE || '').trim();
}

function priceHref(p) {
  const link = (p['PRICE ESTIMATE HYPERLINKS'] || '').trim();
  return link && /^https?:\/\//i.test(link) ? link : '';
}

function productCardHTML(p) {
  const thumb = buildThumbURL(p);
  const title = (p.OFFICIAL_NAME || p.LOT || '').trim();
  const tagline = (p.TAGLINE || '').trim();
  const desc = firstSentence(p.DESCRIPTION || '');
  const price = priceChipText(p);
  const link = priceHref(p);

  const priceChip = price
    ? `<a class="price-chip" ${link ? `href="${link}" target="_blank" rel="noopener"` : ''}>${price}</a>`
    : '';

  return `
    <div class="product-card">
      <div class="product-image-wrap">
        ${priceChip}
        <img class="product-image" loading="lazy"
             src="${thumb}"
             alt="${title}">
      </div>
      <div class="product-info">
        <h3 class="product-title">${title}</h3>
        ${tagline ? `<p class="product-tagline">${tagline}</p>` : ''}
        ${desc ? `<p class="product-description">${desc}</p>` : ''}
      </div>
    </div>
  `;
}

function renderGrid() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = allProducts.map(productCardHTML).join('');
}

async function init() {
  await loadConfig();
  const res = await fetch('products.csv');
  const text = await res.text();
  allProducts = csvToObjects(text);

  const score = p => {
    const raw = (p.COOLNESS_RATING || '').toString();
    const m = raw.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  };
  allProducts.sort((a, b) => score(b) - score(a));

  renderGrid();
}

document.addEventListener('DOMContentLoaded', init);
