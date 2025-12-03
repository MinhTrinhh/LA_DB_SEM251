import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StatsCard from "@/components/StatsCard";
import EventManagementCard from "@/components/EventManagementCard";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, TrendingUp, Plus, Settings } from "lucide-react";
import { mockEvents } from "@/data/mockEvents";
import { mockOrganizerStats, mockSalesData } from "@/data/mockOrganizer";
import { Link } from "react-router-dom";

const OrganizerDashboard = () => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // Filter events based on current user (in real app, would filter by organizerId)
  const myEvents = mockEvents.filter(event => ['1', '2', '3'].includes(event.id));
  
  const filteredEvents = myEvents.filter(event => {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (filter === 'upcoming') return eventDate > now;
    if (filter === 'past') return eventDate <= now;
    return true;
  });

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Organizer Dashboard</h1>
            <p className="text-muted-foreground">Manage your events and track performance</p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link to="/organizer/profile">
                <Settings className="w-5 h-5" />
                Profile Settings
              </Link>
            </Button>
            <Button size="lg" variant="cta" className="gap-2" asChild>
              <Link to="/organize/create">
                <Plus className="w-5 h-5" />
                Create New Event
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard
            title="Total Events"
            value={mockOrganizerStats.totalEvents}
            icon={Calendar}
            iconColor="bg-primary/20 text-primary"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${mockOrganizerStats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            iconColor="bg-cta/20 text-cta"
            trend={{ value: mockOrganizerStats.growthPercentage, isPositive: true }}
          />
          <StatsCard
            title="Total Attendees"
            value={mockOrganizerStats.totalAttendees.toLocaleString()}
            icon={Users}
            iconColor="bg-blue-500/20 text-blue-400"
          />
          <StatsCard
            title="Growth Rate"
            value={`${mockOrganizerStats.growthPercentage}%`}
            icon={TrendingUp}
            iconColor="bg-green-500/20 text-green-400"
            trend={{ value: mockOrganizerStats.growthPercentage, isPositive: true }}
          />
        </div>

        {/* My Events Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Events</h2>
            
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={filter === 'past' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('past')}
              >
                Past
              </Button>
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-6">
            {filteredEvents.length === 0 ? (
              <div className="glass glass-border rounded-xl p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">No events found</h3>
                <p className="text-muted-foreground mb-6">
                  {filter === 'all' 
                    ? "You haven't created any events yet" 
                    : `You don't have any ${filter} events`}
                </p>
                <Button variant="cta" asChild>
                  <Link to="/organize/create">Create Your First Event</Link>
                </Button>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <EventManagementCard
                  key={event.id}
                  event={event}
                  salesData={mockSalesData[event.id] ? {
                    ticketsSold: mockSalesData[event.id].ticketsSold,
                    totalRevenue: mockSalesData[event.id].totalRevenue,
                    capacity: mockSalesData[event.id].totalCapacity
                  } : undefined}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrganizerDashboard;
