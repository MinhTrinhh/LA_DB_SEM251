import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { eventsApi } from "@/api/events.api";
import { BackendEvent } from "@/types/api.types";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DraftEvents = () => {
  const [draftEvents, setDraftEvents] = useState<BackendEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingEventId, setPublishingEventId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchDraftEvents = useCallback(async () => {
    try {
      setLoading(true);
      const events = await eventsApi.getDraftEvents();
      // Ensure events is always an array
      setDraftEvents(Array.isArray(events) ? events : []);
    } catch (error: unknown) {
      console.error("Error fetching draft events:", error);
      setDraftEvents([]); // Set to empty array on error
      const errorMessage = error instanceof Error ? error.message : "Failed to load draft events";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDraftEvents();
  }, [fetchDraftEvents]);

  const handlePublish = async (eventId: number) => {
    try {
      setPublishingEventId(eventId);
      await eventsApi.publishEvent(eventId);

      toast({
        title: "Event Published!",
        description: "Your event is now live and visible to participants.",
      });

      // Remove the published event from the list
      setDraftEvents(draftEvents.filter(event => event.eventId !== eventId));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to publish event";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setPublishingEventId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" className="mb-4" asChild>
              <Link to="/organize">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>

            <h1 className="text-4xl font-bold mb-2">Draft Events</h1>
            <p className="text-muted-foreground">
              Review and publish your draft events to make them visible to participants.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading draft events...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && Array.isArray(draftEvents) && draftEvents.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You don't have any draft events.
                </p>
                <Button variant="cta" asChild>
                  <Link to="/organize/create">Create New Event</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Draft Events Grid */}
          {!loading && Array.isArray(draftEvents) && draftEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftEvents.map((event) => (
                <Card key={event.eventId} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4" />
                      {event.startDateTime
                        ? format(new Date(event.startDateTime), "MMM dd, yyyy • h:mm a")
                        : event.startDate
                        ? format(new Date(event.startDate), "MMM dd, yyyy")
                        : "Date TBD"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {event.generalIntroduction || "No description available"}
                    </p>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/organize/event/${event.eventId}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="cta"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handlePublish(event.eventId)}
                      disabled={publishingEventId === event.eventId}
                    >
                      {publishingEventId === event.eventId ? (
                        "Publishing..."
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Publish
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DraftEvents;

