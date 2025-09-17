import { createClient } from '@supabase/supabase-js';
import { Admin, AdminSession, Lead, Booking, PartPayment, Event, AdminEmail, AdminEmailSession, AdminEmailAuditLog } from '../types';
import { toast } from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email-based authentication functions
export const loginWithEmail = async (email: string, password: string) => {
  try {
    // Step 1: Find email account
    const { data: emailAccount, error: emailError } = await supabase
      .from('admin_emails')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('status', 'active')
      .single();

    if (emailError || !emailAccount) {
      throw new Error('Email not found or access revoked');
    }

    // Step 2: Get the parent admin record
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('admin_id', emailAccount.admin_id)
      .single();

    if (adminError || !admin) {
      throw new Error('Admin account not found');
    }

    // Step 3: Verify password
    let isValidPassword = false;
    
    if (emailAccount.use_shared_password) {
      // Use shared password from admins table
      isValidPassword = await verifyPassword(password, admin.password_hash || '');
    } else {
      // Use individual password
      if (!emailAccount.password_hash) {
        throw new Error('Individual password not set');
      }
      isValidPassword = await verifyPassword(password, emailAccount.password_hash);
    }

    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Step 4: Create session
    const session = await createAdminEmailSession(admin.admin_id, emailAccount.access_code, email);

    // Step 5: Update last login
    await supabase
      .from('admin_emails')
      .update({ last_login: new Date().toISOString() })
      .eq('id', emailAccount.id);

    // Step 6: Log audit
    await logEmailAudit(emailAccount.admin_id, email, 'login', {
      session_id: session.session_id,
      ip_address: await getClientIP()
    });

    return {
      admin,
      session,
      email: emailAccount.email,
      accessCode: emailAccount.access_code
    };

  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const createAdminEmailSession = async (adminId: string, accessCode: string, email: string) => {
  const sessionId = generateSessionId();
  
  const { data: session, error } = await supabase
    .from('admin_email_sessions')
    .insert([{
      session_id: sessionId,
      admin_id: adminId,
      email: email,
      access_code: accessCode,
      login_time: new Date().toISOString(),
      is_active: true,
      ip_address: await getClientIP(),
      user_agent: navigator.userAgent
    }])
    .select()
    .single();

  if (error) throw error;
  
  // Store session in localStorage
  localStorage.setItem('admin_session_id', sessionId);
  localStorage.setItem('user_email', email);
  
  return session;
};

export const logoutEmailSession = async (sessionId: string) => {
  try {
    // Update session as inactive
    await supabase
      .from('admin_email_sessions')
      .update({
        is_active: false,
        logout_time: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    // Log audit
    const session = await getCurrentEmailSession(sessionId);
    if (session) {
      await logEmailAudit(session.admin_id, session.email, 'logout', {
        session_id: sessionId
      });
    }

    // Clear localStorage
    localStorage.removeItem('admin_session_id');
    localStorage.removeItem('user_email');
    
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getCurrentEmailSession = async (sessionId: string): Promise<AdminEmailSession | null> => {
  try {
    const { data: session, error } = await supabase
      .from('admin_email_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .single();

    if (error || !session) {
      return null;
    }

    // Check if session is expired (24 hours for mobile web apps, 8 hours for desktop)
    const loginTime = new Date(session.login_time);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
    
    // Detect if this is a mobile web app
    const isMobileWebApp = (window.navigator as any).standalone || 
                          window.matchMedia('(display-mode: standalone)').matches ||
                          document.referrer.includes('android-app://') ||
                          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const maxSessionHours = isMobileWebApp ? 24 : 8; // 24 hours for mobile, 8 for desktop

    if (hoursDiff > maxSessionHours) {
      // Session expired, logout
      await logoutEmailSession(sessionId);
      return null;
    }

    // Update last activity
    await supabase
      .from('admin_email_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_id', sessionId);

    return session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

// Email management functions for Super Admin (01)
export const addEmailAccount = async (email: string, accessCode: string, createdBy: string) => {
  try {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('admin_emails')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      throw new Error('Email already exists');
}

    // Get the admin_id for the access code
    const { data: admin } = await supabase
      .from('admins')
      .select('admin_id')
      .eq('access_code', accessCode)
      .single();

    if (!admin) {
      throw new Error('Access code not found');
    }

    // Add email account
    const { data: emailAccount, error } = await supabase
      .from('admin_emails')
      .insert([{
        admin_id: admin.admin_id,
        email: email.toLowerCase(),
        access_code: accessCode,
        use_shared_password: true,
        created_by: createdBy
      }])
      .select()
      .single();

    if (error) throw error;

    // Log audit
    await logEmailAudit(admin.admin_id, email, 'created', {
      created_by: createdBy,
      access_code: accessCode
    });

    return emailAccount;
  } catch (error) {
    console.error('Error adding email account:', error);
    throw error;
  }
};

export const revokeEmailAccount = async (emailId: number, revokedBy: string) => {
  try {
    const { data: emailAccount, error } = await supabase
      .from('admin_emails')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: revokedBy
      })
      .eq('id', emailId)
      .select()
      .single();

    if (error) throw error;

    // Log audit
    await logEmailAudit(emailAccount.admin_id, emailAccount.email, 'revoked', {
      revoked_by: revokedBy
    });

    // Force logout any active sessions for this email
    await supabase
      .from('admin_email_sessions')
      .update({
        is_active: false,
        logout_time: new Date().toISOString()
      })
      .eq('email', emailAccount.email)
      .eq('is_active', true);

    return emailAccount;
  } catch (error) {
    console.error('Error revoking email account:', error);
    throw error;
  }
};

export const reactivateEmailAccount = async (emailId: number, reactivatedBy: string) => {
  try {
    const { data: emailAccount, error } = await supabase
      .from('admin_emails')
      .update({
        status: 'active',
        revoked_at: null,
        revoked_by: null
      })
      .eq('id', emailId)
      .select()
      .single();

    if (error) throw error;

    // Log audit
    await logEmailAudit(emailAccount.admin_id, emailAccount.email, 'status_changed', {
      new_status: 'active',
      reactivated_by: reactivatedBy
    });

    return emailAccount;
  } catch (error) {
    console.error('Error reactivating email account:', error);
    throw error;
  }
};

export const resetEmailPassword = async (emailId: number, resetBy: string) => {
  try {
    const { data: emailAccount, error } = await supabase
      .from('admin_emails')
      .update({
        password_hash: null,
        use_shared_password: true,
        password_changed_at: new Date().toISOString()
      })
      .eq('id', emailId)
      .select()
      .single();

    if (error) throw error;

    // Log audit
    await logEmailAudit(emailAccount.admin_id, emailAccount.email, 'password_changed', {
      reset_by: resetBy,
      reset_to_shared: true
    });

    return emailAccount;
  } catch (error) {
    console.error('Error resetting email password:', error);
    throw error;
  }
};

export const setEmailPassword = async (emailId: number, newPassword: string, setBy: string) => {
  try {
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    const { data: emailAccount, error } = await supabase
      .from('admin_emails')
      .update({
        password_hash: hashedPassword,
        use_shared_password: false,
        password_changed_at: new Date().toISOString()
      })
      .eq('id', emailId)
      .select()
      .single();

    if (error) throw error;

    // Log audit
    await logEmailAudit(emailAccount.admin_id, emailAccount.email, 'password_changed', {
      set_by: setBy,
      set_custom_password: true
    });

    return emailAccount;
  } catch (error) {
    console.error('Error setting email password:', error);
    throw error;
  }
};

export const getAllEmailAccounts = async () => {
  try {
    const { data: emailAccounts, error } = await supabase
      .from('admin_emails')
      .select(`
        *,
        admins (
          admin_id,
          name,
          access_code
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return emailAccounts;
  } catch (error) {
    console.error('Error getting email accounts:', error);
    throw error;
  }
};

export const getEmailAccountsByAccessCode = async (accessCode: string) => {
  try {
    const { data: emailAccounts, error } = await supabase
      .from('admin_emails')
      .select('*')
      .eq('access_code', accessCode)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return emailAccounts;
  } catch (error) {
    console.error('Error getting email accounts by access code:', error);
    throw error;
  }
};

// Audit logging
export const logEmailAudit = async (adminId: string, email: string, action: string, actionData?: any) => {
  try {
    // Get the current user admin_id from session or use the provided adminId
    let performedBy = adminId; // Default to the admin_id being operated on
    
    // Try to get from current session
    const sessionId = localStorage.getItem('admin_session_id');
    if (sessionId) {
      const session = await getCurrentEmailSession(sessionId);
      if (session) {
        performedBy = session.admin_id;
      }
    }

    const { error } = await supabase
      .from('admin_email_audit_log')
      .insert([{
        admin_id: adminId,
        email: email,
        action: action,
        action_data: actionData || {},
        performed_by: performedBy
      }]);

    if (error) {
      console.error('Error logging audit:', error);
      // Don't throw error to avoid breaking the main flow
    }
  } catch (error) {
    console.error('Error in logEmailAudit:', error);
    // Don't throw error to avoid breaking the main flow
  }
};

// Utility functions
export const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
};

export const verifyPassword = async (password: string, hash: string) => {
  // For now, use simple comparison since all passwords are the same
  // In production, you should use proper bcrypt verification
  if (!hash) return false;
  
  // Check if it's a bcrypt hash
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    // For demo purposes, assume password is "password" for all accounts
    // In production, use proper bcrypt.compare(password, hash)
    return password === 'password';
  }
  
  // Simple comparison for non-hashed passwords
  return password === hash;
};

export const hashPassword = async (password: string) => {
  // For demo purposes, return the password as-is
  // In production, use proper bcrypt hashing
  return password;
};

// Leads Management Functions
export const fetchLeads = async () => {
  try {
    console.log('Fetching leads');
    
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        lead_assignments(
          assignment_id,
          vendor_id,
          assigned_at,
          vendors(
            name,
            subscription_plan
          )
        )
      `)
      .order('lead_create_date', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error.message, error.details);
      throw error;
    }

    console.log('Successfully fetched leads:', data);
    return data || [];
  } catch (error) {
    console.error('Error in fetchLeads:', error);
    throw error;
  }
};

export const getLead = async (leadId: string) => {
  try {
    console.log('Fetching single lead:', leadId);
    
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        lead_assignments(
          assignment_id,
          vendor_id,
          assigned_at,
          vendors(
            name,
            subscription_plan
          )
        )
      `)
      .eq('lead_id', leadId)
      .single();

    if (error) {
      console.error('Error fetching lead:', error.message, error.details);
      throw error;
    }

    console.log('Successfully fetched lead:', data);
    return data;
  } catch (error) {
    console.error('Error in getLead:', error);
    throw error;
  }
};

export const updateLeadStatus = async (leadId: string, status: string) => {
  try {
    console.log('Updating lead status:', { leadId, status });
    
    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('lead_id', leadId)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead status:', error.message, error.details);
      throw error;
    }

    console.log('Successfully updated lead status:', data);
    return data;
  } catch (error) {
    console.error('Error in updateLeadStatus:', error);
    throw error;
  }
};

// Admin Management Functions
export const fetchAdmins = async () => {
  try {
    console.log('Fetching admins');
    
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admins:', error.message, error.details);
      throw error;
    }

    console.log('Successfully fetched admins:', data);
    return data || [];
  } catch (error) {
    console.error('Error in fetchAdmins:', error);
    throw error;
  }
};

export const addAdmin = async (admin: { email: string; name: string; permissions: 'full' | 'limited' }) => {
  try {
    console.log('Adding admin via Edge Function:', admin);
    
    // Get the current session for authentication
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    if (!token) {
      throw new Error('No user session found. Please log in again.');
    }

    // Call the Edge Function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/add-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: admin.email,
        name: admin.name,
        permissions: admin.permissions
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Edge Function error:', result);
      throw new Error(result.error || 'Failed to add admin');
    }

    console.log('Successfully added admin via Edge Function:', result);
    return result;
  } catch (error) {
    console.error('Error in addAdmin:', error);
    throw error;
  }
};

export const updateAdminBasic = async (adminId: string, updates: Partial<{ name: string; permissions: 'full' | 'limited' }>) => {
  try {
    console.log('Updating admin:', { adminId, updates });

    // Check if this would remove the last full admin
    if (updates.permissions === 'limited') {
      const { data: fullAdmins } = await supabase
        .from('admins')
        .select('*')
        .eq('permissions', 'full');

      if (fullAdmins && fullAdmins.length === 1 && fullAdmins[0].admin_id === adminId) {
        throw new Error('Cannot change permissions of the last full admin');
      }
    }

    const { data, error } = await supabase
      .from('admins')
      .update(updates)
      .eq('admin_id', adminId)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin:', error.message, error.details);
      throw error;
    }

    console.log('Successfully updated admin:', data);
    return data;
  } catch (error) {
    console.error('Error in updateAdmin:', error);
    throw error;
  }
};

// Renamed from deleteAdmin: only deletes from 'admins' table, not auth.users
export const deleteAdminRecord = async (adminId: string) => {
  try {
    console.log('Deleting admin record from table:', adminId);

    // Check if this is the last full admin (this logic might be redundant if Edge Function also checks)
    const { data: adminsResponse } = await supabase
      .from('admins')
      .select('admin_id, permissions') 
      .eq('permissions', 'full');

    const fullAdmins = adminsResponse || [];
    const adminToDelete = fullAdmins.find(admin => admin.admin_id === adminId);

    if (adminToDelete && fullAdmins.length === 1) {
      throw new Error('Cannot delete the last full admin record via this method.');
    }

    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('admin_id', adminId);

    if (error) {
      console.error('Error deleting admin record:', error.message, error.details);
      throw error;
    }

    console.log('Successfully deleted admin record:', adminId);
  } catch (error) {
    console.error('Error in deleteAdminRecord:', error);
    throw error;
  }
};

// Delete admin function - simplified to work directly with the database
export const deleteAdmin = async (adminIdToDelete: string) => {
  try {
    console.log('Deleting admin:', adminIdToDelete);

    // Check if this is the last full admin
    const { data: fullAdmins } = await supabase
      .from('admins')
      .select('admin_id, permissions') 
      .eq('permissions', 'full');

    const adminToDelete = fullAdmins?.find(admin => admin.admin_id === adminIdToDelete);

    if (adminToDelete && fullAdmins && fullAdmins.length === 1) {
      throw new Error('Cannot delete the last full admin');
    }

    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('admin_id', adminIdToDelete);

    if (error) {
      console.error('Error deleting admin:', error.message, error.details);
      throw error;
    }

    console.log('Successfully deleted admin:', adminIdToDelete);
    return { success: true, message: 'Admin deleted successfully' };
  } catch (error) {
    console.error('Error in deleteAdmin:', error);
    throw error;
  }
};

// Booking functions
export const fetchBookings = async () => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }

    console.log('Successfully fetched bookings:', data);
    return data || [];
  } catch (error) {
    console.error('Error in fetchBookings:', error);
    throw error;
  }
};

export const fetchBookingsWithPending = async () => {
  try {
    // Fetch approved bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      throw bookingsError;
    }

    // Fetch pending approvals for bookings
    const { data: pendingApprovals, error: pendingError } = await supabase
      .from('pending_approvals')
      .select('*')
      .eq('action_type', 'booking')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (pendingError) {
      console.error('Error fetching pending approvals:', pendingError);
      throw pendingError;
    }

    // Convert pending approvals to booking format
    const pendingBookings = (pendingApprovals || []).map(approval => ({
      ...approval.action_data,
      booking_id: `pending_${approval.approval_id}`, // Use a special ID for pending
      status: 'pending_approval',
      created_at: approval.created_at,
      is_pending: true,
      approval_id: approval.approval_id
    }));

    // Combine approved bookings and pending bookings
    const allBookings = [...(bookings || []), ...pendingBookings];
    
    // Sort by created_at descending
    allBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log('Successfully fetched bookings with pending:', allBookings);
    return allBookings;
  } catch (error) {
    console.error('Error in fetchBookingsWithPending:', error);
    throw error;
  }
};

export const createBooking = async (bookingData: any) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    console.log('Successfully created booking:', data);
    return data?.[0];
  } catch (error) {
    console.error('Error in createBooking:', error);
    throw error;
  }
};

export const updateBooking = async (bookingId: number, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('booking_id', bookingId)
      .select();

    if (error) {
      console.error('Error updating booking:', error);
      throw error;
    }

    console.log('Successfully updated booking:', data);
    return data?.[0];
  } catch (error) {
    console.error('Error in updateBooking:', error);
    throw error;
  }
};

export const deleteBooking = async (bookingId: number) => {
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('booking_id', bookingId);

    if (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }

    console.log('Successfully deleted booking:', bookingId);
    return true;
  } catch (error) {
    console.error('Error in deleteBooking:', error);
    throw error;
  }
};

export const getBooking = async (bookingId: number) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getBooking:', error);
    throw error;
  }
};

// Function to get the next unit-specific serial number for bookings
export const getNextSerialNumber = async (unit: string): Promise<string> => {
  try {
    // Get all bookings and pending approvals for the specific unit to find the highest serial number
    const [bookingsResponse, pendingResponse] = await Promise.all([
      supabase.from('bookings').select('serial_no').eq('unit', unit).order('serial_no', { ascending: false }).limit(1),
      supabase.from('pending_approvals').select('action_data').eq('action_type', 'booking').eq('status', 'pending')
    ]);

    if (bookingsResponse.error) {
      console.error('Error fetching bookings for serial number:', bookingsResponse.error);
      throw bookingsResponse.error;
    }

    if (pendingResponse.error) {
      console.error('Error fetching pending approvals for serial number:', pendingResponse.error);
      throw pendingResponse.error;
    }

    let highestNumber = 0;

    // Check approved bookings for this unit
    if (bookingsResponse.data && bookingsResponse.data.length > 0) {
      const latestBooking = bookingsResponse.data[0];
      if (latestBooking.serial_no) {
        // Extract O prefix and number (e.g., "O5" -> 5)
        const match = latestBooking.serial_no.match(/^O(\d+)$/);
        if (match) {
          highestNumber = Math.max(highestNumber, parseInt(match[1]));
        }
      }
    }

    // Check pending approvals for this unit
    if (pendingResponse.data && pendingResponse.data.length > 0) {
      pendingResponse.data.forEach(approval => {
        if (approval.action_data && approval.action_data.serial_no && approval.action_data.unit === unit) {
          const match = approval.action_data.serial_no.match(/^O(\d+)$/);
          if (match) {
            highestNumber = Math.max(highestNumber, parseInt(match[1]));
          }
        }
      });
    }

    // Generate next number (increment by 1)
    const nextNumber = highestNumber + 1;
    
    // Format as O1, O2, O3, etc. (without leading zeros)
    const serialNumber = `O${nextNumber}`;

    console.log(`Generated next serial number for ${unit}: ${serialNumber} (from highest: ${highestNumber})`);
    return serialNumber;
  } catch (error) {
    console.error('Error generating next serial number:', error);
    // Fallback to random number if there's an error
    const randomNum = Math.floor(Math.random() * 999) + 1;
    return `O${randomNum}`;
  }
};


// Part Payment functions
export const fetchPartPayments = async () => {
  try {
    const { data, error } = await supabase
      .from('part_payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching part payments:', error);
      throw error;
    }

    console.log('Successfully fetched part payments:', data);
    return data || [];
  } catch (error) {
    console.error('Error in fetchPartPayments:', error);
    throw error;
  }
};

export const fetchPartPaymentsWithPending = async () => {
  try {
    // Fetch approved part payments
    const { data: payments, error: paymentsError } = await supabase
      .from('part_payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('Error fetching part payments:', paymentsError);
      throw paymentsError;
    }

    // Fetch pending approvals for part payments
    const { data: pendingApprovals, error: pendingError } = await supabase
      .from('pending_approvals')
      .select('*')
      .eq('action_type', 'part_payment')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (pendingError) {
      console.error('Error fetching pending approvals:', pendingError);
      throw pendingError;
    }

    // Convert pending approvals to part payment format
    const pendingPayments = (pendingApprovals || []).map(approval => ({
      ...approval.action_data,
      payment_id: `pending_${approval.approval_id}`, // Use a special ID for pending
      created_at: approval.created_at,
      is_pending: true,
      approval_id: approval.approval_id,
      // Ensure booking_id is properly set from action_data
      booking_id: approval.action_data.booking_id || 0
    }));

    // Combine approved payments and pending payments
    const allPayments = [...(payments || []), ...pendingPayments];
    
    // Sort by created_at descending
    allPayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log('Successfully fetched part payments with pending:', allPayments);
    return allPayments;
  } catch (error) {
    console.error('Error in fetchPartPaymentsWithPending:', error);
    throw error;
  }
};

export const createPartPayment = async (paymentData: any) => {
  try {
    const { data, error } = await supabase
      .from('part_payments')
      .insert([paymentData])
      .select();

    if (error) {
      console.error('Error creating part payment:', error);
      throw error;
    }

    console.log('Successfully created part payment:', data);
    return data?.[0];
  } catch (error) {
    console.error('Error in createPartPayment:', error);
    throw error;
  }
};

export const updatePartPayment = async (paymentId: number, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('part_payments')
      .update(updates)
      .eq('payment_id', paymentId)
      .select();

    if (error) {
      console.error('Error updating part payment:', error);
      throw error;
    }

    console.log('Successfully updated part payment:', data);
    return data?.[0];
  } catch (error) {
    console.error('Error in updatePartPayment:', error);
    throw error;
  }
};

export const deletePartPayment = async (paymentId: number) => {
  try {
    const { error } = await supabase
      .from('part_payments')
      .delete()
      .eq('payment_id', paymentId);

    if (error) {
      console.error('Error deleting part payment:', error);
      throw error;
    }

    console.log('Successfully deleted part payment:', paymentId);
    return true;
  } catch (error) {
    console.error('Error in deletePartPayment:', error);
    throw error;
  }
};

export const getPartPayment = async (paymentId: number) => {
  try {
    const { data, error } = await supabase
      .from('part_payments')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    if (error) {
      console.error('Error fetching part payment:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getPartPayment:', error);
    throw error;
  }
};

// Payment Stage functions
export const fetchPaymentStages = async () => {
  try {
    const { data, error } = await supabase
      .from('payment_stages')
      .select(`
        *,
        bookings (
          booking_id,
          serial_no,
          client_name,
          event_date
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment stages:', error);
      throw error;
    }

    console.log('Successfully fetched payment stages:', data);
    return data || [];
  } catch (error) {
    console.error('Error in fetchPaymentStages:', error);
    throw error;
  }
};

export const createPaymentStage = async (stageData: any) => {
  try {
    const { data, error } = await supabase
      .from('payment_stages')
      .insert([stageData])
      .select();

    if (error) {
      console.error('Error creating payment stage:', error);
      throw error;
    }

    console.log('Successfully created payment stage:', data);
    return data?.[0];
  } catch (error) {
    console.error('Error in createPaymentStage:', error);
    throw error;
  }
};

export const updatePaymentStage = async (stageId: number, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('payment_stages')
      .update(updates)
      .eq('stage_id', stageId)
      .select();

    if (error) {
      console.error('Error updating payment stage:', error);
      throw error;
    }

    console.log('Successfully updated payment stage:', data);
    return data?.[0];
  } catch (error) {
    console.error('Error in updatePaymentStage:', error);
    throw error;
  }
};

export const deletePaymentStage = async (stageId: number) => {
  try {
    const { error } = await supabase
      .from('payment_stages')
      .delete()
      .eq('stage_id', stageId);

    if (error) {
      console.error('Error deleting payment stage:', error);
      throw error;
    }

    console.log('Successfully deleted payment stage:', stageId);
    return true;
  } catch (error) {
    console.error('Error in deletePaymentStage:', error);
    throw error;
  }
};

export const getPaymentStage = async (stageId: number) => {
  try {
    const { data, error } = await supabase
      .from('payment_stages')
      .select(`
        *,
        bookings (
          booking_id,
          serial_no,
          client_name,
          event_date
        )
      `)
      .eq('stage_id', stageId)
      .single();

    if (error) {
      console.error('Error fetching payment stage:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getPaymentStage:', error);
    throw error;
  }
};

// Calendar Event functions
export const fetchEvents = async () => {
  try {
    // First, get all events from the events table
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    // Then, get all bookings and convert them to events
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('event_date', { ascending: true });

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      throw bookingsError;
    }

    // Convert bookings to events
    const bookingEvents = bookingsData.map(booking => {
      // Ensure proper date formatting
      const eventDate = new Date(booking.event_date);
      if (isNaN(eventDate.getTime())) {
        console.warn('Invalid booking date:', booking);
        return null;
      }
      
      // Format time properly
      const timeSlot = booking.slot || '18:00';
      const [hours, minutes] = timeSlot.split(':').map(Number);
      eventDate.setHours(hours || 18, minutes || 0, 0, 0);
      
      return {
        event_id: `booking_${booking.booking_id}`,
        title: `${booking.client_name} - ${booking.serial_no}`,
        description: `Booking for ${booking.client_name}`,
        event_type: 'booking',
        start_date: eventDate.toISOString(),
        end_date: eventDate.toISOString(),
        all_day: false,
        location: booking.address || 'Venue TBD',
        client_name: booking.client_name,
        client_phone: booking.contact_number,
        status: booking.status === 'pending' ? 'scheduled' : booking.status === 'confirmed' ? 'confirmed' : 'completed',
        google_calendar_id: null,
        created_at: booking.created_at,
        updated_at: booking.updated_at
      };
    }).filter(Boolean); // Remove null entries

    // Combine events and booking events
    const allEvents = [...(eventsData || []), ...bookingEvents];
    
    // Debug logging for event types
    console.log('Calendar Events Breakdown:', {
      totalEvents: allEvents.length,
      manualEvents: eventsData?.length || 0,
      bookingEvents: bookingEvents.length,
      eventTypes: allEvents.map(e => ({ 
        id: e.event_id, 
        type: e.event_type, 
        status: e.status,
        title: e.title 
      }))
    });
    
    console.log('Successfully fetched events:', allEvents);
    return allEvents;
  } catch (error) {
    console.error('Error in fetchEvents:', error);
    throw error;
  }
};

export const createEvent = async (eventData: any) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select();

    if (error) {
      console.error('Error creating event:', error);
      throw error;
    }

    console.log('Successfully created event:', data);
    return data?.[0];
  } catch (error) {
    console.error('Error in createEvent:', error);
    throw error;
  }
};

export const updateEvent = async (eventId: number, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('event_id', eventId)
      .select();

    if (error) {
      console.error('Error updating event:', error);
      throw error;
    }

    console.log('Successfully updated event:', data);
    return data?.[0];
  } catch (error) {
    console.error('Error in updateEvent:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId: number) => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('event_id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      throw error;
    }

    console.log('Successfully deleted event:', eventId);
    return true;
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    throw error;
  }
};

export const getEvent = async (eventId: number) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getEvent:', error);
    throw error;
  }
};

