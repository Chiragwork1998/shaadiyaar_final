import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Event } from '../../types';

interface CalendarWidgetProps {
  currentMonth: Date;
  selectedDate: Date;
  events: Event[];
  blockedDates: any[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  currentMonth,
  selectedDate,
  events,
  blockedDates,
  onDateSelect,
  onMonthChange
}) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.start_date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.some(block => {
      const startDate = new Date(block.start_date);
      const endDate = new Date(block.end_date);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'booking':
        return 'bg-blue-500';
      case 'tasting':
        return 'bg-green-500';
      case 'meeting':
        return 'bg-purple-500';
      case 'followup':
        return 'bg-orange-500';
      case 'reminder':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const days = getDaysInMonth(currentMonth);
  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.getMonth();
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      {/* Calendar Header */}
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Event Calendar</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Select a date to view events
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMonthChange('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMonthChange('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-3 md:p-6">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isBlocked = isDateBlocked(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            const isSelectedDate = isSelected(date);

            return (
              <motion.div
                key={index}
                className={`
                  aspect-square p-1 md:p-2 rounded-lg relative border transition-all duration-200 cursor-pointer
                  ${isCurrentMonthDay ? 'bg-card' : 'bg-muted/30'}
                  ${isBlocked ? 'bg-red-50 border-red-200' : 'border-border'}
                  ${isSelectedDate ? 'ring-2 ring-primary border-primary' : ''}
                  ${isTodayDate ? 'ring-1 ring-primary/50' : ''}
                  hover:bg-accent hover:border-primary
                `}
                onClick={() => onDateSelect(date)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start justify-between">
                  <span className={`
                    text-xs md:text-sm font-medium rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center
                    ${isSelectedDate ? 'bg-primary text-primary-foreground' : 'text-foreground'}
                    ${!isCurrentMonthDay && 'text-muted-foreground'}
                    ${isBlocked && 'text-red-600'}
                  `}>
                    {date.getDate()}
                  </span>
                  <div className="flex space-x-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`w-1.5 h-1.5 rounded-full ${getEventTypeColor(event.event_type)}`}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Event indicators */}
                {dayEvents.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.event_id}
                        className={`
                          text-xs truncate px-1 py-0.5 rounded text-white
                          ${getEventTypeColor(event.event_type)}
                        `}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                )}

                {/* Blocked indicator */}
                {isBlocked && (
                  <div className="absolute inset-0 bg-red-100/50 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-red-600 font-medium">Blocked</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-3 md:px-6 py-3 border-t border-border bg-muted/30">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Booking</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Tasting</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span>Meeting</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span>Follow-up</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>Reminder</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget; 