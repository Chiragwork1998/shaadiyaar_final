import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import Button from '../ui/Button';
import { LeadFilters as FiltersType } from '../../types';

interface LeadFiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: FiltersType) => void;
}

const LeadFilters: React.FC<LeadFiltersProps> = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState<FiltersType>(filters);
  
  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
    { value: 'proposal_sent', label: 'Proposal Sent' },
    { value: 'booked', label: 'Booked' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters((prev) => ({ ...prev, search: e.target.value }));
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: localFilters.search });
  };
  
  const applyFilters = () => {
    onFilterChange(localFilters);
    setIsExpanded(false);
  };
  
  const clearFilters = () => {
    const emptyFilters: FiltersType = { search: localFilters.search };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setIsExpanded(false);
  };
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setLocalFilters(filters);
    }
  };
  
  const activeFilterCount = Object.keys(filters).filter(
    (key) => key !== 'search' && filters[key as keyof FiltersType]
  ).length;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            name="search"
            value={localFilters.search || ''}
            onChange={handleSearchChange}
            placeholder="Search leads by name or location..."
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          />
        </div>
      </form>
      
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            icon={<Filter size={16} />}
            onClick={toggleExpanded}
            className={activeFilterCount > 0 ? 'border-rose-300 text-rose-700' : ''}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-rose-100 text-rose-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <motion.div
          className="mt-4 pt-4 border-t border-gray-200"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={localFilters.status || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={localFilters.location || ''}
                onChange={handleInputChange}
                placeholder="Any location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            
            <div>
              <label htmlFor="venue_type" className="block text-sm font-medium text-gray-700 mb-1">
                Venue Type
              </label>
              <input
                type="text"
                id="venue_type"
                name="venue_type"
                value={localFilters.venue_type || ''}
                onChange={handleInputChange}
                placeholder="Any venue type"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            
            <div>
              <label htmlFor="min_budget" className="block text-sm font-medium text-gray-700 mb-1">
                Min Budget
              </label>
              <input
                type="number"
                id="min_budget"
                name="min_budget"
                value={localFilters.min_budget || ''}
                onChange={handleInputChange}
                placeholder="No minimum"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            
            <div>
              <label htmlFor="max_budget" className="block text-sm font-medium text-gray-700 mb-1">
                Max Budget
              </label>
              <input
                type="number"
                id="max_budget"
                name="max_budget"
                value={localFilters.max_budget || ''}
                onChange={handleInputChange}
                placeholder="No maximum"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={clearFilters} icon={<X size={16} />}>
              Clear Filters
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LeadFilters;