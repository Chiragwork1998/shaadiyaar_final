import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  User,
  Phone,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Event } from '../../types';

interface EventListProps {
  events: Event[];
  selectedDate: Date;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: number) => void;
  onCreateEvent: () => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  selectedDate,
  onEditEvent,
  onDeleteEvent,
  onCreateEvent
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Events for {formatDate(selectedDate)}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {events.length} event{events.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
          </div>
          <Button
            onClick={onCreateEvent}
            className="h-8 md:h-9 text-xs md:text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Events List */}
      <div className="p-3 md:p-6">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No events scheduled</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No events are scheduled for {formatDate(selectedDate)}
            </p>
            <Button
              onClick={onCreateEvent}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Schedule Event
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <motion.div
                key={event.event_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-sm md:text-base font-semibold text-foreground">
                        {event.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.event_type)}`}>
                        {event.event_type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>
                          {formatTime(event.start_date)} - {formatTime(event.end_date)}
                        </span>
                      </div>

                      {event.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {event.client_name && (
                        <div className="flex items-center space-x-2">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span>{event.client_name}</span>
                        </div>
                      )}

                      {event.client_phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span>{event.client_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditEvent(event)}
                      className="h-7 w-7 p-0"
                      title="Edit Event"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEvent(event.event_id)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
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

export default EventList; 