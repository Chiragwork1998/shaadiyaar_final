/*
  # Fix Admin Policies

  1. Changes
    - Drop existing policies that cause infinite recursion
    - Create new simplified policies for admin access
    - Add policy for super admin access

  2. Security
    - Super admin (Parth) has full access
    - Full admins can manage other admins
    - All authenticated admins can read the admins table
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for admins" ON admins;
DROP POLICY IF EXISTS "Enable full access for full admins" ON admins;

-- Create new policies
CREATE POLICY "Super admin has full access"
ON public.admins
FOR ALL
TO authenticated
USING (
  auth.uid()::text = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Full admins can manage admins"
ON public.admins
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admin_id = auth.uid()
    AND permissions = 'full'
  )
);

CREATE POLICY "Authenticated users can read admins"
ON public.admins
FOR SELECT
TO authenticated
USING (true);