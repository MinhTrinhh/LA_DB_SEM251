import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Scan, Keyboard, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { mockEvents } from "@/data/mockEvents";
import { mockCheckInRecords } from "@/data/mockOrganizer";

type CheckInStatus = 'idle' | 'valid' | 'invalid' | 'used';

const CheckIn = () => {
  const { id } = useParams();
  const event = mockEvents.find(e => e.id === id);
  const [mode, setMode] = useState<'scanner' | 'manual'>('scanner');
  const [ticketId, setTicketId] = useState('');
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>('idle');
  const [recentCheckIns, setRecentCheckIns] = useState(mockCheckInRecords);

  if (!event) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
          <Button asChild>
            <Link to="/organize">Back to Dashboard</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleCheckIn = () => {
    if (!ticketId.trim()) return;

    // Simulate ticket validation
    const random = Math.random();
    if (random > 0.7) {
      setCheckInStatus('invalid');
    } else if (random > 0.4) {
      setCheckInStatus('used');
    } else {
      setCheckInStatus('valid');
      // Add to recent check-ins
      setRecentCheckIns([
        {
          ticketId: ticketId,
          customerName: "New Check-in",
          ticketCategory: "General Admission",
          quantity: 1,
          checkInTime: new Date().toISOString(),
          status: 'valid'
        },
        ...recentCheckIns.slice(0, 9)
      ]);
    }

    // Reset after 3 seconds
    setTimeout(() => {
      setCheckInStatus('idle');
      setTicketId('');
    }, 3000);
  };

  const totalCheckedIn = recentCheckIns.reduce((sum, record) => sum + record.quantity, 0);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 gap-2" asChild>
          <Link to="/organize">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Event Info */}
        <div className="glass glass-border rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-muted-foreground mb-4">
            {new Date(event.date).toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })} • {event.venue}
          </p>
          <div className="flex gap-4">
            <div className="glass-border rounded-lg px-4 py-2">
              <p className="text-sm text-muted-foreground">Checked In</p>
              <p className="text-2xl font-bold text-primary">{totalCheckedIn}</p>
            </div>
            <div className="glass-border rounded-lg px-4 py-2">
              <p className="text-sm text-muted-foreground">Total Capacity</p>
              <p className="text-2xl font-bold">{event.ticketCategories.reduce((sum, cat) => sum + cat.total, 0)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Check-in Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={mode === 'scanner' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setMode('scanner')}
              >
                <Scan className="w-4 h-4" />
                QR Scanner
              </Button>
              <Button
                variant={mode === 'manual' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setMode('manual')}
              >
                <Keyboard className="w-4 h-4" />
                Manual Entry
              </Button>
            </div>

            {/* Check-in Area */}
            {checkInStatus === 'idle' ? (
              <div className="glass glass-border rounded-xl p-12">
                {mode === 'scanner' ? (
                  <div className="text-center space-y-4">
                    <div className="w-64 h-64 mx-auto bg-foreground/5 rounded-xl flex items-center justify-center">
                      <Scan className="w-24 h-24 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold">Scan QR Code</h2>
                    <p className="text-muted-foreground">
                      Position the QR code within the frame to check in
                    </p>
                    <Button variant="outline" onClick={() => setMode('manual')}>
                      Switch to Manual Entry
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <h2 className="text-2xl font-bold">Enter Ticket ID</h2>
                    <div className="max-w-md mx-auto space-y-4">
                      <Input
                        placeholder="TKT-XXX-XXXX"
                        value={ticketId}
                        onChange={(e) => setTicketId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
                        className="text-center text-lg h-14"
                      />
                      <Button 
                        size="lg" 
                        variant="cta" 
                        className="w-full"
                        onClick={handleCheckIn}
                        disabled={!ticketId.trim()}
                      >
                        Check In
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`glass glass-border rounded-xl p-12 text-center space-y-6 ${
                checkInStatus === 'valid' 
                  ? 'bg-green-500/10 border-green-500/30'
                  : checkInStatus === 'used'
                  ? 'bg-cta/10 border-cta/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                {checkInStatus === 'valid' && (
                  <>
                    <CheckCircle className="w-24 h-24 mx-auto text-green-400" />
                    <h2 className="text-3xl font-bold text-green-400">Valid Ticket!</h2>
                    <p className="text-lg">Welcome to {event.title}</p>
                  </>
                )}
                {checkInStatus === 'used' && (
                  <>
                    <AlertTriangle className="w-24 h-24 mx-auto text-cta" />
                    <h2 className="text-3xl font-bold text-cta">Already Checked In</h2>
                    <p className="text-lg">This ticket has already been used</p>
                  </>
                )}
                {checkInStatus === 'invalid' && (
                  <>
                    <XCircle className="w-24 h-24 mx-auto text-red-400" />
                    <h2 className="text-3xl font-bold text-red-400">Invalid Ticket</h2>
                    <p className="text-lg">This ticket is not valid for this event</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Recent Check-ins */}
          <div className="glass glass-border rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Recent Check-ins</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {recentCheckIns.map((record, index) => (
                <div key={index} className="glass-border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm">{record.customerName}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.checkInTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{record.ticketCategory}</p>
                  <p className="text-xs text-muted-foreground">Qty: {record.quantity}</p>
                  <p className="text-xs text-primary mt-1">{record.ticketId}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckIn;
