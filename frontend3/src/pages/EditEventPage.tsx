import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Upload, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { OrganizerPanel } from '@/components/OrganizerPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mockEvents } from '@/data/mockEvents';

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get event data (in real app, would fetch from API)
  const event = mockEvents.find(e => e.id === id);
  
  const [ticketCategories, setTicketCategories] = useState(
    event?.ticketCategories?.map(tc => ({
      name: tc.name,
      price: tc.price,
      quantity: tc.total
    })) || [{ name: 'General Admission', price: 0, quantity: 100 }]
  );
  
  const [sessions, setSessions] = useState(
    event?.sessions?.map(s => ({
      date: s.date,
      time: s.time
    })) || [{ date: '', time: '' }]
  );

  const addTicketCategory = () => {
    setTicketCategories([...ticketCategories, { name: '', price: 0, quantity: 0 }]);
  };

  const removeTicketCategory = (index: number) => {
    setTicketCategories(ticketCategories.filter((_, i) => i !== index));
  };

  const updateTicketCategory = (index: number, field: string, value: string | number) => {
    const updated = [...ticketCategories];
    updated[index] = { ...updated[index], [field]: value };
    setTicketCategories(updated);
  };

  const addSession = () => {
    setSessions([...sessions, { date: '', time: '' }]);
  };

  const removeSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const updateSession = (index: number, field: string, value: string) => {
    const updated = [...sessions];
    updated[index] = { ...updated[index], [field]: value };
    setSessions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save - redirect back to dashboard
    navigate('/organize');
  };

  if (!event) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl mb-4">Event not found</h2>
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
                    defaultValue={event.title}
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    rows={6}
                    defaultValue={event.description}
                    placeholder="Describe your event..."
                    required
                  />
                </div>

                <div>
                  <Label>Event Image *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Location */}
            <div className="glass glass-border rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Date & Location</h2>
              
              <div className="space-y-6">
                {/* Sessions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Event Sessions *</Label>
                    <Button
                      type="button"
                      onClick={addSession}
                      size="sm"
                      variant="default"
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Session
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {sessions.map((session, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Input
                          type="date"
                          value={session.date}
                          onChange={(e) => updateSession(index, 'date', e.target.value)}
                          required
                          className="flex-1"
                        />
                        <Input
                          type="time"
                          value={session.time}
                          onChange={(e) => updateSession(index, 'time', e.target.value)}
                          required
                          className="flex-1"
                        />
                        {sessions.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeSession(index)}
                            size="icon"
                            variant="destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="venue">Venue Name *</Label>
                    <Input
                      id="venue"
                      type="text"
                      defaultValue={event.venue}
                      placeholder="e.g., Central Park Arena"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">City, State *</Label>
                    <Input
                      id="location"
                      type="text"
                      defaultValue={event.location}
                      placeholder="e.g., New York, NY"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Street address"
                  />
                </div>
              </div>
            </div>

            {/* Ticket Categories */}
            <div className="glass glass-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Ticket Categories</h2>
                <Button
                  type="button"
                  onClick={addTicketCategory}
                  variant="default"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </Button>
              </div>

              <div className="space-y-4">
                {ticketCategories.map((category, index) => (
                  <div key={index} className="p-4 glass-border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold">Category {index + 1}</h3>
                      {ticketCategories.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeTicketCategory(index)}
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Category Name *</Label>
                        <Input
                          type="text"
                          value={category.name}
                          onChange={(e) => updateTicketCategory(index, 'name', e.target.value)}
                          placeholder="e.g., General Admission"
                          required
                        />
                      </div>

                      <div>
                        <Label>Price ($) *</Label>
                        <Input
                          type="number"
                          value={category.price}
                          onChange={(e) => updateTicketCategory(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0 for free"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      <div>
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          value={category.quantity}
                          onChange={(e) => updateTicketCategory(index, 'quantity', parseInt(e.target.value) || 0)}
                          placeholder="Available tickets"
                          min="1"
                          required
                        />
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
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="cta"
              >
                Save Changes
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
