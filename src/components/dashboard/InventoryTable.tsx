import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

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

interface InventoryTableProps {
  items: InventoryItem[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  onUpdateStock: (itemId: number, newStock: number) => void;
  onDeleteItem: (itemId: number) => void;
  onAddItem: (item: any) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onUpdateStock,
  onDeleteItem,
  onAddItem
}) => {
  const [showUpdateStock, setShowUpdateStock] = useState<InventoryItem | null>(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<InventoryItem | null>(null);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400';
      case 'low':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400';
      case 'good':
        return 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400';
      default:
        return 'bg-accent text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <TrendingDown className="w-4 h-4" />;
      case 'good':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const handleUpdateStock = () => {
    if (showUpdateStock && newStockValue) {
      onUpdateStock(showUpdateStock.id, parseInt(newStockValue));
      setShowUpdateStock(null);
      setNewStockValue('');
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      onDeleteItem(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Inventory Items</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                All items in stock with current levels
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs md:text-sm text-muted-foreground">
                {items.length} items
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-full sm:w-[140px] text-xs md:text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Add Item Button */}
              <Button
                onClick={() => setShowAddItem(true)}
                className="bg-primary text-primary-foreground hover:bg-accent-vibrant-purple-darker shadow-lg shadow-primary/20 h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium">Item Name</th>
              <th className="text-left py-3 px-4 font-medium">Category</th>
              <th className="text-left py-3 px-4 font-medium">Current Stock</th>
              <th className="text-left py-3 px-4 font-medium">Reorder Level</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-3 px-4">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.supplier}</div>
                </td>
                <td className="py-3 px-4 text-sm">{item.category}</td>
                <td className="py-3 px-4">
                  <div className="font-medium text-sm">
                    {item.currentStock} {item.unit}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">
                  {item.reorderLevel} {item.unit}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowUpdateStock(item);
                        setNewStockValue(item.currentStock.toString());
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(item)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Update Stock Dialog */}
      <Dialog open={!!showUpdateStock} onOpenChange={() => setShowUpdateStock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Update the current stock level for {showUpdateStock?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Stock Level</label>
              <input
                type="number"
                value={newStockValue}
                onChange={(e) => setNewStockValue(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder={`Enter stock in ${showUpdateStock?.unit}`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateStock(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteConfirm?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryTable; 