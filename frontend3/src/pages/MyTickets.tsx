import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket as TicketIcon, Settings, Bell, QrCode, AlertCircle } from "lucide-react";
import { ordersApi, OrderDTO } from "@/api/orders.api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatVND } from "@/utils/currency";

const MyTickets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("my-tickets");
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await ordersApi.getMyOrders();
        setOrders(ordersData);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Failed to load orders",
          description: error.response?.data?.message || "Unable to fetch your orders",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const handleViewOrder = (order: OrderDTO) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleConfirmPayment = async (orderId: number) => {
    try {
      await ordersApi.confirmPayment(orderId);
      toast({
        title: "Payment confirmed!",
        description: "Your order has been marked as paid.",
      });

      // Refresh orders
      const ordersData = await ordersApi.getMyOrders();
      setOrders(ordersData);
      setShowOrderDetail(false);
    } catch (error: any) {
      toast({
        title: "Failed to confirm payment",
        description: error.response?.data?.message || "Unable to confirm payment",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600">
            Awaiting Payment
          </span>
        );
      case 'PAID':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
            Paid
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-500">
            Completed
          </span>
        );
      case 'CANCELED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-500">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-500">
            {status}
          </span>
        );
    }
  };

  // Separate orders by status
  const awaitingPaymentOrders = orders.filter(o => o.orderStatus === 'AWAITING_PAYMENT');
  const paidOrders = orders.filter(o => o.orderStatus === 'PAID' || o.orderStatus === 'COMPLETED');
  const otherOrders = orders.filter(o => !['AWAITING_PAYMENT', 'PAID', 'COMPLETED'].includes(o.orderStatus));

  // Handle tab change
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
          <h1 className="text-4xl md:text-5xl font-bold mb-3">My Orders & Tickets</h1>
          <p className="text-lg text-muted-foreground">Manage your orders and tickets</p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="glass glass-border w-fit">
            <TabsTrigger value="my-tickets" className="gap-2">
              <TicketIcon className="w-4 h-4" />
              My Orders
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
          <TabsContent value="my-tickets" className="space-y-8">
            {loading ? (
              <div className="glass glass-border rounded-xl p-12 text-center">
                <p className="text-muted-foreground">Loading your orders...</p>
              </div>
            ) : (
              <>
                {/* Awaiting Payment Orders */}
                {awaitingPaymentOrders.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Pending Payment</h2>
                    <div className="space-y-4">
                      {awaitingPaymentOrders.map((order) => (
                        <OrderCard
                          key={order.orderId}
                          order={order}
                          onViewOrder={handleViewOrder}
                          getStatusBadge={getStatusBadge}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Paid Orders (Upcoming Events) */}
                {paidOrders.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">My Tickets</h2>
                    <div className="space-y-4">
                      {paidOrders.map((order) => (
                        <OrderCard
                          key={order.orderId}
                          order={order}
                          onViewOrder={handleViewOrder}
                          getStatusBadge={getStatusBadge}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Orders */}
                {otherOrders.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Other Orders</h2>
                    <div className="space-y-4">
                      {otherOrders.map((order) => (
                        <OrderCard
                          key={order.orderId}
                          order={order}
                          onViewOrder={handleViewOrder}
                          getStatusBadge={getStatusBadge}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* No Orders */}
                {orders.length === 0 && (
                  <div className="glass glass-border rounded-xl p-12 text-center">
                    <TicketIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't made any orders. Explore and book tickets now!
                    </p>
                    <Button asChild variant="cta">
                      <Link to="/">Browse Events</Link>
                    </Button>
                  </div>
                )}
              </>
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          open={showOrderDetail}
          onClose={() => setShowOrderDetail(false)}
          order={selectedOrder}
          onConfirmPayment={handleConfirmPayment}
          getStatusBadge={getStatusBadge}
        />
      )}

      <Footer />
    </div>
  );
};

// Order Card Component
interface OrderCardProps {
  order: OrderDTO;
  onViewOrder: (order: OrderDTO) => void;
  getStatusBadge: (status: string) => JSX.Element;
}

const OrderCard = ({ order, onViewOrder, getStatusBadge }: OrderCardProps) => {
  return (
    <div className="glass glass-border rounded-xl overflow-hidden hover:border-primary hover:ring-2 hover:ring-primary/50 transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold">{order.event?.title || "Event"}</h3>
              {getStatusBadge(order.orderStatus)}
            </div>
            <p className="text-sm text-muted-foreground">Order #{order.orderId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">
              {order.event?.startDateTime
                ? new Date(order.event.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : "TBD"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tickets</p>
            <p className="font-medium">{order.tickets.length} ticket(s)</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-bold text-primary">{formatVND(order.amountOfMoney)}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onViewOrder(order)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

// Order Detail Modal Component
interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  order: OrderDTO;
  onConfirmPayment: (orderId: number) => void;
  getStatusBadge: (status: string) => JSX.Element;
}

const OrderDetailModal = ({ open, onClose, order, onConfirmPayment, getStatusBadge }: OrderDetailModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Order Details</DialogTitle>
          <DialogDescription>
            Order #{order.orderId} • Created {new Date(order.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info */}
          <div className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 p-6 rounded-lg -mx-6">
            <h3 className="text-2xl font-bold text-white mb-2">{order.event?.title || "Event"}</h3>
            <p className="text-white/90">
              {order.event?.startDateTime
                ? new Date(order.event.startDateTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : "Date TBD"}
            </p>
          </div>

          {/* Order Status */}
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order Status:</span>
              {getStatusBadge(order.orderStatus)}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Amount:</span>
              <span className="text-xl font-bold text-primary">{formatVND(order.amountOfMoney)}</span>
            </div>
          </Card>

          {/* Payment QR Code - Show only if AWAITING_PAYMENT */}
          {order.orderStatus === 'AWAITING_PAYMENT' && order.qrCodeUrl && (
            <Card className="p-6 bg-yellow-500/5 border-yellow-500/20">
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-yellow-600" />
                <h4 className="font-bold text-lg">Payment Required</h4>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg mb-4">
                  <img
                    src={order.qrCodeUrl}
                    alt="Payment QR Code"
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Scan this QR code with your banking app to complete payment
                </p>
                {order.paymentMethod && (
                  <p className="text-sm text-center font-medium">
                    Payment Method: {order.paymentMethod.name}
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Close
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => onConfirmPayment(order.orderId)}
                >
                  I've Paid
                </Button>
              </div>
            </Card>
          )}

          {/* Tickets - Show only if PAID */}
          {(order.orderStatus === 'PAID' || order.orderStatus === 'COMPLETED') && (
            <div>
              <h4 className="font-bold text-lg mb-4">Your Tickets</h4>
              <div className="space-y-3">
                {order.tickets.map((ticket) => (
                  <Card key={ticket.ticketId} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold">Ticket #{ticket.ticketId}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.ticketCategory?.name || "General Admission"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Price: {formatVND(ticket.ticketCategory?.price || 0)}
                        </p>
                      </div>
                      <div className="text-center">
                        {ticket.qrCodeUrl ? (
                          <div className="bg-white p-2 rounded border">
                            <img
                              src={ticket.qrCodeUrl}
                              alt={`Ticket ${ticket.ticketId} QR Code`}
                              className="w-32 h-32 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="bg-white p-2 rounded border">
                            <QrCode className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {ticket.usedFlag ? "Used" : "Valid"}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-4 mt-4 bg-blue-500/5 border-blue-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">Important</p>
                    <p className="text-sm text-muted-foreground">
                      Show your ticket QR codes at the event entrance for check-in.
                      Screenshots or printed copies are acceptable.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Order Details */}
          <Card className="p-4">
            <h4 className="font-bold mb-3">Order Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-medium">#{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of Tickets:</span>
                <span className="font-medium">{order.tickets.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{order.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{order.userEmail}</span>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MyTickets;
