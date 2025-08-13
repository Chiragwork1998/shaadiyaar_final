import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2, 
  AlertTriangle,
  Grid3X3,
  List,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { supabase } from '../../lib/supabase';
import { Booking } from '../../types';
import { formatIndianCurrency, formatDate } from '../../utils/helpers';
import { toast } from 'react-hot-toast';

// Payment Record interface for display
interface PaymentRecord {
  id: string;
  booking_id: number;
  client_name: string;
  payment_type: 'advance' | 'part_payment' | 'final';
  amount: number;
  payment_date: string;
  due_date: string;
  status: 'received' | 'pending' | 'overdue';
  booking_serial: string;
  event_date: string;
}

// Add Payment Record Form Component
const AddPaymentRecordForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded: () => void;
  bookings: Booking[];
}> = ({ isOpen, onClose, onPaymentAdded, bookings }) => {
  const [formData, setFormData] = useState({
    booking_id: '',
    payment_type: 'part_payment',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  const submitForm = async () => {
    if (!formData.booking_id || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Find the selected booking to get client_name
      const selectedBooking = bookings.find(booking => booking.booking_id.toString() === formData.booking_id);
      
      if (!selectedBooking) {
        throw new Error('Selected booking not found');
      }

      const paymentData = {
        booking_id: parseInt(formData.booking_id),
        client_name: selectedBooking.client_name,
        amount: parseFloat(formData.amount) || 0,
        payment_date: formData.payment_date,
        description: formData.notes
      };

      const { data, error } = await supabase
        .from('part_payments')
        .insert([paymentData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('Payment record added successfully!');
      setFormData({
        booking_id: '',
        payment_type: 'part_payment',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      onClose();
      onPaymentAdded();
    } catch (error) {
      console.error('Error adding payment record:', error);
      toast.error('Failed to add payment record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400';
      case 'overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400';
      default:
        return 'bg-accent text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add Payment Record</DialogTitle>
          <DialogDescription>
            Create a new payment stage for tracking payments.
          </DialogDescription>
        </DialogHeader>

        <form id="add-payment-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Booking Selection */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Select Booking *
            </label>
            <Select value={formData.booking_id} onValueChange={(value) => handleInputChange('booking_id', value)}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select a booking" />
              </SelectTrigger>
              <SelectContent>
                {bookings.map((booking) => (
                  <SelectItem key={booking.booking_id} value={booking.booking_id.toString()}>
                    {booking.serial_no} - {booking.client_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Payment Type
              </label>
              <Select value={formData.payment_type} onValueChange={(value) => handleInputChange('payment_type', value)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="part_payment">Part Payment</SelectItem>
                  <SelectItem value="advance">Advance</SelectItem>
                  <SelectItem value="final">Final Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Amount *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Payment Date *
            </label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => handleInputChange('payment_date', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              placeholder="Enter notes"
              rows={3}
            />
          </div>
        </form>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submitForm}
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Record
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Mobile Payment Card Component
const MobilePaymentCard: React.FC<{
  payment: PaymentRecord;
  booking?: any;
  isSelected: boolean;
  onSelect: (paymentId: string, checked: boolean) => void;
  onView: (payment: PaymentRecord) => void;
  onEdit: (payment: PaymentRecord) => void;
  onDelete: (payment: PaymentRecord, e?: React.MouseEvent) => void;
  onMarkReceived: (payment: PaymentRecord) => void;
  getBookingForPayment: (payment: PaymentRecord) => any;
  index: number;
}> = ({ payment, booking, isSelected, onSelect, onView, onEdit, onDelete, onMarkReceived, getBookingForPayment, index }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400';
      case 'overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400';
      default:
        return 'bg-accent text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(payment.id, e.target.checked)}
            className="w-5 h-5 text-primary border-border rounded focus:ring-primary"
          />
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full font-semibold text-lg shadow-sm flex items-center justify-center">
            ₹
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-foreground">
            {formatIndianCurrency(payment.amount)}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(payment.due_date)}
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div>
              <div className="text-xs text-muted-foreground">Client</div>
              <div className="text-sm font-medium">
                {getBookingForPayment(payment)?.client_name || `Booking ${payment.booking_id}`}
              </div>
              {getBookingForPayment(payment)?.serial_no && (
                <div className="text-xs text-muted-foreground">
                  {getBookingForPayment(payment)?.serial_no}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div>
              <div className="text-xs text-muted-foreground">Stage</div>
              <div className="text-sm font-medium">{payment.payment_type}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(payment.status)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(payment.status)}`}>
              {payment.status}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(payment)}
          className="flex-1 h-8 text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          View
        </Button>
        {payment.status === 'pending' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkReceived(payment)}
            className="flex-1 h-8 text-xs text-green-600 hover:text-green-700"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Mark Received
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => onDelete(payment, e)}
          className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </div>
    </motion.div>
  );
};

interface PaymentTableProps {
  paymentRecords: PaymentRecord[];
  bookings: Booking[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaymentView: (payment: PaymentRecord) => void;
  onPaymentEdit: (payment: PaymentRecord) => void;
  onPaymentDelete: (payment: PaymentRecord) => void;
  onMarkReceived: (payment: PaymentRecord) => void;
  onPaymentAdded?: () => void;
  canViewFinancialData?: boolean;
}

const PaymentTable: React.FC<PaymentTableProps> = ({
  paymentRecords,
  bookings,
  searchQuery,
  onSearchChange,
  onPaymentView,
  onPaymentEdit,
  onPaymentDelete,
  onMarkReceived,
  onPaymentAdded,
  canViewFinancialData = true
}) => {
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<PaymentRecord | null>(null);

  // Helper function to get booking for a payment
  const getBookingForPayment = (payment: PaymentRecord) => {
    return bookings.find(b => b.booking_id === payment.booking_id);
  };

  const handleDeleteClick = (payment: PaymentRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(payment);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    try {
      await onPaymentDelete(deleteConfirm);
      toast.success('Payment deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(paymentRecords.map(p => p.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments(prev => [...prev, paymentId]);
    } else {
      setSelectedPayments(prev => prev.filter(id => id !== paymentId));
    }
  };

  const handleClearSelection = () => {
    setSelectedPayments([]);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400';
      case 'overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400';
      default:
        return 'bg-accent text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Payment Records</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Track all payment stages and status
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs md:text-sm text-muted-foreground">
                {paymentRecords.length} total
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Add Payment Button */}
              <Button
                onClick={() => setShowAddPaymentForm(true)}
                className="bg-primary text-primary-foreground hover:bg-accent-vibrant-purple-darker shadow-lg shadow-primary/20 h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Add Payment Record
              </Button>
            </div>
          </div>
        </div>

        {/* View Toggle - Mobile Only */}
        <div className="flex items-center justify-between mt-3 lg:hidden">
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-7 px-2 text-xs"
            >
              <Grid3X3 className="w-3 h-3 mr-1" />
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-7 px-2 text-xs"
            >
              <List className="w-3 h-3 mr-1" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPayments.length > 0 && (
        <div className="px-3 md:px-6 py-2 md:py-3 bg-muted/50 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-muted-foreground">
              {selectedPayments.length} payment(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="h-7 md:h-8 text-xs"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {viewMode === 'cards' && (
        <motion.div className="block lg:hidden p-3 md:p-6 space-y-4">
          {paymentRecords.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No payments found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or add a new payment</p>
            </div>
          ) : (
            paymentRecords.map((payment, index) => (
              <MobilePaymentCard
                key={`${payment.id}-${payment.booking_id}`}
                payment={payment}
                isSelected={selectedPayments.includes(payment.id)}
                onSelect={handleSelectPayment}
                onView={onPaymentView}
                onEdit={onPaymentEdit}
                onDelete={handleDeleteClick}
                onMarkReceived={onMarkReceived}
                getBookingForPayment={getBookingForPayment}
                index={index}
              />
            ))
          )}
        </motion.div>
      )}

      {/* Mobile Table View */}
      {viewMode === 'table' && (
        <motion.div className="block lg:hidden p-3 md:p-6">
          <div className="space-y-3">
            {paymentRecords.map((payment) => (
              <div key={`${payment.id}-${payment.booking_id}`} className="bg-card border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">
                      {getBookingForPayment(payment)?.client_name || `Booking ${payment.booking_id}`}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {getBookingForPayment(payment)?.serial_no || `ID: ${payment.booking_id}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{formatIndianCurrency(payment.amount)}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Due Date</div>
                    <div>{formatDate(payment.due_date)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Payment Date</div>
                    <div>{payment.payment_date ? formatDate(payment.payment_date) : '-'}</div>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPaymentView(payment)}
                    className="h-6 px-2 text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  {payment.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkReceived(payment)}
                      className="h-6 px-2 text-xs text-green-600"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Mark Received
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium">Client Name</th>
                <th className="text-left py-3 px-4 font-medium">Event Date</th>
                <th className="text-left py-3 px-4 font-medium">Stage</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Due Date</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Payment Date</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentRecords.map((payment) => (
                <tr key={`${payment.id}-${payment.booking_id}`} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">
                      {payment.client_name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {formatDate(payment.event_date)}
                  </td>
                  <td className="py-3 px-4 text-sm">{payment.payment_type}</td>
                  <td className="py-3 px-4 font-medium text-sm">
                    {canViewFinancialData ? formatIndianCurrency(payment.amount) : '***'}
                  </td>
                  <td className="py-3 px-4 text-sm">{formatDate(payment.due_date)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{payment.payment_date ? formatDate(payment.payment_date) : '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPaymentView(payment)}
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      {payment.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkReceived(payment)}
                          className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                      {/* Show delete button for part payments (all users) or advance payments (super admin only) */}
                      {(payment.payment_type === 'part_payment' || payment.payment_type === 'advance') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(payment, e)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          title={payment.payment_type === 'part_payment' ? "Delete part payment" : "Delete advance payment (Super Admin only)"}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Form */}
      <AddPaymentRecordForm
        isOpen={showAddPaymentForm}
        onClose={() => setShowAddPaymentForm(false)}
        onPaymentAdded={onPaymentAdded || (() => {})}
        bookings={bookings}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment stage? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
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

export default PaymentTable; 