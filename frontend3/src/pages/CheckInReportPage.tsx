import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { OrganizerPanel } from '@/components/OrganizerPanel';
import { Button } from '@/components/ui/button';
import { mockEvents } from '@/data/mockEvents';

export default function CheckInReportPage() {
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

  // Mock check-in stats
  const totalTickets = event.ticketCategories?.reduce((sum, cat) => sum + cat.total, 0) || 0;
  const soldTickets = event.ticketCategories?.reduce((sum, cat) => sum + (cat.total - cat.available), 0) || 0;
  const checkedInCount = Math.floor(soldTickets * 0.65); // Mock 65% check-in rate
  const pendingCount = soldTickets - checkedInCount;

  const stats = [
    { label: 'Total Sold', value: soldTickets.toString(), icon: Users, color: 'text-blue-400' },
    { label: 'Checked In', value: checkedInCount.toString(), icon: CheckCircle, color: 'text-green-400' },
    { label: 'Pending', value: pendingCount.toString(), icon: Clock, color: 'text-yellow-400' },
    { label: 'Check-in Rate', value: `${Math.round((checkedInCount / soldTickets) * 100)}%`, icon: TrendingUp, color: 'text-primary' },
  ];

  // Mock recent check-ins
  const recentCheckIns = [
    { name: 'John Smith', ticket: 'VIP', time: '2 mins ago', session: 'Session 1' },
    { name: 'Sarah Johnson', ticket: 'General Admission', time: '5 mins ago', session: 'Session 1' },
    { name: 'Mike Davis', ticket: 'VIP', time: '8 mins ago', session: 'Session 1' },
    { name: 'Emily Brown', ticket: 'General Admission', time: '12 mins ago', session: 'Session 1' },
    { name: 'David Wilson', ticket: 'VIP', time: '15 mins ago', session: 'Session 1' },
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
            <h1 className="text-4xl font-bold mb-2">Check-in Report</h1>
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
                  <div className={`p-3 bg-accent rounded-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Check-ins */}
          <div className="glass glass-border rounded-xl">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold">Recent Check-ins</h2>
            </div>
            <div className="divide-y divide-border">
              {recentCheckIns.map((checkIn, index) => (
                <div key={index} className="p-6 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{checkIn.name}</div>
                        <div className="text-sm text-muted-foreground">{checkIn.ticket} • {checkIn.session}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{checkIn.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
