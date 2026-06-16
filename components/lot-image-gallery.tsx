"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types/product"
import { getActualFolderName, ASSET_BASE } from "@/lib/folder-mapping"

interface LotImageGalleryProps {
  product: Product
}

type MediaItem = {
  type: "image" | "video"
  url: string
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
    const totalChecks = maxImages * 4

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

    setTimeout(() => resolve(images.sort()), 5000)
  })
}

async function tryLoadVideos(lot: string): Promise<string[]> {
  const folderName = await getActualFolderName(lot)

  if (!folderName) {
    return []
  }

  return new Promise((resolve) => {
    const videos: string[] = []
    const maxVideos = 5
    let completedChecks = 0

    // Video patterns matching your naming convention
    const patterns = [
      (i: number) => `${ASSET_BASE}/${folderName}/Videos/${lot}_${lot}_video_${i}.mp4`,
      (i: number) => `${ASSET_BASE}/${folderName}/Videos/${lot}_${lot}_video_${String(i).padStart(2, "0")}.mp4`,
      (i: number) => `${ASSET_BASE}/${folderName}/Videos/${lot}_${lot}_video_${i}.mov`,
      (i: number) => `${ASSET_BASE}/${folderName}/Videos/${lot}_${lot}_video_${String(i).padStart(2, "0")}.mov`,
      // Also try patterns without double LOT prefix
      (i: number) => `${ASSET_BASE}/${folderName}/Videos/${lot}_video_${i}.mp4`,
      (i: number) => `${ASSET_BASE}/${folderName}/Videos/${lot}_video_${String(i).padStart(2, "0")}.mp4`,
      (i: number) => `${ASSET_BASE}/${folderName}/Videos/${lot}_video_${i}.mov`,
      (i: number) => `${ASSET_BASE}/${folderName}/Videos/${lot}_video_${String(i).padStart(2, "0")}.mov`,
    ]

    const totalChecks = maxVideos * patterns.length

    for (let i = 1; i <= maxVideos; i++) {
      for (const pattern of patterns) {
        const url = pattern(i)

        fetch(url, { method: "HEAD" })
          .then((res) => {
            if (res.ok && !videos.includes(url)) {
              videos.push(url)
            }
            completedChecks++
            if (completedChecks >= totalChecks) {
              resolve(videos.sort())
            }
          })
          .catch(() => {
            completedChecks++
            if (completedChecks >= totalChecks) {
              resolve(videos.sort())
            }
          })
      }
    }

    // Also try to find videos with product name patterns
    const productPatterns = [
      `${ASSET_BASE}/${folderName}/Videos/${lot}_${lot}_${folderName.split("_").slice(1).join("_")}.mp4`,
      `${ASSET_BASE}/${folderName}/Videos/${lot}_${lot}_${folderName.split("_").slice(1).join("_")}.mov`,
    ]

    for (const url of productPatterns) {
      fetch(url, { method: "HEAD" })
        .then((res) => {
          if (res.ok && !videos.includes(url)) {
            videos.push(url)
          }
        })
        .catch(() => {})
    }

    setTimeout(() => resolve(videos.sort()), 3000)
  })
}

export function LotImageGallery({ product }: LotImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMedia = async () => {
      // Load images first
      const loadedImages = await tryLoadImages(product.lot)
      const imageItems: MediaItem[] = loadedImages.map((url) => ({ type: "image", url }))

      // Then load videos
      const loadedVideos = await tryLoadVideos(product.lot)
      const videoItems: MediaItem[] = loadedVideos.map((url) => ({ type: "video", url }))

      // Combine: images first, then videos
      setMedia([...imageItems, ...videoItems])
      setIsLoading(false)
    }

    loadMedia()
  }, [product.lot])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)
  }

  const goToMedia = (index: number) => {
    setCurrentIndex(index)
  }

  if (isLoading) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-muted-foreground">Loading media...</div>
      </div>
    )
  }

  if (media.length === 0) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-muted-foreground">No media found</div>
      </div>
    )
  }

  const currentMedia = media[currentIndex]

  return (
    <div className="space-y-4">
      {/* Main Media Display */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
        {currentMedia.type === "image" ? (
          <Image
            src={currentMedia.url || "/placeholder.svg"}
            alt={`${product.officialName} - Image ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={currentIndex === 0}
          />
        ) : (
          <video src={currentMedia.url} controls className="w-full h-full object-contain" preload="metadata">
            Your browser does not support the video tag.
          </video>
        )}

        {/* Navigation Arrows */}
        {media.length > 1 && (
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

        {/* Media Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {media.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {media.map((item, index) => (
            <button
              key={index}
              onClick={() => goToMedia(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === index ? "border-yellow-400 scale-105" : "border-white/10 hover:border-white/30"
              }`}
            >
              {item.type === "image" ? (
                <Image
                  src={item.url || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="relative w-full h-full bg-black/80 flex items-center justify-center">
                  <Play className="h-8 w-8 text-white fill-white" />
                  <span className="absolute bottom-1 text-[10px] text-white/80">Video</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
