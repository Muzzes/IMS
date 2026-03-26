import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import ProductForm from './ProductForm';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useAuth } from '../../hooks/useAuth';
import { mockProducts, mockManufacturers } from '../../utils/mockData';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductList() {
  const { activeWorkspace } = useWorkspace();
  const { role } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [manufacturerFilter, setManufacturerFilter] = useState('All');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, product: null });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Mock fetch depending on role and workspace
      let filtered = [...mockProducts];
      if (activeWorkspace) {
        filtered = filtered.filter(p => p.workspace_id === activeWorkspace.id);
      }
      if (role === 'manufacturer') {
        filtered = filtered.filter(p => p.manufacturer_id === 1); // Harcoded mock assumption for mfg id
      }
      setProducts(filtered);
      setLoading(false);
    }, 400);
  }, [activeWorkspace, role]);

  const handleAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product) => {
    setDeleteDialog({ isOpen: true, product });
  };

  const confirmDelete = () => {
    setProducts(products.filter(p => p.id !== deleteDialog.product.id));
    toast.success('Product deleted successfully');
  };

  const handleFormSubmit = (productData) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === productData.id ? productData : p));
    } else {
      setProducts([...products, { ...productData, workspace_id: activeWorkspace?.id || 1 }]);
    }
    setIsFormOpen(false);
  };

  // Apply visual filters
  let displayedProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (categoryFilter !== 'All') displayedProducts = displayedProducts.filter(p => p.category === categoryFilter);
  if (manufacturerFilter !== 'All') displayedProducts = displayedProducts.filter(p => String(p.manufacturer_id) === manufacturerFilter);
  if (stockFilter !== 'All') {
    if (stockFilter === 'In Stock') displayedProducts = displayedProducts.filter(p => p.stockQty > 10);
    if (stockFilter === 'Low') displayedProducts = displayedProducts.filter(p => p.stockQty > 0 && p.stockQty <= 10);
    if (stockFilter === 'Out of Stock') displayedProducts = displayedProducts.filter(p => p.stockQty === 0);
  }

  const columns = [
    { label: 'Name', key: 'name', render: (val, row) => <div className="font-medium text-gray-900 dark:text-white">{val}</div> },
    { label: 'SKU', key: 'sku' },
    { label: 'Category', key: 'category' },
    { label: 'Price', key: 'price', render: (val) => `$${Number(val).toFixed(2)}` },
    { label: 'Stock', key: 'stockQty' },
    { 
      label: 'Manufacturer', 
      key: 'manufacturer_id',
      render: (val) => mockManufacturers.find(m => m.id === val)?.name || 'Unknown'
    },
    { 
      label: 'Status', 
      key: 'status',
      render: (_, row) => {
        const qty = row.stockQty;
        if (qty === 0) return <Badge variant="danger">Out of Stock</Badge>;
        if (qty <= 10) return <Badge variant="warning">Low</Badge>;
        return <Badge variant="success">In Stock</Badge>;
      }
    }
  ];

  const uniqueCategories = ['All', ...new Set(products.map(p => p.category))];
  const uniqueMakers = ['All', ...new Set(products.map(p => mockManufacturers.find(m => m.id === p.manufacturer_id)?.name))].filter(Boolean);

  return (
    <PageWrapper
      title="Products"
      actionButton={
        role !== 'manufacturer' && (
          <button onClick={handleAdd} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm font-medium transition-colors border border-transparent">
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </button>
        )
      }
    >
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Search products or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border border-gray-300 dark:border-gray-700 rounded-md text-sm dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none px-3 py-2 flex-1 md:flex-none">
            {uniqueCategories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="border border-gray-300 dark:border-gray-700 rounded-md text-sm dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none px-3 py-2 flex-1 md:flex-none">
            <option value="All">All Stock Levels</option>
            <option value="In Stock">In Stock (&gt;10)</option>
            <option value="Low">Low (1-10)</option>
            <option value="Out of Stock">Out of Stock (0)</option>
          </select>
          {role !== 'manufacturer' && (
            <select value={manufacturerFilter} onChange={(e) => setManufacturerFilter(e.target.value)} className="border border-gray-300 dark:border-gray-700 rounded-md text-sm dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none px-3 py-2 flex-1 md:flex-none">
              <option value="All">All Manufacturers</option>
              {mockManufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          )}
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={displayedProducts}
        loading={loading}
        onEdit={role !== 'manufacturer' ? handleEdit : null}
        onDelete={role !== 'manufacturer' ? handleDeleteClick : null}
      />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingProduct ? "Edit Product" : "Add Product"} size="lg">
         {isFormOpen && <ProductForm initialData={editingProduct} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />}
      </Modal>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen} 
        onClose={() => setDeleteDialog({ isOpen: false, product: null })}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${deleteDialog.product?.name}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </PageWrapper>
  );
}
