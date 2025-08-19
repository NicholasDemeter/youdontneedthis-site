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
    const RANGE = 'Sheet1!A:I' // Adjust range as needed
    
    if (!GOOGLE_SHEETS_API_KEY) {
      throw new Error('Google Sheets API key not configured')
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${GOOGLE_SHEETS_API_KEY}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${data.error?.message || 'Unknown error'}`)
    }

    // Transform the raw data into product objects
    const [headers, ...rows] = data.values || []
    
    const products = rows.map((row: string[], index: number) => {
      const folderName = row[1] // Column B - FOLDER_NAME
      const githubImageUrl = folderName 
        ? `https://raw.githubusercontent.com/NicholasDemeter/premium-gadget-showcase/main/${folderName}/image.jpg`
        : `https://picsum.photos/600/400?random=${index + 10}`
      
      return {
        id: row[0] || `product-${index}`, // Column A - LOT
        name: row[2] || 'Unnamed Product', // Column C - OFFICIAL_NAME
        price: row[6] || '$0', // Column G - PRICE
        description: row[4] || 'No description available', // Column E - DESCRIPTION
        category: row[8] || 'Uncategorized', // Column I - CATEGORY
        rating: row[3] === '4 Stars' ? 4 : row[3] === '5 Stars' ? 5 : row[3] === '3 Stars' ? 3 : row[3] === '2 Stars' ? 2 : row[3] === '1 Star' ? 1 : 0, // Column D - COOLNESS_RATING
        image: githubImageUrl,
        status: 'Available',
        link: row[7] || '', // Column H - PRICE ESTIMATE HYPERLINKS
        folderName: folderName,
        specifications: row[5] || '' // Column F - SPECIFICATIONS
      }
    })

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