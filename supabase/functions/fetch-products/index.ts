
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
    
    const products = rows
      .filter((row: string[]) => {
        // Only include rows with valid data
        const folderName = row[1]?.trim()
        const officialName = row[2]?.trim()
        console.log(`Row filter check - folderName: "${folderName}", officialName: "${officialName}"`)
        return folderName && officialName && folderName !== '' && officialName !== ''
      })
      .map((row: string[], index: number) => {
        const folderName = row[1]?.trim()
        const officialName = row[2]?.trim()
        const price = row[6]?.trim()
        const description = row[4]?.trim()
        const category = row[8]?.trim()
        const coolnessRating = row[3]?.trim()
        const priceLink = row[7]?.trim()
        const specifications = row[5]?.trim()
        
        // Create GitHub image URL - only if folder name exists
        let githubImageUrl = null
        if (folderName && folderName !== '') {
          githubImageUrl = `https://raw.githubusercontent.com/NicholasDemeter/ydnt-inventory/main/${folderName}/image.jpg`
        }
        
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
          id: row[0]?.trim() || `product-${index}`,
          name: officialName,
          price: price || '$0',
          description: description || 'No description available',
          category: category || 'Uncategorized',
          rating: rating,
          image: githubImageUrl,
          status: 'Available',
          link: priceLink || '',
          priceLink: priceLink || '',
          folderName: folderName,
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
