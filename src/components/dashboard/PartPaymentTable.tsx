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
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  User,
  Printer
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { supabase, createPartPayment, updatePartPayment, deletePartPayment, createPendingApproval } from '../../lib/supabase';
import { PartPayment, Booking } from '../../types';
import { formatIndianCurrency, formatDate } from '../../utils/helpers';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { requiresApproval } from '../../utils/permissions';

// Add Part Payment Form Component
const AddPartPaymentForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded: () => void;
  bookings: Booking[];
}> = ({ isOpen, onClose, onPaymentAdded, bookings }) => {
  const [formData, setFormData] = useState({
    booking_id: '',
    client_name: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    description: '',
    payment_mode: '',
    payment_mode_other: '',
    payment_reference_details: '',
    miscellaneous_payments: '',
    other_payments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If booking_id is selected, automatically populate client_name
    if (field === 'booking_id' && value) {
      const selectedBooking = bookings.find(booking => booking.booking_id.toString() === value);
      if (selectedBooking) {
        setFormData(prev => ({ ...prev, client_name: selectedBooking.client_name }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  const { user } = useAuth();

  const submitForm = async () => {
    if (!formData.booking_id || !formData.amount || !formData.payment_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the selected booking to ensure we have the correct client_name
      const selectedBooking = bookings.find(booking => booking.booking_id.toString() === formData.booking_id);
      
      const paymentData = {
        booking_id: formData.booking_id, // Keep as string for pending bookings
        client_name: selectedBooking?.client_name || formData.client_name,
        amount: parseFloat(formData.amount) || 0,
        payment_date: formData.payment_date,
        description: formData.description,
        payment_mode: formData.payment_mode,
        payment_mode_other: formData.payment_mode_other,
        payment_reference_details: formData.payment_reference_details,
        miscellaneous_payments: parseFloat(formData.miscellaneous_payments) || 0,
        other_payments: parseFloat(formData.other_payments) || 0
      };

      // Validate part payment data before submission
      if (!paymentData.booking_id || paymentData.booking_id === '') {
        console.error('Invalid booking_id value:', formData.booking_id);
        toast.error('Please select a valid booking');
        return;
      }

      if (isNaN(paymentData.amount) || paymentData.amount <= 0) {
        console.error('Invalid amount value:', formData.amount);
        toast.error('Please enter a valid payment amount');
        return;
      }

      // Ensure the selected booking exists
      if (!selectedBooking) {
        console.error('Selected booking not found:', formData.booking_id);
        toast.error('Selected booking not found');
        return;
      }

      // Handle pending bookings (string booking_id) vs confirmed bookings (numeric booking_id)
      const isPendingBooking = typeof selectedBooking.booking_id === 'string' && selectedBooking.booking_id.startsWith('pending_');
      
      if (isPendingBooking) {
        console.log('Creating part payment for pending booking:', selectedBooking.booking_id);
        // For pending bookings, we'll create a pending approval
        paymentData.booking_id = selectedBooking.booking_id; // Keep as string
      } else {
        // For confirmed bookings, convert to number
        const numericBookingId = parseInt(formData.booking_id);
        if (isNaN(numericBookingId) || numericBookingId <= 0) {
          console.error('Invalid numeric booking_id value:', formData.booking_id);
          toast.error('Please select a valid booking');
          return;
        }
        paymentData.booking_id = numericBookingId;
      }

      console.log('Submitting part payment data:', paymentData);

      // Check if user requires approval
      if (user && requiresApproval(user.access_code as any)) {
        // Submit to pending approvals
        await createPendingApproval({
          admin_id: user.admin_id,
          action_type: 'part_payment',
          action_data: paymentData,
          status: 'pending'
        });

        toast.success('Part payment submitted for approval!');
        
        // Trigger manual refresh since real-time might not work for pending approvals
        console.log('Triggering manual refresh after pending part payment creation');
        if (onPaymentAdded) {
          onPaymentAdded();
        }
        
        // Also trigger a broadcast for other components
        supabase.channel('manual-refresh').send({
          type: 'broadcast',
          event: 'part-payment-added',
          payload: { payment: paymentData }
        });
        
        setFormData({
          booking_id: '',
          client_name: '',
          amount: '',
          payment_date: new Date().toISOString().split('T')[0],
          description: '',
          payment_mode: '',
          payment_mode_other: '',
          payment_reference_details: '',
          miscellaneous_payments: '',
          other_payments: ''
        });
        onClose();
        return;
      }

      // Direct submission for admin users
      const { data, error } = await supabase
        .from('part_payments')
        .insert([paymentData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('Part payment added successfully!');
      setFormData({
        booking_id: '',
        client_name: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        description: ''
      });
      onClose();
      // Call onPaymentAdded to trigger immediate refresh
      if (onPaymentAdded) {
        onPaymentAdded();
      }
    } catch (error) {
      console.error('Error adding part payment:', error);
      toast.error('Failed to add part payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add New Part Payment</DialogTitle>
          <DialogDescription>
            Enter the part payment information below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form id="add-payment-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Booking Selection */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
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
          </div>



          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              placeholder="Enter payment description"
              rows={3}
            />
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Payment Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Mode of Payment
                </label>
                <select
                  value={formData.payment_mode}
                  onChange={(e) => handleInputChange('payment_mode', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                >
                  <option value="">Select payment mode</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Payment Mode Other Field */}
            {formData.payment_mode === 'other' && (
              <div>
                <label className="text-sm font-medium text-foreground">
                  Specify Payment Mode
                </label>
                <input
                  type="text"
                  value={formData.payment_mode_other}
                  onChange={(e) => handleInputChange('payment_mode_other', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter payment mode details"
                />
              </div>
            )}

            {/* Payment Reference Details Field */}
            {(formData.payment_mode === 'bank_transfer' || formData.payment_mode === 'upi') && (
              <div>
                <label className="text-sm font-medium text-foreground">
                  Payment Reference Details
                </label>
                <input
                  type="text"
                  value={formData.payment_reference_details}
                  onChange={(e) => handleInputChange('payment_reference_details', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder={formData.payment_mode === 'upi' ? 'Enter UPI ID or Transaction ID' : 'Enter RTGS/Cheque Number'}
                />
              </div>
            )}

            {/* Additional Payment Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Miscellaneous Payments
                </label>
                <input
                  type="number"
                  value={formData.miscellaneous_payments}
                  onChange={(e) => handleInputChange('miscellaneous_payments', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Others
                </label>
                <input
                  type="number"
                  value={formData.other_payments}
                  onChange={(e) => handleInputChange('other_payments', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
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
                Add Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Mobile Part Payment Card Component
const MobilePartPaymentCard: React.FC<{
  payment: PartPayment;
  booking?: Booking;
  isSelected: boolean;
  onSelect: (paymentId: number | string, checked: boolean) => void;
  onView: (payment: PartPayment) => void;
  onEdit: (payment: PartPayment) => void;
  onDelete: (payment: PartPayment, e?: React.MouseEvent) => void;
  onPaymentPrint: (payment: PartPayment) => void;
  index: number;
}> = ({ payment, booking, isSelected, onSelect, onView, onEdit, onDelete, onPaymentPrint, index }) => {
  const { checkPermission } = useAuth();
  const canViewFinancialData = checkPermission('canViewFinancialData');
  const canEditPartPayments = checkPermission('canEditPartPayments');
  const canApproveActions = checkPermission('canApproveActions');

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
            onChange={(e) => onSelect(payment.payment_id, e.target.checked)}
            className="w-5 h-5 text-primary border-border rounded focus:ring-primary"
          />
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full font-semibold text-lg shadow-sm flex items-center justify-center">
            ₹
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-foreground">
            {canViewFinancialData ? formatIndianCurrency(payment.amount) : '***'}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(payment.payment_date)}
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div>
              <div className="text-xs text-muted-foreground">Booking</div>
              <div className="text-sm font-medium">
                {payment.is_pending ? (
                  <span className="text-orange-600 font-medium">Pending Approval - {payment.client_name}</span>
                ) : booking ? (
                  `${booking.serial_no} - ${booking.client_name}`
                ) : payment.client_name ? (
                  <span className="text-muted-foreground">Client: {payment.client_name}</span>
                ) : (
                  <span className="text-muted-foreground">Client: Unknown</span>
                )}
              </div>
            </div>
          </div>

        </div>
        
        {payment.description && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div>
              <div className="text-xs text-muted-foreground">Description</div>
              <div className="text-sm">{payment.description}</div>
            </div>
          </div>
        )}
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
        {canEditPartPayments && !payment.is_pending && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(payment)}
            className="flex-1 h-8 text-xs"
          >
            <Pencil className="w-3 h-3 mr-1" />
            Edit
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPaymentPrint(payment)}
          className="flex-1 h-8 text-xs"
        >
          <Printer className="w-3 h-3 mr-1" />
          Print
        </Button>
        {canEditPartPayments && !payment.is_pending && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => onDelete(payment, e)}
            className="flex-1 h-8 text-xs text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        )}
        {canApproveActions && payment.is_pending && (
          <Button
            size="sm"
            onClick={() => {
              // Handle approval logic
            }}
            className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
          >
            Approve
          </Button>
        )}
      </div>
    </motion.div>
  );
};

interface PartPaymentTableProps {
  payments: PartPayment[];
  bookings: Booking[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaymentView: (payment: PartPayment) => void;
  onPaymentEdit: (payment: PartPayment) => void;
  onPaymentDelete: (payment: PartPayment) => void;
  onPaymentPrint: (payment: PartPayment) => void;
  onPaymentAdded?: () => void;
}

const PartPaymentTable: React.FC<PartPaymentTableProps> = ({
  payments,
  bookings,
  searchQuery,
  onSearchChange,
  onPaymentView,
  onPaymentEdit,
  onPaymentDelete,
  onPaymentPrint,
  onPaymentAdded
}) => {
  const { checkPermission } = useAuth();
  const canViewFinancialData = checkPermission('canViewFinancialData');
  const canEditPartPayments = checkPermission('canEditPartPayments');
  const canApproveActions = checkPermission('canApproveActions');

  const [selectedPayments, setSelectedPayments] = useState<(number | string)[]>([]);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<PartPayment | null>(null);

  const getBookingForPayment = (payment: PartPayment) => {
    return bookings.find(b => b.booking_id === payment.booking_id);
  };

  const handleDeleteClick = (payment: PartPayment, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if this is a pending payment
    if (payment.is_pending) {
      toast.error('Cannot delete pending payments. Please approve or reject them from the Approvals page.');
      return;
    }
    
    setPaymentToDelete(payment);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;
    
    try {
      await deletePartPayment(paymentToDelete.payment_id);
      toast.success('Payment deleted successfully');
      setPaymentToDelete(null);
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
    }
  };

  const handleDeleteCancel = () => {
    setPaymentToDelete(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(payments.map(p => p.payment_id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (paymentId: number | string, checked: boolean) => {
    if (checked) {
      setSelectedPayments(prev => [...prev, paymentId]);
    } else {
      setSelectedPayments(prev => prev.filter(id => id !== paymentId));
    }
  };

  const handleClearSelection = () => {
    setSelectedPayments([]);
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">All Part Payments</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                EMI-style payments between booking and event dates
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs md:text-sm text-muted-foreground">
                {payments.length} total
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
                Add Part Payment
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
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No payments found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or add a new payment</p>
            </div>
          ) : (
            payments.map((payment, index) => (
              <MobilePartPaymentCard
                key={`${payment.payment_id}-${payment.booking_id}`}
                payment={payment}
                booking={getBookingForPayment(payment)}
                isSelected={selectedPayments.includes(payment.payment_id)}
                onSelect={handleSelectPayment}
                onView={onPaymentView}
                onEdit={onPaymentEdit}
                onDelete={handleDeleteClick}
                onPaymentPrint={onPaymentPrint}
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
            {payments.map((payment) => (
              <div key={`${payment.payment_id}-${payment.booking_id}`} className="bg-card border border-border rounded-lg p-3 space-y-2">
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
                    <div className="font-medium text-sm">{canViewFinancialData ? formatIndianCurrency(payment.amount) : '***'}</div>
                    <div className="text-muted-foreground text-xs">{formatDate(payment.payment_date)}</div>
                  </div>
                </div>
                
                {payment.description && (
                  <div className="text-xs text-muted-foreground">{payment.description}</div>
                )}
                
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
                  {canEditPartPayments && !payment.is_pending && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPaymentEdit(payment)}
                      className="h-6 px-2 text-xs"
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  )}
                  {canEditPartPayments && !payment.is_pending && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => onPaymentDelete(payment)}
                      className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
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
                <th className="text-left py-3 px-4 font-medium">Booking ID</th>
                <th className="text-left py-3 px-4 font-medium">Client Name</th>
                {canViewFinancialData && (
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                )}
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Description</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={`${payment.payment_id}-${payment.booking_id}`} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium text-sm">{payment.booking_id}</td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-sm">
                        {getBookingForPayment(payment)?.client_name || `Booking ${payment.booking_id}`}
                      </div>
                      {getBookingForPayment(payment)?.serial_no && (
                        <div className="text-xs text-muted-foreground">
                          {getBookingForPayment(payment)?.serial_no}
                        </div>
                      )}
                    </div>
                  </td>
                  {canViewFinancialData && (
                    <td className="py-3 px-4 font-medium text-sm">{formatIndianCurrency(payment.amount)}</td>
                  )}
                  <td className="py-3 px-4 text-sm">{formatDate(payment.payment_date)}</td>
                  <td className="py-3 px-4 text-sm">{payment.description || '-'}</td>
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
                      {canEditPartPayments && !payment.is_pending && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPaymentEdit(payment)}
                          className="h-7 w-7 p-0"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPaymentPrint(payment)}
                        className="h-7 w-7 p-0"
                      >
                        <Printer className="w-3 h-3" />
                      </Button>
                      {canEditPartPayments && !payment.is_pending && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(payment, e)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
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
      <AddPartPaymentForm
        isOpen={showAddPaymentForm}
        onClose={() => setShowAddPaymentForm(false)}
        onPaymentAdded={onPaymentAdded || (() => {})}
        bookings={bookings}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!paymentToDelete} onOpenChange={() => setPaymentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
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

export default PartPaymentTable; 