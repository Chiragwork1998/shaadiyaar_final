import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import BookingStats from '../components/dashboard/BookingStats';
import BookingTable from '../components/dashboard/BookingTable';
import PartPaymentStats from '../components/dashboard/PartPaymentStats';
import PartPaymentTable from '../components/dashboard/PartPaymentTable';
import BookingView from '../components/dashboard/BookingView';
import BookingEdit from '../components/dashboard/BookingEdit';
import BookingPrint from '../components/dashboard/BookingPrint';
import PartPaymentView from '../components/dashboard/PartPaymentView';
import PartPaymentEdit from '../components/dashboard/PartPaymentEdit';
import PartPaymentPrint from '../components/dashboard/PartPaymentPrint';
import { supabase, fetchBookingsWithPending, updateBooking, getBooking, fetchPartPaymentsWithPending, createPartPayment, updatePartPayment, deletePartPayment, getPartPayment } from '../lib/supabase';
import { Booking, PartPayment } from '../types';
import { toast } from 'react-hot-toast';

// Define SortDirection and SortConfig types
type SortDirection = 'ascending' | 'descending';
interface SortConfig {
  key: keyof Booking | null;
  direction: SortDirection;
}

const Bookings = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'part-payments'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [partPayments, setPartPayments] = useState<PartPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PartPayment | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [selectedBookingType, setSelectedBookingType] = useState('all');
  const [showBookingView, setShowBookingView] = useState(false);
  const [showBookingEdit, setShowBookingEdit] = useState(false);
  const [showBookingPrint, setShowBookingPrint] = useState(false);
  const [showPaymentView, setShowPaymentView] = useState(false);
  const [showPaymentEdit, setShowPaymentEdit] = useState(false);
  const [showPaymentPrint, setShowPaymentPrint] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    pendingBalance: 0,
    conversionRate: 0
  });
  const [paymentStats, setPaymentStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    averagePayment: 0,
    monthlyTotal: 0
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'descending' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsData, partPaymentsData] = await Promise.all([
        fetchBookingsWithPending(),
        fetchPartPaymentsWithPending(),
      ]);
      
      console.log('loadData called - fetched bookings:', bookingsData.length, 'part payments:', partPaymentsData.length);
      
      // Data validation and repair
      const validatedBookings = await validateAndRepairBookings(bookingsData);
      const validatedPartPayments = await validateAndRepairPartPayments(partPaymentsData);
      
      setBookings(validatedBookings);
      setPartPayments(validatedPartPayments);

      calculateStats(validatedBookings, validatedPartPayments);
      calculatePaymentStats(validatedBookings, validatedPartPayments);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Data validation and repair functions
  const validateAndRepairBookings = async (bookings: Booking[]) => {
    const repairedBookings = [];
    
    for (const booking of bookings) {
      // Ensure advance_paid is a number and not null/undefined
      if (typeof booking.advance_paid !== 'number' || isNaN(booking.advance_paid)) {
        console.warn(`Fixing booking ${booking.booking_id}: advance_paid is invalid, setting to 0`);
        booking.advance_paid = 0;
      }
      
      // Ensure net_amount is a number and not null/undefined
      if (typeof booking.net_amount !== 'number' || isNaN(booking.net_amount)) {
        console.warn(`Fixing booking ${booking.booking_id}: net_amount is invalid, setting to 0`);
        booking.net_amount = 0;
      }
      
      // Ensure balance_amount is calculated correctly
      const calculatedBalance = booking.net_amount - booking.advance_paid;
      if (booking.balance_amount !== calculatedBalance) {
        console.warn(`Fixing booking ${booking.booking_id}: balance_amount mismatch, updating from ${booking.balance_amount} to ${calculatedBalance}`);
        booking.balance_amount = calculatedBalance;
      }
      
      repairedBookings.push(booking);
    }
    
    return repairedBookings;
  };

  const validateAndRepairPartPayments = async (payments: PartPayment[]) => {
    const repairedPayments = [];
    
    for (const payment of payments) {
      // Ensure booking_id is valid (can be string for pending or number for confirmed)
      if (payment.booking_id === null || payment.booking_id === undefined) {
        console.warn(`Part payment ${payment.payment_id} has null booking_id - this payment will be excluded from calculations`);
        continue; // Skip this payment as it can't be linked
      }
      
      // Ensure amount is a number and not null/undefined
      if (typeof payment.amount !== 'number' || isNaN(payment.amount)) {
        console.warn(`Fixing part payment ${payment.payment_id}: amount is invalid, setting to 0`);
        payment.amount = 0;
      }
      
      // For confirmed bookings, ensure booking_id is a number
      // For pending bookings, booking_id can be a string (e.g., "pending_xxx")
      if (typeof payment.booking_id === 'string' && !payment.booking_id.startsWith('pending_')) {
        const numericBookingId = parseInt(payment.booking_id);
        if (!isNaN(numericBookingId)) {
          console.warn(`Converting part payment ${payment.payment_id} booking_id from string to number: ${payment.booking_id} -> ${numericBookingId}`);
          payment.booking_id = numericBookingId;
        }
      }
      
      repairedPayments.push(payment);
    }
    
    return repairedPayments;
  };

    const calculatePaymentStats = (bookingsData: Booking[], paymentsData: PartPayment[]) => {
    const confirmedBookings = bookingsData.filter(b => !b.is_pending);
    const confirmedPartPayments = paymentsData.filter(p => !p.is_pending);

    const totalPartPaymentAmount = confirmedPartPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalAdvancePaymentAmount = confirmedBookings.reduce((sum, booking) => sum + booking.advance_paid, 0);
    const totalAmount = totalPartPaymentAmount + totalAdvancePaymentAmount;
    
    const partPaymentsCount = confirmedPartPayments.length;
    const advancePaymentsCount = confirmedBookings.filter(b => b.advance_paid > 0).length;
    const totalPaymentsCount = partPaymentsCount + advancePaymentsCount;

    const averagePayment = totalPaymentsCount > 0 ? totalAmount / totalPaymentsCount : 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyPartPayments = confirmedPartPayments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.payment_date);
      if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
        return sum + payment.amount;
      }
      return sum;
    }, 0);

    const monthlyAdvancePayments = confirmedBookings.reduce((sum, booking) => {
      const bookingDate = new Date(booking.booking_date);
      if (booking.advance_paid > 0 && bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear) {
        return sum + booking.advance_paid;
      }
      return sum;
    }, 0);

    const monthlyTotal = monthlyPartPayments + monthlyAdvancePayments;

    setPaymentStats({
      totalPayments: totalPaymentsCount,
      totalAmount,
      averagePayment,
      monthlyTotal
    });
  };

  useEffect(() => {
    loadData();

    // Set up real-time subscriptions for both bookings and pending approvals
    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        console.log('Bookings real-time change detected:', payload);
        loadData();
      })
      .subscribe((status) => {
        console.log('Bookings channel subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('Bookings channel subscription failed');
        }
      });

    const pendingApprovalsChannel = supabase
      .channel('pending-approvals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_approvals' }, (payload) => {
        console.log('Pending approvals real-time change detected:', payload);
        loadData();
      })
      .subscribe((status) => {
        console.log('Pending approvals channel subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('Pending approvals channel subscription failed');
        }
      });

    const partPaymentsChannel = supabase
      .channel('part-payments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'part_payments' }, (payload) => {
        console.log('Part payments real-time change detected:', payload);
        loadData();
      })
      .subscribe((status) => {
        console.log('Part payments channel subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('Part payments channel subscription failed');
        }
      });

    // Also listen to all changes as a fallback
    const fallbackChannel = supabase
      .channel('fallback-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Fallback real-time change detected:', payload);
        // Only reload if it's a relevant table
        if (['bookings', 'pending_approvals', 'part_payments'].includes(payload.table)) {
          console.log('Fallback triggered loadData for table:', payload.table);
          loadData();
        }
      })
      .subscribe((status) => {
        console.log('Fallback channel subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('Fallback channel subscription failed');
        }
      });

    // Add a manual refresh trigger that can be called from the booking form
    const manualRefreshChannel = supabase
      .channel('manual-refresh')
      .on('broadcast', { event: 'booking-added' }, (payload) => {
        console.log('Manual refresh triggered via broadcast:', payload);
        loadData();
      })
      .on('broadcast', { event: 'part-payment-added' }, (payload) => {
        console.log('Part payment manual refresh triggered via broadcast:', payload);
        loadData();
      })
      .subscribe((status) => {
        console.log('Manual refresh channel subscription status:', status);
      });

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(pendingApprovalsChannel);
      supabase.removeChannel(partPaymentsChannel);
      supabase.removeChannel(fallbackChannel);
      supabase.removeChannel(manualRefreshChannel);
    };
  }, []);

  // Memoize filtered and sorted bookings
  const processedBookings = useMemo(() => {
    let result = [...bookings];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(booking => 
        booking.client_name.toLowerCase().includes(query) ||
        (booking.serial_no && booking.serial_no.toLowerCase().includes(query)) ||
        (booking.contact_number && booking.contact_number.toLowerCase().includes(query))
      );
    }

    if (selectedBookingType !== 'all') {
      result = result.filter(booking => booking.status === selectedBookingType);
    }

    // Sort bookings
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        
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
  }, [bookings, searchQuery, selectedBookingType, sortConfig]);

  const requestSort = (key: keyof Booking) => {
    setSortConfig(currentConfig => ({
      key,
      direction: currentConfig.key === key && currentConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const calculateStats = (bookingsData: Booking[], paymentsData: PartPayment[]) => {
    const confirmedBookings = bookingsData.filter(b => !b.is_pending);
    const allBookings = bookingsData; // Include all bookings for total count
    
    const totalBookings = allBookings.length; // Count ALL bookings (including pending)
    const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.net_amount, 0);

    console.log('=== CALCULATION DEBUG ===');
    console.log('All bookings:', bookingsData.map(b => ({ id: b.booking_id, serial: b.serial_no, client: b.client_name, net: b.net_amount, advance: b.advance_paid, is_pending: b.is_pending })));
    console.log('All part payments:', paymentsData.map(p => ({ id: p.payment_id, booking_id: p.booking_id, amount: p.amount, is_pending: p.is_pending })));

    const pendingBalance = confirmedBookings.reduce((sum, booking) => {
      // Get all confirmed part payments for this booking
      const bookingPartPayments = paymentsData.filter(p => {
        // Handle both string and number types for booking_id
        const paymentBookingId = typeof p.booking_id === 'string' ? p.booking_id : p.booking_id.toString();
        const bookingId = typeof booking.booking_id === 'string' ? booking.booking_id : booking.booking_id.toString();
        
        const matches = paymentBookingId === bookingId && !p.is_pending;
        
        console.log(`Payment ${p.payment_id} (amount: ${p.amount}) - booking_id: ${p.booking_id} (${typeof p.booking_id}) vs booking ${booking.booking_id} (${typeof booking.booking_id}) - matches: ${matches}`);
        
        return matches;
      });
      
      // Calculate total part payments for this booking
      const totalPartPayments = bookingPartPayments.reduce((paymentSum, p) => paymentSum + p.amount, 0);
      
      // Calculate actual balance: net_amount - advance_paid - part_payments
      const actualBalance = booking.net_amount - booking.advance_paid - totalPartPayments;
      
      // Debug logging for the specific booking
      console.log(`Booking ${booking.serial_no} (${booking.client_name}):`, {
        booking_id: booking.booking_id,
        net_amount: booking.net_amount,
        advance_paid: booking.advance_paid,
        part_payments: bookingPartPayments.map(p => ({ id: p.payment_id, amount: p.amount })),
        total_part_payments: totalPartPayments,
        actual_balance: actualBalance,
        calculation: `${booking.net_amount} - ${booking.advance_paid} - ${totalPartPayments} = ${actualBalance}`
      });
      
      // Only add positive balances (no negative pending amounts)
      return sum + Math.max(0, actualBalance);
    }, 0);
      
    const conversionRate = totalBookings > 0 ? 9 : 0; // Placeholder

    console.log('Final stats calculation:', {
      totalBookings,
      totalRevenue,
      pendingBalance,
      totalPartPayments: paymentsData.filter(p => !p.is_pending).length
    });
    console.log('=== END CALCULATION DEBUG ===');

    setStats({
      totalBookings,
      totalRevenue,
      pendingBalance,
      conversionRate
    });
  };

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      setUpdatingStatus(bookingId.toString());
      await updateBooking(bookingId, { status: newStatus });
      toast.success('Booking status updated successfully');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleBookingView = async (booking: Booking) => {
    try {
      const fullBooking = await getBooking(booking.booking_id as number);
      setSelectedBooking(fullBooking);
      setShowBookingView(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking details');
    }
  };

  const handleBookingEdit = async (booking: Booking) => {
    try {
      const fullBooking = await getBooking(booking.booking_id as number);
      setSelectedBooking(fullBooking);
      setShowBookingEdit(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking details');
    }
  };

  const handleBookingPrint = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingPrint(true);
  };

  const handleBookingDelete = async (booking: Booking) => {
    try {
      // First, delete all part payments associated with this booking
      const { error: partPaymentError } = await supabase
        .from('part_payments')
        .delete()
        .eq('booking_id', booking.booking_id);

      if (partPaymentError) {
        console.error('Error deleting part payments:', partPaymentError);
        toast.error('Failed to delete associated part payments.');
        return; // Stop if we can't delete children records
      }

      // Then, delete the booking itself
      const { error: bookingError } = await supabase
        .from('bookings')
        .delete()
        .eq('booking_id', booking.booking_id);

      if (bookingError) {
        console.error('Error deleting booking:', bookingError);
        toast.error('Failed to delete booking.');
        return;
      }

      toast.success('Booking and associated payments deleted successfully!');
      // Real-time should handle updates, but we can force a reload
      loadData();
    } catch (error) {
      console.error('Error in deletion process:', error);
      toast.error('An unexpected error occurred during deletion.');
    }
  };

  const handleSheetClose = () => {
    setSelectedBooking(null);
    setIsEditMode(false);
  };

  // Part Payment handlers
  const handlePaymentView = async (payment: PartPayment) => {
    try {
      const paymentData = await getPartPayment(payment.payment_id as number);
      if (paymentData) {
        setSelectedPayment(paymentData);
        setShowPaymentView(true);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error('Failed to load payment details');
    }
  };

  const handlePaymentEdit = async (payment: PartPayment) => {
    try {
      const paymentData = await getPartPayment(payment.payment_id as number);
      if (paymentData) {
        setSelectedPayment(paymentData);
        setShowPaymentEdit(true);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error('Failed to load payment details');
    }
  };

  const handlePaymentPrint = (payment: PartPayment) => {
    setSelectedPayment(payment);
    setShowPaymentPrint(true);
  };

  const handlePaymentDelete = async (payment: PartPayment) => {
    try {
      await deletePartPayment(payment.payment_id as number);
      toast.success('Part payment deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting part payment:', error);
      toast.error('Failed to delete part payment');
    }
  };

  const handlePaymentSheetClose = () => {
    setShowPaymentView(false);
    setShowPaymentEdit(false);
    setShowPaymentPrint(false);
    setSelectedPayment(null);
  };

  // Manual refresh function for booking form
  const handleBookingAdded = () => {
    console.log('Manual refresh triggered by booking form');
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              Booking System
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Manage event bookings and payments
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-muted rounded-lg p-1 w-fit overflow-x-hidden">
            <Button
              variant={activeTab === 'bookings' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('bookings')}
              className="h-8 px-4 text-xs md:text-sm rounded-md"
            >
              Bookings
            </Button>
            <Button
              variant={activeTab === 'part-payments' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('part-payments')}
              className="h-8 px-4 text-xs md:text-sm rounded-md"
            >
              Part Payments
            </Button>
          </div>
        </motion.div>

        {/* Bookings Tab Content */}
        {activeTab === 'bookings' && (
          <>
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-x-hidden"
            >
              <BookingStats {...stats} />
            </motion.div>

            {/* Booking Table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="overflow-x-hidden"
            >
              <BookingTable
                bookings={processedBookings}
                partPayments={partPayments}
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                onStatusChange={handleStatusChange}
                onBookingView={handleBookingView}
                onBookingEdit={handleBookingEdit}
                onBookingPrint={handleBookingPrint}
                onBookingDelete={handleBookingDelete}
                updatingStatus={updatingStatus}
                onBookingTypeChange={setSelectedBookingType}
                selectedBookingType={selectedBookingType}
                sortConfig={sortConfig}
                requestSort={requestSort}
                onBookingAdded={loadData}
              />
            </motion.div>
          </>
        )}

        {/* Part Payments Tab Content */}
        {activeTab === 'part-payments' && (
          <>
            {/* Part Payment Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-x-hidden"
            >
              <PartPaymentStats {...paymentStats} />
            </motion.div>

            {/* Part Payment Table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="overflow-x-hidden"
            >
              <PartPaymentTable
                payments={partPayments}
                bookings={bookings}
                searchQuery={paymentSearchQuery}
                onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentSearchQuery(e.target.value)}
                onPaymentView={handlePaymentView}
                onPaymentEdit={handlePaymentEdit}
                onPaymentDelete={handlePaymentDelete}
                onPaymentPrint={handlePaymentPrint}
                onPaymentAdded={loadData}
              />
            </motion.div>
          </>
        )}

        {/* Booking View Modal */}
        <BookingView
          booking={selectedBooking}
          partPayments={partPayments}
          isOpen={showBookingView}
          onClose={() => setShowBookingView(false)}
          onEdit={() => {
            setShowBookingView(false);
            setShowBookingEdit(true);
          }}
        />

        {/* Booking Edit Modal */}
        <BookingEdit
          booking={selectedBooking}
          isOpen={showBookingEdit}
          onClose={() => setShowBookingEdit(false)}
          onSave={loadData}
        />

        {/* Booking Print Modal */}
        <BookingPrint
          booking={selectedBooking}
          partPayments={partPayments}
          onClose={() => setShowBookingPrint(false)}
        />

        {/* Part Payment View Modal */}
        <PartPaymentView
          payment={selectedPayment}
          booking={selectedPayment ? bookings.find(b => b.booking_id === selectedPayment.booking_id) : null}
          isOpen={showPaymentView}
          onClose={() => setShowPaymentView(false)}
          onEdit={() => {
            setShowPaymentView(false);
            setShowPaymentEdit(true);
          }}
        />

        {/* Part Payment Edit Modal */}
        <PartPaymentEdit
          payment={selectedPayment}
          bookings={bookings}
          isOpen={showPaymentEdit}
          onClose={() => setShowPaymentEdit(false)}
          onSave={loadData}
        />

        {/* Part Payment Print Modal */}
        <PartPaymentPrint
          payment={selectedPayment}
          booking={selectedPayment ? bookings.find(b => b.booking_id === selectedPayment.booking_id) : null}
          isOpen={showPaymentPrint}
          onClose={() => setShowPaymentPrint(false)}
        />
      </div>
    </div>
  );
};

export default Bookings; 