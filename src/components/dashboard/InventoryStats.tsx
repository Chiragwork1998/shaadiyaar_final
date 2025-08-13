import React from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, TrendingUp, ShoppingCart } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/helpers';

interface InventoryStatsProps {
  totalItems: number;
  lowStockAlert: number;
  totalValue: number;
  reorderValue: number;
}

const InventoryStats: React.FC<InventoryStatsProps> = ({
  totalItems,
  lowStockAlert,
  totalValue,
  reorderValue
}) => {
  const StatCard: React.FC<{
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle: string;
    valueColor?: string;
    delay?: number;
  }> = ({ icon: Icon, title, value, subtitle, valueColor = 'text-foreground', delay = 0 }) => {
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
        <h3 className={`text-lg md:text-2xl font-semibold mt-2 md:mt-4 ${valueColor}`}>{value}</h3>
        <p className="text-muted-foreground text-xs md:text-sm mt-1">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-6">
      <StatCard
        icon={Package}
        title="Total Items"
        value={totalItems}
        subtitle="Inventory items"
        valueColor="text-foreground"
        delay={0}
      />
      <StatCard
        icon={AlertTriangle}
        title="Low Stock Alert"
        value={lowStockAlert}
        subtitle="Items need reorder"
        valueColor="text-red-600"
        delay={0.1}
      />
      <StatCard
        icon={TrendingUp}
        title="Total Value"
        value={formatIndianCurrency(totalValue)}
        subtitle="Current stock value"
        valueColor="text-green-600"
        delay={0.2}
      />
      <StatCard
        icon={ShoppingCart}
        title="Reorder Value"
        value={formatIndianCurrency(reorderValue)}
        subtitle="For low stock items"
        valueColor="text-orange-600"
        delay={0.3}
      />
    </div>
  );
};

export default InventoryStats; 