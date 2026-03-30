import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useIdleTimeout } from '../hooks/useIdleTimeout';
import WorkspaceSwitcher from '../components/WorkspaceSwitcher';
import UnverifiedBanner from '../components/UnverifiedBanner';
import {
  HiOutlineHome, HiOutlineCube, HiOutlineTruck, HiOutlineShoppingCart,
  HiOutlineBanknotes, HiOutlineDocumentText, HiOutlineChartBar,
  HiOutlineBell, HiOutlineCog6Tooth,
  HiOutlineBars3, HiOutlineXMark, HiOutlineArrowRightOnRectangle,
  HiOutlineBuildingStorefront, HiOutlineBeaker, HiOutlineUsers,
  HiOutlineArchiveBox, HiOutlineWrenchScrewdriver, HiOutlineEnvelope,
  HiOutlineAdjustmentsHorizontal
} from 'react-icons/hi2';
import { HiMagnifyingGlass } from 'react-icons/hi2';

const navItems = [
  { label: 'Dashboard',     path: '/',             icon: HiOutlineHome,          roles: ['admin', 'staff', 'manufacturer'] },
  { label: 'Products',      path: '/products',     icon: HiOutlineCube,          roles: ['admin', 'staff', 'manufacturer'] },
  { label: 'Inventory',     path: '/inventory',    icon: HiOutlineArchiveBox,    roles: ['admin', 'staff'] },
  { label: 'Suppliers',     path: '/suppliers',    icon: HiOutlineTruck,         roles: ['admin', 'staff'] },
  { label: 'Purchases',     path: '/purchases',    icon: HiOutlineShoppingCart,  roles: ['admin', 'staff'] },
  { label: 'Sales',         path: '/sales',        icon: HiOutlineBanknotes,     roles: ['admin', 'staff'] },
  { label: 'Reports',       path: '/reports',      icon: HiOutlineChartBar,      roles: ['admin', 'staff'] },
  { type: 'divider', roles: ['admin'] },
  { label: 'Workspaces',    path: '/settings/workspaces', icon: HiOutlineBuildingStorefront, roles: ['admin'] },
  { label: 'Users',         path: '/settings/users',      icon: HiOutlineUsers,              roles: ['admin'] },
  { label: 'Email Logs',    path: '/settings/email-logs', icon: HiOutlineEnvelope,           roles: ['admin'] },
  { type: 'divider', roles: ['admin', 'staff', 'manufacturer'] },
  { label: 'Email Prefs',   path: '/settings/notifications', icon: HiOutlineAdjustmentsHorizontal, roles: ['admin', 'staff', 'manufacturer'] },
];

const AppLayout = () => {
  useIdleTimeout(30 * 60 * 1000); // 30 mins
  
  const { user, logout } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const filtered = navItems.filter(item => item.roles.includes(user?.role));
  
  if (activeWorkspace?.name === 'Candle Co.') {
    const rmLink = { label: 'Raw Materials', path: '/raw-materials', icon: HiOutlineBeaker, roles: ['admin', 'staff', 'manufacturer'] };
    const idx = filtered.findIndex(i => i.path === '/suppliers');
    if (idx !== -1) filtered.splice(idx + 1, 0, rmLink);
    else filtered.push(rmLink);
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Precision Engine Style */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col transition-transform duration-300
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
             style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)' }}>
        
        {/* Logo */}
        <div className="px-6 py-6" style={{ borderBottom: '1px solid var(--border-faint)' }}>
          <h1 className="text-xl font-bold tracking-tight text-white mb-1">IMS Pro</h1>
          <div className="inline-flex items-center">
            <span className="text-[10px] font-bold tracking-widest text-[#93c5fd] uppercase" style={{ letterSpacing: '0.1em' }}>
              V2.4 OPERATIONAL
            </span>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="pt-4 px-2">
          <WorkspaceSwitcher />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4 mt-2 space-y-1">
          {filtered.map((item, i) => {
            if (item.type === 'divider') {
              return <div key={i} className="my-4 mx-4" style={{ borderTop: '1px solid var(--border-faint)' }} />;
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 nav-item group ${isActive ? 'active-nav' : ''}`}
                style={({ isActive }) => ({
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-subtle)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent-soft)' : '3px solid transparent',
                  fontWeight: isActive ? 600 : 500
                })}
                onMouseEnter={e => {
                  if(!e.currentTarget.classList.contains('active-nav')){
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={e => {
                  if(!e.currentTarget.classList.contains('active-nav')){
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" style={{ strokeWidth: 2 }} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Sidebar - Logout */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-faint)' }}>
          <button onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <HiOutlineArrowRightOnRectangle className="w-5 h-5 rotate-180" />
            <span className="uppercase tracking-wider text-[11px]">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col bg-[var(--bg-base)]">
        <UnverifiedBanner />
        
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-8 backdrop-blur-md"
                style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-subtle)' }}>
          
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)]">
              {sidebarOpen ? <HiOutlineXMark className="w-5 h-5" /> : <HiOutlineBars3 className="w-5 h-5" />}
            </button>

            {/* Global Search - Mockup style */}
            <div className="hidden md:flex items-center w-full max-w-md relative">
              <HiMagnifyingGlass className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
              <input type="text"
                     placeholder="Global SKU or Batch Search..."
                     className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border-none outline-none text-[var(--text-primary)] transition-all"
                     style={{
                       background: 'var(--bg-elevated)',
                       borderRadius: '8px'
                     }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <NavLink to="/notifications" className={({ isActive }) => `p-2 rounded-lg transition border border-transparent ${isActive ? 'text-white bg-[var(--bg-subtle)] border border-[var(--border-subtle)]' : 'text-[var(--text-secondary)] hover:text-white'}`}>
                <HiOutlineBell className="w-5 h-5" />
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink to="/settings/system" className={({ isActive }) => `p-2 rounded-lg transition border border-transparent ${isActive ? 'text-white bg-[var(--bg-subtle)] border border-[var(--border-subtle)]' : 'text-[var(--text-secondary)] hover:text-white'}`}>
                  <HiOutlineCog6Tooth className="w-5 h-5" />
                </NavLink>
              )}
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-subtle)]">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.name}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">{user?.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[var(--accent-bright)]">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
