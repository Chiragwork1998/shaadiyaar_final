import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BOOKING_SLOTS, MENU_PREFERENCES, FLOWER_DECORATIONS, BOOKING_STATUSES } from '../../utils/helpers';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface AddBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingAdded: () => void;
}

const AddBookingForm: React.FC<AddBookingFormProps> = ({
  isOpen,
  onClose,
  onBookingAdded
}) => {
  const [formData, setFormData] = useState({
    client_name: '',
    contact_number: '',
    address: '',
    event_date: '',
    slot: 'Dinner',
    menu_preference: 'Veg Platinum',
    flower_decoration: 'Basic',
    custom_flower_details: '',
    liquor_service: false,
    dj_service: false,
    gross_amount: '',
    gst_amount: '',
    extras_amount: '',
    net_amount: '',
    advance_paid: '',
    balance_amount: '',
    payment_mode: '',
    payment_mode_other: '',
    miscellaneous_payments: '',
    other_payments: '',
    status: 'confirmed'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Calculate amounts immediately when relevant fields change
      if (['gross_amount', 'gst_amount', 'extras_amount', 'advance_paid'].includes(field)) {
        const gross = parseFloat(newData.gross_amount) || 0;
        const gst = parseFloat(newData.gst_amount) || 0;
        const extras = parseFloat(newData.extras_amount) || 0;
        const advance = parseFloat(newData.advance_paid) || 0;
        
        const net = gross + gst + extras;
        const balance = net - advance;
        
        return {
          ...newData,
          net_amount: net.toFixed(2),
          balance_amount: balance.toFixed(2)
        };
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.event_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newBooking = {
        client_name: formData.client_name,
        contact_number: formData.contact_number || '',
        address: formData.address || '',
        event_date: formData.event_date,
        slot: formData.slot,
        menu_preference: formData.menu_preference,
        flower_decoration: formData.flower_decoration,
        custom_flower_details: formData.custom_flower_details,
        liquor_service: formData.liquor_service,
        dj_service: formData.dj_service,
        gross_amount: parseFloat(formData.gross_amount) || 0,
        gst_amount: parseFloat(formData.gst_amount) || 0,
        extras_amount: parseFloat(formData.extras_amount) || 0,
        net_amount: parseFloat(formData.net_amount) || 0,
        advance_paid: parseFloat(formData.advance_paid) || 0,
        balance_amount: parseFloat(formData.balance_amount) || 0,
        payment_mode: formData.payment_mode,
        payment_mode_other: formData.payment_mode_other,
        miscellaneous_payments: parseFloat(formData.miscellaneous_payments) || 0,
        other_payments: parseFloat(formData.other_payments) || 0,
        status: formData.status,
        booking_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('bookings')
        .insert([newBooking]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('Booking added successfully!');
      onBookingAdded();
      onClose();
      
      // Reset form
      setFormData({
        client_name: '',
        contact_number: '',
        address: '',
        event_date: '',
        slot: 'Dinner',
        menu_preference: 'Veg Platinum',
        flower_decoration: 'Basic',
        liquor_service: false,
        dj_service: false,
        gross_amount: '',
        gst_amount: '',
        extras_amount: '',
        net_amount: '',
        advance_paid: '',
        balance_amount: '',
        payment_mode: '',
        payment_mode_other: '',
        miscellaneous_payments: '',
        other_payments: '',
        status: 'confirmed'
      });
    } catch (error) {
      console.error('Error adding booking:', error);
      toast.error('Failed to add booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Add New Booking</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 px-3"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <User className="w-5 h-5 mr-2" />
              Client Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => handleInputChange('contact_number', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter contact number"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                rows={3}
                placeholder="Enter client address"
              />
            </div>
          </motion.div>

          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Event Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Slot of Event
                </label>
                <Select value={formData.slot} onValueChange={(value) => handleInputChange('slot', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_SLOTS.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Menu Preference
                </label>
                <Select value={formData.menu_preference} onValueChange={(value) => handleInputChange('menu_preference', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select menu preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {MENU_PREFERENCES.map((menu) => (
                      <SelectItem key={menu.value} value={menu.value}>
                        {menu.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Flower Decoration
                </label>
                <Select value={formData.flower_decoration} onValueChange={(value) => handleInputChange('flower_decoration', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select flower decoration" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLOWER_DECORATIONS.map((decoration) => (
                      <SelectItem key={decoration.value} value={decoration.value}>
                        {decoration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.flower_decoration === 'Custom' && (
                  <div className="mt-2">
                    <label className="text-sm font-medium text-foreground">Custom Flower Details</label>
                    <input
                      type="text"
                      value={formData.custom_flower_details}
                      onChange={(e) => handleInputChange('custom_flower_details', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="Enter custom flower decoration details"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Liquor Service</label>
                <div className="flex space-x-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="liquor_service"
                      checked={formData.liquor_service === true}
                      onChange={() => handleInputChange('liquor_service', true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="liquor_service"
                      checked={formData.liquor_service === false}
                      onChange={() => handleInputChange('liquor_service', false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">DJ Service</label>
                <div className="flex space-x-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="dj_service"
                      checked={formData.dj_service === true}
                      onChange={() => handleInputChange('dj_service', true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="dj_service"
                      checked={formData.dj_service === false}
                      onChange={() => handleInputChange('dj_service', false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Financial Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Gross Amount
                </label>
                <input
                  type="number"
                  value={formData.gross_amount}
                  onChange={(e) => handleInputChange('gross_amount', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter gross amount"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  GST
                </label>
                <input
                  type="number"
                  value={formData.gst_amount}
                  onChange={(e) => handleInputChange('gst_amount', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter GST amount"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Extras
                </label>
                <input
                  type="number"
                  value={formData.extras_amount}
                  onChange={(e) => handleInputChange('extras_amount', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter extras amount"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Net Booking
                </label>
                <input
                  type="number"
                  value={formData.net_amount}
                  readOnly
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm bg-muted"
                  placeholder="Auto calculated"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Advance
                  </label>
                  <input
                    type="number"
                    value={formData.advance_paid}
                    onChange={(e) => handleInputChange('advance_paid', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    placeholder="Enter advance amount"
                  />
                </div>

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

              <div className="grid grid-cols-2 gap-4">
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
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Balance
                </label>
                <input
                  type="number"
                  value={formData.balance_amount}
                  readOnly
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm bg-muted"
                  placeholder="Auto calculated"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Status
              </label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end space-x-3 pt-4 border-t border-border"
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Booking
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookingForm;
