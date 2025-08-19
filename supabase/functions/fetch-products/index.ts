
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
    
    console.log('Fetching from Google Sheets...')
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('Google Sheets API error:', data)
      throw new Error(`Google Sheets API error: ${data.error?.message || 'Unknown error'}`)
    }

    // Transform the raw data into product objects
    const [headers, ...rows] = data.values || []
    console.log(`Processing ${rows.length} products...`)
    
    const products = rows.map((row: string[], index: number) => {
      const folderName = row[1]?.trim() // Column B - FOLDER_NAME
      const officialName = row[2]?.trim() // Column C - OFFICIAL_NAME
      const price = row[6]?.trim() // Column G - PRICE
      const description = row[4]?.trim() // Column E - DESCRIPTION
      const category = row[8]?.trim() // Column I - CATEGORY
      const coolnessRating = row[3]?.trim() // Column D - COOLNESS_RATING
      const priceLink = row[7]?.trim() // Column H - PRICE ESTIMATE HYPERLINKS
      const specifications = row[5]?.trim() // Column F - SPECIFICATIONS
      
      // Only create image URL if folderName exists and is not empty
      const githubImageUrl = folderName && folderName !== '' 
        ? `https://raw.githubusercontent.com/NicholasDemeter/ydnt-inventory/main/${folderName}/image.jpg`
        : null
      
      // Parse rating
      let rating = 0
      if (coolnessRating) {
        if (coolnessRating.includes('5')) rating = 5
        else if (coolnessRating.includes('4')) rating = 4
        else if (coolnessRating.includes('3')) rating = 3
        else if (coolnessRating.includes('2')) rating = 2
        else if (coolnessRating.includes('1')) rating = 1
      }
      
      return {
        id: row[0]?.trim() || `product-${index}`, // Column A - LOT
        name: officialName || 'Unnamed Product',
        price: price || '$0',
        description: description || 'No description available',
        category: category || 'Uncategorized',
        rating: rating,
        image: githubImageUrl,
        status: 'Available',
        link: priceLink || '',
        priceLink: priceLink || '',
        folderName: folderName || '',
        specifications: specifications || ''
      }
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
