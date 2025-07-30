import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  Calendar, 
  Users, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  IndianRupee,
  Award,
  Target,
  Heart,
  Camera,
  MessageSquare,
  Eye,
  Filter,
  BarChart3,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Zap,
  Shield,
  MoreHorizontal,
  Edit
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase, fetchLeads } from '../lib/supabase';
import { Lead } from '../types';
import { formatCurrency, formatDate, getLeadTypeStyle, formatIndianCurrency } from '../utils/helpers';
import { toast } from 'react-hot-toast';

interface VendorData {
  id: string;
  name: string;
  businessType: string;
  subscriptionPlan: 'Basic' | 'Premium' | 'Enterprise';
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  leadsAssigned: number;
  leadsConverted: number;
  totalRevenue: number;
  monthlyRevenue: number;
  rating: number;
  location: string;
  lastActive: string;
  planExpiry: string;
}

interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  totalLeadsAssigned: number;
  totalVendorRevenue: number;
  averageConversionRate: number;
  newVendorsThisMonth: number;
}

const Vendors = () => {
  const [vendorStats, setVendorStats] = useState<VendorStats>({
    totalVendors: 0,
    activeVendors: 0,
    totalLeadsAssigned: 0,
    totalVendorRevenue: 0,
    averageConversionRate: 0,
    newVendorsThisMonth: 0
  });
  
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<VendorData[]>([]);
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = async () => {
    try {
      // Mock vendor data (in real app, this would come from vendors table)
      const mockVendors: VendorData[] = [
        {
          id: '1',
          name: 'Royal Caterers',
          businessType: 'Catering',
          subscriptionPlan: 'Premium',
          status: 'active',
          joinDate: '2024-01-15',
          leadsAssigned: 24,
          leadsConverted: 18,
          totalRevenue: 4500000,
          monthlyRevenue: 750000,
          rating: 4.8,
          location: 'Mumbai',
          lastActive: '2 hours ago',
          planExpiry: '2024-12-15'
        },
        {
          id: '2',
          name: 'Dream Venues',
          businessType: 'Venue',
          subscriptionPlan: 'Enterprise',
          status: 'active',
          joinDate: '2023-11-20',
          leadsAssigned: 32,
          leadsConverted: 28,
          totalRevenue: 8900000,
          monthlyRevenue: 1200000,
          rating: 4.9,
          location: 'Delhi',
          lastActive: '1 hour ago',
          planExpiry: '2024-11-20'
        },
        {
          id: '3',
          name: 'Perfect Planners',
          businessType: 'Wedding Planning',
          subscriptionPlan: 'Basic',
          status: 'active',
          joinDate: '2024-02-10',
          leadsAssigned: 12,
          leadsConverted: 8,
          totalRevenue: 1600000,
          monthlyRevenue: 320000,
          rating: 4.6,
          location: 'Bangalore',
          lastActive: '3 hours ago',
          planExpiry: '2024-08-10'
        },
        {
          id: '4',
          name: 'Elegant Photography',
          businessType: 'Photography',
          subscriptionPlan: 'Premium',
          status: 'active',
          joinDate: '2024-03-05',
          leadsAssigned: 18,
          leadsConverted: 15,
          totalRevenue: 2250000,
          monthlyRevenue: 450000,
          rating: 4.7,
          location: 'Pune',
          lastActive: '5 hours ago',
          planExpiry: '2024-12-05'
        },
        {
          id: '5',
          name: 'Melody Music',
          businessType: 'Entertainment',
          subscriptionPlan: 'Basic',
          status: 'inactive',
          joinDate: '2023-12-01',
          leadsAssigned: 8,
          leadsConverted: 3,
          totalRevenue: 450000,
          monthlyRevenue: 0,
          rating: 4.2,
          location: 'Chennai',
          lastActive: '2 weeks ago',
          planExpiry: '2024-06-01'
        },
        {
          id: '6',
          name: 'Floral Paradise',
          businessType: 'Decoration',
          subscriptionPlan: 'Premium',
          status: 'pending',
          joinDate: '2024-06-20',
          leadsAssigned: 0,
          leadsConverted: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          rating: 0,
          location: 'Hyderabad',
          lastActive: 'Never',
          planExpiry: '2024-12-20'
        }
      ];

      setVendors(mockVendors);
      setFilteredVendors(mockVendors);

      // Calculate vendor stats
      const activeVendors = mockVendors.filter(v => v.status === 'active');
      const totalLeadsAssigned = mockVendors.reduce((sum, v) => sum + v.leadsAssigned, 0);
      const totalVendorRevenue = mockVendors.reduce((sum, v) => sum + v.totalRevenue, 0);
      const totalLeadsConverted = mockVendors.reduce((sum, v) => sum + v.leadsConverted, 0);
      const avgConversionRate = totalLeadsAssigned > 0 ? Math.round((totalLeadsConverted / totalLeadsAssigned) * 100) : 0;
      const newVendorsThisMonth = mockVendors.filter(v => {
        const joinDate = new Date(v.joinDate);
        const thisMonth = new Date();
        return joinDate.getMonth() === thisMonth.getMonth() && joinDate.getFullYear() === thisMonth.getFullYear();
      }).length;

      setVendorStats({
        totalVendors: mockVendors.length,
        activeVendors: activeVendors.length,
        totalLeadsAssigned,
        totalVendorRevenue,
        averageConversionRate: avgConversionRate,
        newVendorsThisMonth
      });

    } catch (error) {
      console.error('Error loading vendor data:', error);
      toast.error('Failed to load vendor data');
    }
  };

  useEffect(() => {
    let filtered = vendors;
    
    if (filterPlan !== 'all') {
      filtered = filtered.filter(v => v.subscriptionPlan === filterPlan);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(v => v.status === filterStatus);
    }
    
    setFilteredVendors(filtered);
  }, [filterPlan, filterStatus, vendors]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4" />;
      case 'inactive': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'Basic': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'Premium': return <Star className="w-4 h-4 text-purple-600" />;
      case 'Enterprise': return <Crown className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, bgColor, iconColor }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border border-border p-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-xs font-medium">{title}</p>
          <p className="text-lg font-bold text-foreground mt-1 truncate">{value}</p>
          {trend && (
            <div className={`flex items-center mt-1 text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1 flex-shrink-0" /> : <ArrowDownRight className="w-3 h-3 mr-1 flex-shrink-0" />}
              <span className="truncate">{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-2 ${bgColor} rounded-lg flex-shrink-0 ml-3`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto space-y-4 p-3 md:p-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        >
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-foreground">
              Vendor Management
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Monitor vendor performance, subscriptions, and revenue</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto text-xs md:text-sm h-8 md:h-10">
              <Target className="w-4 h-4 mr-1" /> Analytics
            </Button>
            <Button variant="primary" className="w-full sm:w-auto text-xs md:text-sm h-8 md:h-10">
              <Plus className="w-4 h-4 mr-1" /> Add Vendor
          </Button>
          </div>
        </motion.div>

        {/* Key Metrics - Compact Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Vendors"
            value={vendorStats.totalVendors}
            icon={Users}
            trend="up"
            trendValue={`+${vendorStats.newVendorsThisMonth} this month`}
            bgColor="bg-primary"
            iconColor="text-primary-foreground"
          />
          <StatCard
            title="Active Vendors"
            value={vendorStats.activeVendors}
            icon={CheckCircle2}
            trend="up"
            trendValue="+8% this month"
            bgColor="bg-theme-green"
            iconColor="text-primary-foreground"
          />
          <StatCard
            title="Total Revenue"
            value={formatIndianCurrency(vendorStats.totalVendorRevenue)}
            icon={IndianRupee}
            trend="up"
            trendValue="+22% this month"
            bgColor="bg-yellow-500"
            iconColor="text-white"
          />
          <StatCard
            title="Avg Conversion"
            value={`${vendorStats.averageConversionRate}%`}
            icon={TrendingUp}
            trend="up"
            trendValue="+3% this month"
            bgColor="bg-blue-500"
            iconColor="text-white"
          />
        </div>

        {/* Vendor Table */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border shadow-sm"
        >
          <div className="p-4 md:p-6 border-b border-border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h3 className="text-base font-semibold text-foreground">Vendor Performance</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <select 
                  value={filterPlan} 
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="px-3 py-2 bg-background border border-input rounded-lg text-xs md:text-sm w-full sm:w-auto"
                >
                  <option value="all">All Plans</option>
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-background border border-input rounded-lg text-xs md:text-sm w-full sm:w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Vendor Cards */}
          <div className="block lg:hidden">
            <div className="p-4 space-y-3">
              {filteredVendors.map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-background border border-border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center font-medium text-primary-foreground text-sm">
                        {vendor.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-sm">{vendor.name}</div>
                        <div className="text-xs text-muted-foreground">{vendor.businessType} • {vendor.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" title="View Details" className="h-6 w-6">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit Vendor" className="h-6 w-6">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Plan:</span>
                      <div className="flex items-center space-x-1 mt-1">
                        {getPlanIcon(vendor.subscriptionPlan)}
                        <span className="font-medium text-foreground">{vendor.subscriptionPlan}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(vendor.status)}`}>
                          {getStatusIcon(vendor.status)}
                          <span className="ml-1 capitalize">{vendor.status}</span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Leads:</span>
                      <div className="text-foreground font-medium mt-1">{vendor.leadsAssigned} assigned</div>
                      <div className="text-xs text-muted-foreground">{vendor.leadsConverted} converted</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Revenue:</span>
                      <div className="text-foreground font-medium mt-1">{formatIndianCurrency(vendor.totalRevenue)}</div>
                      <div className="text-xs text-muted-foreground">Monthly: {formatIndianCurrency(vendor.monthlyRevenue)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="font-medium text-foreground">{vendor.rating || 'N/A'}</span>
                    </div>
                    <div className="text-muted-foreground">Last active: {vendor.lastActive}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leads</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rating</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredVendors.map((vendor, index) => (
                  <motion.tr 
                    key={vendor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-accent transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-medium text-primary-foreground">
                          {vendor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">{vendor.businessType} • {vendor.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getPlanIcon(vendor.subscriptionPlan)}
                        <span className="font-medium text-foreground">{vendor.subscriptionPlan}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Expires: {formatDate(vendor.planExpiry)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(vendor.status)}`}>
                        {getStatusIcon(vendor.status)}
                        <span className="ml-1 capitalize">{vendor.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-foreground font-medium">{vendor.leadsAssigned} assigned</div>
                      <div className="text-sm text-muted-foreground">{vendor.leadsConverted} converted</div>
                      <div className="text-xs text-green-600">
                        {vendor.leadsAssigned > 0 ? Math.round((vendor.leadsConverted / vendor.leadsAssigned) * 100) : 0}% rate
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-foreground font-medium">{formatIndianCurrency(vendor.totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">Monthly: {formatIndianCurrency(vendor.monthlyRevenue)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium text-foreground">{vendor.rating || 'N/A'}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Last active: {vendor.lastActive}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" title="View Details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit Vendor">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="More Options">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Vendors;