import React, { useState } from 'react';
import { Share2, Save, Phone, Calendar, DollarSign, Building, ChevronUp, ChevronDown, Star, User, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "../ui/sheet";
import { Button } from "../ui/Button";
import { formatDate, getLeadTypeStyle, LEAD_TYPES, formatIndianCurrency, getStatusText, getLeadStatusTriggerStyle, getStatusDotColor } from '../../utils/helpers';
import { Lead } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface LeadDetailsSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  isEditMode?: boolean;
  onLeadUpdate?: () => void;
}

const LeadDetailsSheet: React.FC<LeadDetailsSheetProps> = ({
  lead,
  isOpen,
  onClose,
  isEditMode = false,
  onLeadUpdate
}) => {
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['contact', 'wedding']));

  React.useEffect(() => {
    if (lead) {
      setEditedLead(lead);
    }
  }, [lead]);

  if (!lead) return null;

  const shareOnWhatsApp = () => {
    const text = `🎉 Lead Details - ${lead.name}\n\n💰 Budget: ${formatIndianCurrency(lead.numeric_budget)}\n💒 Wedding Date: ${formatDate(lead.wedding_date)}\n📞 Contact: ${lead.number}\n⭐ Type: ${lead.lead_type}\n\n📱 Shared via Shaadiyaar Admin`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const handleInputChange = (field: keyof Lead, value: any) => {
    setEditedLead(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!lead.lead_id) return;

    setIsSaving(true);
    try {
      const updateData = {
        name: editedLead.name,
        number: editedLead.number,
        wedding_date: editedLead.wedding_date,
        numeric_budget: editedLead.numeric_budget,
        type_of_venue: editedLead.type_of_venue,
        lead_type: editedLead.lead_type,
        status: editedLead.status
      };

      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      const { error } = await supabase
        .from('leads')
        .update(cleanUpdateData)
        .eq('lead_id', lead.lead_id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('Lead updated successfully');
      onLeadUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const renderField = (label: string, field: keyof Lead, type: 'text' | 'number' | 'date' | 'select' = 'text', icon?: React.ReactNode) => {
    const value = editedLead[field] || lead[field] || '';

    if (!isEditMode) {
      return (
        <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-3">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
          <span className="text-sm font-semibold text-foreground text-right max-w-[60%] break-words">
            {field === 'numeric_budget' ? formatIndianCurrency(value as number) : 
             field === 'wedding_date' ? formatDate(value as string) : 
             field === 'lead_create_date' ? formatDate(value as string) :
             value || 'Not specified'}
          </span>
        </div>
      );
    }

    if (type === 'select' && field === 'lead_type') {
      return (
        <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-3">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
          <select
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="text-sm border border-border rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary max-w-[60%]"
          >
            {LEAD_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-3">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => handleInputChange(field, type === 'number' ? Number(e.target.value) : e.target.value)}
          className="text-sm border border-border rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary max-w-[60%]"
        />
      </div>
    );
  };

  const renderSection = (title: string, sectionKey: string, children: React.ReactNode) => {
    const isExpanded = expandedSections.has(sectionKey);
    
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
        >
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[400px] md:w-[500px] bg-card overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border pt-8 pb-4 px-4 z-10 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center font-semibold text-lg shadow-sm flex-shrink-0">
                {lead.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg font-semibold text-foreground mb-2">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedLead.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="text-lg font-semibold border-b border-border bg-transparent text-foreground focus:outline-none focus:border-primary w-full"
                    />
                  ) : lead.name}
                </SheetTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getLeadTypeStyle(lead.lead_type)}`}>
                    <Star className="w-3 h-3 mr-1" />
                    {lead.lead_type}
                  </span>
                  <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getLeadStatusTriggerStyle(lead.status)}`}>
                    <div className={`w-2 h-2 rounded-full mr-1.5 ${getStatusDotColor(lead.status)}`}></div>
                    {getStatusText(lead.status)}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {isEditMode ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-sm px-3 py-2"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 text-sm px-3 py-2"
                  onClick={shareOnWhatsApp}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground hover:bg-muted p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Contact Details */}
          {renderSection(
            'Contact Information',
            'contact',
            <>
              {renderField('Phone Number', 'number', 'text', <Phone className="w-4 h-4" />)}
            </>
          )}

          {/* Wedding Details */}
          {renderSection(
            'Wedding Details',
            'wedding',
            <>
              {renderField('Wedding Date', 'wedding_date', 'date', <Calendar className="w-4 h-4" />)}
              {renderField('Budget', 'numeric_budget', 'number', <DollarSign className="w-4 h-4" />)}
              {renderField('Venue Type', 'type_of_venue', 'text', <Building className="w-4 h-4" />)}
              {renderField('Lead Type', 'lead_type', 'select', <Star className="w-4 h-4" />)}
            </>
          )}

          {/* Timeline */}
          {renderSection(
            'Timeline',
            'timeline',
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Lead Created</p>
                  <p className="text-xs text-muted-foreground">{formatDate(lead.lead_create_date)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Wedding Day</p>
                  <p className="text-xs text-muted-foreground">{formatDate(lead.wedding_date)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {renderSection(
            'Notes & Updates',
            'notes',
            <div className="space-y-3">
              <textarea
                className="w-full rounded-lg border border-border bg-background text-foreground text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                rows={4}
                placeholder="Add notes about this lead..."
                disabled={!isEditMode}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LeadDetailsSheet;