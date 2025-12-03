import { Event } from "@/data/mockEvents";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, TrendingUp, Users, BarChart3, Edit, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface EventManagementCardProps {
  event: Event;
  salesData?: {
    ticketsSold: number;
    totalRevenue: number;
    capacity: number;
  };
}

const EventManagementCard = ({ event, salesData }: EventManagementCardProps) => {
  const status = new Date(event.date) > new Date() ? 'upcoming' : 'completed';
  
  return (
    <div className="glass glass-border rounded-xl overflow-hidden hover:shadow-lg hover:shadow-primary/30 hover:border-primary hover:ring-2 hover:ring-primary/50 transition-all">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="md:w-48 h-48 md:h-auto">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold mb-1">{event.title}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  {event.location}
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === 'upcoming' 
                ? 'bg-primary/20 text-primary' 
                : 'bg-muted/50 text-muted-foreground'
            }`}>
              {status === 'upcoming' ? 'Published' : 'Completed'}
            </span>
          </div>

          {/* Stats */}
          {salesData && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="glass-border rounded-lg p-3">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Tickets Sold</span>
                </div>
                <p className="text-lg font-bold">
                  {salesData.ticketsSold.toLocaleString()}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{salesData.capacity.toLocaleString()}
                  </span>
                </p>
              </div>

              <div className="glass-border rounded-lg p-3">
                <div className="flex items-center gap-2 text-cta mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Revenue</span>
                </div>
                <p className="text-lg font-bold text-cta">
                  ${salesData.totalRevenue.toLocaleString()}
                </p>
              </div>

              <div className="glass-border rounded-lg p-3">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Capacity</span>
                </div>
                <p className="text-lg font-bold">
                  {Math.round((salesData.ticketsSold / salesData.capacity) * 100)}%
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="default" asChild className="hover:ring-2 hover:ring-primary/50 transition-all">
              <Link to={`/organize/event/${event.id}/sales`} className="gap-2">
                <BarChart3 className="w-4 h-4" />
                View Sales
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="hover:ring-2 hover:ring-primary/50 transition-all">
              <Link to={`/organize/event/${event.id}/edit`} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Event
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="hover:ring-2 hover:ring-primary/50 transition-all">
              <Link to={`/organize/event/${event.id}/checkin`} className="gap-2">
                <UserCheck className="w-4 h-4" />
                Check-in
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagementCard;
