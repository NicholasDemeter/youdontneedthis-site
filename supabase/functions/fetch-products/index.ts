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
    
    const products = rows.map((row: string[], index: number) => ({
      id: row[0] || `product-${index}`,
      name: row[1] || 'Unnamed Product',
      price: row[2] || '$0',
      description: row[3] || 'No description available',
      category: row[4] || 'Uncategorized',
      rating: parseFloat(row[5]) || 0,
      image: row[6] || `https://picsum.photos/600/400?random=${index + 10}`,
      status: row[7] || 'Available',
      link: row[8] || ''
    }))

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