# You Don't Need This (YDNT) - Technical Documentation

## Project Overview

**Site Type:** Next.js 16 Static Export (SSG)  
**Framework:** Next.js 16.0.3 with React 19.2  
**Styling:** Tailwind CSS v4 with shadcn/ui components  
**Deployment Target:** Static hosting (Vercel, Netlify, GitHub Pages, etc.)

This is a premium tech boutique e-commerce site that showcases curated gadgets and technology products. The site is fully static (no server-side runtime required) and pulls product data from a CSV file and media assets from a GitHub repository.

---

## Repository Structure

\`\`\`
project-root/
├── app/                          # Next.js 16 App Router
│   ├── globals.css              # Tailwind v4 theme configuration
│   ├── layout.tsx               # Root layout with header & cursor effects
│   ├── page.tsx                 # Homepage (hero + carousel + product grid)
│   └── lot/[id]/page.tsx        # Dynamic product detail pages
│
├── components/                   # React components
│   ├── hero-section.tsx         # Hero with featured products
│   ├── carousel-section.tsx     # Auto-scrolling product carousel
│   ├── product-grid.tsx         # Filterable product grid
│   ├── lot-image-gallery.tsx    # Product detail image gallery
│   ├── lot-video-player.tsx     # Video player for product demos
│   ├── site-header.tsx          # Navigation header
│   ├── cursor-sparkle.tsx       # Custom cursor effect
│   └── ui/                      # shadcn/ui component library
│
├── lib/                          # Utility functions
│   ├── get-products.ts          # CSV parser & product loader
│   ├── get-lot-media.ts         # Media URL constructors
│   ├── folder-mapping.ts        # GitHub API integration
│   └── utils.ts                 # Tailwind class utilities (cn)
│
├── types/
│   └── product.ts               # TypeScript Product interface
│
├── public/                       # Static assets
│   ├── products.csv             # **CORE DATA SOURCE** (see below)
│   ├── site_config.json         # Site configuration
│   └── *.png, *.svg             # Icons and placeholders
│
├── next.config.mjs              # Next.js config (static export)
├── package.json                 # Dependencies
└── tsconfig.json                # TypeScript config
\`\`\`

---

## How the Site Works

### 1. Static Generation (Build Time)

The site uses **Next.js Static Export** (`output: 'export'` in next.config.mjs):

- At build time, Next.js generates static HTML/CSS/JS files
- Product data is read from `public/products.csv` during build
- Each product gets a static page at `/lot/[LOT_ID]`
- No server required - can be deployed to any static host

### 2. Data Flow Architecture

\`\`\`
BUILD TIME:
public/products.csv 
    ↓ (read by lib/get-products.ts)
Product[] array
    ↓ (consumed by app/page.tsx)
Static HTML pages generated

RUNTIME (Browser):
GitHub Repository (youdontneedthis-inventory)
    ↓ (fetched by lib/folder-mapping.ts)
Product images/videos loaded dynamically
\`\`\`

---

## Core Data Source: products.csv

**Location:** `public/products.csv`  
**Purpose:** Single source of truth for all product information

### CSV Structure

\`\`\`csv
LOT,FOLDER_NAME,OFFICIAL_NAME,COOLNESS_RATING,TAGLINE,DESCRIPTION,SPECIFICATIONS,PRICE,PRICE ESTIMATE HYPERLINKS,CATEGORY
\`\`\`

### Field Definitions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `LOT` | string | Unique identifier (LOT_001, LOT_002, etc.) | `LOT_001` |
| `FOLDER_NAME` | string | GitHub folder name (legacy, not actively used) | `LOT_001_Microsoft_Surface_Go` |
| `OFFICIAL_NAME` | string | Display name of product | `Microsoft Surface Go 3` |
| `COOLNESS_RATING` | string | 1-7 stars (parsed to number) | `4 Stars` |
| `TAGLINE` | string | Short marketing tagline | `Portable power for real tasks` |
| `DESCRIPTION` | string | Full product description (HTML-ready) | Multi-paragraph text |
| `SPECIFICATIONS` | string | Technical specs (pipe-separated) | `Display \| 10.5-inch \| Processor \| Intel Core i3` |
| `PRICE` | string | Price range | `$399-$549` |
| `PRICE ESTIMATE HYPERLINKS` | string | Link to vendor/pricing info | `https://microsoft.com/...` |
| `CATEGORY` | string | Product category for filtering | `Gadgets > Portable Display` |

### Coolness Rating System

Products are sorted and featured based on coolness rating (1-7 stars):

