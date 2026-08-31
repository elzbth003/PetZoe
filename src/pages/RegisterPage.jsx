import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, Phone, User, Shield, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Empty', color: 'bg-slate-200' });
  const { register: registerAuth, googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'Pet Owner',
      acceptTerms: false
    }
  });

  const passwordValue = watch('password', '');

  // Calculate password strength
  useEffect(() => {
    if (!passwordValue) {
      setPasswordStrength({ score: 0, label: 'Empty', color: 'bg-slate-200' });
      return;
    }

    let score = 0;
    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue)) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;

    let label = 'Weak';
    let color = 'bg-rose-500';

    if (score === 3) {
      label = 'Medium';
      color = 'bg-amber-500';
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
    }

    setPasswordStrength({ score, label, color });
  }, [passwordValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await registerAuth(data);
      showToast("Account created successfully! Please log in.", "success");
      setTimeout(() => { navigate('/login'); }, 1500);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Registration failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectByRole = (user) => {
    switch (user.role) {
      case 'Pet Owner': navigate('/dashboard/owner'); break;
      case 'Veterinarian': navigate('/dashboard/vet'); break;
      case 'Shelter Manager': navigate('/dashboard/shelter'); break;
      case 'Admin': navigate('/dashboard/admin'); break;
      default: navigate('/');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsSubmitting(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      showToast(`Welcome, ${user.name}! Account created with Google.`, "success");
      redirectByRole(user);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Google sign-up failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="text-center lg:text-left space-y-1">
        <h2 className="font-display font-black text-2xl text-slate-900">Create Account</h2>
        <p className="text-xs text-slate-500 font-medium">
          Sign up to join our unified pet care network.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Full Name</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <User size={16} />
            </span>
            <input
              id="name"
              type="text"
              placeholder="Dr. Sarah Jenkins"
              disabled={isSubmitting}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-primary-500'} text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500/20 text-xs font-medium transition-all`}
              {...register('name', { required: 'Full name is required' })}
            />
          </div>
          {errors.name && (
            <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Mail size={16} />
            </span>
            <input
              id="email"
              type="email"
              placeholder="sarah@petverse.com"
              disabled={isSubmitting}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-primary-500'} text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500/20 text-xs font-medium transition-all`}
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

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Phone Number</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Phone size={16} />
            </span>
            <input
              id="phone"
              type="tel"
              placeholder="9876543210"
              disabled={isSubmitting}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${errors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-primary-500'} text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500/20 text-xs font-medium transition-all`}
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Please enter a valid 10-digit phone number'
                }
              })}
            />
          </div>
          {errors.phone && (
            <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.phone.message}</p>
          )}
        </div>

        {/* User Role */}
        <div>
          <label htmlFor="role" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">User Role</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <Briefcase size={16} />
            </span>
            <select
              id="role"
              disabled={isSubmitting}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary-500 text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500/20 text-xs font-semibold cursor-pointer"
              {...register('role')}
            >
              <option value="Pet Owner">Pet Owner</option>
              <option value="Veterinarian">Veterinarian</option>
              <option value="Shelter Manager">Shelter Manager</option>
              <option value="Marketplace Seller">Marketplace Seller</option>
            </select>
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Lock size={16} />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border ${errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-primary-500'} text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500/20 text-xs font-medium transition-all`}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: 'Password must contain uppercase, lowercase, number, and special character'
                }
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

          {/* Password Strength Indicator */}
          {passwordValue && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-slate-500">
                <span>Strength: <span className={passwordStrength.label === 'Strong' ? 'text-emerald-500' : passwordStrength.label === 'Medium' ? 'text-amber-500' : 'text-rose-500'}>{passwordStrength.label}</span></span>
                <span>{passwordStrength.score}/4 criteria</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${passwordStrength.color} transition-all duration-300`}
                  style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          {errors.password && (
            <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Confirm Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Shield size={16} />
            </span>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${errors.confirmPassword ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-primary-500'} text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500/20 text-xs font-medium transition-all`}
              {...register('confirmPassword', {
                required: 'Confirm password is required',
                validate: (value) => value === passwordValue || 'Passwords do not match'
              })}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Accept Terms Checkbox */}
        <div>
          <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500/20 cursor-pointer"
              {...register('acceptTerms', { required: 'You must accept the terms & conditions' })}
            />
            <span>
              I accept the{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); showToast("Platform terms details are not seeded in sandbox.", "info"); }} className="text-primary-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); showToast("Platform privacy details are not seeded in sandbox.", "info"); }} className="text-primary-600 hover:underline">
                Privacy Policy
              </a>.
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.acceptTerms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/15 hover:shadow-primary-600/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Registering Account...
            </>
          ) : (
            <>
              Register Account <ArrowRight size={16} />
            </>
          )}
        </button>

      </form>

      {/* Divider */}
      <div className="flex items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or sign up with Google</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Google Sign Up Button */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => showToast("Google sign-up was cancelled or failed.", "error")}
          useOneTap={false}
          width="100%"
          theme="outline"
          size="large"
          text="signup_with"
          shape="rectangular"
        />
      </div>

      {/* Redirect to Login */}
      <p className="text-center text-xs text-slate-500 font-semibold pt-2">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:underline">
          Log in here
        </Link>
      </p>

    </div>
  );
}
