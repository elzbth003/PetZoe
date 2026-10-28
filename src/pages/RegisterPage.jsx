import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Eye, EyeOff, Lock, Mail, Phone, User, ShieldCheck, 
  ArrowRight, Loader2, PawPrint, Stethoscope, Building2, 
  ShoppingBag, CheckCircle2, Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { GoogleLogin } from '@react-oauth/google';

const ROLES = [
  {
    id: 'Pet Owner',
    title: 'Pet Owner',
    description: 'Track pet health, book vet visits & shop',
    icon: PawPrint,
    accent: 'blue'
  },
  {
    id: 'Veterinarian',
    title: 'Veterinarian',
    description: 'Conduct telemedicine & manage charts',
    icon: Stethoscope,
    accent: 'teal'
  },
  {
    id: 'Shelter Manager',
    title: 'Shelter Manager',
    description: 'Intake rescues & coordinate adoptions',
    icon: Building2,
    accent: 'emerald'
  },
  {
    id: 'Marketplace Seller',
    title: 'Marketplace Seller',
    description: 'Supply authentic nutrition & wellness',
    icon: ShoppingBag,
    accent: 'purple'
  }
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const { register: registerAuth, googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
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

  const selectedRole = watch('role', 'Pet Owner');
  const passwordValue = watch('password', '') || '';

  // Calculate granular password criteria
  const passwordCriteria = {
    hasMinLen: passwordValue.length >= 8,
    hasMixedCase: /[a-z]/.test(passwordValue) && /[A-Z]/.test(passwordValue),
    hasDigit: /[0-9]/.test(passwordValue),
    hasSpecial: /[^A-Za-z0-9]/.test(passwordValue)
  };

  const strengthScore = [
    passwordCriteria.hasMinLen,
    passwordCriteria.hasMixedCase,
    passwordCriteria.hasDigit,
    passwordCriteria.hasSpecial
  ].filter(Boolean).length;

  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-slate-200',
    'bg-rose-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-emerald-500'
  ];
  const strengthTextColors = [
    'text-slate-400',
    'text-rose-500',
    'text-amber-500',
    'text-blue-500',
    'text-emerald-500'
  ];

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
      case 'Marketplace Seller': navigate('/dashboard/seller'); break;
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
      
      {/* Sleek Brand Badge Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-[#112A46] to-[#1E3A5F] text-white shadow-md shadow-[#112A46]/15 mb-0.5">
          <PawPrint size={24} className="text-[#38BDF8]" />
        </div>
        <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight">
          Create Your Account
        </h2>
        <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
          Join PetZoe's unified health ecosystem for veterinary telemedicine, pet records, and welfare.
        </p>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Interactive Visual Role Selector */}
        <div>
          <label className="block text-slate-700 text-xs font-bold mb-2 ml-0.5">
            Select Your Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <div
                  key={role.id}
                  onClick={() => setValue('role', role.id, { shouldValidate: true })}
                  className={`relative p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 select-none flex items-start gap-3 ${
                    isSelected
                      ? 'border-[#112A46] bg-slate-50/90 shadow-sm ring-2 ring-[#112A46]/15'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                    isSelected 
                      ? 'bg-[#112A46] text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 leading-tight">
                        {role.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-snug line-clamp-2">
                      {role.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 text-[#112A46]">
                      <CheckCircle2 size={16} className="fill-[#112A46] text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <input type="hidden" {...register('role')} />
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Full Name */}
          <div className="sm:col-span-1">
            <label htmlFor="name" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none">
                <User size={16} />
              </span>
              <input
                id="name"
                type="text"
                placeholder="Dr. Sarah Jenkins"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border ${
                  errors.name 
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' 
                    : 'border-slate-200 focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/15'
                } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 text-xs font-medium transition-all`}
                {...register('name', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  maxLength: { value: 60, message: 'Name cannot exceed 60 characters' },
                  validate: (val) => {
                    if (!val || !val.trim()) return 'Name cannot be blank';
                    if (!/^[a-zA-Z\s.'-]+$/.test(val.trim())) {
                      return 'Only letters, spaces, hyphens, and apostrophes allowed';
                    }
                    return true;
                  }
                })}
              />
            </div>
            {errors.name && (
              <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="sm:col-span-1">
            <label htmlFor="phone" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none">
                <Phone size={16} />
              </span>
              <input
                id="phone"
                type="tel"
                placeholder="9876543210"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border ${
                  errors.phone 
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' 
                    : 'border-slate-200 focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/15'
                } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 text-xs font-medium transition-all`}
                {...register('phone', {
                  required: 'Phone number is required',
                  validate: (val) => {
                    const cleaned = (val || '').replace(/[\s-]/g, '');
                    if (!/^[6-9]\d{9}$/.test(cleaned)) {
                      return 'Enter a valid 10-digit number starting with 6-9';
                    }
                    return true;
                  }
                })}
              />
            </div>
            {errors.phone && (
              <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="sm:col-span-2">
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
                placeholder="sarah.jenkins@example.com"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border ${
                  errors.email 
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' 
                    : 'border-slate-200 focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/15'
                } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 text-xs font-medium transition-all`}
                {...register('email', {
                  required: 'Email address is required',
                  maxLength: { value: 100, message: 'Email cannot exceed 100 characters' },
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Please enter a valid email address'
                  }
                })}
              />
            </div>
            {errors.email && (
              <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="sm:col-span-1">
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
                onFocus={() => setIsPasswordFocused(true)}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border ${
                  errors.password 
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' 
                    : 'border-slate-200 focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/15'
                } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 text-xs font-medium transition-all`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Must be at least 8 characters' },
                  maxLength: { value: 64, message: 'Cannot exceed 64 characters' },
                  validate: {
                    hasLower: (v) => /[a-z]/.test(v) || 'Needs a lowercase letter',
                    hasUpper: (v) => /[A-Z]/.test(v) || 'Needs an uppercase letter',
                    hasDigit: (v) => /[0-9]/.test(v) || 'Needs a number',
                    hasSpecial: (v) => /[^A-Za-z0-9]/.test(v) || 'Needs a special character',
                  }
                })}
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

          {/* Confirm Password */}
          <div className="sm:col-span-1">
            <label htmlFor="confirmPassword" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none">
                <ShieldCheck size={16} />
              </span>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border ${
                  errors.confirmPassword 
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' 
                    : 'border-slate-200 focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/15'
                } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 text-xs font-medium transition-all`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === passwordValue || 'Passwords do not match'
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.confirmPassword.message}</p>
            )}
          </div>

        </div>

        {/* Live Password Strength Meter & Interactive Requirement Checklist */}
        {(passwordValue || isPasswordFocused) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.25 }}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 overflow-hidden"
          >
            {/* Header with strength bar */}
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-600">Password Strength:</span>
              <span className={strengthTextColors[strengthScore]}>
                {strengthLabels[strengthScore]} ({strengthScore}/4)
              </span>
            </div>

            {/* 4-segment strength bar */}
            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-full rounded-full transition-all duration-300 ${
                    strengthScore >= step ? strengthColors[strengthScore] : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Live Criteria Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
              <div className={`flex items-center gap-1.5 ${passwordCriteria.hasMinLen ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                {passwordCriteria.hasMinLen ? (
                  <CheckCircle2 size={13} className="shrink-0" />
                ) : (
                  <Circle size={13} className="shrink-0" />
                )}
                <span>At least 8 characters</span>
              </div>

              <div className={`flex items-center gap-1.5 ${passwordCriteria.hasMixedCase ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                {passwordCriteria.hasMixedCase ? (
                  <CheckCircle2 size={13} className="shrink-0" />
                ) : (
                  <Circle size={13} className="shrink-0" />
                )}
                <span>Upper & lowercase letters</span>
              </div>

              <div className={`flex items-center gap-1.5 ${passwordCriteria.hasDigit ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                {passwordCriteria.hasDigit ? (
                  <CheckCircle2 size={13} className="shrink-0" />
                ) : (
                  <Circle size={13} className="shrink-0" />
                )}
                <span>At least 1 number</span>
              </div>

              <div className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                {passwordCriteria.hasSpecial ? (
                  <CheckCircle2 size={13} className="shrink-0" />
                ) : (
                  <Circle size={13} className="shrink-0" />
                )}
                <span>At least 1 special symbol</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Accept Terms Checkbox */}
        <div>
          <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-slate-300 text-[#112A46] focus:ring-[#112A46]/20 cursor-pointer h-4 w-4"
              {...register('acceptTerms', { required: 'You must accept the terms & conditions' })}
            />
            <span className="leading-relaxed">
              I agree to PetZoe's{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); showToast("Platform terms & conditions agreement verified.", "info"); }}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); showToast("Platform privacy policy agreement verified.", "info"); }}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
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
          className="w-full py-3.5 rounded-xl font-bold bg-[#112A46] hover:bg-[#1E3A5F] active:scale-[0.99] text-white shadow-lg shadow-[#112A46]/20 hover:shadow-[#112A46]/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs tracking-wide"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Registering Account...
            </>
          ) : (
            <>
              Create PetZoe Account <ArrowRight size={15} />
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
          Or sign up with Google
        </span>
      </div>

      {/* Google Sign Up Button */}
      <div className="flex justify-center w-full">
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
      <div className="text-center pt-1 border-t border-slate-100">
        <p className="text-xs text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline inline-flex items-center gap-0.5">
            Log in here
          </Link>
        </p>
      </div>

    </div>
  );
}
