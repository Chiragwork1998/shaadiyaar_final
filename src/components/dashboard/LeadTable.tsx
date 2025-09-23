import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, ChevronDown, Phone, Star, Clock, Share2, Pencil, ArrowUp, ArrowDown, Trash2, AlertTriangle, X, Eye, Grid3X3, List, User, Calendar, DollarSign, Building } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Lead } from '../../types';
import { formatDate, LEAD_TYPES, getLeadTypeStyle, getStatusDotColor, getLeadStatusTriggerStyle, getStatusText, LEAD_STATUSES, formatIndianCurrency, MENU_OPTIONS } from '../../utils/helpers';
import { parseISO, differenceInDays } from 'date-fns';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

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
    budget: '',
    lead_type: 'Hot Lead',
    status: 'new',
    type_of_event: '',
    number_of_pax: '',
    menu_option: '',
    menu_quote_veg_silver: '',
    menu_quote_veg_gold: '',
    menu_quote_non_veg_silver: '',
    menu_quote_non_veg_gold: '',
    menu_quote_platinum: '',
    updates: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.number || !formData.wedding_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    await submitForm();
  };

  const submitForm = async () => {
    if (!formData.name || !formData.number || !formData.wedding_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          name: formData.name,
          number: formData.number,
          wedding_date: formData.wedding_date,
          numeric_budget: parseFloat(formData.budget) || 0,
          lead_type: formData.lead_type,
          status: formData.status,
          type_of_event: formData.type_of_event || '',
          number_of_pax: parseInt(formData.number_of_pax) || 0,
          menu_option: formData.menu_option || '',
          menu_quote_veg_silver: formData.menu_quote_veg_silver || '',
          menu_quote_veg_gold: formData.menu_quote_veg_gold || '',
          menu_quote_non_veg_silver: formData.menu_quote_non_veg_silver || '',
          menu_quote_non_veg_gold: formData.menu_quote_non_veg_gold || '',
          menu_quote_platinum: formData.menu_quote_platinum || '',
          updates: formData.updates || '',
          lead_create_date: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('Lead added successfully!');
      setFormData({
        name: '',
        number: '',
        wedding_date: '',
        budget: '',
        lead_type: 'Hot Lead',
        status: 'new',
        type_of_event: '',
        number_of_pax: '',
        menu_option: '',
        menu_quote_veg_silver: '',
        menu_quote_veg_gold: '',
        menu_quote_non_veg_silver: '',
        menu_quote_non_veg_gold: '',
        menu_quote_platinum: '',
        updates: ''
      });
      onClose();
      // Real-time updates should handle this automatically
      // But keep manual refresh as backup
      if (onLeadAdded) {
        onLeadAdded();
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add New Lead</DialogTitle>
          <DialogDescription>
            Enter the lead information below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form id="add-lead-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground flex items-center">
                <User className="w-4 h-4 mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Enter full name"
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

          {/* Event Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter budget amount"
                />
              </div>
            </div>
          </div>

          {/* Lead Classification */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Star className="w-4 h-4 mr-2" />
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
              
              <div>
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Status
                </label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-3">
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
                <label className="text-sm font-medium text-foreground">Number of Pax (Gathering)</label>
                <input
                  type="number"
                  value={formData.number_of_pax}
                  onChange={(e) => handleInputChange('number_of_pax', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter number of people"
                />
              </div>
            </div>

            <div className="space-y-3">
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
                <h4 className="text-sm font-medium text-foreground mb-2">Menu Quotes</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Veg Silver</label>
                    <input
                      type="text"
                      value={formData.menu_quote_veg_silver}
                      onChange={(e) => handleInputChange('menu_quote_veg_silver', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="Veg Silver quote"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Veg Gold</label>
                    <input
                      type="text"
                      value={formData.menu_quote_veg_gold}
                      onChange={(e) => handleInputChange('menu_quote_veg_gold', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="Veg Gold quote"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Non-Veg Silver</label>
                    <input
                      type="text"
                      value={formData.menu_quote_non_veg_silver}
                      onChange={(e) => handleInputChange('menu_quote_non_veg_silver', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="Non-Veg Silver quote"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Non-Veg Gold</label>
                    <input
                      type="text"
                      value={formData.menu_quote_non_veg_gold}
                      onChange={(e) => handleInputChange('menu_quote_non_veg_gold', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="Non-Veg Gold quote"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">Platinum</label>
                    <input
                      type="text"
                      value={formData.menu_quote_platinum}
                      onChange={(e) => handleInputChange('menu_quote_platinum', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="Platinum quote"
                    />
                  </div>
                </div>
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
                Add Lead
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Define SortConfig directly here if not imported from Dashboard or types
type SortDirection = 'ascending' | 'descending';
interface SortConfig {
  key: keyof Lead | null;
  direction: SortDirection;
}

interface LeadTableProps {
  leads: Lead[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (leadId: string, newStatus: string) => void;
  onLeadView: (lead: Lead) => void;
  onLeadEdit: (lead: Lead) => void;
  onLeadShare: (lead: Lead) => void;
  onLeadDelete?: () => void; // Callback to refresh leads after deletion
  updatingStatus: string | null;
  onLeadTypeChange: (value: string) => void;
  selectedLeadType: string;
  // Add sorting props
  sortConfig: SortConfig;
  requestSort: (key: keyof Lead) => void;
  onLeadAdded?: () => void; // Callback to refresh leads after adding
}

// Helper component for sortable table headers
const SortableTableHeader: React.FC<{
  columnKey: keyof Lead;
  title: string;
  sortConfig: SortConfig;
  requestSort: (key: keyof Lead) => void;
  className?: string;
}> = ({ columnKey, title, sortConfig, requestSort, className = '' }) => {
  const isSorted = sortConfig.key === columnKey;
  const icon = isSorted ? (sortConfig.direction === 'ascending' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />) : <ChevronDown className="w-3.5 h-3.5 opacity-50" />;
  
  return (
    <th className={`text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${className}`}>
      <div 
        onClick={() => requestSort(columnKey)}
        className="flex items-center space-x-1 cursor-pointer hover:text-foreground select-none"
        title={`Sort by ${title}`}
      >
        <span>{title}</span>
        {icon}
      </div>
    </th>
  );
};

// Mobile Lead Card Component
const MobileLeadCard: React.FC<{
  lead: Lead;
  isSelected: boolean;
  onSelect: (leadId: string, checked: boolean) => void;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onShare: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: string) => void;
  updatingStatus: string | null;
  index: number;
}> = ({ lead, isSelected, onSelect, onView, onEdit, onShare, onDelete, onStatusChange, updatingStatus, index }) => {
  const weddingDate = parseISO(lead.wedding_date);
  const daysUntilWedding = differenceInDays(weddingDate, new Date());
  const leadTypeStyle = getLeadTypeStyle(lead.lead_type);
  const statusTriggerStyle = getLeadStatusTriggerStyle(lead.status);
  const statusDotColor = getStatusDotColor(lead.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(lead.lead_id, e.target.checked)}
            className="w-5 h-5 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 mt-1"
          />
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center font-semibold text-lg shadow-sm">
            {lead.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground text-base truncate">{lead.name}</div>
            <div className="text-sm text-muted-foreground flex items-center mt-1">
              <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="truncate">{lead.number}</span>
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusTriggerStyle}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${statusDotColor}`}></div>
            {getStatusText(lead.status)}
          </div>
        </div>
      </div>

      {/* Key Info Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Budget</span>
          </div>
          <div className="font-semibold text-foreground text-sm">{formatIndianCurrency(lead.numeric_budget)}</div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Type</span>
          </div>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${leadTypeStyle.startsWith('bg-') ? leadTypeStyle : `bg-accent text-primary ${leadTypeStyle}`}`}>
              <Star className="w-3 h-3 mr-1" />
              {lead.lead_type}
            </span>
          </div>
        </div>
      </div>

      {/* Wedding Info Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Wedding Date</span>
          </div>
          <div className="font-medium text-foreground text-sm">{formatDate(lead.wedding_date)}</div>
          {daysUntilWedding >= 0 && (
            <div className={`flex items-center text-xs ${daysUntilWedding < 30 ? 'text-red-500' : daysUntilWedding < 60 ? 'text-orange-500' : 'text-green-500'}`}>
              <Clock className="w-3 h-3 mr-1" />
              {daysUntilWedding === 0 ? 'Today' : `${daysUntilWedding} days left`}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Status</span>
          </div>
          <div className="flex items-center">
            <Select
              value={lead.status}
              onValueChange={(value) => onStatusChange(lead.lead_id, value)}
              disabled={updatingStatus === lead.lead_id}
            >
              <SelectTrigger 
                className={`w-full border focus:ring-ring transition-colors duration-150 ease-in-out rounded-md text-xs px-2 py-1.5 text-left justify-start font-medium ${statusTriggerStyle}`}
              >
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${statusDotColor}`} />
                  <SelectValue>{getStatusText(lead.status)}</SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${status.dotColor}`} />
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(lead)}
          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 h-7 px-2 text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(lead)}
          className="text-primary hover:bg-primary/10 h-7 px-2 text-xs"
        >
          <Pencil className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onShare(lead)}
          className="text-green-600 hover:bg-green-50 hover:text-green-700 h-7 px-2 text-xs"
        >
          <Share2 className="w-3 h-3 mr-1" />
          Share
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(lead)}
          className="text-red-500 hover:bg-red-50 hover:text-red-600 h-7 px-2 text-xs"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </div>
    </motion.div>
  );
};

const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  searchQuery,
  onSearchChange,
  onStatusChange,
  onLeadView,
  onLeadEdit,
  onLeadShare,
  onLeadDelete,
  updatingStatus,
  onLeadTypeChange,
  selectedLeadType,
  sortConfig,
  requestSort,
  onLeadAdded
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);


  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('lead_id', leadToDelete.lead_id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success(`Lead "${leadToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
      onLeadDelete?.();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setLeadToDelete(null);
  };

  // Bulk selection functions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(leads.map(lead => lead.lead_id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleBulkShare = () => {
    const selectedLeadData = leads.filter(lead => selectedLeads.has(lead.lead_id));
    
    if (selectedLeadData.length === 0) {
      toast.error('Please select leads to share');
      return;
    }

    const shareText = selectedLeadData.map(lead => 
      `📋 Lead: ${lead.name}\n💰 Budget: ${formatIndianCurrency(lead.numeric_budget)}\n💒 Wedding: ${formatDate(lead.wedding_date)}\n📞 Contact: ${lead.number}\n`
    ).join('\n---\n');

    const finalText = `🎉 Wedding Leads Summary (${selectedLeadData.length} leads)\n\n${shareText}\n\n📱 Shared via Shaadiyaar Admin`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(finalText)}`);
    
    setSelectedLeads(new Set());
    toast.success(`Shared ${selectedLeadData.length} leads on WhatsApp`);
  };

  const handleClearSelection = () => {
    setSelectedLeads(new Set());
  };

  const isAllSelected = leads.length > 0 && selectedLeads.size === leads.length;
  const isPartiallySelected = selectedLeads.size > 0 && selectedLeads.size < leads.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-xl border border-border shadow-sm overflow-hidden w-full"
    >
      <div className="p-3 md:p-4 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center flex-wrap gap-2">
            <h2 className="text-base font-medium text-foreground">Recent Leads</h2>
            <span className="px-2 py-0.5 bg-accent text-primary text-xs font-medium rounded-full">
              {leads.length} total
            </span>
            {selectedLeads.size > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                {selectedLeads.size} selected
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Type Filter */}
              <Select value={selectedLeadType} onValueChange={onLeadTypeChange}>
                <SelectTrigger className="w-full sm:w-[140px] text-xs md:text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {LEAD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* View Toggle - Mobile Only */}
              <div className="flex items-center lg:hidden">
                <div className="flex bg-muted rounded-lg p-1">
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
              
              <Button 
                size="sm" 
                variant="primary" 
                onClick={() => setShowAddLeadForm(true)}
                className="w-full sm:w-auto text-sm h-8"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLeads.size > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-accent border-b border-border px-3 py-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center">
              <span className="text-sm font-medium text-foreground">
                {selectedLeads.size} lead{selectedLeads.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkShare}
                className="text-theme-green hover:bg-theme-green-bg flex-1 sm:flex-none text-sm h-8"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share on WhatsApp
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-muted-foreground hover:text-foreground text-sm h-8"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Views with Toggle */}
      <div className="block lg:hidden">
        {/* Card View */}
        {viewMode === 'cards' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-4 space-y-3"
          >
            {leads.map((lead, index) => (
              <MobileLeadCard
                key={lead.lead_id}
                lead={lead}
                isSelected={selectedLeads.has(lead.lead_id)}
                onSelect={handleSelectLead}
                onView={onLeadView}
                onEdit={onLeadEdit}
                onShare={onLeadShare}
                onDelete={(lead) => {
                  setLeadToDelete(lead);
                  setDeleteDialogOpen(true);
                }}
                onStatusChange={onStatusChange}
                updatingStatus={updatingStatus}
                index={index}
              />
            ))}
            {leads.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No leads found</h3>
                <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="w-full">
              {/* Table Header */}
              <div className="bg-muted/50 border-b border-border">
                <div className="grid grid-cols-3 gap-2 p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <div className="col-span-2">Lead</div>
                  <div>Status</div>
                </div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-border">
                {leads.map((lead, index) => (
                  <motion.div
                    key={lead.lead_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="grid grid-cols-3 gap-2 p-3 items-center">
                      {/* Lead Info */}
                      <div className="col-span-2 flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.lead_id)}
                          onChange={(e) => handleSelectLead(lead.lead_id, e.target.checked)}
                          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                        />
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground text-sm truncate">{lead.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{lead.number}</div>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLeadStatusTriggerStyle(lead.status)}`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${getStatusDotColor(lead.status)}`}></div>
                          {getStatusText(lead.status)}
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onLeadView(lead)}
                            className="h-6 w-6 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onLeadEdit(lead)}
                            className="h-6 w-6 text-primary hover:bg-primary/10"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {leads.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No leads found</h3>
                    <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isPartiallySelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  />
                </div>
              </th>
              <SortableTableHeader columnKey="name" title="Lead Details" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableTableHeader columnKey="lead_type" title="Type" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableTableHeader columnKey="wedding_date" title="Wedding Date" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableTableHeader columnKey="numeric_budget" title="Budget" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableTableHeader columnKey="status" title="Status" sortConfig={sortConfig} requestSort={requestSort} />
              <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {leads.map((lead, index) => {
              const weddingDate = parseISO(lead.wedding_date);
              const daysUntilWedding = differenceInDays(weddingDate, new Date());
              const leadTypeStyle = getLeadTypeStyle(lead.lead_type); 
              const statusTriggerStyle = getLeadStatusTriggerStyle(lead.status);
              const statusDotColor = getStatusDotColor(lead.status);
              const isSelected = selectedLeads.has(lead.lead_id);

              return (
                <motion.tr 
                  key={lead.lead_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`group hover:bg-accent transition-colors cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
                  onClick={() => onLeadView(lead)}
                >
                  <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectLead(lead.lead_id, e.target.checked)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent text-primary rounded-full flex items-center justify-center font-medium text-lg">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{lead.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center mt-0.5">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                          {lead.number}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${leadTypeStyle.startsWith('bg-') ? leadTypeStyle : `bg-accent text-primary ${leadTypeStyle}`}`}>
                      <Star className="w-3.5 h-3.5 mr-1.5" />
                      {lead.lead_type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-foreground">{formatDate(lead.wedding_date)}</span>
                      {daysUntilWedding >= 0 && (
                        <span className={`text-xs flex items-center mt-0.5 ${daysUntilWedding < 30 ? 'text-red-500' : 'text-muted-foreground' }`}>
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          {daysUntilWedding === 0 ? 'Today' : `${daysUntilWedding} days left`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-foreground">{formatIndianCurrency(lead.numeric_budget)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <Select
                      value={lead.status}
                      onValueChange={(value) => onStatusChange(lead.lead_id, value)}
                      disabled={updatingStatus === lead.lead_id}
                    >
                      <SelectTrigger 
                        className={`w-[190px] border focus:ring-ring transition-colors duration-150 ease-in-out rounded-md text-sm px-3 py-1.5 text-left justify-start font-medium ${statusTriggerStyle}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center">
                          <span className={`w-2.5 h-2.5 rounded-full mr-2 ${statusDotColor}`} />
                          <SelectValue>{getStatusText(lead.status)}</SelectValue>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground">
                        {LEAD_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center">
                              <span className={`w-2.5 h-2.5 rounded-full mr-2 ${status.dotColor}`} />
                              <span>{status.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onLeadShare(lead)}
                        className="text-theme-green hover:bg-theme-green-bg"
                        title="Share Lead"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onLeadEdit(lead)}
                        className="text-primary hover:bg-accent"
                        title="Edit Lead"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setLeadToDelete(lead);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
          </table>
        </div>
        {leads.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground">No Leads Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters, or add a new lead.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  Delete Lead
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {leadToDelete && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete this lead? All associated data will be permanently removed.
              </p>
              
              <div className="bg-muted rounded-lg p-4 border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent text-primary rounded-full flex items-center justify-center font-medium">
                    {leadToDelete.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{leadToDelete.name}</div>
                    <div className="text-sm text-muted-foreground">{leadToDelete.number}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatIndianCurrency(leadToDelete.numeric_budget)} • {leadToDelete.number}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Lead
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lead Form */}
      <AddLeadForm
        isOpen={showAddLeadForm}
        onClose={() => setShowAddLeadForm(false)}
        onLeadAdded={onLeadAdded || (() => {})}
      />
    </motion.div>
  );
};

export default LeadTable;