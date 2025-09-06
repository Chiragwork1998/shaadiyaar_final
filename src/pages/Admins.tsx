import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Mail, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Users,
  Activity,
  Key,
  Lock
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { 
  addEmailAccount, 
  revokeEmailAccount, 
  reactivateEmailAccount, 
  resetEmailPassword,
  setEmailPassword,
  getAllEmailAccounts
} from '../lib/supabase';
import { AdminEmail } from '../types';
import { getAccessLevelDisplayName } from '../utils/permissions';
import { toast } from 'react-hot-toast';

interface EmailAccountWithAdmin extends AdminEmail {
  admins?: {
    admin_id: string;
    name: string;
    access_code: string;
  };
}

const Admins = () => {
  const { user, checkPermission } = useAuth();
  const [emailAccounts, setEmailAccounts] = useState<EmailAccountWithAdmin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccessCode, setSelectedAccessCode] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<EmailAccountWithAdmin | null>(null);

  // Add form state
  const [newEmail, setNewEmail] = useState('');
  const [newAccessCode, setNewAccessCode] = useState('02-03');
  const [addingAccount, setAddingAccount] = useState(false);

  // Password change form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Check if user can manage admins
  const canManageAdmins = checkPermission('canManageAdmins');

  useEffect(() => {
    if (canManageAdmins) {
      loadEmailAccounts();
    }
  }, [canManageAdmins]);

  const loadEmailAccounts = async () => {
    try {
      const accounts = await getAllEmailAccounts();
      setEmailAccounts(accounts);
    } catch (error) {
      console.error('Error loading email accounts:', error);
      toast.error('Failed to load email accounts');
    }
  };

  const handleAddEmailAccount = async () => {
    if (!newEmail || !newAccessCode) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setAddingAccount(true);
      await addEmailAccount(newEmail, newAccessCode, user?.admin_id || '00-01');
      
      toast.success('Email account added successfully');
      setNewEmail('');
      setNewAccessCode('02-03');
      setShowAddForm(false);
      loadEmailAccounts();
    } catch (error) {
      console.error('Error adding email account:', error);
      toast.error('Failed to add email account');
    } finally {
      setAddingAccount(false);
    }
  };

  const handleRevokeAccount = async () => {
    if (!selectedAccount) return;
    
    try {
      await revokeEmailAccount(selectedAccount.id, user?.admin_id || '00-01');
      toast.success('Access revoked successfully');
      setShowRevokeDialog(false);
      setSelectedAccount(null);
      loadEmailAccounts();
    } catch (error) {
      console.error('Error revoking account:', error);
      toast.error('Failed to revoke access');
    }
  };

  const handleReactivateAccount = async (account: EmailAccountWithAdmin) => {
    try {
      await reactivateEmailAccount(account.id, user?.admin_id || '00-01');
      toast.success('Account reactivated successfully');
      loadEmailAccounts();
    } catch (error) {
      console.error('Error reactivating account:', error);
      toast.error('Failed to reactivate account');
    }
  };

  const handleResetPassword = async (account: EmailAccountWithAdmin) => {
    try {
      await resetEmailPassword(account.id, user?.admin_id || '00-01');
      toast.success('Password reset to shared password');
      loadEmailAccounts();
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const handleSetPassword = async () => {
    if (!selectedAccount) return;

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setChangingPassword(true);
      await setEmailPassword(selectedAccount.id, newPassword, user?.admin_id || '00-01');
      
      toast.success('Password set successfully');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordDialog(false);
      setSelectedAccount(null);
      loadEmailAccounts();
    } catch (error) {
      console.error('Error setting password:', error);
      toast.error('Failed to set password');
    } finally {
      setChangingPassword(false);
    }
  };

  const openPasswordDialog = (account: EmailAccountWithAdmin) => {
    setSelectedAccount(account);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordDialog(true);
  };

  const filteredAccounts = emailAccounts.filter(account => {
    const matchesSearch = account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.access_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAccessCode = selectedAccessCode === 'all' || account.access_code === selectedAccessCode;
    return matchesSearch && matchesAccessCode;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'revoked': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'revoked': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
  }
  };

  if (!canManageAdmins) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to manage admin accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen overflow-x-hidden">
      <div className="w-full max-w-full space-y-4 p-3 md:p-6 overflow-x-hidden">
      {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 overflow-x-hidden"
        >
          <div className="overflow-x-hidden">
            <h1 className="text-lg md:text-2xl font-semibold text-foreground">
              Admin Management
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Manage email accounts and access permissions
            </p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Email Account
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 overflow-x-hidden"
        >
          <div className="bg-card rounded-lg p-3 md:p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Accounts</p>
                <p className="text-lg md:text-2xl font-bold">{emailAccounts.length}</p>
          </div>
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
        </div>
      </div>

          <div className="bg-card rounded-lg p-3 md:p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Active</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">
                  {emailAccounts.filter(a => a.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-3 md:p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Revoked</p>
                <p className="text-lg md:text-2xl font-bold text-red-600">
                  {emailAccounts.filter(a => a.status === 'revoked').length}
                </p>
        </div>
              <XCircle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-3 md:p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Recent Activity</p>
                <p className="text-lg md:text-2xl font-bold text-purple-600">
                  {emailAccounts.filter(a => {
                    const lastLogin = a.last_login ? new Date(a.last_login) : null;
                    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    return lastLogin && lastLogin > oneDayAgo;
                  }).length}
                </p>
        </div>
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 overflow-x-hidden"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search email accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm"
            />
          </div>
          
          <select
            value={selectedAccessCode}
            onChange={(e) => setSelectedAccessCode(e.target.value)}
            className="px-4 py-2 bg-background border border-input rounded-lg text-sm"
          >
            <option value="all">All Access Levels</option>
            <option value="00-01">System Administrator (00-01)</option>
            <option value="02-03">Senior Employee (02-03)</option>
            <option value="03-04">Junior Employee (03-04)</option>
            <option value="05">Inventory Manager (05)</option>
          </select>
          
          <Button
            variant="outline"
            onClick={loadEmailAccounts}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        {/* Email Accounts Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-lg border border-border overflow-hidden max-w-full"
        >
          <div className="p-3 md:p-6 border-b border-border overflow-x-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 overflow-x-hidden">
              <div className="flex items-center overflow-x-hidden">
                <h2 className="text-base font-medium text-foreground">Email Accounts</h2>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({filteredAccounts.length} accounts)
                </span>
        </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block lg:hidden overflow-x-hidden">
            <div className="p-4 space-y-3 overflow-x-hidden">
              {filteredAccounts.map((account) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-background rounded-lg border border-border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-muted-foreground mr-2" />
                      <span className="font-medium text-sm">{account.email}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                      {getStatusIcon(account.status)}
                      <span className="ml-1">{account.status}</span>
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Access Level:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getAccessLevelDisplayName(account.access_code as any)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Last Login:</span>
                      <span className="text-xs text-muted-foreground">
                        {account.last_login ? new Date(account.last_login).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Password Type:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {account.use_shared_password ? 'Shared' : 'Individual'}
                      </span>
        </div>
      </div>

                  <div className="flex flex-col space-y-2 pt-2">
                    <div className="flex items-center space-x-2">
                      {account.status === 'active' ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowRevokeDialog(true);
                          }}
                          className="flex-1"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Revoke
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReactivateAccount(account)}
                          className="flex-1"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Reactivate
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPassword(account)}
                        className="flex-1"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Reset to Shared
                      </Button>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openPasswordDialog(account)}
                      className="w-full"
                    >
                      <Key className="w-3 h-3 mr-1" />
                      Set Custom Password
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              {filteredAccounts.length === 0 && (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No email accounts found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email Account
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Access Level
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Password Type
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-accent/50">
                    <td className="py-4 px-6">
                       <div className="flex items-center">
                        <Mail className="w-4 h-4 text-muted-foreground mr-2" />
                        <span className="font-medium">{account.email}</span>
                       </div>
                     </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getAccessLevelDisplayName(account.access_code as any)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                        {getStatusIcon(account.status)}
                        <span className="ml-1">{account.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {account.last_login ? new Date(account.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {account.use_shared_password ? 'Shared' : 'Individual'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {account.status === 'active' ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedAccount(account);
                              setShowRevokeDialog(true);
                            }}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Revoke
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReactivateAccount(account)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Reactivate
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(account)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reset to Shared
                        </Button>
                        
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openPasswordDialog(account)}
                        >
                          <Key className="w-3 h-3 mr-1" />
                          Set Password
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAccounts.length === 0 && (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No email accounts found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
        </div>
        </motion.div>
      </div>

      {/* Add Email Account Dialog */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold mb-4">Add Email Account</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@company.com"
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Access Level</label>
                <select
                  value={newAccessCode}
                  onChange={(e) => setNewAccessCode(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                >
                  <option value="02-03">Senior Employee (02-03)</option>
                  <option value="03-04">Junior Employee (03-04)</option>
                  <option value="05">Inventory Manager (05)</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                disabled={addingAccount}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddEmailAccount}
                disabled={addingAccount || !newEmail}
                className="w-full sm:w-auto"
                >
                {addingAccount ? 'Adding...' : 'Add Account'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Revoke Confirmation Dialog */}
      {showRevokeDialog && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-4 md:p-6 w-full max-w-md"
          >
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h2 className="text-lg font-semibold">Revoke Access</h2>
            </div>
            
            <p className="text-muted-foreground mb-4 text-sm">
              Are you sure you want to revoke access for <strong>{selectedAccount.email}</strong>? 
              This will immediately log them out and prevent future logins.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRevokeDialog(false)}
                className="w-full sm:w-auto"
                >
                  Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRevokeAccount}
                className="w-full sm:w-auto"
              >
                Revoke Access
              </Button>
              </div>
          </motion.div>
        </div>
      )}

      {/* Set Password Dialog */}
      {showPasswordDialog && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-4 md:p-6 w-full max-w-md"
          >
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-blue-500 mr-3" />
              <h2 className="text-lg font-semibold">Set Custom Password</h2>
            </div>
            
            <p className="text-muted-foreground mb-4 text-sm">
              Set a custom password for <strong>{selectedAccount.email}</strong>. 
              This will override the shared password for this account.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 pr-10 border border-input rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 pr-10 border border-input rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setSelectedAccount(null);
                }}
                disabled={changingPassword}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSetPassword}
                disabled={changingPassword || !newPassword || !confirmPassword}
                className="w-full sm:w-auto"
              >
                {changingPassword ? 'Setting...' : 'Set Password'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Admins;