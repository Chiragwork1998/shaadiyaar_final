/*
  # Fix Admin RLS Policies

  1. Changes
    - Update RLS policies for admins table to fix permission issues
    - Allow first admin to be created when table is empty
    - Allow full admins to manage other admins

  2. Security
    - Maintain RLS enabled on admins table
    - Add policy for bootstrapping first admin
    - Update policies for full admin management
*/

-- First, drop existing policies
DROP POLICY IF EXISTS "Enable delete for full admins" ON public.admins;
DROP POLICY IF EXISTS "Enable insert for authenticated admins" ON public.admins;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.admins;
DROP POLICY IF EXISTS "Enable update for full admins" ON public.admins;

-- Create new policies

-- Allow first admin to be created when table is empty
CREATE POLICY "Allow first admin creation when table is empty"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (SELECT 1 FROM public.admins)
);

-- Allow full admins to create other admins
CREATE POLICY "Full admins can create other admins"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admin_id = auth.uid()
    AND permissions = 'full'
  )
);

-- Allow authenticated users to read admin data
CREATE POLICY "Enable read access for authenticated users"
ON public.admins
FOR SELECT
TO authenticated
USING (true);

-- Allow full admins to update other admins
CREATE POLICY "Full admins can update other admins"
ON public.admins
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admin_id = auth.uid()
    AND permissions = 'full'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admin_id = auth.uid()
    AND permissions = 'full'
  )
);

-- Allow full admins to delete other admins
CREATE POLICY "Full admins can delete other admins"
ON public.admins
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admin_id = auth.uid()
    AND permissions = 'full'
  )
);