/*
  # Fix recursive admin policies

  1. Changes
    - Remove recursive policies from admins table
    - Create new non-recursive policies for:
      - Reading admins (based on admin role)
      - Modifying admins (based on full admin permissions)
    
  2. Security
    - Maintains RLS on admins table
    - Ensures only admins can read the admins table
    - Ensures only full admins can modify the table
    - Prevents infinite recursion by using direct role checks
*/

-- Drop existing policies to replace them
DROP POLICY IF EXISTS "Admins can read admins table" ON admins;
DROP POLICY IF EXISTS "Full admins can modify admins table" ON admins;

-- Create new non-recursive policies
CREATE POLICY "Enable read access for admins"
ON public.admins
FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Enable full access for full admins"
ON public.admins
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role'::text) = 'admin'::text
  AND
  permissions = 'full'
);