import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WorkspaceProvider } from './context/WorkspaceContext';

// Layout & Core
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Products from './pages/products/Products';
import Suppliers from './pages/suppliers/Suppliers';
import Purchases from './pages/purchases/Purchases';
import Sales from './pages/sales/Sales';
import Billing from './pages/billing/Billing';
import Notifications from './pages/notifications/Notifications';
import Reports from './pages/reports/Reports';
import WorkspaceList from './pages/settings/workspaces/WorkspaceList';
import WorkspaceDetail from './pages/settings/workspaces/WorkspaceDetail';
import UsersList from './pages/settings/users/UsersList';
import RawMaterials from './pages/materials/RawMaterials';
import InventoryList from './pages/inventory/InventoryList';
import SystemSettings from './pages/settings/SystemSettings';

// Error Pages
import ForbiddenPage from './pages/errors/ForbiddenPage';
import NotFoundPage from './pages/errors/NotFoundPage';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <Router>
            <Toaster position="top-right" toastOptions={{
              style: {
                background: 'var(--bg-overlay)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                fontSize: '13px'
              },
              success: { iconTheme: { primary: 'var(--success-text)', secondary: 'var(--bg-overlay)' } },
              error: { iconTheme: { primary: 'var(--danger-text)', secondary: 'var(--bg-overlay)' } }
            }} />
            
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/403" element={<ForbiddenPage />} />
              <Route path="/404" element={<NotFoundPage />} />

              {/* Protected App */}
              <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                
                {/* Everyone but scopes apply */}
                <Route path="products" element={<Products />} />
                <Route path="inventory" element={<InventoryList />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="raw-materials" element={<RawMaterials />} />

                {/* Staff + Admin only */}
                <Route path="suppliers" element={<ProtectedRoute roles={['admin', 'staff']}><Suppliers /></ProtectedRoute>} />
                <Route path="purchases" element={<ProtectedRoute roles={['admin', 'staff']}><Purchases /></ProtectedRoute>} />
                <Route path="sales" element={<ProtectedRoute roles={['admin', 'staff']}><Sales /></ProtectedRoute>} />
                <Route path="billing" element={<ProtectedRoute roles={['admin', 'staff']}><Billing /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute roles={['admin', 'staff']}><Reports /></ProtectedRoute>} />

                {/* Admin only Settings */}
                <Route path="settings" element={<ProtectedRoute roles={['admin']}><Navigate to="workspaces" replace /></ProtectedRoute>} />
                <Route path="settings/workspaces" element={<ProtectedRoute roles={['admin']}><WorkspaceList /></ProtectedRoute>} />
                <Route path="settings/workspaces/:id" element={<ProtectedRoute roles={['admin']}><WorkspaceDetail /></ProtectedRoute>} />
                <Route path="settings/users" element={<ProtectedRoute roles={['admin']}><UsersList /></ProtectedRoute>} />
                <Route path="settings/system" element={<ProtectedRoute roles={['admin']}><SystemSettings /></ProtectedRoute>} />
              </Route>

              {/* Catch all unmatched routes → 404 */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Router>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
