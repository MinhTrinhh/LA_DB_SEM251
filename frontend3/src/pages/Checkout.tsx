import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PaymentQRModal from "@/components/PaymentQRModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, MapPin, Clock, ArrowLeft, CreditCard, Wallet } from "lucide-react";
import { BackendEvent, BackendSession } from "@/types/api.types";
import { useToast } from "@/hooks/use-toast";
import { ordersApi, OrderDTO } from "@/api/orders.api";
import { formatVND } from "@/utils/currency";

interface SelectedTickets {
  [ticketCategoryId: number]: number;
}

interface CheckoutState {
  selectedTickets: SelectedTickets;
  totalAmount: number;
  totalTickets: number;
  sessionId: number;
  session: BackendSession;
  event: BackendEvent;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = location.state as CheckoutState;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    paymentMethod: "credit-card"
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderDTO | null>(null);

  useEffect(() => {
    if (!state || !state.selectedTickets || !state.event) {
      toast({
        title: "Session expired",
        description: "Please select tickets again.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [state, navigate, toast]);

  if (!state || !state.selectedTickets || !state.event || !state.session) {
    return null;
  }

  const { selectedTickets, totalAmount, totalTickets, session, event } = state;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order via API
      const orderData = await ordersApi.createOrder({
        eventId: event.eventId,
        sessionId: state.sessionId,
        ticketQuantities: selectedTickets,
        currency: "VND",
        paymentMethodId: 6 // MB Bank - default payment method
      });

      toast({
        title: "Order created successfully!",
        description: `Order ID: ${orderData.orderId}`,
      });

      // Store order data and show QR modal if payment is required
      setCurrentOrder(orderData);

      if (orderData.amountOfMoney > 0 && orderData.qrCodeUrl) {
        // Show QR code modal for payment
        setShowQRModal(true);
      } else {
        // Free ticket, navigate directly to confirmation
        navigate("/confirmation", {
          state: {
            order: orderData,
            event,
            session,
            customerInfo: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone
            }
          }
        });
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Order failed",
        description: error.response?.data?.message || "Failed to create order. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Back Button */}
      <div className="glass-dark border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link
            to={`/events/${event.eventId}/tickets/0`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Ticket Selection</span>
          </Link>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Ticket confirmation will be sent to this email
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-foreground/5 cursor-pointer">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label htmlFor="credit-card" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Credit / Debit Card</p>
                      <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-foreground/5 cursor-pointer">
                  <RadioGroupItem value="digital-wallet" id="digital-wallet" />
                  <Label htmlFor="digital-wallet" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Wallet className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Digital Wallet</p>
                      <p className="text-sm text-muted-foreground">Apple Pay, Google Pay, PayPal</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 This is a demo checkout. No actual payment will be processed.
                </p>
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              {/* Event Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">{event.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(session.startDateTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{new Date(session.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{session.venueName || event.location || 'Online Event'}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Ticket Breakdown */}
              <div className="space-y-2 mb-4">
                {Object.entries(selectedTickets).map(([categoryIdStr, quantity]) => {
                  if (quantity === 0) return null;
                  const categoryId = Number(categoryIdStr);
                  const ticketCategory = session.ticketCategories?.find(tc => tc.ticketCategoryId === categoryId);
                  const price = ticketCategory?.price || 0;
                  return (
                    <div key={categoryId} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {ticketCategory?.categoryName} × {quantity}
                      </span>
                      <span className="font-semibold">
                        {price === 0 ? 'Free' : formatVND(price * quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-4" />

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {totalAmount === 0 ? 'Free' : formatVND(totalAmount)}
                </span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base"
                variant="cta"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Complete Order"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By completing this purchase, you agree to our terms and conditions
              </p>
            </Card>
          </div>
        </form>
      </main>

      {/* Payment QR Code Modal */}
      {currentOrder && (
        <PaymentQRModal
          open={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            // Navigate to confirmation page after closing modal
            navigate("/confirmation", {
              state: {
                order: currentOrder,
                event,
                session,
                customerInfo: {
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone
                }
              }
            });
          }}
          order={currentOrder}
        />
      )}

      <Footer />
    </div>
  );
};

export default Checkout;
