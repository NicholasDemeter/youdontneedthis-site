const GITHUB_API_BASE = "https://api.github.com/repos/NicholasDemeter/youdontneedthis-inventory/contents"
const ASSET_BASE = "https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/main"

// Cache the folder mapping
let folderMappingCache: Map<string, string> | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

// Extract LOT_### prefix from folder name (e.g., "LOT_001_Some_Name" → "LOT_001")
function extractLotPrefix(folderName: string): string | null {
  const match = folderName.match(/^(LOT_\d{3})_/)
  return match ? match[1] : null
}

// Fetch all folders from GitHub and create mapping
export async function getFolderMapping(): Promise<Map<string, string>> {
  const now = Date.now()

  // Return cached mapping if still valid
  if (folderMappingCache && now - cacheTimestamp < CACHE_DURATION) {
    return folderMappingCache
  }

  try {
    const response = await fetch(GITHUB_API_BASE, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
    })

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`)
      return folderMappingCache || new Map()
    }

    const contents = await response.json()
    const mapping = new Map<string, string>()

    for (const item of contents) {
      if (item.type === "dir") {
        const lotPrefix = extractLotPrefix(item.name)
        if (lotPrefix) {
          mapping.set(lotPrefix, item.name)
        }
      }
    }

    // Update cache
    folderMappingCache = mapping
    cacheTimestamp = now

    return mapping
  } catch (error) {
    console.error("Failed to fetch folder mapping:", error)
    return folderMappingCache || new Map()
  }
}

// Get the full folder name for a LOT number
export async function getActualFolderName(lotNumber: string): Promise<string | null> {
  const mapping = await getFolderMapping()
  return mapping.get(lotNumber) || null
}

// Build thumbnail URL using actual folder name
export async function getThumbnailUrl(lotNumber: string): Promise<string> {
  const folderName = await getActualFolderName(lotNumber)
  if (!folderName) {
    return "/placeholder.svg?height=400&width=400"
  }
  return `${ASSET_BASE}/${folderName}/${lotNumber}_THUMBNAIL.jpg`
}

// Build photos folder base URL
export async function getPhotosBaseUrl(lotNumber: string): Promise<string | null> {
  const folderName = await getActualFolderName(lotNumber)
  if (!folderName) {
    return null
  }
  return `${ASSET_BASE}/${folderName}/Photos`
}

export { ASSET_BASE }