// Calendar Settings functions
export const fetchCalendarSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('calendar_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching calendar settings:', error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in fetchCalendarSettings:', error);
    throw error;
  }
};

export const updateCalendarSettings = async (settings: any) => {
  try {
    const { data, error } = await supabase
      .from('calendar_settings')
      .upsert([settings])
      .select();

    if (error) {
      console.error('Error updating calendar settings:', error);
      throw error;
    }

    console.log('Successfully updated calendar settings:', data);
    return data?.[0];
  } catch (error) {
    console.error('Error in updateCalendarSettings:', error);
    throw error;
  }
};

// Blocked Dates functions
export const fetchBlockedDates = async () => {
  try {
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching blocked dates:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchBlockedDates:', error);
    throw error;
  }
};

export const createBlockedDate = async (blockData: any) => {
  try {
    const { data, error } = await supabase
      .from('blocked_dates')
      .insert([blockData])
      .select();

    if (error) {
      console.error('Error creating blocked date:', error);
      throw error;
    }

    console.log('Successfully created blocked date:', data);
    return data?.[0];
  } catch (error) {
    console.error('Error in createBlockedDate:', error);
    throw error;
  }
};

export const deleteBlockedDate = async (blockId: number) => {
  try {
    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('block_id', blockId);

    if (error) {
      console.error('Error deleting blocked date:', error);
      throw error;
    }

    console.log('Successfully deleted blocked date:', blockId);
    return true;
  } catch (error) {
    console.error('Error in deleteBlockedDate:', error);
    throw error;
  }
};

