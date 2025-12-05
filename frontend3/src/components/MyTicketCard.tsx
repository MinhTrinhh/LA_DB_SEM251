import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Eye } from "lucide-react";
import { Ticket } from "@/data/mockEvents";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import QRCode from "qrcode";

interface MyTicketCardProps {
  ticket: Ticket;
  isPast?: boolean;
}

const MyTicketCard = ({ ticket, isPast = false }: MyTicketCardProps) => {
  const [showTicket, setShowTicket] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (showTicket && ticket.qrCode) {
      QRCode.toDataURL(ticket.qrCode, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).then(setQrCodeUrl);
    }
  }, [showTicket, ticket.qrCode]);

  const getStatusBadge = () => {
    if (ticket.status === 'valid') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
          Valid
        </span>
      );
    } else if (ticket.status === 'used') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground">
          Used
        </span>
      );
    } else if (ticket.status === 'cancelled') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-500">
          Cancelled
        </span>
      );
    }
  };

  return (
    <>
      <div className="glass glass-border rounded-xl overflow-hidden hover:border-primary hover:ring-2 hover:ring-primary/50 transition-all">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3">{ticket.eventTitle}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{ticket.eventDate} • {ticket.eventTime}</span>
                </div>
                <div>
                  <span>Ticket Category: </span>
                  <span className="text-foreground font-semibold">{ticket.category}</span>
                </div>
                <div>
                  <span>Quantity: </span>
                  <span className="text-foreground font-semibold">{ticket.quantity}</span>
                </div>
                <div>
                  <span>Total: </span>
                  <span className="text-primary font-semibold">
                    {ticket.totalPrice === 0 ? 'Free' : `${ticket.totalPrice.toLocaleString('vi-VN')} ₫`}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="cta"
              size="sm"
              className="gap-2"
              onClick={() => setShowTicket(true)}
            >
              <Eye className="w-4 h-4" />
              View Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={showTicket} onOpenChange={setShowTicket}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Your Ticket</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Event Header */}
            <div className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 p-6 rounded-lg -mx-6 -mt-2">
              <h3 className="text-2xl font-bold text-white mb-2">{ticket.eventTitle}</h3>
              <div className="flex flex-wrap gap-3 text-sm text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{ticket.eventDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{ticket.eventTime}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side - Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm text-muted-foreground mb-1 uppercase tracking-wide">Ticket ID</h4>
                  <p className="font-mono font-bold">{ticket.id}</p>
                </div>

                <div>
                  <h4 className="text-sm text-muted-foreground mb-1 uppercase tracking-wide">Venue</h4>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <p className="font-medium">{ticket.venue}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Ticket Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-semibold">{ticket.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-semibold">{ticket.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-primary">
                        {ticket.totalPrice === 0 ? 'Free' : `${ticket.totalPrice.toLocaleString('vi-VN')} ₫`}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm text-muted-foreground mb-1 uppercase tracking-wide">Purchase Date</h4>
                  <p className="font-medium">{new Date(ticket.purchaseDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</p>
                </div>

                <div>
                  <h4 className="text-sm text-muted-foreground mb-1 uppercase tracking-wide">Status</h4>
                  <div className="inline-block">{getStatusBadge()}</div>
                </div>
              </div>

              {/* Right Side - QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-6 rounded-xl shadow-lg mb-3">
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

            {/* Important Notice */}
            {ticket.status === 'valid' && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-yellow-600 dark:text-yellow-400">Important:</strong> Please arrive at least 30 minutes before the event. Screenshots or printed copies of the QR code are acceptable.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyTicketCard;
