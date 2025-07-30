import React, { useState } from 'react';
import { Share2, Save } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Button } from "../ui/Button";
import { formatDate, formatCurrency, getLeadTypeStyle, LEAD_TYPES, formatIndianCurrency } from '../../utils/helpers';
import { Lead } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

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

  React.useEffect(() => {
    if (lead) {
      setEditedLead(lead);
    }
  }, [lead]);

  if (!lead) return null;

  const shareOnWhatsApp = () => {
    const text = `New Lead Details:\nName: ${lead.name}\nBudget: ${formatIndianCurrency(lead.numeric_budget)}\nLocation: ${lead.location}\nWedding Date: ${formatDate(lead.wedding_date)}`;
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
      // Only update specific fields that are safe to update
      const updateData = {
        name: editedLead.name,
        number: editedLead.number,
        location: editedLead.location,
        wedding_date: editedLead.wedding_date,
        numeric_budget: editedLead.numeric_budget,
        type_of_venue: editedLead.type_of_venue,
        lead_type: editedLead.lead_type,
        status: editedLead.status
      };

      // Remove undefined values
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

  const renderField = (label: string, field: keyof Lead, type: 'text' | 'number' | 'date' | 'select' = 'text') => {
    const value = editedLead[field] || '';

    if (!isEditMode) {
      return (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="text-foreground font-medium">
            {field === 'numeric_budget' ? formatIndianCurrency(value as number) : 
             field === 'wedding_date' ? formatDate(value as string) : 
             value}
          </span>
        </div>
      );
    }

    if (type === 'select' && field === 'lead_type') {
      return (
        <div className="flex justify-between text-sm items-center">
          <span className="text-muted-foreground">{label}</span>
          <select
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="text-sm border border-border rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {LEAD_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="flex justify-between text-sm items-center">
        <span className="text-muted-foreground">{label}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => handleInputChange(field, type === 'number' ? Number(e.target.value) : e.target.value)}
          className="text-sm border border-border rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[600px] bg-card overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-border">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-medium text-lg">
                  {lead.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-xl font-serif text-foreground">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedLead.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="text-xl font-serif border-b border-border bg-transparent text-foreground focus:outline-none focus:border-primary w-full max-w-[300px]"
                    />
                  ) : lead.name}
                </SheetTitle>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getLeadTypeStyle(lead.lead_type)}`}>
                  {lead.lead_type}
                </span>
              </div>
            </div>
            <div className="flex space-x-2 flex-shrink-0 mt-2 sm:mt-0">
              {isEditMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="whitespace-nowrap text-sm px-3 py-2"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 whitespace-nowrap text-sm px-3 py-2"
                  onClick={shareOnWhatsApp}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Contact Details</h3>
            <div className="mt-2 space-y-2">
              {renderField('Phone Number', 'number')}
              {renderField('Location', 'location')}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Wedding Details</h3>
            <div className="mt-2 space-y-2">
              {renderField('Wedding Date', 'wedding_date', 'date')}
              {renderField('Budget', 'numeric_budget', 'number')}
              {renderField('Venue Type', 'type_of_venue')}
              {renderField('Lead Type', 'lead_type', 'select')}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
            <div className="mt-4 relative border-l-2 border-border pl-4 space-y-6">
              <div className="relative">
                <div className="absolute -left-[21px] mt-1.5 w-4 h-4 bg-primary rounded-full" />
                <div>
                  <p className="text-sm font-medium text-foreground">Lead Created</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(lead.lead_create_date)}</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] mt-1.5 w-4 h-4 bg-muted rounded-full" />
                <div>
                  <p className="text-sm font-medium text-foreground">Wedding Day</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(lead.wedding_date)}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
            <textarea
              className="mt-2 w-full rounded-lg border border-border bg-background text-foreground text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              rows={4}
              placeholder="Add notes about this lead..."
              disabled={!isEditMode}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LeadDetailsSheet;