import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Boxes } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { role } = await login(email, password);
      toast.success('Login successful!');
      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'staff') navigate('/dashboard/staff');
      else if (role === 'manufacturer') navigate('/dashboard/manufacturer');
      else navigate('/');
    } catch (err) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Boxes className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Sign in to StockFlow</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
             admin@ims.com | staff@ims.com | manufacturer@ims.com
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border transition-colors outline-none"
                placeholder="admin@ims.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border transition-colors outline-none"
                placeholder="password"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-blue-400 dark:disabled:bg-blue-800 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-blue-500 transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
