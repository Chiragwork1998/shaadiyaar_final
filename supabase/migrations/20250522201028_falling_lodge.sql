/*
  # Add status column to leads table

  1. Changes
    - Add `status` column to `leads` table with valid status options:
      - 'New'
      - 'Contacted'
      - 'Qualified'
      - 'Proposal'
      - 'Negotiation'
      - 'Closed Won'
      - 'Closed Lost'
    - Set default status to 'New'
    - Add check constraint to ensure only valid statuses are used

  2. Security
    - Existing RLS policies will automatically apply to the new column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'status'
  ) THEN
    ALTER TABLE leads 
    ADD COLUMN status text NOT NULL DEFAULT 'New';

    ALTER TABLE leads 
    ADD CONSTRAINT leads_status_check 
    CHECK (status IN (
      'New',
      'Contacted',
      'Qualified',
      'Proposal',
      'Negotiation',
      'Closed Won',
      'Closed Lost'
    ));
  END IF;
END $$;