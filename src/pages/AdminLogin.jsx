import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, Shield, Loader2, PawPrint, ArrowLeft } from 'lucide-react';
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
        showToast('Unauthorized access. Admin privileges required.', 'error');
        localStorage.removeItem('petzoe_token');
        localStorage.removeItem('petzoe_user');
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
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">

      {/* ── Animated gradient background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Floating ambient orbs */}
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-slate-600/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '3s' }} />

        {/* Subtle dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* ── Back to site link ── */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to PetZoe
      </Link>

      {/* ── Brand watermark top-right ── */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 select-none opacity-60">
        <span className="font-black text-lg text-white flex items-center">
          PetZ
          <PawPrint size={16} className="fill-current text-blue-400 mx-0.5" />
          e
        </span>
      </div>

      {/* ── Modal popup card ── */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-300"
        style={{ animationFillMode: 'forwards' }}
      >
        {/* Glassmorphism card */}
        <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-black/40">

          {/* Shield icon badge */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-xl" />
              <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 shadow-lg">
                <Shield size={26} className="text-blue-400" />
              </div>
            </div>
            <h1 className="font-black text-2xl text-white tracking-tight">Admin Portal</h1>
            <p className="text-slate-400 text-xs mt-1.5 font-medium">
              Secure administrative access only
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email field */}
            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1.5 ml-1">
                Admin Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                  })}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border ${
                    errors.email
                      ? 'border-rose-500/60 focus:border-rose-500'
                      : 'border-white/10 focus:border-blue-500/60'
                  } text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-xs font-medium transition-all backdrop-blur-sm`}
                  placeholder="admin@petzoe.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 ml-1 text-[10px] font-semibold text-rose-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.06] border ${
                    errors.password
                      ? 'border-rose-500/60 focus:border-rose-500'
                      : 'border-white/10 focus:border-blue-500/60'
                  } text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-xs font-medium transition-all backdrop-blur-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 ml-1 text-[10px] font-semibold text-rose-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border border-white/10 shadow-lg shadow-black/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-transparent disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Shield size={13} />
                    Authenticate & Enter
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
            <p className="text-[11px] text-slate-500 font-medium">
              Not an admin?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                User Login →
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom security badge */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Encrypted Connection Active
        </div>
      </div>

    </div>
  );
}
