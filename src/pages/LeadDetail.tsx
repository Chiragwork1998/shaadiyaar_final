import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Phone, 
  Building, 
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LeadStatusUpdater from '../components/leads/LeadStatusUpdater';
import Spinner from '../components/ui/Spinner';
import { getLead } from '../lib/supabase';
import { Lead } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getStatusText,
  calculateDaysLeft
} from '../utils/helpers';

const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;
      
      try {
        const data = await getLead(id);
        setLead(data);
      } catch (error) {
        console.error('Error fetching lead:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLead();
  }, [id]);
  
  const handleStatusUpdated = async () => {
    if (!id) return;
    
    try {
      const updatedLead = await getLead(id);
      setLead(updatedLead);
    } catch (error) {
      console.error('Error refreshing lead data:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!lead) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h2 className="text-2xl font-medium text-gray-900">Lead not found</h2>
        <p className="mt-2 text-gray-500">The lead you're looking for doesn't exist or was deleted.</p>
        <div className="mt-6">
          <Link to="/leads">
            <Button variant="primary">Back to Leads</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const statusClass = getStatusColor(lead.status);
  const formattedDate = formatDate(lead.wedding_date);
  const formattedBudget = lead.numeric_budget ? formatCurrency(lead.numeric_budget) : lead.budget;
  const daysLeft = calculateDaysLeft(lead.wedding_date);
  
  return (
    <>
      <PageHeader
        title={lead.name}
        subtitle={
          <div className="flex items-center mt-1">
            <Badge text={getStatusText(lead.status)} className={statusClass} />
            <span className="ml-2 text-gray-500">•</span>
            <span className="ml-2 text-gray-500">{lead.lead_type}</span>
          </div>
        }
        actions={
          <div className="flex space-x-2">
            <Link to="/leads">
              <Button variant="outline" icon={<ArrowLeft size={18} />}>
                Back to Leads
              </Button>
            </Link>
            <Button variant="primary" icon={<Edit size={18} />}>
              Edit Lead
            </Button>
          </div>
        }
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Lead Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Wedding Date</p>
                        <p className="mt-1 text-base text-gray-900">{formattedDate}</p>
                        {daysLeft > 0 && (
                          <p className="mt-1 text-sm text-rose-600">
                            {daysLeft} days remaining
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="mt-1 text-base text-gray-900">{lead.location}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-start">
                      <DollarSign className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Budget</p>
                        <p className="mt-1 text-base text-gray-900">{formattedBudget}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact Number</p>
                        <p className="mt-1 text-base text-gray-900">{lead.number}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-start">
                      <Building className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Venue Type</p>
                        <p className="mt-1 text-base text-gray-900">{lead.type_of_venue}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Lead Created</p>
                        <p className="mt-1 text-base text-gray-900">
                          {formatDate(lead.lead_create_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                  <Button 
                    variant="danger" 
                    size="sm" 
                    icon={<Trash2 size={16} />}
                    className="text-sm"
                  >
                    Delete Lead
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
          
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <LeadStatusUpdater
                leadId={lead.lead_id}
                currentStatus={lead.status}
                onStatusUpdated={handleStatusUpdated}
              />
              
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
                
                <div className="relative pl-8 pb-1 border-l-2 border-gray-200">
                  <div className="absolute w-4 h-4 bg-rose-500 rounded-full -left-[9px] top-0" />
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-900">Lead Created</p>
                    <p className="text-xs text-gray-500">{formatDate(lead.lead_create_date)}</p>
                  </div>
                </div>
                
                {lead.status !== 'new' && (
                  <div className="relative pl-8 pb-1 border-l-2 border-gray-200">
                    <div className="absolute w-4 h-4 bg-indigo-500 rounded-full -left-[9px] top-0" />
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-900">Status Updated: {getStatusText(lead.status)}</p>
                      <p className="text-xs text-gray-500">Date updated would be shown here</p>
                    </div>
                  </div>
                )}
                
                <div className="relative pl-8">
                  <div className="absolute w-4 h-4 bg-gray-300 rounded-full -left-[9px] top-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">Wedding Day</p>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadDetail;