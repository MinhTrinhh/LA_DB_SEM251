import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, ArrowLeft, Loader2, AlertCircle, Database } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { OrganizerPanel } from '@/components/OrganizerPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  editEventApi, 
  EventEditDetailsDTO
} from '@/api/editEvent.api';

interface LocalTicketCategory {
  categoryId?: number;
  sessionId: number;
  categoryName: string;
  price: number;
  maximumSlot: number;
  soldCount: number;
  isNew?: boolean;
}

interface LocalSession {
  sessionId: number;
  eventId: number;
  startDateTime: string;
  endDateTime: string;
  venueName: string;
  venueAddress: string;
  meetingUrl: string;
  platformName: string;
  sessionType: string;
}

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<EventEditDetailsDTO | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [sessions, setSessions] = useState<LocalSession[]>([]);
  const [ticketCategories, setTicketCategories] = useState<LocalTicketCategory[]>([]);
  const [deletedCategories, setDeletedCategories] = useState<number[]>([]);

  // Fetch event data on mount
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const eventData = await editEventApi.getEventForEdit(parseInt(id));
        setEvent(eventData);
        
        // Initialize form state
        setTitle(eventData.title || '');
        setDescription(eventData.description || '');
        setPosterUrl(eventData.posterUrl || '');
        
        // Transform sessions
        setSessions(eventData.sessions.map(s => ({
          sessionId: s.sessionId,
          eventId: s.eventId,
          startDateTime: s.startDateTime ? s.startDateTime.substring(0, 16) : '',
          endDateTime: s.endDateTime ? s.endDateTime.substring(0, 16) : '',
          venueName: s.venueName || '',
          venueAddress: s.venueAddress || '',
          meetingUrl: s.meetingUrl || '',
          platformName: s.platformName || '',
          sessionType: s.sessionType || 'OFFLINE'
        })));
        
        // Transform ticket categories
        setTicketCategories(eventData.ticketCategories.map(tc => ({
          categoryId: tc.categoryId,
          sessionId: tc.sessionId,
          categoryName: tc.categoryName,
          price: tc.price,
          maximumSlot: tc.maximumSlot,
          soldCount: tc.soldCount
        })));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const addTicketCategory = (sessionId: number) => {
    setTicketCategories([
      ...ticketCategories, 
      { 
        sessionId, 
        categoryName: '', 
        price: 0, 
        maximumSlot: 100,
        soldCount: 0,
        isNew: true 
      }
    ]);
  };

  const removeTicketCategory = async (index: number) => {
    const category = ticketCategories[index];
    
    // If it's an existing category (has ID), mark for deletion
    if (category.categoryId) {
      if (category.soldCount > 0) {
        toast({
          title: "Cannot delete",
          description: `This category has ${category.soldCount} sold tickets. Process refunds first.`,
          variant: "destructive",
        });
        return;
      }
      setDeletedCategories([...deletedCategories, category.categoryId]);
    }
    
    setTicketCategories(ticketCategories.filter((_, i) => i !== index));
  };

  const updateTicketCategory = (index: number, field: string, value: string | number) => {
    const updated = [...ticketCategories];
    updated[index] = { ...updated[index], [field]: value };
    setTicketCategories(updated);
  };

  const updateSession = (index: number, field: string, value: string) => {
    const updated = [...sessions];
    updated[index] = { ...updated[index], [field]: value };
    setSessions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !event) return;

    try {
      setSaving(true);
      const eventId = parseInt(id);

      // 1. Update basic event info
      await editEventApi.updateEventBasicInfo(eventId, {
        title: title !== event.title ? title : undefined,
        description: description !== event.description ? description : undefined,
        posterUrl: posterUrl !== event.posterUrl ? posterUrl : undefined,
      });

      // 2. Update sessions
      for (const session of sessions) {
        const originalSession = event.sessions.find(s => s.sessionId === session.sessionId);
        if (originalSession) {
          const hasChanges = 
            session.startDateTime !== originalSession.startDateTime?.substring(0, 16) ||
            session.endDateTime !== originalSession.endDateTime?.substring(0, 16) ||
            session.venueName !== originalSession.venueName ||
            session.venueAddress !== originalSession.venueAddress ||
            session.meetingUrl !== originalSession.meetingUrl ||
            session.platformName !== originalSession.platformName;

          if (hasChanges) {
            await editEventApi.updateSession({
              sessionId: session.sessionId,
              eventId: session.eventId,
              startDateTime: session.startDateTime ? session.startDateTime + ':00' : undefined,
              endDateTime: session.endDateTime ? session.endDateTime + ':00' : undefined,
              venueName: session.venueName || undefined,
              venueAddress: session.venueAddress || undefined,
              meetingUrl: session.meetingUrl || undefined,
              platformName: session.platformName || undefined,
            });
          }
        }
      }

      // 3. Delete removed ticket categories
      for (const categoryId of deletedCategories) {
        await editEventApi.deleteTicketCategory(categoryId);
      }

      // 4. Update or create ticket categories
      for (const category of ticketCategories) {
        if (category.isNew) {
          // Add new category
          await editEventApi.addTicketCategory({
            sessionId: category.sessionId,
            eventId: eventId,
            categoryName: category.categoryName,
            price: category.price,
            maximumSlot: category.maximumSlot,
          });
        } else if (category.categoryId) {
          // Update existing category
          const originalCategory = event.ticketCategories.find(tc => tc.categoryId === category.categoryId);
          if (originalCategory) {
            const hasChanges = 
              category.categoryName !== originalCategory.categoryName ||
              category.price !== originalCategory.price ||
              category.maximumSlot !== originalCategory.maximumSlot;

            if (hasChanges) {
              await editEventApi.updateTicketCategory({
                categoryId: category.categoryId,
                categoryName: category.categoryName !== originalCategory.categoryName ? category.categoryName : undefined,
                price: category.price !== originalCategory.price ? category.price : undefined,
                maximumSlot: category.maximumSlot !== originalCategory.maximumSlot ? category.maximumSlot : undefined,
              });
            }
          }
        }
      }

      toast({
        title: "Event Updated",
        description: "Your event has been successfully updated using stored procedures.",
      });
      
      navigate('/organize');
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update event',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event details...</p>
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
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl mb-4">{error || 'Event not found'}</h2>
          <Button onClick={() => navigate('/organize')}>
            Back to Dashboard
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        {/* Organizer Panel */}
        <OrganizerPanel />

        {/* Main Content */}
        <div className="flex-1 py-8 px-8">
          <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/organize')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold mb-2">Edit Event</h1>
            <p className="text-muted-foreground">Update your event details</p>
          </div>

          {/* Info Banner about Stored Procedures */}
          <Alert className="mb-6 bg-blue-500/10 border-blue-500/30">
            <Database className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-200">
              <strong>Database Integration:</strong> This page uses SQL stored procedures 
              (sp_GetEventForEdit, sp_UpdateEventBasicInfo, sp_UpdateSession, sp_UpdateTicketCategory, 
              sp_AddTicketCategory, sp_DeleteTicketCategory) and triggers for data validation.
            </AlertDescription>
          </Alert>

          {/* Event Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass glass-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold">{event.status}</p>
            </div>
            <div className="glass glass-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-semibold">${event.totalRevenue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="glass glass-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Tickets Sold</p>
              <p className="text-lg font-semibold">{event.totalTicketsSold || 0}</p>
            </div>
            <div className="glass glass-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Sessions</p>
              <p className="text-lg font-semibold">{sessions.length}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="glass glass-border rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your event..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="posterUrl">Poster URL</Label>
                  <Input
                    id="posterUrl"
                    type="text"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Sessions */}
            <div className="glass glass-border rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Sessions</h2>
              
              <div className="space-y-6">
                {sessions.map((session, sessionIndex) => (
                  <div key={session.sessionId} className="p-4 glass-border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      Session {sessionIndex + 1} ({session.sessionType})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Start Date & Time</Label>
                        <Input
                          type="datetime-local"
                          value={session.startDateTime}
                          onChange={(e) => updateSession(sessionIndex, 'startDateTime', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>End Date & Time</Label>
                        <Input
                          type="datetime-local"
                          value={session.endDateTime}
                          onChange={(e) => updateSession(sessionIndex, 'endDateTime', e.target.value)}
                        />
                      </div>
                    </div>

                    {session.sessionType === 'OFFLINE' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Venue Name</Label>
                          <Input
                            type="text"
                            value={session.venueName}
                            onChange={(e) => updateSession(sessionIndex, 'venueName', e.target.value)}
                            placeholder="e.g., Central Park Arena"
                          />
                        </div>
                        <div>
                          <Label>Venue Address</Label>
                          <Input
                            type="text"
                            value={session.venueAddress}
                            onChange={(e) => updateSession(sessionIndex, 'venueAddress', e.target.value)}
                            placeholder="Full address"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Meeting URL</Label>
                          <Input
                            type="text"
                            value={session.meetingUrl}
                            onChange={(e) => updateSession(sessionIndex, 'meetingUrl', e.target.value)}
                            placeholder="https://zoom.us/..."
                          />
                        </div>
                        <div>
                          <Label>Platform Name</Label>
                          <Input
                            type="text"
                            value={session.platformName}
                            onChange={(e) => updateSession(sessionIndex, 'platformName', e.target.value)}
                            placeholder="e.g., Zoom, Google Meet"
                          />
                        </div>
                      </div>
                    )}

                    {/* Ticket Categories for this Session */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base">Ticket Categories</Label>
                        <Button
                          type="button"
                          onClick={() => addTicketCategory(session.sessionId)}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Category
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {ticketCategories
                          .filter(tc => tc.sessionId === session.sessionId)
                          .map((category) => {
                            const globalIndex = ticketCategories.findIndex(
                              tc => tc === category
                            );
                            return (
                              <div key={globalIndex} className="p-3 bg-background/50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <span className="text-sm text-muted-foreground">
                                    {category.isNew ? 'New Category' : `Sold: ${category.soldCount}`}
                                  </span>
                                  <Button
                                    type="button"
                                    onClick={() => removeTicketCategory(globalIndex)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <Label className="text-xs">Name</Label>
                                    <Input
                                      type="text"
                                      value={category.categoryName}
                                      onChange={(e) => updateTicketCategory(globalIndex, 'categoryName', e.target.value)}
                                      placeholder="e.g., VIP"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Price ($)</Label>
                                    <Input
                                      type="number"
                                      value={category.price}
                                      onChange={(e) => updateTicketCategory(globalIndex, 'price', parseFloat(e.target.value) || 0)}
                                      min="0"
                                      step="0.01"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Max Tickets</Label>
                                    <Input
                                      type="number"
                                      value={category.maximumSlot}
                                      onChange={(e) => updateTicketCategory(globalIndex, 'maximumSlot', parseInt(e.target.value) || 0)}
                                      min={category.soldCount || 1}
                                      required
                                    />
                                    {category.soldCount > 0 && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Min: {category.soldCount} (sold)
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/organize')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="cta"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
