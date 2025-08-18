import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Star, MessageCircle, ExternalLink } from 'lucide-react';
import ProductCard from './ProductCard';

// Real product data from Google Sheet with price ranges and comparison links
const realProducts = [
  {
    id: 'LOT-001',
    name: 'Microsoft Surface Go 3',
    price: '$399-$549',
    priceLink: 'https://www.microsoft.com/en-us/surface/devices/surface-go-3',
    description: '10.5" Touchscreen with Intel Core i3, 8GB Memory, 128GB SSD',
    category: 'Tablets',
    rating: 5,
    image: 'https://picsum.photos/400/300?random=1',
    status: 'Available'
  },
  {
    id: 'LOT-002',
    name: 'Microsoft Surface Studio 2',
    price: '$3,499-$4,299',
    priceLink: 'https://www.microsoft.com/en-us/d/surface-studio-2/8vlfqc3597k4',
    description: 'All-in-One Desktop workstation for creative professionals',
    category: 'Workstations',
    rating: 5,
    image: 'https://picsum.photos/400/300?random=2',
    status: 'Available'
  },
  {
    id: 'LOT-003',
    name: 'Minisforum EliteMini UM773 Lite',
    price: '$349-$709',
    priceLink: 'https://store.minisforum.com/products/minisforum-um773-lite',
    description: 'Mini PC with AMD Ryzen 7 7735HS processor',
    category: 'Mini PCs',
    rating: 5,
    image: 'https://picsum.photos/400/300?random=3',
    status: 'Available'
  },
  {
    id: 'LOT-004',
    name: 'Moment M-Series Lens Kit',
    price: '$399-$499',
    priceLink: 'https://www.shopmoment.com/products/m-series-lens-kit',
    description: 'Professional mobile photography lens collection',
    category: 'Photography',
    rating: 5,
    image: 'https://picsum.photos/400/300?random=4',
    status: 'Available'
  },
  {
    id: 'LOT-005',
    name: 'Portable Monitor Laptop Computer',
    price: '$299-$399',
    priceLink: 'https://www.amazon.com/Portable-Monitor-Laptop-Computer-Devices/dp/B0C9Q37CB5',
    description: 'Dual portable OLED monitors for enhanced productivity',
    category: 'Monitors',
    rating: 4,
    image: 'https://picsum.photos/400/300?random=5',
    status: 'Available'
  },
  {
    id: 'LOT-006',
    name: 'Microsoft Surface Pro 7',
    price: '$899-$1,499',
    priceLink: 'https://www.microsoft.com/en-us/d/surface-pro-7/8n17j0m5zzqs',
    description: '16GB RAM, Black, Intel i7 processor',
    category: 'Tablets',
    rating: 5,
    image: 'https://picsum.photos/400/300?random=6',
    status: 'Available'
  },
  {
    id: 'LOT-007',
    name: 'NEBULA Capsule Projector',
    price: '$399-$549',
    priceLink: 'https://www.amazon.com/NEBULA-Capsule-Projector-Officially-Licensed/dp/B0CHW11C8H',
    description: 'Portable projector for entertainment anywhere',
    category: 'Projectors',
    rating: 4,
    image: 'https://picsum.photos/400/300?random=7',
    status: 'Available'
  },
  {
    id: 'LOT-008',
    name: 'NEBULA Cosmos Laser 1080P',
    price: '$1,299-$1,999',
    priceLink: 'https://www.amazon.com/Projector-NEBULA-Autofocus-Correction-Bluetooth/dp/B09XMBR1NN',
    description: 'High-performance laser projector with 1080P resolution',
    category: 'Projectors',
    rating: 5,
    image: 'https://picsum.photos/400/300?random=8',
    status: 'Available'
  },
  {
    id: 'LOT-009',
    name: 'NuPhy Air75 V2',
    price: '$119-$134',
    priceLink: 'https://nuphy.com/products/air75-v2',
    description: 'Premium mechanical keyboard for professionals',
    category: 'Accessories',
    rating: 5,
    image: 'https://picsum.photos/400/300?random=9',
    status: 'Available'
  },
  {
    id: 'LOT-010',
    name: 'OneWheel V1 Electric Skateboard',
    price: '$500-$800',
    priceLink: 'https://onewheel.com',
    description: 'Self-balancing electric skateboard for urban mobility',
    category: 'Recreation',
    rating: 4,
    image: 'https://picsum.photos/400/300?random=10',
    status: 'Available'
  },
  {
    id: 'LOT-011',
    name: 'Packard Bell AirFrame Monitor',
    price: '$108-$194',
    priceLink: 'https://www.amazon.com/Packard-Bell-AirFrame-Milliseconds-Adjustment/dp/B09PGNNT8K',
    description: '27-inch Full HD monitor for productivity',
    category: 'Monitors',
    rating: 4,
    image: 'https://picsum.photos/400/300?random=11',
    status: 'Available'
  },
  {
    id: 'LOT-012',
    name: 'Panasonic LUMIX 4K Digital Camera',
    price: '$297-$399',
    priceLink: 'https://www.amazon.com/Panasonic-DMC-ZS60-Digital-Camera/dp/B01C3SCKI2',
    description: '4K digital camera with 30x Leica lens',
    category: 'Photography',
    rating: 5,
    image: 'https://picsum.photos/400/300?random=12',
    status: 'Available'
  },
  {
    id: 'LOT-013',
    name: 'Pit Boss Fire Pit',
    price: '$89-$129',
    priceLink: 'https://www.amazon.com/pit-boss-fire-pit',
    description: 'Premium outdoor fire pit for gatherings',
    category: 'Recreation',
    rating: 4,
    image: 'https://picsum.photos/400/300?random=13',
    status: 'Available'
  },
  {
    id: 'LOT-014',
    name: 'Pit Boss Pellet Grill',
    price: '$499-$699',
    priceLink: 'https://www.amazon.com/pit-boss-pellet-grill',
    description: 'Smart pellet grill for outdoor cooking',
    category: 'Recreation',
    rating: 5,
    image: 'https://picsum.photos/400/300?random=14',
    status: 'Available'
  },
  {
    id: 'LOT-015',
    name: 'Plaud Note AI Voice Recorder',
    price: '$159-$199',
    priceLink: 'https://www.amazon.com/plaud-note-ai-voice-recorder',
    description: 'AI-powered voice recording and transcription',
    category: 'Accessories',
    rating: 4,
    image: 'https://picsum.photos/400/300?random=15',
    status: 'Available'
  },
  {
    id: 'LOT-016',
    name: 'HOTO Flashlight Rechargeable',
    price: '$89-$149',
    priceLink: 'https://www.amazon.com/HOTO-Flashlight-Rechargeable-Minimalist-Lightweight/dp/B0BCFMTQV5',
    description: 'Minimalist lightweight rechargeable flashlight',
    category: 'Accessories',
    rating: 4,
    image: 'https://picsum.photos/400/300?random=16',
    status: 'Available'
  },
  {
    id: 'LOT-017',
    name: 'Satechi Aluminum Stand Hub for Mac Mini',
    price: '$149-$199',
    priceLink: 'https://satechi.net/products/aluminum-stand-hub-for-mac-mini',
    description: 'Premium aluminum stand with hub functionality',
    category: 'Accessories',
    rating: 5,
    image: 'https://picsum.photos/400/300?random=17',
    status: 'Available'
  },
  {
    id: 'LOT-018',
    name: 'Sena Outrush Helmet',
    price: '$299-$399',
    priceLink: 'https://www.amazon.com/sena-outrush-helmet',
    description: 'Smart motorcycle helmet with communication',
    category: 'Recreation',
    rating: 5,
    image: 'https://picsum.photos/400/300?random=18',
    status: 'Available'
  },
  {
    id: 'LOT-019',
    name: 'ShiftCam ProGrip Starter Kit',
    price: '$199-$299',
    priceLink: 'https://www.amazon.com/shiftcam-progrip-starter-kit',
    description: 'Professional mobile photography grip system',
    category: 'Photography',
    rating: 5,
    image: 'https://picsum.photos/400/300?random=19',
    status: 'Available'
  },
  {
    id: 'LOT-020',
    name: 'ShiftCam SnapGrip Mobile Grip',
    price: '$79-$99',
    priceLink: 'https://www.amazon.com/shiftcam-snapgrip-mobile-grip',
    description: 'Magnetic mobile grip with wireless charging',
    category: 'Photography',
    rating: 4,
    image: 'https://picsum.photos/400/300?random=20',
    status: 'Available'
  }
];

