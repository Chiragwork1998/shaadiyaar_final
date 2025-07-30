/*
  # Fix Admin Policies Recursion

  This migration fixes the infinite recursion issue in admin policies by:
  1. Dropping all existing policies
  2. Creating simplified, non-recursive policies
  3. Using direct auth.uid() checks instead of nested EXISTS queries
*/

-- First, drop all existing policies
DROP POLICY IF EXISTS "Enable read access" ON public.admins;
DROP POLICY IF EXISTS "Allow first admin creation" ON public.admins;
DROP POLICY IF EXISTS "Full admin access" ON public.admins;

-- Ensure RLS is enabled
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 1. Basic read access for authenticated users
CREATE POLICY "Enable read access"
ON public.admins
FOR SELECT 
TO authenticated
USING (true);

-- 2. Allow first admin creation
CREATE POLICY "Allow first admin creation"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 
    FROM public.admins
  )
);

-- 3. Allow full admins to insert new admins
CREATE POLICY "Allow full admin insert"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admins
    WHERE admin_id = auth.uid()
    AND permissions = 'full'
  )
);

-- 4. Allow full admins to update
CREATE POLICY "Allow full admin update"
ON public.admins
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admins
    WHERE admin_id = auth.uid()
    AND permissions = 'full'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admins
    WHERE admin_id = auth.uid()
    AND permissions = 'full'
  )
);

-- 5. Allow full admins to delete
CREATE POLICY "Allow full admin delete"
ON public.admins
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admins
    WHERE admin_id = auth.uid()
    AND permissions = 'full'
  )
);