- **7 Stars:** Hero featured products (top of homepage)
- **6 Stars:** Carousel products (auto-scrolling section)
- **1-5 Stars:** Standard grid products

**Parser Logic:** `lib/get-products.ts` extracts number from "X Stars" format

---

## Media Assets (GitHub Integration)

### GitHub Repository

**Repository:** `NicholasDemeter/youdontneedthis-inventory` (public)  
**Base URL:** `https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/main`

### Folder Structure (in GitHub repo)

\`\`\`
youdontneedthis-inventory/
├── LOT_001_Microsoft_Surface_Go_3.../
│   ├── LOT_001_THUMBNAIL.jpg        # Grid thumbnail
│   ├── LOT Photos/                   # Detail page photos
│   │   ├── LOT_001_1.jpg
│   │   ├── LOT_001_2.jpg
│   │   └── ...
│   └── Videos/                       # Product demo videos
│       └── LOT_001_Video.mp4
│
├── LOT_002_Microsoft_Surface_Studio.../
│   └── (same structure)
│
└── Carousel_HERO/
    └── Hero_Media.mp4               # Homepage hero video
\`\`\`

### How Media Loading Works

1. **Folder Name Resolution:** `lib/folder-mapping.ts` fetches GitHub repo contents via API to map `LOT_001` → actual folder name
2. **URL Construction:** Helper functions build image/video URLs dynamically
3. **Caching:** Folder mapping is cached for 1 hour to reduce API calls

**Key Functions:**
- `getFolderMapping()` - Fetches all folders from GitHub
- `getThumbnailUrl(lotId)` - Returns thumbnail URL
- `getLotPhotoUrls(folderName, lotId)` - Returns array of photo URLs
- `getLotVideoUrls(folderName, lotId)` - Returns array of video URLs

---

## Key Pages & Components

### Homepage (`app/page.tsx`)

**Data Loading:**
\`\`\`typescript
const products = await getProducts()  // Read from CSV
const featuredProducts = products.filter(p => p.coolnessRating === 7)
const carouselProducts = products.filter(p => p.coolnessRating === 6)
\`\`\`

**Sections:**
1. **Hero Section:** Full-screen video background with 7-star products
2. **Carousel Section:** Auto-scrolling showcase of 6-star products
3. **Product Grid:** Filterable grid of all products

### Product Detail Page (`app/lot/[id]/page.tsx`)

**Dynamic Route:** `/lot/LOT_001`, `/lot/LOT_002`, etc.

**Components:**
- `LotImageGallery` - Lightbox-style photo viewer
- `LotVideoPlayer` - Embedded video player
- Product specifications table
- WhatsApp contact CTA (from site_config.json)

**Static Generation:**
\`\`\`typescript
export async function generateStaticParams() {
  const products = await getProducts()
  return products.map(p => ({ id: p.lot }))
}
\`\`\`

---

## Configuration Files

### next.config.mjs

\`\`\`javascript
{
  output: 'export',              // Enable static export
  typescript: {
    ignoreBuildErrors: true      // Skip TS errors during build
  },
  images: {
    unoptimized: true,           // Required for static export
    remotePatterns: [            // Allow GitHub images
      'raw.githubusercontent.com/NicholasDemeter/...'
    ]
  }
}
\`\`\`

### public/site_config.json

**Site-wide settings:**
- `assetsBase` - GitHub repository base URL
- `whatsapp` - Contact number and message template
- `site.title/description` - SEO metadata
- `site.theme` - Color palette (synced with globals.css)
- `features` - Toggle cursor effects, autoplay, etc.

---

## Styling System

### Tailwind CSS v4 with Theme Tokens

**Design tokens defined in `app/globals.css`:**

\`\`\`css
@theme inline {
  --font-sans: 'Inter', 'system-ui', sans-serif;
  --color-background: #0b0b12;     /* Dark navy */
  --color-foreground: #f1f5f9;     /* Light text */
  --color-primary: #8b5cf6;        /* Purple accent */
  --color-accent: #facc15;         /* Gold accent */
  /* ... more tokens */
}
\`\`\`

**Usage in components:**
\`\`\`tsx
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
\`\`\`

### shadcn/ui Components

**Pre-installed components:** Button, Card, Dialog, Carousel, etc.  
**Location:** `components/ui/`  
**Customization:** Edit component files or extend via `lib/utils.ts` (cn helper)

---

## Development Workflow

### Setup

\`\`\`bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Generate static export
npm run start        # Preview production build
\`\`\`

### Build Output

**Location:** `out/` directory  
**Contents:** Static HTML/CSS/JS files ready for deployment

### Deployment

**Supported platforms:**
- Vercel (automatic, zero config)
- Netlify (drag & drop `out/` folder)
- GitHub Pages (upload `out/` contents)
- Any static web server

---

## Modifying Content

### Adding a New Product

1. **Add row to `public/products.csv`:**
   \`\`\`csv
   LOT_100,LOT_100_New_Product_Name,New Product Name,5 Stars,Catchy tagline,...
   \`\`\`

2. **Upload media to GitHub repo:**
   \`\`\`
   youdontneedthis-inventory/
   └── LOT_100_New_Product_Name/
       ├── LOT_100_THUMBNAIL.jpg
       └── LOT Photos/
           └── LOT_100_1.jpg
   \`\`\`

3. **Rebuild site:**
   \`\`\`bash
   npm run build
   \`\`\`

### Updating Existing Product

1. Edit the corresponding row in `products.csv`
2. Rebuild site (changes are applied at build time)

### Changing Site Colors

Edit `app/globals.css`:
\`\`\`css
@theme inline {
  --color-primary: #your-color;
  --color-accent: #your-accent;
}
\`\`\`

---

## Important Notes for AI Takeover

### Critical Files to Understand

1. **`public/products.csv`** - All product data lives here
2. **`lib/get-products.ts`** - CSV parser (handles quoted fields, coolness ratings)
3. **`lib/folder-mapping.ts`** - GitHub integration for media
4. **`app/page.tsx`** - Homepage composition
5. **`app/globals.css`** - Theme system

### Static Export Limitations

- **No server-side runtime** - All data fetched at build time
- **No dynamic API routes** - Cannot use `app/api/*` endpoints
- **Image optimization disabled** - Uses unoptimized images
- **External media** - Images served from GitHub (not in build output)

### Data Update Strategy

**Current approach:**
1. Update `products.csv` locally
2. Commit changes to repo
3. Rebuild & redeploy site

**Alternative approach (if you need dynamic updates):**
- Convert to full Next.js SSR (remove `output: 'export'`)
- Use database instead of CSV
- Add API routes for product management

### GitHub API Rate Limits

`lib/folder-mapping.ts` caches folder mappings for 1 hour to avoid hitting GitHub API rate limits (60 requests/hour unauthenticated).

**To increase limit:** Add GitHub token to `folder-mapping.ts`:
\`\`\`typescript
headers: {
  'Authorization': `token ${process.env.GITHUB_TOKEN}`
}
\`\`\`

---

## TypeScript Interfaces

### Product Interface (`types/product.ts`)

\`\`\`typescript
export interface Product {
  lot: string              // LOT_001
  folderName: string       // GitHub folder name
  officialName: string     // Display name
  coolnessRating: number   // 1-7 (parsed from "X Stars")
  tagline: string          // Marketing tagline
  description: string      // Full description
  specifications: string   // Pipe-separated specs
  price: string            // Price range
  priceLink: string        // Vendor URL
  category: string         // Product category
  imageUrl: string         // Thumbnail URL (populated at runtime)
}
\`\`\`

---

## Performance Optimizations

1. **Static Generation** - All pages pre-rendered at build time
2. **GitHub CDN** - Media served from GitHub's global CDN
3. **Folder Mapping Cache** - 1-hour cache for GitHub API calls
4. **Lazy Loading** - Images load as user scrolls
5. **Component Code Splitting** - Next.js automatically splits bundles

---

## Browser Compatibility

- **Modern browsers** - Chrome, Firefox, Safari, Edge (latest 2 versions)
- **JavaScript required** - No fallback for disabled JS
- **CSS Grid/Flexbox** - Used extensively (IE11 not supported)

---

## Contact & Support

**WhatsApp Contact:** Configured in `public/site_config.json`  
**Format:** `https://wa.me/{number}?text={template}`

---

## Quick Reference Commands

\`\`\`bash
# Development
npm run dev              # Start dev server
npm run build            # Build static site
npm run lint             # Run ESLint

# File locations
public/products.csv      # Product data
public/site_config.json  # Site settings
app/globals.css          # Theme configuration
lib/get-products.ts      # CSV parser
\`\`\`

---

## Architecture Summary

**Build Time:**
- CSV → Product[] array → Static HTML pages

**Runtime:**
- GitHub API → Folder mapping → Image URLs
- No backend, no database, no server

**Key Insight:** This is a JAMstack site (JavaScript, APIs, Markup) that uses a CSV file as a CMS and GitHub as a headless media storage system.
