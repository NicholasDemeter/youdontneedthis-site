import type { Product } from "@/types/product"
import { promises as fs } from "fs"
import path from "path"

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
  let csvContent = ""

  try {
    // Server-side: read from file system
    const csvPath = path.join(process.cwd(), "public", "products.csv")
    csvContent = await fs.readFile(csvPath, "utf-8")
  } catch (error) {
    console.error("Failed to read products.csv:", error)
    return []
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
  try {
    const configPath = path.join(process.cwd(), "public", "site_config.json")
    const content = await fs.readFile(configPath, "utf-8")
    return JSON.parse(content)
  } catch {
    return {}
  }
}
