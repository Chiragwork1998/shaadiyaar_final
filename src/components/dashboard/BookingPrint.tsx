import React, { useRef } from 'react';
import { 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  FileText,
  CreditCard,
  ShieldCheck,
  Building,
  Music,
  Wine,
  Flower,
  Printer
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Booking, PartPayment } from '../../types';
import { formatIndianCurrency, formatDate, getBookingStatusStyle, getBookingStatusText } from '../../utils/helpers';

interface BookingPrintProps {
  booking: Booking | null;
  partPayments: PartPayment[];
  onClose: () => void;
}

const BookingPrint: React.FC<BookingPrintProps> = ({
  booking,
  partPayments,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!booking) return null;

  // Calculate part payments for this booking
  const bookingPartPayments = partPayments.filter(payment => 
    payment.booking_id === booking.booking_id
  );
  const totalPartPayments = bookingPartPayments.reduce((sum, payment) => 
    sum + payment.amount, 0
  );
  const actualBalance = booking.net_amount - booking.advance_paid - totalPartPayments;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Booking Details - ${booking.client_name}</title>
              <style>
                @media print {
                  body { margin: 0; padding: 20px; }
                  .print-content { max-width: none; }
                }
                body { font-family: Arial, sans-serif; }
                .print-content { max-width: 800px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .financial-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
                .payment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
                .card { background: #f9f9f9; padding: 15px; border-radius: 8px; }
                .footer { border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; text-align: center; }
                @page { margin: 1in; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Print Booking Details</h2>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handlePrint}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>

        {/* Print Content */}
        <div ref={printRef} className="p-6 print-content">
          {/* Print Header */}
          <div className="text-center mb-6 print:mb-4 header">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shaadiyaar</h1>
            <p className="text-gray-600">Event Booking Details</p>
            <div className="border-t border-gray-300 mt-4 pt-4">
              <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Booking Header */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 print:mb-3 card">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{booking.client_name}</h2>
                <p className="text-gray-600 text-sm">Serial No: {booking.serial_no}</p>
                <p className="text-gray-600 text-sm">Booking Date: {formatDate(booking.booking_date)}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusStyle(booking.status)}`}>
                  {getBookingStatusText(booking.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Client and Event Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 print:mb-3 section">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Client Information
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-3 h-3 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Client Name</p>
                    <p className="text-sm font-medium">{booking.client_name}</p>
                  </div>
                </div>

                {booking.contact_number && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3 h-3 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Contact Number</p>
                      <p className="text-sm font-medium">{booking.contact_number}</p>
                    </div>
                  </div>
                )}

                {booking.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3 h-3 text-gray-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium">{booking.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Event Details
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Event Date</p>
                    <p className="text-sm font-medium">{formatDate(booking.event_date)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Time Slot</p>
                    <p className="text-sm font-medium">{booking.slot || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Building className="w-3 h-3 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Menu Preference</p>
                    <p className="text-sm font-medium">{booking.menu_preference || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Flower className="w-3 h-3 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Flower Decoration</p>
                    <p className="text-sm font-medium">{booking.flower_decoration || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Wine className="w-3 h-3 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Liquor Service</p>
                    <p className="text-sm font-medium">{booking.liquor_service ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Music className="w-3 h-3 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">DJ Service</p>
                    <p className="text-sm font-medium">{booking.dj_service ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="mb-4 print:mb-3 section">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Financial Details
            </h3>
            
            <div className="financial-grid mb-3">
              <div className="card">
                <div className="flex items-center space-x-2 mb-1">
                  <DollarSign className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">Gross Amount</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatIndianCurrency(booking.gross_amount)}</p>
              </div>

              <div className="card">
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">GST</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatIndianCurrency(booking.gst_amount)}</p>
              </div>

              <div className="card">
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">Extras</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatIndianCurrency(booking.extras_amount)}</p>
              </div>

              <div className="card">
                <div className="flex items-center space-x-2 mb-1">
                  <DollarSign className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">Net Amount</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{formatIndianCurrency(booking.net_amount)}</p>
              </div>
            </div>

            <div className="payment-grid">
              <div className="card">
                <div className="flex items-center space-x-2 mb-1">
                  <ShieldCheck className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">Advance Paid</span>
                </div>
                <p className="text-base font-bold text-green-600">{formatIndianCurrency(booking.advance_paid)}</p>
              </div>

              <div className="card">
                <div className="flex items-center space-x-2 mb-1">
                  <CreditCard className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">Part Payments</span>
                </div>
                <p className="text-base font-bold text-blue-600">{formatIndianCurrency(totalPartPayments)}</p>
              </div>

              <div className="card">
                <div className="flex items-center space-x-2 mb-1">
                  <CreditCard className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">Pending Balance</span>
                </div>
                <p className="text-base font-bold text-orange-600">{formatIndianCurrency(Math.max(0, actualBalance))}</p>
              </div>
            </div>
          </div>

          {/* Part Payments Section */}
          {bookingPartPayments.length > 0 && (
            <div className="mb-4 print:mb-3 section">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Part Payments ({bookingPartPayments.length})
              </h3>
              
              <div className="space-y-2">
                {bookingPartPayments.map((payment, index) => (
                  <div key={payment.payment_id} className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{payment.client_name}</p>
                          <p className="text-xs text-gray-500">{formatDate(payment.payment_date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatIndianCurrency(payment.amount)}</p>
                        {payment.description && (
                          <p className="text-xs text-gray-500">{payment.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Thank you for choosing Shaadiyaar</p>
              <p className="text-xs text-gray-400">This is a computer generated document</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPrint; 