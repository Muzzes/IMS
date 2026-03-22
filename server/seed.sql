-- ============================================================
-- IMS Seed Data — Demo Workspaces, Users & Sample Data
-- ============================================================
USE ims_db;

-- ──────────────────────────────────────
-- Users (passwords are bcrypt hash of 'password123')
-- ──────────────────────────────────────
INSERT INTO users (name, email, password, role) VALUES
('Admin User',    'admin@ims.com',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Priya Sharma',  'priya@ims.com',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff'),
('Tom Wilson',    'tom@ims.com',          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff'),
('Jane Maker',    'jane@ims.com',         '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manufacturer');

-- ──────────────────────────────────────
-- Workspaces
-- ──────────────────────────────────────
INSERT INTO workspaces (name, description, logo_url, color) VALUES
('Candle Co.',  'Premium handmade candles and accessories', NULL, '#f59e0b'),
('PC World',    'Computer hardware and peripherals',       NULL, '#3b82f6');

-- ──────────────────────────────────────
-- Workspace user assignments
-- Admin (id=1) gets global access (no assignment needed — admin bypass)
-- Priya (id=2) → Candle Co. only
-- Tom (id=3) → Both workspaces
-- Jane (id=4) → Candle Co. (manufacturer)
-- ──────────────────────────────────────
INSERT INTO workspace_users (workspace_id, user_id, access_level, assigned_by) VALUES
(1, 2, 'full',      1),
(1, 3, 'full',      1),
(2, 3, 'full',      1),
(1, 4, 'full',      1);

-- ──────────────────────────────────────
-- Suppliers
-- ──────────────────────────────────────
INSERT INTO suppliers (workspace_id, name, email, phone, address) VALUES
(1, 'Wax Supplies Inc.',     'contact@waxsupplies.com',  '555-0101', '123 Wax St, Candle City'),
(1, 'Fragrance World',       'info@fragranceworld.com',  '555-0102', '456 Scent Ave, Aromaton'),
(2, 'TechParts Global',      'sales@techparts.com',      '555-0201', '789 Silicon Blvd, Techville'),
(2, 'Display Solutions Ltd.', 'orders@displaysol.com',    '555-0202', '321 Screen Rd, Pixeltown');

-- ──────────────────────────────────────
-- Products
-- ──────────────────────────────────────
INSERT INTO products (workspace_id, name, sku, description, category, unit_price, cost_price, stock_quantity, min_stock_level, supplier_id, manufacturer_id) VALUES
-- Candle Co. products
(1, 'Lavender Bliss Candle',    'CAN-001', 'Soothing lavender scented soy candle',     'Scented Candles', 24.99, 8.50,  150, 20, 1, 4),
(1, 'Vanilla Dream Candle',     'CAN-002', 'Rich vanilla bean scented candle',          'Scented Candles', 22.99, 7.80,  200, 25, 1, 4),
(1, 'Ocean Breeze Candle',      'CAN-003', 'Fresh sea salt and driftwood scent',        'Scented Candles', 26.99, 9.20,  100, 15, 2, 4),
(1, 'Candle Wick Set (50pc)',   'ACC-001', 'Premium cotton wicks for candle making',    'Accessories',     12.99, 4.50,  500, 50, 1, NULL),
(1, 'Soy Wax Flakes (5kg)',     'RAW-001', 'Natural soy wax for candle production',     'Raw Materials',   34.99, 18.00, 80,  10, 1, NULL),
-- PC World products
(2, 'Gaming Mouse RGB',         'PC-001',  'High-DPI RGB gaming mouse',                'Peripherals',     49.99, 22.00, 300, 30, 3, NULL),
(2, '27" 4K Monitor',           'PC-002',  'Ultra-sharp 4K IPS display',               'Monitors',       399.99, 250.00, 45,  5, 4, NULL),
(2, 'Mechanical Keyboard',      'PC-003',  'Cherry MX switches, backlit',              'Peripherals',     89.99, 45.00, 120, 15, 3, NULL),
(2, '1TB NVMe SSD',             'PC-004',  'High-speed NVMe M.2 solid state drive',    'Storage',        109.99, 65.00,  90, 10, 3, NULL),
(2, 'USB-C Hub 7-in-1',         'PC-005',  'Multi-port USB-C adapter',                 'Accessories',     39.99, 15.00, 200, 25, 3, NULL);

-- ──────────────────────────────────────
-- Purchases
-- ──────────────────────────────────────
INSERT INTO purchases (workspace_id, purchase_number, supplier_id, total_amount, status, order_date, received_date, created_by) VALUES
(1, 'PO-CAN-001', 1, 1250.00, 'received', '2026-03-01', '2026-03-05',  1),
(1, 'PO-CAN-002', 2, 460.00,  'ordered',  '2026-03-15', NULL,          2),
(2, 'PO-PC-001',  3, 5500.00, 'received', '2026-03-02', '2026-03-08',  1),
(2, 'PO-PC-002',  4, 12500.00,'ordered',  '2026-03-18', NULL,          3);

INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost, total_cost) VALUES
(1, 1, 100, 8.50,  850.00),
(1, 2, 50,  7.80,  390.00),
(2, 3, 50,  9.20,  460.00),
(3, 6, 100, 22.00, 2200.00),
(3, 8, 50,  45.00, 2250.00),
(4, 7, 50, 250.00, 12500.00);

