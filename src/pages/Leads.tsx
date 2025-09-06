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

    // Simple and reliable real-time subscription
    const channel = supabase.channel('leads-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'leads' 
        },
        (payload) => {
          console.log('Real-time change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            console.log('New lead inserted:', payload.new);
            setLeads(currentLeads => {
              const updatedLeads = [payload.new as Lead, ...currentLeads];
              calculateStats(updatedLeads);
              return updatedLeads;
            });
            toast.success('New lead added!');
          } else if (payload.eventType === 'UPDATE') {
            console.log('Lead updated:', payload.new);
            setLeads(currentLeads => {
              return currentLeads.map(lead =>
                lead.lead_id === payload.new.lead_id ? (payload.new as Lead) : lead
              );
            });
          } else if (payload.eventType === 'DELETE') {
            console.log('Lead deleted:', payload.old);
            if (selectedLead?.lead_id === payload.old.lead_id) {
              setSelectedLead(null);
              setIsEditMode(false);
            }
            setLeads(currentLeads => {
              return currentLeads.filter(lead => lead.lead_id !== payload.old.lead_id);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time updates enabled');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription failed');
        }
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedLead?.lead_id]);

  // Memoize filtered and sorted leads
  const processedLeads = useMemo(() => {
    let result = [...leads];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(lead => 
        lead.name.toLowerCase().includes(query) ||
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
    <div className="bg-background min-h-screen overflow-x-hidden">
      <div className="w-full space-y-4 p-3 md:p-6 max-w-full overflow-x-hidden">
        {/* Header Section - Compact for Mobile */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 overflow-x-hidden"
        >
          <div className="overflow-x-hidden">
            <h1 className="text-lg md:text-2xl font-semibold text-foreground">
              Lead Management
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Manage and track all your wedding leads
            </p>
          </div>
        </motion.div>

        {/* Stats Overview - Compact Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-x-hidden"
        >
          <LeadStats {...stats} />
        </motion.div>

        {/* Lead Table - Mobile Optimized */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-x-hidden"
        >
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
        </motion.div>
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