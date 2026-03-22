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

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <Router>
            <Toaster position="top-right" toastOptions={{
              className: 'dark:bg-surface-800 dark:text-white border dark:border-surface-700 shadow-xl rounded-xl text-sm font-medium',
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
            }} />
            
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* Protected App */}
              <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                
                {/* Everyone but scopes apply */}
                <Route path="products" element={<Products />} />
                <Route path="notifications" element={<Notifications />} />

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

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
