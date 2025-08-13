import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import PaymentStats from '../components/dashboard/PaymentStats';
import PaymentTable from '../components/dashboard/PaymentTable';
import { supabase, fetchBookings, fetchPartPayments } from '../lib/supabase';
import { Booking, PartPayment } from '../types';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Define SortDirection and SortConfig types
type SortDirection = 'ascending' | 'descending';
interface SortConfig {
  key: keyof Booking | null;
  direction: SortDirection;
}

// Payment Record interface for display
interface PaymentRecord {
  id: string;
  booking_id: number;
  client_name: string;
  payment_type: 'advance' | 'part_payment' | 'final';
  amount: number;
  payment_date: string;
  due_date: string;
  status: 'received' | 'pending' | 'overdue';
  booking_serial: string;
  event_date: string;
}

const Payments = () => {
  const { user, checkPermission } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [partPayments, setPartPayments] = useState<PartPayment[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalDue: 0,
    totalReceived: 0,
    pendingAmount: 0,
    overdueCount: 0
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'descending' });

  const loadData = async () => {
    try {
      console.log('Loading bookings and part payments...');
      setLoading(true);
      
      const [bookingsData, partPaymentsData] = await Promise.all([
        fetchBookings(),
        fetchPartPayments()
      ]);
      
      console.log('Bookings loaded:', bookingsData);
      console.log('Part payments loaded:', partPaymentsData);
      
      setBookings(bookingsData);
      setPartPayments(partPaymentsData);
      
      // Create payment records from bookings and part payments
      const records = createPaymentRecords(bookingsData, partPaymentsData);
      setPaymentRecords(records);
      
      calculateStats(bookingsData, partPaymentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const createPaymentRecords = (bookings: Booking[], partPayments: PartPayment[]): PaymentRecord[] => {
    const records: PaymentRecord[] = [];
    
    bookings.forEach(booking => {
      // Ensure booking_id is a number
      const numericBookingId = typeof booking.booking_id === 'string' ? parseInt(booking.booking_id) : booking.booking_id;
      
      // Add advance payment record
      if (booking.advance_paid > 0) {
        records.push({
          id: `advance-${numericBookingId}`,
          booking_id: numericBookingId,
          client_name: booking.client_name,
          payment_type: 'advance',
          amount: booking.advance_paid,
          payment_date: booking.booking_date,
          due_date: booking.booking_date,
          status: 'received',
          booking_serial: booking.serial_no,
          event_date: booking.date_of_function
        });
      }
      
      // Add part payment records
      const bookingPartPayments = partPayments.filter(payment => {
        const paymentBookingId = typeof payment.booking_id === 'string' ? parseInt(payment.booking_id) : payment.booking_id;
        return paymentBookingId === numericBookingId;
      });
      
      bookingPartPayments.forEach(payment => {
        records.push({
          id: `part-${payment.payment_id}`,
          booking_id: numericBookingId,
          client_name: booking.client_name,
          payment_type: 'part_payment',
          amount: payment.amount,
          payment_date: payment.payment_date,
          due_date: payment.payment_date,
          status: 'received',
          booking_serial: booking.serial_no,
          event_date: booking.date_of_function
        });
      });
      
      // Add final payment record (remaining balance)
      const totalPaid = booking.advance_paid + bookingPartPayments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = booking.total_amount - totalPaid;
      
      if (remainingBalance > 0) {
        records.push({
          id: `final-${numericBookingId}`,
          booking_id: numericBookingId,
          client_name: booking.client_name,
          payment_type: 'final',
          amount: remainingBalance,
          payment_date: booking.date_of_function, // Due on event date
          due_date: booking.date_of_function,
          status: new Date(booking.date_of_function) < new Date() ? 'overdue' : 'pending',
          booking_serial: booking.serial_no,
          event_date: booking.date_of_function
        });
      }
    });
    
    return records;
  };

  const calculateStats = (bookings: Booking[], partPayments: PartPayment[]) => {
    const totalDue = bookings.reduce((sum, booking) => sum + booking.total_amount, 0);
    const totalReceived = bookings.reduce((sum, booking) => {
      const bookingPartPayments = partPayments.filter(payment => 
        payment.booking_id === booking.booking_id
      );
      const totalPartPayments = bookingPartPayments.reduce((paymentSum, payment) => 
        paymentSum + payment.amount, 0
      );
      return sum + booking.advance_paid + totalPartPayments;
    }, 0);
    
    const pendingAmount = totalDue - totalReceived;
    
    // Calculate overdue count
    const today = new Date();
    const overdueCount = bookings.filter(booking => {
      const bookingPartPayments = partPayments.filter(payment => 
        payment.booking_id === booking.booking_id
      );
      const totalPartPayments = bookingPartPayments.reduce((paymentSum, payment) => 
        paymentSum + payment.amount, 0
      );
      const remainingBalance = booking.total_amount - booking.advance_paid - totalPartPayments;
      const eventDate = new Date(booking.date_of_function);
      return remainingBalance > 0 && eventDate < today;
    }).length;

    setStats({
      totalDue,
      totalReceived,
      pendingAmount,
      overdueCount
    });
  };

  useEffect(() => {
    loadData();

    // Real-time subscription for bookings and part payments
    const bookingsChannel = supabase.channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Real-time booking change detected:', payload);
          loadData(); // Reload all data when bookings change
        }
      )
      .subscribe();

    const partPaymentsChannel = supabase.channel('part-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'part_payments'
        },
        (payload) => {
          console.log('Real-time part payment change detected:', payload);
          loadData(); // Reload all data when part payments change
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(partPaymentsChannel);
    };
  }, []);

  // Memoize filtered and sorted payment records
  const processedPaymentRecords = useMemo(() => {
    let result = [...paymentRecords];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(record => 
        record.client_name.toLowerCase().includes(query) ||
        record.booking_serial.toLowerCase().includes(query) ||
        record.payment_type.toLowerCase().includes(query)
      );
    }

    // Sort payment records
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key! as keyof PaymentRecord];
        const bValue = b[sortConfig.key! as keyof PaymentRecord];

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [paymentRecords, searchQuery, sortConfig]);

  const requestSort = (key: keyof PaymentRecord) => {
    setSortConfig(currentConfig => ({
      key: key as keyof Booking,
      direction: currentConfig.key === key && currentConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const handlePaymentView = async (payment: PaymentRecord) => {
    try {
      setSelectedPayment(payment);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error('Failed to load payment details');
    }
  };

  const handlePaymentEdit = async (payment: PaymentRecord) => {
    try {
      setSelectedPayment(payment);
      setIsEditMode(true);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error('Failed to load payment details');
    }
  };

  const handlePaymentDelete = async (payment: PaymentRecord) => {
    try {
      // Check if user is super admin (00-01)
      const isSuperAdmin = user?.access_code === '00-01';
      
      if (payment.payment_type === 'part_payment') {
        // Delete part payment
        const paymentId = parseInt(payment.id.split('-')[1]);
        const { error } = await supabase.from('part_payments').delete().eq('payment_id', paymentId);
        
        if (error) {
          console.error('Error deleting part payment:', error);
          toast.error('Failed to delete part payment');
          return;
        }
        
        toast.success('Part payment deleted successfully');
        loadData();
      } else if (isSuperAdmin) {
        // Super admin can delete advance/final payments by updating the booking
        const bookingId = payment.booking_id;
        
        if (payment.payment_type === 'advance') {
          // For advance payment, set advance_paid to 0
          const { error } = await supabase
            .from('bookings')
            .update({ advance_paid: 0 })
            .eq('booking_id', bookingId);
          
          if (error) {
            console.error('Error deleting advance payment:', error);
            toast.error('Failed to delete advance payment');
            return;
          }
          
          toast.success('Advance payment deleted successfully');
        } else if (payment.payment_type === 'final') {
          // For final payment, this is calculated, so we can't "delete" it
          // Show a more helpful message
          toast.error('Final payment is calculated automatically. To reduce it, either: 1) Increase advance payment, 2) Add part payments, or 3) Reduce the booking amount.');
          return;
        }
        
        loadData();
      } else {
        // For non-admin users, show restriction message
        const paymentType = payment.payment_type === 'advance' ? 'advance' : 'final';
        toast.error(`Only super admins can delete ${paymentType} payments. Contact your administrator.`);
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
    }
  };

  const handleMarkReceived = async (payment: PaymentRecord) => {
    try {
      console.log('Marking payment as received:', payment);
      
      if (payment.status === 'received') {
        toast.error('This payment is already marked as received');
        return;
      }

      // Handle different payment types
      if (payment.payment_type === 'final') {
        // For final payments, we need to update the booking's balance
        // This would typically involve creating a part payment record
        const partPaymentData = {
          booking_id: payment.booking_id,
          client_name: payment.client_name,
          amount: payment.amount,
          payment_date: new Date().toISOString().split('T')[0],
          description: 'Final payment received'
        };

        const { error } = await supabase
          .from('part_payments')
          .insert([partPaymentData]);

        if (error) {
          console.error('Error creating final payment record:', error);
          toast.error('Failed to mark final payment as received');
          return;
        }

        toast.success('Final payment marked as received!');
        loadData();
        
      } else if (payment.payment_type === 'part_payment') {
        // For part payments, update the existing part payment record
        const paymentId = payment.id.replace('part-', '');
        
        const { error } = await supabase
          .from('part_payments')
          .update({ 
            payment_date: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('payment_id', paymentId);

        if (error) {
          console.error('Error updating part payment:', error);
          toast.error('Failed to mark part payment as received');
          return;
        }

        toast.success('Part payment marked as received!');
        loadData();
        
      } else if (payment.payment_type === 'advance') {
        // For advance payments, update the booking's advance_paid date
        const bookingId = payment.booking_id;
        
        const { error } = await supabase
          .from('bookings')
          .update({ 
            booking_date: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('booking_id', bookingId);

        if (error) {
          console.error('Error updating advance payment:', error);
          toast.error('Failed to mark advance payment as received');
          return;
        }

        toast.success('Advance payment marked as received!');
        loadData();
        
      } else {
        toast.error('Unknown payment type');
      }
      
    } catch (error) {
      console.error('Error marking payment as received:', error);
      toast.error('Failed to mark payment as received');
    }
  };

  const handleSheetClose = () => {
    setSelectedPayment(null);
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user can view financial data
  const canViewFinancialData = checkPermission('canViewFinancialData');

  return (
    <div className="bg-background min-h-screen overflow-x-hidden">
      <div className="w-full max-w-full space-y-4 p-3 md:p-6 overflow-x-hidden">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 overflow-x-hidden"
        >
          <div className="overflow-x-hidden">
            <h1 className="text-lg md:text-2xl font-semibold text-foreground">
              Payment Tracking
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {canViewFinancialData 
                ? 'Manage and track all payment stages' 
                : 'View payment records (financial details hidden)'
              }
            </p>
          </div>
        </motion.div>

        {/* Payment Stats - Only show if user can view financial data */}
        {canViewFinancialData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="overflow-x-hidden"
          >
            <PaymentStats {...stats} />
          </motion.div>
        )}

        {/* Payment Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-x-hidden"
        >
          <PaymentTable
            paymentRecords={processedPaymentRecords}
            bookings={bookings}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onPaymentView={handlePaymentView}
            onPaymentEdit={handlePaymentEdit}
            onPaymentDelete={handlePaymentDelete}
            onMarkReceived={handleMarkReceived}
            onPaymentAdded={loadData}
            canViewFinancialData={canViewFinancialData}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Payments; 