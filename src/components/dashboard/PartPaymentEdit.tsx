import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PartPayment, Booking } from '../../types';
import { formatIndianCurrency } from '../../utils/helpers';
import { Calendar, DollarSign, User, FileText, CreditCard } from 'lucide-react';
import { supabase, updatePartPayment } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface PartPaymentEditProps {
  payment: PartPayment | null;
  bookings: Booking[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const PartPaymentEdit: React.FC<PartPaymentEditProps> = ({
  payment,
  bookings,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    booking_id: '',
    client_name: '',
    amount: '',
    payment_date: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (payment) {
      setFormData({
        booking_id: payment.booking_id.toString(),
        client_name: payment.client_name || '',
        amount: payment.amount.toString(),
        payment_date: payment.payment_date,
        description: payment.description || ''
      });
    }
  }, [payment]);

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

  const submitForm = async () => {
    if (!payment || !formData.booking_id || !formData.amount || !formData.payment_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const selectedBooking = bookings.find(booking => booking.booking_id.toString() === formData.booking_id);
      
      const paymentData = {
        booking_id: parseInt(formData.booking_id),
        client_name: selectedBooking?.client_name || formData.client_name,
        amount: parseFloat(formData.amount) || 0,
        payment_date: formData.payment_date,
        description: formData.description
      };

      await updatePartPayment(payment.payment_id as number, paymentData);
      toast.success('Part payment updated successfully!');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating part payment:', error);
      toast.error('Failed to update part payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Edit Part Payment
          </DialogTitle>
          <DialogDescription>
            Update the details for this part payment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Booking Selection */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center">
              <User className="w-4 h-4 mr-2" />
              Booking *
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

          {/* Client Name */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center">
              <User className="w-4 h-4 mr-2" />
              Client Name *
            </label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) => handleInputChange('client_name', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              placeholder="Enter client name"
              required
            />
          </div>

          {/* Amount */}
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
              placeholder="Enter description"
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
                Updating...
              </>
            ) : (
              'Update Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PartPaymentEdit; 