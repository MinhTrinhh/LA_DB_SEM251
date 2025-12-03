import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon: Icon, iconColor, trend }: StatsCardProps) => {
  return (
    <div className="glass glass-border rounded-xl p-6 hover:scale-105 transition-transform">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${iconColor} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <h3 className="text-muted-foreground text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default StatsCard;