// Admin Authentication Functions
export const loginWithAccessCode = async (accessCode: string, password: string) => {
  try {
    console.log('🔍 Attempting login with access code:', accessCode);
    console.log('🔍 Access code type:', typeof accessCode);
    console.log('🔍 Access code length:', accessCode.length);
    console.log('🔍 Access code trimmed:', `"${accessCode.trim()}"`);
    
    // Find admin with this access code - using a simpler approach
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('access_code', accessCode.trim());

    console.log('📊 Query result:', { admins, adminError });
    console.log('📊 Error details:', adminError);

    if (adminError) {
      console.error('❌ Database error:', adminError);
      throw new Error('Database error');
    }

    if (!admins || admins.length === 0) {
      console.log('❌ No admin found with access code:', accessCode);
      throw new Error('Invalid access code');
    }

    const admin = admins[0];
    console.log('✅ Admin found:', admin.name);

    // Check if account is active
    if (!admin.is_active) {
      console.log('❌ Account is inactive:', admin.name);
      throw new Error('Account is inactive');
    }

    // Verify password (in real app, use bcrypt.compare)
    // For now, we'll use a simple check - in production use proper bcrypt
    console.log('🔐 Verifying password for admin:', admin.name);
    console.log('📝 Expected hash:', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
    console.log('📝 Actual hash:', admin.password_hash);
    
    if (admin.password_hash !== '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi') {
      console.log('❌ Password verification failed');
      throw new Error('Invalid password');
    }
    
    console.log('✅ Password verified successfully');

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .insert([{
        admin_id: admin.admin_id,
        access_code: accessCode,
        is_active: true
      }])
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    // Log the login
    await supabase
      .from('admin_sessions_log')
      .insert([{
        session_id: session.session_id,
        admin_id: admin.admin_id,
        action: 'login',
        ip_address: '127.0.0.1', // In real app, get from request
        user_agent: navigator.userAgent
      }]);

    // Update last login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('admin_id', admin.admin_id);

    console.log('Successfully logged in admin:', admin.name);
    return { admin, session };
  } catch (error) {
    console.error('Error in loginWithAccessCode:', error);
    throw error;
  }
};

export const logoutAdmin = async (sessionId: string) => {
  try {
    // First get the session to get admin_id for logging
    const { data: sessionData } = await supabase
      .from('admin_sessions')
      .select('admin_id')
      .eq('session_id', sessionId)
      .single();

    // Log the logout if we have session data
    if (sessionData?.admin_id) {
      await supabase
        .from('admin_sessions_log')
        .insert([{
          session_id: sessionId,
          admin_id: sessionData.admin_id,
          action: 'logout'
        }]);
    }

    // Deactivate the session
    const { error } = await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error deactivating session:', error);
      // Don't throw error, just log it
    }

    console.log('Successfully logged out admin');
    return true;
  } catch (error) {
    console.error('Error in logoutAdmin:', error);
    // Don't throw error, just return false
    return false;
  }
};

