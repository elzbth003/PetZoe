import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User, Mail, Phone, MapPin, Lock, Trash2, Camera, Save,
  Loader2, AlertTriangle, Eye, EyeOff, CheckCircle, X, Edit3
} from 'lucide-react';
import { profileService } from '../../services/profileService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  address: z.string().optional(),
  profileImage: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  specialization: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ProfileManagement() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const { showToast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors }
  } = useForm({ resolver: zodResolver(profileSchema) });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors }
  } = useForm({ resolver: zodResolver(passwordSchema) });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      resetProfile({
        name: data.name || '',
        phone: data.phone || '',
        bio: data.bio || '',
        address: data.address || '',
        profileImage: data.profileImage || '',
        specialization: data.specialization || '',
      });
    } catch {
      showToast('Failed to load profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onProfileUpdate = async (data) => {
    setIsSubmitting(true);
    try {
      const updated = await profileService.updateProfile(data);
      setProfile(updated);
      // Update stored session user info
      const stored = JSON.parse(sessionStorage.getItem('petzoe_user') || '{}');
      sessionStorage.setItem('petzoe_user', JSON.stringify({ ...stored, name: updated.name, profileImage: updated.profileImage }));
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordChange = async (data) => {
    setIsSubmitting(true);
    try {
      await profileService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      resetPassword();
      showToast('Password changed successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      showToast('Please type DELETE to confirm.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await profileService.deleteAccount();
      showToast('Account deleted. Goodbye!', 'info');
      logout();
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete account.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: 'info', label: 'Personal Info' },
    { id: 'password', label: 'Change Password' },
    { id: 'danger', label: 'Danger Zone' },
  ];

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1E3A5F]" size={36} />
      </div>
    );
  }

  const getButtonClass = (sectionId, isActive) => {
    if (isActive) {
      if (sectionId === 'danger') return 'bg-rose-600 text-white shadow-sm';
      return 'bg-white text-slate-800 shadow-sm';
    } else {
      if (sectionId === 'danger') return 'text-rose-500 hover:bg-rose-50';
      return 'text-slate-500 hover:text-slate-700';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F]/80 rounded-3xl p-6 text-white flex items-center gap-5 shadow-lg">
        <div className="relative shrink-0">
          {profile?.profileImage ? (
            <img
              src={profile.profileImage}
              alt={profile.name}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center">
              <User size={32} className="text-white/70" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#38BDF8] flex items-center justify-center shadow-sm">
            <Camera size={10} className="text-white" />
          </div>
        </div>
        <div className="text-left space-y-1 flex-1 min-w-0">
          <h2 className="font-display font-black text-xl truncate">{profile?.name}</h2>
          <p className="text-slate-300 text-xs font-semibold truncate">{profile?.email}</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold text-sky-300">
            {profile?.role}
          </span>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${getButtonClass(s.id, activeSection === s.id)}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Personal Info Section */}
      {activeSection === 'info' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"
        >
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-5 text-left">
            <Edit3 size={16} className="text-[#38BDF8]" /> Edit Personal Information
          </h3>
          <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border ${profileErrors.name ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:border-[#38BDF8]`}
                  {...registerProfile('name')}
                />
              </div>
              {profileErrors.name && <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{profileErrors.name.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Phone Number</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-[#38BDF8]"
                  {...registerProfile('phone')}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Address</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="City, State, Country"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-[#38BDF8]"
                  {...registerProfile('address')}
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Bio <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea
                rows={3}
                placeholder="Tell us a bit about yourself..."
                className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border ${profileErrors.bio ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:border-[#38BDF8] resize-none`}
                {...registerProfile('bio')}
              />
              {profileErrors.bio && <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{profileErrors.bio.message}</p>}
            </div>

            {/* Profile Image */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Profile Picture URL <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="relative">
                <Camera size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border ${profileErrors.profileImage ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:border-[#38BDF8]`}
                  {...registerProfile('profileImage')}
                />
              </div>
              {profileErrors.profileImage && <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{profileErrors.profileImage.message}</p>}
            </div>

            {profile?.role === 'Veterinarian' && (
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Small Animals, Surgery"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-[#38BDF8]"
                  {...registerProfile('specialization')}
                />
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#1A3354] text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Change Password Section */}
      {activeSection === 'password' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"
        >
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-5 text-left">
            <Lock size={16} className="text-[#38BDF8]" /> Change Password
          </h3>
          <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Current Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border ${passwordErrors.currentPassword ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:border-[#38BDF8]`}
                  {...registerPassword('currentPassword')}
                />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                  {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {passwordErrors.currentPassword && <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{passwordErrors.currentPassword.message}</p>}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">New Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border ${passwordErrors.newPassword ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:border-[#38BDF8]`}
                  {...registerPassword('newPassword')}
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                  {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {passwordErrors.newPassword && <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{passwordErrors.newPassword.message}</p>}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Confirm New Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border ${passwordErrors.confirmPassword ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:border-[#38BDF8]`}
                  {...registerPassword('confirmPassword')}
                />
              </div>
              {passwordErrors.confirmPassword && <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{passwordErrors.confirmPassword.message}</p>}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#1A3354] text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Update Password
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Danger Zone Section */}
      {activeSection === 'danger' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm"
        >
          <h3 className="font-bold text-rose-700 text-sm flex items-center gap-2 mb-2 text-left">
            <AlertTriangle size={16} /> Danger Zone
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed text-left mb-5">
            Deleting your account is permanent. All your pets, appointments, and data will be removed immediately and cannot be recovered.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Trash2 size={14} /> Delete My Account
            </button>
          ) : (
            <div className="space-y-4 bg-rose-50 border border-rose-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-rose-800 text-left">
                Type <span className="font-mono bg-rose-100 px-1 rounded">DELETE</span> below to confirm:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-rose-200 text-slate-800 text-xs font-mono font-medium focus:outline-none focus:border-rose-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <X size={12} /> Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isSubmitting || deleteInput !== 'DELETE'}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
                >
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
