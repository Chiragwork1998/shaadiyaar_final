-- Add new payment fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS miscellaneous_payments DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_payments DECIMAL(10,2) DEFAULT 0;

-- Update existing records to have default values
UPDATE bookings 
SET miscellaneous_payments = 0, other_payments = 0 
WHERE miscellaneous_payments IS NULL OR other_payments IS NULL;
