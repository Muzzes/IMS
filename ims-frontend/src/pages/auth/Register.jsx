import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Boxes } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'staff' // hidden role choice for dev
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await register(formData);
      toast.success('Registration successful. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Boxes className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create an account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border outline-none" placeholder="example@ims.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border outline-none" placeholder="********" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border outline-none" placeholder="********" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role (Dev Testing)</label>
              <select name="role" value={formData.role} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border outline-none">
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="manufacturer">Manufacturer</option>
              </select>
            </div>
          </div>
          <div>
            <button type="submit" disabled={loading} className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-blue-400 transition-colors">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-blue-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
