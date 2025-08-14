import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Star, MessageCircle, ExternalLink } from 'lucide-react';
import ProductCard from './ProductCard';

// Mock data - will be replaced with Google Sheets integration
const mockProducts = [
  {
    id: 'LOT-001',
    name: 'Microsoft Surface Studio',
    price: '$2,999 - $4,199',
    description: 'All-in-one creative powerhouse with 28" touchscreen',
    category: 'Workstations',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=400&h=300&fit=crop&crop=center',
    status: 'Available'
  },
  {
    id: 'LOT-002',
    name: 'MacBook Pro M3 Max',
    price: '$3,499 - $7,199',
    description: 'Ultimate mobile workstation for professionals',
    category: 'Laptops',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop&crop=center',
    status: 'Available'
  },
  {
    id: 'LOT-003',
    name: 'Custom Gaming Rig',
    price: '$4,999 - $12,999',
    description: 'High-end custom built gaming workstation',
    category: 'Gaming',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=300&fit=crop&crop=center',
    status: 'Available'
  },
  {
    id: 'LOT-004',
    name: 'Studio Monitor Pair',
    price: '$1,899 - $3,499',
    description: 'Professional reference monitors for critical listening',
    category: 'Audio',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=400&h=300&fit=crop&crop=center',
    status: 'Available'
  },
  {
    id: 'LOT-005',
    name: 'iPad Pro 12.9" M2',
    price: '$1,099 - $2,399',
    description: 'Professional tablet for creative workflows',
    category: 'Tablets',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop&crop=center',
    status: 'Available'
  },
  {
    id: 'LOT-006',
    name: 'Sony A7R V Camera',
    price: '$3,899 - $5,299',
    description: 'High-resolution mirrorless camera system',
    category: 'Photography',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop&crop=center',
    status: 'Available'
  },
  {
    id: 'LOT-007',
    name: 'Alienware Aurora R15',
    price: '$2,499 - $4,999',
    description: 'Premium gaming desktop with liquid cooling',
    category: 'Gaming',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop&crop=center',
    status: 'Sold'
  },
  {
    id: 'LOT-008',
    name: 'Wacom Cintiq Pro 32',
    price: '$3,299 - $3,799',
    description: 'Professional pen display for digital artists',
    category: 'Creative',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=400&h=300&fit=crop&crop=center',
    status: 'Available'
  }
];

const categories = ['All', 'Workstations', 'Laptops', 'Gaming', 'Audio', 'Tablets', 'Photography', 'Creative'];
const ratings = [1, 2, 3, 4, 5];

export default function ProductGrid() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  const filteredProducts = useMemo(() => {
    let filtered = mockProducts.filter(product => {
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
            Showing {filteredProducts.length} of {mockProducts.length} items
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