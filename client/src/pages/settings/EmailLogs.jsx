import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineEnvelope, HiOutlineFunnel, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlineArrowPath, HiOutlineCalendar
} from 'react-icons/hi2';

const STATUS_BADGE = {
  sent:    { bg: 'rgba(34,197,94,0.12)',  color: '#16a34a', label: 'Sent' },
  failed:  { bg: 'rgba(239,68,68,0.12)',  color: '#dc2626', label: 'Failed' },
  bounced: { bg: 'rgba(245,158,11,0.12)', color: '#d97706', label: 'Bounced' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_BADGE[status] || STATUS_BADGE.sent;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
      {s.label}
    </span>
  );
};

const EmailLogs = () => {
  const [logs, setLogs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', type: '', date_from: '', date_to: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = async (p = 1, f = filters) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 30, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)) };
      const { data } = await api.get('/email-logs', { params });
      setLogs(data.data);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load email logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Email Logs — IMS Pro';
    fetchLogs(1);
  }, []);

  const handleFilterChange = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const handleApply = () => fetchLogs(1, filters);
  const handleClear = () => {
    const reset = { status: '', type: '', date_from: '', date_to: '' };
    setFilters(reset);
    fetchLogs(1, reset);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <HiOutlineEnvelope style={{ width: 22, height: 22, color: 'var(--accent-soft)' }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Email Logs</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {total.toLocaleString()} total email dispatches recorded
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowFilters(f => !f)}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <HiOutlineFunnel style={{ width: 14, height: 14 }} />
            Filters
          </button>
          <button
            onClick={() => fetchLogs(page)}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <HiOutlineArrowPath style={{ width: 14, height: 14 }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Status</label>
            <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13 }}>
              <option value="">All statuses</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Type</label>
            <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13 }}>
              <option value="">All types</option>
              <option value="verification">Verification</option>
              <option value="welcome">Welcome</option>
              <option value="password_reset">Password Reset</option>
              <option value="low_stock">Low Stock Alert</option>
              <option value="purchase_update">Purchase Update</option>
              <option value="bill_issued">Bill Issued</option>
              <option value="overdue_reminder">Overdue Reminder</option>
              <option value="payment_confirmation">Payment Confirmation</option>
              <option value="invite">Invite</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>From date</label>
            <input type="date" value={filters.date_from} onChange={e => handleFilterChange('date_from', e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>To date</label>
            <input type="date" value={filters.date_to} onChange={e => handleFilterChange('date_to', e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleApply}
              style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--accent-soft)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>
              Apply
            </button>
            <button onClick={handleClear}
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, border: '2px solid var(--border-subtle)', borderTopColor: 'var(--accent-soft)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <HiOutlineEnvelope style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No email logs found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Recipient', 'Type', 'Subject', 'Status', 'Sent at'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id} style={{ borderBottom: i < logs.length - 1 ? '1px solid var(--border-faint)' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-primary)' }}>{log.recipient}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{log.type}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', maxWidth: 280 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.subject}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={log.status} /></td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => fetchLogs(page - 1)} disabled={page <= 1}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 13, cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}>
            Previous
          </button>
          <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>
            Page {page} of {pages}
          </span>
          <button onClick={() => fetchLogs(page + 1)} disabled={page >= pages}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 13, cursor: page >= pages ? 'not-allowed' : 'pointer', opacity: page >= pages ? 0.5 : 1 }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailLogs;
