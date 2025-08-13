import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { Event } from '../../types';

interface UpcomingEventsProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  events,
  onEventClick
}) => {
  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'booking':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'tasting':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'meeting':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'followup':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'reminder':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Upcoming Events</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Next 5 scheduled events
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-6">
        {events.length === 0 ? (
          <div className="text-center py-6">
            <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <motion.div
                key={event.event_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onEventClick(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {event.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getEventTypeColor(event.event_type)}`}>
                        {event.event_type}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDate(event.start_date)} at {formatTime(event.start_date)}
                        </span>
                      </div>

                      {event.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}

                      {event.client_name && (
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span className="truncate">{event.client_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents; 