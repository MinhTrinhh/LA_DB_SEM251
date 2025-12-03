import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Users, Ticket, TrendingUp, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { OrganizerPanel } from '@/components/OrganizerPanel';
import { Button } from '@/components/ui/button';
import { mockEvents } from '@/data/mockEvents';

export default function SummaryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const event = mockEvents.find(e => e.id === id);

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

  const totalTickets = event.ticketCategories?.reduce((sum, cat) => sum + cat.total, 0) || 0;
  const soldTickets = event.ticketCategories?.reduce((sum, cat) => sum + (cat.total - cat.available), 0) || 0;
  const revenue = event.ticketCategories?.reduce((sum, cat) => sum + (cat.total - cat.available) * cat.price, 0) || 0;

  const stats = [
    { label: 'Total Revenue', value: `$${revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400' },
    { label: 'Tickets Sold', value: soldTickets.toString(), icon: Ticket, color: 'text-primary' },
    { label: 'Total Attendees', value: soldTickets.toString(), icon: Users, color: 'text-blue-400' },
    { label: 'Growth Rate', value: '+23%', icon: TrendingUp, color: 'text-pink-400' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <OrganizerPanel />

        <div className="flex-1 py-8 px-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/organize')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold mb-2">Event Summary</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass glass-border rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-accent rounded-lg">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="glass glass-border rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Event Information</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Event Date</div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{event.date}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Venue</div>
                  <div>{event.venue}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Location</div>
                  <div>{event.location}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                    Published
                  </span>
                </div>
              </div>
            </div>

            <div className="glass glass-border rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Ticket Sales</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Sales Progress</span>
                    <span className="text-sm">{soldTickets} / {totalTickets}</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 h-3 rounded-full"
                      style={{ width: `${(soldTickets / totalTickets) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-3">By Category</div>
                  {event.ticketCategories?.map((category) => {
                    const sold = category.total - category.available;
                    return (
                      <div key={category.name} className="flex justify-between items-center mb-2">
                        <span className="text-sm">{category.name}</span>
                        <span className="text-sm text-muted-foreground">{sold} / {category.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass glass-border rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
