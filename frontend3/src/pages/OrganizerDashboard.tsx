import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, BarChart3, Edit, UserCheck, Plus, Settings, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { eventsApi } from "@/api/events.api";
import { BackendEvent, EventStatus } from "@/types/api.types";

const OrganizerDashboard = () => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [myEvents, setMyEvents] = useState<BackendEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const events = await eventsApi.getMyEvents();
        setMyEvents(events);
      } catch (err: any) {
        console.error('Failed to fetch events:', err);
        setError(err.response?.data?.message || 'Failed to load your events');
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  // Filter events based on date and exclude drafts
  const filteredEvents = myEvents.filter(event => {
    // Filter out drafts
    if (event.eventStatus === EventStatus.DRAFT) {
      return false;
    }

    const eventDate = event.startDateTime ? new Date(event.startDateTime) : null;
    const now = new Date();

    if (filter === 'upcoming' && eventDate) return eventDate > now;
    if (filter === 'past' && eventDate) return eventDate <= now;
    return true;
  });

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Organizer Dashboard</h1>
            <p className="text-muted-foreground">Manage your events and track performance</p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link to="/organize/drafts">
                <FileText className="w-5 h-5" />
                Drafts
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link to="/organizer/profile">
                <Settings className="w-5 h-5" />
                Profile Settings
              </Link>
            </Button>
            <Button size="lg" variant="cta" className="gap-2" asChild>
              <Link to="/organize/create">
                <Plus className="w-5 h-5" />
                Create New Event
              </Link>
            </Button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Loading your events...</h2>
            <p className="text-muted-foreground">Please wait</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-2 text-destructive">Error Loading Events</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* My Events Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">My Events</h2>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'upcoming' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('upcoming')}
                  >
                    Upcoming
                  </Button>
                  <Button
                    variant={filter === 'past' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('past')}
                  >
                    Past
                  </Button>
                </div>
              </div>

              {/* Events List */}
              <div className="space-y-6">
                {filteredEvents.length === 0 ? (
                  <div className="glass glass-border rounded-xl p-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">No events found</h3>
                    <p className="text-muted-foreground mb-6">
                      {filter === 'all'
                        ? "You haven't created any events yet"
                        : `You don't have any ${filter} events`}
                    </p>
                    <Button variant="cta" asChild>
                      <Link to="/organize/create">Create Your First Event</Link>
                    </Button>
                  </div>
                ) : (
                  filteredEvents.map((event) => (
                    <div key={event.eventId} className="glass glass-border rounded-xl overflow-hidden hover:border-primary transition-colors">
                      <div className="p-6">
                        {/* Event Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {event.startDateTime
                                    ? new Date(event.startDateTime).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })
                                    : 'TBA'}
                                </span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <span>📍 {event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.eventStatus === EventStatus.COMING_SOON || event.eventStatus === EventStatus.ONGOING
                              ? 'bg-green-500/20 text-green-500'
                              : event.eventStatus === EventStatus.COMPLETED
                              ? 'bg-blue-500/20 text-blue-500'
                              : event.eventStatus === EventStatus.CANCELED
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {event.eventStatus}
                          </span>
                        </div>

                        {/* Event Description */}
                        {event.generalIntroduction && (
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {event.generalIntroduction}
                          </p>
                        )}

                        {/* 3 Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Button
                            variant="outline"
                            className="gap-2 justify-start"
                            asChild
                          >
                            <Link to={`/organize/event/${event.eventId}/sales`}>
                              <BarChart3 className="w-4 h-4" />
                              View Sales
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2 justify-start"
                            asChild
                          >
                            <Link to={`/organize/event/${event.eventId}/edit`}>
                              <Edit className="w-4 h-4" />
                              Edit Event
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2 justify-start"
                            asChild
                          >
                            <Link to={`/organize/event/${event.eventId}/checkin-report`}>
                              <UserCheck className="w-4 h-4" />
                              Check-in
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrganizerDashboard;
