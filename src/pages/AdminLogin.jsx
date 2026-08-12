import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      if (user.role !== 'Admin') {
        showToast("Unauthorized access. Admin privileges required.", "error");
        // Force logout if not admin
        localStorage.removeItem('petzoe_token');
        localStorage.removeItem('petzoe_user');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/');
        return;
      }
      showToast(`Admin Access Granted. Welcome, ${user.name}!`, "success");
      navigate('/dashboard/admin');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Invalid credentials.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        
        {/* Top Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-600"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 mt-2">Secure access for PetZoe administrators</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                })}
                className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'} rounded-xl bg-gray-50 focus:bg-white transition-colors`}
                placeholder="admin@petzoe.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                {...register('password', { required: 'Password is required' })}
                className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'} rounded-xl bg-gray-50 focus:bg-white transition-colors`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
}
