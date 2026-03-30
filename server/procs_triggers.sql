-- Stored Procedures and Triggers for StockFlow IMS
USE stockflow_ims;

DELIMITER $$

DROP FUNCTION IF EXISTS get_next_number$$
CREATE FUNCTION get_next_number(p_workspace_id INT UNSIGNED, p_type VARCHAR(20))
RETURNS VARCHAR(50) DETERMINISTIC
BEGIN
  DECLARE v_next INT UNSIGNED DEFAULT 1;
  DECLARE v_prefix VARCHAR(10) DEFAULT '';
  DECLARE v_year VARCHAR(4);
  SET v_year = YEAR(NOW());
  UPDATE sequences SET last_number = last_number + 1, updated_at = NOW()
    WHERE workspace_id = p_workspace_id AND type = p_type;
  SELECT last_number, prefix INTO v_next, v_prefix
    FROM sequences WHERE workspace_id = p_workspace_id AND type = p_type;
  RETURN CONCAT(v_prefix, '-', v_year, '-', LPAD(v_next, 5, '0'));
END$$

DROP PROCEDURE IF EXISTS receive_purchase_order$$
CREATE PROCEDURE receive_purchase_order(
  IN p_purchase_id INT UNSIGNED,
  IN p_received_by INT UNSIGNED,
  IN p_items JSON
)
BEGIN
  DECLARE v_workspace_id INT UNSIGNED;
  DECLARE v_item_count INT DEFAULT 0;
  DECLARE v_i INT DEFAULT 0;
  DECLARE v_product_id INT UNSIGNED;
  DECLARE v_qty INT;
  DECLARE v_qty_before INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
  START TRANSACTION;
  SELECT workspace_id INTO v_workspace_id FROM purchases WHERE id = p_purchase_id;
  SET v_item_count = JSON_LENGTH(p_items);
  WHILE v_i < v_item_count DO
    SET v_product_id = JSON_VALUE(p_items, CONCAT('$[', v_i, '].product_id'));
    SET v_qty = JSON_VALUE(p_items, CONCAT('$[', v_i, '].quantity'));
    SELECT stock_qty INTO v_qty_before FROM products WHERE id = v_product_id;
    UPDATE products SET stock_qty = stock_qty + v_qty, updated_at = NOW() WHERE id = v_product_id;
    INSERT INTO stock_movements (product_id, workspace_id, type, quantity, qty_before, qty_after, reference_type, reference_id, created_by)
      VALUES (v_product_id, v_workspace_id, 'purchase_received', v_qty, v_qty_before, v_qty_before + v_qty, 'purchase', p_purchase_id, p_received_by);
    UPDATE purchase_items SET qty_received = v_qty WHERE purchase_id = p_purchase_id AND product_id = v_product_id;
    SET v_i = v_i + 1;
  END WHILE;
  UPDATE purchases SET status = 'received', received_date = CURDATE(), received_by = p_received_by, updated_at = NOW()
    WHERE id = p_purchase_id;
  COMMIT;
END$$

DROP PROCEDURE IF EXISTS process_sale$$
CREATE PROCEDURE process_sale(IN p_sale_id INT UNSIGNED, IN p_created_by INT UNSIGNED)
BEGIN
  DECLARE v_workspace_id INT UNSIGNED;
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_product_id INT UNSIGNED;
  DECLARE v_qty INT;
  DECLARE v_qty_before INT;
  DECLARE cur CURSOR FOR
    SELECT product_id, quantity FROM sale_items WHERE sale_id = p_sale_id AND product_id IS NOT NULL;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
  START TRANSACTION;
  SELECT workspace_id INTO v_workspace_id FROM sales WHERE id = p_sale_id;
  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_product_id, v_qty;
    IF done THEN LEAVE read_loop; END IF;
    SELECT stock_qty INTO v_qty_before FROM products WHERE id = v_product_id;
    IF v_qty_before < v_qty THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock';
    END IF;
    UPDATE products SET stock_qty = stock_qty - v_qty, updated_at = NOW() WHERE id = v_product_id;
    INSERT INTO stock_movements (product_id, workspace_id, type, quantity, qty_before, qty_after, reference_type, reference_id, created_by)
      VALUES (v_product_id, v_workspace_id, 'sale', -v_qty, v_qty_before, v_qty_before - v_qty, 'sale', p_sale_id, p_created_by);
  END LOOP;
  CLOSE cur;
  UPDATE sales SET status = 'completed', updated_at = NOW() WHERE id = p_sale_id;
  COMMIT;
