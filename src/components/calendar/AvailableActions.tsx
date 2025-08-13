import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus,
  Clock,
  Calendar as CalendarIcon,
  ExternalLink,
  Settings
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AvailableActionsProps {
  onScheduleEvent: () => void;
  onGenerateTastingSlots: () => void;
  onBlockDate: () => void;
  onSyncGoogleCalendar: () => void;
}

const AvailableActions: React.FC<AvailableActionsProps> = ({
  onScheduleEvent,
  onGenerateTastingSlots,
  onBlockDate,
  onSyncGoogleCalendar
}) => {
  const ActionItem: React.FC<{
    icon: React.ElementType;
    label: string;
    description: string;
    onClick: () => void;
    delay?: number;
  }> = ({ icon: Icon, label, description, onClick, delay = 0 }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Available Actions</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Quick calendar management
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-6">
        <div className="space-y-3">
          <ActionItem
            icon={Plus}
            label="Schedule New Event"
            description="Create a new calendar event"
            onClick={onScheduleEvent}
            delay={0}
          />
          <ActionItem
            icon={Clock}
            label="Generate Tasting Slots"
            description="Create multiple tasting appointments"
            onClick={onGenerateTastingSlots}
            delay={0.1}
          />
          <ActionItem
            icon={CalendarIcon}
            label="Block Unavailable Dates"
            description="Mark dates as unavailable"
            onClick={onBlockDate}
            delay={0.2}
          />
          <ActionItem
            icon={ExternalLink}
            label="Sync with Google Calendar"
            description="Connect with external calendar"
            onClick={onSyncGoogleCalendar}
            delay={0.3}
          />
        </div>
      </div>
    </div>
  );
};

export default AvailableActions; 