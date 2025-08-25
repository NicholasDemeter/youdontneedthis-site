
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GOOGLE_SHEETS_API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY')
    const SHEET_ID = '1Pp6bvp4DoDJqVKIrNuN9N6zS_MhVex9UDRSC-nIGI6k'
    const RANGE = 'A1:Z1000' // Use generic range without sheet name
    
    if (!GOOGLE_SHEETS_API_KEY) {
      throw new Error('Google Sheets API key not configured')
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${GOOGLE_SHEETS_API_KEY}`
    
    console.log('Fetching from Google Sheets...')
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('Google Sheets API error:', data)
      throw new Error(`Google Sheets API error: ${data.error?.message || 'Unknown error'}`)
    }

    const [headers, ...rows] = data.values || []
    console.log(`Processing ${rows.length} products...`)
    console.log('Headers:', headers)
    console.log('First few rows:', rows.slice(0, 3))
    
    // Header-based mapping
    const headerNames = headers.map((h: string) => h.trim());
    const headerIndex = (key: string) => headerNames.findIndex(h => h.toLowerCase() === key.toLowerCase());
    const idx = {
      id: headerIndex('lot'),
      folderName: headerIndex('folder_name'),
      name: headerIndex('official_name'),
      description: headerIndex('description'),
      category: headerIndex('category'),
      rating: headerIndex('coolness_rating'),
      price: headerIndex('price'),
      priceLink: headerIndex('price estimate hyperlinks'),
      specifications: headerIndex('specifications'),
      image: headerIndex('image'),
    };
    const get = (i: number, r: string[]) => (i >= 0 && r[i] != null ? String(r[i]).trim() : '');
    
    const products = rows
      .filter((row: string[]) => {
        // Only include rows with valid data
        const folderName = get(idx.folderName, row)
        const officialName = get(idx.name, row)
        console.log(`Row filter check - folderName: "${folderName}", officialName: "${officialName}"`)
        return folderName && officialName && folderName !== '' && officialName !== ''
      })
      .map((row: string[], index: number) => {
        const folderName = get(idx.folderName, row)
        const officialName = get(idx.name, row)
        const price = get(idx.price, row)
        const description = get(idx.description, row)
        const category = get(idx.category, row)
        const coolnessRating = get(idx.rating, row)
        const priceLink = get(idx.priceLink, row)
        const specifications = get(idx.specifications, row)
        
        // Create GitHub image URLs - primary and alternative
        const repo = 'youdontneedthis-inventory';
        const folderRaw = (folderName || '').trim();

        // Primary: encode as-is (supports real spaces in a few legacy folders)
        const folderEnc = encodeURIComponent(folderRaw);

        // Alt: convert spaces/dashes to underscores to match most repo folder names
        const folderUnderscore = folderRaw
          .replace(/\s+/g, '_')
          .replace(/-+/g, '_');

        // Candidate image URLs
        const primaryImg = folderRaw ? `https://raw.githubusercontent.com/NicholasDemeter/${repo}/main/${folderEnc}/Photos/thumb.jpg` : null;
        const altImg = folderRaw ? `https://raw.githubusercontent.com/NicholasDemeter/${repo}/main/${encodeURIComponent(folderUnderscore)}/Photos/thumb.jpg` : null;
        
        // Parse rating
        let rating = 0
        if (coolnessRating) {
          if (coolnessRating.includes('5')) rating = 5
          else if (coolnessRating.includes('4')) rating = 4
          else if (coolnessRating.includes('3')) rating = 3
          else if (coolnessRating.includes('2')) rating = 2
          else if (coolnessRating.includes('1')) rating = 1
        }
        
        const sheetImage = idx.image >= 0 ? get(idx.image, row) : '';
        const isAbsolute = (u: string) => /^https?:\/\//i.test(u);
        
        const product = {
          id: get(idx.id, row) || `product-${index}`,
          name: officialName,
          price: price || '$0',
          description: description || 'No description available',
          category: category || 'Uncategorized',
          rating: rating,
          image: (sheetImage && isAbsolute(sheetImage)) ? sheetImage : primaryImg,
          image_alt: altImg,
          status: 'Available',
          link: priceLink || '',
          priceLink: priceLink || '',
          folderName: folderRaw,
          specifications: specifications || ''
        }
        
        console.log('IMAGE_DEBUG', { id: product.id, folderRaw, primaryImg, altImg });
        
        return product
      })

    console.log(`Successfully processed ${products.length} products`)
    
    return new Response(
      JSON.stringify({ products }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error fetching products:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch products', details: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
