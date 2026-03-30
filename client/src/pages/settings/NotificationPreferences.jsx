import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineBell, HiOutlineShoppingCart, HiOutlineDocumentText,
  HiOutlineClock, HiOutlineCreditCard, HiOutlineMegaphone,
  HiOutlineArchiveBox
} from 'react-icons/hi2';

const Toggle = ({ value, onChange, id }) => (
  <button
    id={id}
    role="switch"
    aria-checked={value}
    onClick={() => onChange(!value)}
    style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
      background: value ? 'var(--accent-soft)' : 'var(--bg-subtle)',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}
  >
    <span style={{
      position: 'absolute', top: 3, left: value ? 23 : 3,
      width: 18, height: 18, borderRadius: '50%', background: '#fff',
      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </button>
);

const PrefRow = ({ icon: Icon, label, description, value, onChange, id }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '16px 0', borderBottom: '1px solid var(--border-faint)',
    gap: 16,
  }}>
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{description}</p>
      </div>
    </div>
    <Toggle value={value} onChange={onChange} id={id} />
  </div>
);

const PREFERENCES = [
  { key: 'low_stock_email',   icon: HiOutlineArchiveBox,     label: 'Low stock alerts',           description: 'Get notified when products fall below their minimum stock level' },
  { key: 'purchase_updates',  icon: HiOutlineShoppingCart,   label: 'Purchase order updates',     description: 'Updates when purchase orders change status (received, cancelled, partial)' },
  { key: 'bill_issued',       icon: HiOutlineDocumentText,   label: 'Invoice issued',             description: 'Confirmation when a bill or invoice is sent to a customer' },
  { key: 'bill_overdue',      icon: HiOutlineClock,          label: 'Overdue payment reminders',  description: 'Reminders for unpaid invoices past their due date' },
  { key: 'payment_received',  icon: HiOutlineCreditCard,     label: 'Payment received',           description: 'Confirmation when a customer payment is recorded' },
  { key: 'system_updates',    icon: HiOutlineMegaphone,      label: 'System updates',             description: 'Product announcements and feature updates (off by default)' },
];

const DIGEST_OPTIONS = [
  { value: 'instant', label: 'Instant', description: 'Send as they happen' },
  { value: 'daily',   label: 'Daily digest', description: 'Once per day at 8:00 AM' },
  { value: 'weekly',  label: 'Weekly digest', description: 'Every Monday at 8:00 AM' },
];

const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState({
    low_stock_email: true, purchase_updates: true, bill_issued: true,
    bill_overdue: true, payment_received: true, system_updates: false,
    digest_frequency: 'instant',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Notification Preferences — IMS Pro';
    api.get('/notification-prefs/preferences')
      .then(({ data }) => setPrefs(p => ({ ...p, ...data.preferences })))
      .catch(() => toast.error('Failed to load preferences'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key) => (val) => setPrefs(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/notification-prefs/preferences', prefs);
      toast.success('Notification preferences saved.');
    } catch {
      toast.error('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--border-subtle)', borderTopColor: 'var(--accent-soft)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <HiOutlineBell style={{ width: 22, height: 22, color: 'var(--accent-soft)' }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Email Notifications</h2>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Choose which email notifications you receive. You can change these at any time.
        </p>
      </div>

      {/* Toggle rows */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '0 20px 4px', marginBottom: 24 }}>
        {PREFERENCES.map(pref => (
          <PrefRow
            key={pref.key}
            id={`pref-${pref.key}`}
            icon={pref.icon}
            label={pref.label}
            description={pref.description}
            value={!!prefs[pref.key]}
            onChange={handleToggle(pref.key)}
          />
        ))}
      </div>

      {/* Digest frequency */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '20px', marginBottom: 28 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Low stock alert frequency</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>How often would you like to receive low stock alerts?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DIGEST_OPTIONS.map(opt => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input
                type="radio"
                name="digest_frequency"
                value={opt.value}
                checked={prefs.digest_frequency === opt.value}
                onChange={() => setPrefs(p => ({ ...p, digest_frequency: opt.value }))}
                style={{ accentColor: 'var(--accent-soft)', width: 16, height: 16 }}
              />
              <span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{opt.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{opt.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '12px 28px', borderRadius: 10,
          background: saving ? 'var(--bg-subtle)' : 'var(--accent-soft)',
          color: '#fff', fontWeight: 600, fontSize: 14, border: 'none',
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saving ? 'Saving…' : 'Save preferences'}
      </button>
    </div>
  );
};

export default NotificationPreferences;
