-- Email-based authentication system
-- Add email management to existing admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS parent_admin_id VARCHAR(10);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS revoked_by VARCHAR(10);

-- Create admin_emails table for email management
CREATE TABLE IF NOT EXISTS admin_emails (
  id SERIAL PRIMARY KEY,
  admin_id VARCHAR(10) REFERENCES admins(admin_id),
  email VARCHAR(255) UNIQUE NOT NULL,
  access_code VARCHAR(10) NOT NULL,
  password_hash VARCHAR(255),
  use_shared_password BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'pending')),
  created_by VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  password_changed_at TIMESTAMP,
  last_login TIMESTAMP,
  revoked_at TIMESTAMP,
  revoked_by VARCHAR(10),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_expires_at TIMESTAMP
);

-- Create admin_email_sessions for tracking sessions per email
CREATE TABLE IF NOT EXISTS admin_email_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  admin_id VARCHAR(10) REFERENCES admins(admin_id),
  email VARCHAR(255) NOT NULL,
  access_code VARCHAR(10) NOT NULL,
  login_time TIMESTAMP DEFAULT NOW(),
  logout_time TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  last_activity TIMESTAMP DEFAULT NOW()
);

-- Create admin_email_audit_log for tracking all email-related actions
CREATE TABLE IF NOT EXISTS admin_email_audit_log (
  id SERIAL PRIMARY KEY,
  admin_id VARCHAR(10) REFERENCES admins(admin_id),
  email VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'revoked', 'password_changed', 'login', 'logout'
  action_data JSONB,
  performed_by VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_emails_email ON admin_emails(email);
CREATE INDEX IF NOT EXISTS idx_admin_emails_status ON admin_emails(status);
CREATE INDEX IF NOT EXISTS idx_admin_emails_admin_id ON admin_emails(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_email_sessions_email ON admin_email_sessions(email);
CREATE INDEX IF NOT EXISTS idx_admin_email_sessions_active ON admin_email_sessions(is_active);

-- Insert default admin emails for existing access codes
INSERT INTO admin_emails (admin_id, email, access_code, created_by, status) VALUES
('00-01', 'admin@shaadiyaar.com', '00-01', '00-01', 'active'),
('02-03', 'employee1@shaadiyaar.com', '02-03', '00-01', 'active'),
('02-03', 'employee2@shaadiyaar.com', '02-03', '00-01', 'active'),
('03-04', 'junior1@shaadiyaar.com', '03-04', '00-01', 'active'),
('05', 'inventory@shaadiyaar.com', '05', '00-01', 'active')
ON CONFLICT (email) DO NOTHING; 