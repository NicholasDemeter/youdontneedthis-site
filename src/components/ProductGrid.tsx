import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Papa from 'papaparse';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Star, MessageCircle, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import ProductCard from './ProductCard';

const categories = ['All', 'Tablets', 'Workstations', 'Mini PCs', 'Photography', 'Monitors', 'Projectors', 'Accessories', 'Recreation'];
const ratings = [1, 2, 3, 4, 5];

export default function ProductGrid() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [sortBy, setSortBy] = useState('name');


  async function fetchProductsFromLocalCSV(): Promise<any[]> {
    // Fetch CSV file using Papa Parse for better handling
    const csvUrl = '/data/products.csv';
    
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
      }
      const csvText = await response.text();
      
      // Parse CSV using Papa Parse for better reliability
      const parseResult = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        transform: (value: string) => value.trim()
      });
      
      if (parseResult.errors.length > 0) {
        console.warn('CSV parsing warnings:', parseResult.errors);
      }
      
      const products = parseResult.data.map((row: any) => {
        // Use FOLDER_NAME as the primary folder identifier
        const folderName = row.FOLDER_NAME || row.folder_name || row.LOT;
        if (!folderName || !row.OFFICIAL_NAME) return null;
        
        // Generate site-relative paths with proper URI encoding
        const thumbPath = encodeURI(`/${folderName}/Photos/thumb.jpg`);
        const thumbPathAlt = encodeURI(`/${folderName}/Photos/thumb.JPG`); // Case fallback
        
        return {
          id: row.LOT || folderName,
          name: row.OFFICIAL_NAME,
          price: row.PRICE || row.PRICE_RANGE || 'Contact for price',
          priceLink: row.URL,
          description: row.DESCRIPTION || '',
          category: row.CATEGORY || 'Uncategorized',
          rating: parseInt(row.RATING) || 0,
          image: thumbPath,
          image_alt: thumbPathAlt,
          status: row.STATUS || 'Available',
          folderName: folderName,
          specifications: row.SPECS || '',
          whatsappLink: `https://wa.me/1234567890?text=Hi, I'm interested in ${encodeURIComponent(row.OFFICIAL_NAME || '')}`
        };
      }).filter(Boolean); // Remove null entries
      
      return products;
    } catch (error) {
      console.error('Failed to fetch from local CSV:', error);
      throw error;
    }
  }

  // Fetch products from local CSV file
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProductsFromLocalCSV,
  });

  const products = productsData || [];

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product: any) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesRating = selectedRating === 'All' || product.rating >= parseInt(selectedRating);

      return matchesSearch && matchesCategory && matchesRating;
    });

    // Sort products
    filtered.sort((a: any, b: any) => {
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
  }, [searchQuery, selectedCategory, selectedRating, sortBy, products]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRating('All');
    setSortBy('name');
  };

  if (isLoading) {
    return (
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading products from CSV...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-destructive mb-4">Unable to Load Products</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {error.message}
            </p>
            <p className="text-sm text-muted-foreground">
              Unable to fetch data from CSV file. Please check if /data/products.csv exists.
            </p>
          </div>
        </div>
      </section>
    );
  }

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
            Showing {filteredProducts.length} of {products.length} items
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
          {filteredProducts.map((product: any, index: number) => (
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
