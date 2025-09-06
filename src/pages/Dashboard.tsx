import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  Calendar,
  Package,
  Receipt,
  Settings,
  LogOut,
  CheckCircle,
  Clock,
  Plus,
  Target,
  AlertCircle,
  DollarSign,
  Trash2,
  Loader2,
  CreditCard
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useNavigate } from 'react-router-dom';
import { supabase, createPendingApproval, createPartPayment } from '../lib/supabase';
import { fetchBookings } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getAccessLevelDisplayName } from '../utils/permissions';
import { requiresApproval } from '../utils/permissions';
import { generateSequentialSerialNumber, LEAD_TYPES, MENU_OPTIONS, HALLS } from '../utils/helpers';
import toast from 'react-hot-toast';

interface Permission {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  enabled: boolean;
}

interface QuickAction {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  action: 'navigate' | 'add-lead' | 'add-booking' | 'add-part-payment';
  path?: string;
  color: string;
}

interface DashboardStats {
  totalLeads: number;
  activeBookings: number;
  upcomingEvents: number;
  pendingTasks: number;
  leadGrowth: number;
  bookingGrowth: number;
  eventGrowth: number;
  taskGrowth: number;
}

// Add Lead Form Component
const AddLeadForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded: () => void;
}> = ({ isOpen, onClose, onLeadAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    wedding_date: '',
    numeric_budget: '',
    type_of_venue: '',
    lead_type: 'Hot Lead',
    type_of_event: '',
    quotation: '',
    menu_option: '',
    menu_quote: '',
    updates: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.number || !formData.wedding_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newLead = {
        name: formData.name,
        number: formData.number,
        wedding_date: formData.wedding_date,
        numeric_budget: parseFloat(formData.numeric_budget) || 0,
        type_of_venue: formData.type_of_venue || '',
        lead_type: formData.lead_type,
        type_of_event: formData.type_of_event || '',
        quotation: formData.quotation || '',
        menu_option: formData.menu_option || '',
        menu_quote: formData.menu_quote || '',
        updates: formData.updates || '',
        status: 'new',
        lead_create_date: new Date().toISOString()
      };

      const { error } = await supabase
        .from('leads')
        .insert([newLead]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('Lead added successfully!');
      onLeadAdded();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        number: '',
        wedding_date: '',
        numeric_budget: '',
        type_of_venue: '',
        lead_type: 'Hot Lead',
        type_of_event: '',
        quotation: '',
        menu_option: '',
        menu_quote: '',
        updates: ''
      });
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add New Lead</DialogTitle>
          <DialogDescription>
            Enter details for a new lead
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Enter client name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Phone Number *</label>
              <input
                type="tel"
                value={formData.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Date of Event *</label>
            <input
              type="date"
              value={formData.wedding_date}
              onChange={(e) => handleInputChange('wedding_date', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Party Budget</label>
              <input
                type="number"
                value={formData.numeric_budget}
                onChange={(e) => handleInputChange('numeric_budget', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Enter budget amount"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Venue Type</label>
              <input
                type="text"
                value={formData.type_of_venue}
                onChange={(e) => handleInputChange('type_of_venue', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="e.g., Hotel, Banquet Hall, etc."
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Lead Type</label>
            <Select value={formData.lead_type} onValueChange={(value) => handleInputChange('lead_type', value)}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select lead type" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Additional Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Type of Event</label>
                <input
                  type="text"
                  value={formData.type_of_event}
                  onChange={(e) => handleInputChange('type_of_event', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="e.g., Wedding, Birthday, Corporate Event"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Quotation</label>
                <input
                  type="text"
                  value={formData.quotation}
                  onChange={(e) => handleInputChange('quotation', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter quotation details"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Menu Option</label>
                <Select value={formData.menu_option} onValueChange={(value) => handleInputChange('menu_option', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select menu option" />
                  </SelectTrigger>
                  <SelectContent>
                    {MENU_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Menu Quote</label>
                <input
                  type="text"
                  value={formData.menu_quote}
                  onChange={(e) => handleInputChange('menu_quote', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter menu quote amount"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Updates & Notes</label>
              <textarea
                value={formData.updates}
                onChange={(e) => handleInputChange('updates', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Add updates, notes, or follow-up details..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
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
              type="submit"
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
                  Add Lead
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
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
    
    // Additional Details
    btr: '',
    remarks: '',
    
    // Status
    status: 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate serial number and set booking date when form opens
  useEffect(() => {
    if (isOpen) {
      const generateSerial = async () => {
        try {
          const nextSerial = await generateSequentialSerialNumber();
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
  }, [isOpen]);

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

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.date_of_function) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const status = user && requiresApproval(user.access_code as any) ? 'pending_approval' : 'confirmed';
      
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
        btr: formData.btr,
        remarks: formData.remarks,
        status: status
      };

      // Check if user requires approval
      if (user && requiresApproval(user.access_code as any)) {
        await createPendingApproval({
          admin_id: user.admin_id,
          action_type: 'booking',
          action_data: bookingData,
          status: 'pending'
        });

        toast.success('Booking submitted for approval!');
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
          btr: '',
          remarks: '',
          status: 'pending'
        });
        onClose();
        onBookingAdded();
        return;
      }

      // Direct submission for admin users
      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

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
        btr: '',
        remarks: '',
        status: 'pending'
      });
      onClose();
      onBookingAdded();
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
          <DialogTitle className="text-lg font-semibold">Add New Booking</DialogTitle>
          <DialogDescription>
            Enter details for a new event booking
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="text-sm font-medium text-foreground">Tax</label>
                <input
                  type="number"
                  value={formData.tax_amount}
                  onChange={(e) => handleInputChange('tax_amount', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="0.00"
                  step="0.01"
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

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
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
              type="submit"
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Add Part Payment Form Component
const AddPartPaymentForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded: () => void;
  bookings: any[];
}> = ({ isOpen, onClose, onPaymentAdded, bookings }) => {
  const [formData, setFormData] = useState({
    booking_id: '',
    client_name: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

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
    
    if (!formData.booking_id || !formData.amount || !formData.payment_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Get the selected booking to ensure we have the correct client_name
      const selectedBooking = bookings.find(booking => booking.booking_id.toString() === formData.booking_id);
      
      const paymentData = {
        booking_id: formData.booking_id,
        client_name: selectedBooking?.client_name || formData.client_name,
        amount: parseFloat(formData.amount) || 0,
        payment_date: formData.payment_date,
        description: formData.description
      };

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
      } else {
        // Direct submission for admin users
        await createPartPayment(paymentData);
        toast.success('Part payment added successfully!');
      }

      onPaymentAdded();
      onClose();
      
      // Reset form
      setFormData({
        booking_id: '',
        client_name: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        description: ''
      });
    } catch (error) {
      console.error('Error adding part payment:', error);
      toast.error('Failed to add part payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add Part Payment</DialogTitle>
          <DialogDescription>
            Record a part payment for an existing booking
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Booking *</label>
              <Select value={formData.booking_id} onValueChange={(value) => handleInputChange('booking_id', value)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select a booking" />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map((booking) => (
                    <SelectItem key={booking.booking_id} value={booking.booking_id.toString()}>
                      {booking.client_name} - {booking.booking_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Client Name *</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => handleInputChange('client_name', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Client name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Amount *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Enter payment amount"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Payment Date *</label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => handleInputChange('payment_date', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              placeholder="Payment description (optional)"
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
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
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Add Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userEmail, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [showAddBookingForm, setShowAddBookingForm] = useState(false);
  const [showAddPartPaymentForm, setShowAddPartPaymentForm] = useState(false);
  const [showKillConfirmation, setShowKillConfirmation] = useState(false);
  const [isKilling, setIsKilling] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    activeBookings: 0,
    upcomingEvents: 0,
    pendingTasks: 0,
    leadGrowth: 0,
    bookingGrowth: 0,
    eventGrowth: 0,
    taskGrowth: 0
  });
  const [bookings, setBookings] = useState<any[]>([]);

  // Fetch real-time data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch bookings data
        const bookingsData = await fetchBookings();
        setBookings(bookingsData);

        // Calculate stats
        const calculatedStats = {
          totalLeads: 0, // Mock data
          activeBookings: bookingsData.filter((b: any) => b.status === 'confirmed').length,
          upcomingEvents: 0, // Mock data
          pendingTasks: 0, // Mock data
          leadGrowth: 12, // Mock data
          bookingGrowth: 8,
          eventGrowth: 15,
          taskGrowth: -3
        };
        
        setStats(calculatedStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleQuickAction = (action: QuickAction) => {
    switch (action.action) {
      case 'navigate':
        if (action.path) {
          navigate(action.path);
        }
        break;
      case 'add-lead':
        setShowAddLeadForm(true);
        break;
      case 'add-booking':
        setShowAddBookingForm(true);
        break;
      case 'add-part-payment':
        setShowAddPartPaymentForm(true);
        break;
    }
  };

  const handleDataRefresh = () => {
    // Trigger a page reload to refresh all data
    window.location.reload();
  };

  const handleKillData = async () => {
    setIsKilling(true);
    try {
      // Delete all part payments first (due to foreign key constraints)
      const { error: paymentsError } = await supabase
        .from('part_payments')
        .delete()
        .neq('payment_id', 0); // Delete all records

      if (paymentsError) {
        console.error('Error deleting payments:', paymentsError);
        throw new Error('Failed to delete payments data');
      }

      // Delete all bookings
      const { error: bookingsError } = await supabase
        .from('bookings')
        .delete()
        .neq('booking_id', 0); // Delete all records

      if (bookingsError) {
        console.error('Error deleting bookings:', bookingsError);
        throw new Error('Failed to delete bookings data');
      }

      toast.success('All payments and bookings data has been deleted successfully!');
      setShowKillConfirmation(false);
      
      // Refresh the dashboard data
      window.location.reload();
    } catch (error) {
      console.error('Error killing data:', error);
      toast.error('Failed to delete data. Please try again.');
    } finally {
      setIsKilling(false);
    }
  };

  // Define permissions based on user access level
  const permissions: Permission[] = [
    {
      id: '1',
      name: 'Lead Management',
      icon: Users,
      description: 'View and manage all leads',
      enabled: true
    },
    {
      id: '2',
      name: 'Booking Management',
      icon: Calendar,
      description: 'Manage wedding bookings and schedules',
      enabled: true
    },
    {
      id: '3',
      name: 'Calendar Access',
      icon: Calendar,
      description: 'View and manage calendar events',
      enabled: true
    },
    {
      id: '4',
      name: 'Inventory Management',
      icon: Package,
      description: 'Manage vendor inventory and supplies',
      enabled: true
    },
    {
      id: '5',
      name: 'Receipt Management',
      icon: Receipt,
      description: 'Generate and manage receipts',
      enabled: true
    },
    {
      id: '6',
      name: 'Payment Tracking',
      icon: DollarSign,
      description: 'Track payments and financial data',
      enabled: true
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      name: 'Add Lead',
      icon: Plus,
      description: 'Add a new lead',
      action: 'add-lead',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'Add Booking',
      icon: Plus,
      description: 'Add a new booking',
      action: 'add-booking',
      color: 'bg-green-500'
    },
    {
      id: '3',
      name: 'Add Payment',
      icon: CreditCard,
      description: 'Record part payment',
      action: 'add-part-payment',
      color: 'bg-emerald-500'
    },
    {
      id: '4',
      name: 'View Calendar',
      icon: Calendar,
      description: 'Check calendar events',
      action: 'navigate',
      path: '/calendar',
      color: 'bg-purple-500'
    },
    {
      id: '5',
      name: 'Update Inventory',
      icon: Package,
      description: 'Manage vendor inventory',
      action: 'navigate',
      path: '/inventory',
      color: 'bg-orange-500'
    }
  ];

  const StatCard: React.FC<{
    title: string;
    value: number;
    growth: number;
    icon: React.ElementType;
    iconColor: string;
    bgColor: string;
    delay?: number;
  }> = ({ title, value, growth, icon: Icon, iconColor, bgColor, delay = 0 }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-card rounded-lg border border-border p-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-lg font-bold text-foreground">
              {loading ? (
                <div className="h-6 w-12 bg-muted animate-pulse rounded"></div>
              ) : (
                value.toLocaleString()
              )}
            </p>
            <p className={`text-xs ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {loading ? (
                <div className="h-3 w-8 bg-muted animate-pulse rounded"></div>
              ) : (
                `${growth >= 0 ? '+' : ''}${growth}%`
              )}
            </p>
          </div>
          <div className={`p-2 ${bgColor} rounded-lg`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
                Welcome, {user?.name || 'Employee'}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {userEmail ? (
                  <>
                    Role: {getAccessLevelDisplayName((user?.access_code as any) || '')} | 
                    Email: {userEmail}
                  </>
                ) : (
                  <>
                    Role: {getAccessLevelDisplayName((user?.access_code as any) || '')} | 
                    Access Level: {user?.access_code || 'Unknown'}
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 md:h-10 md:w-10"
              >
                <Settings className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              
              {/* Kill Data Button - Only for Admin */}
              {user?.access_code === '00-01' && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowKillConfirmation(true)}
                  className="h-8 w-8 md:h-10 md:w-10 border-red-200 hover:border-red-300 hover:bg-red-50"
                  title="Delete All Data (Admin Only)"
                >
                  <Trash2 className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="h-8 md:h-9 text-xs md:text-sm"
              >
                <LogOut className="h-4 w-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Logout
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Leads"
            value={stats.totalLeads}
            growth={stats.leadGrowth}
            icon={Users}
            iconColor="text-blue-600"
            bgColor="bg-blue-100"
            delay={0}
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            growth={stats.bookingGrowth}
            icon={Calendar}
            iconColor="text-green-600"
            bgColor="bg-green-100"
            delay={0.1}
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            growth={stats.eventGrowth}
            icon={Clock}
            iconColor="text-purple-600"
            bgColor="bg-purple-100"
            delay={0.2}
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            growth={stats.taskGrowth}
            icon={Target}
            iconColor="text-orange-600"
            bgColor="bg-orange-100"
            delay={0.3}
          />
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
              <div className="bg-card rounded-xl border border-border shadow-sm p-4">
            <h2 className="text-base font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  onClick={() => handleQuickAction(action)}
                  className="group relative p-3 rounded-lg border border-border bg-background hover:bg-accent transition-all duration-200"
                >
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                        {action.name}
                      </h3>
                    </div>
                  </div>
                </motion.button>
              ))}
                </div>
            </div>
          </motion.div>
          </div>

          {/* Permissions Sidebar - Takes 1/3 of the space */}
          <div className="space-y-6">
          <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
              <div className="bg-card rounded-xl border border-border shadow-sm p-4">
            <h2 className="text-base font-semibold text-foreground mb-4">Your Permissions</h2>
            <div className="space-y-2">
              {permissions.map((permission, index) => (
                <motion.div
                  key={permission.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    permission.enabled 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    permission.enabled ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <permission.icon className={`h-4 w-4 ${
                      permission.enabled ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate ${
                      permission.enabled ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {permission.name}
                    </h3>
                    <p className={`text-xs truncate ${
                      permission.enabled ? 'text-muted-foreground' : 'text-muted-foreground/60'
                    }`}>
                      {permission.description}
                    </p>
                  </div>
                  <div className={`flex-shrink-0 ${
                    permission.enabled ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {permission.enabled ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                </motion.div>
              ))}
                </div>
            </div>
          </motion.div>
          </div>
        </div>

        {/* Add Lead Form */}
        <AddLeadForm
          isOpen={showAddLeadForm}
          onClose={() => setShowAddLeadForm(false)}
          onLeadAdded={handleDataRefresh}
        />

        {/* Add Booking Form */}
        <AddBookingForm
          isOpen={showAddBookingForm}
          onClose={() => setShowAddBookingForm(false)}
          onBookingAdded={handleDataRefresh}
        />

        {/* Add Part Payment Form */}
        <AddPartPaymentForm
          isOpen={showAddPartPaymentForm}
          onClose={() => setShowAddPartPaymentForm(false)}
          onPaymentAdded={handleDataRefresh}
          bookings={bookings}
        />

        {/* Kill Data Confirmation Dialog */}
        <Dialog open={showKillConfirmation} onOpenChange={setShowKillConfirmation}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-red-600 flex items-center">
                <Trash2 className="h-6 w-6 mr-2" />
                ⚠️ DANGER: Delete All Data
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-2">
                This action will permanently delete ALL payments and bookings data from the database. 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">What will be deleted:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>All booking records ({stats.activeBookings} bookings)</li>
                      <li>All payment transactions</li>
                      <li>All financial data and calculations</li>
                      <li>All client information in bookings</li>
                    </ul>
                    <p className="font-semibold mt-2 text-red-700">
                      This action is IRREVERSIBLE!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Make sure you have exported your data before proceeding!
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowKillConfirmation(false)}
                className="w-full sm:w-auto"
                disabled={isKilling}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleKillData}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white border-red-600"
                disabled={isKilling}
              >
                {isKilling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    DELETE ALL DATA
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;