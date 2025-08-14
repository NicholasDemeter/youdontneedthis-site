import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';

const featuredItems = [
  {
    id: 'LOT-001',
    name: 'Surface Studio',
    price: '$2,999',
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&h=600&fit=crop&crop=center',
    description: 'Professional creative workstation',
    type: 'image'
  },
  {
    id: 'LOT-002', 
    name: 'MacBook Pro M3',
    price: '$3,499',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&crop=center',
    description: 'Ultimate mobile workstation',
    type: 'image'
  },
  {
    id: 'LOT-003',
    name: 'Gaming Setup',
    price: '$4,999',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=600&fit=crop&crop=center',
    description: 'Premium gaming experience',
    type: 'image'
  },
  {
    id: 'LOT-004',
    name: 'Studio Monitors',
    price: '$1,899',
    image: 'https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=800&h=600&fit=crop&crop=center',
    description: 'Professional audio monitoring',
    type: 'image'
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Floating Fireflies */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="firefly"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Hero Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-premium">You Don't</span>
                <br />
                <span className="text-gold">Need This</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Curated premium tech for those who appreciate the extraordinary. 
                80+ exclusive items that redefine luxury computing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                <Sparkles className="mr-2 h-5 w-5" />
                Explore Collection
              </Button>
              <Button variant="premium" size="lg" className="text-lg px-8 py-6">
                Featured Items
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-premium">80+</div>
                <div className="text-sm text-muted-foreground">Premium Items</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold">$2M+</div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">5★</div>
                <div className="text-sm text-muted-foreground">Curation Rating</div>
              </div>
            </div>
          </div>

          {/* 3D Carousel */}
          <div className="relative">
            <div 
              className="carousel-3d relative h-[500px] mx-auto"
              onMouseEnter={() => setIsPlaying(false)}
              onMouseLeave={() => setIsPlaying(true)}
            >
              {featuredItems.map((item, index) => {
                const offset = (index - currentSlide + featuredItems.length) % featuredItems.length;
                const isActive = offset === 0;
                
                return (
                  <div
                    key={item.id}
                    className={`absolute inset-0 carousel-item transition-all duration-800 ${
                      isActive ? 'z-20' : 'z-10'
                    }`}
                    style={{
                      transform: `
                        translateX(${offset * 100}px) 
                        translateZ(${isActive ? 0 : -200}px)
                        rotateY(${offset * 15}deg)
                      `,
                      opacity: isActive ? 1 : 0.6
                    }}
                  >
                    <div className="glass-card h-full p-6 overflow-hidden group cursor-pointer"
                         onClick={() => goToSlide(index)}>
                      
                      <div className="relative h-3/4 mb-4 overflow-hidden rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {item.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                            <Button variant="hero" size="lg" className="rounded-full p-4">
                              <Play className="h-6 w-6" />
                            </Button>
                          </div>
                        )}

                        <div className="absolute top-4 right-4">
                          <div className="bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                            {item.price}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-premium mb-2">{item.name}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Carousel Controls */}
            <div className="flex justify-center space-x-2 mt-8">
              {featuredItems.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-gradient-primary shadow-glow' 
                      : 'bg-muted hover:bg-primary/50'
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="premium"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="premium"
              size="sm" 
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}