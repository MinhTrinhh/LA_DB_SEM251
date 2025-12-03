import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket as TicketIcon, Settings, Bell } from "lucide-react";
import MyTicketCard from "@/components/MyTicketCard";
import { Ticket } from "@/data/mockEvents";

// Mock data - In production, this would come from API
const mockTickets: Ticket[] = [
  {
    id: "ticket-001",
    eventId: "1",
    eventTitle: "Summer Music Festival 2025",
    eventDate: "Dec 15, 2025",
    eventTime: "6:00 PM",
    venue: "City Park Main Stage",
    category: "VIP",
    quantity: 2,
    totalPrice: 300,
    purchaseDate: "2025-11-28",
    qrCode: "EVENT-EASE-123456",
    status: "valid"
  },
  {
    id: "ticket-002",
    eventId: "2",
    eventTitle: "Digital Marketing Workshop",
    eventDate: "Dec 8, 2025",
    eventTime: "10:00 AM",
    venue: "Tech Hub Conference Room",
    category: "Free Admission",
    quantity: 1,
    totalPrice: 0,
    purchaseDate: "2025-11-25",
    qrCode: "EVENT-EASE-789012",
    status: "valid"
  }
];

const MyTickets = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my-tickets");

  const upcomingTickets = mockTickets.filter(ticket => ticket.status === 'valid');
  const pastTickets = mockTickets.filter(ticket => ticket.status === 'used');

  // Handle tab change - redirect to profile page if profile tab clicked
  const handleTabChange = (value: string) => {
    if (value === "profile") {
      navigate("/participant/profile");
    } else {
      setActiveTab(value);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">My Dashboard</h1>
          <p className="text-lg text-muted-foreground">Manage your tickets and profile</p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="glass glass-border w-fit">
            <TabsTrigger value="my-tickets" className="gap-2">
              <TicketIcon className="w-4 h-4" />
              My Tickets
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Settings className="w-4 h-4" />
              Profile Settings
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 relative">
              <Bell className="w-4 h-4" />
              Notifications
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center text-primary-foreground">
                3
              </span>
            </TabsTrigger>
          </TabsList>

          {/* My Tickets Tab */}
          <TabsContent value="my-tickets" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
              
              {upcomingTickets.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTickets.map((ticket) => (
                    <MyTicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              ) : (
                <div className="glass glass-border rounded-xl p-12 text-center">
                  <TicketIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No Upcoming Events</h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any upcoming events. Explore and book tickets now!
                  </p>
                  <Button asChild variant="cta">
                    <Link to="/">Browse Events</Link>
                  </Button>
                </div>
              )}
            </div>

            {pastTickets.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Past Events</h2>
                <div className="space-y-4">
                  {pastTickets.map((ticket) => (
                    <MyTicketCard key={ticket.id} ticket={ticket} isPast />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="glass glass-border rounded-xl p-8 max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
              <p className="text-muted-foreground">Profile management coming soon...</p>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="glass glass-border rounded-xl p-8 max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">Notifications</h2>
              <p className="text-muted-foreground">Notification center coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default MyTickets;
