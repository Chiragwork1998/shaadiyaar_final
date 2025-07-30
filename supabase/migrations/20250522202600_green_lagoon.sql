/*
  # Update lead status values and constraints
  
  1. Changes
    - Updates existing status values to new lowercase format
    - Modifies status check constraint to enforce new valid values
    
  2. New Status Values
    - new
    - contacted
    - meeting_scheduled
    - proposal_sent
    - negotiating
    - booked
    - cancelled
    - completed
*/

-- Temporarily disable the constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Update existing values to match new format
UPDATE leads 
SET status = CASE 
  WHEN LOWER(status) = 'new' THEN 'new'
  WHEN LOWER(status) = 'contacted' THEN 'contacted'
  WHEN LOWER(status) = 'qualified' THEN 'meeting_scheduled'
  WHEN LOWER(status) = 'proposal' THEN 'proposal_sent'
  WHEN LOWER(status) = 'negotiation' THEN 'negotiating'
  WHEN LOWER(status) = 'closed won' THEN 'booked'
  WHEN LOWER(status) = 'closed lost' THEN 'cancelled'
  ELSE 'new'
END;

-- Add the new constraint
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