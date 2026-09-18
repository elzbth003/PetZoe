import React, { useState } from 'react';
import { X, HeartHandshake, Loader2, Info, MapPin, FileText, CheckCircle2 } from 'lucide-react';
import rehomeService from '../../services/rehomeService';

export default function RehomePetModal({ pet, isOpen, onClose, onSuccess, showToast }) {
  const [title, setTitle] = useState(`Loving forever home for ${pet?.name || 'my pet'}`);
  const [reason, setReason] = useState('');
  const [requirements, setRequirements] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !pet) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Please provide a reason for rehoming.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await rehomeService.createListing({
        petId: pet.id,
        title: title.trim(),
        reason: reason.trim(),
        requirements: requirements.trim(),
        city: city.trim()
      });
      showToast(`${pet.name} is now listed on the Community Rehoming Board!`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to list pet for rehoming.', 'error');
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
            <div className="h-11 w-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
              <HeartHandshake size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Find a New Home</h3>
              <p className="text-xs text-slate-500">
                Post <strong className="text-slate-800">{pet.name}</strong> to the community rehoming board
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
            src={pet.photoUrl || (pet.species === 'Cat' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150' : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150')}
            alt={pet.name}
            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-800 text-sm">{pet.name}</h4>
              <span className="font-mono text-[10px] font-bold bg-sky-100/80 text-sky-800 px-2 py-0.5 rounded-md border border-sky-200/60">
                {pet.petCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {pet.species} • {pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'} old
            </p>
          </div>
        </div>

        {/* Notice Info */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3.5 text-xs text-amber-900 flex gap-2.5 items-start">
          <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-semibold text-amber-950">How Request-Based Rehoming Works:</p>
            <p className="text-[11px] text-amber-800">
              Your pet will be visible on the public Rehoming Board. Interested adopters will submit detailed applications describing their home and lifestyle. You retain full ownership and decide who to accept. When you accept an applicant, ownership and medical records safely transfer in one atomic transaction.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5">
              Listing Headline <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Caring home wanted for active Golden Retriever"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5">
              Reason for Rehoming <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you need to find a new home for this pet (e.g. moving abroad, family allergies, demanding schedule)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5">
              Ideal Home & Adopter Requirements (Optional)
            </label>
            <textarea
              rows={2}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="e.g. Needs fenced yard, experienced dog owner, great with other cats, quiet household..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5">
              City / Location
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <HeartHandshake size={14} />}
              Publish Rehoming Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
