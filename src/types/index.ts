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

// Admin Authentication System Types
export interface Admin {
  admin_id: string;
  email: string;
  name: string;
  permissions: 'full' | 'limited';
  access_code: string;
  password_hash: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  parent_admin_id?: string;
  email_verified?: boolean;
  revoked_at?: string;
  revoked_by?: string;
}

export interface AdminSession {
  session_id: string;
  admin_id: string;
  access_code: string;
  login_time: string;
  is_active: boolean;
  email?: string; // NEW: Track which email logged in
}

// NEW: Email-based authentication types
export interface AdminEmail {
  id: number;
  admin_id: string; // UUID
  email: string;
  access_code: string;
  password_hash?: string;
  use_shared_password: boolean;
  status: 'active' | 'revoked' | 'pending';
  created_by: string; // UUID
  created_at: string;
  password_changed_at?: string;
  last_login?: string;
  revoked_at?: string;
  revoked_by?: string; // UUID
  email_verified: boolean;
  verification_token?: string;
  verification_expires_at?: string;
}

export interface AdminEmailSession {
  id: number;
  session_id: string;
  admin_id: string; // UUID
  email: string;
  access_code: string;
  login_time: string;
  logout_time?: string;
  is_active: boolean;
  ip_address?: string;
  user_agent?: string;
  last_activity: string;
}

export interface AdminEmailAuditLog {
  id: number;
  admin_id: string; // UUID
  email: string;
  action: 'created' | 'revoked' | 'password_changed' | 'login' | 'logout' | 'status_changed';
  action_data?: any;
  performed_by: string; // UUID
  created_at: string;
}

export interface AdminManagement {
  id: string;
  admin_id: string;
  action_type: 'create' | 'update' | 'delete' | 'password_change' | 'revoke_access' | 'email_management';
  target_admin_id?: string;
  action_data?: any;
  created_at: string;
  created_by?: string;
}

export interface AdminSessionsLog {
  log_id: string;
  session_id: string;
  admin_id: string;
  action: 'login' | 'logout' | 'timeout' | 'revoked';
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PendingApproval {
  approval_id: string;
  admin_id: string;
  action_type: 'booking' | 'part_payment';
  action_data: any;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  admin?: {
    admin_id: string;
    name: string;
    email: string;
  } | null;
}

export type AccessLevel = '00-01' | '02-03' | '03-04' | '05';

export interface PermissionMatrix {
  canViewDashboard: boolean;
  canViewFinancialData: boolean;
  canAddBookings: boolean;
  canEditBookings: boolean;
  canAddPartPayments: boolean;
  canEditPartPayments: boolean;
  canViewPayments: boolean;
  canViewCalendar: boolean;
  canManageAdmins: boolean;
  canApproveActions: boolean;
  canAccessInventory: boolean;
  canExportData: boolean;
}

export interface AuthContextType {
  user: Admin | null;
  session: AdminSession | null;
  userEmail: string | null;
  permissions: PermissionMatrix;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkPermission: (permission: keyof PermissionMatrix) => boolean;
  getUserDisplayName: () => string;
}

export interface Booking {
  booking_id: number | string; // Can be number for approved bookings or string for pending
  serial_no: string; // Format: O1, O2, etc. (Online booking numbers)
  unit: string; // UNIT-2, etc.
  
  // Client Details
  client_name: string;
  client_address: string;
  contact_number: string;
  date_of_birth?: string;
  
  // Event Details
  date_of_function: string; // D.O.F.
  occasion: string; // Wedding, Birthday, etc.
  custom_occasion_details?: string;
  hall: string; // Hall selection
  meal_type: string; // Lunch / Dinner
  timings_from: string;
  timings_to: string;
  pax: number; // Number of guests
  
  // Menu & Preferences
  menu: string;
  onion_preference?: string; // Onion field
  garlic_preference?: string; // Garlic field
  
  // Services
  flower_decoration: string;
  custom_flower_details?: string;
  dj_service: boolean;
  liquor_service: boolean;
  theme?: string;
  
  // Financial Details
  gross_amount: number;
  tax_amount: number;
  extra_plates_amount: number;
  total_amount: number;
  advance_paid: number;
  balance_amount: number;
  
  // Payment Details
  payment_mode?: string; // cash, bank_transfer, upi, other
  payment_mode_other?: string; // Custom text when "other" is selected
  miscellaneous_payments?: number; // Miscellaneous payments amount
  other_payments?: number; // Other payments amount
  
  // Additional Details
  btr?: string; // BTR field
  remarks?: string;
  
  // Status & Dates
  status: string;
  booking_date: string;
  created_at: string;
  updated_at: string;
  
  // Pending approval properties
  is_pending?: boolean;
  approval_id?: string;
}

export interface PartPayment {
  payment_id: number | string; // Can be number for approved payments or string for pending
  booking_id: number | string; // Can be number for approved bookings or string for pending
  client_name: string;
  amount: number;
  payment_date: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // Pending approval properties
  is_pending?: boolean;
  approval_id?: string;
}

export interface PaymentStage {
  stage_id: number;
  booking_id: number;
  stage_name: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'received' | 'overdue';
  payment_date?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  event_id: number;
  title: string;
  description?: string;
  event_type: 'booking' | 'tasting' | 'meeting' | 'followup' | 'reminder';
  start_date: string;
  end_date: string;
  all_day: boolean;
  location?: string;
  client_name?: string;
  client_phone?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  google_calendar_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarSettings {
  setting_id: number;
  user_id?: string;
  google_calendar_enabled: boolean;
  google_calendar_id?: string;
  sync_frequency: 'hourly' | 'daily' | 'manual';
  default_reminder_minutes: number;
  working_hours_start: string;
  working_hours_end: string;
  created_at: string;
  updated_at: string;
}

export interface EventReminder {
  reminder_id: number;
  event_id: number;
  reminder_type: 'email' | 'sms' | 'push';
  reminder_minutes: number;
  sent: boolean;
  created_at: string;
}

export interface BlockedDate {
  block_id: number;
  start_date: string;
  end_date: string;
  reason?: string;
  created_at: string;
}