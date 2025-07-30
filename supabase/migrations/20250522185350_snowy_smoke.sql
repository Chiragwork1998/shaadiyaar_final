/*
  # Update leads table RLS policy
  
  1. Changes
    - Modify the leads table RLS policy to allow any authenticated user to read leads
    - Remove the role requirement since we're using the admins table for permissions
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Admins can read leads" ON leads;

-- Create new policy that allows any authenticated user to read leads
CREATE POLICY "Authenticated users can read leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (true);