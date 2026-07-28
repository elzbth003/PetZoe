import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function LoginPage() {
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
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      showToast("Access Granted. Welcome to PawNexus!", "success");
      navigate('/');
    } catch (err) {
      showToast(err.message || "Invalid credentials.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    showToast("Google Authentication is not configured for this sandbox.", "info");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="text-center lg:text-left space-y-1">
        <h2 className="font-display font-black text-2xl text-slate-900">Welcome Back</h2>
        <p className="text-xs text-slate-500 font-medium">
          Enter your details below to log in to your secure account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Email input */}
        <div>
          <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Mail size={16} />
            </span>
            <input
              type="email"
              placeholder="owner@pawnexus.com"
              disabled={isSubmitting}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border ${errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-primary-500'} text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500/20 text-xs font-medium transition-all`}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password input */}
        <div>
          <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border ${errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-primary-500'} text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500/20 text-xs font-medium transition-all`}
              {...register('password', {
                required: 'Password is required'
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me & Forgot Pass */}
        <div className="flex items-center justify-between text-xs font-semibold">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-primary-600 focus:ring-primary-500/20"
              {...register('rememberMe')}
            />
            <span>Remember me</span>
          </label>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); showToast("Password recovery is not implemented in this mock client.", "info"); }}
            className="text-primary-600 hover:underline"
          >
            Forgot Password?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/15 hover:shadow-primary-600/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Verifying Credentials...
            </>
          ) : (
            <>
              Login to Account <ArrowRight size={16} />
            </>
          )}
        </button>

      </form>

      {/* Divider */}
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Google Login button */}
      <button
        onClick={handleGoogleLogin}
        className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
      >
        {/* Google Icon */}
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.97 0 12 0 7.354 0 3.307 2.673 1.255 6.573L5.266 9.765z"
          />
          <path
            fill="#4285F4"
            d="M23.49 12.275c0-.825-.075-1.613-.21-2.373H12v4.51h6.46c-.277 1.488-1.116 2.748-2.373 3.6l3.7 3.7c2.164-2 3.7-4.945 3.7-8.437z"
          />
          <path
            fill="#FBBC05"
            d="M5.266 14.235L1.255 17.427C3.307 21.327 7.354 24 12 24c3.08 0 5.86-1.01 7.9-2.73l-3.7-3.7c-1.04.697-2.37 1.11-4.2 1.11-3.618 0-6.68-2.436-7.77-5.735l-.014-.01-3.95 3.3z"
          />
          <path
            fill="#34A853"
            d="M12 4.909c1.94 0 3.68.67 5.05 1.98l3.52-3.52C18.3 1.43 15.35.5 12 .5A11.45 11.45 0 0 0 .5 12c0 2.22.62 4.29 1.7 6.07l3.96-3.08c-.28-.79-.44-1.63-.44-2.5 0-3.62 2.44-6.68 5.73-7.77l.014.01z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Navigation to Register */}
      <p className="text-center text-xs text-slate-500 font-semibold">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:underline">
          Register here
        </Link>
      </p>

      {/* Seed Accounts Info Panel */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[10px] text-slate-500 text-left space-y-1">
        <p className="font-bold text-slate-700">Mock Accounts Available:</p>
        <p>🐾 Pet Owner: <span className="font-mono font-semibold text-primary-600">owner@pawnexus.com</span> / <span className="font-mono">Password123!</span></p>
        <p>🩺 Veterinarian: <span className="font-mono font-semibold text-secondary-600">vet@pawnexus.com</span> / <span className="font-mono">Password123!</span></p>
      </div>

    </div>
  );
}
