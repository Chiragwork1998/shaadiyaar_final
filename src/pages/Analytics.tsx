import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  MapPin,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  LineChart,
  Plus,
  Filter,
  BarChart3,
  Target
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchLeads } from '../lib/supabase';
import { Lead } from '../types';
import { formatCurrency, formatIndianCurrency } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { parseISO, format, eachMonthOfInterval, startOfYear, endOfYear, isSameMonth } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  
  useEffect(() => {
    loadLeads();
  }, []);
  
  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await fetchLeads();
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalLeads = leads.length;
  const totalRevenue = leads.reduce((sum, lead) => sum + (lead.numeric_budget || 0), 0);
  const averageBudget = totalLeads > 0 ? totalRevenue / totalLeads : 0;
  const conversionRate = totalLeads > 0 
    ? (leads.filter(l => l.status === 'booked').length / totalLeads) * 100 
    : 0;

  // Location distribution
  const locationData = leads.reduce((acc, lead) => {
    acc[lead.location] = (acc[lead.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLocations = Object.entries(locationData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Venue type distribution
  const venueData = leads.reduce((acc, lead) => {
    acc[lead.type_of_venue] = (acc[lead.type_of_venue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topVenues = Object.entries(venueData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Lead type distribution
  const leadTypeData = leads.reduce((acc, lead) => {
    acc[lead.lead_type] = (acc[lead.lead_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Yearly leads chart data
  const months = eachMonthOfInterval({
    start: startOfYear(new Date()),
    end: endOfYear(new Date())
  });

  const monthlyLeadCounts = months.map(month => {
    return leads.filter(lead => {
      const createDate = parseISO(lead.lead_create_date);
      return isSameMonth(createDate, month);
    }).length;
  });

  const chartData = {
    labels: months.map(month => format(month, 'MMM')),
    datasets: [
      {
        label: 'New Leads',
        data: monthlyLeadCounts,
        fill: true,
        backgroundColor: 'rgba(70, 130, 180, 0.1)',
        borderColor: 'rgb(70, 130, 180)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(70, 130, 180)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: 'hsl(var(--foreground))',
        bodyColor: 'hsl(var(--foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (context: any) => `${context[0].label} 2025`,
          label: (context: any) => `${context.raw} new leads`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          color: 'hsl(var(--muted-foreground))'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'hsl(var(--border))'
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          color: 'hsl(var(--muted-foreground))',
          callback: (tickValue: string | number) => Math.round(Number(tickValue))
        }
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, bgColor, iconColor }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1 truncate">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1 flex-shrink-0" /> : <ArrowDownRight className="w-4 h-4 mr-1 flex-shrink-0" />}
              <span className="truncate">{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 ${bgColor} rounded-xl flex-shrink-0 ml-4`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-serif font-semibold text-foreground">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Comprehensive insights into your wedding leads performance</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="w-5 h-5 mr-2" /> Filter
            </Button>
            <Button variant="outline">
              <BarChart3 className="w-5 h-5 mr-2" /> Export
            </Button>
            <Button variant="primary">
              <Target className="w-5 h-5 mr-2" /> Goals
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Leads"
            value={totalLeads}
            icon={Users}
            trend="up"
            trendValue="+12%"
            bgColor="bg-primary"
            iconColor="text-primary-foreground"
          />
          <StatCard
            title="Total Revenue"
            value={formatIndianCurrency(totalRevenue)}
            icon={DollarSign}
            trend="up"
            trendValue="+8%"
            bgColor="bg-theme-green"
            iconColor="text-primary-foreground"
          />
          <StatCard
            title="Conversion Rate"
            value={`${conversionRate.toFixed(1)}%`}
            icon={TrendingUp}
            trend="down"
            trendValue="-3%"
            bgColor="bg-yellow-500"
            iconColor="text-white"
          />
          <StatCard
            title="Average Budget"
            value={formatIndianCurrency(averageBudget)}
            icon={Calendar}
            trend="up"
            trendValue="+15%"
            bgColor="bg-blue-500"
            iconColor="text-white"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Yearly Leads Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                    <LineChart className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Lead Generation Trends</h2>
                    <p className="text-sm text-muted-foreground">Monthly lead acquisition patterns</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={timeframe === 'week' ? 'primary' : 'outline'}
                    onClick={() => setTimeframe('week')}
                    size="sm"
                  >
                    Week
                  </Button>
                  <Button
                    variant={timeframe === 'month' ? 'primary' : 'outline'}
                    onClick={() => setTimeframe('month')}
                    size="sm"
                  >
                    Month
                  </Button>
                  <Button
                    variant={timeframe === 'year' ? 'primary' : 'outline'}
                    onClick={() => setTimeframe('year')}
                    size="sm"
                  >
                    Year
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-[280px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </motion.div>

          {/* Lead Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-theme-green rounded-xl flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Lead Types</h2>
                  <p className="text-sm text-muted-foreground">Distribution by category</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(leadTypeData).map(([type, count], index) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{type}</span>
                      <span className="font-semibold text-foreground">
                        {((count / totalLeads) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / totalLeads) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full rounded-full ${
                          type === 'Hot Lead' 
                            ? 'bg-primary' 
                            : type === 'Warm Lead'
                            ? 'bg-yellow-500'
                            : 'bg-theme-green'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Location Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Top Locations</h2>
                  <p className="text-sm text-muted-foreground">Most popular cities</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topLocations.map(([location, count], index) => (
                  <div key={location} className="flex items-center">
                    <div className="w-20 text-sm text-foreground font-medium truncate">{location}</div>
                    <div className="flex-1 ml-4">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / totalLeads) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-sm font-semibold text-foreground min-w-[2rem] text-right">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Venue Type Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl border border-border shadow-lg lg:col-span-2 overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Popular Venues</h2>
                  <p className="text-sm text-muted-foreground">Most requested venue types</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {topVenues.map(([venue, count], index) => (
                  <div key={venue} className="flex items-center">
                    <div className="w-24 text-sm text-foreground font-medium truncate">{venue}</div>
                    <div className="flex-1 ml-4">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / totalLeads) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-theme-green rounded-full"
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-sm font-semibold text-foreground min-w-[2rem] text-right">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;