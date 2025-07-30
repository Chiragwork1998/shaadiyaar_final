export interface Lead {
  lead_id: string;
  name: string;
  number: string;
  lead_type: string;
  wedding_date: string;
  budget: string;
  location: string;
  type_of_venue: string;
  lead_create_date: string;
  numeric_budget: number;
  time_to_book_days: number;
  status: string;
}

export type LeadStatus = 'new' | 'contacted' | 'meeting_scheduled' | 'proposal_sent' | 'booked' | 'cancelled' | 'completed';

export interface LeadFilters {
  status?: string;
  location?: string;
  venue_type?: string;
  min_budget?: number;
  max_budget?: number;
  search?: string;
}

export interface Admin {
  admin_id: string;
  email: string;
  name: string;
  permissions: 'full' | 'limited';
  created_at: string;
}