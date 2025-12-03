import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Upload, Calendar as CalendarIcon, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const CreateEvent = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null as File | null,
    venue: '',
    location: '',
    sessions: [
      {
        startDate: undefined as Date | undefined,
        startTime: '',
        endDate: undefined as Date | undefined,
        endTime: '',
        isExpanded: true,
        ticketCategories: [
          { name: 'General Admission', price: 0, quantity: 100 }
        ]
      }
    ]
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePublish = () => {
    toast({
      title: "Event Published!",
      description: "Your event has been created successfully.",
    });
    navigate('/organize');
  };

  const addTicketCategory = (sessionIndex: number) => {
    const newSessions = [...formData.sessions];
    newSessions[sessionIndex].ticketCategories.push({ name: '', price: 0, quantity: 0 });
    setFormData({ ...formData, sessions: newSessions });
  };

  const addSession = () => {
    setFormData({
      ...formData,
      sessions: [
        ...formData.sessions,
        {
          startDate: undefined,
          startTime: '',
          endDate: undefined,
          endTime: '',
          isExpanded: true,
          ticketCategories: [{ name: 'General Admission', price: 0, quantity: 100 }]
        }
      ]
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 gap-2" asChild>
          <Link to="/organize">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Progress Steps */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6">Create New Event</h1>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`h-2 rounded-full flex-1 ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Basic Info</span>
            <span>Sessions & Tickets</span>
            <span>Review</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="glass glass-border rounded-xl p-8 mb-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Basic Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="Summer Music Festival 2025"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell people about your event..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Event Image *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">Drag & drop or click to upload</p>
                  <p className="text-sm text-muted-foreground">Recommended: 1920x1080px, Max 5MB</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue Name *</Label>
                <Input
                  id="venue"
                  placeholder="Convention Center"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Full Address *</Label>
                <Input
                  id="location"
                  placeholder="123 Main St, City, State, ZIP"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Sessions & Tickets</h2>
                <Button onClick={addSession} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Session
                </Button>
              </div>

              <div className="space-y-6">
                {formData.sessions.map((session, sessionIndex) => (
                  <div key={sessionIndex} className="glass-border rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">Session {sessionIndex + 1}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newSessions = [...formData.sessions];
                            newSessions[sessionIndex].isExpanded = !newSessions[sessionIndex].isExpanded;
                            setFormData({ ...formData, sessions: newSessions });
                          }}
                        >
                          {session.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                      {sessionIndex > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newSessions = [...formData.sessions];
                            newSessions.splice(sessionIndex, 1);
                            setFormData({ ...formData, sessions: newSessions });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {session.isExpanded && (
                      <>
                        {/* Start DateTime */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Date *</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {session.startDate ? format(session.startDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={session.startDate}
                                  onSelect={(date) => {
                                    const newSessions = [...formData.sessions];
                                    newSessions[sessionIndex].startDate = date;
                                    setFormData({ ...formData, sessions: newSessions });
                                  }}
                                  initialFocus
                                />
                                <div className="p-3 border-t">
                                  <Label className="text-xs">Time</Label>
                                  <Input
                                    type="time"
                                    value={session.startTime}
                                    onChange={(e) => {
                                      const newSessions = [...formData.sessions];
                                      newSessions[sessionIndex].startTime = e.target.value;
                                      setFormData({ ...formData, sessions: newSessions });
                                    }}
                                    className="mt-2"
                                  />
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <Label>End Date *</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {session.endDate ? format(session.endDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={session.endDate}
                                  onSelect={(date) => {
                                    const newSessions = [...formData.sessions];
                                    newSessions[sessionIndex].endDate = date;
                                    setFormData({ ...formData, sessions: newSessions });
                                  }}
                                  initialFocus
                                />
                                <div className="p-3 border-t">
                                  <Label className="text-xs">Time</Label>
                                  <Input
                                    type="time"
                                    value={session.endTime}
                                    onChange={(e) => {
                                      const newSessions = [...formData.sessions];
                                      newSessions[sessionIndex].endTime = e.target.value;
                                      setFormData({ ...formData, sessions: newSessions });
                                    }}
                                    className="mt-2"
                                  />
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {/* Ticket Categories */}
                        <div className="space-y-4 pt-4">
                          <h4 className="font-semibold">Ticket Categories</h4>
                          
                          {session.ticketCategories.map((category, catIndex) => (
                            <div key={catIndex} className="bg-background/50 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium">Category {catIndex + 1}</span>
                                {catIndex > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newSessions = [...formData.sessions];
                                      newSessions[sessionIndex].ticketCategories.splice(catIndex, 1);
                                      setFormData({ ...formData, sessions: newSessions });
                                    }}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-xs">Category Name *</Label>
                                  <Input
                                    placeholder="General Admission"
                                    value={category.name}
                                    onChange={(e) => {
                                      const newSessions = [...formData.sessions];
                                      newSessions[sessionIndex].ticketCategories[catIndex].name = e.target.value;
                                      setFormData({ ...formData, sessions: newSessions });
                                    }}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs">Price ($) *</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={category.price}
                                    onChange={(e) => {
                                      const newSessions = [...formData.sessions];
                                      newSessions[sessionIndex].ticketCategories[catIndex].price = parseFloat(e.target.value) || 0;
                                      setFormData({ ...formData, sessions: newSessions });
                                    }}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs">Quantity *</Label>
                                  <Input
                                    type="number"
                                    placeholder="100"
                                    value={category.quantity}
                                    onChange={(e) => {
                                      const newSessions = [...formData.sessions];
                                      newSessions[sessionIndex].ticketCategories[catIndex].quantity = parseInt(e.target.value) || 0;
                                      setFormData({ ...formData, sessions: newSessions });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          <Button 
                            variant="outline" 
                            onClick={() => addTicketCategory(sessionIndex)} 
                            className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] text-black border-0"
                          >
                            + Add Another Category
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Review & Publish</h2>

              <div className="space-y-4">
                <div className="glass-border rounded-lg p-4">
                  <h3 className="font-bold mb-2">Event Details</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Title:</span> {formData.title || 'Not set'}</p>
                    <p><span className="text-muted-foreground">Venue:</span> {formData.venue || 'Not set'}</p>
                    <p><span className="text-muted-foreground">Location:</span> {formData.location || 'Not set'}</p>
                  </div>
                </div>

                <div className="glass-border rounded-lg p-4">
                  <h3 className="font-bold mb-3">Sessions</h3>
                  <div className="space-y-4">
                    {formData.sessions.map((session, i) => (
                      <div key={i} className="bg-background/30 rounded p-3">
                        <p className="font-semibold mb-2">Session {i + 1}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {session.startDate ? format(session.startDate, "PPP") : 'Start date not set'} {session.startTime || ''} 
                          {' → '}
                          {session.endDate ? format(session.endDate, "PPP") : 'End date not set'} {session.endTime || ''}
                        </p>
                        <div className="space-y-1">
                          {session.ticketCategories.map((cat, j) => (
                            <div key={j} className="text-sm flex justify-between">
                              <span>{cat.name || `Category ${j + 1}`}</span>
                              <span>${cat.price} • {cat.quantity} tickets</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {step < 3 ? (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline">Save as Draft</Button>
              <Button variant="cta" onClick={handlePublish}>
                Publish Event
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateEvent;
