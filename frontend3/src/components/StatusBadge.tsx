import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: 'AUTHENTICATED' | 'PENDING' | 'SUSPENDED' | 'VERIFIED';
  label?: string;
}

const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'AUTHENTICATED':
      case 'VERIFIED':
        return {
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600 text-white',
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
          text: label || (status === 'VERIFIED' ? 'Verified' : 'Authenticated')
        };
      case 'PENDING':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          icon: <Clock className="w-3 h-3 mr-1" />,
          text: label || 'Pending'
        };
      case 'SUSPENDED':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-500 hover:bg-red-600 text-white',
          icon: <XCircle className="w-3 h-3 mr-1" />,
          text: label || 'Suspended'
        };
      default:
        return {
          variant: 'secondary' as const,
          className: '',
          icon: null,
          text: status
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={`flex items-center w-fit ${config.className}`}>
      {config.icon}
      {config.text}
    </Badge>
  );
};

export default StatusBadge;

