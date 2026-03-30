import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineShieldCheck, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import LoadingSpinner from '../../components/LoadingSpinner';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Set New Password — IMS Pro';
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'transparent', score: 0 };
    if (/\s/.test(pwd)) return { label: 'Weak (No spaces allowed)', color: 'var(--danger-text)', score: 0 };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 2) return { label: 'Weak', color: 'var(--danger-text)', score };
    if (score === 3) return { label: 'Fair', color: 'var(--warning-text)', score };
    if (score === 4) return { label: 'Strong', color: 'var(--success-text)', score };
    return { label: 'Very Strong', color: 'var(--success-text)', score };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    if (strength.score < 4) {
      toast.error('Password is not strong enough');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      toast.success('Password updated successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. The link might be expired.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <div className="w-full max-w-md relative z-10 text-center rounded-xl p-8 shadow-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h2 className="text-xl font-bold text-white mb-2">Notice</h2>
          <p className="text-[var(--text-secondary)] mb-6 text-sm">{error}</p>
          <div className="flex gap-4 justify-center">
            <Link to="/forgot-password" className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#fff] bg-[var(--accent-soft)] transition rounded-lg">Request New Link</Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <div className="w-full max-w-md relative z-10 text-center rounded-xl p-8 shadow-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: 'rgba(34,197,94,0.12)' }}>
            <HiOutlineShieldCheck className="w-8 h-8" style={{ color: '#22c55e' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Password Updated</h2>
          <p className="text-[var(--text-secondary)] mb-6 text-sm">Your password has been changed successfully. You can now securely log in.</p>
          <button onClick={() => navigate('/login', { replace: true })} className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest text-white transition rounded-lg hover:shadow-lg" style={{ background: 'linear-gradient(to right, #2563eb, #1d4ed8)' }}>
            <HiOutlineArrowRightOnRectangle className="w-4 h-4" /> Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, var(--accent-deep) 0%, transparent 50%), radial-gradient(circle at 90% 80%, var(--accent-deep) 0%, transparent 50%)' }}></div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-overlay)]"></div>
             <HiOutlineShieldCheck className="relative z-10 w-8 h-8 text-[var(--accent-bright)]" />
          </div>
          <h1 className="font-bold tracking-tight text-white mb-2" style={{ fontSize: '24px' }}>Set New Password</h1>
          <p className="text-sm text-[var(--text-secondary)]">Create a new, strong password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl p-8 shadow-2xl animate-fadeIn space-y-6"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              
          <div>
             <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-bright)] text-white pl-4 pr-10 py-3 rounded-lg outline-none transition font-mono text-lg tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-white transition">
                {showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex gap-1 h-1.5 rounded-full overflow-hidden bg-[var(--bg-subtle)]">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div key={level} className="flex-1 h-full transition-colors duration-300"
                         style={{ background: level <= strength.score ? strength.color : 'transparent' }} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: strength.color, fontWeight: 'bold' }}>{strength.label}</span>
              </div>
            )}
          </div>

          <div>
             <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Confirm Password</label>
             <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-bright)] text-white px-4 py-3 rounded-lg outline-none transition font-mono text-lg tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !password || password !== confirmPassword || strength.score < 4}
            className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-xs font-bold uppercase tracking-widest text-white transition rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(to right, #2563eb, #1d4ed8)', boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)' }}
          >
            {isSubmitting ? <><LoadingSpinner size="sm" /> Updating...</> : 'Save Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