export const getCurrentSession = async (sessionId: string) => {
  try {
    const { data, error } = await supabase
      .from('admin_sessions')
      .select(`
        *,
        admins (
          admin_id,
          email,
          name,
          permissions,
          access_code,
          is_active,
          last_login,
          created_at
        )
      `)
      .eq('session_id', sessionId)
      .single();

    if (error) {
      throw error;
    }

    // Check if session is active
    if (!data || !data.is_active) {
      throw new Error('Session is inactive');
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentSession:', error);
    throw error;
  }
};

// Pending Approvals Functions
export const createPendingApproval = async (approvalData: any) => {
  try {
    const { data, error } = await supabase
      .from('pending_approvals')
      .insert([approvalData])
      .select();

    if (error) {
      console.error('Error creating pending approval:', error);
      throw error;
    }

    console.log('Successfully created pending approval:', data);
    return data?.[0];
  } catch (error) {
    console.error('Error in createPendingApproval:', error);
    throw error;
  }
};

export const fetchPendingApprovals = async () => {
  try {
    // First get pending approvals without join
    const { data: approvals, error: approvalsError } = await supabase
      .from('pending_approvals')
      .select('*')
      .order('created_at', { ascending: false });

    if (approvalsError) {
      console.error('Error fetching pending approvals:', approvalsError);
      throw approvalsError;
    }

    // If no approvals, return empty array
    if (!approvals || approvals.length === 0) {
      return [];
    }

    // Get admin details separately
    const adminIds = [...new Set(approvals.map(a => a.admin_id))];
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('admin_id, name, email')
      .in('admin_id', adminIds);

    if (adminsError) {
      console.error('Error fetching admins for approvals:', adminsError);
      // Continue without admin details
    }

    // Combine the data
    const adminsMap = new Map(admins?.map(a => [a.admin_id, a]) || []);
    const result = approvals.map(approval => ({
      ...approval,
      admin: adminsMap.get(approval.admin_id) || null
    }));

    console.log('Successfully fetched pending approvals:', result);
    return result;
  } catch (error) {
    console.error('Error in fetchPendingApprovals:', error);
    throw error;
  }
};

export const updatePendingApproval = async (approvalId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('pending_approvals')
      .update(updates)
      .eq('approval_id', approvalId)
      .select();

    if (error) {
      console.error('Error updating pending approval:', error);
      throw error;
    }

    console.log('Successfully updated pending approval:', data);
    return data?.[0];
  } catch (error) {
    console.error('Error in updatePendingApproval:', error);
    throw error;
  }
};

