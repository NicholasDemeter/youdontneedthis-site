const ASSET_BASE = 'https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/main'

export interface LotMedia {
  photos: string[]
  videos: string[]
}

// Based on your inventory structure, we know the naming patterns
export async function getLotMedia(folderName: string, lotId: string): Promise<LotMedia> {
  // We'll construct URLs based on the known structure
  // Photos are in "LOT Photos" subfolder
  // Videos are in "Videos" subfolder
  
  const photos: string[] = []
  const videos: string[] = []
  
  // Try to fetch a manifest or construct URLs based on common patterns
  // For now, we'll return the base structure and load images client-side
  
  return {
    photos: [],
    videos: []
  }
}

// Helper to construct photo URLs for a LOT
export function getLotPhotoUrls(folderName: string, lotId: string, photoCount: number): string[] {
  const photos: string[] = []
  const photoFolder = `${ASSET_BASE}/${folderName}/LOT Photos`
  
  // Common image extensions
  const extensions = ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG']
  
  // Generate potential photo URLs based on common naming patterns
  for (let i = 1; i <= photoCount; i++) {
    // Try different naming patterns
    photos.push(`${photoFolder}/${lotId}_${i}.jpg`)
    photos.push(`${photoFolder}/${lotId}_Photo_${i}.jpg`)
    photos.push(`${photoFolder}/${i}.jpg`)
  }
  
  return photos
}

// Helper to construct video URLs for a LOT
export function getLotVideoUrls(folderName: string, lotId: string): string[] {
  const videoFolder = `${ASSET_BASE}/${folderName}/Videos`
  return [
    `${videoFolder}/${lotId}_Video.mp4`,
    `${videoFolder}/${lotId}.mp4`,
    `${videoFolder}/video.mp4`,
  ]
}
