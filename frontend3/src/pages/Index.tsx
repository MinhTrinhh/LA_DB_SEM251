import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { mockEvents } from "@/data/mockEvents";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const featuredEvents = mockEvents.filter(event => event.isFeatured);
  const upcomingEvents = mockEvents.filter(event => !event.isFeatured);

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
