import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';

const featuredItems = [
  {
    id: 'HERO-VIDEO',
    name: 'YDNT Collection',
    price: 'Featured',
    image: 'https://picsum.photos/600/400?random=hero',
    description: 'Discover our premium tech collection',
    type: 'image'
  },
  {
    id: 'LOT-001',
    name: 'Surface Go 3',
    price: '$399-$549',
    image: 'https://picsum.photos/600/400?random=21',
    description: '10.5" Touchscreen with Intel i3',
    type: 'image'
  },
  {
    id: 'LOT-002', 
    name: 'Surface Studio 2',
    price: '$3,499-$4,299',
    image: 'https://picsum.photos/600/400?random=22',
    description: 'All-in-One Desktop workstation',
    type: 'image'
  },
  {
    id: 'LOT-003',
    name: 'EliteMini UM773 SE',
    price: '$349-$709',
    image: 'https://picsum.photos/600/400?random=23',
    description: 'Mini PC with AMD Ryzen 7',
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
                100+ exclusive items that redefine luxury gadgetry.
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
                <div className="text-3xl font-bold text-premium">100+</div>
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
                        {item.type === 'video' ? (
                          <video
                            src={item.image}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            muted
                            loop
                            autoPlay
                            playsInline
                          />
                        ) : (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        )}
                        
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
        
        {/* YDNT Rule Section */}
        <div className="text-center pt-16 pb-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl font-bold text-gold">YDNT Rule</h3>
            <p className="text-lg text-muted-foreground italic">
              "If you can't afford the first price, don't ask for the last"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}