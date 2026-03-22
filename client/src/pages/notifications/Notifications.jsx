import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PageLoader } from '../../components/LoadingSpinner';
import { HiOutlineBellAlert, HiOutlineCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { activeWorkspace } = useWorkspace();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/notifications?limit=50');
      setNotifications(data.notifications || []);
    } catch (err) { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchNotifs(); }, [activeWorkspace]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch { toast.error('Failed'); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Notifications</h1>
        {notifications.some(n => !n.is_read) && (
          <button onClick={markAllRead} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
            <HiOutlineCheck className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      <div className="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 overflow-hidden divide-y divide-surface-100 dark:divide-surface-800">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-surface-400 flex flex-col items-center">
            <HiOutlineBellAlert className="w-12 h-12 mb-2 opacity-50" />
            <p>You have no notifications.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`p-4 flex items-start justify-between gap-4 transition-colors ${n.is_read ? 'opacity-70' : 'bg-primary-50/50 dark:bg-primary-900/10'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                  <h4 className={`font-medium text-sm ${n.is_read ? 'text-surface-700 dark:text-surface-300' : 'text-surface-900 dark:text-white'}`}>{n.title}</h4>
                </div>
                <p className="text-sm text-surface-500 mb-2 pl-4">{n.message}</p>
                <p className="text-xs text-surface-400 pl-4">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && (
                <button onClick={() => markRead(n.id)} className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700 transition">
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
