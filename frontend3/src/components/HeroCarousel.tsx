import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { mockEvents } from "@/data/mockEvents";
import { Link } from "react-router-dom";

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const featuredEvents = mockEvents.filter(event => event.isFeatured);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredEvents.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  const currentEvent = featuredEvents[currentSlide];

  return (
    <div className="relative h-[75vh] overflow-hidden rounded-2xl">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={currentEvent.image}
          alt={currentEvent.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-end pb-16">
        <div className="max-w-3xl space-y-6 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            {currentEvent.title}
          </h1>
          <p className="text-xl text-foreground/90 max-w-2xl">
            {currentEvent.description.substring(0, 150)}...
          </p>

          {/* Event Info */}
          <div className="flex flex-wrap gap-6 text-foreground/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {new Date(currentEvent.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-medium">{currentEvent.venue}</span>
            </div>
            {currentEvent.attendees && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium">{currentEvent.attendees.toLocaleString()} attending</span>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Button size="lg" variant="cta" asChild>
              <Link to={`/event/${currentEvent.id}`}>
                {currentEvent.isFree ? 'Register Now' : 'Get Tickets'}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to={`/event/${currentEvent.id}`}>Learn More</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass glass-border flex items-center justify-center hover:bg-foreground/10 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass glass-border flex items-center justify-center hover:bg-foreground/10 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {featuredEvents.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-primary w-8' 
                : 'bg-foreground/30 hover:bg-foreground/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
