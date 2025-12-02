"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import type { Product } from "@/types/product"

import { getActualFolderName, ASSET_BASE } from "@/lib/folder-mapping"

interface ProductGridProps {
  products: Product[]
}

async function findWorkingThumbnail(lot: string): Promise<string> {
  const folderName = await getActualFolderName(lot)

  if (!folderName) {
    return "/placeholder.svg?height=400&width=400"
  }

  // Try common thumbnail naming patterns
  const patterns = [
    `${ASSET_BASE}/${folderName}/${lot}_THUMBNAIL.jpg`,
    `${ASSET_BASE}/${folderName}/${lot}_THUMBNAIL.JPG`,
    `${ASSET_BASE}/${folderName}/${lot}_Thumbnail.jpg`,
    `${ASSET_BASE}/${folderName}/${lot}_thumbnail.jpg`,
    `${ASSET_BASE}/${folderName}/Thumbnail.jpg`,
    `${ASSET_BASE}/${folderName}/thumbnail.jpg`,
  ]

  return new Promise((resolve) => {
    let resolved = false
    let checkedCount = 0

    patterns.forEach((url) => {
      const img = new window.Image()

      img.onload = () => {
        if (!resolved) {
          resolved = true
          resolve(url)
        }
      }

      img.onerror = () => {
        checkedCount++
        if (checkedCount >= patterns.length && !resolved) {
          resolved = true
          resolve("/placeholder.svg?height=400&width=400")
        }
      }

      img.src = url
    })

    // Timeout fallback
    setTimeout(() => {
      if (!resolved) {
        resolved = true
        resolve("/placeholder.svg?height=400&width=400")
      }
    }, 3000)
  })
}

function ProductCard({ product }: { product: Product }) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("/placeholder.svg?height=400&width=400")
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    findWorkingThumbnail(product.lot).then((url) => {
      setThumbnailUrl(url)
      setImageLoading(false)
    })
  }, [product.lot])

  return (
    <Link href={`/lot/${product.lot}`}>
      <div className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-video bg-muted">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          <Image
            src={thumbnailUrl || "/placeholder.svg"}
            alt={product.officialName}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {product.price && product.priceLink && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(product.priceLink, "_blank", "noopener,noreferrer")
              }}
              className="absolute top-4 left-4 bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold text-sm hover:bg-yellow-500 transition-colors z-10 cursor-pointer"
            >
              {product.price}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.officialName}
          </h3>

          {/* Tagline in yellow */}
          <p className="text-yellow-400 font-medium mb-2 line-clamp-2">{product.tagline}</p>

          {/* Star Rating */}
          <div className="text-sm text-muted-foreground mt-auto">{product.coolnessRating} ⭐</div>
        </div>
      </div>
    </Link>
  )
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <section id="collection" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-balance">
          <span className="text-yellow-400">Complete</span> <span className="text-primary">Collection</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.lot} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
