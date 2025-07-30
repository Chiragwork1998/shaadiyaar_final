import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Lead } from '../../types';
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '../../utils/helpers';

interface LeadCardProps {
  lead: Lead;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const statusClass = getStatusColor(lead.status);
  const formattedDate = formatDate(lead.wedding_date);
  const formattedBudget = lead.numeric_budget ? formatCurrency(lead.numeric_budget) : lead.budget;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/leads/${lead.lead_id}`}>
        <Card hoverable className="p-5 h-full">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900">{lead.name}</h3>
            <Badge text={getStatusText(lead.status)} className={statusClass} />
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar size={16} className="mr-2 text-gray-400" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <MapPin size={16} className="mr-2 text-gray-400" />
              <span>{lead.location}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <DollarSign size={16} className="mr-2 text-gray-400" />
              <span>{formattedBudget}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Phone size={16} className="mr-2 text-gray-400" />
              <span>{lead.number}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              <span className="font-medium">Venue Type:</span> {lead.type_of_venue}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default LeadCard;