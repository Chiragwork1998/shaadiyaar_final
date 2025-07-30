import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  Calendar,
  DollarSign,
  Package,
  Receipt,
  Bot,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ArrowRight,
  Building,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Plus,
  Target,
  TrendingUp,
  Star,
  MapPin,
  Phone,
  Mail,
  Shield,
  Crown,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Permission {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  enabled: boolean;
}

interface QuickAction {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  path: string;
  color: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const permissions: Permission[] = [
    {
      id: '1',
      name: 'Lead Management',
      icon: Users,
      description: 'View and manage all leads',
      enabled: true
    },
    {
      id: '2',
      name: 'Booking Management',
      icon: Calendar,
      description: 'Manage wedding bookings and schedules',
      enabled: true
    },
    {
      id: '3',
      name: 'Payment Tracking',
      icon: DollarSign,
      description: 'Track payments and financial data',
      enabled: true
    },
    {
      id: '4',
      name: 'Inventory Management',
      icon: Package,
      description: 'Manage vendor inventory and supplies',
      enabled: true
    },
    {
      id: '5',
      name: 'Receipt Management',
      icon: Receipt,
      description: 'Generate and manage receipts',
      enabled: true
    },
    {
      id: '6',
      name: 'Calendar View (Limited)',
      icon: Calendar,
      description: 'View calendar with limited editing',
      enabled: true
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      name: 'View Leads',
      icon: Users,
      description: 'Browse and manage leads',
      path: '/leads',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'Manage Bookings',
      icon: Calendar,
      description: 'Handle wedding bookings',
      path: '/calendar',
      color: 'bg-green-500'
    },
    {
      id: '3',
      name: 'Update Inventory',
      icon: Package,
      description: 'Manage vendor inventory',
      path: '/vendors',
      color: 'bg-purple-500'
    },
    {
      id: '4',
      name: 'View Calendar',
      icon: Calendar,
      description: 'Check calendar events',
      path: '/calendar',
      color: 'bg-orange-500'
    }
  ];

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4 p-3 md:p-6">
        {/* Header Section - Compact for Mobile */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border shadow-sm p-4 md:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg md:text-2xl font-semibold text-foreground">
                Welcome, Employee 000
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Role: Administrator | Access Level: 000
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                <Settings className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center space-x-1 text-xs md:text-sm h-8 md:h-10"
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats - Compact Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <div className="bg-card rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Leads</p>
                <p className="text-lg font-bold text-foreground">156</p>
                <p className="text-xs text-green-600">+12%</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Bookings</p>
                <p className="text-lg font-bold text-foreground">23</p>
                <p className="text-xs text-green-600">+8%</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-lg font-bold text-foreground">₹2.4M</p>
                <p className="text-xs text-green-600">+15%</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vendors</p>
                <p className="text-lg font-bold text-foreground">45</p>
                <p className="text-xs text-green-600">+5%</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content - Single Column on Mobile */}
        <div className="space-y-4">
          {/* Quick Actions Section - Compact Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border shadow-sm p-4"
          >
            <h2 className="text-base font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  onClick={() => handleQuickAction(action.path)}
                  className="group relative p-3 rounded-lg border border-border bg-background hover:bg-accent transition-all duration-200"
                >
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                        {action.name}
                      </h3>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Permissions Section - Compact List */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm p-4"
          >
            <h2 className="text-base font-semibold text-foreground mb-4">Your Permissions</h2>
            <div className="space-y-2">
              {permissions.map((permission, index) => (
                <motion.div
                  key={permission.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    permission.enabled 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    permission.enabled ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <permission.icon className={`h-4 w-4 ${
                      permission.enabled ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate ${
                      permission.enabled ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {permission.name}
                    </h3>
                    <p className={`text-xs truncate ${
                      permission.enabled ? 'text-muted-foreground' : 'text-muted-foreground/60'
                    }`}>
                      {permission.description}
                    </p>
                  </div>
                  <div className={`flex-shrink-0 ${
                    permission.enabled ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {permission.enabled ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;