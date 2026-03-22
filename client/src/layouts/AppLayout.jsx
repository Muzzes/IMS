import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWorkspace } from '../context/WorkspaceContext';
import WorkspaceSwitcher from '../components/WorkspaceSwitcher';
import {
  HiOutlineHome, HiOutlineCube, HiOutlineTruck, HiOutlineShoppingCart,
  HiOutlineBanknotes, HiOutlineDocumentText, HiOutlineChartBar,
  HiOutlineBell, HiOutlineCog6Tooth, HiOutlineSun, HiOutlineMoon,
  HiOutlineBars3, HiOutlineXMark, HiOutlineArrowRightOnRectangle,
  HiOutlineBuildingStorefront
} from 'react-icons/hi2';

const navItems = [
  { label: 'Dashboard',     path: '/',             icon: HiOutlineHome,          roles: ['admin', 'staff', 'manufacturer'] },
  { label: 'Products',      path: '/products',     icon: HiOutlineCube,          roles: ['admin', 'staff', 'manufacturer'] },
  { label: 'Suppliers',     path: '/suppliers',    icon: HiOutlineTruck,         roles: ['admin', 'staff'] },
  { label: 'Purchases',     path: '/purchases',    icon: HiOutlineShoppingCart,  roles: ['admin', 'staff'] },
  { label: 'Sales',         path: '/sales',        icon: HiOutlineBanknotes,     roles: ['admin', 'staff'] },
  { label: 'Billing',       path: '/billing',      icon: HiOutlineDocumentText,  roles: ['admin', 'staff'] },
  { label: 'Reports',       path: '/reports',      icon: HiOutlineChartBar,      roles: ['admin', 'staff'] },
  { label: 'Notifications', path: '/notifications', icon: HiOutlineBell,        roles: ['admin', 'staff', 'manufacturer'] },
  { type: 'divider', roles: ['admin'] },
  { label: 'Workspaces',    path: '/settings/workspaces', icon: HiOutlineBuildingStorefront, roles: ['admin'] },
  { label: 'Settings',      path: '/settings',     icon: HiOutlineCog6Tooth,     roles: ['admin'] },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { activeWorkspace } = useWorkspace();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filtered = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col
                         bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800
                         transition-transform duration-300
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <HiOutlineCube className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">IMS Pro</h1>
              <p className="text-[10px] text-surface-400 font-medium tracking-wider uppercase">Inventory System</p>
            </div>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="pt-4">
          <WorkspaceSwitcher />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {filtered.map((item, i) => {
            if (item.type === 'divider') {
              return <div key={i} className="border-t border-surface-100 dark:border-surface-800 my-3" />;
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                   ${isActive
                     ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                     : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200'
                   }`
                }
                id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                            flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-800 dark:text-surface-200 truncate">{user?.name}</p>
              <p className="text-xs text-surface-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6
                          bg-white/80 dark:bg-surface-900/80 backdrop-blur-lg
                          border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800" id="sidebar-toggle">
              {sidebarOpen ? <HiOutlineXMark className="w-5 h-5" /> : <HiOutlineBars3 className="w-5 h-5" />}
            </button>
            {activeWorkspace && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-50 dark:bg-surface-800">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeWorkspace.color }} />
                <span className="text-sm font-medium text-surface-600 dark:text-surface-400">{activeWorkspace.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme}
                    className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition" id="theme-toggle">
              {isDark ? <HiOutlineSun className="w-5 h-5 text-amber-500" /> : <HiOutlineMoon className="w-5 h-5 text-surface-500" />}
            </button>
            <button onClick={handleLogout}
                    className="p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-surface-500 hover:text-rose-600 transition" id="logout-btn">
              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
