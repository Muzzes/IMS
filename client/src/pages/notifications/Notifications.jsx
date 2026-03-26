import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PageLoader } from '../../components/LoadingSpinner';
import { HiOutlineBellAlert, HiOutlineCheck, HiOutlineXMark, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const typeConfig = {
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  success: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  info: { color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
  error: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const Notifications = () => {
  const { activeWorkspace } = useWorkspace();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');

  useEffect(() => { document.title = 'Notifications — IMS Pro'; }, []);

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/notifications?limit=50');
      setNotifications(data.notifications || []);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchNotifs(); }, [activeWorkspace]);

  const markRead = async (id) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    try {
      await api.put(`/notifications/${id}/read`);
      window.dispatchEvent(new Event('notifications-read'));
    } catch {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 0 } : n));
      toast.error('Failed to mark read');
    }
  };

  const markAllRead = async () => {
    const prev = [...notifications];
    setNotifications(ns => ns.map(n => ({ ...n, is_read: 1 })));
    try {
      await api.put('/notifications/read-all');
      toast.success('All marked as read');
      window.dispatchEvent(new Event('notifications-read'));
    } catch {
      setNotifications(prev);
      toast.error('Failed to mark all read');
    }
  };

  const clearNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await api.delete(`/notifications/${id}`);
    } catch {
      fetchNotifs();
      toast.error('Failed to clear notification');
    }
  };

  const clearAllRead = async () => {
    const readIds = notifications.filter(n => n.is_read).map(n => n.id);
    if (readIds.length === 0) return;
    setNotifications(prev => prev.filter(n => !n.is_read));
    try {
      await Promise.all(readIds.map(id => api.delete(`/notifications/${id}`)));
      toast.success(`${readIds.length} read notification(s) cleared`);
    } catch {
      fetchNotifs();
      toast.error('Failed to clear some notifications');
    }
  };

  const filtered = notifications.filter(n => {
    if (filterTab === 'all') return true;
    if (filterTab === 'unread') return !n.is_read;
    if (filterTab === 'stock') return n.type === 'warning' || n.title?.toLowerCase().includes('stock');
    if (filterTab === 'orders') return n.type === 'info' || n.title?.toLowerCase().includes('purchase') || n.title?.toLowerCase().includes('order');
    if (filterTab === 'billing') return n.title?.toLowerCase().includes('bill') || n.title?.toLowerCase().includes('payment');
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;

  if (loading) return <PageLoader />;

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: `Unread (${unreadCount})` },
    { key: 'stock', label: 'Stock Alerts' },
    { key: 'orders', label: 'Orders' },
    { key: 'billing', label: 'Billing' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.5px' }}>Notifications</h1>
        <div className="flex items-center gap-2">
          {readCount > 0 && (
            <button onClick={clearAllRead} className="text-sm font-medium transition flex items-center gap-1" style={{ color: 'var(--danger-text)' }}>
              <HiOutlineTrash className="w-4 h-4" /> Clear Read
            </button>
          )}
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-sm font-medium transition flex items-center gap-1" style={{ color: 'var(--accent-bright)' }}>
              <HiOutlineCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setFilterTab(tab.key)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                  style={{
                    background: filterTab === tab.key ? 'var(--bg-overlay)' : 'transparent',
                    color: filterTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: filterTab === tab.key ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <HiOutlineBellAlert className="w-12 h-12 mb-3" style={{ color: '#2a2a50' }} />
            <p style={{ color: '#9090c8', fontSize: '15px', fontWeight: 500 }}>No Notifications</p>
            <p className="mt-1" style={{ color: '#6868a8', fontSize: '13px' }}>You're all caught up for now.</p>
          </div>
        ) : (
          filtered.map((n, i) => {
            const cfg = typeConfig[n.type] || typeConfig.info;
            return (
              <div key={n.id} className="group p-4 flex items-start justify-between gap-4 transition-colors"
                   style={{
                     background: n.is_read ? 'transparent' : cfg.bg,
                     borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--border-faint)',
                     borderLeft: n.is_read ? '2px solid transparent' : `2px solid ${cfg.color}`,
                   }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!n.is_read && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />}
                    <h4 style={{ color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: n.is_read ? 400 : 500 }}>{n.title}</h4>
                  </div>
                  <p className="text-sm mb-2 pl-4" style={{ color: n.is_read ? 'var(--text-muted)' : 'var(--text-secondary)', fontWeight: n.is_read ? 400 : 500 }}>{n.message}</p>
                  <p className="pl-4" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{new Date(n.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.is_read && (
                    <button onClick={() => markRead(n.id)} className="text-xs font-medium px-2 py-1 rounded-lg transition"
                            style={{ color: 'var(--accent-bright)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      Mark Read
                    </button>
                  )}
                  <button onClick={() => clearNotification(n.id)} className="p-1 rounded-lg transition"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger-text)'; e.currentTarget.style.background = 'var(--danger-bg)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                    <HiOutlineXMark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