export const getPendingApproval = async (approvalId: string) => {
  try {
    const { data, error } = await supabase
      .from('pending_approvals')
      .select('*')
      .eq('approval_id', approvalId)
      .single();

    if (error) {
      console.error('Error fetching pending approval:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getPendingApproval:', error);
    throw error;
  }
};

// Admin Management Functions
export const fetchAllAdmins = async () => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

export const createAdmin = async (adminData: any, createdBy: string) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .insert([adminData])
      .select();

    if (error) {
      throw error;
    }

    // Log the action
    await supabase
      .from('admin_management')
      .insert([{
        admin_id: createdBy,
        action_type: 'create',
        target_admin_id: data?.[0]?.admin_id,
        action_data: adminData,
        created_by: createdBy
      }]);

    return data?.[0];
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

export const updateAdmin = async (adminId: string, updates: any, updatedBy: string) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .update(updates)
      .eq('admin_id', adminId)
      .select();

    if (error) {
      throw error;
    }

    // Log the action
    await supabase
      .from('admin_management')
      .insert([{
        admin_id: updatedBy,
        action_type: 'update',
        target_admin_id: adminId,
        action_data: updates,
        created_by: updatedBy
      }]);

    return data?.[0];
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};

export const revokeAdminAccess = async (adminId: string, revokedBy: string) => {
  try {
    // Deactivate admin
    const { error: updateError } = await supabase
      .from('admins')
      .update({ is_active: false })
      .eq('admin_id', adminId);

    if (updateError) {
      throw updateError;
    }

    // Deactivate all active sessions
    const { error: sessionError } = await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('admin_id', adminId);

    if (sessionError) {
      throw sessionError;
    }

    // Log the action
    await supabase
      .from('admin_management')
      .insert([{
        admin_id: revokedBy,
        action_type: 'revoke_access',
        target_admin_id: adminId,
        created_by: revokedBy
      }]);

    console.log('Successfully revoked access for admin:', adminId);
    return true;
  } catch (error) {
    console.error('Error revoking admin access:', error);
    throw error;
  }
};

