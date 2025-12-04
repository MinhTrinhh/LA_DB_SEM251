import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket as TicketIcon, Settings, Bell } from "lucide-react";
import MyTicketCard from "@/components/MyTicketCard";
import { ordersApi, OrderDTO } from "@/api/orders.api";
import { useToast } from "@/hooks/use-toast";

// Convert OrderDTO to Ticket format for MyTicketCard
interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  category: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  qrCode: string;
  status: "valid" | "used";
}

const convertOrderToTicket = (order: OrderDTO): Ticket => {
  return {
    id: order.orderId.toString(),
    eventId: order.event?.eventId?.toString() || "0",
    eventTitle: order.event?.title || "Event",
    eventDate: order.event?.startDateTime 
      ? new Date(order.event.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : "TBD",
    eventTime: order.event?.startDateTime 
      ? new Date(order.event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : "TBD",
    venue: order.event?.location || "Online Event",
    category: order.tickets[0]?.ticketCategory?.name || "General Admission",
    quantity: order.tickets.length,
    totalPrice: order.amountOfMoney,
    purchaseDate: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    qrCode: order.tickets[0]?.qrCodeUrl || "",
    status: order.orderStatus === "PENDING" ? "valid" : "used"
  };
};

const MyTickets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("my-tickets");
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await ordersApi.getMyOrders();
        setOrders(ordersData);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Failed to load tickets",
          description: error.response?.data?.message || "Unable to fetch your tickets",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const tickets = orders.map(convertOrderToTicket);
  const upcomingTickets = tickets.filter(ticket => ticket.status === 'valid');
  const pastTickets = tickets.filter(ticket => ticket.status === 'used');

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
              
              {loading ? (
                <div className="glass glass-border rounded-xl p-12 text-center">
                  <p className="text-muted-foreground">Loading your tickets...</p>
                </div>
              ) : upcomingTickets.length > 0 ? (
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
