import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingCart,
  Calculator,
  Calendar,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import InventoryStats from '../components/dashboard/InventoryStats';
import InventoryTable from '../components/dashboard/InventoryTable';
import GuestCalculator from '../components/dashboard/GuestCalculator';
import LowStockAlert from '../components/dashboard/LowStockAlert';

// Mock data for inventory items
const mockInventoryItems = [
  {
    id: 1,
    name: 'Basmati Rice',
    category: 'Grains',
    currentStock: 50,
    unit: 'kg',
    reorderLevel: 100,
    status: 'critical',
    price: 120,
    supplier: 'Rice Suppliers Ltd'
  },
  {
    id: 2,
    name: 'Tomatoes',
    category: 'Vegetables',
    currentStock: 25,
    unit: 'kg',
    reorderLevel: 50,
    status: 'critical',
    price: 80,
    supplier: 'Fresh Veggies Co'
  },
  {
    id: 3,
    name: 'Chicken',
    category: 'Meat',
    currentStock: 30,
    unit: 'kg',
    reorderLevel: 40,
    status: 'low',
    price: 350,
    supplier: 'Premium Meats'
  },
  {
    id: 4,
    name: 'Milk',
    category: 'Dairy',
    currentStock: 15,
    unit: 'liters',
    reorderLevel: 30,
    status: 'critical',
    price: 60,
    supplier: 'Dairy Farm Ltd'
  },
  {
    id: 5,
    name: 'Onions',
    category: 'Vegetables',
    currentStock: 40,
    unit: 'kg',
    reorderLevel: 30,
    status: 'good',
    price: 40,
    supplier: 'Fresh Veggies Co'
  },
  {
    id: 6,
    name: 'Cooking Oil',
    category: 'Oils',
    currentStock: 20,
    unit: 'liters',
    reorderLevel: 25,
    status: 'low',
    price: 150,
    supplier: 'Oil Distributors'
  }
];

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState(mockInventoryItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [guestCount, setGuestCount] = useState(250);
  const [eventDate, setEventDate] = useState('');

  // Calculate stats
  const stats = useMemo(() => {
    const totalItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter(item => 
      item.status === 'critical' || item.status === 'low'
    ).length;
    const totalValue = inventoryItems.reduce((sum, item) => 
      sum + (item.currentStock * item.price), 0
    );
    const reorderValue = inventoryItems
      .filter(item => item.status === 'critical' || item.status === 'low')
      .reduce((sum, item) => sum + (item.reorderLevel * item.price), 0);

    return {
      totalItems,
      lowStockAlert: lowStockItems,
      totalValue,
      reorderValue
    };
  }, [inventoryItems]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    let result = [...inventoryItems];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.supplier.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    return result;
  }, [inventoryItems, searchQuery, selectedCategory]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(inventoryItems.map(item => item.category))];
    return ['all', ...uniqueCategories];
  }, [inventoryItems]);

  const handleUpdateStock = (itemId: number, newStock: number) => {
    setInventoryItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, currentStock: newStock }
          : item
      )
    );
  };

  const handleAddItem = (newItem: any) => {
    const item = {
      id: Math.max(...inventoryItems.map(item => item.id)) + 1,
      ...newItem
    };
    setInventoryItems(prev => [...prev, item]);
  };

  const handleDeleteItem = (itemId: number) => {
    setInventoryItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleCalculateRequirements = () => {
    // Mock calculation based on guest count
    const requirements = inventoryItems.map(item => ({
      ...item,
      requiredAmount: Math.ceil((guestCount / 100) * item.reorderLevel),
      estimatedCost: Math.ceil((guestCount / 100) * item.reorderLevel) * item.price
    }));
    
    console.log('Requirements calculated:', requirements);
    // You could show this in a modal or update the UI
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="w-full space-y-4 p-3 md:p-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg md:text-2xl font-semibold text-foreground">
                Inventory Management
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Track and manage food & beverage inventory
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => {/* TODO: Add item form */}}
                className="bg-primary text-primary-foreground hover:bg-accent-vibrant-purple-darker shadow-lg shadow-primary/20 h-8 md:h-9 text-xs md:text-sm"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Add Item
              </Button>
              <Button
                variant="outline"
                onClick={handleCalculateRequirements}
                className="h-8 md:h-9 text-xs md:text-sm"
              >
                <Calculator className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Generate Order List
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <InventoryStats {...stats} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Table - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <InventoryTable
                items={filteredItems}
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={categories}
                onUpdateStock={handleUpdateStock}
                onDeleteItem={handleDeleteItem}
                onAddItem={handleAddItem}
              />
            </motion.div>
          </div>

          {/* Sidebar - Takes 1/3 of the space */}
          <div className="space-y-6">
            {/* Guest Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GuestCalculator
                guestCount={guestCount}
                onGuestCountChange={setGuestCount}
                eventDate={eventDate}
                onEventDateChange={setEventDate}
                onCalculate={handleCalculateRequirements}
              />
            </motion.div>

            {/* Low Stock Alert */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <LowStockAlert
                items={inventoryItems.filter(item => 
                  item.status === 'critical' || item.status === 'low'
                )}
                onUpdateStock={handleUpdateStock}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory; 