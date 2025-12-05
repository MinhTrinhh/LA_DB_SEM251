import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Clock, Plus, Minus, ArrowLeft, Maximize2 } from "lucide-react";
import { eventsApi } from "@/api/events.api";
import { BackendEvent, BackendSession } from "@/types/api.types";
import { formatVND } from "@/utils/currency";

interface SelectedTickets {
  [ticketCategoryId: number]: number; // ticketCategoryId -> quantity
}

const TicketSelection = () => {
  const { eventId, sessionIndex } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<BackendEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<SelectedTickets>({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await eventsApi.getEventById(Number(eventId));
        setEvent(eventData);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Loading event...</h1>
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
          <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link to="/">Back to Events</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const sessionIdx = parseInt(sessionIndex || "0");
  const session = event.sessions[sessionIdx];

  if (!session) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Session Not Found</h1>
          <Button asChild>
            <Link to={`/event/${eventId}`}>Back to Event</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const updateTicketQuantity = (ticketCategoryId: number, delta: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketCategoryId]: Math.max(0, (prev[ticketCategoryId] || 0) + delta)
    }));
  };

  const totalAmount = Object.entries(selectedTickets).reduce((sum, [categoryIdStr, quantity]) => {
    const categoryId = Number(categoryIdStr);
    const ticketCategory = session.ticketCategories?.find(tc => tc.ticketCategoryId === categoryId);
    return sum + (ticketCategory?.price || 0) * quantity;
  }, 0);

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  const handleContinue = () => {
    if (totalTickets > 0) {
      navigate(`/event/${eventId}/checkout`, {
        state: {
          selectedTickets,
          totalAmount,
          totalTickets,
          sessionId: session.sessionId,
          session,
          event
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Back Button Header */}
      <div className="glass-dark border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link
            to={`/event/${eventId}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Event</span>
          </Link>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side - Seat Map Placeholder */}
        <div className="flex-1 bg-black/50 flex items-center justify-center min-h-[400px] lg:min-h-0">
          <div className="text-center text-muted-foreground">
            <Maximize2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Seat Map Placeholder</p>
            <p className="text-sm mt-2 opacity-70">Seat map will be displayed here (if available)</p>
          </div>
        </div>

        {/* Right Sidebar - Ticket Selection */}
        <div className="w-full lg:w-[420px] glass-dark border-l border-border flex flex-col">
          {/* Event Info Header */}
          <Card className="rounded-none border-0 border-b">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">{event.title}</h1>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>{new Date(session.startDateTime).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>{new Date(session.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{session.venueName || event.location || 'Online Event'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Scrollable Ticket List */}
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-lg font-bold mb-4">Select Tickets</h2>

            <div className="space-y-3">
              {session.ticketCategories && session.ticketCategories.map((category) => {
                const available = category.quantity;
                const isSoldOut = available === 0;
                return (
                  <Card key={category.ticketCategoryId} className={`p-4 ${isSoldOut ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold mb-1">{category.categoryName}</h3>
                          {isSoldOut && (
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-red-500/20 text-red-500">
                              SOLD OUT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Ticket for {event.title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-primary">
                          {category.price === 0 ? 'Free' : formatVND(category.price)}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isSoldOut ? 'Sold out' : `${available} available`}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateTicketQuantity(category.ticketCategoryId, -1)}
                          disabled={!selectedTickets[category.ticketCategoryId]}
                          className="h-8 w-8"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {selectedTickets[category.ticketCategoryId] || 0}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateTicketQuantity(category.ticketCategoryId, 1)}
                          disabled={isSoldOut || (selectedTickets[category.ticketCategoryId] || 0) >= available}
                          className="h-8 w-8"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Bottom Summary & CTA */}
          <Card className="rounded-none border-0 border-t p-6">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>

            {/* Selected Tickets Breakdown */}
            {totalTickets > 0 && (
              <div className="space-y-2 mb-4 pb-4 border-b border-border">
                {Object.entries(selectedTickets).map(([categoryIdStr, quantity]) => {
                  if (quantity === 0) return null;
                  const categoryId = Number(categoryIdStr);
                  const ticketCategory = session.ticketCategories?.find(tc => tc.ticketCategoryId === categoryId);
                  const price = ticketCategory?.price || 0;
                  return (
                    <div key={categoryId} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{ticketCategory?.categoryName} × {quantity}</span>
                      <span className="font-semibold">
                        {price === 0 ? 'Free' : formatVND(price * quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-muted-foreground">Total</span>
              <span className="text-3xl font-bold text-primary">
                {totalAmount === 0 ? 'Free' : formatVND(totalAmount)}
              </span>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={totalTickets === 0}
              className="w-full h-12 text-base"
              variant="cta"
            >
              Continue to Checkout
            </Button>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TicketSelection;
