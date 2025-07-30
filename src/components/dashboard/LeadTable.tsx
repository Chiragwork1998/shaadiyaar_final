import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, ChevronDown, Phone, Star, Clock, MapPin, MoreHorizontal, Share2, Pencil, ArrowUp, ArrowDown, Trash2, AlertTriangle, Check, X } from 'lucide-react';
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
import { formatCurrency, formatDate, LEAD_TYPES, getLeadTypeStyle, getStatusDotColor, getLeadStatusTriggerStyle, getStatusText, LEAD_STATUSES, formatIndianCurrency } from '../../utils/helpers';
import { parseISO, differenceInDays } from 'date-fns';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

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
      className="bg-card border border-border rounded-lg p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(lead.lead_id, e.target.checked)}
            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 mt-1"
          />
          <div className="w-10 h-10 bg-accent text-primary rounded-full flex items-center justify-center font-medium text-lg">
            {lead.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-medium text-foreground">{lead.name}</div>
            <div className="text-sm text-muted-foreground flex items-center mt-0.5">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              {lead.number}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onShare(lead)}
            className="text-theme-green hover:bg-theme-green-bg h-8 w-8"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(lead)}
            className="text-primary hover:bg-accent h-8 w-8"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(lead)}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 w-8"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Type:</span>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${leadTypeStyle.startsWith('bg-') ? leadTypeStyle : `bg-accent text-primary ${leadTypeStyle}`}`}>
              <Star className="w-3 h-3 mr-1" />
              {lead.lead_type}
            </span>
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">Budget:</span>
          <div className="font-medium text-foreground mt-1">{formatIndianCurrency(lead.numeric_budget)}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Wedding Date:</span>
          <div className="text-foreground mt-1">{formatDate(lead.wedding_date)}</div>
          {daysUntilWedding >= 0 && (
            <span className={`text-xs flex items-center mt-0.5 ${daysUntilWedding < 30 ? 'text-red-500' : 'text-muted-foreground'}`}>
              <Clock className="w-3 h-3 mr-1" />
              {daysUntilWedding === 0 ? 'Today' : `${daysUntilWedding} days left`}
            </span>
          )}
        </div>
        <div>
          <span className="text-muted-foreground">Location:</span>
          <div className="flex items-center text-foreground mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {lead.location}
          </div>
        </div>
      </div>

      <div>
        <span className="text-muted-foreground text-sm">Status:</span>
        <div className="mt-1">
          <Select
            value={lead.status}
            onValueChange={(value) => onStatusChange(lead.lead_id, value)}
            disabled={updatingStatus === lead.lead_id}
          >
            <SelectTrigger 
              className={`w-full border focus:ring-ring transition-colors duration-150 ease-in-out rounded-md text-sm px-3 py-1.5 text-left justify-start font-medium ${statusTriggerStyle}`}
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
        </div>
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
  requestSort
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const handleDeleteClick = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

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
      `📋 Lead: ${lead.name}\n💰 Budget: ${formatIndianCurrency(lead.numeric_budget)}\n📍 Location: ${lead.location}\n💒 Wedding: ${formatDate(lead.wedding_date)}\n📞 Contact: ${lead.number}\n`
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
      className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
    >
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-foreground">Recent Leads</h2>
            <span className="ml-3 px-2.5 py-1 bg-accent text-primary text-xs font-medium rounded-full">
              {leads.length} total
            </span>
            {selectedLeads.size > 0 && (
              <span className="ml-2 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                {selectedLeads.size} selected
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={onSearchChange}
                className="pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring w-full sm:w-64"
              />
            </div>
            <Select value={selectedLeadType} onValueChange={onLeadTypeChange}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-input text-foreground focus:ring-ring">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="all">All Types</SelectItem>
                {LEAD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              variant="primary" 
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLeads.size > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-accent border-b border-border px-4 md:px-6 py-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center">
              <span className="text-sm font-medium text-foreground">
                {selectedLeads.size} lead{selectedLeads.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkShare}
                className="text-theme-green hover:bg-theme-green-bg flex-1 sm:flex-none"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share on WhatsApp
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Card View */}
      <div className="block lg:hidden">
        <div className="p-4 space-y-3">
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
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground">No Leads Found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search or filters, or add a new lead.</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
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
              <SortableTableHeader columnKey="location" title="Location" sortConfig={sortConfig} requestSort={requestSort} />
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
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1.5" />
                      {lead.location}
                    </div>
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
                      {formatIndianCurrency(leadToDelete.numeric_budget)} • {leadToDelete.location}
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
    </motion.div>
  );
};

export default LeadTable;