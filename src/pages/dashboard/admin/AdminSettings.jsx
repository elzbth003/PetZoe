import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { Lock, Settings, Loader2, AlertCircle, X } from 'lucide-react';

export default function AdminSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await adminApi.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      showToast("Password updated successfully", "success");
      reset();
      // Optionally close the modal after success
      // navigate('/dashboard/admin');
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update password", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      {/* Modal Container */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-slate-100 max-w-lg w-full relative animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={() => navigate('/dashboard/admin')}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          title="Close Settings"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pr-12">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Account Settings</h2>
            <p className="text-sm text-slate-500">Update your security credentials</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Password</label>
            <input
              type="password"
              {...register('oldPassword', { required: 'Current password is required' })}
              className={`w-full px-4 py-3 border ${errors.oldPassword ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-slate-500'} rounded-xl bg-slate-50 focus:bg-white outline-none transition-colors text-sm`}
              placeholder="••••••••"
            />
            {errors.oldPassword && <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle size={14}/>{errors.oldPassword.message}</p>}
          </div>

          <div className="border-t border-slate-100 pt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
            <input
              type="password"
              {...register('newPassword', { 
                required: 'New password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' }
              })}
              className={`w-full px-4 py-3 border ${errors.newPassword ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-slate-500'} rounded-xl bg-slate-50 focus:bg-white outline-none transition-colors text-sm`}
              placeholder="••••••••"
            />
            {errors.newPassword && <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle size={14}/>{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              {...register('confirmPassword', { 
                required: 'Please confirm your new password',
                validate: value => value === newPassword || 'Passwords do not match'
              })}
              className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-slate-500'} rounded-xl bg-slate-50 focus:bg-white outline-none transition-colors text-sm`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle size={14}/>{errors.confirmPassword.message}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
