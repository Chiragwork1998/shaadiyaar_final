import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  FileText,
  Building,
  Music,
  Wine,
  Flower,
  Save,
  Loader2,
  Users,
  Cake,
  Home,
  Clock3,
  Utensils,
  Palette,
  FileText as FileTextIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Booking } from '../../types';
import { 
  BOOKING_UNITS, 
  OCCASIONS, 
  HALLS, 
  MEAL_TYPES, 
  MENU_OPTIONS, 
  ONION_PREFERENCES, 
  GARLIC_PREFERENCES, 
  FLOWER_DECORATIONS, 
  BOOKING_STATUSES 
} from '../../utils/helpers';
import { updateBooking } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface BookingEditProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const BookingEdit: React.FC<BookingEditProps> = ({
  booking,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    // Basic Details
    serial_no: '',
    unit: 'UNIT-2',
    
    // Client Details
    client_name: '',
    client_address: '',
    contact_number: '',
    date_of_birth: '',
    
    // Event Details
    date_of_function: '',
    occasion: 'Wedding',
    hall: 'Main Hall',
    meal_type: 'Dinner',
    timings_from: '',
    timings_to: '',
    pax: '',
    
    // Menu & Preferences
    menu: 'Veg Menu',
    onion_preference: 'Yes',
    garlic_preference: 'Yes',
    
    // Services
    flower_decoration: 'Basic',
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
    
    // Additional Details
    btr: '',
    remarks: '',
    
    // Status
    status: 'confirmed'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      setFormData({
        serial_no: booking.serial_no || '',
        unit: booking.unit || 'UNIT-2',
        client_name: booking.client_name || '',
        client_address: booking.client_address || '',
        contact_number: booking.contact_number || '',
        date_of_birth: booking.date_of_birth || '',
        date_of_function: booking.date_of_function || '',
        occasion: booking.occasion || 'Wedding',
        hall: booking.hall || 'Main Hall',
        meal_type: booking.meal_type || 'Dinner',
        timings_from: booking.timings_from || '',
        timings_to: booking.timings_to || '',
        pax: booking.pax?.toString() || '',
        menu: booking.menu || 'Veg Menu',
        onion_preference: booking.onion_preference || 'Yes',
        garlic_preference: booking.garlic_preference || 'Yes',
        flower_decoration: booking.flower_decoration || 'Basic',
        dj_service: booking.dj_service || false,
        liquor_service: booking.liquor_service || false,
        theme: booking.theme || '',
        gross_amount: booking.gross_amount?.toString() || '',
        tax_amount: booking.tax_amount?.toString() || '',
        extra_plates_amount: booking.extra_plates_amount?.toString() || '',
        total_amount: booking.total_amount?.toString() || '',
        advance_paid: booking.advance_paid?.toString() || '',
        balance_amount: booking.balance_amount?.toString() || '',
        btr: booking.btr || '',
        remarks: booking.remarks || '',
        status: booking.status || 'confirmed'
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
    
    if (!formData.client_name || !formData.date_of_function) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        serial_no: formData.serial_no,
        unit: formData.unit,
        client_name: formData.client_name,
        client_address: formData.client_address,
        contact_number: formData.contact_number,
        date_of_birth: formData.date_of_birth,
        date_of_function: formData.date_of_function,
        occasion: formData.occasion,
        hall: formData.hall,
        meal_type: formData.meal_type,
        timings_from: formData.timings_from,
        timings_to: formData.timings_to,
        pax: parseInt(formData.pax) || 0,
        menu: formData.menu,
        onion_preference: formData.onion_preference,
        garlic_preference: formData.garlic_preference,
        flower_decoration: formData.flower_decoration,
        dj_service: formData.dj_service,
        liquor_service: formData.liquor_service,
        theme: formData.theme,
        gross_amount: parseFloat(formData.gross_amount) || 0,
        tax_amount: parseFloat(formData.tax_amount) || 0,
        extra_plates_amount: parseFloat(formData.extra_plates_amount) || 0,
        total_amount: parseFloat(formData.total_amount) || 0,
        advance_paid: parseFloat(formData.advance_paid) || 0,
        balance_amount: parseFloat(formData.balance_amount) || 0,
        btr: formData.btr,
        remarks: formData.remarks,
        status: formData.status
      };

      if (booking) {
        await updateBooking(booking.booking_id as number, updateData);
        toast.success('Booking updated successfully!');
        onSave();
        onClose();
      }
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
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center">
              <FileTextIcon className="w-5 h-5 mr-2" />
              ROUGH ESTIMATE - Edit Booking
            </DialogTitle>
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
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <Label className="text-sm font-medium">Serial No.</Label>
              <Input
                type="text"
                value={formData.serial_no}
                onChange={(e) => handleInputChange('serial_no', e.target.value)}
                placeholder="O1, O2, etc."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                <SelectTrigger className="mt-1">
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
            <div>
              <Label className="text-sm font-medium">Date of Function</Label>
              <Input
                type="date"
                value={formData.date_of_function}
                onChange={(e) => handleInputChange('date_of_function', e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </motion.div>

          {/* Client Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <User className="w-5 h-5 mr-2" />
              Client Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Name *</Label>
                <Input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange('client_name', e.target.value)}
                  placeholder="Enter client name"
                  required
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Contact No.</Label>
                <Input
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => handleInputChange('contact_number', e.target.value)}
                  placeholder="Enter contact number"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Address</Label>
                <Input
                  type="text"
                  value={formData.client_address}
                  onChange={(e) => handleInputChange('client_address', e.target.value)}
                  placeholder="Enter address"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Event Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Occasion</Label>
                <Select value={formData.occasion} onValueChange={(value) => handleInputChange('occasion', value)}>
                  <SelectTrigger>
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
              </div>
              
              <div>
                <Label className="text-sm font-medium">Hall</Label>
                <Select value={formData.hall} onValueChange={(value) => handleInputChange('hall', value)}>
                  <SelectTrigger>
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
                <Label className="text-sm font-medium">Lunch / Dinner</Label>
                <Select value={formData.meal_type} onValueChange={(value) => handleInputChange('meal_type', value)}>
                  <SelectTrigger>
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
                <Label className="text-sm font-medium">Timings From</Label>
                <Input
                  type="time"
                  value={formData.timings_from}
                  onChange={(e) => handleInputChange('timings_from', e.target.value)}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Timings To</Label>
                <Input
                  type="time"
                  value={formData.timings_to}
                  onChange={(e) => handleInputChange('timings_to', e.target.value)}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Pax (Number of Guests)</Label>
                <Input
                  type="number"
                  value={formData.pax}
                  onChange={(e) => handleInputChange('pax', e.target.value)}
                  placeholder="Enter number of guests"
                  min="1"
                />
              </div>
            </div>
          </motion.div>

          {/* Menu & Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Utensils className="w-5 h-5 mr-2" />
              Menu & Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Menu</Label>
                <Select value={formData.menu} onValueChange={(value) => handleInputChange('menu', value)}>
                  <SelectTrigger>
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
                <Label className="text-sm font-medium">Onion</Label>
                <Select value={formData.onion_preference} onValueChange={(value) => handleInputChange('onion_preference', value)}>
                  <SelectTrigger>
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
                <Label className="text-sm font-medium">Garlic</Label>
                <Select value={formData.garlic_preference} onValueChange={(value) => handleInputChange('garlic_preference', value)}>
                  <SelectTrigger>
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
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Services
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Flower Decor</Label>
                <Select value={formData.flower_decoration} onValueChange={(value) => handleInputChange('flower_decoration', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select decoration" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLOWER_DECORATIONS.map((decoration) => (
                      <SelectItem key={decoration.value} value={decoration.value}>
                        {decoration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Theme</Label>
                <Input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  placeholder="Enter theme"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={formData.dj_service}
                  onChange={(e) => handleInputChange('dj_service', e.target.checked)}
                />
                <Music className="w-4 h-4" />
                <span className="text-sm font-medium">D.J.</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={formData.liquor_service}
                  onChange={(e) => handleInputChange('liquor_service', e.target.checked)}
                />
                <Wine className="w-4 h-4" />
                <span className="text-sm font-medium">Liquor Services</span>
              </label>
            </div>
          </motion.div>

          {/* Financial Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Financial Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Amount</Label>
                <Input
                  type="number"
                  value={formData.gross_amount}
                  onChange={(e) => handleInputChange('gross_amount', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Tax</Label>
                <Input
                  type="number"
                  value={formData.tax_amount}
                  onChange={(e) => handleInputChange('tax_amount', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Extra Plates</Label>
                <Input
                  type="number"
                  value={formData.extra_plates_amount}
                  onChange={(e) => handleInputChange('extra_plates_amount', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Total</Label>
                <Input
                  type="number"
                  value={formData.total_amount}
                  readOnly
                  className="bg-gray-50"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Advance</Label>
                <Input
                  type="number"
                  value={formData.advance_paid}
                  onChange={(e) => handleInputChange('advance_paid', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Balance</Label>
                <Input
                  type="number"
                  value={formData.balance_amount}
                  readOnly
                  className="bg-gray-50"
                  placeholder="0.00"
                />
              </div>
            </div>
          </motion.div>

          {/* Additional Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <FileTextIcon className="w-5 h-5 mr-2" />
              Additional Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">BTR</Label>
                <Textarea
                  value={formData.btr}
                  onChange={(e) => handleInputChange('btr', e.target.value)}
                  placeholder="Enter BTR details"
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Remarks</Label>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Enter remarks"
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground">Status</h3>
            
            <div>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
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

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex justify-end space-x-3 pt-6 border-t"
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Booking
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingEdit;
