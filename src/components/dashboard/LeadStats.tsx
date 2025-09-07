import React from 'react';
import { motion } from 'framer-motion';
import { Users, Phone, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsProps {
  totalLeads: number;
  hotLeads: number;
  upcomingWeddings: number;
  conversionRate: number;
  // Assuming you might have trend data for each stat in the future
  // For now, I'll keep the static +12%, +8% etc. as placeholders for styling
}

const StatCard: React.FC<{
  icon: React.ElementType;
  title: string;
  value: string | number;
  trend?: string; // e.g., "+12%" or "-3%"
  trendDirection?: 'up' | 'down' | 'neutral';
  delay?: number;
}> = ({ icon: Icon, title, value, trend, trendDirection = 'neutral', delay = 0 }) => {
  let trendColor = 'text-muted-foreground';
  let trendBgColor = 'bg-muted';
  let TrendIcon = null;

  if (trendDirection === 'up') {
    trendColor = 'text-theme-green'; 
    trendBgColor = 'bg-theme-green-bg';
    TrendIcon = ArrowUpRight;
  } else if (trendDirection === 'down') {
    trendColor = 'text-destructive'; 
    trendBgColor = 'bg-destructive/10'; // Use destructive from theme
    TrendIcon = ArrowDownRight;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-card border border-border rounded-lg p-3 md:p-4 shadow-sm w-full"
    >
      <div className="flex items-center justify-between">
        <div className="p-2 bg-primary rounded-lg shadow-md">
          <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendColor} ${trendBgColor} px-2 py-1 rounded-full border border-transparent`}>
            {TrendIcon && <TrendIcon className="inline h-3 w-3 mr-1" />} 
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-foreground mt-2">{value}</h3>
      <p className="text-muted-foreground text-xs md:text-sm mt-1">{title}</p>
    </motion.div>
  );
};

const LeadStats: React.FC<StatsProps> = ({ totalLeads, hotLeads, upcomingWeddings, conversionRate }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full">
      <StatCard 
        icon={Users} 
        title="Total Leads" 
        value={totalLeads} 
        trend="+12%" 
        trendDirection="up"
        delay={0}
      />
      <StatCard 
        icon={Phone} 
        title="Hot Leads" 
        value={hotLeads} 
        trend="+8%" 
        trendDirection="up"
        delay={0.1}
      />
      <StatCard 
        icon={Calendar} 
        title="Upcoming Weddings" 
        value={upcomingWeddings} 
        trend="+15%" 
        trendDirection="up"
        delay={0.2}
      />
      <StatCard 
        icon={TrendingUp} 
        title="Conversion Rate" 
        value={`${conversionRate}%`} 
        trend="-3%" 
        trendDirection="down"
        delay={0.3}
      />
    </div>
  );
};

export default LeadStats;