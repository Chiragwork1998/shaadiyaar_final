/*
  # Fix Admin Table Policies

  1. Changes
    - Update RLS policies for admin table to properly handle admin creation
    - Add policy for first admin creation
    - Add policy for full admins to create other admins
  
  2. Security
    - Maintains RLS enabled on admins table
    - Adds proper policies for admin management
*/

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow first admin creation when table is empty" ON admins;
DROP POLICY IF EXISTS "Full admins can create other admins" ON admins;

-- Create policy for first admin
CREATE POLICY "Allow first admin creation when table is empty"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.admins
  )
);

-- Create policy for full admins to create other admins
CREATE POLICY "Full admins can create other admins"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.admins
    WHERE 
      admin_id = auth.uid() AND 
      permissions = 'full'
  )
);