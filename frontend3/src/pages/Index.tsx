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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortByPrice, setSortByPrice] = useState<string>("default");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convert "all" and "default" to undefined for API call
        const status = statusFilter === "all" ? undefined : statusFilter;
        const sort = sortByPrice === "default" ? undefined : sortByPrice;

        console.log('🔍 Filter Debug:', {
          statusFilter,
          sortByPrice,
          status,
          sort,
          willUseFilteredAPI: !!(status || sort)
        });

        // Use filtered API if filters are applied, otherwise use all public events
        if (status || sort) {
          console.log('📡 Calling getFilteredAndSortedEvents with:', { status, sort });
          const filteredEvents = await eventsApi.getFilteredAndSortedEvents(status, sort);
          console.log('✅ Received events:', filteredEvents.length, 'events');

          // Log event prices to verify sort order
          if (sort) {
            console.log('📊 Events with prices (in received order):');
            filteredEvents.forEach((event, index) => {
              // Calculate min price from sessions
              const prices: number[] = [];
              event.sessions?.forEach(session => {
                session.ticketCategories?.forEach(cat => {
                  prices.push(Number(cat.price));
                });
              });
              const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
              console.log(`  ${index + 1}. ${event.title} - Min Price: ${minPrice} VND`);
            });
          }

          setEvents(filteredEvents);
        } else {
          console.log('📡 Calling getAllPublicEvents');
          const publicEvents = await eventsApi.getAllPublicEvents();
          console.log('✅ Received events:', publicEvents.length, 'events');
          setEvents(publicEvents);
        }
      } catch (err) {
        console.error('❌ Failed to fetch events:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [statusFilter, sortByPrice]); // Re-fetch when filters change

  // Convert BackendEvent to Event format for EventCard
  const convertToEvent = (backendEvent: BackendEvent): Event => {
    // Find minimum price across all ticket categories in all sessions
    const getMinimumPrice = (): number => {
      // If sessions data is not available (filtered API response), return 0
      // The stored function calculates min_price but we don't have a field for it in BackendEvent type
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

    // Debug: Log poster URLs
    console.log(`📷 Event: ${backendEvent.title}, PosterURL: ${backendEvent.posterUrl}`);

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
  
  // Show all events in the main section
  const featuredEvents = convertedEvents;

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

  // Check if filters are active
  const hasActiveFilters = statusFilter !== "all" || sortByPrice !== "default";

  if (events.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main>
          {/* Hero Carousel */}
          <section className="container mx-auto px-4 py-8">
            <HeroCarousel />
          </section>

          {/* Search & Filter Bar (still show when empty) */}
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
                  Filter & Sort
                </Button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mt-4 p-4 glass-border rounded-lg space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Event Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="All Events" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Events</SelectItem>
                          <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                          <SelectItem value="ONGOING">Ongoing</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sort by Price</label>
                      <Select value={sortByPrice} onValueChange={setSortByPrice}>
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default (by date)</SelectItem>
                          <SelectItem value="ASC">Price: Low to High</SelectItem>
                          <SelectItem value="DESC">Price: High to Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Always show Clear Filters when filters are active */}
                  {hasActiveFilters && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStatusFilter("all");
                          setSortByPrice("default");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Empty State */}
          <section className="container mx-auto px-4 py-20 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                {hasActiveFilters ? "No Events Found" : "No Events Yet"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {hasActiveFilters
                  ? "No events match your current filters. Try adjusting your search criteria or clearing the filters."
                  : "There are currently no events available in the system. Check back later or create your first event!"
                }
              </p>
              {hasActiveFilters ? (
                <Button
                  variant="cta"
                  onClick={() => {
                    setStatusFilter("all");
                    setSortByPrice("default");
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button variant="cta" asChild>
                  <a href="/organize/create">Create Event</a>
                </Button>
              )}
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
                Filter & Sort
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 p-4 glass-border rounded-lg space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Event Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="All Events" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                        <SelectItem value="ONGOING">Ongoing</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort by Price</label>
                    <Select value={sortByPrice} onValueChange={setSortByPrice}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="ASC">Price: Low to High</SelectItem>
                        <SelectItem value="DESC">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Clear Filters Button - Always show when filters are active */}
                {hasActiveFilters && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStatusFilter("all");
                        setSortByPrice("default");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <section className="container mx-auto px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Active filters:</span>
              {statusFilter !== "all" && (
                <span className="px-2 py-1 bg-primary/20 rounded-md">
                  Status: {statusFilter.replace('_', ' ')}
                </span>
              )}
              {sortByPrice !== "default" && (
                <span className="px-2 py-1 bg-primary/20 rounded-md">
                  Sort: {sortByPrice === "ASC" ? "Price Low to High" : "Price High to Low"}
                </span>
              )}
              <span className="text-muted-foreground">• {events.length} event(s) found</span>
            </div>
          </section>
        )}

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
      </main>

      <Footer />
    </div>
  );
};

export default Index;
