import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  Users,
  Calendar,
  BarChart2,
  Store,
  Heart,
  ShieldCheck,
  DollarSign,
  Package,
  FileText,
  Bot,
  MessageSquare,
  Brain,
  CheckCircle,
  Settings,
  X,
  Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionMatrix } from '../../types';
import { fetchPendingApprovals } from '../../lib/supabase';

interface SidebarProps {
  onClose?: () => void;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  requiresPermission?: keyof PermissionMatrix;
  notificationCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkPermission } = useAuth();
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  // Fetch pending approvals count
  useEffect(() => {
    const loadPendingApprovalsCount = async () => {
      try {
        const approvals = await fetchPendingApprovals();
        const pendingCount = approvals.filter((approval: any) => approval.status === 'pending').length;
        setPendingApprovalsCount(pendingCount);
      } catch (error) {
        console.error('Error loading pending approvals count:', error);
      }
    };

    loadPendingApprovalsCount();

    // Set up real-time subscription for pending approvals
    const channel = supabase
      .channel('sidebar-pending-approvals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_approvals' }, () => {
        loadPendingApprovalsCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const menuItems: MenuItem[] = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
    { icon: DollarSign, label: 'Payments', path: '/payments', requiresPermission: 'canViewPayments' },
    { icon: MessageSquare, label: 'WhatsApp', path: '/whatsapp' },
    { icon: Brain, label: 'Intelligence', path: '/intelligence' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    { icon: ShieldCheck, label: 'Admins', path: '/admins' },
    { 
      icon: CheckCircle, 
      label: 'Approvals', 
      path: '/approvals', 
      requiresPermission: 'canApproveActions',
      notificationCount: pendingApprovalsCount
    },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { 
      icon: Download, 
      label: 'Export Data', 
      path: '/export-data', 
      requiresPermission: 'canExportData'
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleMenuItemClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-64 bg-background border-r border-border h-screen flex flex-col md:relative md:flex-shrink-0">
      {/* Mobile Close Button */}
      <div className="md:hidden flex justify-end p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6 border-b border-border">
        <div className="flex items-center">
          <img src="/shaadiyaar_logo.png" alt="Shaadiyaar Logo" className="h-10 w-auto" />
          <div className="ml-3">
            <h1 className="text-xl font-serif font-semibold text-foreground">Shaadiyaar</h1>
            <p className="text-sm text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 px-3 flex-1">
        {menuItems.map((item) => {
          // Check if item requires permission and user doesn't have it
          if (item.requiresPermission && !checkPermission(item.requiresPermission)) {
            return null;
          }
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleMenuItemClick}
              className={`flex items-center justify-between px-3 py-2 my-1 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'text-primary bg-accent'
                  : 'text-foreground hover:text-primary hover:bg-accent'
              }`}
            >
              <div className="flex items-center">
              <item.icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-primary' : 'text-foreground'}`} />
              {item.label}
              </div>
              {item.notificationCount && item.notificationCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                  {item.notificationCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;