-- ──────────────────────────────────────
-- Sales
-- ──────────────────────────────────────
INSERT INTO sales (workspace_id, sale_number, customer_name, customer_email, total_amount, discount, tax, net_amount, status, created_by) VALUES
(1, 'INV-CAN-001', 'Alice Johnson',   'alice@email.com',  74.97, 0,    9.75, 84.72,  'completed', 2),
(1, 'INV-CAN-002', 'Bob Smith',       'bob@email.com',    47.98, 5.00, 5.59, 48.57,  'completed', 2),
(2, 'INV-PC-001',  'Charlie Brown',   'charlie@email.com', 539.97, 0,   70.20, 610.17, 'completed', 3),
(2, 'INV-PC-002',  'Diana Prince',    'diana@email.com',  149.98, 10.00, 18.20, 158.18, 'pending', 3);

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 2, 24.99, 49.98),
(1, 2, 1, 22.99, 22.99),
(2, 3, 1, 26.99, 26.99),
(2, 4, 1, 12.99, 12.99),
(3, 6, 1, 49.99, 49.99),
(3, 7, 1, 399.99, 399.99),
(3, 8, 1, 89.99, 89.99),
(4, 9, 1, 109.99, 109.99),
(4, 10, 1, 39.99, 39.99);

-- ──────────────────────────────────────
-- Bills
-- ──────────────────────────────────────
INSERT INTO bills (workspace_id, bill_number, purchase_id, supplier_id, total_amount, paid_amount, status, due_date, created_by) VALUES
(1, 'BILL-CAN-001', 1, 1, 1250.00, 1250.00, 'paid',    '2026-03-20', 1),
(1, 'BILL-CAN-002', 2, 2, 460.00,  0,       'pending',  '2026-04-15', 1),
(2, 'BILL-PC-001',  3, 3, 5500.00, 3000.00, 'partially_paid', '2026-03-25', 1),
(2, 'BILL-PC-002',  4, 4, 12500.00, 0,      'pending',  '2026-04-20', 1);

INSERT INTO bill_payments (bill_id, amount, payment_method, reference, payment_date) VALUES
(1, 1250.00, 'bank_transfer', 'TXN-001', '2026-03-18'),
(3, 3000.00, 'bank_transfer', 'TXN-002', '2026-03-15');

-- ──────────────────────────────────────
-- Notifications
-- ──────────────────────────────────────
INSERT INTO notifications (workspace_id, user_id, title, message, type, is_read) VALUES
(1, 2, 'Low Stock Alert',     'Soy Wax Flakes stock is below minimum level', 'warning', 0),
(1, 2, 'Purchase Received',   'PO-CAN-001 has been marked as received',      'success', 1),
(2, 3, 'New Purchase Order',  'PO-PC-002 has been created',                   'info',    0),
(2, 3, 'Bill Due Soon',       'BILL-PC-001 is due on March 25',              'warning', 0);
