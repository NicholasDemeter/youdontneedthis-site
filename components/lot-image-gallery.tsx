"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types/product"
import { getActualFolderName, ASSET_BASE } from "@/lib/folder-mapping"

interface LotImageGalleryProps {
  product: Product
}

async function tryLoadImages(lot: string): Promise<string[]> {
  const folderName = await getActualFolderName(lot)

  if (!folderName) {
    return []
  }

  return new Promise((resolve) => {
    const images: string[] = []
    const maxImages = 20
    let completedChecks = 0
    const totalChecks = maxImages * 4 // 4 patterns per image number

    const patterns = [
      (i: number) => `${ASSET_BASE}/${folderName}/Photos/${lot}_${i}.jpg`,
      (i: number) => `${ASSET_BASE}/${folderName}/Photos/${lot}_${String(i).padStart(3, "0")}.jpg`,
      (i: number) => `${ASSET_BASE}/${folderName}/Photos/${lot}_${i}.JPG`,
      (i: number) => `${ASSET_BASE}/${folderName}/Photos/${lot}_${String(i).padStart(3, "0")}.JPG`,
    ]

    for (let i = 1; i <= maxImages; i++) {
      for (const pattern of patterns) {
        const url = pattern(i)
        const img = new window.Image()

        img.onload = () => {
          if (!images.includes(url)) {
            images.push(url)
          }
          completedChecks++
          if (completedChecks >= totalChecks) {
            resolve(images.sort())
          }
        }

        img.onerror = () => {
          completedChecks++
          if (completedChecks >= totalChecks) {
            resolve(images.sort())
          }
        }

        img.src = url
      }
    }

    // Timeout fallback
    setTimeout(() => resolve(images.sort()), 5000)
  })
}

export function LotImageGallery({ product }: LotImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadImages = async () => {
      const loadedImages = await tryLoadImages(product.lot)
      setImages(loadedImages)
      setIsLoading(false)
    }

    loadImages()
  }, [product.lot])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  if (isLoading) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-muted-foreground">Loading images...</div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-muted-foreground">No images found</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
        <Image
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`${product.officialName} - Image ${currentIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={currentIndex === 0}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 border-white/20 hover:bg-black/80"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 border-white/20 hover:bg-black/80"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === index ? "border-yellow-400 scale-105" : "border-white/10 hover:border-white/30"
              }`}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
