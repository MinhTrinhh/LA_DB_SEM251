import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, Share2, Calendar as CalendarIcon, Mail, MapPin, Clock } from "lucide-react";
import { Event, Session, SelectedTickets } from "@/data/mockEvents";
import QRCode from "qrcode";

interface ConfirmationState {
  orderId: string;
  event: Event;
  session: Session;
  selectedTickets: SelectedTickets;
  totalAmount: number;
  totalTickets: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

const Confirmation = () => {
  const location = useLocation();
  const state = location.state as ConfirmationState;
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (state?.orderId) {
      QRCode.toDataURL(`EVENT-EASE-${state.orderId}`, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).then(setQrCodeUrl);
    }
  }, [state?.orderId]);

  if (!state || !state.orderId || !state.event) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">No Order Found</h1>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const { orderId, event, session, selectedTickets, totalAmount, customerInfo } = state;

  const handleDownloadTicket = () => {
    // In production, this would generate a PDF
    alert("PDF download would happen here in production");
  };

  const handleAddToCalendar = () => {
    // In production, this would create an .ics file
    alert("Calendar event would be created here in production");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `I'm attending ${event.title}!`,
        url: window.location.href,
      });
    } else {
      alert("Share functionality would work here in production");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-muted-foreground">
            Your tickets have been sent to {customerInfo.email}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Ticket Card */}
          <Card className="overflow-hidden mb-8">
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-3">{event.title}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-white/90">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{session.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side - Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Order ID</h3>
                    <p className="text-xl font-mono font-bold">{orderId}</p>
                  </div>

                  <div>
                    <h3 className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Venue</h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                      <div>
                        <p className="font-medium">{event.venue}</p>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Customer</h3>
                    <p className="font-medium">{customerInfo.name}</p>
                    <p className="text-sm text-muted-foreground">{customerInfo.email}</p>
                    <p className="text-sm text-muted-foreground">{customerInfo.phone}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">Tickets</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedTickets).map(([category, quantity]) => {
                        if (quantity === 0) return null;
                        const ticketCategory = session.ticketCategories?.find(tc => tc.name === category);
                        const price = ticketCategory?.price || 0;
                        return (
                          <div key={category} className="flex justify-between items-center">
                            <span className="text-muted-foreground">{category} × {quantity}</span>
                            <span className="font-semibold">
                              {price === 0 ? 'Free' : `$${(price * quantity).toFixed(2)}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold">Total</span>
                    <span className="text-3xl font-bold text-primary">
                      {totalAmount === 0 ? 'Free' : `$${totalAmount.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Right Side - QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-white p-6 rounded-xl mb-4 shadow-lg">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Ticket QR Code" className="w-64 h-64" />
                    ) : (
                      <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
                        <span className="text-gray-500">Loading QR Code...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Show this QR code at the entrance for check-in
                  </p>
                </div>
              </div>
            </div>

            {/* Perforated Line Effect */}
            <Separator className="border-dashed" />

            <div className="p-6 bg-card">
              <div className="flex flex-wrap gap-4 justify-between items-center text-sm text-muted-foreground">
                <div>Order #{orderId}</div>
                <div>
                  Purchase Date: {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div>Status: <span className="text-green-500 font-semibold">Confirmed</span></div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button
              onClick={handleDownloadTicket}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </Button>

            <Button
              onClick={handleAddToCalendar}
              variant="outline"
              className="gap-2"
            >
              <CalendarIcon className="w-5 h-5" />
              Add to Calendar
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              className="gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </Button>
          </div>

          {/* Email Notification */}
          <Card className="p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg shrink-0">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">Email Confirmation Sent</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  A confirmation email with your tickets and QR code has been sent to <strong>{customerInfo.email}</strong>.
                  Please check your inbox and spam folder.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="default">
                    <Link to="/my-tickets">View My Tickets</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/">Browse More Events</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Important Information */}
          <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
            <h3 className="text-lg font-bold mb-3 text-yellow-600 dark:text-yellow-400">
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Please arrive at least 30 minutes before the event start time</li>
              <li>• Have your QR code ready for faster check-in (digital or printed)</li>
              <li>• Each ticket allows entry for one person</li>
              <li>• Screenshots or printed copies of the QR code are acceptable</li>
              <li>• Contact the organizer if you need to transfer or cancel your ticket</li>
            </ul>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Confirmation;
