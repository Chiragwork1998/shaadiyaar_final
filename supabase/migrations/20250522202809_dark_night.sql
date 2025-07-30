/*
  # Fix status synchronization

  This migration ensures proper status synchronization by:
  1. Temporarily removing the status constraint
  2. Converting existing status values to the new format
  3. Adding back the constraint with the new valid values
*/

-- Temporarily disable the constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Update any existing status values to match new format
UPDATE leads 
SET status = LOWER(status);

-- Add the new constraint with the correct values
ALTER TABLE leads 
ADD CONSTRAINT leads_status_check 
CHECK (status IN (
  'new',
  'contacted',
  'meeting_scheduled',
  'proposal_sent',
  'negotiating',
  'booked',
  'cancelled',
  'completed'
));