END$$

DROP PROCEDURE IF EXISTS update_bill_totals$$
CREATE PROCEDURE update_bill_totals(IN p_bill_id INT UNSIGNED)
BEGIN
  DECLARE v_grand_total DECIMAL(14,2);
  DECLARE v_amount_paid DECIMAL(14,2);
  DECLARE v_outstanding DECIMAL(14,2);
  DECLARE v_due_date DATE;
  DECLARE v_new_status VARCHAR(20);
  SELECT grand_total, due_date INTO v_grand_total, v_due_date FROM bills WHERE id = p_bill_id;
  SELECT COALESCE(SUM(amount), 0) INTO v_amount_paid FROM bill_payments WHERE bill_id = p_bill_id;
  SET v_outstanding = v_grand_total - v_amount_paid;
  IF v_outstanding <= 0 THEN
    SET v_new_status = 'paid';
  ELSEIF v_due_date < CURDATE() THEN
    SET v_new_status = 'overdue';
  ELSE
    SET v_new_status = 'issued';
  END IF;
  UPDATE bills SET amount_paid = v_amount_paid, outstanding = v_outstanding, status = v_new_status, updated_at = NOW()
    WHERE id = p_bill_id;
END$$

DROP TRIGGER IF EXISTS trg_after_payment_insert$$
CREATE TRIGGER trg_after_payment_insert AFTER INSERT ON bill_payments FOR EACH ROW
BEGIN
  CALL update_bill_totals(NEW.bill_id);
END$$

DROP TRIGGER IF EXISTS trg_after_payment_delete$$
CREATE TRIGGER trg_after_payment_delete AFTER DELETE ON bill_payments FOR EACH ROW
BEGIN
  CALL update_bill_totals(OLD.bill_id);
END$$

DROP TRIGGER IF EXISTS trg_workspace_sequences$$
CREATE TRIGGER trg_workspace_sequences AFTER INSERT ON workspaces FOR EACH ROW
BEGIN
  INSERT INTO sequences (workspace_id, type, prefix, last_number) VALUES
    (NEW.id, 'po_number', 'PO', 0),
    (NEW.id, 'sale_number', 'S', 0),
    (NEW.id, 'bill_number', 'BILL', 0);
  INSERT INTO system_settings (workspace_id) VALUES (NEW.id);
END$$

DELIMITER ;

-- Views
DROP VIEW IF EXISTS v_product_stock;
CREATE VIEW v_product_stock AS
SELECT
  p.id, p.workspace_id, p.name, p.sku, p.stock_qty, p.stock_threshold, p.status AS product_status,
  CASE
    WHEN p.stock_qty = 0 THEN 'out_of_stock'
    WHEN p.stock_qty <= 5 THEN 'critical'
    WHEN p.stock_qty < p.stock_threshold THEN 'low'
    ELSE 'healthy'
  END AS stock_status,
  m.name AS manufacturer_name,
  c.name AS category_name
FROM products p
LEFT JOIN manufacturers m ON m.id = p.manufacturer_id
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.status = 'active';

DROP VIEW IF EXISTS v_bill_summary;
CREATE VIEW v_bill_summary AS
SELECT
  b.id, b.workspace_id, b.bill_number, b.customer_name, b.customer_email,
  b.issue_date, b.due_date, b.grand_total, b.amount_paid, b.outstanding, b.status,
  DATEDIFF(CURDATE(), b.due_date) AS days_overdue,
  u.name AS created_by_name
FROM bills b LEFT JOIN users u ON u.id = b.created_by;

DROP VIEW IF EXISTS v_sales_summary;
CREATE VIEW v_sales_summary AS
SELECT
  s.id, s.workspace_id, s.sale_number, s.customer_name, s.sale_date, s.grand_total, s.status,
  COUNT(si.id) AS item_count,
  u.name AS created_by_name
FROM sales s
LEFT JOIN sale_items si ON si.sale_id = s.id
LEFT JOIN users u ON u.id = s.created_by
GROUP BY s.id;
