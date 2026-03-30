const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const TBL_SETUP = `
CREATE DATABASE IF NOT EXISTS stockflow_ims CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stockflow_ims;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE TABLE workspaces (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, name VARCHAR(100) NOT NULL, description VARCHAR(500) NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#818cf8', logo_url VARCHAR(500) NULL, status ENUM('active','archived') NOT NULL DEFAULT 'active',
  created_by INT UNSIGNED NULL, created_at DATETIME NOT NULL DEFAULT NOW(), updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id), UNIQUE KEY uq_workspace_name (name), INDEX idx_workspace_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, name VARCHAR(100) NOT NULL, email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL, role ENUM('admin','staff','manufacturer') NOT NULL,
  status ENUM('active','inactive','pending') NOT NULL DEFAULT 'pending', email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verify_token VARCHAR(255) NULL, email_verify_expires DATETIME NULL, reset_token VARCHAR(255) NULL,
  reset_token_expires DATETIME NULL, login_attempts TINYINT NOT NULL DEFAULT 0, locked_until DATETIME NULL,
  last_login_at DATETIME NULL, last_login_ip VARCHAR(45) NULL, avatar_url VARCHAR(500) NULL,
  created_by INT UNSIGNED NULL, created_at DATETIME NOT NULL DEFAULT NOW(), updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id), UNIQUE KEY uq_user_email (email), INDEX idx_user_role (role), INDEX idx_user_status (status),
  INDEX idx_user_email_verified (email_verified), INDEX idx_user_reset_token (reset_token),
  CONSTRAINT fk_user_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE workspaces ADD CONSTRAINT fk_workspace_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE workspace_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, workspace_id INT UNSIGNED NOT NULL, user_id INT UNSIGNED NOT NULL,
  access_level ENUM('full','read_only') NOT NULL DEFAULT 'full', assigned_by INT UNSIGNED NULL,
  assigned_at DATETIME NOT NULL DEFAULT NOW(), revoked_at DATETIME NULL,
  PRIMARY KEY (id), UNIQUE KEY uq_workspace_user (workspace_id, user_id), INDEX idx_wu_user_id (user_id), INDEX idx_wu_workspace_id (workspace_id),
  CONSTRAINT fk_wu_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_wu_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wu_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE email_verifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, user_id INT UNSIGNED NOT NULL, token VARCHAR(255) NOT NULL,
  email VARCHAR(254) NOT NULL, type ENUM('registration','email_change','password_reset','invite') NOT NULL,
  expires_at DATETIME NOT NULL, used_at DATETIME NULL, ip_address VARCHAR(45) NULL, created_at DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id), UNIQUE KEY uq_ev_token (token), INDEX idx_ev_user_id (user_id), INDEX idx_ev_type (type), INDEX idx_ev_expires (expires_at),
  CONSTRAINT fk_ev_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE manufacturers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, workspace_id INT UNSIGNED NOT NULL, user_id INT UNSIGNED NULL,
  name VARCHAR(100) NOT NULL, contact_name VARCHAR(100) NULL, email VARCHAR(254) NULL, phone VARCHAR(20) NULL,
  address VARCHAR(500) NULL, city VARCHAR(100) NULL, country VARCHAR(100) NULL, product_categories JSON NULL,
  lead_time_days SMALLINT NULL, minimum_order_qty INT NULL, notes TEXT NULL, status ENUM('active','archived') NOT NULL DEFAULT 'active',
  created_by INT UNSIGNED NULL, created_at DATETIME NOT NULL DEFAULT NOW(), updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id), INDEX idx_mfr_workspace (workspace_id), INDEX idx_mfr_user (user_id), INDEX idx_mfr_status (status),
  CONSTRAINT fk_mfr_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_mfr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_mfr_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE suppliers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, workspace_id INT UNSIGNED NOT NULL, name VARCHAR(100) NOT NULL,
  contact_name VARCHAR(100) NULL, email VARCHAR(254) NULL, phone VARCHAR(20) NULL, address VARCHAR(500) NULL,
  city VARCHAR(100) NULL, country VARCHAR(100) NULL, notes TEXT NULL, status ENUM('active','archived') NOT NULL DEFAULT 'active',
  created_by INT UNSIGNED NULL, created_at DATETIME NOT NULL DEFAULT NOW(), updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id), INDEX idx_sup_workspace (workspace_id), INDEX idx_sup_status (status),
  CONSTRAINT fk_sup_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_sup_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, workspace_id INT UNSIGNED NOT NULL, name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL, parent_id INT UNSIGNED NULL, created_at DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id), UNIQUE KEY uq_cat_workspace_name (workspace_id, name), INDEX idx_cat_parent (parent_id),
  CONSTRAINT fk_cat_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, workspace_id INT UNSIGNED NOT NULL, manufacturer_id INT UNSIGNED NULL, category_id INT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL, sku VARCHAR(50) NOT NULL, description TEXT NULL, price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  cost_price DECIMAL(12, 2) NULL, stock_qty INT NOT NULL DEFAULT 0, stock_threshold INT NOT NULL DEFAULT 10,
  unit VARCHAR(50) NULL, weight DECIMAL(8, 3) NULL, dimensions JSON NULL, attributes JSON NULL, image_url VARCHAR(500) NULL,
  status ENUM('active','archived','discontinued') NOT NULL DEFAULT 'active', created_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(), updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id), UNIQUE KEY uq_product_sku_workspace (sku, workspace_id), INDEX idx_prod_workspace (workspace_id),
  INDEX idx_prod_manufacturer (manufacturer_id), INDEX idx_prod_category (category_id), INDEX idx_prod_status (status),
  INDEX idx_prod_stock (stock_qty), INDEX idx_prod_sku (sku), FULLTEXT INDEX ft_prod_search (name, sku, description),
  CONSTRAINT fk_prod_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_prod_manufacturer FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE SET NULL,
  CONSTRAINT fk_prod_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_prod_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_prod_price CHECK (price >= 0), CONSTRAINT chk_prod_stock CHECK (stock_qty >= 0),
  CONSTRAINT chk_prod_threshold CHECK (stock_threshold >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE stock_movements (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, product_id INT UNSIGNED NOT NULL, workspace_id INT UNSIGNED NOT NULL,
  type ENUM('purchase_received','sale','refund','manual_add','manual_remove','stocktake','damaged','return','transfer_in','transfer_out') NOT NULL,
  quantity INT NOT NULL, qty_before INT NOT NULL, qty_after INT NOT NULL, reference_type VARCHAR(50) NULL, reference_id INT UNSIGNED NULL,
  reason VARCHAR(255) NULL, notes TEXT NULL, created_by INT UNSIGNED NULL, created_at DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id), INDEX idx_sm_product (product_id), INDEX idx_sm_workspace (workspace_id), INDEX idx_sm_type (type),
  INDEX idx_sm_created (created_at), INDEX idx_sm_reference (reference_type, reference_id),
  CONSTRAINT fk_sm_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_sm_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_sm_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE purchases (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, workspace_id INT UNSIGNED NOT NULL, supplier_id INT UNSIGNED NULL,
  po_number VARCHAR(50) NOT NULL, status ENUM('pending','ordered','partial','received','cancelled') NOT NULL DEFAULT 'pending',
  order_date DATE NOT NULL, expected_date DATE NULL, received_date DATE NULL, subtotal DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00, tax_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00, total DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  notes TEXT NULL, created_by INT UNSIGNED NULL, received_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(), updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id), UNIQUE KEY uq_po_number_workspace (po_number, workspace_id), INDEX idx_pur_workspace (workspace_id),
  INDEX idx_pur_supplier (supplier_id), INDEX idx_pur_status (status), INDEX idx_pur_order_date (order_date),
  INDEX idx_pur_po_number (po_number),
  CONSTRAINT fk_pur_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_pur_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  CONSTRAINT fk_pur_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_pur_received_by FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE purchase_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, purchase_id INT UNSIGNED NOT NULL, product_id INT UNSIGNED NULL,
  product_name VARCHAR(255) NOT NULL, product_sku VARCHAR(50) NOT NULL, quantity INT NOT NULL, qty_received INT NOT NULL DEFAULT 0,
  unit_price DECIMAL(12, 2) NOT NULL, subtotal DECIMAL(14, 2) NOT NULL,
  PRIMARY KEY (id), INDEX idx_pi_purchase (purchase_id), INDEX idx_pi_product (product_id),
  CONSTRAINT fk_pi_purchase FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
  CONSTRAINT fk_pi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT chk_pi_quantity CHECK (quantity > 0), CONSTRAINT chk_pi_qty_received CHECK (qty_received >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sales (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, workspace_id INT UNSIGNED NOT NULL, sale_number VARCHAR(50) NOT NULL,
  customer_name VARCHAR(100) NULL, customer_email VARCHAR(254) NULL, customer_phone VARCHAR(20) NULL, customer_address TEXT NULL,
  sale_date DATE NOT NULL, status ENUM('draft','completed','refunded','partial_refund') NOT NULL DEFAULT 'draft',
  subtotal DECIMAL(14, 2) NOT NULL DEFAULT 0.00, discount_type ENUM('none','percentage','fixed') NOT NULL DEFAULT 'none',
  discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00, discount_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00, tax_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(14, 2) NOT NULL DEFAULT 0.00, notes TEXT NULL, created_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(), updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id), UNIQUE KEY uq_sale_number_workspace (sale_number, workspace_id), INDEX idx_sale_workspace (workspace_id),
  INDEX idx_sale_status (status), INDEX idx_sale_date (sale_date), INDEX idx_sale_customer_email (customer_email), INDEX idx_sale_number (sale_number),
  CONSTRAINT fk_sale_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_sale_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sale_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, sale_id INT UNSIGNED NOT NULL, product_id INT UNSIGNED NULL,
  product_name VARCHAR(255) NOT NULL, product_sku VARCHAR(50) NOT NULL, quantity INT NOT NULL, qty_refunded INT NOT NULL DEFAULT 0,
  unit_price DECIMAL(12, 2) NOT NULL, subtotal DECIMAL(14, 2) NOT NULL,
  PRIMARY KEY (id), INDEX idx_si_sale (sale_id), INDEX idx_si_product (product_id),
  CONSTRAINT fk_si_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  CONSTRAINT fk_si_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT chk_si_quantity CHECK (quantity > 0), CONSTRAINT chk_si_qty_refunded CHECK (qty_refunded >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE refunds (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, sale_id INT UNSIGNED NOT NULL, workspace_id INT UNSIGNED NOT NULL,
  reason VARCHAR(255) NOT NULL, notes TEXT NULL, total_refunded DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  restock BOOLEAN NOT NULL DEFAULT TRUE, created_by INT UNSIGNED NULL, created_at DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id), INDEX idx_ref_sale (sale_id), INDEX idx_ref_workspace (workspace_id),
  CONSTRAINT fk_ref_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  CONSTRAINT fk_ref_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_ref_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE refund_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, refund_id INT UNSIGNED NOT NULL, sale_item_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NULL, quantity INT NOT NULL, unit_price DECIMAL(12, 2) NOT NULL, subtotal DECIMAL(14, 2) NOT NULL,
  PRIMARY KEY (id), INDEX idx_ri_refund (refund_id), INDEX idx_ri_sale_item (sale_item_id),
  CONSTRAINT fk_ri_refund FOREIGN KEY (refund_id) REFERENCES refunds(id) ON DELETE CASCADE,
  CONSTRAINT fk_ri_sale_item FOREIGN KEY (sale_item_id) REFERENCES sale_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_ri_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bills (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, workspace_id INT UNSIGNED NOT NULL, sale_id INT UNSIGNED NULL,
  bill_number VARCHAR(50) NOT NULL, customer_name VARCHAR(100) NULL, customer_email VARCHAR(254) NULL, customer_phone VARCHAR(20) NULL,
  customer_address TEXT NULL, issue_date DATE NOT NULL, due_date DATE NOT NULL,
  status ENUM('draft','issued','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
  subtotal DECIMAL(14, 2) NOT NULL DEFAULT 0.00, discount_type ENUM('none','percentage','fixed') NOT NULL DEFAULT 'none',
  discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00, discount_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00, tax_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(14, 2) NOT NULL DEFAULT 0.00, amount_paid DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  outstanding DECIMAL(14, 2) NOT NULL DEFAULT 0.00, notes TEXT NULL, last_reminder_sent_at DATETIME NULL,
  created_by INT UNSIGNED NULL, created_at DATETIME NOT NULL DEFAULT NOW(), updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id), UNIQUE KEY uq_bill_number_workspace (bill_number, workspace_id), INDEX idx_bill_workspace (workspace_id),
  INDEX idx_bill_sale (sale_id), INDEX idx_bill_status (status), INDEX idx_bill_due_date (due_date),
  INDEX idx_bill_customer_email (customer_email), INDEX idx_bill_number (bill_number),
  CONSTRAINT fk_bill_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_bill_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL,
  CONSTRAINT fk_bill_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bill_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, bill_id INT UNSIGNED NOT NULL, description VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1, unit_price DECIMAL(12, 2) NOT NULL, subtotal DECIMAL(14, 2) NOT NULL,
  PRIMARY KEY (id), INDEX idx_bi_bill (bill_id),
  CONSTRAINT fk_bi_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  CONSTRAINT chk_bi_quantity CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bill_payments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, bill_id INT UNSIGNED NOT NULL, amount DECIMAL(14, 2) NOT NULL,
  method ENUM('cash','card','bank_transfer','cheque','online') NOT NULL, payment_date DATE NOT NULL,
  reference VARCHAR(255) NULL, notes TEXT NULL, recorded_by INT UNSIGNED NULL, recorded_at DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id), INDEX idx_bp_bill (bill_id), INDEX idx_bp_date (payment_date),
  CONSTRAINT fk_bp_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  CONSTRAINT fk_bp_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_bp_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE credit_notes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, bill_id INT UNSIGNED NOT NULL, reason VARCHAR(255) NOT NULL, amount DECIMAL(14, 2) NOT NULL,
  applied BOOLEAN NOT NULL DEFAULT TRUE, created_by INT UNSIGNED NULL, created_at DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id), INDEX idx_cn_bill (bill_id),
  CONSTRAINT fk_cn_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  CONSTRAINT fk_cn_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, workspace_id INT UNSIGNED NULL, user_id INT UNSIGNED NOT NULL,
  type ENUM('stock_alert','order_update','bill_overdue','bill_paid','payment_received','system','user_invite') NOT NULL,
  title VARCHAR(255) NOT NULL, message TEXT NOT NULL, link VARCHAR(500) NULL, read_at DATETIME NULL, created_at DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id), INDEX idx_notif_user (user_id), INDEX idx_notif_workspace (workspace_id), INDEX idx_notif_type (type),
  INDEX idx_notif_read (read_at), INDEX idx_notif_created (created_at),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notif_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notification_preferences (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, user_id INT UNSIGNED NOT NULL, low_stock_email BOOLEAN NOT NULL DEFAULT TRUE,
  purchase_updates BOOLEAN NOT NULL DEFAULT TRUE, bill_issued BOOLEAN NOT NULL DEFAULT TRUE, bill_overdue BOOLEAN NOT NULL DEFAULT TRUE,
  payment_received BOOLEAN NOT NULL DEFAULT TRUE, system_updates BOOLEAN NOT NULL DEFAULT FALSE,
  digest_frequency ENUM('instant','daily','weekly') NOT NULL DEFAULT 'instant', updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id), UNIQUE KEY uq_np_user (user_id),
  CONSTRAINT fk_np_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, user_id INT UNSIGNED NULL, workspace_id INT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL, entity_type VARCHAR(50) NULL, entity_id INT UNSIGNED NULL, old_values JSON NULL, new_values JSON NULL,
  ip_address VARCHAR(45) NULL, user_agent VARCHAR(500) NULL, created_at DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id), INDEX idx_al_user (user_id), INDEX idx_al_workspace (workspace_id), INDEX idx_al_action (action),
  INDEX idx_al_entity (entity_type, entity_id), INDEX idx_al_created (created_at),
  CONSTRAINT fk_al_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_al_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE email_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, user_id INT UNSIGNED NULL, workspace_id INT UNSIGNED NULL, recipient VARCHAR(254) NOT NULL,
  type VARCHAR(100) NOT NULL, subject VARCHAR(255) NOT NULL, status ENUM('sent','failed','bounced') NOT NULL,
  message_id VARCHAR(255) NULL, error_message TEXT NULL, related_type VARCHAR(50) NULL, related_id INT UNSIGNED NULL, sent_at DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id), INDEX idx_el_user (user_id), INDEX idx_el_recipient (recipient), INDEX idx_el_type (type), INDEX idx_el_status (status), INDEX idx_el_sent (sent_at),
  CONSTRAINT fk_el_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_el_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE system_settings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, workspace_id INT UNSIGNED NULL, company_name VARCHAR(100) NOT NULL DEFAULT 'StockFlow IMS',
  company_logo_url VARCHAR(500) NULL, currency_symbol VARCHAR(5) NOT NULL DEFAULT '$', currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
  default_tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00, low_stock_threshold INT NOT NULL DEFAULT 10,
  date_format VARCHAR(20) NOT NULL DEFAULT 'MM/DD/YYYY', timezone VARCHAR(50) NOT NULL DEFAULT 'UTC', updated_by INT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id), UNIQUE KEY uq_settings_workspace (workspace_id),
  CONSTRAINT fk_ss_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_ss_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sequences (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, workspace_id INT UNSIGNED NOT NULL, type ENUM('po_number','sale_number','bill_number') NOT NULL,
  prefix VARCHAR(10) NOT NULL, last_number INT UNSIGNED NOT NULL DEFAULT 0, updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (id), UNIQUE KEY uq_seq_workspace_type (workspace_id, type),
  CONSTRAINT fk_seq_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
`;

