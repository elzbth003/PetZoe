import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, PawPrint, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { GoogleLogin } from '@react-oauth/google';
import marketplaceService from '../services/marketplaceService';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const redirectByRole = async (user) => {
    const redirectUrl = searchParams.get('redirect');
    const pendingBuyNow = localStorage.getItem('petzoe_pending_buy_now');

    if (user.role === 'Pet Owner') {
      if (pendingBuyNow) {
        try {
          const item = JSON.parse(pendingBuyNow);
          localStorage.removeItem('petzoe_pending_buy_now');
          if (item?.productId) {
            await marketplaceService.addToCart(item.productId, item.quantity || 1);
            window.dispatchEvent(new Event('cart-updated'));
          }
        } catch (e) {
          console.error('Failed to add pending purchase to cart', e);
        }
      }
      if (redirectUrl) {
        navigate(redirectUrl);
        return;
      }
      navigate('/dashboard/owner');
      return;
    }

    switch (user.role) {
      case 'Veterinarian': navigate('/dashboard/vet'); break;
      case 'Shelter Manager': navigate('/dashboard/shelter'); break;
      case 'Marketplace Seller': navigate('/dashboard/seller'); break;
      case 'Admin': navigate('/dashboard/admin'); break;
      default: navigate('/');
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      showToast(`Welcome back, ${user.name}!`, "success");
      await redirectByRole(user);
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
      await redirectByRole(user);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Google sign-in failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sleek Brand Badge Header (Replacing previous illustration) */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-[#112A46] to-[#1E3A5F] text-white shadow-md shadow-[#112A46]/15 mb-1">
          <PawPrint size={24} className="text-[#38BDF8]" />
        </div>
        <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
          Log in to access your digital pet health records, consultations, and marketplace.
        </p>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Email input */}
        <div>
          <label htmlFor="email" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none">
              <Mail size={16} />
            </span>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              disabled={isSubmitting}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/80 border ${
                errors.email 
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' 
                  : 'border-slate-200 focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/15'
              } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 text-xs font-medium transition-all bg-white`}
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
          <label htmlFor="password" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none">
              <Lock size={16} />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50/80 border ${
                errors.password 
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' 
                  : 'border-slate-200 focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/15'
              } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 text-xs font-medium transition-all bg-white`}
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-xs font-semibold pt-0.5">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded-md border-slate-300 text-[#1E3A5F] focus:ring-[#1E3A5F]/20 cursor-pointer h-4 w-4"
              {...register('rememberMe')}
            />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl font-bold bg-[#112A46] hover:bg-[#1E3A5F] active:scale-[0.99] text-white shadow-lg shadow-[#112A46]/20 hover:shadow-[#112A46]/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs tracking-wide"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Authenticating...
            </>
          ) : (
            <>
              Sign In to PetZoe <ArrowRight size={15} />
            </>
          )}
        </button>

      </form>

      {/* Styled Divider */}
      <div className="relative flex items-center justify-center my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200/80" />
        </div>
        <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Or continue with
        </span>
      </div>

      {/* Google Login One-Click Button */}
      <div className="flex justify-center w-full">
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
      <div className="text-center pt-1 border-t border-slate-100">
        <p className="text-xs text-slate-500 font-medium">
          New to PetZoe?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline inline-flex items-center gap-0.5">
            Create an account
          </Link>
        </p>
      </div>

    </div>
  );
}
