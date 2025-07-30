-- First, temporarily disable the constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Update all existing leads to have lowercase status values
UPDATE leads 
SET status = LOWER(status);

-- Update any 'new' status that might be 'New'
UPDATE leads 
SET status = 'new' 
WHERE status = 'New';

-- Add the constraint back with the correct values
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

-- Set default value for status column
ALTER TABLE leads 
ALTER COLUMN status SET DEFAULT 'new';