const PROC_1 = `
CREATE FUNCTION get_next_number(p_workspace_id INT UNSIGNED, p_type VARCHAR(20)) RETURNS VARCHAR(50) DETERMINISTIC
BEGIN
  DECLARE v_next INT UNSIGNED DEFAULT 1; DECLARE v_prefix VARCHAR(10) DEFAULT ''; DECLARE v_year VARCHAR(4);
  SET v_year = YEAR(NOW());
  UPDATE sequences SET last_number = last_number + 1, updated_at = NOW() WHERE workspace_id = p_workspace_id AND type = p_type;
  SELECT last_number, prefix INTO v_next, v_prefix FROM sequences WHERE workspace_id = p_workspace_id AND type = p_type;
  RETURN CONCAT(v_prefix, '-', v_year, '-', LPAD(v_next, 5, '0'));
END
`;

const PROC_2 = `
CREATE PROCEDURE receive_purchase_order(IN p_purchase_id INT UNSIGNED, IN p_received_by INT UNSIGNED, IN p_items JSON)
BEGIN
  DECLARE v_workspace_id INT UNSIGNED; DECLARE v_item_count INT DEFAULT 0; DECLARE v_i INT DEFAULT 0;
  DECLARE v_product_id INT UNSIGNED; DECLARE v_qty INT; DECLARE v_qty_before INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
  START TRANSACTION;
  SELECT workspace_id INTO v_workspace_id FROM purchases WHERE id = p_purchase_id;
  SET v_item_count = JSON_LENGTH(p_items);
  WHILE v_i < v_item_count DO
    SET v_product_id = JSON_VALUE(p_items, CONCAT('$[',v_i,'].product_id'));
    SET v_qty = JSON_VALUE(p_items, CONCAT('$[',v_i,'].quantity'));
    SELECT stock_qty INTO v_qty_before FROM products WHERE id = v_product_id;
    UPDATE products SET stock_qty = stock_qty + v_qty, updated_at = NOW() WHERE id = v_product_id;
    INSERT INTO stock_movements (product_id, workspace_id, type, quantity, qty_before, qty_after, reference_type, reference_id, created_by)
      VALUES (v_product_id, v_workspace_id, 'purchase_received', v_qty, v_qty_before, v_qty_before + v_qty, 'purchase', p_purchase_id, p_received_by);
    UPDATE purchase_items SET qty_received = v_qty WHERE purchase_id = p_purchase_id AND product_id = v_product_id;
    SET v_i = v_i + 1;
  END WHILE;
  UPDATE purchases SET status = 'received', received_date = CURDATE(), received_by = p_received_by, updated_at = NOW() WHERE id = p_purchase_id;
  COMMIT;
END
`;

