import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import animalService from '../../services/animalService';
import { useToast } from '../../hooks/useToast';

const LISTING_STATUS_STYLES = {
  NOT_SUBMITTED: 'bg-slate-100 text-slate-600',
  PENDING: 'bg-amber-50 text-amber-600',
  UNDER_REVIEW: 'bg-amber-50 text-amber-600',
  APPROVED: 'bg-emerald-50 text-emerald-600',
  REJECTED: 'bg-rose-50 text-rose-600',
  CHANGES_REQUIRED: 'bg-rose-50 text-rose-600',
};

const EDITABLE_ANIMAL_STATUSES = ['IN_SHELTER_CARE', 'AWAITING_DOCUMENTS', 'ON_HOLD', 'MEDICAL_REVIEW', 'UNDER_MEDICAL_CARE'];
const SIZE_OPTIONS = ['UNKNOWN', 'SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'];

export default function AdoptionListingForm({ animalId, animalStatus, listing, onUpdated }) {
  const [form, setForm] = useState({
    size: 'UNKNOWN', personality: '', specialCareRequirements: '', adoptionFee: '', listingDescription: '',
  });
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setForm({
      size: listing?.size || 'UNKNOWN',
      personality: listing?.personality || '',
      specialCareRequirements: listing?.specialCareRequirements || '',
      adoptionFee: listing?.adoptionFee ?? '',
      listingDescription: listing?.listingDescription || '',
    });
  }, [listing]);

  const listingStatus = listing?.status || 'NOT_SUBMITTED';
  const canEdit = EDITABLE_ANIMAL_STATUSES.includes(animalStatus)
    && ['NOT_SUBMITTED', 'REJECTED', 'CHANGES_REQUIRED'].includes(listingStatus);
  const canSubmit = canEdit && listing?.personality && listing?.listingDescription;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...form, adoptionFee: form.adoptionFee === '' ? null : parseFloat(form.adoptionFee) };
      const res = await animalService.updateListing(animalId, payload);
      onUpdated(res.data);
      showToast('Listing saved', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save listing', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await animalService.submitListing(animalId);
      onUpdated(res.data);
      showToast('Listing submitted for admin review', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit listing', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-slate-800">Adoption Listing</h4>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${LISTING_STATUS_STYLES[listingStatus] || 'bg-slate-100 text-slate-600'}`}>
          {listingStatus.replace(/_/g, ' ')}
        </span>
      </div>

      {(listingStatus === 'REJECTED' || listingStatus === 'CHANGES_REQUIRED') && listing?.reviewerNotes && (
        <div className="mb-3 text-sm text-rose-600 bg-rose-50 p-3 rounded-xl">
          Admin feedback: {listing.reviewerNotes}
        </div>
      )}

      {!EDITABLE_ANIMAL_STATUSES.includes(animalStatus) && listingStatus === 'NOT_SUBMITTED' && (
        <p className="text-sm text-slate-500">
          Complete the initial assessment and set the animal's status to In Shelter Care before drafting a listing.
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-2">
        <fieldset disabled={!canEdit} className="space-y-2 disabled:opacity-60">
          <select value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150">
            {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s === 'UNKNOWN' ? 'Size (select)' : s.replace(/_/g, ' ')}</option>)}
          </select>
          <textarea placeholder="Personality (for adopters)" value={form.personality}
            onChange={e => setForm({ ...form, personality: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
          <textarea placeholder="Special care requirements" value={form.specialCareRequirements}
            onChange={e => setForm({ ...form, specialCareRequirements: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
          <input type="number" step="0.01" min="0" placeholder="Adoption fee (optional)" value={form.adoptionFee}
            onChange={e => setForm({ ...form, adoptionFee: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150" />
          <textarea placeholder="Listing description (shown publicly)" value={form.listingDescription}
            onChange={e => setForm({ ...form, listingDescription: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150 h-20 resize-none" />
        </fieldset>

        {canEdit && (
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-slate-900 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Listing'}
            </button>
            <button type="button" onClick={handleSubmit} disabled={!canSubmit || submitting}
              className="flex items-center gap-1.5 bg-primary-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
              <Send size={14} /> {submitting ? 'Submitting...' : 'Submit for Admin Review'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
