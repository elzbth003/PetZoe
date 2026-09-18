import React, { useState } from 'react';
import { X, Heart, Loader2, Home, Award, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import rehomeService from '../../services/rehomeService';

export default function RehomeApplicationModal({ listing, isOpen, onClose, onSuccess, showToast }) {
  const [applicantMessage, setApplicantMessage] = useState('');
  const [livingSituation, setLivingSituation] = useState('');
  const [experienceNotes, setExperienceNotes] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applicantMessage.trim() || !livingSituation.trim() || !contactPhone.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await rehomeService.applyForPet(listing.id, {
        applicantMessage: applicantMessage.trim(),
        livingSituation: livingSituation.trim(),
        experienceNotes: experienceNotes.trim(),
        contactPhone: contactPhone.trim(),
      });
      showToast('Adoption application submitted successfully! The owner will review your profile.', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit adoption application.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-100 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
              <Heart size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Apply to Adopt</h3>
              <p className="text-xs text-slate-500">
                Submit an adoption application for <strong className="text-slate-800">{listing.petName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pet Summary Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3.5">
          <img
            src={listing.petPhotoUrl || (listing.petSpecies === 'Cat' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150' : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150')}
            alt={listing.petName}
            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-800 text-sm">{listing.petName}</h4>
              <span className="font-mono text-[10px] font-bold bg-sky-100/80 text-sky-800 px-2 py-0.5 rounded-md border border-sky-200/60">
                {listing.petCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {listing.petSpecies} • {listing.petBreed} • {listing.petAge} {listing.petAge === 1 ? 'year' : 'years'} old
            </p>
            {listing.requirements && (
              <p className="text-[11px] text-amber-700 mt-1 font-medium bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                Requirements: {listing.requirements}
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5">
              Personal Message to Current Owner <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={applicantMessage}
              onChange={(e) => setApplicantMessage(e.target.value)}
              placeholder="Introduce yourself, your daily routine, and why you would provide a loving and stable environment for this pet..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-rose-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5 flex items-center gap-1.5">
              <Home size={14} className="text-slate-400" />
              Living Situation & Household Environment <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={livingSituation}
              onChange={(e) => setLivingSituation(e.target.value)}
              placeholder="e.g. Single family home with fenced backyard, 2 adults, work from home"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5 flex items-center gap-1.5">
              <Award size={14} className="text-slate-400" />
              Prior Pet Care Experience (Optional)
            </label>
            <input
              type="text"
              value={experienceNotes}
              onChange={(e) => setExperienceNotes(e.target.value)}
              placeholder="e.g. Raised Golden Retrievers for 8 years, familiar with daily training"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5 flex items-center gap-1.5">
              <Phone size={14} className="text-slate-400" />
              Contact Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. (555) 234-5678"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
            />
          </div>

          {/* Data Continuity Notice */}
          <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 text-[11px] text-sky-800 flex items-start gap-2 leading-relaxed">
            <ShieldCheck size={16} className="text-sky-600 shrink-0 mt-0.5" />
            <p>
              If your application is accepted, legal ownership will transfer smoothly. You will inherit the pet's permanent ID (<strong>{listing.petCode}</strong>) along with its complete, continuous clinical history and vaccination records.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} />}
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