const PROC_3 = `
CREATE PROCEDURE process_sale(IN p_sale_id INT UNSIGNED, IN p_created_by INT UNSIGNED)
BEGIN
  DECLARE v_workspace_id INT UNSIGNED; DECLARE done INT DEFAULT FALSE; DECLARE v_product_id INT UNSIGNED;
  DECLARE v_qty INT; DECLARE v_qty_before INT;
  DECLARE cur CURSOR FOR SELECT product_id, quantity FROM sale_items WHERE sale_id = p_sale_id AND product_id IS NOT NULL;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
  START TRANSACTION;
  SELECT workspace_id INTO v_workspace_id FROM sales WHERE id = p_sale_id;
  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_product_id, v_qty; IF done THEN LEAVE read_loop; END IF;
    SELECT stock_qty INTO v_qty_before FROM products WHERE id = v_product_id;
    IF v_qty_before < v_qty THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock'; END IF;
    UPDATE products SET stock_qty = stock_qty - v_qty, updated_at = NOW() WHERE id = v_product_id;
    INSERT INTO stock_movements (product_id, workspace_id, type, quantity, qty_before, qty_after, reference_type, reference_id, created_by)
      VALUES (v_product_id, v_workspace_id, 'sale', -v_qty, v_qty_before, v_qty_before - v_qty, 'sale', p_sale_id, p_created_by);
  END LOOP;
  CLOSE cur;
  UPDATE sales SET status = 'completed', updated_at = NOW() WHERE id = p_sale_id;
  COMMIT;
END
`;

