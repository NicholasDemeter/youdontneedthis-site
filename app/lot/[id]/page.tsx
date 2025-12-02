import { notFound } from 'next/navigation'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getProducts } from '@/lib/get-products'
import { LotImageGallery } from '@/components/lot-image-gallery'

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({
    id: product.lot,
  }))
}

export default async function LotPage({ params }: { params: { id: string } }) {
  const products = await getProducts()
  const product = products.find((p) => p.lot === params.id)

  if (!product) {
    notFound()
  }

  const whatsappMessage = encodeURIComponent(
    `Hi! I'm interested in ${product.lot} - ${product.officialName}`
  )
  const whatsappLink = `https://wa.me/+15551234567?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-background">
      {/* Close Button */}
      <div className="fixed top-4 right-4 z-50">
        <Link href="/#collection">
          <Button
            variant="outline"
            size="icon"
            className="bg-black/80 border-white/20 hover:bg-black"
          >
            <X className="h-6 w-6 text-white" />
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <LotImageGallery 
                product={product}
              />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <div className="text-sm text-muted-foreground mb-2">{product.lot}</div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                  {product.officialName}
                </h1>
                <p className="text-2xl text-yellow-400 font-medium mb-4">
                  {product.tagline}
                </p>
                <div className="flex items-center gap-4 mb-6">
                  {product.price && product.priceLink && (
                    <a
                      href={product.priceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
                    >
                      {product.price}
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-foreground mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              {product.specifications && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Specifications</h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.specifications}
                  </div>
                </div>
              )}

              {/* Category */}
              {product.category && (
                <div>
                  <span className="inline-block bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                </div>
              )}

              {/* WhatsApp Contact */}
              <div className="pt-6">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg">
                    💬 Contact via WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
