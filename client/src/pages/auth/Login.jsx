import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineCube, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { document.title = 'Login — IMS Pro'; }, []);

  // If already logged in, redirect to intended page or dashboard
  useEffect(() => {
    if (user) {
      const intended = location.state?.from || '/';
      navigate(intended, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back!');
      const intended = location.state?.from || '/';
      navigate(intended, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
      // Clear password on failure, keep email
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl"
               style={{ background: 'var(--accent-bright)', color: '#fff', boxShadow: '0 10px 25px rgba(129, 140, 248, 0.25)' }}>
            <HiOutlineCube className="w-8 h-8" style={{ color: '#fff' }} />
          </div>
          <h1 className="font-bold tracking-tight" style={{ color: 'var(--text-primary)', fontSize: '28px' }}>IMS Pro</h1>
          <p className="mt-2" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-[20px] p-[40px] shadow-2xl animate-fadeIn space-y-6"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', maxWidth: '400px', margin: '0 auto' }} id="login-form">
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full"
              placeholder="Enter your email"
              id="login-email"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pr-10"
                placeholder="Enter your password"
                id="login-password"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 btn-primary"
            id="login-submit"
          >
            {loading ? <><LoadingSpinner size="sm" /> Signing in...</> : 'Sign In'}
          </button>

          {/* Demo credentials */}
          <div className="mt-4 p-4 rounded-xl space-y-1" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-faint)' }}>
            <p className="font-semibold text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-primary)' }}>Demo Accounts:</p>
            <p className="font-mono-val">Admin: admin@ims.com / password123</p>
            <p className="font-mono-val">Staff (1 ws): priya@ims.com / password123</p>
            <p className="font-mono-val">Staff (2 ws): tom@ims.com / password123</p>
            <p className="font-mono-val">Supplier: jane@ims.com / password123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
