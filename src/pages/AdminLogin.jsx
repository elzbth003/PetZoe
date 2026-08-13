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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center lg:text-left space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-4 lg:hidden">
          <Shield size={24} />
        </div>
        <div className="hidden lg:inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-4">
          <Shield size={24} />
        </div>
        <h2 className="font-display font-black text-2xl text-slate-900">Admin Portal</h2>
        <p className="text-xs text-slate-500 font-medium">
          Secure access for PetZoe administrators
        </p>
      </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Admin Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Mail className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                })}
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border ${errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-slate-800'} text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800/20 text-xs font-medium transition-all`}
                placeholder="admin@petzoe.com"
              />
            </div>
            {errors.email && <p className="mt-1 ml-1 text-[10px] font-semibold text-rose-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Lock className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                {...register('password', { required: 'Password is required' })}
                className={`w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border ${errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-slate-800'} text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800/20 text-xs font-medium transition-all`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 ml-1 text-[10px] font-semibold text-rose-500">{errors.password.message}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Authenticate System'}
            </button>
          </div>
        </form>
    </div>
  );
}
