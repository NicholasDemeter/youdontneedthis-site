import { HeroSection } from '@/components/hero-section'
import { CarouselSection } from '@/components/carousel-section'
import { ProductGrid } from '@/components/product-grid'
import { getProducts } from '@/lib/get-products'

export default async function HomePage() {
  const products = await getProducts()
  
  // Filter for featured (coolness 7) and carousel (coolness 6)
  const featuredProducts = products.filter(p => p.coolnessRating === 7)
  const carouselProducts = products.filter(p => p.coolnessRating === 6).slice(0, 10)
  
  return (
    <main className="min-h-screen bg-background">
      <HeroSection featuredProducts={featuredProducts} />
      {carouselProducts.length > 0 && (
        <CarouselSection products={carouselProducts} />
      )}
      <ProductGrid products={products} />
    </main>
  )
}
