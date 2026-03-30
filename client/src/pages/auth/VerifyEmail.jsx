import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineEnvelope, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlineClock, HiOutlineArrowPath, HiOutlineShieldCheck
} from 'react-icons/hi2';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [state, setState] = useState('idle'); // idle | loading | success | expired | used | invalid
  const [email, setEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => { document.title = 'Verify Email — IMS Pro'; }, []);

  // If token in URL → verify immediately
  useEffect(() => {
    if (!token) { setState('idle'); return; }

    setState('loading');
    api.post('/auth/verify-email', { token })
      .then(({ data }) => {
        setState('success');
        // Store tokens from response
        if (data.token) {
          localStorage.setItem('ims_token', data.token);
          if (data.refreshToken) localStorage.setItem('ims_refresh_token', data.refreshToken);
        }
        toast.success('Email verified! Welcome to IMS Pro.');
        // Auto-redirect countdown
        let c = 3;
        const timer = setInterval(() => {
          c -= 1;
          setCountdown(c);
          if (c <= 0) { clearInterval(timer); navigate('/', { replace: true }); }
        }, 1000);
      })
      .catch((err) => {
        const code = err.response?.data?.code;
        if (code === 'TOKEN_EXPIRED') {
          const serverEmail = err.response?.data?.email;
          if (serverEmail) setEmail(serverEmail);
          setState('expired');
        } else if (err.response?.status === 400) {
          setState('invalid');
        } else {
          setState('invalid');
        }
      });
  }, [token, navigate]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleResend = useCallback(async (emailToResend) => {
    const target = emailToResend || email;
    if (!target) { toast.error('Enter your email to resend.'); return; }
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: target });
      toast.success('Verification email sent! Check your inbox.');
      setResendCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to resend. Please try again.';
      toast.error(msg);
    } finally {
      setResending(false);
    }
  }, [email]);

  // ── State: no token (just registered) ───────────────────────────────────────
  if (!token || state === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: 440, width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '48px 40px', textAlign: 'center' }}>
          {/* Envelope icon */}
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(129,140,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <HiOutlineEnvelope style={{ width: 40, height: 40, color: 'var(--accent-soft)' }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Check your email
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
            We sent a verification link to your email address. Click the link to activate your account.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 32 }}>
            Didn't receive it? Check your spam folder.
          </p>

          {/* Resend section */}
          <div style={{ marginBottom: 24 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email to resend"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', marginBottom: 12 }}
            />
            <button
              onClick={() => handleResend(email)}
              disabled={resending || resendCooldown > 0}
              style={{ width: '100%', padding: '12px', borderRadius: 10, background: resendCooldown > 0 ? 'var(--bg-subtle)' : 'var(--accent-soft)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {resending ? <HiOutlineArrowPath style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : null}
              {resendCooldown > 0 ? `Resend available in 0:${String(resendCooldown).padStart(2, '0')}` : 'Resend verification email'}
            </button>
          </div>

          <Link to="/login" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← Wrong email? Go back to login
          </Link>
        </div>
      </div>
    );
  }

  // ── State: loading ───────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-soft)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Verifying your email…</p>
        </div>
      </div>
    );
  }

  // ── State: success ───────────────────────────────────────────────────────────
  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: 440, width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <HiOutlineCheckCircle style={{ width: 44, height: 44, color: '#22c55e' }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Email verified!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Your account is now active.</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Redirecting in {countdown}…</p>
          <button onClick={() => navigate('/', { replace: true })} style={{ marginTop: 24, padding: '12px 28px', borderRadius: 10, background: 'var(--accent-soft)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Go to dashboard now
          </button>
        </div>
      </div>
    );
  }

  // ── State: expired ───────────────────────────────────────────────────────────
  if (state === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: 440, width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <HiOutlineClock style={{ width: 44, height: 44, color: '#f59e0b' }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Link expired</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>This verification link was valid for 24 hours.</p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Request a new one below.</p>
          {email && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Resending to: <strong>{email}</strong></p>}
          <button
            onClick={() => handleResend(email)}
            disabled={resending || resendCooldown > 0}
            style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'var(--accent-soft)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}
          >
            {resendCooldown > 0 ? `Resend in 0:${String(resendCooldown).padStart(2, '0')}` : 'Resend verification email'}
          </button>
        </div>
      </div>
    );
  }

  // ── State: invalid / used ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 440, width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '48px 40px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <HiOutlineXCircle style={{ width: 44, height: 44, color: '#ef4444' }} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Invalid link</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
          This verification link is invalid or has already been used.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" style={{ padding: '12px 24px', borderRadius: 10, background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            Go to login
          </Link>
          <button
            onClick={() => setState('idle')}
            style={{ padding: '12px 24px', borderRadius: 10, background: 'var(--accent-soft)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}
          >
            Request a new link
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
