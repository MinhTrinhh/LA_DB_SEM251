import { Calendar, MapPin } from "lucide-react";
import { Event } from "@/data/mockEvents";
import { Link } from "react-router-dom";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Link 
      to={`/event/${event.id}`}
      className="group block glass glass-border rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:border-primary hover:ring-2 hover:ring-primary/50"
    >
      {/* Image */}
      <div className="aspect-video overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>
              {new Date(event.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })} • {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
        </div>

        {/* Price */}
        <div className="pt-2">
          <span className="text-lg font-bold">
            {event.isFree ? 'Free' : `From $${event.price}`}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
