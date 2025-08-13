import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
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
  Flower
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Booking, PartPayment } from '../../types';
import { formatIndianCurrency, formatDate, getBookingStatusStyle, getBookingStatusText } from '../../utils/helpers';

interface BookingViewProps {
  booking: Booking | null;
  partPayments: PartPayment[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const BookingView: React.FC<BookingViewProps> = ({
  booking,
  partPayments,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!booking) return null;

  // Calculate part payments for this booking
  const bookingPartPayments = partPayments.filter(payment => 
    payment.booking_id === booking.booking_id
  );
  const totalPartPayments = bookingPartPayments.reduce((sum, payment) => 
    sum + payment.amount, 0
  );
  const actualBalance = booking.net_amount - booking.advance_paid - totalPartPayments;

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Booking Details</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 px-3"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 px-3"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{booking.client_name}</h2>
                <p className="text-muted-foreground">Serial No: {booking.serial_no}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBookingStatusStyle(booking.status)}`}>
                  {getBookingStatusText(booking.status)}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  Created: {formatDate(booking.booking_date)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Client Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <User className="w-5 h-5 mr-2" />
                Client Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Client Name</p>
                    <p className="font-medium">{booking.client_name}</p>
                  </div>
                </div>

                {booking.contact_number && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Number</p>
                      <p className="font-medium">{booking.contact_number}</p>
                    </div>
                  </div>
                )}

                {booking.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{booking.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Event Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Event Date</p>
                    <p className="font-medium">{formatDate(booking.event_date)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time Slot</p>
                    <p className="font-medium">{booking.slot || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Menu Preference</p>
                    <p className="font-medium">{booking.menu_preference || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Flower className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Flower Decoration</p>
                    <p className="font-medium">{booking.flower_decoration || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Wine className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Liquor Service</p>
                    <p className="font-medium">{booking.liquor_service ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Music className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">DJ Service</p>
                    <p className="font-medium">{booking.dj_service ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Financial Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Gross Amount</span>
                </div>
                <p className="text-xl font-bold text-foreground">{formatIndianCurrency(booking.gross_amount)}</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">GST</span>
                </div>
                <p className="text-xl font-bold text-foreground">{formatIndianCurrency(booking.gst_amount)}</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Extras</span>
                </div>
                <p className="text-xl font-bold text-foreground">{formatIndianCurrency(booking.extras_amount)}</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Net Amount</span>
                </div>
                <p className="text-xl font-bold text-primary">{formatIndianCurrency(booking.net_amount)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Advance Paid</span>
                </div>
                <p className="text-lg font-bold text-green-600">{formatIndianCurrency(booking.advance_paid)}</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Part Payments</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{formatIndianCurrency(totalPartPayments)}</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Pending Balance</span>
                </div>
                <p className="text-lg font-bold text-orange-600">{formatIndianCurrency(Math.max(0, actualBalance))}</p>
              </div>
            </div>
          </motion.div>

          {/* Part Payments Section */}
          {bookingPartPayments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Part Payments ({bookingPartPayments.length})
              </h3>
              
              <div className="space-y-2">
                {bookingPartPayments.map((payment, index) => (
                  <div key={payment.payment_id} className="bg-card border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{payment.client_name}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(payment.payment_date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{formatIndianCurrency(payment.amount)}</p>
                        {payment.description && (
                          <p className="text-xs text-muted-foreground">{payment.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingView; 