const PROC_4 = `
CREATE PROCEDURE update_bill_totals(IN p_bill_id INT UNSIGNED)
BEGIN
  DECLARE v_grand_total DECIMAL(14,2); DECLARE v_amount_paid DECIMAL(14,2); DECLARE v_outstanding DECIMAL(14,2);
  DECLARE v_due_date DATE; DECLARE v_new_status VARCHAR(20);
  SELECT grand_total, due_date INTO v_grand_total, v_due_date FROM bills WHERE id = p_bill_id;
  SELECT COALESCE(SUM(amount), 0) INTO v_amount_paid FROM bill_payments WHERE bill_id = p_bill_id;
  SET v_outstanding = v_grand_total - v_amount_paid;
  IF v_outstanding <= 0 THEN SET v_new_status = 'paid';
  ELSEIF v_due_date < CURDATE() THEN SET v_new_status = 'overdue';
  ELSE SET v_new_status = 'issued'; END IF;
  UPDATE bills SET amount_paid = v_amount_paid, outstanding = v_outstanding, status = v_new_status, updated_at = NOW() WHERE id = p_bill_id;
END
`;

const TRIGGERS_VIEWS = `
CREATE TRIGGER trg_after_payment_insert AFTER INSERT ON bill_payments FOR EACH ROW BEGIN CALL update_bill_totals(NEW.bill_id); END;
CREATE TRIGGER trg_after_payment_delete AFTER DELETE ON bill_payments FOR EACH ROW BEGIN CALL update_bill_totals(OLD.bill_id); END;

CREATE TRIGGER trg_workspace_sequences AFTER INSERT ON workspaces FOR EACH ROW
BEGIN
  INSERT INTO sequences (workspace_id, type, prefix, last_number) VALUES
    (NEW.id, 'po_number', 'PO', 0), (NEW.id, 'sale_number', 'S', 0), (NEW.id, 'bill_number', 'BILL', 0);
  INSERT INTO system_settings (workspace_id) VALUES (NEW.id);
END;

CREATE VIEW v_product_stock AS SELECT p.id, p.workspace_id, p.name, p.sku, p.stock_qty, p.stock_threshold, p.status AS product_status,
  CASE WHEN p.stock_qty = 0 THEN 'out_of_stock' WHEN p.stock_qty <= 5 THEN 'critical' WHEN p.stock_qty < p.stock_threshold THEN 'low' ELSE 'healthy' END AS stock_status,
  m.name AS manufacturer_name, c.name AS category_name
FROM products p LEFT JOIN manufacturers m ON m.id = p.manufacturer_id LEFT JOIN categories c ON c.id = p.category_id WHERE p.status = 'active';

CREATE VIEW v_bill_summary AS SELECT b.id, b.workspace_id, b.bill_number, b.customer_name, b.customer_email, b.issue_date, b.due_date,
  b.grand_total, b.amount_paid, b.outstanding, b.status, DATEDIFF(CURDATE(), b.due_date) AS days_overdue, u.name AS created_by_name
FROM bills b LEFT JOIN users u ON u.id = b.created_by;

CREATE VIEW v_sales_summary AS SELECT s.id, s.workspace_id, s.sale_number, s.customer_name, s.sale_date, s.grand_total, s.status,
  COUNT(si.id) AS item_count, u.name AS created_by_name
FROM sales s LEFT JOIN sale_items si ON si.sale_id = s.id LEFT JOIN users u ON u.id = s.created_by GROUP BY s.id;
`;

