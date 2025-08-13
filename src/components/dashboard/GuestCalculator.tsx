import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, Users, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';

interface GuestCalculatorProps {
  guestCount: number;
  onGuestCountChange: (count: number) => void;
  eventDate: string;
  onEventDateChange: (date: string) => void;
  onCalculate: () => void;
}

const GuestCalculator: React.FC<GuestCalculatorProps> = ({
  guestCount,
  onGuestCountChange,
  eventDate,
  onEventDateChange,
  onCalculate
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm"
    >
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 bg-primary rounded-lg">
          <Calculator className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Guest Calculator</h3>
          <p className="text-xs text-muted-foreground">Calculate inventory requirements</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Guest Count */}
        <div>
          <label className="text-sm font-medium text-foreground flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Guest Count
          </label>
          <input
            type="number"
            value={guestCount}
            onChange={(e) => onGuestCountChange(parseInt(e.target.value) || 0)}
            className="w-full mt-1 px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            placeholder="Enter guest count"
            min="1"
          />
        </div>

        {/* Event Date */}
        <div>
          <label className="text-sm font-medium text-foreground flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Event Date
          </label>
          <div className="relative mt-1">
            <input
              type="date"
              value={eventDate}
              onChange={(e) => onEventDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              placeholder="dd/mm/yyyy"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={onCalculate}
          className="w-full bg-primary text-primary-foreground hover:bg-accent-vibrant-purple-darker shadow-lg shadow-primary/20 h-9 text-sm"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Requirements
        </Button>
      </div>

      {/* Info Section */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          The calculator will estimate inventory requirements based on the guest count and event date. 
          This helps in planning stock levels for upcoming events.
        </p>
      </div>
    </motion.div>
  );
};

export default GuestCalculator; 