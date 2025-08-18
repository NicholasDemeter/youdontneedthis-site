import { Star, MessageCircle, ExternalLink, Eye } from 'lucide-react';
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
  image: string;
  status: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const whatsappMessage = `Hi! I'm interested in ${product.name} (${product.id}). Can you provide more details?`;
  const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(whatsappMessage)}`;

  const handleViewDetails = () => {
    // Navigate to product detail page
    window.location.href = `/?lot=${product.id}`;
  };

  return (
    <div className="glass-card group cursor-pointer h-full flex flex-col">
      
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-t-lg mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
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

      {/* Product Info */}
      <div className="p-6 pt-0 flex-1 flex flex-col">
        
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