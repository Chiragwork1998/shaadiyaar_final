import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Lead } from '../../types';
import { formatDate, getStatusColor, getStatusText, calculateDaysLeft } from '../../utils/helpers';

interface UpcomingWeddingsProps {
  leads: Lead[];
}

const UpcomingWeddings: React.FC<UpcomingWeddingsProps> = ({ leads }) => {
  // Filter leads that have a wedding date and are booked
  const bookedLeads = leads.filter(
    (lead) => lead.status === 'booked' && lead.wedding_date
  );
  
  // Sort by wedding date (closest first)
  const sortedLeads = [...bookedLeads].sort((a, b) => {
    const daysLeftA = calculateDaysLeft(a.wedding_date);
    const daysLeftB = calculateDaysLeft(b.wedding_date);
    return daysLeftA - daysLeftB;
  });
  
  // Take only the next 5 weddings
  const upcomingWeddings = sortedLeads.slice(0, 5);
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Weddings</h3>
      
      {upcomingWeddings.length === 0 ? (
        <p className="text-gray-500 text-sm py-4">No upcoming weddings scheduled.</p>
      ) : (
        <div className="space-y-4">
          {upcomingWeddings.map((lead) => {
            const daysLeft = calculateDaysLeft(lead.wedding_date);
            const statusClass = getStatusColor(lead.status);
            
            return (
              <Link 
                key={lead.lead_id} 
                to={`/leads/${lead.lead_id}`}
                className="block hover:bg-gray-50 -mx-6 px-6 py-3 transition-colors duration-150"
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-base font-medium text-gray-900">{lead.name}</h4>
                  <Badge text={getStatusText(lead.status)} className={statusClass} />
                </div>
                
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1 text-gray-400" />
                    <span>{formatDate(lead.wedding_date)}</span>
                  </div>
                  
                  <span className="hidden sm:inline mx-2">•</span>
                  
                  <div className="flex items-center mt-1 sm:mt-0">
                    <MapPin size={16} className="mr-1 text-gray-400" />
                    <span>{lead.location}</span>
                  </div>
                  
                  {daysLeft > 0 && (
                    <span className="mt-1 sm:mt-0 sm:ml-auto text-xs font-medium text-rose-600">
                      {daysLeft} days left
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
      
      {upcomingWeddings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link 
            to="/leads?status=booked" 
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            View all upcoming weddings
          </Link>
        </div>
      )}
    </Card>
  );
};

export default UpcomingWeddings;