export const mockWorkspaces = [
  { id: 1, name: 'Candle Co.', color: '#f59e0b', description: 'Candle manufacturing', productCount: 10, userCount: 3 },
  { id: 2, name: 'PC World',   color: '#3b82f6', description: 'PC components & accessories', productCount: 10, userCount: 2 }
];

export const mockWorkspaceUsers = [
  { workspace_id: 1, user_id: 2, access_level: 'full' },
  { workspace_id: 1, user_id: 3, access_level: 'read_only' },
  { workspace_id: 2, user_id: 2, access_level: 'full' },
];

export const mockProducts = [
  { id: 1, workspace_id: 1, name: 'Soy Wax 5kg', category: 'Materials', sku: 'WAX-SY-05', price: 25.0, stockQty: 120, status: 'In Stock', manufacturer_id: 1, description: 'Premium soy wax' },
  { id: 2, workspace_id: 1, name: 'Wicks 100pk', category: 'Materials', sku: 'WCK-100', price: 5.0, stockQty: 300, status: 'In Stock', manufacturer_id: 1, description: 'Cotton wicks' },
  { id: 3, workspace_id: 1, name: 'Fragrance Oils', category: 'Materials', sku: 'OIL-FR-01', price: 15.0, stockQty: 45, status: 'In Stock', manufacturer_id: 2, description: 'Vanilla scent' },
  { id: 4, workspace_id: 1, name: 'Glass Jars M', category: 'Packaging', sku: 'JAR-GL-M', price: 1.5, stockQty: 500, status: 'In Stock', manufacturer_id: 3, description: 'Amber glass jars' },
  { id: 5, workspace_id: 1, name: 'Labels Rolled', category: 'Packaging', sku: 'LBL-RL-01', price: 0.2, stockQty: 5, status: 'Low', manufacturer_id: 1, description: 'Custom labels' },
  { id: 6, workspace_id: 1, name: 'Dye Chips', category: 'Materials', sku: 'DYE-CH-01', price: 8.0, stockQty: 60, status: 'In Stock', manufacturer_id: 1, description: 'Color blocks' },
  { id: 7, workspace_id: 1, name: 'Packaging Boxes', category: 'Packaging', sku: 'PKG-BX-M', price: 0.5, stockQty: 0, status: 'Out of Stock', manufacturer_id: 3, description: 'Shipping boxes' },
  { id: 8, workspace_id: 1, name: 'Essential Oil - Lavender', category: 'Materials', sku: 'OIL-LAV-01', price: 18.0, stockQty: 2, status: 'Low', manufacturer_id: 2, description: 'Pure lavender' },
  { id: 9, workspace_id: 1, name: 'Cotton Bags', category: 'Packaging', sku: 'PKG-BG-01', price: 1.0, stockQty: 200, status: 'In Stock', manufacturer_id: 1, description: 'Drawstring bags' },
  { id: 10, workspace_id: 1, name: 'Lids Metal', category: 'Packaging', sku: 'LID-MT-01', price: 0.3, stockQty: 480, status: 'In Stock', manufacturer_id: 3, description: 'Gold metal lids' },

  { id: 11, workspace_id: 2, name: 'CPU Intel i9', category: 'Electronics', sku: 'CPU-INT-09', price: 550.0, stockQty: 42, status: 'In Stock', manufacturer_id: 4, description: '13th Gen' },
  { id: 12, workspace_id: 2, name: 'GPU RTX 4080', category: 'Electronics', sku: 'GPU-NV-4080', price: 1200.0, stockQty: 15, status: 'In Stock', manufacturer_id: 5, description: '16GB VRAM' },
  { id: 13, workspace_id: 2, name: 'RAM 32GB', category: 'Electronics', sku: 'RAM-COR-32', price: 150.0, stockQty: 80, status: 'In Stock', manufacturer_id: 6, description: 'DDR5 6000MHz' },
  { id: 14, workspace_id: 2, name: 'SSD 2TB', category: 'Electronics', sku: 'SSD-SAM-2T', price: 180.0, stockQty: 110, status: 'In Stock', manufacturer_id: 7, description: 'NVMe Gen4' },
  { id: 15, workspace_id: 2, name: 'Motherboard Z790', category: 'Electronics', sku: 'MB-ASU-790', price: 280.0, stockQty: 30, status: 'In Stock', manufacturer_id: 8, description: 'LGA 1700' },
  { id: 16, workspace_id: 2, name: 'PSU 850W', category: 'Electronics', sku: 'PSU-COR-850', price: 130.0, stockQty: 45, status: 'In Stock', manufacturer_id: 6, description: '80+ Gold' },
  { id: 17, workspace_id: 2, name: 'Case ATX', category: 'Electronics', sku: 'CAS-NZX-01', price: 100.0, stockQty: 25, status: 'In Stock', manufacturer_id: 9, description: 'Mid Tower' },
  { id: 18, workspace_id: 2, name: 'Cooling Fan', category: 'Electronics', sku: 'FAN-NOC-12', price: 30.0, stockQty: 150, status: 'In Stock', manufacturer_id: 10, description: '120mm PWM' },
  { id: 19, workspace_id: 2, name: 'Monitor 4K', category: 'Electronics', sku: 'MON-DELL-4K', price: 400.0, stockQty: 20, status: 'In Stock', manufacturer_id: 11, description: '27 inch IPS' },
  { id: 20, workspace_id: 2, name: 'Mechanical Switch Red', category: 'Electronics', sku: 'SW-RD-100', price: 45.0, stockQty: 15, status: 'Low', manufacturer_id: 12, description: 'Cherry MX Red 100pk' }
];

export const mockManufacturers = [
  { id: 1, name: 'Candle Supplies Inc.', workspace_id: 1 },
  { id: 2, name: 'Aroma Extractors', workspace_id: 1 },
  { id: 3, name: 'Glassworks Factory', workspace_id: 1 },
  { id: 4, name: 'Intel', workspace_id: 2 },
  { id: 5, name: 'Nvidia', workspace_id: 2 },
  { id: 6, name: 'Corsair', workspace_id: 2 },
  { id: 7, name: 'Samsung', workspace_id: 2 },
  { id: 8, name: 'Asus', workspace_id: 2 },
  { id: 9, name: 'NZXT', workspace_id: 2 },
  { id: 10, name: 'Noctua', workspace_id: 2 },
  { id: 11, name: 'Dell', workspace_id: 2 },
  { id: 12, name: 'Cherry', workspace_id: 2 }
];
