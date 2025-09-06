import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LEAD_TYPES, MENU_OPTIONS } from '../../utils/helpers';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface AddLeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded: () => void;
}

const AddLeadForm: React.FC<AddLeadFormProps> = ({
  isOpen,
  onClose,
  onLeadAdded
}) => {
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    wedding_date: '',
    numeric_budget: '',
    type_of_venue: '',
    lead_type: 'New Lead',
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
        lead_type: 'New Lead',
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
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Add New Lead</DialogTitle>
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
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <User className="w-5 h-5 mr-2" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Name *
                </label>
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
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone Number *
                </label>
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

          </motion.div>

          {/* Wedding Details */}
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
                  Date of Event *
                </label>
                <input
                  type="date"
                  value={formData.wedding_date}
                  onChange={(e) => handleInputChange('wedding_date', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Party Budget
                </label>
                <input
                  type="number"
                  value={formData.numeric_budget}
                  onChange={(e) => handleInputChange('numeric_budget', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter budget amount"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Venue Type
                </label>
                <input
                  type="text"
                  value={formData.type_of_venue}
                  onChange={(e) => handleInputChange('type_of_venue', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="e.g., Hotel, Banquet Hall, etc."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Lead Type
                </label>
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
            </div>
          </motion.div>

          {/* Additional Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Additional Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Type of Event
                </label>
                <input
                  type="text"
                  value={formData.type_of_event}
                  onChange={(e) => handleInputChange('type_of_event', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="e.g., Wedding, Birthday, Corporate Event"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Quotation
                </label>
                <input
                  type="text"
                  value={formData.quotation}
                  onChange={(e) => handleInputChange('quotation', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter quotation details"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Menu Option
                </label>
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
                <label className="text-sm font-medium text-foreground">
                  Menu Quote
                </label>
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
              <label className="text-sm font-medium text-foreground">
                Updates & Notes
              </label>
              <textarea
                value={formData.updates}
                onChange={(e) => handleInputChange('updates', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Add updates, notes, or follow-up details..."
                rows={3}
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                  Add Lead
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadForm;
