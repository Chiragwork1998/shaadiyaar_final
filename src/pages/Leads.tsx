import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import LeadDetailsSheet from '../components/leads/LeadDetailsSheet';
import LeadStats from '../components/dashboard/LeadStats';
import LeadTable from '../components/dashboard/LeadTable';
import { supabase, fetchLeads, updateLeadStatus, getLead } from '../lib/supabase';
import { Lead } from '../types';
import { toast } from 'react-hot-toast';

// Define SortDirection and SortConfig types
type SortDirection = 'ascending' | 'descending';
interface SortConfig {
  key: keyof Lead | null; 
  direction: SortDirection;
}

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadType, setSelectedLeadType] = useState('all');
  const [stats, setStats] = useState({
    totalLeads: 0,
    hotLeads: 0,
    upcomingWeddings: 0,
    conversionRate: 0
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'lead_create_date', direction: 'descending' });

  const loadLeads = async () => {
    try {
      console.log('Loading leads...');
      setLoading(true);
      const data = await fetchLeads();
      console.log('Leads loaded:', data);
      setLeads(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();

    const subscription = supabase
      .channel('leads-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          console.log('Real-time update received:', payload);
          setLeads(currentLeads => {
            if (payload.eventType === 'UPDATE') {
              return currentLeads.map(lead =>
                lead.lead_id === payload.new.lead_id ? (payload.new as Lead) : lead
              );
            } else if (payload.eventType === 'INSERT') {
              return [payload.new as Lead, ...currentLeads];
            } else if (payload.eventType === 'DELETE') {
              if (selectedLead?.lead_id === payload.old.lead_id) {
                setSelectedLead(null);
                setIsEditMode(false);
                toast.error('This lead has been deleted');
              }
              return currentLeads.filter(lead => lead.lead_id !== payload.old.lead_id);
            }
            return currentLeads;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedLead?.lead_id]);

  // Memoize filtered and sorted leads
  const processedLeads = useMemo(() => {
    let result = [...leads];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(lead => 
        lead.name.toLowerCase().includes(query) ||
        (lead.location && lead.location.toLowerCase().includes(query)) ||
        (lead.number && lead.number.toLowerCase().includes(query))
      );
    }

    if (selectedLeadType !== 'all') {
      result = result.filter(lead => lead.lead_type === selectedLeadType);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        if (valA === null || valA === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (valB === null || valB === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;

        if (sortConfig.key === 'numeric_budget' || sortConfig.key === 'time_to_book_days') {
          return sortConfig.direction === 'ascending' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
        }
        if (sortConfig.key === 'wedding_date' || sortConfig.key === 'lead_create_date') {
           const dateA = new Date(valA as string).getTime();
           const dateB = new Date(valB as string).getTime();
           if (isNaN(dateA)) return 1;
           if (isNaN(dateB)) return -1;
           return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }
        
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [leads, searchQuery, selectedLeadType, sortConfig]);

  const requestSort = (key: keyof Lead) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      setSortConfig({ key: null, direction: 'ascending' }); // Third click clears sort
      return;
    }
    setSortConfig({ key, direction });
  };

  const calculateStats = (data: Lead[]) => {
    const total = data.length;
    const hot = data.filter(lead => lead.lead_type === 'Hot Lead').length;
    const upcoming = data.filter(lead => new Date(lead.wedding_date) > new Date()).length;
    const booked = data.filter(lead => lead.status === 'booked').length;
    const rate = total > 0 ? Math.round((booked / total) * 100) : 0;

    setStats({
      totalLeads: total,
      hotLeads: hot,
      upcomingWeddings: upcoming,
      conversionRate: rate
    });
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    // Find the previous status for rollback
    const prevLeads = [...leads];
    const prevLead = leads.find(lead => lead.lead_id === leadId);
    if (!prevLead) return;
    const prevStatus = prevLead.status;

    // Optimistically update UI
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.lead_id === leadId ? { ...lead, status: newStatus } : lead
      )
    );
    setUpdatingStatus(leadId);

    try {
      await updateLeadStatus(leadId, newStatus);
      // No need to update state here, real-time or optimistic already did
      calculateStats(
        leads.map(lead =>
          lead.lead_id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
      toast.success('Lead status updated successfully');
    } catch (error) {
      // Revert UI on error
      setLeads(prevLeads);
      calculateStats(prevLeads);
      console.error('Error updating lead status:', error);
      toast.error('Failed to update lead status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleEditClick = async (lead: Lead) => {
    try {
      const freshLead = await getLead(lead.lead_id);
      if (!freshLead) {
        toast.error('Lead not found. It may have been deleted');
        await loadLeads();
        return;
      }
      setSelectedLead(freshLead);
      setIsEditMode(true);
    } catch (error) {
      console.error('Error fetching lead for edit:', error);
      toast.error('Failed to load lead details');
      await loadLeads();
    }
  };

  const handleViewClick = async (lead: Lead) => {
    try {
      const freshLead = await getLead(lead.lead_id);
      if (!freshLead) {
        toast.error('Lead not found. It may have been deleted');
        await loadLeads();
        return;
      }
      setSelectedLead(freshLead);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error fetching lead for view:', error);
      toast.error('Failed to load lead details');
      await loadLeads();
    }
  };

  const shareOnWhatsApp = (lead: Lead) => {
    const text = `New Lead Details:\nName: ${lead.name}\nBudget: ${lead.numeric_budget}\nLocation: ${lead.location}\nWedding Date: ${lead.wedding_date}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const handleSheetClose = () => {
    setSelectedLead(null);
    setIsEditMode(false);
    loadLeads();
  };

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 md:pt-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">
              Lead Management
            </h1>
            <p className="text-muted-foreground mt-1">Manage and track all your wedding leads</p>
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-accent-vibrant-purple-darker shadow-lg shadow-primary/20 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Lead
          </Button>
        </div>

        {/* Stats Overview */}
        <LeadStats {...stats} />

        {/* Lead Table */}
        <LeadTable
          leads={processedLeads}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onStatusChange={handleStatusChange}
          onLeadView={handleViewClick}
          onLeadEdit={handleEditClick}
          onLeadShare={shareOnWhatsApp}
          onLeadDelete={loadLeads}
          updatingStatus={updatingStatus}
          onLeadTypeChange={setSelectedLeadType}
          selectedLeadType={selectedLeadType}
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
      </div>

      <LeadDetailsSheet
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={handleSheetClose}
        isEditMode={isEditMode}
        onLeadUpdate={loadLeads}
      />
    </div>
  );
};

export default Leads; 