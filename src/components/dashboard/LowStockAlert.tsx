import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Package } from 'lucide-react';
import { Button } from '../ui/Button';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  status: 'critical' | 'low' | 'good';
  price: number;
  supplier: string;
}

interface LowStockAlertProps {
  items: InventoryItem[];
  onUpdateStock: (itemId: number, newStock: number) => void;
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ items, onUpdateStock }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'low':
        return <TrendingDown className="w-4 h-4 text-yellow-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm"
    >
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Low Stock Alert</h3>
          <p className="text-xs text-muted-foreground">Items requiring immediate attention</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-4">
            <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No low stock items</p>
          </div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border ${getStatusColor(item.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs">
                        Current: {item.currentStock} {item.unit}
                      </span>
                      <span className="text-xs">
                        Required: {item.reorderLevel} {item.unit}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newStock = prompt(`Enter new stock level for ${item.name} (in ${item.unit}):`, item.currentStock.toString());
                    if (newStock && !isNaN(parseInt(newStock))) {
                      onUpdateStock(item.id, parseInt(newStock));
                    }
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Update
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} need{items.length !== 1 ? '' : 's'} immediate reordering. 
            Update stock levels or place orders with suppliers.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default LowStockAlert; 