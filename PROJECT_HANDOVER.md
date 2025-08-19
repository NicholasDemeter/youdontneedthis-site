# PROJECT HANDOVER MEMO

## PROJECT OVERVIEW
- **Goal**: Product catalog website displaying items from Google Sheets
- **Tech Stack**: React + TypeScript + Tailwind + Supabase + Vite
- **Current Status**: ⚠️ 90% complete, images not displaying correctly

## ARCHITECTURE

### Frontend (React App)
```
src/
├── pages/Index.tsx              # Main page layout
├── components/
│   ├── HeroSection.tsx          # Landing hero
│   ├── ProductGrid.tsx          # ⚠️ MAIN COMPONENT - fetches & displays products
│   ├── ProductCard.tsx          # Individual product display
│   ├── Navbar.tsx               # Navigation
│   └── Footer.tsx               # Footer
└── integrations/supabase/
    └── client.ts                # ✅ Supabase connection (working)
```

### Backend (Supabase)
```
supabase/functions/
└── fetch-products/
    └── index.ts                 # ⚠️ CRITICAL - Fetches from Google Sheets
```

## DATA FLOW
1. **ProductGrid.tsx** calls Supabase edge function `fetch-products`
2. **fetch-products/index.ts** fetches from Google Sheets API
3. Processes data & creates GitHub image URLs
4. Returns product array to frontend
5. **ProductCard.tsx** displays each product

## CURRENT ISSUES

### 🚨 PRIMARY PROBLEM
**Images not displaying correctly:**
- Some show placeholder/blurred backgrounds
- Some show filenames instead of images
- Surface Studio 2 shows actual image name but not rendering

### 🔍 ROOT CAUSE ANALYSIS
**Likely Issue**: Image URL generation logic in `fetch-products/index.ts`
```typescript
// Lines 82-85: Image URL construction may be flawed
const imageName = row[7]?.replace(/\s+/g, '-').toLowerCase() || 'placeholder'
const imageUrl = `https://raw.githubusercontent.com/yourusername/yourrepo/main/images/${folderName}/${imageName}.jpg`
```

**Evidence:**
- User reports it worked before with "real image names"
- Only Surface Studio 2 partially working
- Others show filenames = URL construction issue

## KEY FILES TO CHECK

### 1. Product Data Source
- **Google Sheets**: `1Pp6bvp4DoDJqVKIrNuN9N6zS_MhVex9UDRSC-nIGI6k`
- **Range**: `Sheet1!A1:I1000`
- **Column 8 (index 7)**: Contains image filenames

### 2. Image Processing Logic
- **File**: `supabase/functions/fetch-products/index.ts`
- **Lines 70-90**: Image URL generation
- **Lines 82-85**: Critical image name processing

### 3. Frontend Display
- **File**: `src/components/ProductCard.tsx`
- **Lines 45-65**: Image rendering with error handling

## SECRETS & CONFIG
```
✅ GOOGLE_SHEETS_API_KEY - configured
✅ SUPABASE_URL - configured  
✅ SUPABASE_ANON_KEY - configured
✅ Supabase connection - working
```

## DEBUGGING STRATEGY FOR NEXT AI

### Step 1: Verify Data Source
```typescript
// Add to fetch-products/index.ts line 75
console.log('Raw image data:', row[7])
console.log('Processed imageName:', imageName) 
console.log('Final imageUrl:', imageUrl)
```

### Step 2: Check Image URLs
- Verify GitHub repo structure matches URL pattern
- Test actual image URLs in browser
- Check image file naming conventions

### Step 3: Frontend Debugging
```typescript
// Add to ProductCard.tsx
console.log('Product image URL:', product.image)
```

## WORKING COMPONENTS
✅ Supabase connection
✅ Google Sheets API integration  
✅ Product data fetching
✅ UI components and styling
✅ Search and filtering
✅ Responsive design

## FAILING COMPONENTS
❌ Image URL generation/processing
❌ Image display in ProductCard

## NEXT STEPS
1. **Debug image URL construction** in fetch-products edge function
2. **Verify GitHub image repository** structure and naming
3. **Test individual image URLs** directly in browser
4. **Check Google Sheets data** format in column 8

## IMPORTANT NOTES
- User reports this worked previously with hardcoded setup
- Issue occurred when transitioning to Google Sheets integration
- Problem isolated to image handling, not data fetching
- Frontend error handling shows filenames instead of images

## FILES MODIFIED RECENTLY
- `supabase/functions/fetch-products/index.ts` (Google Sheets range fix)
- `src/components/ProductGrid.tsx` (Supabase client import fix)

**CRITICAL**: The core functionality is complete. This is purely an image URL/processing bug that should be fixable quickly once the image data flow is properly debugged.