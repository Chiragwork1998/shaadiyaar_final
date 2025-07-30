import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import LeadCard from '../components/leads/LeadCard';
import LeadFilters from '../components/leads/LeadFilters';
import Spinner from '../components/ui/Spinner';
import { getLeads } from '../lib/supabase';
import { Lead, LeadFilters as FiltersType } from '../types';

const LeadsList: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FiltersType>({});
  
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await getLeads();
        setLeads(data);
        setFilteredLeads(data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, []);
  
  useEffect(() => {
    // Apply filters whenever they change
    let result = [...leads];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchTerm) ||
          lead.location.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.status) {
      result = result.filter((lead) => lead.status === filters.status);
    }
    
    if (filters.location) {
      const locationTerm = filters.location.toLowerCase();
      result = result.filter((lead) =>
        lead.location.toLowerCase().includes(locationTerm)
      );
    }
    
    if (filters.venue_type) {
      const venueTerm = filters.venue_type.toLowerCase();
      result = result.filter((lead) =>
        lead.type_of_venue.toLowerCase().includes(venueTerm)
      );
    }
    
    if (filters.min_budget) {
      result = result.filter(
        (lead) => (lead.numeric_budget || 0) >= (filters.min_budget || 0)
      );
    }
    
    if (filters.max_budget) {
      result = result.filter(
        (lead) => (lead.numeric_budget || 0) <= (filters.max_budget || 0)
      );
    }
    
    setFilteredLeads(result);
  }, [filters, leads]);
  
  const handleFilterChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
  };
  
  return (
    <>
      <PageHeader
        title="Lead Management"
        subtitle="Manage and track all your wedding leads"
        actions={
          <Button icon={<PlusCircle size={18} />}>Add New Lead</Button>
        }
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LeadFilters filters={filters} onFilterChange={handleFilterChange} />
        
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-lg font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {leads.length === 0
                ? "You don't have any leads yet. Create your first lead to get started."
                : "No leads match your current filters. Try adjusting your search criteria."}
            </p>
            {leads.length === 0 && (
              <div className="mt-6">
                <Button icon={<PlusCircle size={18} />}>Add New Lead</Button>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredLeads.map((lead) => (
              <LeadCard key={lead.lead_id} lead={lead} />
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
};

export default LeadsList;