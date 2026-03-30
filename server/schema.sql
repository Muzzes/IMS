-- ============================================================
-- IMS Database Schema with Multi-Business Workspace Support
-- ============================================================

CREATE DATABASE IF NOT EXISTS ims_db;
USE ims_db;

-- ──────────────────────────────────────
-- Users
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin','staff','manufacturer') NOT NULL DEFAULT 'staff',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────
-- Workspaces
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspaces (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  logo_url    VARCHAR(500),
  color       VARCHAR(7) DEFAULT '#6366f1',
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────
-- Workspace ↔ User assignments
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspace_users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id  INT NOT NULL,
  user_id       INT NOT NULL,
  access_level  ENUM('full','read_only') NOT NULL DEFAULT 'full',
  assigned_by   INT,
  assigned_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_workspace_user (workspace_id, user_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)      REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by)  REFERENCES users(id) ON DELETE SET NULL
);

-- ──────────────────────────────────────
-- Suppliers
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id  INT NOT NULL,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255),
  phone         VARCHAR(20),
  address       TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX idx_suppliers_workspace ON suppliers(workspace_id);

-- ──────────────────────────────────────
-- Products
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id    INT NOT NULL,
  name            VARCHAR(200) NOT NULL,
  sku             VARCHAR(50),
  description     TEXT,
  category        VARCHAR(100),
  unit_price      DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_price      DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock_quantity  INT UNSIGNED NOT NULL DEFAULT 0,
  min_stock_level INT NOT NULL DEFAULT 10,
  supplier_id     INT,
  manufacturer_id INT,
  image_url       VARCHAR(500),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id)    REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id)     REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (manufacturer_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_products_workspace ON products(workspace_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);

-- ──────────────────────────────────────
-- Purchases (Purchase Orders)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchases (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id    INT NOT NULL,
  purchase_number VARCHAR(50) NOT NULL,
  supplier_id     INT,
  total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
  status          ENUM('draft','pending','delivering','delivered','received','cancelled') NOT NULL DEFAULT 'draft',
  notes           TEXT,
  order_date      DATE,
  received_date   DATE,
  created_by      INT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id)  REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)   REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_purchases_workspace ON purchases(workspace_id);

CREATE TABLE IF NOT EXISTS purchase_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id   INT NOT NULL,
  product_id    INT NOT NULL,
  quantity      INT NOT NULL DEFAULT 1,
  unit_cost     DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_cost    DECIMAL(12,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE
);

-- ──────────────────────────────────────
-- Sales
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id    INT NOT NULL,
  sale_number     VARCHAR(50) NOT NULL,
  customer_name   VARCHAR(200),
  customer_email  VARCHAR(255),
  customer_phone  VARCHAR(20),
  total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount        DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax             DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
  status          ENUM('pending','completed','refunded') NOT NULL DEFAULT 'pending',
  notes           TEXT,
  created_by      INT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by)   REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_sales_workspace ON sales(workspace_id);

CREATE TABLE IF NOT EXISTS sale_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  sale_id     INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  unit_price  DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (sale_id)    REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ──────────────────────────────────────
-- Bills
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS bills (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id  INT NOT NULL,
  bill_number   VARCHAR(50) NOT NULL,
  purchase_id   INT,
  supplier_id   INT,
  total_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_amount   DECIMAL(12,2) NOT NULL DEFAULT 0,
  status        ENUM('draft','pending','partially_paid','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
  due_date      DATE,
  notes         TEXT,
  created_by    INT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (purchase_id)  REFERENCES purchases(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id)  REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)   REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_bills_workspace ON bills(workspace_id);

CREATE TABLE IF NOT EXISTS bill_payments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  bill_id       INT NOT NULL,
  amount        DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  reference     VARCHAR(100),
  payment_date  DATE,
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);

-- ──────────────────────────────────────
-- Notifications
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id  INT,
  user_id       INT NOT NULL,
  title         VARCHAR(200) NOT NULL,
  message       TEXT,
  type          ENUM('info','warning','error','success') NOT NULL DEFAULT 'info',
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  link          VARCHAR(500),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)      REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_workspace ON notifications(workspace_id);

-- ──────────────────────────────────────
-- Audit Logs
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id   INT,
  details     JSON,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
