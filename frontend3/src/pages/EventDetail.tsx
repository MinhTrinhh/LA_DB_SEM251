import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Heart, Share2, Mail, ChevronDown, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { eventsApi } from "@/api/events.api";
import { BackendEvent } from "@/types/api.types";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<BackendEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSessions, setOpenSessions] = useState<number[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const eventData = await eventsApi.getEventById(parseInt(id));
        setEvent(eventData);
      } catch (err) {
        console.error('Failed to fetch event:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load event details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const toggleSession = (index: number) => {
    setOpenSessions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
          <h1 className="text-2xl font-bold mb-2">Loading event details...</h1>
          <p className="text-muted-foreground">Please wait</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4 text-destructive">
            {error ? 'Error Loading Event' : 'Event Not Found'}
          </h1>
          <p className="text-muted-foreground mb-6">{error || 'The event you are looking for does not exist'}</p>
          <Button asChild>
            <Link to="/">Back to Events</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const hasMultipleSessions = false; // Can be expanded later

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative h-[60vh] rounded-2xl overflow-hidden mb-8">
          <img
            src={event.posterUrl || '/placeholder.svg'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          
          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button size="icon" variant="outline" className="rounded-full">
              <Heart className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="outline" className="rounded-full">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Info Card */}
            <div className="glass glass-border rounded-xl p-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-6">{event.title}</h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {event.startDateTime || event.startDate
                        ? new Date(event.startDateTime || event.startDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'TBA'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {event.startDateTime
                        ? new Date(event.startDateTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        : 'TBA'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Venue</p>
                    <p className="font-medium">{event.location || 'TBA'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="glass glass-border rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.generalIntroduction || event.detailedIntroduction || 'No description available'}</p>
            </div>
            
            {/* Event Schedule with Collapsible Sessions */}
            <div className="glass glass-border rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Event Schedule</h2>
              <div className="space-y-3">
                {hasMultipleSessions && event.sessions ? (
                  event.sessions.map((session, sessionIndex) => (
                    <Collapsible
                      key={sessionIndex}
                      open={openSessions.includes(sessionIndex)}
                      onOpenChange={() => toggleSession(sessionIndex)}
                    >
                      <div className="glass-border rounded-lg overflow-hidden">
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-4 hover:bg-foreground/5 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              <ChevronDown 
                                className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${
                                  openSessions.includes(sessionIndex) ? 'rotate-180' : ''
                                }`} 
                              />
                              <div className="flex items-center gap-2 text-primary">
                                <Calendar className="w-4 h-4" />
                                <span className="font-semibold">{session.date}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{session.time}</span>
                              </div>
                            </div>
                            <div>
                              <Button 
                                variant="cta" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/event/${event.id}/tickets/${sessionIndex}`);
                                }}
                              >
                                Book Now
                              </Button>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="border-t border-border p-4 space-y-3 bg-background/50">
                            {session.ticketCategories.map((category, catIndex) => (
                              <div 
                                key={catIndex} 
                                className="flex items-center justify-between py-2 px-3 rounded hover:bg-foreground/5"
                              >
                                <span className="font-medium">{category.name}</span>
                                <span className="text-lg font-bold text-primary">
                                  {category.price === 0 ? 'Free' : `$${category.price.toFixed(2)}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))
                ) : (
                  // Single session or no sessions - show ticket categories directly
                  <div className="glass-border rounded-lg overflow-hidden">
                    <div className="p-4 space-y-3">
                      {event.sessions && event.sessions[0] ? (
                        <>
                          <div className="flex items-center gap-4 mb-4 pb-3 border-b border-border">
                            <div className="flex items-center gap-2 text-primary">
                              <Calendar className="w-4 h-4" />
                              <span className="font-semibold">{event.sessions[0].date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{event.sessions[0].time}</span>
                            </div>
                          </div>
                          {event.sessions[0].ticketCategories.map((category, catIndex) => (
                            <div 
                              key={catIndex} 
                              className="flex items-center justify-between py-3 px-3 rounded hover:bg-foreground/5"
                            >
                              <div>
                                <span className="font-medium block">{category.name}</span>
                                <span className="text-sm text-muted-foreground">{category.description}</span>
                              </div>
                              <span className="text-xl font-bold text-primary">
                                {category.price === 0 ? 'Free' : `$${category.price.toFixed(2)}`}
                              </span>
                            </div>
                          ))}
                          <div className="pt-3 mt-3 border-t border-border">
                            <Button 
                              variant="cta" 
                              className="w-full"
                              onClick={() => navigate(`/event/${event.id}/tickets/0`)}
                            >
                              Book Now
                            </Button>
                          </div>
                        </>
                      ) : (
                        event.ticketCategories.map((category, catIndex) => (
                          <div 
                            key={catIndex} 
                            className="flex items-center justify-between py-3 px-3 rounded hover:bg-foreground/5"
                          >
                            <div>
                              <span className="font-medium block">{category.name}</span>
                              <span className="text-sm text-muted-foreground">{category.description}</span>
                            </div>
                            <span className="text-xl font-bold text-primary">
                              {category.price === 0 ? 'Free' : `$${category.price.toFixed(2)}`}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Organizer Card */}
            <div className="glass glass-border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Organized by</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {event.organizer.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{event.organizer.name}</p>
                  <p className="text-sm text-muted-foreground">{event.organizer.email}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Mail className="w-4 h-4" />
                Contact Organizer
              </Button>
            </div>
          </div>

          {/* Sidebar - Get Your Tickets CTA */}
          <div className="space-y-6">
            <div className="glass glass-border rounded-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Get Your Tickets</h3>
              
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Starting from</p>
                <p className="text-4xl font-bold text-primary">
                  {event.isFree ? 'Free' : `$${Math.min(...event.ticketCategories.map(cat => cat.price))}`}
                </p>
              </div>

              {hasMultipleSessions ? (
                <Button 
                  variant="cta" 
                  className="w-full h-12 text-base mb-4"
                  onClick={() => {
                    // Scroll to event schedule section
                    const scheduleSection = document.querySelector('.glass.glass-border.rounded-xl.p-6:has(h2)');
                    scheduleSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  Select Session
                </Button>
              ) : (
                <Button 
                  variant="cta" 
                  className="w-full h-12 text-base mb-4"
                  onClick={() => navigate(`/event/${event.id}/tickets/0`)}
                >
                  Book Now
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full gap-2"
              >
                <Calendar className="w-4 h-4" />
                Add to Calendar
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetail;
