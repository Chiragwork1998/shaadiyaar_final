import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface QuickStatsProps {
  totalEvents: number;
  bookings: number;
  tastings: number;
  confirmed: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({
  totalEvents,
  bookings,
  tastings,
  confirmed
}) => {
  const StatItem: React.FC<{
    icon: React.ElementType;
    label: string;
    value: number;
    color: string;
    delay?: number;
  }> = ({ icon: Icon, label, value, color, delay = 0 }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg"
      >
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-lg font-semibold text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Quick Stats</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Calendar overview
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-6">
        <div className="space-y-3">
          <StatItem
            icon={CalendarIcon}
            label="Total Events"
            value={totalEvents}
            color="bg-blue-500"
            delay={0}
          />
          <StatItem
            icon={Clock}
            label="Bookings"
            value={bookings}
            color="bg-green-500"
            delay={0.1}
          />
          <StatItem
            icon={CalendarIcon}
            label="Tastings"
            value={tastings}
            color="bg-purple-500"
            delay={0.2}
          />
          <StatItem
            icon={CheckCircle}
            label="Confirmed"
            value={confirmed}
            color="bg-green-600"
            delay={0.3}
          />
        </div>
      </div>
    </div>
  );
};

export default QuickStats; 