import React, { createContext, useContext, useEffect, useState } from 'react';
import { Admin, AdminSession, PermissionMatrix, AuthContextType, AdminEmailSession } from '../types';
import { 
  loginWithAccessCode, 
  logoutAdmin, 
  getCurrentSession,
  loginWithEmail,
  logoutEmailSession,
  getCurrentEmailSession,
  supabase
} from '../lib/supabase';
import { getPermissionMatrix, isValidAccessCode, getAccessLevelDisplayName } from '../utils/permissions';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userEmail: null,
  permissions: {
    canViewDashboard: false,
    canViewFinancialData: false,
    canAddBookings: false,
    canEditBookings: false,
    canAddPartPayments: false,
    canEditPartPayments: false,
    canViewPayments: false,
    canViewCalendar: false,
    canManageAdmins: false,
    canApproveActions: false,
    canAccessInventory: false,
  },
  loading: true,
  login: async () => false,
  logout: async () => {},
  checkPermission: () => false,
  getUserDisplayName: () => '',
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Admin | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<PermissionMatrix>({
    canViewDashboard: false,
    canViewFinancialData: false,
    canAddBookings: false,
    canEditBookings: false,
    canAddPartPayments: false,
    canEditPartPayments: false,
    canViewPayments: false,
    canViewCalendar: false,
    canManageAdmins: false,
    canApproveActions: false,
    canAccessInventory: false,
  });
  const [loading, setLoading] = useState(true);

  // Detect if this is a mobile web app
  const isMobileWebApp = () => {
    if (typeof window === 'undefined') return false;
    return (window.navigator as any).standalone || 
           window.matchMedia('(display-mode: standalone)').matches ||
           document.referrer.includes('android-app://') ||
           /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Session refresh mechanism for mobile web apps
  const refreshSession = async (sessionId: string) => {
    try {
      // Update last activity in database
      await supabase
        .from('admin_email_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_id', sessionId);
      
      console.log('Session refreshed for mobile web app');
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const sessionId = localStorage.getItem('admin_session_id');
        const storedEmail = localStorage.getItem('user_email');
        
        if (sessionId) {
          // Try email-based session first
          const emailSession = await getCurrentEmailSession(sessionId);
          if (emailSession) {
            // Email-based session found
            const { data: admin } = await supabase
              .from('admins')
              .select('*')
              .eq('admin_id', emailSession.admin_id)
              .single();
              
            if (admin) {
              setUser(admin);
              setSession({
                session_id: emailSession.session_id,
                admin_id: emailSession.admin_id,
                access_code: emailSession.access_code,
                login_time: emailSession.login_time,
                is_active: emailSession.is_active,
                email: emailSession.email
              });
              setUserEmail(emailSession.email);
              const userPermissions = getPermissionMatrix(emailSession.access_code as any);
              setPermissions(userPermissions);

              // For mobile web apps, refresh session periodically
              if (isMobileWebApp()) {
                // Refresh session every 30 minutes for mobile web apps
                const refreshInterval = setInterval(() => {
                  refreshSession(sessionId);
                }, 30 * 60 * 1000); // 30 minutes

                // Cleanup interval on unmount
                return () => clearInterval(refreshInterval);
              }
            }
          } else {
            // Try legacy session
          const sessionData = await getCurrentSession(sessionId);
          if (sessionData) {
            setUser(sessionData.admins);
            setSession(sessionData);
            const userPermissions = getPermissionMatrix(sessionData.admins.access_code);
            setPermissions(userPermissions);
          } else {
            // Invalid session, clear it
            localStorage.removeItem('admin_session_id');
              localStorage.removeItem('user_email');
            }
          }
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        localStorage.removeItem('admin_session_id');
        localStorage.removeItem('user_email');
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Check if identifier is an email or access code
      const isEmail = identifier.includes('@');
      
      if (isEmail) {
        // Email-based login
        const { admin, session: newSession, email } = await loginWithEmail(identifier, password);
        
        setUser(admin);
        setSession(newSession);
        setUserEmail(email);
        
        // Store session info in localStorage with extended expiry for mobile
        localStorage.setItem('admin_session_id', newSession.session_id);
        localStorage.setItem('user_email', email);
        
        // For mobile web apps, set a longer expiry
        if (isMobileWebApp()) {
          localStorage.setItem('session_expiry', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()); // 24 hours
        }
        
        const userPermissions = getPermissionMatrix(admin.access_code as any);
        setPermissions(userPermissions);
        
        console.log('Email login successful:', email, 'with access level:', admin.access_code);
        return true;
      } else {
        // Legacy access code login
        if (!isValidAccessCode(identifier)) {
        throw new Error('Invalid access code format');
      }

        const { admin, session: newSession } = await loginWithAccessCode(identifier, password);
      
      setUser(admin);
      setSession(newSession);
        setUserEmail(null);
        
        // Store session info in localStorage
        localStorage.setItem('admin_session_id', newSession.session_id);
        localStorage.removeItem('user_email'); // Clear email for access code login
      
        const userPermissions = getPermissionMatrix(admin.access_code as any);
      setPermissions(userPermissions);
      
        console.log('Access code login successful:', admin.name, 'with access level:', admin.access_code);
      return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const sessionId = localStorage.getItem('admin_session_id');
      if (sessionId) {
        // Try email-based logout first
        await logoutEmailSession(sessionId);
      } else {
        // Legacy logout
        await logoutAdmin(sessionId || '');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('admin_session_id');
      localStorage.removeItem('user_email');
      localStorage.removeItem('session_expiry');
      
      // Clear state
      setUser(null);
      setSession(null);
      setUserEmail(null);
      setPermissions({
        canViewDashboard: false,
        canViewFinancialData: false,
        canAddBookings: false,
        canEditBookings: false,
        canAddPartPayments: false,
        canEditPartPayments: false,
        canViewPayments: false,
        canViewCalendar: false,
        canManageAdmins: false,
        canApproveActions: false,
        canAccessInventory: false,
      });
    }
  };

  const checkPermission = (permission: keyof PermissionMatrix): boolean => {
    return permissions[permission] || false;
  };

  const getUserDisplayName = (): string => {
    if (userEmail) {
      return `${userEmail} (${getAccessLevelDisplayName((user?.access_code as any) || '')})`;
    }
    return user?.name || 'Unknown User';
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userEmail,
      permissions,
      loading,
      login,
      logout,
      checkPermission,
      getUserDisplayName,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};