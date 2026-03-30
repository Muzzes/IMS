import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { validateEmail } from '../../utils/validateEmail';
import { HiOutlineKey, HiOutlineArrowLeft, HiOutlineEnvelope } from 'react-icons/hi2';
import LoadingSpinner from '../../components/LoadingSpinner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => { document.title = 'Forgot Password — IMS Pro'; }, []);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) {
      const res = validateEmail(val);
      if (res.valid || val === '') setEmailError('');
    }
  };

  const handleBlur = () => {
    if (email) {
      const res = validateEmail(email);
      if (!res.valid) setEmailError(res.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = validateEmail(email);
    if (!res.valid) {
      setEmailError(res.message);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSuccess(true);
      toast.success('Password reset link sent to your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, var(--accent-deep) 0%, transparent 50%), radial-gradient(circle at 90% 80%, var(--accent-deep) 0%, transparent 50%)' }}></div>
        <div className="w-full max-w-md relative z-10">
          <div className="text-center rounded-xl p-8 shadow-2xl animate-fadeIn" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: 'rgba(34,197,94,0.12)' }}>
              <HiOutlineEnvelope className="w-8 h-8" style={{ color: '#22c55e' }} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
            <p className="text-[var(--text-secondary)] mb-6 text-sm">
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <p className="text-[var(--text-muted)] text-xs mb-8">
              The link will expire in 1 hour. If you don't receive an email, check your spam folder.
            </p>
            <Link to="/login" className="flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest text-[var(--accent-bright)] transition rounded-lg hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
               <HiOutlineArrowLeft className="w-4 h-4" /> Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, var(--accent-deep) 0%, transparent 50%), radial-gradient(circle at 90% 80%, var(--accent-deep) 0%, transparent 50%)' }}></div>
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-overlay)]"></div>
             <HiOutlineKey className="relative z-10 w-8 h-8 text-[var(--accent-bright)]" />
          </div>
          <h1 className="font-bold tracking-tight text-white mb-2" style={{ fontSize: '24px' }}>Reset Password</h1>
          <p className="text-sm text-[var(--text-secondary)]">Enter your email and we'll send a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl p-8 shadow-2xl animate-fadeIn space-y-6"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              
          <div>
            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Operator Identity</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleBlur}
              required
              className="w-full bg-[var(--bg-elevated)] border focus:border-[var(--accent-bright)] text-white px-4 py-3 rounded-lg outline-none transition font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: emailError ? 'var(--danger-text)' : 'var(--border-subtle)' }}
              placeholder="Enter email address"
              disabled={isSubmitting}
            />
            {emailError && <p className="text-[11px] text-[var(--danger-text)] mt-2 font-medium">{emailError}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-xs font-bold uppercase tracking-widest text-white transition rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(to right, #2563eb, #1d4ed8)', boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)' }}
          >
            {isSubmitting ? <><LoadingSpinner size="sm" /> Sending...</> : 'Send Reset Link'}
          </button>
          
          <div className="text-center mt-6">
            <Link to="/login" className="text-xs font-medium text-[var(--text-muted)] hover:text-white transition inline-flex items-center gap-1">
              <HiOutlineArrowLeft className="w-3 h-3" /> Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
