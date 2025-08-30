
import { useEffect, useState } from 'react';
import { Star, MessageCircle, ExternalLink, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  price: string;
  priceLink?: string;
  description: string;
  category: string;
  rating: number;
  image: string | null;
  image_alt?: string | null;
  status: string;
  whatsappLink?: string;
  folderName?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(product.image || '');
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    setImgSrc(product.image || '');
    setImageError(false);
  }, [product.image]);

  // Use whatsappLink from product data or fallback to generated one
  const whatsappMessage = `Hi! I'm interested in ${product.name} (${product.id}). Can you provide more details?`;
  const whatsappUrl = product.whatsappLink || `https://wa.me/1234567890?text=${encodeURIComponent(whatsappMessage)}`;

  const handleViewDetails = () => {
    window.location.href = `/?lot=${product.id}`;
  };

  const handleImageError = () => {
    if (product.image_alt && imgSrc !== product.image_alt) {
      setImgSrc(product.image_alt);    // one-time fallback to case-sensitive alternative
    } else {
      console.warn('Image failed:', product.id, imgSrc);
      setImageError(true);  // Mark as error to show missing asset badge
    }
  };

  // Show image with error handling
  const shouldShowImage = !!(imgSrc && imgSrc.trim() !== '' && !imageError);

  return (
    <div className="glass-card group cursor-pointer h-full flex flex-col">
      
      {/* Product Image - Show image or fallback */}
      {shouldShowImage ? (
        <div className="relative overflow-hidden rounded-t-lg mb-4">
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            onError={handleImageError}
            className="w-full h-56 object-cover rounded-xl"
          />
          
          {/* Status Badge */}
          <Badge 
            className={`absolute top-3 left-3 ${
              product.status === 'Available' 
                ? 'bg-gradient-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {product.status}
          </Badge>

          {/* Category Badge */}
          <Badge 
            variant="outline" 
            className="absolute top-3 right-3 bg-glass border-glass-border text-foreground"
          >
            {product.category}
          </Badge>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          
          {/* Action Buttons Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 space-x-2">
            <Button 
              size="sm" 
              variant="hero"
              className="rounded-full p-3"
              onClick={handleViewDetails}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button 
              size="sm" 
              variant="premium"
              className="rounded-full p-3"
              onClick={(e) => {
                e.stopPropagation();
                window.open(whatsappUrl, '_blank');
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full h-56 rounded-t-lg border border-dashed bg-muted/20 grid place-items-center mb-4 text-muted-foreground">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <Badge variant="destructive" className="mb-2">
              Asset Missing
            </Badge>
            <p className="text-sm">Image not found</p>
          </div>
        </div>
      )}

      {/* Product Info */}
      <div className="p-6 flex-1 flex flex-col">
        
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-premium group-hover:text-primary-glow transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < product.rating 
                    ? 'fill-secondary text-secondary' 
                    : 'fill-muted text-muted'
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2">
              ({product.rating}/5)
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-3">
          {product.description}
        </p>

        {/* Price */}
        <div className="mb-4">
          {product.priceLink ? (
            <Button
              variant="ghost"
              className="p-0 h-auto text-xl font-bold text-gold hover:text-primary-glow transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.open(product.priceLink, '_blank');
              }}
            >
              {product.price}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <span className="text-xl font-bold text-gold">
              {product.price}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="hero"
            className="flex-1"
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          <Button 
            variant="premium"
            className="px-4"
            onClick={(e) => {
              e.stopPropagation();
              window.open(whatsappUrl, '_blank');
            }}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
