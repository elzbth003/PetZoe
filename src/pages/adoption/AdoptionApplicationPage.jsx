import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PawPrint, Send, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import adoptionPublicService from '../../services/adoptionPublicService';
import adopterProfileService from '../../services/adopterProfileService';
import adoptionApplicationService from '../../services/adoptionApplicationService';
import { useToast } from '../../hooks/useToast';

const STATUS_STYLES = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SUBMITTED: 'bg-amber-50 text-amber-600',
  UNDER_REVIEW: 'bg-amber-50 text-amber-600',
  ADDITIONAL_INFORMATION_REQUIRED: 'bg-amber-50 text-amber-600',
  HOUSE_CHECK_PENDING: 'bg-indigo-50 text-indigo-600',
  HOUSE_CHECK_COMPLETED: 'bg-indigo-50 text-indigo-600',
  SHELTER_REVIEW: 'bg-indigo-50 text-indigo-600',
  APPROVED: 'bg-emerald-50 text-emerald-600',
  REJECTED: 'bg-rose-50 text-rose-600',
  WITHDRAWN: 'bg-slate-100 text-slate-500',
  COMPLETED: 'bg-emerald-50 text-emerald-600',
};

const EDITABLE_STATUSES = ['DRAFT', 'ADDITIONAL_INFORMATION_REQUIRED'];
const WITHDRAWABLE_STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_INFORMATION_REQUIRED', 'HOUSE_CHECK_PENDING', 'HOUSE_CHECK_COMPLETED', 'SHELTER_REVIEW'];

export default function AdoptionApplicationPage() {
  const { id } = useParams();
  const { showToast } = useToast();

  const [animal, setAnimal] = useState(null);
  const [profile, setProfile] = useState(null);
  const [application, setApplication] = useState(null);
  const [form, setForm] = useState({ reasonForAdoption: '', petCarePlan: '', veterinaryCarePlanNotes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [animalRes, profileRes] = await Promise.all([
        adoptionPublicService.getAnimalDetail(id),
        adopterProfileService.getMyProfile(),
      ]);
      setAnimal(animalRes.data);
      setProfile(profileRes.data);

      try {
        const appRes = await adoptionApplicationService.getMyApplication(id);
        setApplication(appRes.data);
        setForm({
          reasonForAdoption: appRes.data.reasonForAdoption || '',
          petCarePlan: appRes.data.petCarePlan || '',
          veterinaryCarePlanNotes: appRes.data.veterinaryCarePlanNotes || '',
        });
      } catch {
        // No application yet — fine, start with an empty draft form.
      }
    } catch (err) {
      showToast('Failed to load this animal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = !application || EDITABLE_STATUSES.includes(application.status);
  const profileComplete = !!profile?.complete;

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await adoptionApplicationService.saveDraft(id, form);
      setApplication(res.data);
      showToast('Draft saved', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save draft', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await adoptionApplicationService.saveDraft(id, form);
      const res = await adoptionApplicationService.submit(id);
      setApplication(res.data);
      showToast('Application submitted!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      setWithdrawing(true);
      const res = await adoptionApplicationService.withdraw(id);
      setApplication(res.data);
      showToast('Application withdrawn', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to withdraw application', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-primary-600"></div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-slate-500">This animal could not be found.</p>
        <Link to="/adopt" className="text-primary-600 hover:underline">Browse adoptable animals</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-6">

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
            {animal.primaryPhotoBase64 ? <img src={animal.primaryPhotoBase64} alt={animal.name} className="w-full h-full object-cover" /> : <PawPrint size={24} />}
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-slate-800">Apply to Adopt {animal.name || 'this animal'}</h1>
            <p className="text-slate-500 text-sm">{animal.species}{animal.breed ? ` • ${animal.breed}` : ''} • {animal.shelter?.name}</p>
          </div>
        </div>

        {application && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Application Status</p>
              <span className={`inline-block mt-1 text-xs font-bold uppercase px-2.5 py-1 rounded ${STATUS_STYLES[application.status] || 'bg-slate-100 text-slate-600'}`}>
                {application.status.replace(/_/g, ' ')}
              </span>
            </div>
            {WITHDRAWABLE_STATUSES.includes(application.status) && application.status !== 'DRAFT' && (
              <button onClick={handleWithdraw} disabled={withdrawing}
                className="text-sm font-bold text-rose-500 hover:text-rose-700 disabled:opacity-50">
                {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
              </button>
            )}
          </div>
        )}

        {!profileComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800">Complete your adopter profile first</p>
              <p className="text-sm text-amber-700 mt-1">
                Your address, housing type, living arrangement, and confirmation of ability to provide care are required before you can submit an application.
              </p>
              <Link to="/dashboard/owner" onClick={() => sessionStorage.setItem('petzoe_owner_tab', 'Adoptions')}
                className="inline-block mt-2 text-sm font-bold text-amber-800 hover:underline">
                Go to My Adopter Profile →
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Application Details</h2>
          <form onSubmit={handleSaveDraft} className="space-y-4">
            <fieldset disabled={!canEdit} className="space-y-4 disabled:opacity-60">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reason for Adoption</label>
                <textarea required placeholder="Why do you want to adopt this animal?" value={form.reasonForAdoption}
                  onChange={e => setForm({ ...form, reasonForAdoption: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-24 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Pet-Care Plan</label>
                <textarea placeholder="How will you care for this specific animal day to day?" value={form.petCarePlan}
                  onChange={e => setForm({ ...form, petCarePlan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-20 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Veterinary Care Plan Notes</label>
                <textarea placeholder="Any specific vet-care notes for this animal (optional)" value={form.veterinaryCarePlanNotes}
                  onChange={e => setForm({ ...form, veterinaryCarePlanNotes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-20 resize-none" />
              </div>
            </fieldset>

            {canEdit && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-200 disabled:opacity-50">
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button type="button" onClick={handleSubmit} disabled={submitting || !profileComplete}
                  title={!profileComplete ? 'Complete your adopter profile first' : undefined}
                  className="flex items-center justify-center gap-2 bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50">
                  <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            )}

            {!canEdit && application?.status === 'APPROVED' && (
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm pt-2">
                <CheckCircle size={16} /> Your application has been approved!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