const categories = ['All', 'Tablets', 'Workstations', 'Mini PCs', 'Photography', 'Monitors', 'Projectors', 'Accessories', 'Recreation'];
const ratings = [1, 2, 3, 4, 5];

export default function ProductGrid() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  const filteredProducts = useMemo(() => {
    let filtered = realProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesRating = selectedRating === 'All' || product.rating >= parseInt(selectedRating);
      
      return matchesSearch && matchesCategory && matchesRating;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedRating, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRating('All');
    setSortBy('name');
  };

  return (
    <section className="py-20 px-6 bg-background">
      <div className="container mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-5xl font-bold mb-6">
            <span className="text-premium">Premium</span>{' '}
            <span className="text-gold">Collection</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our carefully curated selection of premium technology. 
            Each item represents the pinnacle of innovation and craftsmanship.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-6 mb-12 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-glass border-glass-border"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-glass border-glass-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Min Rating</label>
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="bg-glass border-glass-border">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Ratings</SelectItem>
                  {ratings.map(rating => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating}+ <Star className="inline h-3 w-3 fill-secondary text-secondary ml-1" />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort and Clear */}
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-glass border-glass-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="premium"
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} of {realProducts.length} items
          </p>
          
          <div className="flex gap-2">
            <Button variant="premium">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Us
            </Button>
            <Button variant="premium">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Store
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-premium mb-2">No items found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or browse all categories
            </p>
            <Button onClick={clearFilters} variant="hero">
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}