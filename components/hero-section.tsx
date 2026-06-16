'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import type { Product } from '@/types/product'

interface HeroSectionProps {
  featuredProducts: Product[]
}

const CATEGORY_OPTIONS = [
  'Computers, Tablets, Projectors',
  'Monitors and Stands',
  'Peripherals',
  'State of the Art',
  'Motorcycles and More',
  'Photography/Videography',
  'Hi-fidelity Audio and Video',
  'Studio Gear',
  'Camping/Adventure',
  'Security',
]

function selectCategory(category: string) {
  const event = new CustomEvent('hero-category-selected', { detail: category })
  window.dispatchEvent(event)

  const collectionSection = document.querySelector('#collection')
  if (collectionSection) {
    collectionSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export function HeroSection({ featuredProducts }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play failed, user interaction required
      })
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fallback Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-yellow-900/10" />
      
      {/* Hero Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-40' : 'opacity-0'
        }`}
      >
        <source
          src="https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/main/Carousel_HERO/Hero_Media.mp4"
          type="video/mp4"
        />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/80" />

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 text-balance">
          <span className="text-primary">YOU DON&apos;T</span>
          <br />
          <span className="text-yellow-400">NEED THIS</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto text-pretty">
          Curated premium tech for those who appreciate the extraordinary.
        </p>
        <p className="text-lg md:text-xl text-muted-foreground/80 mb-12 max-w-2xl mx-auto text-pretty">
          100+ exclusive items that redefine luxury gadgetry.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg">
                ⚡ Explore Collection
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[16rem]">
              <div className="px-2 py-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Choose a category
              </div>
              {CATEGORY_OPTIONS.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onSelect={(event) => {
                    event.preventDefault()
                    selectCategory(category)
                  }}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {featuredProducts.length > 0 && (
            <Button
              size="lg"
              variant="outline"
              className="bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400 px-8 py-6 text-lg"
              onClick={() => {
                const featuredSection = document.querySelector('#featured')
                if (featuredSection) {
                  featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
            >
              Featured Items
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold text-primary">100+</div>
            <div className="text-sm uppercase tracking-wider text-muted-foreground">
              Premium Items
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold text-yellow-400">$2M+</div>
            <div className="text-sm uppercase tracking-wider text-muted-foreground">
              Total Value
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold flex items-center justify-center gap-2">
              <span className="text-yellow-400">5</span>
              <span className="text-yellow-400">⭐</span>
            </div>
            <div className="text-sm uppercase tracking-wider text-muted-foreground">
              Curation Rating
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce opacity-50">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  )
}
