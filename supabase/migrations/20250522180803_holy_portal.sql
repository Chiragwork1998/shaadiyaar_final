/*
  # Initial Schema Setup for Wedding Leads Admin

  1. New Tables
    - Admins
      - admin_id (uuid, primary key)
      - email (text, unique)
      - name (text)
      - permissions (text, check constraint)
      - created_at (timestamptz)
    
    - Vendors
      - vendor_id (uuid, primary key)
      - name (text)
      - contact_number (text)
      - subscription_plan (text, check constraint)
      - lead_limit (integer)
      - subscription_expiry (timestamptz)
      - created_at (timestamptz)
    
    - LeadAssignments
      - assignment_id (uuid, primary key)
      - lead_id (uuid, foreign key)
      - vendor_id (uuid, foreign key)
      - assigned_at (timestamptz)
    
    - Notifications
      - notification_id (uuid, primary key)
      - admin_id (uuid, foreign key)
      - message (text)
      - is_read (boolean)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
    - Add specific policies for limited admins
*/

-- Create Admins table
CREATE TABLE IF NOT EXISTS admins (
  admin_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  permissions text NOT NULL CHECK (permissions IN ('full', 'limited')),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  vendor_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_number text,
  subscription_plan text NOT NULL CHECK (subscription_plan IN ('Basic', 'Premium')),
  lead_limit integer NOT NULL,
  subscription_expiry timestamptz NOT NULL,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create LeadAssignments table
CREATE TABLE IF NOT EXISTS lead_assignments (
  assignment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(lead_id),
  vendor_id uuid REFERENCES vendors(vendor_id),
  assigned_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admins(admin_id),
  message text NOT NULL,
  is_read boolean DEFAULT FALSE,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policies for Leads table
CREATE POLICY "Admins can read leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Full admins can insert/update leads"
  ON leads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Full admins can delete leads"
  ON leads
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admin_id = auth.uid()
      AND permissions = 'full'
    )
  );

-- Policies for Admins table
CREATE POLICY "Admins can read admins table"
  ON admins
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Full admins can modify admins table"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admin_id = auth.uid()
      AND permissions = 'full'
    )
  );

-- Policies for Vendors table
CREATE POLICY "Full admins can access vendors"
  ON vendors
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admin_id = auth.uid()
      AND permissions = 'full'
    )
  );

-- Policies for LeadAssignments table
CREATE POLICY "Full admins can access lead assignments"
  ON lead_assignments
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admin_id = auth.uid()
      AND permissions = 'full'
    )
  );

-- Policies for Notifications table
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid());

CREATE POLICY "Admins can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Insert initial admin user
-- INSERT INTO admins (admin_id, email, name, permissions, created_at)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   'parth@weddingapp.com',
--   'Parth',
--   'full',
--   '2025-05-22 23:37:00+05:30'
-- );