import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineCube, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4
                    bg-gradient-to-br from-primary-50 via-white to-primary-100
                    dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                         bg-gradient-to-br from-primary-500 to-primary-700 shadow-xl shadow-primary-500/30 mb-4">
            <HiOutlineCube className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">IMS Pro</h1>
          <p className="text-surface-500 mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 shadow-xl animate-fadeIn space-y-5" id="login-form">
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                         bg-white dark:bg-surface-800 text-sm
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="Enter your email"
              id="login-email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                           bg-white dark:bg-surface-800 text-sm pr-10
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="Enter your password"
                id="login-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500
                       text-white font-semibold shadow-lg shadow-primary-500/30
                       hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5
                       active:translate-y-0 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            id="login-submit"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Demo credentials */}
          <div className="mt-4 p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 text-xs text-surface-500 space-y-1">
            <p className="font-semibold text-surface-600 dark:text-surface-400">Demo Accounts:</p>
            <p>Admin: admin@ims.com / password123</p>
            <p>Staff (1 workspace): priya@ims.com / password123</p>
            <p>Staff (2 workspaces): tom@ims.com / password123</p>
            <p>Manufacturer: jane@ims.com / password123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
