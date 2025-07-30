/*
  # Fix Admin RLS Policies

  1. Changes
    - Drop existing policies that may be causing recursion
    - Create simplified policies for admin management
    - Fix infinite recursion in policy checks
    - Add proper policy for first admin creation
  
  2. Security
    - Enable RLS on admins table
    - Add policies for:
      - First admin creation
      - Read access
      - Admin management by full admins
*/

-- First ensure RLS is enabled
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow first admin creation when table is empty" ON public.admins;
DROP POLICY IF EXISTS "Full admins can create other admins" ON public.admins;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.admins;
DROP POLICY IF EXISTS "Full admins can update other admins" ON public.admins;
DROP POLICY IF EXISTS "Full admins can delete other admins" ON public.admins;

-- Create new simplified policies

-- Allow first admin creation (when table is empty)
CREATE POLICY "Allow first admin creation"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.admins
  )
);

-- Allow read access for authenticated users
CREATE POLICY "Allow read access"
ON public.admins
FOR SELECT
TO authenticated
USING (true);

-- Allow full admins to manage other admins
CREATE POLICY "Allow full admin management"
ON public.admins
FOR ALL
TO authenticated
USING (
  (
    -- Allow access if user is a full admin
    EXISTS (
      SELECT 1
      FROM public.admins
      WHERE admin_id = auth.uid()
      AND permissions = 'full'
    )
  ) OR
  (
    -- Or if this is the first admin being created
    NOT EXISTS (
      SELECT 1
      FROM public.admins
    )
  )
)
WITH CHECK (
  (
    -- Allow modifications if user is a full admin
    EXISTS (
      SELECT 1
      FROM public.admins
      WHERE admin_id = auth.uid()
      AND permissions = 'full'
    )
  ) OR
  (
    -- Or if this is the first admin being created
    NOT EXISTS (
      SELECT 1
      FROM public.admins
    )
  )
);