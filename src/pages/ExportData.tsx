import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { Booking, PartPayment } from '../types';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface ExportDataProps {}

const ExportData: React.FC<ExportDataProps> = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportDate, setLastExportDate] = useState<string | null>(null);
  const [exportStats, setExportStats] = useState({
    totalBookings: 0,
    totalPayments: 0,
    lastExportBookings: 0,
    lastExportPayments: 0
  });

  useEffect(() => {
    loadExportStats();
  }, []);

  const loadExportStats = async () => {
    try {
      // Get total counts
      const [bookingsData, paymentsData] = await Promise.all([
        supabase.from('bookings').select('*'),
        supabase.from('part_payments').select('*')
      ]);

      setExportStats({
        totalBookings: bookingsData.data?.length || 0,
        totalPayments: paymentsData.data?.length || 0,
        lastExportBookings: 0, // Will be updated when we implement export tracking
        lastExportPayments: 0
      });
    } catch (error) {
      console.error('Error loading export stats:', error);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Fetch all bookings and payments data
      const [bookingsResponse, paymentsResponse] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: true }),
        supabase.from('part_payments').select('*').order('created_at', { ascending: true })
      ]);

      if (bookingsResponse.error) throw bookingsResponse.error;
      if (paymentsResponse.error) throw paymentsResponse.error;

      const bookings = bookingsResponse.data || [];
      const payments = paymentsResponse.data || [];

      // Create Excel workbook with multiple sheets
      const workbook = {
        Sheets: {
          'Bookings': createBookingsSheet(bookings),
          'Payments': createPaymentsSheet(payments),
          'Summary': createSummarySheet(bookings, payments)
        },
        SheetNames: ['Bookings', 'Payments', 'Summary']
      };

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `shaadiyaar_data_export_${timestamp}.xlsx`;

      // Convert workbook to blob and download
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update last export date
      setLastExportDate(new Date().toISOString());
      
      toast.success(`Data exported successfully! ${bookings.length} bookings and ${payments.length} payments exported.`);
      
      // Refresh stats
      await loadExportStats();
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const createBookingsSheet = (bookings: Booking[]) => {
    const headers = [
      'Booking ID', 'Serial No', 'Client Name', 'Contact Number', 'Address', 
      'Event Date', 'Slot', 'Menu Preference', 'Flower Decoration', 
      'Liquor Service', 'DJ Service', 'Gross Amount', 'GST Amount', 
      'Extras Amount', 'Net Amount', 'Advance Paid', 'Balance Amount', 
      'Status', 'Booking Date', 'Created At', 'Updated At'
    ];

    const data = bookings.map(booking => [
      booking.booking_id,
      booking.serial_no,
      booking.client_name,
      booking.contact_number || '',
      booking.address || '',
      booking.event_date,
      booking.slot || '',
      booking.menu_preference || '',
      booking.flower_decoration || '',
      booking.liquor_service ? 'Yes' : 'No',
      booking.dj_service ? 'Yes' : 'No',
      booking.gross_amount,
      booking.gst_amount,
      booking.extras_amount,
      booking.net_amount,
      booking.advance_paid,
      booking.balance_amount,
      booking.status,
      booking.booking_date,
      booking.created_at,
      booking.updated_at
    ]);

    // Create worksheet data
    const wsData = [headers, ...data];
    return XLSX.utils.aoa_to_sheet(wsData);
  };

  const createPaymentsSheet = (payments: PartPayment[]) => {
    const headers = [
      'Payment ID', 'Booking ID', 'Client Name', 'Amount', 
      'Payment Date', 'Description', 'Created At', 'Updated At'
    ];

    const data = payments.map(payment => [
      payment.payment_id,
      payment.booking_id,
      payment.client_name,
      payment.amount,
      payment.payment_date,
      payment.description || '',
      payment.created_at,
      payment.updated_at
    ]);

    // Create worksheet data
    const wsData = [headers, ...data];
    return XLSX.utils.aoa_to_sheet(wsData);
  };

  const createSummarySheet = (bookings: Booking[], payments: PartPayment[]) => {
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.net_amount, 0);
    const totalAdvancePaid = bookings.reduce((sum, booking) => sum + booking.advance_paid, 0);
    const totalPartPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPendingAmount = totalRevenue - totalAdvancePaid - totalPartPayments;

    const summaryData = [
      ['Export Summary', ''],
      ['Export Date', new Date().toLocaleDateString()],
      ['Export Time', new Date().toLocaleTimeString()],
      ['', ''],
      ['Bookings Summary', ''],
      ['Total Bookings', bookings.length],
      ['Confirmed Bookings', bookings.filter(b => b.status === 'confirmed').length],
      ['Pending Bookings', bookings.filter(b => b.status === 'pending').length],
      ['', ''],
      ['Financial Summary', ''],
      ['Total Revenue', totalRevenue],
      ['Total Advance Paid', totalAdvancePaid],
      ['Total Part Payments', totalPartPayments],
      ['Total Pending Amount', totalPendingAmount],
      ['', ''],
      ['Payments Summary', ''],
      ['Total Part Payments', payments.length],
      ['Average Payment Amount', payments.length > 0 ? (totalPartPayments / payments.length).toFixed(2) : 0]
    ];

    // Create worksheet data
    return XLSX.utils.aoa_to_sheet(summaryData);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="w-full space-y-4 p-3 md:p-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-foreground">
              Export Data
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Export bookings and payments data to Excel format
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-card rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Bookings</p>
                  <p className="text-lg font-bold text-foreground">
                    {exportStats.totalBookings.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Payments</p>
                  <p className="text-lg font-bold text-foreground">
                    {exportStats.totalPayments.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Last Export</p>
                  <p className="text-lg font-bold text-foreground">
                    {lastExportDate ? new Date(lastExportDate).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Export Status</p>
                  <p className="text-lg font-bold text-foreground">
                    {isExporting ? 'Exporting...' : 'Ready'}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 text-orange-600 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-orange-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Export Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6"
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Download className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-foreground">Export Data to Excel</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Download all bookings and payments data in a comprehensive Excel file
              </p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Complete bookings data with all details</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>All part payments and transaction history</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Financial summary and analytics</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Timestamped filename for easy tracking</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                onClick={exportToExcel}
                disabled={isExporting}
                className="flex items-center space-x-2"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Export to Excel</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={loadExportStats}
                disabled={isExporting}
                className="flex items-center space-x-2"
                size="lg"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Refresh Stats</span>
              </Button>
            </div>

            {lastExportDate && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Last exported on {new Date(lastExportDate).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Information Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Export Information</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Data Included:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>All booking records with complete details</li>
                  <li>All part payment transactions</li>
                  <li>Financial summaries and calculations</li>
                  <li>Export timestamp and metadata</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">File Format:</p>
                <p>Excel (.xlsx) file with multiple sheets for organized data presentation</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Security:</p>
                <p>Only administrators can access this export functionality</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExportData;
