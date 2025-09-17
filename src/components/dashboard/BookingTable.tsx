import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, ChevronDown, Phone, Calendar, DollarSign, MapPin, MoreHorizontal, Share2, Pencil, ArrowUp, ArrowDown, Trash2, AlertTriangle, X, Eye, Grid3X3, List, User, Mail, Clock, Building, Printer, CreditCard, ShieldCheck, FileText, Tag, Settings, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { toast } from 'react-hot-toast';
import { supabase, createPendingApproval } from '../../lib/supabase';
import { Booking } from '../../types';
import { formatIndianCurrency, formatDate, BOOKING_SLOTS, getBookingStatusStyle, getBookingStatusDotColor, getBookingStatusTriggerStyle, getBookingStatusText, BOOKING_STATUSES, MENU_PREFERENCES, FLOWER_DECORATIONS, generateSerialNumber, generateSequentialSerialNumber, HALLS, MENU_OPTIONS, BOOKING_UNITS, OCCASIONS, MEAL_TYPES, ONION_PREFERENCES, GARLIC_PREFERENCES } from '../../utils/helpers';
import { parseISO, differenceInDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { requiresApproval } from '../../utils/permissions';

// Booking Details View Modal
const BookingDetailsModal: React.FC<{
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  partPayments: any[];
}> = ({ booking, isOpen, onClose, partPayments }) => {
  if (!booking) return null;

  const { user, checkPermission } = useAuth();
  const canViewFinancialData = checkPermission('canViewFinancialData');
  const canEditBookings = checkPermission('canEditBookings');
  const canApproveActions = checkPermission('canApproveActions');

  const bookingPartPayments = partPayments.filter(p => p.booking_id === booking.booking_id);
  const totalPartPayments = bookingPartPayments.reduce((sum, p) => sum + p.amount, 0);
  const actualBalance = booking.total_amount - booking.advance_paid - totalPartPayments;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {booking.client_name} - {booking.serial_no}
              </h2>
              {booking.is_pending && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Approval
                  </span>
                  {!canApproveActions && (
                    <span className="text-xs text-muted-foreground">
                      Waiting for admin approval
                    </span>
                  )}
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Basic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Serial No:</span>
                  <span>{booking.serial_no || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Unit:</span>
                  <span>{booking.unit || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Booking Date:</span>
                  <span>{formatDate(booking.booking_date)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusStyle(booking.status)}`}>
                    {getBookingStatusText(booking.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Client Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Client Name:</span>
                  <span>{booking.client_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Contact Number:</span>
                  <span>{booking.contact_number || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Address:</span>
                  <span>{booking.client_address || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Date of Birth:</span>
                  <span>{booking.date_of_birth ? formatDate(booking.date_of_birth) : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Event Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Event Date:</span>
                  <span>{formatDate(booking.date_of_function)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Occasion:</span>
                  <span>
                    {booking.occasion === 'Other' && booking.custom_occasion_details 
                      ? booking.custom_occasion_details 
                      : booking.occasion}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Hall:</span>
                  <span>{booking.hall || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Meal Type:</span>
                  <span>{booking.meal_type || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Timings From:</span>
                  <span>{booking.timings_from || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Timings To:</span>
                  <span>{booking.timings_to || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Pax (Number of Guests):</span>
                  <span>{booking.pax || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu & Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Menu & Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Menu:</span>
                  <span>{booking.menu || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Onion Preference:</span>
                  <span>{booking.onion_preference || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Garlic Preference:</span>
                  <span>{booking.garlic_preference || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Flower Decoration:</span>
                  <span>
                    {booking.flower_decoration === 'Custom' && booking.custom_flower_details 
                      ? booking.custom_flower_details 
                      : booking.flower_decoration}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Theme:</span>
                  <span>{booking.theme || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Liquor Service:</span>
                  <span>{booking.liquor_service ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">DJ Service:</span>
                  <span>{booking.dj_service ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Details - Only show if user can view financial data */}
          {canViewFinancialData && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Financial Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Gross Amount:</span>
                  <span>{formatIndianCurrency(booking.gross_amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tax Amount:</span>
                  <span>{formatIndianCurrency(booking.tax_amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Extra Plates Amount:</span>
                  <span>{formatIndianCurrency(booking.extra_plates_amount)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-semibold">{formatIndianCurrency(booking.total_amount)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Advance Paid:</span>
                    <span>{formatIndianCurrency(booking.advance_paid)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Part Payments:</span>
                    <span>{formatIndianCurrency(totalPartPayments)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="font-semibold">Balance Amount:</span>
                    <span className="font-semibold">{formatIndianCurrency(actualBalance)}</span>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Additional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="font-medium">BTR:</span>
                  <span className="text-right max-w-xs break-words">
                    {booking.btr || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="font-medium">Remarks:</span>
                  <span className="text-right max-w-xs break-words">
                    {booking.remarks || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Part Payments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Part Payments ({bookingPartPayments.length})
              </h3>
            {bookingPartPayments.length > 0 ? (
              <div className="space-y-2">
                {bookingPartPayments.map((payment) => (
                  <div key={payment.payment_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                      <div className="font-medium text-sm">{formatDate(payment.payment_date)}</div>
                      <div className="text-xs text-muted-foreground">{payment.description || 'No description'}</div>
                      </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">
                        {canViewFinancialData ? formatIndianCurrency(payment.amount) : '***'}
                    </div>
                      <div className="text-xs text-muted-foreground">
                        {payment.is_pending ? 'Pending Approval' : 'Approved'}
                  </div>
              </div>
            </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No part payments recorded</p>
          )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {canEditBookings && !booking.is_pending && (
            <Button onClick={() => {
              onClose();
              // Trigger edit action
            }}>
              Edit Booking
            </Button>
          )}
          {canApproveActions && booking.is_pending && (
            <Button onClick={() => {
              onClose();
              // Trigger approval action
            }}>
              Approve Booking
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Edit Booking Form Component
const EditBookingForm: React.FC<{
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingUpdated: () => void;
}> = ({ booking, isOpen, onClose, onBookingUpdated }) => {
  const [formData, setFormData] = useState({
    // Basic Details
    serial_no: '',
    unit: 'UNIT-2',
    
    // Client Details
    client_name: '',
    client_address: '',
    contact_number: '',
    booking_date: new Date().toISOString().split('T')[0],
    
    // Event Details
    date_of_function: '',
    occasion: 'Wedding',
    custom_occasion_details: '',
    hall: 'Ground',
    meal_type: 'Dinner',
    timings_from: '',
    timings_to: '',
    pax: '',
    
    // Menu & Preferences
    menu: 'Veg Silver',
    onion_preference: 'Yes',
    garlic_preference: 'Yes',
    
    // Services
    flower_decoration: 'Basic',
    custom_flower_details: '',
    dj_service: false,
    liquor_service: false,
    theme: '',
    
    // Financial Details
    gross_amount: '',
    tax_amount: '',
    extra_plates_amount: '',
    total_amount: '',
    advance_paid: '',
    balance_amount: '',
    
    // Payment Details
    payment_mode: '',
    payment_mode_other: '',
    
    // Additional Details
    btr: '',
    remarks: '',
    
    // Status
    status: 'confirmed'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when booking changes
  React.useEffect(() => {
    if (booking) {
      setFormData({
        // Basic Details
        serial_no: booking.serial_no || '',
        unit: booking.unit || 'UNIT-2',
        
        // Client Details
        client_name: booking.client_name || '',
        client_address: booking.client_address || '',
        contact_number: booking.contact_number || '',
        booking_date: booking.booking_date || new Date().toISOString().split('T')[0],
        
        // Event Details - Map both old and new field names
        date_of_function: booking.date_of_function || booking.event_date || '',
        occasion: booking.occasion || 'Wedding',
        custom_occasion_details: booking.custom_occasion_details || '',
        hall: booking.hall || 'Ground',
        meal_type: booking.meal_type || booking.slot || 'Dinner',
        timings_from: booking.timings_from || '',
        timings_to: booking.timings_to || '',
        pax: booking.pax?.toString() || '',
        
        // Menu & Preferences - Map both old and new field names
        menu: booking.menu || booking.menu_preference || 'Veg Silver',
        onion_preference: booking.onion_preference || 'Yes',
        garlic_preference: booking.garlic_preference || 'Yes',
        
        // Services
        flower_decoration: booking.flower_decoration || 'Basic',
        custom_flower_details: booking.custom_flower_details || '',
        dj_service: booking.dj_service || false,
        liquor_service: booking.liquor_service || false,
        theme: booking.theme || '',
        
        // Financial Details - Map both old and new field names
        gross_amount: booking.gross_amount?.toString() || '',
        tax_amount: booking.tax_amount?.toString() || booking.gst_amount?.toString() || '',
        extra_plates_amount: booking.extra_plates_amount?.toString() || booking.extras_amount?.toString() || '',
        total_amount: booking.total_amount?.toString() || booking.net_amount?.toString() || '',
        advance_paid: booking.advance_paid?.toString() || '',
        balance_amount: booking.balance_amount?.toString() || '',
        
        // Payment Details
        payment_mode: booking.payment_mode || '',
        payment_mode_other: booking.payment_mode_other || '',
        
        // Additional Details
        btr: booking.btr || '',
        remarks: booking.remarks || '',
        
        // Status
        status: booking.status || 'pending'
      });
    }
  }, [booking]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Calculate amounts immediately when relevant fields change
      if (['gross_amount', 'tax_amount', 'extra_plates_amount', 'advance_paid'].includes(field)) {
        const gross = parseFloat(newData.gross_amount) || 0;
        const tax = parseFloat(newData.tax_amount) || 0;
        const extraPlates = parseFloat(newData.extra_plates_amount) || 0;
        const advance = parseFloat(newData.advance_paid) || 0;
        
        const total = gross + tax + extraPlates;
        const balance = total - advance;
        
        return {
          ...newData,
          total_amount: total.toFixed(2),
          balance_amount: balance.toFixed(2)
        };
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  const { user } = useAuth();

  const submitForm = async () => {
    if (!booking || !formData.client_name || !formData.date_of_function) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const bookingData = {
        serial_no: formData.serial_no,
        unit: formData.unit,
        client_name: formData.client_name,
        client_address: formData.client_address,
        contact_number: formData.contact_number,
        booking_date: formData.booking_date,
        event_date: formData.date_of_function, // Map to old field for compatibility
        date_of_function: formData.date_of_function,
        occasion: formData.occasion,
        custom_occasion_details: formData.custom_occasion_details,
        hall: formData.hall,
        meal_type: formData.meal_type,
        timings_from: formData.timings_from,
        timings_to: formData.timings_to,
        pax: parseInt(formData.pax) || 0,
        menu: formData.menu,
        onion_preference: formData.onion_preference,
        garlic_preference: formData.garlic_preference,
        flower_decoration: formData.flower_decoration,
        custom_flower_details: formData.custom_flower_details,
        dj_service: formData.dj_service,
        liquor_service: formData.liquor_service,
        theme: formData.theme,
        gross_amount: parseFloat(formData.gross_amount) || 0,
        tax_amount: parseFloat(formData.tax_amount) || 0,
        extra_plates_amount: parseFloat(formData.extra_plates_amount) || 0,
        total_amount: parseFloat(formData.total_amount) || 0,
        advance_paid: parseFloat(formData.advance_paid) || 0,
        balance_amount: parseFloat(formData.balance_amount) || 0,
        payment_mode: formData.payment_mode,
        payment_mode_other: formData.payment_mode_other,
        btr: formData.btr,
        remarks: formData.remarks,
        status: formData.status
      };

      // Validate booking data before submission
      if (isNaN(bookingData.tax_amount) || bookingData.tax_amount < 0) {
        console.error('Invalid tax_amount value:', formData.tax_amount);
        toast.error('Invalid tax amount');
        return;
      }

      if (isNaN(bookingData.advance_paid) || bookingData.advance_paid < 0) {
        console.error('Invalid advance_paid value:', formData.advance_paid);
        toast.error('Invalid advance payment amount');
        return;
      }

      if (isNaN(bookingData.total_amount) || bookingData.total_amount < 0) {
        console.error('Invalid total_amount value:', formData.total_amount);
        toast.error('Invalid total amount');
        return;
      }

      // Ensure balance is calculated correctly
      const calculatedBalance = bookingData.total_amount - bookingData.advance_paid;
      if (Math.abs(bookingData.balance_amount - calculatedBalance) > 0.01) {
        console.warn('Balance amount mismatch, correcting:', bookingData.balance_amount, '->', calculatedBalance);
        bookingData.balance_amount = calculatedBalance;
      }

      console.log('Submitting booking data:', bookingData);

      const { error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('booking_id', booking.booking_id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('Booking updated successfully!');
      onClose();
      onBookingUpdated();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Booking - {booking.serial_no}</DialogTitle>
          <DialogDescription>
            Update booking details
          </DialogDescription>
        </DialogHeader>

        <form id="edit-booking-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Client Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Client Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                value={formData.client_address}
                onChange={(e) => handleInputChange('client_address', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                rows={2}
                placeholder="Enter client address"
              />
            </div>
          </div>

          {/* Basic Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Basic Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Serial No.
                </label>
                <input
                  type="text"
                  value={formData.serial_no}
                  onChange={(e) => handleInputChange('serial_no', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="O1, O2, etc."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Unit
                </label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Event Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.date_of_function}
                  onChange={(e) => handleInputChange('date_of_function', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Occasion
                </label>
                <Select value={formData.occasion} onValueChange={(value) => handleInputChange('occasion', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCASIONS.map((occasion) => (
                      <SelectItem key={occasion.value} value={occasion.value}>
                        {occasion.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.occasion === 'Other' && (
                  <div className="mt-2">
                    <label className="text-sm font-medium text-foreground">Custom Occasion Details</label>
                    <input
                      type="text"
                      value={formData.custom_occasion_details}
                      onChange={(e) => handleInputChange('custom_occasion_details', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="Enter custom occasion details"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Hall
                </label>
                <Select value={formData.hall} onValueChange={(value) => handleInputChange('hall', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select hall" />
                  </SelectTrigger>
                  <SelectContent>
                    {HALLS.map((hall) => (
                      <SelectItem key={hall.value} value={hall.value}>
                        {hall.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Meal Type
                </label>
                <Select value={formData.meal_type} onValueChange={(value) => handleInputChange('meal_type', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((meal) => (
                      <SelectItem key={meal.value} value={meal.value}>
                        {meal.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Timings From
                </label>
                <input
                  type="time"
                  value={formData.timings_from}
                  onChange={(e) => handleInputChange('timings_from', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Timings To
                </label>
                <input
                  type="time"
                  value={formData.timings_to}
                  onChange={(e) => handleInputChange('timings_to', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Pax (Number of Guests)
                </label>
                <input
                  type="number"
                  value={formData.pax}
                  onChange={(e) => handleInputChange('pax', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter number of guests"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Menu & Preferences */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Menu & Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Menu
                </label>
                <Select value={formData.menu} onValueChange={(value) => handleInputChange('menu', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select menu" />
                  </SelectTrigger>
                  <SelectContent>
                    {MENU_OPTIONS.map((menu) => (
                      <SelectItem key={menu.value} value={menu.value}>
                        {menu.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Onion Preference
                </label>
                <Select value={formData.onion_preference} onValueChange={(value) => handleInputChange('onion_preference', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {ONION_PREFERENCES.map((pref) => (
                      <SelectItem key={pref.value} value={pref.value}>
                        {pref.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Garlic Preference
                </label>
                <Select value={formData.garlic_preference} onValueChange={(value) => handleInputChange('garlic_preference', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {GARLIC_PREFERENCES.map((pref) => (
                      <SelectItem key={pref.value} value={pref.value}>
                        {pref.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div>
                <label className="text-sm font-medium text-foreground">
                  Theme
                </label>
                <input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter theme"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>

          {/* Financial Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground text-red-600">Financial Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  Tax Amount
                </label>
                <input
                  type="number"
                  value={formData.tax_amount}
                  onChange={(e) => handleInputChange('tax_amount', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Extra Plates
                </label>
                <input
                  type="number"
                  value={formData.extra_plates_amount}
                  onChange={(e) => handleInputChange('extra_plates_amount', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter extra plates amount"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Total Amount
                </label>
                <input
                  type="number"
                  value={formData.total_amount}
                  readOnly
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm bg-muted"
                  placeholder="Auto calculated"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Advance Paid
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

              <div>
                <label className="text-sm font-medium text-foreground">
                  Balance Amount
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
          </div>

          {/* Additional Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Additional Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  BTR
                </label>
                <textarea
                  value={formData.btr}
                  onChange={(e) => handleInputChange('btr', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                  rows={3}
                  placeholder="Enter BTR details"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                  rows={3}
                  placeholder="Enter remarks"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Status</h3>
            <div>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="w-full">
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
              <>
                <Pencil className="w-4 h-4 mr-2" />
                Update Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Print Function
const printBooking = (booking: Booking, partPayments: any[]) => {
  const bookingPartPayments = partPayments.filter(p => p.booking_id === booking.booking_id);
  const totalPartPayments = bookingPartPayments.reduce((sum, p) => sum + p.amount, 0);
  const actualBalance = booking.total_amount - booking.advance_paid - totalPartPayments;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ROUGH ESTIMATE - ${booking.serial_no}</title>
      <style>
        @media print {
          body { margin: 0; padding: 10px; }
          .no-print { display: none !important; }
          .action-buttons { display: none !important; }
          .btn { display: none !important; }
          .page-break { page-break-inside: avoid; }
          * { page-break-inside: avoid; }
          .estimate-content { page-break-inside: avoid; }
        }
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 10px; 
          font-size: 12px;
          line-height: 1.3;
        }
        .header { 
          text-align: center; 
          margin-bottom: 10px; 
          border: 1px solid #000;
          padding: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .title { 
          font-size: 16px; 
          font-weight: bold; 
          text-transform: uppercase;
          border: 1px solid #000;
          padding: 4px 12px;
        }
        .unit { 
          font-size: 14px; 
          font-weight: bold;
          border: 1px solid #000;
          padding: 5px 10px;
        }
        .booking-number {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }
        .booking-number input {
          border: none;
          border-bottom: 1px dotted #000;
          width: 60px;
          text-align: center;
          font-weight: bold;
        }
        .main-section {
          border: 1px solid #000;
          padding: 10px;
          margin-bottom: 10px;
        }
        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .field-group {
          margin-bottom: 8px;
        }
        .field-row {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
          gap: 8px;
        }
        .field-label {
          font-weight: bold;
          min-width: 75px;
          font-size: 11px;
        }
        .field-input {
          border: none;
          border-bottom: 1px dotted #000;
          flex: 1;
          padding: 2px 5px;
          font-size: 12px;
        }
        .field-value {
          border-bottom: 1px dotted #000;
          flex: 1;
          padding: 2px 5px;
          font-size: 12px;
          min-height: 16px;
        }
        .btr-remarks {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 10px 0;
        }
        .btr-box, .remarks-box {
          border: 1px solid #000;
          padding: 8px;
          min-height: 50px;
          position: relative;
        }
        .btr-box::before {
          content: "BTR";
          position: absolute;
          top: 5px;
          left: 5px;
          font-weight: bold;
          font-size: 11px;
        }
        .remarks-box::before {
          content: "REMARKS";
          position: absolute;
          top: 5px;
          left: 5px;
          font-weight: bold;
          font-size: 11px;
        }
        .terms-section {
          border: 1px solid #000;
          padding: 8px;
          margin: 8px 0;
        }
        .terms-title {
          font-weight: bold;
          margin-bottom: 6px;
          text-transform: uppercase;
          font-size: 11px;
        }
        .terms-list {
          list-style: decimal;
          padding-left: 18px;
          margin: 0;
        }
        .terms-list li {
          margin-bottom: 3px;
          font-size: 10px;
          line-height: 1.2;
        }
        .payment-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 10px;
        }
        .financial-details {
          border: 1px solid #000;
          padding: 8px;
        }
        .financial-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 11px;
        }
        .payment-schedule {
          border: 1px solid #000;
          padding: 8px;
        }
        .schedule-title {
          font-weight: bold;
          margin-bottom: 6px;
          text-transform: uppercase;
          font-size: 11px;
        }
        .schedule-list {
          list-style: decimal;
          padding-left: 18px;
          margin: 0;
        }
        .schedule-list li {
          margin-bottom: 3px;
          font-size: 10px;
          line-height: 1.2;
        }
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          font-size: 11px;
          font-weight: bold;
        }
        .action-buttons { 
          position: fixed; 
          top: 20px; 
          right: 20px; 
          display: flex; 
          gap: 10px; 
        }
        .btn { 
          padding: 10px 20px; 
          border: none; 
          border-radius: 5px; 
          cursor: pointer; 
          font-size: 14px; 
          font-weight: 500; 
          text-decoration: none; 
          display: inline-flex; 
          align-items: center; 
          gap: 5px; 
        }
        .btn-print { 
          background: #059669; 
          color: white; 
        }
        .btn-print:hover { 
          background: #047857; 
        }
        .btn-secondary { 
          background: #6b7280; 
          color: white; 
        }
        .btn-secondary:hover { 
          background: #4b5563; 
        }
      </style>
    </head>
    <body>
      <div class="action-buttons no-print">
        <button class="btn btn-print" onclick="window.print()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 6,2 18,2 18,9"></polyline>
            <path d="M6,18H4a2,2 0 0,1-2-2V11a2,2 0 0,1,2-2H20a2,2 0 0,1,2,2v5a2,2 0 0,1,2,2h-2"></path>
            <polyline points="6,14 6,22 18,22 18,14"></polyline>
          </svg>
          Print Estimate
        </button>
        <button class="btn btn-secondary" onclick="window.close()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Close Window
        </button>
      </div>
      
      <div class="estimate-content">
      <div class="header">
        <div class="title">ROUGH ESTIMATE</div>
        <div class="unit">UNIT-2</div>
      </div>

      <div class="booking-number">
        <span>No.</span>
        <input type="text" value="${booking.serial_no}" readonly>
      </div>

      <div class="main-section">
        <div class="two-column">
          <div>
            <div class="field-group">
              <div class="field-row">
                <span class="field-label">Name</span>
                <div class="field-value">${booking.client_name}</div>
              </div>
              <div class="field-row">
                <span class="field-label">Address</span>
                <div class="field-value">${booking.client_address || 'N/A'}</div>
              </div>
              <div class="field-row">
                <span class="field-label">Contact No.</span>
                <div class="field-value">${booking.contact_number || 'N/A'}</div>
              </div>
              <div class="field-row">
                <span class="field-label">Menu</span>
                <div class="field-value">${booking.menu || 'N/A'}</div>
              </div>
              <div class="field-row">
                <span class="field-label">Pax</span>
                <div class="field-value">${booking.pax || 'N/A'}</div>
                <span class="field-label">Hall</span>
                <div class="field-value">${booking.hall || 'N/A'}</div>
              </div>
              <div class="field-row">
                <span class="field-label">Tax</span>
                <div class="field-value">₹${booking.tax_amount || 0}</div>
                <span class="field-label">Flower Decor</span>
                <div class="field-value">${booking.flower_decoration || 'N/A'}</div>
              </div>
              <div class="field-row">
                <span class="field-label">Liquor Services</span>
                <div class="field-value">${booking.liquor_service ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
          
          <div>
            <div class="field-group">
              <div class="field-row">
                <span class="field-label">D.O.F.</span>
                <div class="field-value">${formatDate(booking.date_of_function)}</div>
              </div>
              <div class="field-row">
                <span class="field-label">Occasion</span>
                <div class="field-value">${booking.occasion || 'N/A'}</div>
              </div>
              <div class="field-row">
                <span class="field-label">D.O.B.</span>
                <div class="field-value">${formatDate(booking.booking_date)}</div>
              </div>
              <div class="field-row">
                <span class="field-label">Onion</span>
                <div class="field-value">${booking.onion_preference || 'N/A'}</div>
                <span class="field-label">Garlic</span>
                <div class="field-value">${booking.garlic_preference || 'N/A'}</div>
              </div>
              <div class="field-row">
                <span class="field-label">Lunch / Dinner</span>
                <div class="field-value">${booking.meal_type || 'N/A'}</div>
                <span class="field-label">Timings</span>
                <div class="field-value">${booking.timings_from || 'N/A'} - ${booking.timings_to || 'N/A'}</div>
              </div>
              <div class="field-row">
                <span class="field-label">D.J.</span>
                <div class="field-value">${booking.dj_service ? 'Yes' : 'No'}</div>
                <span class="field-label">Theme</span>
                <div class="field-value">${booking.theme || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="btr-remarks">
        <div class="btr-box"></div>
        <div class="remarks-box"></div>
      </div>

      <div class="terms-section">
        <div class="terms-title">TERMS & CONDITIONS:-</div>
        <ol class="terms-list">
          <li>Extra plates will be charged at the time of placing the plates and will not be postponed.</li>
          <li>Management will not be responsible for any loss of valuables, belongings and theft.</li>
          <li>Booking once made shall not be cancelled and advance shall not be refunded in any case.</li>
          <li>Alcoholic beverages are not permitted inside the premises without liquor license.</li>
          <li>Drum beating (Dhol) & crackers inside the premises are not allowed.</li>
          <li>More than one person will not be allowed in one plate otherwise empty plates will be removed from the service table without any intimation.</li>
          <li>Carrying of fire arms and ammunition is not allowed in the hall.</li>
          <li>Valet car parking at owner's risk, banquet management will not be responsible for any loss, damage or theft.</li>
          <li>No compensation allowed in case of any break down of electricity / AC / Generators etc.</li>
          <li>A.C. plant will be shut down by 04:00 p.m. for lunch function & 12:00 mid night for dinner function.</li>
          <li>D.J. will be closed by 03:00 p.m. for lunch & 10:00 p.m. for dinner function.</li>
          <li>D.J. chaat, flower decoration and balloon decoration is not allowed from outside.</li>
          <li>Rights of admission are reserved, dispute are subject to Delhi Jurisdiction.</li>
          <li>GST AS PER APPLICABLE</li>
        </ol>
      </div>

      <div class="payment-section">
        <div class="financial-details">
          <div class="financial-row">
            <span>DATE OF BOOKING</span>
            <span>${formatDate(booking.booking_date)}</span>
          </div>
          <div class="financial-row">
            <span>EXTRA PLATES</span>
            <span>₹${booking.extra_plates_amount || 0}</span>
          </div>
          <div class="financial-row">
            <span>AMOUNT</span>
            <span>₹${booking.gross_amount || 0}</span>
          </div>
          <div class="financial-row">
            <span>TAX</span>
            <span>₹${booking.tax_amount || 0}</span>
          </div>
          <div class="financial-row">
            <span>TOTAL</span>
            <span>₹${booking.total_amount || 0}</span>
          </div>
          <div class="financial-row">
            <span>ADVANCE</span>
            <span>₹${booking.advance_paid || 0}</span>
          </div>
          ${booking.advance_paid > 0 && booking.payment_mode ? `
          <div class="financial-row">
            <span>PAYMENT MODE</span>
            <span>${booking.payment_mode === 'other' ? (booking.payment_mode_other || 'Other') : booking.payment_mode.toUpperCase()}</span>
          </div>
          ` : ''}
          <div class="financial-row">
            <span>BALANCE</span>
            <span>₹${actualBalance}</span>
          </div>
        </div>
        
        <div class="payment-schedule">
          <div class="financial-row">
            <span>DATE OF FUNCTION</span>
            <span>${formatDate(booking.date_of_function)}</span>
          </div>
          <div class="schedule-title">PAYMENT SCHEDULE</div>
          <ol class="schedule-list">
            <li>25% AT THE TIME OF BOOKING</li>
            <li>25% ONE MONTH BEFORE THE FUNCTION DATE</li>
            <li>50% ONE WEEK BEFORE THE FUNCTION DATE</li>
          </ol>
        </div>
      </div>

      <div class="signature-section">
        <div>HOST SIGNATURE</div>
        <div>MANAGER</div>
      </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
};

// Add Booking Form Component
const AddBookingForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onBookingAdded: () => void;
}> = ({ isOpen, onClose, onBookingAdded }) => {
  const [formData, setFormData] = useState({
    // Basic Details
    serial_no: '',
    unit: 'UNIT-2',
    
    // Client Details
    client_name: '',
    client_address: '',
    contact_number: '',
    booking_date: new Date().toISOString().split('T')[0],
    
    // Event Details
    date_of_function: '',
    occasion: 'Wedding',
    custom_occasion_details: '',
    hall: 'Main Hall',
    meal_type: 'Dinner',
    timings_from: '',
    timings_to: '',
    pax: '',
    
    // Menu & Preferences
    menu: 'Veg Silver',
    onion_preference: 'Yes',
    garlic_preference: 'Yes',
    
    // Services
    flower_decoration: 'Basic',
    custom_flower_details: '',
    dj_service: false,
    liquor_service: false,
    theme: '',
    
    // Financial Details
    gross_amount: '',
    tax_amount: '',
    extra_plates_amount: '',
    total_amount: '',
    advance_paid: '',
    balance_amount: '',
    
    // Payment Details
    payment_mode: '',
    payment_mode_other: '',
    
    // Additional Details
    btr: '',
    remarks: '',
    
    // Status
    status: 'confirmed'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate serial number and set booking date when form opens
  React.useEffect(() => {
    if (isOpen) {
      const generateSerial = async () => {
        try {
          const nextSerial = await generateSequentialSerialNumber(formData.unit);
          setFormData(prev => ({ 
            ...prev, 
            serial_no: nextSerial,
            booking_date: new Date().toISOString().split('T')[0]
          }));
        } catch (error) {
          console.error('Error generating serial number:', error);
          // Fallback to random number
          const randomNum = Math.floor(Math.random() * 999) + 1;
          setFormData(prev => ({ 
            ...prev, 
            serial_no: `O${randomNum}`,
            booking_date: new Date().toISOString().split('T')[0]
          }));
        }
      };
      generateSerial();
    }
  }, [isOpen, formData.unit]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Calculate amounts immediately when relevant fields change
      if (['gross_amount', 'tax_amount', 'extra_plates_amount', 'advance_paid'].includes(field)) {
        const gross = parseFloat(newData.gross_amount) || 0;
        const tax = parseFloat(newData.tax_amount) || 0;
        const extraPlates = parseFloat(newData.extra_plates_amount) || 0;
        const advance = parseFloat(newData.advance_paid) || 0;
        
        const total = gross + tax + extraPlates;
        const balance = total - advance;
        
        return {
          ...newData,
          total_amount: total.toFixed(2),
          balance_amount: balance.toFixed(2)
        };
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  const { user } = useAuth();

  const submitForm = async () => {
    if (!formData.client_name || !formData.date_of_function) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine status based on user permissions
      const status = 'confirmed';
      
      const bookingData = {
        serial_no: formData.serial_no,
        unit: formData.unit,
        client_name: formData.client_name,
        client_address: formData.client_address,
        contact_number: formData.contact_number,
        booking_date: formData.booking_date,
        event_date: formData.date_of_function, // Map to old field for compatibility
        date_of_function: formData.date_of_function,
        occasion: formData.occasion,
        custom_occasion_details: formData.custom_occasion_details,
        hall: formData.hall,
        meal_type: formData.meal_type,
        timings_from: formData.timings_from,
        timings_to: formData.timings_to,
        pax: parseInt(formData.pax) || 0,
        menu: formData.menu,
        onion_preference: formData.onion_preference,
        garlic_preference: formData.garlic_preference,
        flower_decoration: formData.flower_decoration,
        custom_flower_details: formData.custom_flower_details,
        dj_service: formData.dj_service,
        liquor_service: formData.liquor_service,
        theme: formData.theme,
        gross_amount: parseFloat(formData.gross_amount) || 0,
        tax_amount: parseFloat(formData.tax_amount) || 0,
        extra_plates_amount: parseFloat(formData.extra_plates_amount) || 0,
        total_amount: parseFloat(formData.total_amount) || 0,
        advance_paid: parseFloat(formData.advance_paid) || 0,
        balance_amount: parseFloat(formData.balance_amount) || 0,
        payment_mode: formData.payment_mode,
        payment_mode_other: formData.payment_mode_other,
        btr: formData.btr,
        remarks: formData.remarks,
        status: status,
        booking_date: new Date().toISOString().split('T')[0]
      };

      // Validate booking data before submission
      if (isNaN(bookingData.tax_amount) || bookingData.tax_amount < 0) {
        console.error('Invalid tax_amount value:', formData.tax_amount);
        toast.error('Invalid tax amount');
        return;
      }

      if (isNaN(bookingData.advance_paid) || bookingData.advance_paid < 0) {
        console.error('Invalid advance_paid value:', formData.advance_paid);
        toast.error('Invalid advance payment amount');
        return;
      }

      if (isNaN(bookingData.total_amount) || bookingData.total_amount < 0) {
        console.error('Invalid total_amount value:', formData.total_amount);
        toast.error('Invalid total amount');
        return;
      }

      // Ensure balance is calculated correctly
      const calculatedBalance = bookingData.total_amount - bookingData.advance_paid;
      if (Math.abs(bookingData.balance_amount - calculatedBalance) > 0.01) {
        console.warn('Balance amount mismatch, correcting:', bookingData.balance_amount, '->', calculatedBalance);
        bookingData.balance_amount = calculatedBalance;
      }

      console.log('Submitting booking data:', bookingData);

      // Check if user requires approval
      if (user && requiresApproval(user.access_code as any)) {
        // Submit to pending approvals
        await createPendingApproval({
          admin_id: user.admin_id,
          action_type: 'booking',
          action_data: bookingData,
          status: 'confirmed'
        });

        toast.success('Booking submitted for approval!');
        
        // Trigger manual refresh since real-time might not work for pending approvals
        console.log('Triggering manual refresh after pending approval creation');
        onBookingAdded();
        
        // Also trigger a broadcast for other components
        supabase.channel('manual-refresh').send({
          type: 'broadcast',
          event: 'booking-added',
          payload: { booking: bookingData }
        });
        
        setFormData({
          serial_no: '',
          unit: 'UNIT-2',
          client_name: '',
          client_address: '',
          contact_number: '',
          booking_date: new Date().toISOString().split('T')[0],
          date_of_function: '',
          occasion: 'Wedding',
          custom_occasion_details: '',
          hall: 'Ground',
          meal_type: 'Dinner',
          timings_from: '',
          timings_to: '',
          pax: '',
          menu: 'Veg Silver',
          onion_preference: 'Yes',
          garlic_preference: 'Yes',
          flower_decoration: 'Basic',
          custom_flower_details: '',
          dj_service: false,
          liquor_service: false,
          theme: '',
          gross_amount: '',
          tax_amount: '',
          extra_plates_amount: '',
          total_amount: '',
          advance_paid: '',
          balance_amount: '',
          payment_mode: '',
          payment_mode_other: '',
          btr: '',
          remarks: '',
          status: 'confirmed'
        });
        onClose();
        return;
      }

      // Direct submission for admin users
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('Booking added successfully!');
      setFormData({
        serial_no: '',
        unit: 'UNIT-2',
        client_name: '',
        client_address: '',
        contact_number: '',
        booking_date: new Date().toISOString().split('T')[0],
        date_of_function: '',
        occasion: 'Wedding',
        custom_occasion_details: '',
        hall: 'Ground',
        meal_type: 'Dinner',
        timings_from: '',
        timings_to: '',
        pax: '',
        menu: 'Veg Silver',
        onion_preference: 'Yes',
        garlic_preference: 'Yes',
        flower_decoration: 'Basic',
        custom_flower_details: '',
        dj_service: false,
        liquor_service: false,
        theme: '',
        gross_amount: '',
        tax_amount: '',
        extra_plates_amount: '',
        total_amount: '',
        advance_paid: '',
        balance_amount: '',
        payment_mode: '',
        payment_mode_other: '',
        btr: '',
        remarks: '',
        status: 'confirmed'
      });
      onClose();
      // Don't call onBookingAdded here since real-time will handle it
    } catch (error) {
      console.error('Error adding booking:', error);
      toast.error('Failed to add booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create New Booking</DialogTitle>
          <DialogDescription>
            Enter details for a new event booking
          </DialogDescription>
        </DialogHeader>

        <form id="add-booking-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-foreground">Serial No.</label>
              <input
                type="text"
                value={formData.serial_no}
                readOnly
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm bg-muted cursor-not-allowed"
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Unit</label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNIT-1">UNIT-1</SelectItem>
                  <SelectItem value="UNIT-2">UNIT-2</SelectItem>
                  <SelectItem value="UNIT-3">UNIT-3</SelectItem>
                  <SelectItem value="UNIT-4">UNIT-4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Date of Function *</label>
              <input
                type="date"
                value={formData.date_of_function}
                onChange={(e) => handleInputChange('date_of_function', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                required
              />
            </div>
          </div>

          {/* Client Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Client Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Name *</label>
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
                <label className="text-sm font-medium text-foreground">Contact No.</label>
                <input
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => handleInputChange('contact_number', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter contact number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Address</label>
                <input
                  type="text"
                  value={formData.client_address}
                  onChange={(e) => handleInputChange('client_address', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter address"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Date of Booking</label>
                <input
                  type="date"
                  value={formData.booking_date}
                  readOnly
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                  title="Booking date is automatically set to today's date"
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Occasion</label>
                <Select value={formData.occasion} onValueChange={(value) => handleInputChange('occasion', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wedding">Wedding</SelectItem>
                    <SelectItem value="Birthday">Birthday</SelectItem>
                    <SelectItem value="Anniversary">Anniversary</SelectItem>
                    <SelectItem value="Corporate Event">Corporate Event</SelectItem>
                    <SelectItem value="Engagement">Engagement</SelectItem>
                    <SelectItem value="Reception">Reception</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formData.occasion === 'Other' && (
                  <div className="mt-2">
                    <label className="text-sm font-medium text-foreground">Custom Occasion Details</label>
                    <input
                      type="text"
                      value={formData.custom_occasion_details}
                      onChange={(e) => handleInputChange('custom_occasion_details', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="Enter custom occasion details"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Hall</label>
                <Select value={formData.hall} onValueChange={(value) => handleInputChange('hall', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select hall" />
                  </SelectTrigger>
                  <SelectContent>
                    {HALLS.map((hall) => (
                      <SelectItem key={hall.value} value={hall.value}>
                        {hall.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Lunch / Dinner</label>
                <Select value={formData.meal_type} onValueChange={(value) => handleInputChange('meal_type', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lunch">Lunch</SelectItem>
                    <SelectItem value="Dinner">Dinner</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Timings From</label>
                <input
                  type="time"
                  value={formData.timings_from}
                  onChange={(e) => handleInputChange('timings_from', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Timings To</label>
                <input
                  type="time"
                  value={formData.timings_to}
                  onChange={(e) => handleInputChange('timings_to', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Pax (Number of Guests)</label>
                <input
                  type="number"
                  value={formData.pax}
                  onChange={(e) => handleInputChange('pax', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter number of guests"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Menu & Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Menu & Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Menu</label>
                <Select value={formData.menu} onValueChange={(value) => handleInputChange('menu', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select menu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Veg Silver">Veg Silver</SelectItem>
                    <SelectItem value="Non-Veg Silver">Non-Veg Silver</SelectItem>
                    <SelectItem value="Veg Gold">Veg Gold</SelectItem>
                    <SelectItem value="Non-Veg Gold">Non-Veg Gold</SelectItem>
                    <SelectItem value="Veg Platinum">Veg Platinum</SelectItem>
                    <SelectItem value="Non-Veg Platinum">Non-Veg Platinum</SelectItem>
                    <SelectItem value="Custom Menu">Custom Menu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Onion</label>
                <Select value={formData.onion_preference} onValueChange={(value) => handleInputChange('onion_preference', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Optional">Optional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Garlic</label>
                <Select value={formData.garlic_preference} onValueChange={(value) => handleInputChange('garlic_preference', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Optional">Optional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Flower Decor</label>
                <Select value={formData.flower_decoration} onValueChange={(value) => handleInputChange('flower_decoration', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select decoration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Luxury">Luxury</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                    <SelectItem value="None">None</SelectItem>
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
              <div>
                <label className="text-sm font-medium text-foreground">Theme</label>
                <input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter theme"
                />
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.dj_service}
                  onChange={(e) => handleInputChange('dj_service', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">D.J.</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.liquor_service}
                  onChange={(e) => handleInputChange('liquor_service', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Liquor Services</span>
              </label>
            </div>
          </div>

          {/* Financial Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Financial Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Amount</label>
                <input
                  type="number"
                  value={formData.gross_amount}
                  onChange={(e) => handleInputChange('gross_amount', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Tax Amount</label>
                <input
                  type="number"
                  value={formData.tax_amount}
                  onChange={(e) => handleInputChange('tax_amount', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Extra Plates</label>
                <input
                  type="number"
                  value={formData.extra_plates_amount}
                  onChange={(e) => handleInputChange('extra_plates_amount', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Total</label>
                <input
                  type="number"
                  value={formData.total_amount}
                  readOnly
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm bg-gray-50"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Advance</label>
                  <input
                    type="number"
                    value={formData.advance_paid}
                    onChange={(e) => handleInputChange('advance_paid', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    placeholder="0.00"
                    step="0.01"
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
              <div>
                <label className="text-sm font-medium text-foreground">Balance</label>
                <input
                  type="number"
                  value={formData.balance_amount}
                  readOnly
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm bg-gray-50"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">BTR</label>
                <textarea
                  value={formData.btr}
                  onChange={(e) => handleInputChange('btr', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                  rows={3}
                  placeholder="Enter BTR details"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                  rows={3}
                  placeholder="Enter remarks"
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
                Add Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Mobile Booking Card Component
const MobileBookingCard: React.FC<{
  booking: Booking;
  actualBalance: number;
  isSelected: boolean;
  onSelect: (bookingId: number, checked: boolean) => void;
  onView: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
  onPrint: (booking: Booking) => void;
  onDelete: (booking: Booking, e?: React.MouseEvent) => void;
  onStatusChange: (bookingId: number, newStatus: string) => void;
  updatingStatus: string | null;
  index: number;
}> = ({ booking, actualBalance, isSelected, onSelect, onView, onEdit, onPrint, onDelete, onStatusChange, updatingStatus, index }) => {
  const { checkPermission } = useAuth();
  const canViewFinancialData = checkPermission('canViewFinancialData');
  const canEditBookings = checkPermission('canEditBookings');
  const canApproveActions = checkPermission('canApproveActions');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card border border-border rounded-lg p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
              onChange={(e) => onSelect(booking.booking_id as number, e.target.checked)}
              className="w-4 h-4 rounded border-border focus:ring-primary"
          />
          <div>
            <h3 className="font-semibold text-foreground">{booking.client_name}</h3>
            <p className="text-sm text-muted-foreground">{booking.serial_no}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {booking.is_pending && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Clock className="w-3 h-3 mr-1" />
              Pending
            </span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusStyle(booking.status)}`}>
            {getBookingStatusText(booking.status)}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-muted-foreground">Event Date</div>
          <div className="font-medium">{formatDate(booking.date_of_function)}</div>
          </div>
          <div>
          <div className="text-muted-foreground">Meal Type</div>
          <div className="font-medium">{booking.meal_type}</div>
          </div>
        {canViewFinancialData && (
          <>
            <div>
              <div className="text-muted-foreground">Total Amount</div>
              <div className="font-medium">{formatIndianCurrency(booking.total_amount)}</div>
      </div>
            <div>
              <div className="text-muted-foreground">Balance</div>
              <div className={`font-medium ${actualBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatIndianCurrency(actualBalance)}
        </div>
        </div>
          </>
        )}
        </div>
        
      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(booking)}
            className="h-8 px-2 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          {canEditBookings && !booking.is_pending && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(booking)}
            className="h-8 px-2 text-xs"
          >
            <Pencil className="w-3 h-3 mr-1" />
            Edit
          </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPrint(booking)}
            className="h-8 px-2 text-xs"
          >
            <Printer className="w-3 h-3 mr-1" />
            Print
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          {canApproveActions && booking.is_pending && (
            <Button
              size="sm"
              onClick={() => onStatusChange(booking.booking_id as number, 'confirmed')}
              disabled={updatingStatus === booking.booking_id.toString()}
              className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
            >
              {updatingStatus === booking.booking_id.toString() ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : null}
              Approve
            </Button>
          )}
          {canEditBookings && !booking.is_pending && (
                     <Button
             variant="ghost"
             size="sm"
             onClick={(e) => onDelete(booking, e)}
              className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
           >
              <Trash2 className="w-3 h-3" />
           </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Main Booking Table Component
interface BookingTableProps {
  bookings: Booking[];
  partPayments?: any[]; // Add part payments data
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (bookingId: number, newStatus: string) => void;
  onBookingView: (booking: Booking) => void;
  onBookingEdit: (booking: Booking) => void;
  onBookingPrint: (booking: Booking) => void;
  onBookingDelete: (booking: Booking) => void;
  updatingStatus: string | null;
  onBookingTypeChange: (value: string) => void;
  selectedBookingType: string;
  sortConfig: any;
  requestSort: (key: keyof Booking) => void;
  onBookingAdded?: () => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  partPayments = [], // Default to empty array
  searchQuery,
  onSearchChange,
  onStatusChange,
  onBookingView,
  onBookingEdit,
  onBookingPrint,
  onBookingDelete,
  updatingStatus,
  onBookingTypeChange,
  selectedBookingType,
  sortConfig,
  requestSort,
  onBookingAdded
}) => {
  const { checkPermission } = useAuth();
  const canViewFinancialData = checkPermission('canViewFinancialData');
  const canEditBookings = checkPermission('canEditBookings');
  const canApproveActions = checkPermission('canApproveActions');
  const [selectedBookings, setSelectedBookings] = useState<(number | string)[]>([]);
  const [showAddBookingForm, setShowAddBookingForm] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [bookingDetailsModalOpen, setBookingDetailsModalOpen] = useState(false);
  const [bookingToView, setBookingToView] = useState<Booking | null>(null);
  const [editBookingFormOpen, setEditBookingFormOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);

  const handleDeleteClick = (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if this is a pending booking
    if (booking.is_pending) {
      toast.error('Cannot delete pending bookings. Please approve or reject them from the Approvals page.');
      return;
    }
    
    setBookingToDelete(booking);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (bookingToDelete) {
      try {
        await onBookingDelete(bookingToDelete);
        setDeleteDialogOpen(false);
        setBookingToDelete(null);
        toast.success('Booking deleted successfully');
      } catch (error) {
        toast.error('Failed to delete booking');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setBookingToDelete(null);
  };

  const handleViewBooking = (booking: Booking) => {
    setBookingToView(booking);
    setBookingDetailsModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setBookingToEdit(booking);
    setEditBookingFormOpen(true);
  };

  const handlePrintBooking = (booking: Booking) => {
    printBooking(booking, partPayments);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(bookings.map(b => b.booking_id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleSelectBooking = (bookingId: number | string, checked: boolean) => {
    if (checked) {
      setSelectedBookings(prev => [...prev, bookingId]);
    } else {
      setSelectedBookings(prev => prev.filter(id => id !== bookingId));
    }
  };

  const handleClearSelection = () => {
    setSelectedBookings([]);
  };

  // Helper function to calculate actual balance including part payments
  const calculateActualBalance = (booking: Booking) => {
    const bookingPartPayments = partPayments.filter(payment => 
      payment.booking_id === booking.booking_id
    );
    const totalPartPayments = bookingPartPayments.reduce((sum, payment) => 
      sum + payment.amount, 0
    );
    
    // Calculate actual balance: total_amount - advance_paid - part_payments
    const actualBalance = booking.total_amount - booking.advance_paid - totalPartPayments;
    return Math.max(0, actualBalance); // Ensure balance doesn't go negative
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">All Bookings</h2>
              <p className="text-xs md:text-sm text-muted-foreground">View and manage event bookings</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {bookings.length} total
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Status Filter */}
              <Select value={selectedBookingType} onValueChange={onBookingTypeChange}>
                <SelectTrigger className="w-full sm:w-[140px] text-xs md:text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {BOOKING_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Add Booking Button */}
              <Button
                onClick={() => setShowAddBookingForm(true)}
                className="bg-primary text-primary-foreground hover:bg-accent-vibrant-purple-darker shadow-lg shadow-primary/20 h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Add Booking
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
      {selectedBookings.length > 0 && (
        <div className="px-3 md:px-6 py-2 md:py-3 bg-muted/50 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-muted-foreground">
              {selectedBookings.length} booking(s) selected
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
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            bookings.map((booking, index) => (
              <MobileBookingCard
                key={`${booking.booking_id}-${booking.serial_no}`}
                booking={booking}
                actualBalance={calculateActualBalance(booking)}
                isSelected={selectedBookings.includes(booking.booking_id)}
                onSelect={handleSelectBooking}
                onView={handleViewBooking}
                onEdit={handleEditBooking}
                onPrint={handlePrintBooking}
                onDelete={handleDeleteClick}
                onStatusChange={onStatusChange}
                updatingStatus={updatingStatus}
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
            {bookings.map((booking) => (
              <div key={`${booking.booking_id}-${booking.serial_no}`} className="bg-card border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{booking.client_name}</div>
                    <div className="text-muted-foreground text-xs">{booking.serial_no}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusStyle(booking.status)}`}>
                    {getBookingStatusText(booking.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Date</div>
                    <div>{formatDate(booking.date_of_function)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Amount</div>
                    <div className="font-medium">{formatIndianCurrency(booking.total_amount)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Advance Paid</div>
                    <div className="font-medium">{formatIndianCurrency(booking.advance_paid)}</div>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewBooking(booking)}
                    className="h-6 px-2 text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditBooking(booking)}
                    className="h-6 px-2 text-xs"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
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
                <th className="text-left py-3 px-4 font-medium">Serial No.</th>
                <th className="text-left py-3 px-4 font-medium">Client Name</th>
                <th className="text-left py-3 px-4 font-medium">Event Date</th>
                <th className="text-left py-3 px-4 font-medium">Slot</th>
                <th className="text-left py-3 px-4 font-medium">Menu</th>
                {canViewFinancialData && (
                  <>
                <th className="text-left py-3 px-4 font-medium">Total Amount</th>
                <th className="text-left py-3 px-4 font-medium">Advance Paid</th>
                <th className="text-left py-3 px-4 font-medium">Pending Balance</th>
                  </>
                )}
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={`${booking.booking_id}-${booking.serial_no}`} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium text-sm">{booking.serial_no}</td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-sm">{booking.client_name}</div>
                      {booking.contact_number && (
                        <div className="text-xs text-muted-foreground">{booking.contact_number}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{formatDate(booking.date_of_function)}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{booking.meal_type || 'N/A'}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{booking.menu || 'N/A'}</td>
                  {canViewFinancialData && (
                    <>
                  <td className="py-3 px-4 font-medium text-sm">{formatIndianCurrency(booking.total_amount)}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{formatIndianCurrency(booking.advance_paid)}</td>
                  <td className="py-3 px-4 font-medium text-sm">{formatIndianCurrency(booking.balance_amount)}</td>
                    </>
                  )}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusStyle(booking.status)}`}>
                      {getBookingStatusText(booking.status)}
                    </span>
                      {booking.is_pending && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-2 h-2 mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrintBooking(booking)}
                        className="h-7 w-7 p-0"
                        title="Print Receipt"
                      >
                        <Printer className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewBooking(booking)}
                        className="h-7 w-7 p-0"
                        title="View Details"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      {canEditBookings && !booking.is_pending && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBooking(booking)}
                        className="h-7 w-7 p-0"
                        title="Edit Booking"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      )}
                      {canEditBookings && !booking.is_pending && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(booking, e)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        title="Delete Booking"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      )}
                      {canApproveActions && booking.is_pending && (
                        <Button
                          size="sm"
                          onClick={() => onStatusChange(booking.booking_id as number, 'confirmed')}
                          disabled={updatingStatus === booking.booking_id.toString()}
                          className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700"
                        >
                          {updatingStatus === booking.booking_id.toString() ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : null}
                          Approve
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

      {/* Add Booking Form */}
      <AddBookingForm
        isOpen={showAddBookingForm}
        onClose={() => setShowAddBookingForm(false)}
        onBookingAdded={onBookingAdded}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
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

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={bookingToView}
        isOpen={bookingDetailsModalOpen}
        onClose={() => setBookingDetailsModalOpen(false)}
        partPayments={partPayments || []}
      />

      {/* Edit Booking Form */}
      <EditBookingForm
        booking={bookingToEdit}
        isOpen={editBookingFormOpen}
        onClose={() => setEditBookingFormOpen(false)}
        onBookingUpdated={onBookingAdded || (() => {})}
      />
    </div>
  );
};

export default BookingTable;