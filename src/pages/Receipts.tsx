import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Receipt, 
  Eye, 
  Download,
  Upload,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import ReceiptStats from '../components/dashboard/ReceiptStats';
import ReceiptTable from '../components/dashboard/ReceiptTable';

// Mock data for receipts
const mockReceipts = [
  {
    id: 'RCP001',
    vendor: 'Fresh Vegetables Co.',
    date: '2024-07-02',
    amount: 12500,
    status: 'verified',
    uploadedBy: 'Employee 004',
    description: 'Fresh vegetables for wedding event',
    items: [
      { name: 'Tomatoes', quantity: '25 kg', price: 2000 },
      { name: 'Onions', quantity: '30 kg', price: 1500 },
      { name: 'Potatoes', quantity: '40 kg', price: 3000 },
      { name: 'Carrots', quantity: '20 kg', price: 2000 },
      { name: 'Cabbage', quantity: '15 kg', price: 1500 },
      { name: 'Cucumber', quantity: '10 kg', price: 1000 },
      { name: 'Bell Peppers', quantity: '8 kg', price: 1500 }
    ]
  },
  {
    id: 'RCP002',
    vendor: 'Premium Meats Ltd.',
    date: '2024-07-01',
    amount: 8500,
    status: 'pending',
    uploadedBy: 'Employee 002',
    description: 'Meat supplies for catering',
    items: [
      { name: 'Chicken', quantity: '20 kg', price: 4000 },
      { name: 'Mutton', quantity: '15 kg', price: 3000 },
      { name: 'Fish', quantity: '10 kg', price: 1500 }
    ]
  },
  {
    id: 'RCP003',
    vendor: 'Dairy Farm Ltd.',
    date: '2024-06-30',
    amount: 3200,
    status: 'verified',
    uploadedBy: 'Employee 001',
    description: 'Dairy products for events',
    items: [
      { name: 'Milk', quantity: '50 liters', price: 2000 },
      { name: 'Butter', quantity: '5 kg', price: 800 },
      { name: 'Cheese', quantity: '4 kg', price: 400 }
    ]
  }
];

const Receipts = () => {
  const [receipts, setReceipts] = useState(mockReceipts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showReceiptDetails, setShowReceiptDetails] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const totalReceipts = receipts.length;
    const pendingVerification = receipts.filter(receipt => receipt.status === 'pending').length;
    const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
    const thisMonthAmount = receipts
      .filter(receipt => {
        const receiptDate = new Date(receipt.date);
        const now = new Date();
        return receiptDate.getMonth() === now.getMonth() && receiptDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, receipt) => sum + receipt.amount, 0);

    return {
      totalReceipts,
      pendingVerification,
      totalAmount,
      thisMonthAmount
    };
  }, [receipts]);

  // Filter receipts based on search and status
  const filteredReceipts = useMemo(() => {
    let result = [...receipts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(receipt =>
        receipt.id.toLowerCase().includes(query) ||
        receipt.vendor.toLowerCase().includes(query) ||
        receipt.uploadedBy.toLowerCase().includes(query) ||
        receipt.description.toLowerCase().includes(query)
      );
    }

    if (selectedStatus !== 'all') {
      result = result.filter(receipt => receipt.status === selectedStatus);
    }

    return result;
  }, [receipts, searchQuery, selectedStatus]);

  const handleViewReceipt = (receipt: any) => {
    setSelectedReceipt(receipt);
    setShowReceiptDetails(true);
  };

  const handleDownloadReceipt = (receipt: any) => {
    // Mock download functionality
    console.log('Downloading receipt:', receipt.id);
    // In a real app, this would trigger a file download
  };

  const handleAddReceipt = () => {
    // Mock add receipt functionality
    console.log('Adding new receipt');
    // In a real app, this would open an upload form
  };

  const handleVerifyReceipt = (receiptId: string) => {
    setReceipts(prev => 
      prev.map(receipt => 
        receipt.id === receiptId 
          ? { ...receipt, status: 'verified' }
          : receipt
      )
    );
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
              <h1 className="text-base md:text-lg lg:text-2xl font-semibold text-foreground">
                Inventory Receipts
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Upload and manage purchase receipts
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleAddReceipt}
                className="bg-primary text-primary-foreground hover:bg-accent-vibrant-purple-darker shadow-lg shadow-primary/20 h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Add Receipt
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
          <ReceiptStats {...stats} />
        </motion.div>

        {/* Receipts Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReceiptTable
            receipts={filteredReceipts}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onViewReceipt={handleViewReceipt}
            onDownloadReceipt={handleDownloadReceipt}
            onVerifyReceipt={handleVerifyReceipt}
          />
        </motion.div>
      </div>

              {/* Receipt Details Dialog */}
        {selectedReceipt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base md:text-lg font-semibold">Receipt Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReceiptDetails(false)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="text-xs md:text-sm font-medium text-muted-foreground">Receipt ID</label>
                      <p className="text-xs md:text-sm font-medium">{selectedReceipt.id}</p>
                    </div>
                    <div>
                      <label className="text-xs md:text-sm font-medium text-muted-foreground">Vendor</label>
                      <p className="text-xs md:text-sm font-medium">{selectedReceipt.vendor}</p>
                    </div>
                    <div>
                      <label className="text-xs md:text-sm font-medium text-muted-foreground">Date</label>
                      <p className="text-xs md:text-sm font-medium">{selectedReceipt.date}</p>
                    </div>
                    <div>
                      <label className="text-xs md:text-sm font-medium text-muted-foreground">Amount</label>
                      <p className="text-xs md:text-sm font-medium">₹{selectedReceipt.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-xs md:text-sm font-medium text-muted-foreground">Status</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedReceipt.status === 'verified' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedReceipt.status}
                      </span>
                    </div>
                    <div>
                      <label className="text-xs md:text-sm font-medium text-muted-foreground">Uploaded By</label>
                      <p className="text-xs md:text-sm font-medium">{selectedReceipt.uploadedBy}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-xs md:text-sm">{selectedReceipt.description}</p>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Items</label>
                    <div className="mt-2 space-y-2">
                      {selectedReceipt.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <div>
                            <p className="text-xs md:text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.quantity}</p>
                          </div>
                          <p className="text-xs md:text-sm font-medium">₹{item.price.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Receipts; 