import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, googleLogin } = useAuth();
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

  const redirectByRole = (user) => {
    switch (user.role) {
      case 'Pet Owner': navigate('/dashboard/owner'); break;
      case 'Veterinarian': navigate('/dashboard/vet'); break;
      case 'Shelter Manager': navigate('/dashboard/shelter'); break;
      case 'Admin': navigate('/dashboard/admin'); break;
      default: navigate('/');
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      showToast(`Access Granted. Welcome back, ${user.name}!`, "success");
      redirectByRole(user);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Invalid credentials.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsSubmitting(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      showToast(`Welcome, ${user.name}! Signed in with Google.`, "success");
      redirectByRole(user);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Google sign-in failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
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
              placeholder="owner@petverse.com"
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
              {...register('password', { required: 'Password is required' })}
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
          <Link to="/forgot-password" className="text-primary-600 hover:underline">
            Forgot Password?
          </Link>
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
        <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or continue with</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Google Login Button */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => showToast("Google sign-in was cancelled or failed.", "error")}
          useOneTap={false}
          width="100%"
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </div>

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
        <p>🐾 Pet Owner: <span className="font-mono font-semibold text-primary-600">owner@petverse.com</span> / <span className="font-mono">Password123!</span></p>
        <p>🩺 Veterinarian: <span className="font-mono font-semibold text-secondary-600">vet@petverse.com</span> / <span className="font-mono">Password123!</span></p>
      </div>

    </div>
  );
}
