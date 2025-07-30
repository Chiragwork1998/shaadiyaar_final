-- First, temporarily disable the constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Update all existing leads to have lowercase status values and ensure no nulls
UPDATE leads 
SET status = COALESCE(LOWER(status), 'new');

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

-- Make status column NOT NULL
ALTER TABLE leads 
ALTER COLUMN status SET NOT NULL;

-- Ensure all existing rows have a valid status
UPDATE leads 
SET status = 'new' 
WHERE status NOT IN (
  'new',
  'contacted',
  'meeting_scheduled',
  'proposal_sent',
  'negotiating',
  'booked',
  'cancelled',
  'completed'
);