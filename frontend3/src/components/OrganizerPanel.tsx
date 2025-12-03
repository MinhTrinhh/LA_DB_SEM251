import { Link, useParams, useLocation } from 'react-router-dom';
import { 
  FileText, 
  UserCheck, 
  Edit, 
  Map, 
  Users, 
  Ticket 
} from 'lucide-react';

interface PanelSection {
  title: string;
  items: {
    label: string;
    path: string;
    icon: React.ElementType;
  }[];
}

export function OrganizerPanel() {
  const { id } = useParams();
  const location = useLocation();

  const sections: PanelSection[] = [
    {
      title: 'Report',
      items: [
        { label: 'Check-in', path: `/organize/event/${id}/checkin-report`, icon: UserCheck },
        { label: 'Summary', path: `/organize/event/${id}/summary`, icon: FileText },
      ],
    },
    {
      title: 'Event Setup',
      items: [
        { label: 'Edit Event', path: `/organize/event/${id}/edit`, icon: Edit },
        { label: 'Seat Map', path: `/organize/event/${id}/seat-map`, icon: Map },
        { label: 'Member', path: `/organize/event/${id}/member`, icon: Users },
      ],
    },
    {
      title: 'Marketing',
      items: [
        { label: 'Voucher', path: `/organize/event/${id}/voucher`, icon: Ticket },
      ],
    },
  ];

  return (
    <div className="w-64 glass glass-border min-h-screen p-6">
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
