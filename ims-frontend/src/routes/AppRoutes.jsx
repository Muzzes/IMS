import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import RoleGuard from '../components/layout/RoleGuard';
import AppLayout from '../components/layout/AppLayout';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import StaffDashboard from '../pages/dashboard/StaffDashboard';
import ManufacturerDashboard from '../pages/dashboard/ManufacturerDashboard';
import ProductList from '../pages/products/ProductList';
import InventoryList from '../pages/inventory/InventoryList';
import StockAlerts from '../pages/inventory/StockAlerts';
import PurchaseList from '../pages/purchases/PurchaseList';
import PurchaseDetail from '../pages/purchases/PurchaseDetail';
import SalesList from '../pages/sales/SalesList';
import SaleDetail from '../pages/sales/SaleDetail';
import BillingList from '../pages/billing/BillingList';
import PartnerList from '../pages/partners/PartnerList';
import ReportDashboard from '../pages/reports/ReportDashboard';
import ProfileView from '../pages/settings/ProfileView';
import SystemSettings from '../pages/settings/SystemSettings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard/admin" element={<RoleGuard allowed={['admin']}><AdminDashboard /></RoleGuard>} />
          <Route path="/dashboard/staff" element={<RoleGuard allowed={['staff']}><StaffDashboard /></RoleGuard>} />
          <Route path="/dashboard/manufacturer" element={<RoleGuard allowed={['manufacturer']}><ManufacturerDashboard /></RoleGuard>} />
          
          {/* Products */}
          <Route path="/products" element={<RoleGuard allowed={['admin', 'staff']}><ProductList /></RoleGuard>} />
          <Route path="/products/me" element={<RoleGuard allowed={['manufacturer']}><ProductList /></RoleGuard>} />
          
          {/* Inventory */}
          <Route path="/inventory" element={<RoleGuard allowed={['admin', 'staff']}><InventoryList /></RoleGuard>} />
          <Route path="/inventory/alerts" element={<RoleGuard allowed={['admin', 'staff']}><StockAlerts /></RoleGuard>} />

          {/* Purchases */}
          <Route path="/purchases" element={<RoleGuard allowed={['admin', 'staff']}><PurchaseList /></RoleGuard>} />
          <Route path="/purchases/me" element={<RoleGuard allowed={['manufacturer']}><PurchaseList /></RoleGuard>} />
          <Route path="/purchases/:id" element={<RoleGuard allowed={['admin', 'staff', 'manufacturer']}><PurchaseDetail /></RoleGuard>} />
          
          {/* Settings */}
          <Route path="/profile" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
          <Route path="/settings" element={<RoleGuard allowed={['admin']}><SystemSettings /></RoleGuard>} />

          {/* Reports */}
          <Route path="/reports" element={<RoleGuard allowed={['admin', 'staff']}><ReportDashboard /></RoleGuard>} />
          
          {/* Partners */}
          <Route path="/partners" element={<RoleGuard allowed={['admin', 'staff']}><PartnerList /></RoleGuard>} />
          
          {/* Billing */}
          <Route path="/billing" element={<RoleGuard allowed={['admin', 'staff']}><BillingList /></RoleGuard>} />

          {/* Sales */}
          <Route path="/sales" element={<RoleGuard allowed={['admin', 'staff']}><SalesList /></RoleGuard>} />
          <Route path="/sales/:id" element={<RoleGuard allowed={['admin', 'staff']}><SaleDetail /></RoleGuard>} />
          
          <Route path="/403" element={<div className="flex justify-center items-center h-full text-red-500 text-2xl">403 Forbidden - Insufficient Role</div>} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard/admin" replace />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
