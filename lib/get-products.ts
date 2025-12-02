import type { Product } from "@/types/product"

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function parseCoolnessRating(rating: string): number {
  const match = rating.match(/(\d+)\s*[Ss]tar/)
  return match ? Number.parseInt(match[1]) : 0
}

export async function getProducts(): Promise<Product[]> {
  let csvContent: string

  // Use absolute URL for server-side, relative for client
  if (typeof window === "undefined") {
    // Server-side during build - read file directly
    try {
      const fs = require("fs")
      const path = require("path")
      const csvPath = path.join(process.cwd(), "public", "products.csv")
      csvContent = fs.readFileSync(csvPath, "utf-8")
    } catch {
      // Fallback for environments where fs isn't available
      csvContent = ""
    }
  } else {
    // Client-side: fetch from URL
    const response = await fetch("/products.csv")
    csvContent = await response.text()
  }

  if (!csvContent) return []

  const lines = csvContent.split("\n").filter((line) => line.trim())
  const headers = parseCSVLine(lines[0])

  const products: Product[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])

    if (values.length < headers.length) continue

    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })

    const lot = row["LOT"] || ""

    // Skip invalid LOT formats
    if (!lot || !lot.match(/^LOT_\d{3}$/)) continue

    products.push({
      lot,
      folderName: "",
      officialName: row["OFFICIAL_NAME"] || "",
      coolnessRating: parseCoolnessRating(row["COOLNESS_RATING"] || ""),
      tagline: row["TAGLINE"] || "",
      description: row["DESCRIPTION"] || "",
      specifications: row["SPECIFICATIONS"] || "",
      price: row["PRICE"] || "",
      priceLink: row["PRICE ESTIMATE HYPERLINKS"] || "",
      category: row["CATEGORY"] || "",
      imageUrl: "",
    })
  }

  return products.sort((a, b) => b.coolnessRating - a.coolnessRating)
}

export async function getSiteConfig() {
  if (typeof window === "undefined") {
    try {
      const fs = require("fs")
      const path = require("path")
      const configPath = path.join(process.cwd(), "public", "site_config.json")
      const content = fs.readFileSync(configPath, "utf-8")
      return JSON.parse(content)
    } catch {
      return {}
    }
  } else {
    const response = await fetch("/site_config.json")
    return response.json()
  }
}
