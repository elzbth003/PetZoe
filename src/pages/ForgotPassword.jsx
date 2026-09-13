import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../hooks/useToast';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSent(true);
      showToast("Recovery instructions sent to your email!", "success");
    } catch (err) {
      showToast(err.message || "Failed to send recovery email. Please check your address.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="text-center lg:text-left space-y-1">
        <h2 className="font-display font-black text-2xl text-slate-900">Reset Password</h2>
        <p className="text-xs text-slate-500 font-medium">
          Enter your email and we'll send you instructions to reset your password.
        </p>
      </div>

      {isSent ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex justify-center text-emerald-500"
          >
            <CheckCircle size={48} />
          </motion.div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Check your email</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We've sent a password recovery link to your email. Please follow the instructions to secure your account.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 hover:underline pt-2"
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email input */}
          <div>
            <label htmlFor="email" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Mail size={16} />
              </span>
              <input
                id="email"
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/15 hover:shadow-primary-600/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Sending Recovery Instructions...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

          {/* Navigation Back */}
          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>

        </form>
      )}

    </div>
  );
}
