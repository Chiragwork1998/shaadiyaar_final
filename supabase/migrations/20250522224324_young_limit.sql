/*
  # Fix Admin Policies

  1. Changes
    - Remove recursive policies that were causing infinite loops
    - Simplify admin access policies
    - Add proper checks for admin roles and permissions

  2. Security
    - Maintain RLS for admins table
    - Ensure proper access control based on admin permissions
    - Prevent infinite recursion in policies
*/

-- First, drop existing policies to clean up
DROP POLICY IF EXISTS "Authenticated users can read admins" ON admins;
DROP POLICY IF EXISTS "Full admins can manage admins" ON admins;
DROP POLICY IF EXISTS "Super admin has full access" ON admins;

-- Create new, simplified policies
CREATE POLICY "Enable read access for authenticated users"
ON admins FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated admins"
ON admins FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admin_id = auth.uid()
    AND permissions = 'full'
  )
);

CREATE POLICY "Enable update for full admins"
ON admins FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admin_id = auth.uid()
    AND permissions = 'full'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admin_id = auth.uid()
    AND permissions = 'full'
  )
);

CREATE POLICY "Enable delete for full admins"
ON admins FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admin_id = auth.uid()
    AND permissions = 'full'
  )
);