'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types/product'

interface CarouselSectionProps {
  products: Product[]
}

export function CarouselSection({ products }: CarouselSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [products.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }

  if (products.length === 0) return null

  const currentProduct = products[currentIndex]

  return (
    <section id="featured" className="py-20 bg-background/50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-balance">
          <span className="text-primary">Featured</span>{' '}
          <span className="text-yellow-400">Collection</span>
        </h2>

        <div className="relative max-w-6xl mx-auto">
          {/* Carousel Item */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
            <Image
              src={currentProduct.imageUrl || "/placeholder.svg"}
              alt={currentProduct.officialName}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority
            />
            
            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end">
              <div className="p-8 w-full">
                <Link href={`/lot/${currentProduct.lot}`}>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 hover:text-yellow-400 transition-colors">
                    {currentProduct.officialName}
                  </h3>
                </Link>
                <p className="text-yellow-400 text-lg md:text-xl font-medium mb-4">
                  {currentProduct.tagline}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-white/90 text-lg">{currentProduct.coolnessRating} Stars</span>
                  {currentProduct.price && (
                    <span className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold">
                      {currentProduct.price}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 hover:bg-black/70"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 hover:bg-black/70"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </Button>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-yellow-400'
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
