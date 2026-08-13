import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { Lock, Settings, Loader2, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  
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
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update password", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3 text-slate-800">
        <Settings size={24} className="text-slate-600" />
        <h2 className="text-xl font-bold">Account Settings</h2>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Lock size={18} /> Change Password
        </h3>
        <p className="text-sm text-slate-500 mb-8">
          Ensure your account is using a long, random password to stay secure.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
            <input
              type="password"
              {...register('oldPassword', { required: 'Current password is required' })}
              className={`w-full px-4 py-3 border ${errors.oldPassword ? 'border-red-500' : 'border-slate-200 focus:border-slate-500'} rounded-xl bg-slate-50 focus:bg-white outline-none transition-colors`}
              placeholder="••••••••"
            />
            {errors.oldPassword && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14}/>{errors.oldPassword.message}</p>}
          </div>

          <div className="border-t border-slate-100 pt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
            <input
              type="password"
              {...register('newPassword', { 
                required: 'New password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' }
              })}
              className={`w-full px-4 py-3 border ${errors.newPassword ? 'border-red-500' : 'border-slate-200 focus:border-slate-500'} rounded-xl bg-slate-50 focus:bg-white outline-none transition-colors`}
              placeholder="••••••••"
            />
            {errors.newPassword && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14}/>{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              {...register('confirmPassword', { 
                required: 'Please confirm your new password',
                validate: value => value === newPassword || 'Passwords do not match'
              })}
              className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 focus:border-slate-500'} rounded-xl bg-slate-50 focus:bg-white outline-none transition-colors`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14}/>{errors.confirmPassword.message}</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
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
