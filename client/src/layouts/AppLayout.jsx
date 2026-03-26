import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWorkspace } from '../context/WorkspaceContext';
import WorkspaceSwitcher from '../components/WorkspaceSwitcher';
import {
  HiOutlineHome, HiOutlineCube, HiOutlineTruck, HiOutlineShoppingCart,
  HiOutlineBanknotes, HiOutlineDocumentText, HiOutlineChartBar,
  HiOutlineBell, HiOutlineCog6Tooth, HiOutlineSun, HiOutlineMoon,
  HiOutlineBars3, HiOutlineXMark, HiOutlineArrowRightOnRectangle,
  HiOutlineBuildingStorefront, HiOutlineBeaker, HiOutlineUsers,
  HiOutlineArchiveBox, HiOutlineWrenchScrewdriver
} from 'react-icons/hi2';

const navItems = [
  { label: 'Dashboard',     path: '/',             icon: HiOutlineHome,          roles: ['admin', 'staff', 'manufacturer'] },
  { label: 'Products',      path: '/products',     icon: HiOutlineCube,          roles: ['admin', 'staff', 'manufacturer'] },
  { label: 'Inventory',     path: '/inventory',    icon: HiOutlineArchiveBox,    roles: ['admin', 'staff'] },
  { label: 'Suppliers',     path: '/suppliers',    icon: HiOutlineTruck,         roles: ['admin', 'staff'] },
  { label: 'Purchases',     path: '/purchases',    icon: HiOutlineShoppingCart,  roles: ['admin', 'staff'] },
  { label: 'Sales',         path: '/sales',        icon: HiOutlineBanknotes,     roles: ['admin', 'staff'] },
  { label: 'Billing',       path: '/billing',      icon: HiOutlineDocumentText,  roles: ['admin', 'staff'] },
  { label: 'Reports',       path: '/reports',      icon: HiOutlineChartBar,      roles: ['admin', 'staff'] },
  { label: 'Notifications', path: '/notifications', icon: HiOutlineBell,        roles: ['admin', 'staff', 'manufacturer'] },
  { type: 'divider', roles: ['admin'] },
  { label: 'Workspaces',    path: '/settings/workspaces', icon: HiOutlineBuildingStorefront, roles: ['admin'] },
  { label: 'Users',         path: '/settings/users',      icon: HiOutlineUsers,              roles: ['admin'] },
  { label: 'Settings',      path: '/settings/system',     icon: HiOutlineWrenchScrewdriver,  roles: ['admin'] },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { activeWorkspace } = useWorkspace();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    logout();
    // logout() already calls window.location.replace('/login')
  };

  const filtered = navItems.filter(item => item.roles.includes(user?.role));
  
  if (activeWorkspace?.name === 'Candle Co.') {
    const rmLink = { label: 'Raw Materials', path: '/raw-materials', icon: HiOutlineBeaker, roles: ['admin', 'staff', 'manufacturer'] };
    const notifIdx = filtered.findIndex(i => i.path === '/notifications');
    if (notifIdx !== -1) filtered.splice(notifIdx, 0, rmLink);
    else filtered.push(rmLink);
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col transition-transform duration-300
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
             style={{ background: 'var(--bg-base)', borderRight: '1px solid var(--border-faint)' }}>
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border-faint)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: 'var(--accent-bright)', color: '#fff' }}>
              <HiOutlineCube className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>IMS Pro</h1>
              <p className="font-medium tracking-wider uppercase" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Inventory System</p>
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
              return <div key={i} className="my-3" style={{ borderTop: '1px solid var(--border-faint)' }} />;
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-r-xl text-sm font-medium transition-all duration-200 nav-item group ${isActive ? 'active-nav' : ''}`}
                style={({ isActive }) => ({
                  color: isActive ? '#f9fafb' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent-bright)' : '3px solid transparent',
                })}
                onMouseEnter={e => {
                  if(!e.currentTarget.classList.contains('active-nav')){
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.borderLeftColor = 'var(--border-strong)';
                  }
                }}
                onMouseLeave={e => {
                  if(!e.currentTarget.classList.contains('active-nav')){
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }
                }}
                id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <item.icon className="w-5 h-5 shrink-0" style={{ stroke: 'currentColor' }} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border-faint)' }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                 style={{ background: 'rgba(129,140,248,0.15)', color: '#a5b4fc', border: '1px solid rgba(129,140,248,0.3)' }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: '#c8c6f7' }}>{user?.name}</p>
              <p className="text-[11px] font-medium" style={{ color: '#6868a8' }}>{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 backdrop-blur-md"
                style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-faint)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg nav-item transition"
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-overlay)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.borderColor = 'var(--border-faint)' }}
                    id="sidebar-toggle">
              {sidebarOpen ? <HiOutlineXMark className="w-5 h-5" /> : <HiOutlineBars3 className="w-5 h-5" />}
            </button>
            {activeWorkspace && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-subtle)' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeWorkspace.color }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{activeWorkspace.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme}
                    className="p-2.5 rounded-lg nav-item transition"
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-overlay)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.borderColor = 'var(--border-faint)' }}
                    id="theme-toggle">
              {isDark ? <HiOutlineSun className="w-5 h-5" style={{ color: 'var(--warning-text)' }} /> : <HiOutlineMoon className="w-5 h-5" />}
            </button>
            <button onClick={handleLogout}
                    className="p-2.5 rounded-lg nav-item transition"
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)', color: 'var(--danger-text)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.borderColor = 'var(--danger-border)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.borderColor = 'var(--border-faint)' }}
                    id="logout-btn">
              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6" style={{ background: 'var(--bg-base)' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
