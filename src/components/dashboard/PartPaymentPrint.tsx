import React from 'react';
import { PartPayment, Booking } from '../../types';
import { formatIndianCurrency, formatDate } from '../../utils/helpers';
import { Calendar, DollarSign, User, FileText, CreditCard } from 'lucide-react';

interface PartPaymentPrintProps {
  payment: PartPayment | null;
  booking?: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

const PartPaymentPrint: React.FC<PartPaymentPrintProps> = ({
  payment,
  booking,
  isOpen,
  onClose
}) => {
  if (!payment || !isOpen) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('part-payment-print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Part Payment Receipt - ${payment.payment_id}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  font-size: 12px;
                  line-height: 1.4;
                }
                .header { 
                  text-align: center; 
                  border-bottom: 2px solid #333; 
                  padding-bottom: 10px; 
                  margin-bottom: 20px; 
                }
                .company-name { 
                  font-size: 24px; 
                  font-weight: bold; 
                  color: #333; 
                  margin-bottom: 5px; 
                }
                .receipt-title { 
                  font-size: 18px; 
                  color: #666; 
                }
                .section { 
                  margin-bottom: 20px; 
                }
                .section-title { 
                  font-size: 14px; 
                  font-weight: bold; 
                  border-bottom: 1px solid #ccc; 
                  padding-bottom: 5px; 
                  margin-bottom: 10px; 
                }
                .row { 
                  display: flex; 
                  justify-content: space-between; 
                  margin-bottom: 8px; 
                }
                .label { 
                  font-weight: bold; 
                  color: #333; 
                }
                .value { 
                  color: #666; 
                }
                .amount { 
                  font-size: 16px; 
                  font-weight: bold; 
                  color: #333; 
                }
                .footer { 
                  margin-top: 30px; 
                  text-align: center; 
                  font-size: 10px; 
                  color: #999; 
                }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="company-name">Shaadiyaar</div>
                <div class="receipt-title">Part Payment Receipt</div>
              </div>
              
              <div class="section">
                <div class="section-title">Payment Information</div>
                <div class="row">
                  <span class="label">Payment ID:</span>
                  <span class="value">${payment.payment_id}</span>
                </div>
                <div class="row">
                  <span class="label">Amount:</span>
                  <span class="value amount">${formatIndianCurrency(payment.amount)}</span>
                </div>
                <div class="row">
                  <span class="label">Payment Date:</span>
                  <span class="value">${formatDate(payment.payment_date)}</span>
                </div>
                ${payment.description ? `
                <div class="row">
                  <span class="label">Description:</span>
                  <span class="value">${payment.description}</span>
                </div>
                ` : ''}
              </div>
              
              <div class="section">
                <div class="section-title">Client Information</div>
                <div class="row">
                  <span class="label">Client Name:</span>
                  <span class="value">${payment.client_name}</span>
                </div>
                <div class="row">
                  <span class="label">Booking ID:</span>
                  <span class="value">${payment.booking_id}</span>
                </div>
                ${booking ? `
                <div class="row">
                  <span class="label">Serial No:</span>
                  <span class="value">${booking.serial_no}</span>
                </div>
                <div class="row">
                  <span class="label">Event Date:</span>
                  <span class="value">${formatDate(booking.event_date)}</span>
                </div>
                ` : ''}
              </div>
              
              <div class="section">
                <div class="section-title">Status Information</div>
                <div class="row">
                  <span class="label">Status:</span>
                  <span class="value">${payment.is_pending ? 'Pending Approval' : 'Approved'}</span>
                </div>
                ${payment.created_at ? `
                <div class="row">
                  <span class="label">Created:</span>
                  <span class="value">${formatDate(payment.created_at)}</span>
                </div>
                ` : ''}
              </div>
              
              <div class="footer">
                <p>Thank you for your payment!</p>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Print Part Payment Receipt
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Print
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          <div id="part-payment-print-content" className="space-y-6">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Shaadiyaar</h1>
              <p className="text-lg text-gray-600">Part Payment Receipt</p>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">
                Payment Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Payment ID:</span>
                    <span>{payment.payment_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span className="text-lg font-bold text-primary">
                      {formatIndianCurrency(payment.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Payment Date:</span>
                    <span>{formatDate(payment.payment_date)}</span>
                  </div>
                  {payment.description && (
                    <div className="flex justify-between">
                      <span className="font-medium">Description:</span>
                      <span className="text-sm">{payment.description}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">
                Client Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Client Name:</span>
                    <span>{payment.client_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Booking ID:</span>
                    <span>{payment.booking_id}</span>
                  </div>
                  {booking && (
                    <div className="flex justify-between">
                      <span className="font-medium">Serial No:</span>
                      <span>{booking.serial_no}</span>
                    </div>
                  )}
                </div>
                {booking && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Event Date:</span>
                      <span>{formatDate(booking.event_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Amount:</span>
                      <span>{formatIndianCurrency(booking.net_amount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">
                Status Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    payment.is_pending 
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {payment.is_pending ? 'Pending Approval' : 'Approved'}
                  </span>
                </div>
                {payment.created_at && (
                  <div className="flex justify-between">
                    <span className="font-medium">Created:</span>
                    <span>{formatDate(payment.created_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Thank you for your payment!</p>
              <p className="text-xs text-gray-500">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartPaymentPrint; 