async function deploy() {
  console.log("Connecting database via root...");
  let conn;
  try {
    conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'deploy',
      password: 'temp_deploy123',
      multipleStatements: true
    });


    console.log("Dropping and recreating database...");
    await conn.query("DROP DATABASE IF EXISTS stockflow_ims;");
    
    // Create DB & Tables
    console.log("Creating tables...");
    await conn.query(TBL_SETUP);
    await conn.query("USE stockflow_ims;");
    
    // Create Procedure 1 by 1 without multiple statements complexity
    console.log("Creating procedures & functions...");
    await conn.query(PROC_1);
    await conn.query(PROC_2);
    await conn.query(PROC_3);
    await conn.query(PROC_4);
    
    console.log("Creating triggers & views...");
    await conn.query(TRIGGERS_VIEWS);
    
    console.log("Configuring stockflow_app user privileges...");
    await conn.query("CREATE USER IF NOT EXISTS 'stockflow_app'@'localhost' IDENTIFIED BY 'secure_dev_password';");
    await conn.query("ALTER USER 'stockflow_app'@'localhost' IDENTIFIED BY 'secure_dev_password';");
    await conn.query("GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON stockflow_ims.* TO 'stockflow_app'@'localhost';");
    await conn.query("FLUSH PRIVILEGES;");

    console.log("Generating first admin hash...");
    // A secure temporary password for the admin
    const password = "StockFlowAdmin2024!";
    const hash = await bcrypt.hash(password, 12);
    
    console.log("Inserting first admin and workspace...");
    const [adminRes] = await conn.query(
      "INSERT INTO users (name, email, password_hash, role, status, email_verified, created_at) VALUES ('System Admin', 'admin@stockflow.com', ?, 'admin', 'active', TRUE, NOW());",
      [hash]
    );
    
    const adminId = adminRes.insertId;
    
    const [wsRes] = await conn.query(
      "INSERT INTO workspaces (name, description, color, created_by) VALUES ('Main Workspace', 'Default workspace', '#818cf8', ?);",
      [adminId]
    );
    
    const wsId = wsRes.insertId;
    
    await conn.query(
      "INSERT INTO workspace_users (workspace_id, user_id, access_level) VALUES (?, ?, 'full');",
      [wsId, adminId]
    );

    console.log("==========================================");
    console.log("DEPLOYMENT COMPLETE.");
    console.log("Admin Email: admin@stockflow.com");
    console.log("Admin Password: " + password);
    console.log("==========================================");
  } catch (err) {
    console.error("DEPLOYMENT FAILED ERROR DUMP:", err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

deploy();
