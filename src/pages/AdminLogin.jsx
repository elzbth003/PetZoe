import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2, PawPrint, ArrowLeft, ArrowRight } from 'lucide-react';
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
    mode: 'onChange',
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      if (user.role !== 'Admin') {
        showToast('Unauthorized access. Admin privileges required.', 'error');
        sessionStorage.removeItem('petzoe_token');
        sessionStorage.removeItem('petzoe_user');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/');
        return;
      }
      showToast(`Admin Access Granted. Welcome, ${user.name}!`, 'success');
      navigate('/dashboard/admin');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Invalid credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">

      {/* Back to site link */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-primary-600 text-xs font-semibold transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to PetZoe
      </Link>

      {/* Brand watermark */}
      <Link to="/" className="absolute top-6 right-6 flex items-center gap-1.5 select-none">
        <span className="font-display font-black text-lg text-slate-800 flex items-center">
          PetZ
          <PawPrint size={16} className="fill-current text-secondary-500 mx-0.5" />
          e
        </span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-10">

          {/* Icon badge */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 mb-4">
              <ShieldCheck size={26} />
            </div>
            <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight">Admin Sign In</h1>
            <p className="text-slate-500 text-xs mt-1.5 font-medium">
              Restricted to authorized PetZoe administrators.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email field */}
            <div>
              <label htmlFor="admin-email" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">
                Admin Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  disabled={isSubmitting}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                  })}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border ${
                    errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-primary-500'
                  } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500/20 text-xs font-medium transition-all`}
                  placeholder="admin@petzoe.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 ml-1 text-[10px] font-semibold text-rose-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="admin-password" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={isSubmitting}
                  {...register('password', { required: 'Password is required' })}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border ${
                    errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-primary-500'
                  } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500/20 text-xs font-medium transition-all`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 ml-1 text-[10px] font-semibold text-rose-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 font-semibold">
              Not an admin?{' '}
              <Link to="/login" className="text-primary-600 hover:underline font-bold">
                Go to User Login
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
