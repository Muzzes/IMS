import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { 
  Boxes, LayoutDashboard, Package, Archive, ShoppingCart, 
  CreditCard, FileText, Users, Factory, Bell, Settings, Briefcase 
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'staff', 'manufacturer'] },
  { label: 'Products', path: '/products', icon: Package, roles: ['admin', 'staff'] },
  { label: 'My Products', path: '/products/me', icon: Package, roles: ['manufacturer'] },
  { label: 'Inventory', path: '/inventory', icon: Archive, roles: ['admin', 'staff'] },
  { label: 'Purchases', path: '/purchases', icon: ShoppingCart, roles: ['admin', 'staff'] },
  { label: 'Purchase Orders', path: '/purchases/me', icon: ShoppingCart, roles: ['manufacturer'] },
  { label: 'Sales', path: '/sales', icon: FileText, roles: ['admin', 'staff'] },
  { label: 'Billing', path: '/billing', icon: CreditCard, roles: ['admin', 'staff'] },
  { label: 'Suppliers', path: '/suppliers', icon: Users, roles: ['admin'] },
  { label: 'Manufacturers', path: '/manufacturers', icon: Factory, roles: ['admin'] },
  { label: 'Reports', path: '/reports', icon: FileText, roles: ['admin'] },
  { label: 'Notifications', path: '/notifications', icon: Bell, roles: ['admin', 'staff', 'manufacturer'] },
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['admin'] },
  { label: 'Workspaces', path: '/workspaces', icon: Briefcase, roles: ['admin'] },
];

export default function Sidebar() {
  const { role, user } = useAuth();
  const filteredNav = navItems.filter(item => item.roles.includes(role));

  const getPath = (item) => {
    if (item.path === '/dashboard') return `/dashboard/${role}`;
    return item.path;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col bg-sidebar text-gray-300 transition-all duration-300 max-lg:w-16">
      <div className="flex h-12 shrink-0 items-center px-4 max-lg:justify-center border-b border-gray-800">
        <Boxes className="h-6 w-6 text-primary" />
        <span className="ml-3 text-lg font-bold text-white max-lg:hidden">StockFlow</span>
      </div>

      <div className="px-4 py-3 max-lg:hidden">
        <WorkspaceSwitcher />
      </div>

      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-2">
        {filteredNav.map((item) => (
           <NavLink
             key={item.label}
             to={getPath(item)}
             className={({ isActive }) =>
               `group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                 isActive
                   ? 'bg-gray-800 text-white border-l-4 border-primary'
                   : 'text-gray-400 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
               }`
             }
             title={item.label}
           >
             <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
             <span className="max-lg:hidden">{item.label}</span>
           </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-gray-800 p-4">
        <div className="flex items-center">
          <div className="flex bg-gray-700 h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className="ml-3 max-lg:hidden overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name || user?.email || 'User'}</p>
            <p className="text-xs text-gray-400 capitalize truncate">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
