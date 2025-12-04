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
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const featuredEvents = mockEvents.filter(event => event.isFeatured);
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
    return {
      id: backendEvent.eventId.toString(),
      title: backendEvent.title,
      description: backendEvent.generalIntroduction,
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
      isFree: true, // Will be determined by ticket categories later
      price: 0, // Will be calculated from ticket categories if needed
      ticketCategories: [],
      organizer: {
        name: `Organizer #${backendEvent.organizerId}`,
        email: 'organizer@example.com',
        avatar: `O${backendEvent.organizerId}`
      }
    };
  };
                  </div>
  const convertedEvents = events.map(convertToEvent);
  
  // For now, treat first 3 events as featured
  const featuredEvents = convertedEvents.slice(0, 3);
  const upcomingEvents = convertedEvents.slice(3);

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
