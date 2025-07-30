import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Mail, 
  User, 
  Shield,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from '../components/ui/label';
import { supabase, addAdmin, updateAdmin, deleteAdmin } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Admin } from '../types';
import toast from 'react-hot-toast';

const Admins = () => {
  const { user, loading: authLoading } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [newAdmin, setNewAdmin] = useState<{
    email: string;
    name: string;
    permissions: 'limited' | 'full';
  }>({ 
    email: '', 
    name: '', 
    permissions: 'limited' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [showAddAdminSuccessView, setShowAddAdminSuccessView] = useState(false);
  const [lastAddedAdminCredentials, setLastAddedAdminCredentials] = useState<{ email: string; tempPass: string } | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadAdmins();

    // Set up real-time subscription
    const subscription = supabase
      .channel('admins-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'admins',
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          loadAdmins();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    // Check permissions when user and admins data are both available
    if (!loading) {
      if (user) {
        // Check by email instead of ID since auth.uid() and admin_id might not match
        const userIsFullAdmin = admins.some(
          admin => admin.email === user.email && admin.permissions === 'full'
        );
        setHasPermission(userIsFullAdmin);
        setPermissionLoading(false);
        console.log('Permission check result:', userIsFullAdmin);
        console.log('Checking user email:', user.email, 'against admins:', admins.map(a => ({ email: a.email, permissions: a.permissions })));
      } else {
        // No user means no permission
        setHasPermission(false);
        setPermissionLoading(false);
        console.log('No user found, setting permission to false');
      }
    }
  }, [user, admins, loading]);

  const loadAdmins = async () => {
    try {
      console.log('Loading admins...');
      setLoading(true);
      
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admins:', error);
        throw error;
      }

      console.log('Successfully loaded admins:', data?.length);
      setAdmins(data || []);
    } catch (error) {
      console.error('Error in loadAdmins:', error);
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.name || !newAdmin.permissions) {
      toast.error('Please fill out all fields.');
      return;
    }
    try {
      setIsSubmitting(true);
      console.log('Adding new admin (payload sent to Edge Function):', newAdmin);
      const result = await addAdmin(newAdmin);
      
      console.log('Full response from addAdmin Edge Function:', result);
      // Log the specific parts we need for the success message
      console.log('New admin data from DB (result.insertedAdminData):', result.insertedAdminData);
      console.log('Temporary password (result.tempPassword):', result.tempPassword);

      if (result.success && result.insertedAdminData && result.tempPassword) {
        // const successMessage = `Admin added: ${result.insertedAdminData.email}. Temp Password: ${result.tempPassword}`;
        // toast.success(successMessage, { duration: 10000 }); 
        setLastAddedAdminCredentials({ email: result.insertedAdminData.email, tempPass: result.tempPassword });
        setShowAddAdminSuccessView(true); // Show success view in the Add Admin Dialog
        // setIsAddDialogOpen(false); // Don't close immediately
        // setNewAdmin({ email: '', name: '', permissions: 'limited' }); // Reset happens when dialog is truly closed/reopened
        loadAdmins(); 
      } else {
        // This case should ideally be caught by the !response.ok in src/lib/supabase.ts
        // but as a fallback:
        console.error('Add admin seemed to succeed but response format was unexpected:', result);
        toast.error('Admin added, but response was unexpected. Check console.');
      }
    } catch (error: any) {
      console.error('Error adding admin:', error, error?.response);
      toast.error(
        (error?.message ? `Failed to add admin: ${error.message}` : 'Failed to add admin') +
        (error?.response ? ` (Response: ${JSON.stringify(error.response)})` : '')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    try {
      setIsSubmitting(true);
      await updateAdmin(selectedAdmin.admin_id, {
        name: selectedAdmin.name,
        permissions: selectedAdmin.permissions
      });

      toast.success('Admin updated successfully');
      setIsEditDialogOpen(false);
      setSelectedAdmin(null);
    } catch (error: any) {
      console.error('Error updating admin:', error);
      toast.error(error.message || 'Failed to update admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (admin: Admin) => {
    setAdminToDelete(admin);
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    try {
      setIsSubmitting(true); // Add submitting state for delete confirmation button
      const result = await deleteAdmin(adminToDelete.admin_id);
      console.log('Delete admin response from Edge Function:', result); 
      toast.success(result.message || 'Admin removed successfully');
      loadAdmins(); 
      setAdminToDelete(null); // Close confirmation dialog on success
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast.error(error.message || 'Failed to remove admin');
      // setAdminToDelete(null); // Optionally close dialog on error too, or let user cancel
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAddAdminDialog = () => {
    setIsAddDialogOpen(false);
    setShowAddAdminSuccessView(false); // Reset success view
    setNewAdmin({ email: '', name: '', permissions: 'limited' }); // Reset form
    setLastAddedAdminCredentials(null);
  }

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Debug logs
  console.log('Current user:', user);
  console.log('Current user ID:', user?.id);
  console.log('Admins:', admins);
  console.log('Has permission:', hasPermission);
  console.log('Permission loading:', permissionLoading);

  // Show loading state while checking authentication or permissions
  if (authLoading || loading || permissionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Permission Denied UI for non-full admins or no user
  if (!user || !hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="bg-card p-8 rounded-2xl shadow-xl flex flex-col items-center border border-border">
          <XCircle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
            {!user ? 'Authentication Required' : 'Permission Denied'}
          </h2>
          <p className="text-muted-foreground text-center max-w-xs">
            {!user 
              ? 'Please log in to access the admin management panel.' 
              : 'You do not have sufficient permissions to view or manage admins. Please contact a full admin for access.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary rounded-xl shadow-lg">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-semibold text-foreground">
                Admin Management
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">Manage your team's access and permissions</p>
            </div>
          </div>
          {hasPermission && (
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              variant="primary"
            >
              <UserPlus className="w-5 h-5 mr-2" /> Add Admin
            </Button>
          )}
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
          />
        </motion.div>

        {/* Admins List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
            <p className="text-sm text-muted-foreground">Manage admin accounts and permissions</p>
          </div>

          <div className="divide-y divide-border">
            {filteredAdmins.map((admin, index) => (
              <motion.div
                key={admin.admin_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className="p-6 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                      <User className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{admin.name}</h3>
                      <div className="flex items-center mt-1 space-x-3">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {admin.email}
                        </span>
                        <span className={`
                          inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                          ${admin.permissions === 'full' 
                            ? 'bg-primary/10 text-primary border-primary/20' 
                            : 'bg-blue-100 text-blue-800 border-blue-200'}
                        `}>
                          <Shield className="w-3.5 h-3.5 mr-1" />
                          {admin.permissions === 'full' ? 'Full Access' : 'Limited Access'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {hasPermission && admin.admin_id !== user?.id && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteAdmin(admin)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { if(!open) closeAddAdminDialog(); else setIsAddDialogOpen(true); }}>
        <DialogContent>
          {!showAddAdminSuccessView ? (
            <>
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>
                  Add a new team member to manage leads and vendors.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAdmin}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter admin name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter admin email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className={`p-4 rounded-lg border transition-colors ${
                          newAdmin.permissions === 'limited'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-border hover:border-blue-200 hover:bg-blue-50'
                        }`}
                        onClick={() => setNewAdmin(prev => ({ ...prev, permissions: 'limited' }))}
                      >
                        <div className="flex items-center justify-center mb-2">
                          {newAdmin.permissions === 'limited' ? (
                            <CheckCircle2 className="w-6 h-6 text-blue-600" />
                          ) : (
                            <Shield className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <h3 className="font-medium">Limited Access</h3>
                        <p className="text-xs text-muted-foreground mt-1">Basic management capabilities</p>
                      </button>

                      <button
                        type="button"
                        className={`p-4 rounded-lg border transition-colors ${
                          newAdmin.permissions === 'full'
                            ? 'border-primary/20 bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/20 hover:bg-primary/10'
                        }`}
                        onClick={() => setNewAdmin(prev => ({ ...prev, permissions: 'full' }))}
                      >
                        <div className="flex items-center justify-center mb-2">
                          {newAdmin.permissions === 'full' ? (
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          ) : (
                            <ShieldCheck className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <h3 className="font-medium">Full Access</h3>
                        <p className="text-xs text-muted-foreground mt-1">Complete admin privileges</p>
                      </button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Admin'}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Admin Added Successfully!</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <p className="text-foreground">The admin account for <strong>{lastAddedAdminCredentials?.email}</strong> has been created.</p>
                <p className="text-foreground">Temporary Password: <strong className="font-mono bg-muted px-2 py-1 rounded">{lastAddedAdminCredentials?.tempPass}</strong></p>
                <p className="text-sm text-muted-foreground">Please instruct the new admin to log in and change this password immediately.</p>
                <Button 
                  onClick={() => navigator.clipboard.writeText(lastAddedAdminCredentials?.tempPass || '')}
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                >
                  Copy Password
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={closeAddAdminDialog} variant="primary">Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>
              Update admin information and permissions.
            </DialogDescription>
          </DialogHeader>

          {selectedAdmin && (
            <form onSubmit={handleUpdateAdmin}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedAdmin.name}
                    onChange={(e) => setSelectedAdmin(prev => ({ ...prev!, name: e.target.value }))}
                    placeholder="Enter admin name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={selectedAdmin.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`p-4 rounded-lg border transition-colors ${
                        selectedAdmin.permissions === 'limited'
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-border hover:border-blue-200 hover:bg-blue-50'
                      }`}
                      onClick={() => setSelectedAdmin(prev => ({ ...prev!, permissions: 'limited' }))}
                    >
                      <div className="flex items-center justify-center mb-2">
                        {selectedAdmin.permissions === 'limited' ? (
                          <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Shield className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-medium">Limited Access</h3>
                      <p className="text-xs text-muted-foreground mt-1">Basic management capabilities</p>
                    </button>

                    <button
                      type="button"
                      className={`p-4 rounded-lg border transition-colors ${
                        selectedAdmin.permissions === 'full'
                          ? 'border-primary/20 bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/20 hover:bg-primary/10'
                      }`}
                      onClick={() => setSelectedAdmin(prev => ({ ...prev!, permissions: 'full' }))}
                    >
                      <div className="flex items-center justify-center mb-2">
                        {selectedAdmin.permissions === 'full' ? (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        ) : (
                          <ShieldCheck className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-medium">Full Access</h3>
                      <p className="text-xs text-muted-foreground mt-1">Complete admin privileges</p>
                    </button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="primary"
                >
                  {isSubmitting ? 'Updating...' : 'Update Admin'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!adminToDelete} onOpenChange={() => setAdminToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the admin account for <strong>{adminToDelete?.email}</strong>? 
              This will remove their access and delete their user account. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAdminToDelete(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteAdmin} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admins;