export const fetchAdminSessionsLog = async () => {
  try {
    const { data, error } = await supabase
      .from('admin_sessions_log')
      .select(`
        *,
        admins (
          admin_id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching admin sessions log:', error);
    throw error;
  }
};

export const changeUserPassword = async (email: string, currentPassword: string, newPassword: string) => {
  try {
    // Step 1: Find email account
    const { data: emailAccount, error: emailError } = await supabase
      .from('admin_emails')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('status', 'active')
      .single();

    if (emailError || !emailAccount) {
      throw new Error('Email account not found or access revoked');
    }

    // Step 2: Get the parent admin record
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('admin_id', emailAccount.admin_id)
      .single();

    if (adminError || !admin) {
      throw new Error('Admin account not found');
    }

    // Step 3: Verify current password
    let isValidCurrentPassword = false;
    
    if (emailAccount.use_shared_password) {
      // Verify against shared password
      isValidCurrentPassword = await verifyPassword(currentPassword, admin.password_hash || '');
    } else {
      // Verify against individual password
      if (!emailAccount.password_hash) {
        throw new Error('Individual password not set');
      }
      isValidCurrentPassword = await verifyPassword(currentPassword, emailAccount.password_hash);
    }

    if (!isValidCurrentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Step 4: Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Step 5: Update password
    const { data: updatedAccount, error: updateError } = await supabase
      .from('admin_emails')
      .update({
        password_hash: hashedNewPassword,
        use_shared_password: false, // Switch to individual password
        password_changed_at: new Date().toISOString()
      })
      .eq('id', emailAccount.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Step 6: Log audit
    await logEmailAudit(emailAccount.admin_id, email, 'password_changed', {
      changed_by: email,
      ip_address: await getClientIP()
    });

    return updatedAccount;

  } catch (error) {
    console.error('Password change error:', error);
    throw error;
  }
};

export const resetToSharedPassword = async (email: string, currentPassword: string) => {
  try {
    // Step 1: Find email account
    const { data: emailAccount, error: emailError } = await supabase
      .from('admin_emails')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('status', 'active')
      .single();

    if (emailError || !emailAccount) {
      throw new Error('Email account not found or access revoked');
    }

    // Step 2: Get the parent admin record
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('admin_id', emailAccount.admin_id)
      .single();

    if (adminError || !admin) {
      throw new Error('Admin account not found');
    }

    // Step 3: Verify current password (either shared or individual)
    let isValidCurrentPassword = false;
    
    if (emailAccount.use_shared_password) {
      // Verify against shared password
      isValidCurrentPassword = await verifyPassword(currentPassword, admin.password_hash || '');
    } else {
      // Verify against individual password
      if (!emailAccount.password_hash) {
        throw new Error('Individual password not set');
      }
      isValidCurrentPassword = await verifyPassword(currentPassword, emailAccount.password_hash);
    }

    if (!isValidCurrentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Step 4: Reset to shared password
    const { data: updatedAccount, error: updateError } = await supabase
      .from('admin_emails')
      .update({
        password_hash: null,
        use_shared_password: true,
        password_changed_at: new Date().toISOString()
      })
      .eq('id', emailAccount.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Step 5: Log audit
    await logEmailAudit(emailAccount.admin_id, email, 'password_changed', {
      reset_to_shared: true,
      changed_by: email,
      ip_address: await getClientIP()
    });

    return updatedAccount;

  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};