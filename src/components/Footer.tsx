import { MessageCircle, Mail, ExternalLink, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const whatsappUrl = "https://wa.me/1234567890?text=Hello! I'm interested in your premium tech collection.";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-hero border-t border-glass-border mt-20">
      <div className="container mx-auto px-6 py-16">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center animate-glow">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-premium">You Don't</h3>
                <p className="text-lg text-gold -mt-1">Need This</p>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6 max-w-md">
              Curating the world's most extraordinary technology for those who 
              appreciate the pinnacle of innovation and craftsmanship.
            </p>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                Premium Curation Rating
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Collection</h4>
            <ul className="space-y-3">
              <li>
                <a href="#workstations" className="text-muted-foreground hover:text-primary-glow transition-colors">
                  Workstations
                </a>
              </li>
              <li>
                <a href="#gaming" className="text-muted-foreground hover:text-primary-glow transition-colors">
                  Gaming Systems
                </a>
              </li>
              <li>
                <a href="#audio" className="text-muted-foreground hover:text-primary-glow transition-colors">
                  Premium Audio
                </a>
              </li>
              <li>
                <a href="#creative" className="text-muted-foreground hover:text-primary-glow transition-colors">
                  Creative Tools
                </a>
              </li>
              <li>
                <a href="#mobile" className="text-muted-foreground hover:text-primary-glow transition-colors">
                  Mobile Devices
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Get In Touch</h4>
            <div className="space-y-4">
              <Button 
                variant="premium"
                className="w-full justify-start"
                onClick={() => window.open(whatsappUrl, '_blank')}
              >
                <MessageCircle className="h-4 w-4 mr-3" />
                WhatsApp Inquiry
              </Button>
              
              <Button 
                variant="premium"
                className="w-full justify-start"
                onClick={() => window.location.href = 'mailto:hello@youdontneedthis.us'}
              >
                <Mail className="h-4 w-4 mr-3" />
                Email Us
              </Button>
              
              <Button 
                variant="premium"
                className="w-full justify-start"
                onClick={() => window.open('https://youdontneedthis.us', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-3" />
                Visit Website
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="glass-card p-6 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-premium mb-2">80+</div>
              <div className="text-sm text-muted-foreground">Premium Items</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gold mb-2">$2M+</div>
              <div className="text-sm text-muted-foreground">Total Collection Value</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Authentic Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">WhatsApp Support</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-glass-border">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {currentYear} You Don't Need This. Premium tech curation by Nicholas Demeter.
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <a href="#privacy" className="text-muted-foreground hover:text-primary-glow transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="text-muted-foreground hover:text-primary-glow transition-colors">
              Terms of Service
            </a>
            <a href="#warranty" className="text-muted-foreground hover:text-primary-glow transition-colors">
              Warranty Info
            </a>
          </div>
        </div>
      </div>

      {/* Floating Fireflies */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="firefly"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </footer>
  );
}