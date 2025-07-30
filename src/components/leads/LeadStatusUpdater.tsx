import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../ui/select';
import { Button } from '../ui/button';
import { LeadStatus } from '../../types';
import { updateLeadStatus } from '../../lib/supabase';

interface LeadStatusUpdaterProps {
  leadId: string;
  currentStatus: string;
  onStatusUpdated: () => void;
}

const LeadStatusUpdater: React.FC<LeadStatusUpdaterProps> = ({
  leadId,
  currentStatus,
  onStatusUpdated,
}) => {
  const [status, setStatus] = React.useState<string>(currentStatus);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
    { value: 'proposal_sent', label: 'Proposal Sent' },
    { value: 'booked', label: 'Booked' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
  ];
  
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setSuccess(false);
    setError(null);
  };
  
  const handleUpdateStatus = async () => {
    if (status === currentStatus) return;

    // Optimistic update
    const prevStatus = currentStatus;
    setIsUpdating(true);
    setSuccess(false);
    setError(null);
    onStatusUpdated && onStatusUpdated(); // Optimistically update parent if needed

    try {
      await updateLeadStatus(leadId, status);
      setIsUpdating(false);
      setSuccess(true);
      // No need to call onStatusUpdated again, real-time will sync
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setIsUpdating(false);
      setError('Failed to update status. Please try again.');
      setStatus(prevStatus); // Revert status
      onStatusUpdated && onStatusUpdated(); // Revert parent if needed
      console.error(err);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Update Lead Status</h3>
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-grow">
          <Select
            value={status}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger>
              {statusOptions.find(option => option.value === status)?.label || 'Select status'}
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={handleUpdateStatus}
          disabled={isUpdating || status === currentStatus}
          className="whitespace-nowrap"
        >
          {isUpdating ? 'Updating...' : 'Update Status'}
        </Button>
      </div>
      
      {success && (
        <motion.div
          className="mt-2 flex items-center text-sm text-green-600"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <CheckCircle size={16} className="mr-1" />
          Status updated successfully!
        </motion.div>
      )}
      
      {error && (
        <motion.div
          className="mt-2 flex items-center text-sm text-red-600"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <XCircle size={16} className="mr-1" />
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default LeadStatusUpdater;