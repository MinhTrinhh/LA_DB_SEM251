import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { eventsApi } from "@/api/events.api";
import { BackendEvent } from "@/types/api.types";
import { Event } from "@/data/mockEvents";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const publicEvents = await eventsApi.getAllPublicEvents();
        setEvents(publicEvents);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Convert BackendEvent to Event format for EventCard
  const convertToEvent = (backendEvent: BackendEvent): Event => {
    // Find minimum price across all ticket categories in all sessions
    const getMinimumPrice = (): number => {
      if (!backendEvent.sessions || backendEvent.sessions.length === 0) return 0;
      
      const allPrices: number[] = [];
      backendEvent.sessions.forEach(session => {
        if (session.ticketCategories && session.ticketCategories.length > 0) {
          session.ticketCategories.forEach(category => {
            allPrices.push(Number(category.price));
          });
        }
      });
      
      return allPrices.length > 0 ? Math.min(...allPrices) : 0;
    };

    const minPrice = getMinimumPrice();

    return {
      id: backendEvent.eventId.toString(),
      title: backendEvent.title,
      description: backendEvent.generalIntroduction || '',
      category: 'Event',
      image: backendEvent.posterUrl || '/placeholder.svg',
      date: backendEvent.startDateTime || backendEvent.startDate || '',
      time: backendEvent.startDateTime 
        ? new Date(backendEvent.startDateTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        : 'TBA',
      endDate: backendEvent.endDateTime,
      venue: backendEvent.location || 'TBA',
      location: backendEvent.location || 'TBA',
      organizerId: backendEvent.organizerId.toString(),
      organizerName: `Organizer #${backendEvent.organizerId}`,
      isFeatured: false,
      isFree: minPrice === 0,
      price: minPrice,
      ticketCategories: [],
      organizer: {
        name: `Organizer #${backendEvent.organizerId}`,
        email: 'organizer@example.com',
        avatar: `O${backendEvent.organizerId}`
      }
    };
  };

  const convertedEvents = events.map(convertToEvent);
  
  // For now, treat first 3 events as featured
  const featuredEvents = convertedEvents.slice(0, 3);
  const upcomingEvents = convertedEvents.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
          <h1 className="text-2xl font-bold mb-2">Loading events...</h1>
          <p className="text-muted-foreground">Please wait</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-2 text-destructive">Error Loading Events</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main>
          {/* Hero Carousel */}
          <section className="container mx-auto px-4 py-8">
            <HeroCarousel />
          </section>

          {/* Empty State */}
          <section className="container mx-auto px-4 py-20 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-bold mb-4">No Events Yet</h2>
              <p className="text-muted-foreground mb-6">
                There are currently no events available in the system. 
                Check back later or create your first event!
              </p>
              <Button variant="cta" asChild>
                <a href="/organize/create">Create Event</a>
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero Carousel */}
        <section className="container mx-auto px-4 py-8">
          <HeroCarousel />
        </section>

        {/* Search & Filter Bar */}
        <section className="sticky top-16 z-40 glass glass-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 p-4 glass-border rounded-lg space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <Input type="date" className="bg-input border-border" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input placeholder="Enter city or zip" className="bg-input border-border" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Event Type</label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">All</Button>
                      <Button variant="outline" size="sm" className="flex-1">Free</Button>
                      <Button variant="outline" size="sm" className="flex-1">Paid</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Featured Events */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Events</h2>
            <p className="text-muted-foreground">Don't miss these amazing experiences</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Upcoming Events</h2>
            <p className="text-muted-foreground">Explore events happening soon</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
