import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building, 
  DollarSign, 
  Eye, 
  AlertTriangle,
  CheckCircle2,
  X,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchPendingApprovals, updatePendingApproval, supabase } from '../lib/supabase';
import { PendingApproval } from '../types';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/Button';

const Approvals = () => {
  const { user, checkPermission } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalToReject, setApprovalToReject] = useState<string | null>(null);

  const loadPendingApprovals = async () => {
    try {
      setLoading(true);
      const data = await fetchPendingApprovals();
      setPendingApprovals(data);
    } catch (error) {
      console.error('Error loading pending approvals:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const handleApprove = async (approvalId: string) => {
    if (!user) return;
    
    setProcessingApproval(approvalId);
    try {
      await updatePendingApproval(approvalId, {
        status: 'approved',
        approved_by: user.admin_id,
        approved_at: new Date().toISOString()
      });

      // Insert the approved data into the main table
      const approval = pendingApprovals.find(a => a.approval_id === approvalId);
      if (approval) {
        if (approval.action_type === 'booking') {
          // Update the booking status to confirmed when approved
          const bookingData = {
            ...approval.action_data,
            status: 'confirmed' // Change from pending_approval to confirmed
          };
          
          const { error } = await supabase
            .from('bookings')
            .insert([bookingData]);
          
          if (error) {
            console.error('Error inserting approved booking:', error);
            toast.error('Failed to create booking');
            return;
          }
        } else if (approval.action_type === 'part_payment') {
          // For part payments, we need to handle the booking_id properly
          const paymentData = { ...approval.action_data };
          
          // If the booking_id is a string (pending booking), we need to find the actual booking
          if (typeof paymentData.booking_id === 'string' && paymentData.booking_id.startsWith('pending_')) {
            console.log('Processing part payment for pending booking:', paymentData.booking_id);
            
            // Find the actual booking that was created from this pending approval
            // We need to look for a booking with the same client_name and recent creation
            const { data: bookings, error: bookingError } = await supabase
              .from('bookings')
              .select('booking_id, client_name, created_at')
              .eq('client_name', paymentData.client_name)
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (bookingError) {
              console.error('Error finding booking for part payment:', bookingError);
              toast.error('Failed to find associated booking');
              return;
            }
            
            if (bookings && bookings.length > 0) {
              const actualBooking = bookings[0];
              console.log('Found actual booking for part payment:', actualBooking);
              paymentData.booking_id = actualBooking.booking_id; // Use the numeric booking_id
            } else {
              console.error('No booking found for client:', paymentData.client_name);
              toast.error('No booking found for this payment');
              return;
            }
          }
          
          console.log('Inserting approved part payment with data:', paymentData);
          
          const { error } = await supabase
            .from('part_payments')
            .insert([paymentData]);
          
          if (error) {
            console.error('Error inserting approved payment:', error);
            toast.error('Failed to create payment');
            return;
          }
        }
      }

      toast.success('Action approved successfully!');
      await loadPendingApprovals();
      setShowDetails(false);
    } catch (error) {
      console.error('Error approving action:', error);
      toast.error('Failed to approve action');
    } finally {
      setProcessingApproval(null);
    }
  };

  const handleReject = async (approvalId: string, reason: string) => {
    if (!user) return;
    
    setProcessingApproval(approvalId);
    try {
      await updatePendingApproval(approvalId, {
        status: 'rejected',
        approved_by: user.admin_id,
        approved_at: new Date().toISOString(),
        rejection_reason: reason
      });

      toast.success('Action rejected successfully!');
      await loadPendingApprovals();
      setShowDetails(false);
      setShowRejectModal(false);
      setRejectionReason('');
      setApprovalToReject(null);
    } catch (error) {
      console.error('Error rejecting action:', error);
      toast.error('Failed to reject action');
    } finally {
      setProcessingApproval(null);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'booking':
        return <Building className="w-5 h-5" />;
      case 'part_payment':
        return <DollarSign className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'booking':
        return 'text-blue-600 bg-blue-100';
      case 'part_payment':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'booking':
        return 'New Booking';
      case 'part_payment':
        return 'Part Payment';
      default:
        return 'Action';
    }
  };

  const pendingBookings = pendingApprovals.filter(a => a.action_type === 'booking' && a.status === 'pending').length;
  const pendingPayments = pendingApprovals.filter(a => a.action_type === 'part_payment' && a.status === 'pending').length;
  const totalPending = pendingApprovals.filter(a => a.status === 'pending').length;

  if (!checkPermission('canApproveActions')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to approve actions.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 md:mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Pending Approvals</h1>
            <p className="text-gray-600">Review and approve employee submissions</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{totalPending} pending items</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8"
      >
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Building className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-600">Pending Bookings</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{pendingBookings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{pendingPayments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-600">Total Pending</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{totalPending}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Approvals List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border"
      >
        <div className="p-4 md:p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Pending Actions</h3>
        </div>
        
        {totalPending === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Approvals</h3>
            <p className="text-gray-600">All employee submissions have been reviewed.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingApprovals
              .filter(a => a.status === 'pending')
              .map((approval) => (
                <motion.div 
                  key={approval.approval_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 md:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start md:items-center space-x-3 md:space-x-4">
                      <div className={`p-2 rounded-lg ${getActionColor(approval.action_type)} flex-shrink-0`}>
                        {getActionIcon(approval.action_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                          {getActionLabel(approval.action_type)}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <User className="w-4 h-4" />
                          <span>{approval.admin?.name || approval.admin_id || 'Unknown'}</span>
                          <span>•</span>
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(approval.created_at).toLocaleDateString()}</span>
                        </div>
                        {approval.action_type === 'booking' && (
                          <p className="text-sm text-gray-500">
                            Client: {approval.action_data.client_name} • 
                            Amount: ₹{approval.action_data.net_amount}
                          </p>
                        )}
                        {approval.action_type === 'part_payment' && (
                          <p className="text-sm text-gray-500">
                            Amount: ₹{approval.action_data.amount} • 
                            Date: {approval.action_data.payment_date}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedApproval(approval);
                          setShowDetails(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={() => handleApprove(approval.approval_id)}
                        disabled={processingApproval === approval.approval_id}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                      >
                        {processingApproval === approval.approval_id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Approve</span>
                      </Button>
                      
                      <Button
                        onClick={() => {
                          setApprovalToReject(approval.approval_id);
                          setShowRejectModal(true);
                        }}
                        disabled={processingApproval === approval.approval_id}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Reject</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </motion.div>

      {/* Approval Details Modal */}
      {showDetails && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Approval Details
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Action Details</h4>
                <div className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(selectedApproval.action_data, null, 2)}</pre>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => handleApprove(selectedApproval.approval_id)}
                  disabled={processingApproval === selectedApproval.approval_id}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    setApprovalToReject(selectedApproval.approval_id);
                    setShowRejectModal(true);
                    setShowDetails(false);
                  }}
                  disabled={processingApproval === selectedApproval.approval_id}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Reject Action
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setApprovalToReject(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (approvalToReject && rejectionReason.trim()) {
                      handleReject(approvalToReject, rejectionReason.trim());
                    } else {
                      toast.error('Please provide a reason for rejection');
                    }
                  }}
                  disabled={processingApproval === approvalToReject || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setApprovalToReject(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals; 