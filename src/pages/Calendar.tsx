import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  Phone,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Settings
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Event } from '../types';
import { 
  fetchEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  fetchBlockedDates,
  createBlockedDate,
  deleteBlockedDate,
  supabase
} from '../lib/supabase';
import CalendarWidget from '../components/calendar/CalendarWidget';
import EventList from '../components/calendar/EventList';
import EventForm from '../components/calendar/EventForm';
import UpcomingEvents from '../components/calendar/UpcomingEvents';
import QuickStats from '../components/calendar/QuickStats';
import AvailableActions from '../components/calendar/AvailableActions';

const Calendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showBlockDateForm, setShowBlockDateForm] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const totalEvents = events.length;
    
    // Filter events by type with proper validation
    const allBookings = events.filter(event => {
      try {
        return event.event_type === 'booking';
      } catch (error) {
        console.warn('Error filtering booking events:', error);
        return false;
      }
    });
    
    // Count only actual bookings from bookings table (not manual booking events)
    const actualBookings = allBookings.filter(event => {
      try {
        return event.event_id.toString().startsWith('booking_');
      } catch (error) {
        console.warn('Error filtering actual bookings:', error);
        return false;
      }
    }).length;
    
    const tastings = events.filter(event => {
      try {
        return event.event_type === 'tasting';
      } catch (error) {
        console.warn('Error filtering tasting events:', error);
        return false;
      }
    }).length;
    
    const confirmed = events.filter(event => {
      try {
        return event.status === 'confirmed';
      } catch (error) {
        console.warn('Error filtering confirmed events:', error);
        return false;
      }
    }).length;

    // Debug logging
    console.log('Calendar Stats Calculation:', {
      totalEvents,
      actualBookings,
      manualBookings: allBookings.length - actualBookings,
      tastings,
      confirmed,
      eventTypes: events.map(e => ({ 
        id: e.event_id, 
        type: e.event_type, 
        status: e.status,
        isActualBooking: e.event_id.toString().startsWith('booking_')
      }))
    });

    return {
      totalEvents,
      bookings: actualBookings, // Only count actual bookings from bookings table
      tastings,
      confirmed
    };
  }, [events]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return events.filter(event => {
      try {
        const eventDate = new Date(event.start_date);
        if (isNaN(eventDate.getTime())) {
          console.warn('Invalid date for event:', event);
          return false;
        }
        const eventDateStr = eventDate.toISOString().split('T')[0];
        return eventDateStr === selectedDateStr;
      } catch (error) {
        console.warn('Error processing event date:', event, error);
        return false;
      }
    });
  }, [events, selectedDate]);

  // Get upcoming events (next 5)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => {
        try {
          const eventDate = new Date(event.start_date);
          if (isNaN(eventDate.getTime())) {
            console.warn('Invalid date for event:', event);
            return false;
          }
          return eventDate > now;
        } catch (error) {
          console.warn('Error processing event date:', event, error);
          return false;
        }
      })
      .sort((a, b) => {
        try {
          const dateA = new Date(a.start_date);
          const dateB = new Date(b.start_date);
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return 0;
          }
          return dateA.getTime() - dateB.getTime();
        } catch (error) {
          console.warn('Error sorting events:', error);
          return 0;
        }
      })
      .slice(0, 5);
  }, [events]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [eventsData, blockedDatesData] = await Promise.all([
          fetchEvents(),
          fetchBlockedDates()
        ]);
        setEvents(eventsData);
        setBlockedDates(blockedDatesData);
      } catch (error) {
        console.error('Error loading calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Real-time subscription for events
  useEffect(() => {
    const channel = supabase
      .channel('events_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
        console.log('Event change:', payload);
        if (payload.eventType === 'INSERT') {
          setEvents(prev => [...prev, payload.new as Event]);
        } else if (payload.eventType === 'UPDATE') {
          setEvents(prev => prev.map(event => 
            event.event_id === payload.new.event_id ? payload.new as Event : event
          ));
        } else if (payload.eventType === 'DELETE') {
          setEvents(prev => prev.filter(event => event.event_id !== payload.old.event_id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Real-time subscription for bookings (to sync with calendar)
  useEffect(() => {
    const channel = supabase
      .channel('bookings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, async (payload) => {
        console.log('Booking change detected:', payload);
        
        // Reload all events to get updated booking data
        try {
          const updatedEvents = await fetchEvents();
          setEvents(updatedEvents);
        } catch (error) {
          console.error('Error reloading events after booking change:', error);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      const newEvent = await createEvent({
        ...eventData,
        start_date: eventData.start_date,
        end_date: eventData.end_date
      });
      
      if (newEvent) {
        setEvents(prev => [...prev, newEvent]);
        setShowEventForm(false);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    try {
      const { eventId, ...updates } = eventData;
      const updatedEvent = await updateEvent(eventId, updates);
      
      if (updatedEvent) {
        setEvents(prev => prev.map(event => 
          event.event_id === eventId ? updatedEvent : event
        ));
        setShowEventForm(false);
        setEditingEvent(null);
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event.event_id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleSyncGoogleCalendar = () => {
    // Placeholder for Google Calendar sync
    console.log('Google Calendar sync functionality would be implemented here');
    alert('Google Calendar sync is not yet implemented. This would integrate with Google Calendar API.');
  };

  const handleGenerateTastingSlots = () => {
    // Placeholder for tasting slot generation
    console.log('Generate tasting slots functionality would be implemented here');
    alert('Tasting slot generation would create multiple tasting appointments based on availability.');
  };

  const handleBlockDate = async (startDate: string, endDate: string, reason: string) => {
    try {
      const newBlock = await createBlockedDate({
        start_date: startDate,
        end_date: endDate,
        reason
      });
      
      if (newBlock) {
        setBlockedDates(prev => [...prev, newBlock]);
        setShowBlockDateForm(false);
      }
    } catch (error) {
      console.error('Error blocking date:', error);
    }
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="w-full space-y-4 p-3 md:p-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-base md:text-lg lg:text-2xl font-semibold text-foreground">
                Calendar Integration
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Manage events, bookings, and tasting appointments
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleSyncGoogleCalendar}
                className="bg-primary text-primary-foreground hover:bg-accent-vibrant-purple-darker shadow-lg shadow-primary/20 h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
              >
                <ExternalLink className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Sync with Google Calendar
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateTastingSlots}
                className="h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
              >
                <Clock className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Generate Tasting Slots
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Calendar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Calendar Widget */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <CalendarWidget
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              events={events}
              blockedDates={blockedDates}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
            />
          </motion.div>

          {/* Right Column - Info and Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Upcoming Events */}
            <UpcomingEvents events={upcomingEvents} onEventClick={handleEditEvent} />

            {/* Quick Stats */}
            <QuickStats {...stats} />

            {/* Available Actions */}
            <AvailableActions
              onScheduleEvent={() => setShowEventForm(true)}
              onGenerateTastingSlots={handleGenerateTastingSlots}
              onBlockDate={() => setShowBlockDateForm(true)}
              onSyncGoogleCalendar={handleSyncGoogleCalendar}
            />
          </motion.div>
        </div>

        {/* Events for Selected Date */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EventList
            events={selectedDateEvents}
            selectedDate={selectedDate}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onCreateEvent={() => setShowEventForm(true)}
          />
        </motion.div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          event={editingEvent}
          selectedDate={selectedDate}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onClose={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Block Date Form Modal */}
      {showBlockDateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold">Block Unavailable Dates</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBlockDateForm(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs md:text-sm font-medium text-muted-foreground">Start Date</label>
                  <input
                    type="date"
                    className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="text-xs md:text-sm font-medium text-muted-foreground">End Date</label>
                  <input
                    type="date"
                    className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="text-xs md:text-sm font-medium text-muted-foreground">Reason</label>
                  <input
                    type="text"
                    placeholder="e.g., Holiday, Maintenance"
                    className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBlockDateForm(false)}
                    className="flex-1 h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      // Handle block date submission
                      setShowBlockDateForm(false);
                    }}
                    className="flex-1 h-8 text-xs"
                  >
                    Block Dates
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;