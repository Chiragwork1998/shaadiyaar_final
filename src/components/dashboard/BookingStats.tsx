import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, CreditCard, TrendingUp } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';

interface BookingStatsProps {
  totalBookings: number;
  totalRevenue: number;
  pendingBalance: number;
  conversionRate: number;
}

const BookingStats: React.FC<BookingStatsProps> = ({
  totalBookings,
  totalRevenue,
  pendingBalance,
  conversionRate
}) => {
  const { checkPermission } = useAuth();
  const canViewFinancialData = checkPermission('canViewFinancialData');

  const StatCard: React.FC<{
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle: string;
    delay?: number;
  }> = ({ icon: Icon, title, value, subtitle, delay = 0 }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        className="bg-card border border-border rounded-lg p-3 md:p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="p-2 md:p-3 bg-primary rounded-lg shadow-md">
            <Icon className="h-4 w-4 md:h-6 md:w-6 text-primary-foreground" />
          </div>
        </div>
        <h3 className="text-lg md:text-2xl font-semibold text-foreground mt-2 md:mt-4">{value}</h3>
        <p className="text-muted-foreground text-xs md:text-sm mt-1">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-6">
      <StatCard
        icon={Calendar}
        title="Total Bookings"
        value={totalBookings}
        subtitle="Active bookings"
        delay={0}
      />
      <StatCard
        icon={DollarSign}
        title="Total Revenue"
        value={canViewFinancialData ? formatIndianCurrency(totalRevenue) : '***'}
        subtitle="Total booking value"
        delay={0.1}
      />
      <StatCard
        icon={CreditCard}
        title="Pending Balance"
        value={canViewFinancialData ? formatIndianCurrency(pendingBalance) : '***'}
        subtitle="Outstanding payments"
        delay={0.2}
      />
      <StatCard
        icon={TrendingUp}
        title="Conversion Rate"
        value={`${conversionRate}%`}
        subtitle="Lead to booking"
        delay={0.3}
      />
    </div>
  );
};

export default BookingStats; 