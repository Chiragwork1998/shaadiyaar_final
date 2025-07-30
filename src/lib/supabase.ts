import { createClient } from '@supabase/supabase-js';
import { Admin } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export const updateAdmin = async (adminId: string, updates: Partial<{ name: string; permissions: 'full' | 'limited' }>) => {
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