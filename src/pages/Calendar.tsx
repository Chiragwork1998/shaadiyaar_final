import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Filter, TrendingUp, Users, Clock } from 'lucide-react';
import { Lead } from '../types';
import { fetchLeads } from '../lib/supabase';
import { formatDate } from '../utils/helpers';
import LeadDetailsSheet from '../components/leads/LeadDetailsSheet';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await fetchLeads();
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getLeadsForDay = (date: Date) => {
    return leads.filter(lead => {
      const weddingDate = parseISO(lead.wedding_date);
      const createDate = parseISO(lead.lead_create_date);
      return (
        isSameDay(weddingDate, date) ||
        isSameDay(createDate, date)
      );
    });
  };

  const handleDayClick = (date: Date) => {
    const dayLeads = getLeadsForDay(date);
    if (dayLeads.length > 0) {
      setSelectedLead(dayLeads[0]);
    }
  };

  const upcomingWeddings = leads.filter(lead => {
    const weddingDate = parseISO(lead.wedding_date);
    return weddingDate > new Date() && lead.status === 'booked';
  }).length;

  const newLeadsThisMonth = leads.filter(lead => {
    const createDate = parseISO(lead.lead_create_date);
    const thisMonth = new Date();
    return createDate.getMonth() === thisMonth.getMonth() && createDate.getFullYear() === thisMonth.getFullYear();
  }).length;

  const StatCard = ({ title, value, icon: Icon, bgColor, iconColor }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={`p-3 ${bgColor} rounded-xl`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-serif font-semibold text-foreground">
              Wedding Calendar
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Track your leads and upcoming weddings</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="w-5 h-5 mr-2" /> Filter
            </Button>
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" /> Add Event
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Leads"
            value={leads.length}
            icon={Users}
            bgColor="bg-primary"
            iconColor="text-primary-foreground"
          />
          <StatCard
            title="New This Month"
            value={newLeadsThisMonth}
            icon={TrendingUp}
            bgColor="bg-theme-green"
            iconColor="text-primary-foreground"
          />
          <StatCard
            title="Upcoming Weddings"
            value={upcomingWeddings}
            icon={Clock}
            bgColor="bg-yellow-500"
            iconColor="text-white"
          />
        </div>

        {/* Calendar Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden"
        >
          {/* Calendar Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-semibold text-foreground">
                    {format(currentDate, 'MMMM yyyy')}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click on dates with events to view details
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={previousMonth}
                  className="h-10 w-10 rounded-full hover:bg-accent transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                  className="h-10 w-10 rounded-full hover:bg-accent transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted-foreground py-3 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {daysInMonth.map((date, dateIndex) => {
                const dayLeads = getLeadsForDay(date);
                const hasWedding = dayLeads.some(lead => isSameDay(parseISO(lead.wedding_date), date));
                const hasNewLead = dayLeads.some(lead => isSameDay(parseISO(lead.lead_create_date), date));
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isCurrentDay = isToday(date);

                return (
                  <motion.div
                    key={dateIndex}
                    className={`
                      aspect-square p-3 rounded-xl relative border transition-all duration-200
                      ${isCurrentMonth ? 'bg-card' : 'bg-muted/50'}
                      ${dayLeads.length > 0 ? 'cursor-pointer hover:shadow-lg' : 'hover:bg-accent'}
                      ${isCurrentDay ? 'ring-2 ring-primary border-primary' : 'border-border'}
                      ${dayLeads.length > 0 ? 'hover:border-primary' : ''}
                    `}
                    onClick={() => handleDayClick(date)}
                    onMouseEnter={() => setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    whileHover={{ scale: dayLeads.length > 0 ? 1.02 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`
                        text-sm font-semibold rounded-full w-8 h-8 flex items-center justify-center
                        ${isCurrentDay ? 'bg-primary text-primary-foreground' : 'text-foreground'}
                        ${!isCurrentMonth && 'text-muted-foreground'}
                      `}>
                        {format(date, 'd')}
                      </span>
                      <div className="flex space-x-1">
                        {hasWedding && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                        {hasNewLead && (
                          <div className="w-2 h-2 rounded-full bg-theme-green" />
                        )}
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      {dayLeads.slice(0, 2).map((lead) => (
                        <motion.div
                          key={lead.lead_id}
                          className={`
                            text-xs font-medium truncate px-2 py-1 rounded-md
                            ${isSameDay(parseISO(lead.wedding_date), date)
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-theme-green/10 text-theme-green border border-theme-green/20'
                            }
                          `}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {lead.name}
                        </motion.div>
                      ))}
                      {dayLeads.length > 2 && (
                        <div className="text-xs text-muted-foreground pl-2 font-medium">
                          +{dayLeads.length - 2} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mr-2" />
                  <span className="text-sm text-foreground font-medium">Wedding Date</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-theme-green mr-2" />
                  <span className="text-sm text-foreground font-medium">Lead Created</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {leads.length} total leads • {leads.filter(l => l.status === 'booked').length} weddings booked
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <LeadDetailsSheet
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        isEditMode={false}
        onLeadUpdate={loadLeads}
      />
    </div>
  );
};

export default Calendar;