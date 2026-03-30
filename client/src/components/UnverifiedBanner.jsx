import { useState, useCallback } from 'react';
import { HiOutlineExclamationTriangle, HiOutlineXMark, HiOutlineArrowPath } from 'react-icons/hi2';
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from 'react-hot-toast';

const UnverifiedBanner = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  const handleResend = useCallback(async () => {
    if (!user?.email) return;
    setSending(true);
    try {
      await api.post('/auth/resend-verification', { email: user.email });
      toast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send. Please try again.';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  }, [user]);

  // Only show if user is logged in but NOT email_verified
  if (!user || user.email_verified || dismissed) return null;

  return (
    <div style={{
      background: 'rgba(245,158,11,0.1)',
      borderBottom: '1px solid rgba(245,158,11,0.3)',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      <HiOutlineExclamationTriangle style={{ width: 18, height: 18, color: '#f59e0b', flexShrink: 0 }} />

      <span style={{ fontSize: 13, color: '#b45309', flex: 1, minWidth: 200 }}>
        <strong>Your email address is not verified.</strong>{' '}
        Some features may be limited until you verify.
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleResend}
          disabled={sending}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: '1px solid rgba(245,158,11,0.5)',
            background: 'rgba(245,158,11,0.12)',
            color: '#92400e',
            fontSize: 12,
            fontWeight: 600,
            cursor: sending ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {sending && <HiOutlineArrowPath style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} />}
          Resend verification email
        </button>

        <button
          onClick={() => setDismissed(true)}
          style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#92400e', display: 'flex' }}
          aria-label="Dismiss banner"
        >
          <HiOutlineXMark style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
};

export default UnverifiedBanner;
