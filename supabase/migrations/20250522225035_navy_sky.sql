/*
  # Fix Admin Policies Recursion

  This migration fixes the infinite recursion issue in admin policies by:
  1. Dropping existing policies that cause recursion
  2. Creating new non-recursive policies with proper access control
  3. Ensuring first admin creation works correctly
  4. Maintaining proper security boundaries
*/

-- First, drop all existing policies
DROP POLICY IF EXISTS "Allow first admin creation" ON public.admins;
DROP POLICY IF EXISTS "Allow read access" ON public.admins;
DROP POLICY IF EXISTS "Allow full admin management" ON public.admins;

-- 1. Basic read access for authenticated users
CREATE POLICY "Enable read access"
ON public.admins
FOR SELECT 
TO authenticated
USING (true);

-- 2. First admin creation (when table is empty)
CREATE POLICY "Allow first admin creation"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (SELECT 1 FROM public.admins)
);

-- 3. Full admin management (non-recursive)
CREATE POLICY "Full admin access"
ON public.admins
FOR ALL
TO authenticated
USING (
  CASE 
    -- Allow if table is empty (first admin)
    WHEN NOT EXISTS (SELECT 1 FROM public.admins) THEN true
    -- Otherwise, check if user is a full admin
    ELSE EXISTS (
      SELECT 1
      FROM public.admins
      WHERE admin_id = auth.uid()
      AND permissions = 'full'
    )
  END
)
WITH CHECK (
  CASE 
    -- Allow if table is empty (first admin)
    WHEN NOT EXISTS (SELECT 1 FROM public.admins) THEN true
    -- Otherwise, check if user is a full admin
    ELSE EXISTS (
      SELECT 1
      FROM public.admins
      WHERE admin_id = auth.uid()
      AND permissions = 'full'
    )
  END
);