-- 1. Modify users table
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verify_token VARCHAR(255) NULL,
ADD COLUMN email_verify_expires DATETIME NULL,
ADD COLUMN email_verify_sent_at DATETIME NULL,
ADD COLUMN verify_attempts INT DEFAULT 0;

-- 2. Create email_verifications table for persistent tracking
CREATE TABLE email_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  type ENUM('registration', 'email_change', 'password_reset') NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Create notification_preferences table
CREATE TABLE notification_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  low_stock_email BOOLEAN DEFAULT TRUE,
  purchase_updates BOOLEAN DEFAULT TRUE,
  bill_issued BOOLEAN DEFAULT TRUE,
  bill_overdue BOOLEAN DEFAULT TRUE,
  payment_received BOOLEAN DEFAULT TRUE,
  system_updates BOOLEAN DEFAULT FALSE,
  digest_frequency ENUM('instant', 'daily', 'weekly') DEFAULT 'instant',
  updated_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Create email_logs table for tracing deliveries
CREATE TABLE email_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  recipient VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status ENUM('sent', 'failed', 'bounced') NOT NULL,
  message_id VARCHAR(255) NULL,
  error_message TEXT NULL,
  workspace_id INT NULL,
  related_id INT NULL,
  related_type VARCHAR(50) NULL,
  sent_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Add last_reminder_sent_at to bills table for overdue cron job
ALTER TABLE bills
ADD COLUMN last_reminder_sent_at DATETIME NULL;
