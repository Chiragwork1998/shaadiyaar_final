import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Eye, 
  Download,
  CheckCircle,
  Clock,
  Receipt
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { formatIndianCurrency } from '../../utils/helpers';

interface Receipt {
  id: string;
  vendor: string;
  date: string;
  amount: number;
  status: 'verified' | 'pending';
  uploadedBy: string;
  description: string;
  items: Array<{
    name: string;
    quantity: string;
    price: number;
  }>;
}

interface ReceiptTableProps {
  receipts: Receipt[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onViewReceipt: (receipt: Receipt) => void;
  onDownloadReceipt: (receipt: Receipt) => void;
  onVerifyReceipt: (receiptId: string) => void;
}

const ReceiptTable: React.FC<ReceiptTableProps> = ({
  receipts,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onViewReceipt,
  onDownloadReceipt,
  onVerifyReceipt
}) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400';
      default:
        return 'bg-accent text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">All Receipts</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                View and manage inventory purchase receipts
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs md:text-sm text-muted-foreground">
                {receipts.length} receipts
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search receipts..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full sm:w-[140px] text-xs md:text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium">Receipt ID</th>
              <th className="text-left py-3 px-4 font-medium">Vendor</th>
              <th className="text-left py-3 px-4 font-medium">Date</th>
              <th className="text-left py-3 px-4 font-medium">Amount</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Uploaded By</th>
              <th className="text-left py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Receipt className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No receipts found</p>
                  </div>
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <tr key={receipt.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">{receipt.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">{receipt.vendor}</div>
                    <div className="text-xs text-muted-foreground">{receipt.description}</div>
                  </td>
                  <td className="py-3 px-4 text-sm">{formatDate(receipt.date)}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">{formatIndianCurrency(receipt.amount)}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(receipt.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(receipt.status)}`}>
                        {receipt.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{receipt.uploadedBy}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewReceipt(receipt)}
                        className="h-7 w-7 p-0"
                        title="View Receipt"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownloadReceipt(receipt)}
                        className="h-7 w-7 p-0"
                        title="Download Receipt"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      {receipt.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onVerifyReceipt(receipt.id)}
                          className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                          title="Verify Receipt"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden p-3 md:p-6 space-y-4">
        {receipts.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No receipts found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or add a new receipt</p>
          </div>
        ) : (
          receipts.map((receipt, index) => (
            <motion.div
              key={receipt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full font-semibold text-lg shadow-sm flex items-center justify-center">
                    R
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-foreground">
                      {receipt.id}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(receipt.date)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-foreground">
                    {formatIndianCurrency(receipt.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {receipt.uploadedBy}
                  </div>
                </div>
              </div>

              {/* Receipt Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Vendor</div>
                    <div className="text-sm font-medium">{receipt.vendor}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Description</div>
                    <div className="text-sm font-medium">{receipt.description}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(receipt.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(receipt.status)}`}>
                      {receipt.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewReceipt(receipt)}
                  className="flex-1 h-8 text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownloadReceipt(receipt)}
                  className="flex-1 h-8 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                {receipt.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVerifyReceipt(receipt.id)}
                    className="flex-1 h-8 text-xs text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verify
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReceiptTable; 