import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Phone,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Event } from '../../types';

interface EventFormProps {
  event?: Event | null;
  selectedDate: Date;
  onSubmit: (eventData: any) => void;
  onClose: () => void;
}

const EventForm: React.FC<EventFormProps> = ({
  event,
  selectedDate,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'meeting',
    start_date: '',
    end_date: '',
    all_day: false,
    location: '',
    client_name: '',
    client_phone: '',
    status: 'scheduled'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        event_type: event.event_type,
        start_date: event.start_date,
        end_date: event.end_date,
        all_day: event.all_day,
        location: event.location || '',
        client_name: event.client_name || '',
        client_phone: event.client_phone || '',
        status: event.status
      });
    } else {
      // Set default start date to selected date
      const defaultStartDate = new Date(selectedDate);
      defaultStartDate.setHours(9, 0, 0, 0); // 9 AM
      
      const defaultEndDate = new Date(selectedDate);
      defaultEndDate.setHours(10, 0, 0, 0); // 10 AM

      setFormData({
        title: '',
        description: '',
        event_type: 'meeting',
        start_date: defaultStartDate.toISOString().slice(0, 16),
        end_date: defaultEndDate.toISOString().slice(0, 16),
        all_day: false,
        location: '',
        client_name: '',
        client_phone: '',
        status: 'scheduled'
      });
    }
  }, [event, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      };

      if (event) {
        await onSubmit({ eventId: event.event_id, ...submitData });
      } else {
        await onSubmit(submitData);
      }
    } catch (error) {
      console.error('Error submitting event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h2 className="text-base md:text-lg font-semibold">
                {event ? 'Edit Event' : 'Schedule New Event'}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs md:text-sm font-medium text-muted-foreground">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div>
                <label className="text-xs md:text-sm font-medium text-muted-foreground">
                  Event Type *
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => handleInputChange('event_type', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="booking">Booking</option>
                  <option value="tasting">Tasting</option>
                  <option value="meeting">Meeting</option>
                  <option value="followup">Follow-up</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs md:text-sm font-medium text-muted-foreground">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter event description"
                rows={3}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs md:text-sm font-medium text-muted-foreground">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="text-xs md:text-sm font-medium text-muted-foreground">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="all_day"
                checked={formData.all_day}
                onChange={(e) => handleInputChange('all_day', e.target.checked)}
                className="rounded border-input"
              />
              <label htmlFor="all_day" className="text-xs md:text-sm font-medium text-muted-foreground">
                All day event
              </label>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs md:text-sm font-medium text-muted-foreground">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter event location"
              />
            </div>

            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs md:text-sm font-medium text-muted-foreground">
                  Client Name
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange('client_name', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="text-xs md:text-sm font-medium text-muted-foreground">
                  Client Phone
                </label>
                <input
                  type="tel"
                  value={formData.client_phone}
                  onChange={(e) => handleInputChange('client_phone', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter client phone"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs md:text-sm font-medium text-muted-foreground">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-8 md:h-9 text-xs md:text-sm"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-8 md:h-9 text-xs md:text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EventForm; 