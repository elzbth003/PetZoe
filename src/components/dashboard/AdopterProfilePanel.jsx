import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, PawPrint, Save } from 'lucide-react';
import adopterProfileService from '../../services/adopterProfileService';
import adoptionApplicationService from '../../services/adoptionApplicationService';
import { useToast } from '../../hooks/useToast';

const HOUSING_TYPES = ['OWNED_HOUSE', 'RENTED_HOUSE', 'APARTMENT', 'FARM', 'OTHER'];
const LIVING_ARRANGEMENTS = ['ALONE', 'WITH_FAMILY', 'WITH_ROOMMATES', 'OTHER'];

const APP_STATUS_STYLES = {
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

const WITHDRAWABLE = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_INFORMATION_REQUIRED', 'HOUSE_CHECK_PENDING', 'HOUSE_CHECK_COMPLETED', 'SHELTER_REVIEW'];

const EMPTY_FORM = {
  address: '', housingType: '', livingArrangement: '', existingPets: '', previousPetExperience: '',
  householdMembers: '', petCareExperience: '', veterinaryCarePlan: '', canProvideFoodAndHousing: false,
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdopterProfilePanel() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [govIdFile, setGovIdFile] = useState(null);
  const [addressProofFile, setAddressProofFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchApplications();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await adopterProfileService.getMyProfile();
      if (res.data) {
        setProfile(res.data);
        setForm({
          address: res.data.address || '',
          housingType: res.data.housingType || '',
          livingArrangement: res.data.livingArrangement || '',
          existingPets: res.data.existingPets || '',
          previousPetExperience: res.data.previousPetExperience || '',
          householdMembers: res.data.householdMembers || '',
          petCareExperience: res.data.petCareExperience || '',
          veterinaryCarePlan: res.data.veterinaryCarePlan || '',
          canProvideFoodAndHousing: !!res.data.canProvideFoodAndHousing,
        });
      }
    } catch (err) {
      console.error('Failed to fetch adopter profile', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const res = await adoptionApplicationService.getMyApplications();
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        governmentIdBase64: govIdFile ? await fileToBase64(govIdFile) : undefined,
        addressProofBase64: addressProofFile ? await fileToBase64(addressProofFile) : undefined,
      };
      const res = await adopterProfileService.updateMyProfile(payload);
      setProfile(res.data);
      setGovIdFile(null);
      setAddressProofFile(null);
      showToast('Adopter profile saved', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async (animalId) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await adoptionApplicationService.withdraw(animalId);
      showToast('Application withdrawn', 'success');
      fetchApplications();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to withdraw application', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Adopter Profile</h2>
          {profile?.complete ? (
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-md">
              <CheckCircle size={12} /> Complete
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-md">
              <XCircle size={12} /> Incomplete
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Complete this once — it's reused every time you apply to adopt an animal.
        </p>

        {loading ? (
          <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div></div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <textarea required placeholder="Address" value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Housing Type</label>
                <select required value={form.housingType} onChange={e => setForm({ ...form, housingType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150">
                  <option value="" disabled>Select</option>
                  {HOUSING_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Living Arrangement</label>
                <select required value={form.livingArrangement} onChange={e => setForm({ ...form, livingArrangement: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150">
                  <option value="" disabled>Select</option>
                  {LIVING_ARRANGEMENTS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>

            <textarea placeholder="Do you have existing pets? Describe them." value={form.existingPets}
              onChange={e => setForm({ ...form, existingPets: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
            <textarea placeholder="Previous pet-care experience" value={form.previousPetExperience}
              onChange={e => setForm({ ...form, previousPetExperience: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
            <input placeholder="Household members (e.g. 2 adults, 1 child)" value={form.householdMembers}
              onChange={e => setForm({ ...form, householdMembers: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150" />
            <textarea placeholder="General pet-care experience" value={form.petCareExperience}
              onChange={e => setForm({ ...form, petCareExperience: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
            <textarea placeholder="Veterinary care plan (e.g. regular vet, clinic)" value={form.veterinaryCarePlan}
              onChange={e => setForm({ ...form, veterinaryCarePlan: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.canProvideFoodAndHousing}
                onChange={e => setForm({ ...form, canProvideFoodAndHousing: e.target.checked })} />
              I confirm I am able to provide adequate food, housing, and care for an adopted animal.
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Government ID {profile?.hasGovernmentId && <span className="text-emerald-600">(uploaded)</span>}
                </label>
                <input type="file" accept="image/*,.pdf" onChange={e => setGovIdFile(e.target.files?.[0] || null)} className="text-sm text-slate-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Address Proof {profile?.hasAddressProof && <span className="text-emerald-600">(uploaded)</span>}
                </label>
                <input type="file" accept="image/*,.pdf" onChange={e => setAddressProofFile(e.target.files?.[0] || null)} className="text-sm text-slate-600" />
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">My Adoption Applications</h2>
        {loadingApps ? (
          <div className="py-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div></div>
        ) : applications.length === 0 ? (
          <p className="text-sm text-slate-500">
            No applications yet. <Link to="/adopt" className="text-primary-600 font-bold hover:underline">Browse adoptable animals</Link>.
          </p>
        ) : (
          <div className="space-y-3">
            {applications.map(app => (
              <div key={app.id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
                  {app.primaryPhotoBase64 ? <img src={app.primaryPhotoBase64} alt={app.animalName} className="w-full h-full object-cover" /> : <PawPrint size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{app.animalName || 'Unnamed'} <span className="text-slate-400 font-normal">· {app.animalCode}</span></p>
                  <p className="text-xs text-slate-500">{app.shelterName}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${APP_STATUS_STYLES[app.status] || 'bg-slate-100 text-slate-600'}`}>
                  {app.status.replace(/_/g, ' ')}
                </span>
                {WITHDRAWABLE.includes(app.status) && (
                  <button onClick={() => handleWithdraw(app.animalId)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-700 px-2">
                    Withdraw
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
