import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/Button';
import { PartPayment, Booking } from '../../types';
import { formatIndianCurrency, formatDate } from '../../utils/helpers';
import { Calendar, DollarSign, User, FileText, CreditCard } from 'lucide-react';

interface PartPaymentViewProps {
  payment: PartPayment | null;
  booking?: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const PartPaymentView: React.FC<PartPaymentViewProps> = ({
  payment,
  booking,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Part Payment Details
          </DialogTitle>
          <DialogDescription>
            Complete information for this part payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Amount:</span>
                  <span className="text-lg font-semibold text-primary">
                    {formatIndianCurrency(payment.amount)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Payment Date:</span>
                  <span>{formatDate(payment.payment_date)}</span>
                </div>
                {payment.description && (
                  <div className="flex items-start space-x-2">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="font-medium">Description:</span>
                    <span className="text-sm">{payment.description}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Client:</span>
                  <span>{payment.client_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Booking ID:</span>
                  <span>{payment.booking_id}</span>
                </div>
                {booking && (
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Serial No:</span>
                    <span>{booking.serial_no}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Information (if available) */}
          {booking && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Associated Booking
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Client Name:</span>
                    <span>{booking.client_name}</span>
                  </div>
                  {booking.contact_number && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Contact:</span>
                      <span>{booking.contact_number}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Event Date:</span>
                    <span>{formatDate(booking.event_date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Total Amount:</span>
                    <span>{formatIndianCurrency(booking.net_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Status Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  payment.is_pending 
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400'
                }`}>
                  {payment.is_pending ? 'Pending Approval' : 'Approved'}
                </span>
              </div>
              {payment.created_at && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Created:</span>
                  <span>{formatDate(payment.created_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit}>
            Edit Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartPaymentView; 