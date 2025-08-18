import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Star, MessageCircle, ExternalLink } from 'lucide-react';
import ProductCard from './ProductCard';

// Real product data from LOT inventory
const realProducts = [
  {
    id: 'LOT-001',
    name: 'Microsoft Surface Go 3',
    price: '$799 - $1,299',
    description: '10.5" Touchscreen with Intel Core i3, 8GB Memory, 128GB SSD',
    category: 'Tablets',
    rating: 5,
    image: '/LOT_001_Microsoft_Surface_Go_3_10_5_Touchscreen_Intel_R_CoreTM_i3_8GB_Memory_128GB_SSD/LOT_001_THUMBNAIL.jpg',
    status: 'Available'
  },
  {
    id: 'LOT-002',
    name: 'Microsoft Surface Studio 2',
    price: '$3,499 - $4,799',
    description: 'All-in-One Desktop workstation for creative professionals',
    category: 'Workstations',
    rating: 5,
    image: '/LOT_002_Microsoft_Surface_Studio_2_All_in_One_Desktop/LOT_002_THUMBNAIL.jpg',
    status: 'Available'
  },
  {
    id: 'LOT-003',
    name: 'Minisforum EliteMini UM773 SE',
    price: '$899 - $1,299',
    description: 'Mini PC with AMD Ryzen 7 7735HS processor',
    category: 'Mini PCs',
    rating: 5,
    image: '/LOT_003_Minisforum_EliteMini_UM773_SE_Mini_PC_Ryzen_7_7735HS/LOT_003_THUMBNAIL.jpg',
    status: 'Available'
  },
  {
    id: 'LOT-004',
    name: 'Moment M-Series Professional Mobile Lens Kit',
    price: '$299 - $499',
    description: 'Professional mobile photography lens collection',
    category: 'Photography',
    rating: 5,
    image: '/LOT_004_Moment_M_Series_Professional_Mobile_Lens_Kit/LOT_004_THUMBNAIL.jpg',
    status: 'Available'
  },
  {
    id: 'LOT-005',
    name: 'Motyeowe OLED Monitors 18.5" (Set of 2)',
    price: '$399 - $599',
    description: 'Dual portable OLED monitors for enhanced productivity',
    category: 'Monitors',
    rating: 4,
    image: '/LOT_005_Motyeowe_OLED_Monitors_18_5in_X2/LOT_005_THUMBNAIL.jpg',
    status: 'Available'
  },
  {
    id: 'LOT-006',
    name: 'Microsoft Surface Pro 7',
    price: '$1,299 - $1,899',
    description: '16GB RAM, Black, Intel i7 processor',
    category: 'Tablets',
    rating: 5,
    image: '/LOT_006_MS_Surface_Pro_7_16gb_ram_black_i7/LOT_006_THUMBNAIL.jpg',
    status: 'Available'
  },
  {
    id: 'LOT-007',
    name: 'Anker Nebula Capsule',
    price: '$299 - $399',
    description: 'Portable projector for entertainment anywhere',
    category: 'Projectors',
    rating: 4,
    image: '/LOT_007_Anker_Nebula_Capsule_Portable_Projector/LOT_007_THUMBNAIL.jpg',
    status: 'Available'
  },
  {
    id: 'LOT-008',
    name: 'NEBULA Cosmos Laser 1080P',
    price: '$999 - $1,399',
    description: 'High-performance laser projector with 1080P resolution',
    category: 'Projectors',
    rating: 5,
    image: '/LOT_008_NEBULA_Cosmos_Laser_1080P_Projector/LOT_008_THUMBNAIL.jpg',
    status: 'Available'
  },
  {
    id: 'LOT-009',
    name: 'NuPhy 75 Keyboard',
    price: '$149 - $199',
    description: 'Premium mechanical keyboard for professionals',
    category: 'Accessories',
    rating: 5,
    image: '/LOT_009_NuPhy_75_Keyboard/LOT_009_THUMBNAIL.jpg',
    status: 'Available'
  },
  {
    id: 'LOT-010',
    name: 'OneWheel V1 Electric Skateboard',
    price: '$899 - $1,299',
    description: 'Self-balancing electric skateboard for urban mobility',
    category: 'Recreation',
    rating: 4,
    image: '/LOT_010_OneWheel_V1_Self_Balancing_Electric_Skateboard/LOT_010_THUMBNAIL.jpg',
    status: 'Available'
  },
  {
    id: 'LOT-011',
    name: 'Packard Bell airFrame 27" FHD Monitor',
    price: '$299 - $399',
    description: '27-inch Full HD monitor for productivity',
    category: 'Monitors',
    rating: 4,
    image: '/LOT_011_Packard_Bell_airFrame_27_FHD_Monitor/LOT_011_THUMBNAIL.jpg',
    status: 'Available'
  },
  {
    id: 'LOT-012',
    name: 'Panasonic LUMIX 4K Digital Camera',
    price: '$699 - $999',
    description: '4K digital camera with 30x Leica lens',
    category: 'Photography',
    rating: 5,
    image: '/LOT_012_Panasonic_LUMIX_4K_Digital_Camera_with_30x_Leica_Lens/LOT_012_THUMBNAIL.jpg',
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