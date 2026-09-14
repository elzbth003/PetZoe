import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  PawPrint,
  Save,
  Home,
  Building2,
  Trees,
  MapPin,
  User,
  Users,
  UserCheck,
  HeartHandshake,
  FileText,
  Upload,
  ShieldCheck,
  Key,
  Dog,
  Heart,
  Stethoscope,
  Info,
  Sparkles,
} from 'lucide-react';
import adopterProfileService from '../../services/adopterProfileService';
import adoptionApplicationService from '../../services/adoptionApplicationService';
import { useToast } from '../../hooks/useToast';
import CustomSelect from '../ui/CustomSelect';

const HOUSING_OPTIONS = [
  {
    value: 'OWNED_HOUSE',
    label: 'Owned House',
    description: 'Independent house with private yard or outdoor space',
    icon: Home,
    badge: 'Popular',
  },
  {
    value: 'RENTED_HOUSE',
    label: 'Rented House',
    description: 'Rental property with landlord pet permission verified',
    icon: Key,
  },
  {
    value: 'APARTMENT',
    label: 'Apartment / Flat',
    description: 'Gated community, condominium, or high-rise unit',
    icon: Building2,
  },
  {
    value: 'FARM',
    label: 'Farm / Acreage',
    description: 'Spacious rural land, farmhouse, or open acreage',
    icon: Trees,
  },
  {
    value: 'OTHER',
    label: 'Other Residence',
    description: 'Alternate residential dwelling or living space',
    icon: MapPin,
  },
];

const LIVING_ARRANGEMENT_OPTIONS = [
  {
    value: 'ALONE',
    label: 'Live Alone',
    description: 'Single occupant home with dedicated individual care',
    icon: User,
  },
  {
    value: 'WITH_FAMILY',
    label: 'With Family',
    description: 'Living with spouse, children, or elderly parents',
    icon: Users,
    badge: 'Recommended',
  },
  {
    value: 'WITH_ROOMMATES',
    label: 'With Roommates / Flatmates',
    description: 'Shared co-living apartment with housemates',
    icon: UserCheck,
  },
  {
    value: 'OTHER',
    label: 'Other Arrangement',
    description: 'Custom community or alternate household setup',
    icon: HeartHandshake,
  },
];

const APP_STATUS_STYLES = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SUBMITTED: 'bg-amber-50 text-amber-700 border border-amber-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border border-amber-200',
  ADDITIONAL_INFORMATION_REQUIRED: 'bg-amber-50 text-amber-700 border border-amber-200',
  HOUSE_CHECK_PENDING: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  HOUSE_CHECK_COMPLETED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  SHELTER_REVIEW: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border border-rose-200',
  WITHDRAWN: 'bg-slate-100 text-slate-500 border border-slate-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const WITHDRAWABLE = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'ADDITIONAL_INFORMATION_REQUIRED',
  'HOUSE_CHECK_PENDING',
  'HOUSE_CHECK_COMPLETED',
  'SHELTER_REVIEW',
];

const EMPTY_FORM = {
  address: '',
  housingType: '',
  livingArrangement: '',
  existingPets: '',
  previousPetExperience: '',
  householdMembers: '',
  petCareExperience: '',
  veterinaryCarePlan: '',
  canProvideFoodAndHousing: false,
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

    if (!form.housingType) {
      showToast('Please select your housing type', 'error');
      return;
    }
    if (!form.livingArrangement) {
      showToast('Please select your living arrangement', 'error');
      return;
    }

    const xssPattern = /[<>]/;
    const fieldsToCheck = [
      'address', 'existingPets', 'previousPetExperience', 
      'householdMembers', 'petCareExperience', 'veterinaryCarePlan'
    ];
    for (const field of fieldsToCheck) {
      if (form[field] && xssPattern.test(form[field])) {
        showToast('Inputs cannot contain HTML characters (< or >)', 'error');
        return;
      }
    }

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
      showToast('Adopter profile saved successfully', 'success');
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
    <div className="space-y-8 max-w-4xl">
      {/* Profile Card */}
      <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Subtle decorative gradient background */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-primary-50/50 via-teal-50/20 to-transparent rounded-bl-full pointer-events-none" />

        {/* Card Header */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold shadow-sm">
                <HeartHandshake size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  Adopter Profile
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Complete this profile once — it is verified and reused every time you apply for adoption.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile?.complete ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full shadow-xs">
                <CheckCircle size={14} className="text-emerald-600" /> Profile Complete
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700 text-xs font-bold bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-full shadow-xs">
                <XCircle size={14} className="text-amber-600" /> Incomplete
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-9 w-9 border-3 border-t-transparent border-primary-600"></div>
            <p className="text-xs text-slate-400 font-medium">Loading your profile data...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: Residence & Household Structure */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Home size={14} className="text-primary-500" />
                <span>1. Residence & Household Context</span>
              </div>

              {/* Address Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <MapPin size={14} className="text-primary-500" />
                    Residential Address
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Street, house number, area & city</span>
                </div>
                <textarea
                  required
                  placeholder="e.g. 42 Palm Meadows, Outer Ring Road, Whitefield, Bangalore - 560066"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-slate-50/90 hover:bg-white focus:bg-white 
                    border border-slate-200/90 focus:border-primary-500 
                    rounded-2xl p-4 text-sm text-slate-800 outline-none 
                    focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 
                    h-20 resize-none shadow-xs placeholder:text-slate-400"
                />
              </div>

              {/* Enhanced Custom Dropdowns: Housing Type & Living Arrangement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CustomSelect
                  label="Housing Type"
                  icon={Home}
                  required
                  value={form.housingType}
                  onChange={(val) => setForm({ ...form, housingType: val })}
                  options={HOUSING_OPTIONS}
                  placeholder="Select housing type..."
                  helperText="Helps rescue shelters assess adequate living and playing space"
                />

                <CustomSelect
                  label="Living Arrangement"
                  icon={Users}
                  required
                  value={form.livingArrangement}
                  onChange={(val) => setForm({ ...form, livingArrangement: val })}
                  options={LIVING_ARRANGEMENT_OPTIONS}
                  placeholder="Select living arrangement..."
                  helperText="Ensures temperament matching with children and co-habitants"
                />
              </div>

              {/* Household members */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <Users size={14} className="text-primary-500" />
                    Household Members & Family Dynamics
                  </label>
                  <span className="text-[11px] text-slate-400">Number of adults, children, seniors</span>
                </div>
                <input
                  placeholder="e.g. 2 adults, 1 child (age 8), elderly parent"
                  value={form.householdMembers}
                  onChange={(e) => setForm({ ...form, householdMembers: e.target.value })}
                  className="w-full bg-slate-50/90 hover:bg-white focus:bg-white 
                    border border-slate-200/90 focus:border-primary-500 
                    rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none 
                    focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 shadow-xs placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Section 2: Pet Experience & Care Commitment */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
                <Dog size={14} className="text-primary-500" />
                <span>2. Pet Care Experience & Care Plan</span>
              </div>

              {/* Existing pets */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  <Dog size={14} className="text-primary-500" />
                  Existing Pets in Household
                </label>
                <textarea
                  placeholder="e.g. 1 senior Golden Retriever (7 years, friendly, vaccinated), 1 indoor cat"
                  value={form.existingPets}
                  onChange={(e) => setForm({ ...form, existingPets: e.target.value })}
                  className="w-full bg-slate-50/90 hover:bg-white focus:bg-white 
                    border border-slate-200/90 focus:border-primary-500 
                    rounded-2xl p-4 text-sm text-slate-800 outline-none 
                    focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 
                    h-20 resize-none shadow-xs placeholder:text-slate-400"
                />
              </div>

              {/* Previous & General pet-care experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    <Heart size={14} className="text-primary-500" />
                    Previous Pet Experience
                  </label>
                  <textarea
                    placeholder="Describe species, breeds, and years of experience raising pets..."
                    value={form.previousPetExperience}
                    onChange={(e) => setForm({ ...form, previousPetExperience: e.target.value })}
                    className="w-full bg-slate-50/90 hover:bg-white focus:bg-white 
                      border border-slate-200/90 focus:border-primary-500 
                      rounded-2xl p-4 text-sm text-slate-800 outline-none 
                      focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 
                      h-24 resize-none shadow-xs placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    <PawPrint size={14} className="text-primary-500" />
                    Daily Pet-Care Routine
                  </label>
                  <textarea
                    placeholder="Daily walking schedule, exercise, dietary plans, feeding times..."
                    value={form.petCareExperience}
                    onChange={(e) => setForm({ ...form, petCareExperience: e.target.value })}
                    className="w-full bg-slate-50/90 hover:bg-white focus:bg-white 
                      border border-slate-200/90 focus:border-primary-500 
                      rounded-2xl p-4 text-sm text-slate-800 outline-none 
                      focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 
                      h-24 resize-none shadow-xs placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Veterinary care plan */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  <Stethoscope size={14} className="text-primary-500" />
                  Veterinary Care & Emergency Coverage
                </label>
                <textarea
                  placeholder="e.g. Registered with City Veterinary Polyclinic; emergency 24/7 clinic 10 minutes away."
                  value={form.veterinaryCarePlan}
                  onChange={(e) => setForm({ ...form, veterinaryCarePlan: e.target.value })}
                  className="w-full bg-slate-50/90 hover:bg-white focus:bg-white 
                    border border-slate-200/90 focus:border-primary-500 
                    rounded-2xl p-4 text-sm text-slate-800 outline-none 
                    focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 
                    h-20 resize-none shadow-xs placeholder:text-slate-400"
                />
              </div>

              {/* Enhanced Interactive Commitment Toggle */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  form.canProvideFoodAndHousing
                    ? 'bg-emerald-50/80 border-emerald-300 ring-4 ring-emerald-500/10 text-emerald-950 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200/90 hover:border-slate-300 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.canProvideFoodAndHousing}
                  onChange={(e) =>
                    setForm({ ...form, canProvideFoodAndHousing: e.target.checked })
                  }
                  className="mt-0.5 h-5 w-5 rounded-lg text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck
                      size={15}
                      className={
                        form.canProvideFoodAndHousing ? 'text-emerald-600' : 'text-slate-400'
                      }
                    />
                    Care & Welfare Commitment Confirmation
                    <span className="text-rose-500 font-bold">*</span>
                  </div>
                  <p className="text-slate-500 mt-1 leading-relaxed">
                    I confirm that I am financially and physically capable of providing adequate high-quality nutrition, safe indoor housing, routine preventative medical care, and lifelong companionship for an adopted animal.
                  </p>
                </div>
              </label>
            </div>

            {/* Section 3: Verification Documents */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
                <FileText size={14} className="text-primary-500" />
                <span>3. Verification Documents (Optional)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Government ID */}
                <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                      <FileText size={14} className="text-primary-500" /> Government Photo ID
                    </span>
                    {profile?.hasGovernmentId && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Uploaded
                      </span>
                    )}
                  </div>
                  <label className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary-400 text-slate-600 text-xs transition-colors">
                    <Upload size={14} className="text-primary-500 shrink-0" />
                    <span className="truncate">
                      {govIdFile ? govIdFile.name : 'Choose file (JPG, PNG or PDF)...'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setGovIdFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Address Proof */}
                <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                      <FileText size={14} className="text-primary-500" /> Address Proof
                    </span>
                    {profile?.hasAddressProof && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Uploaded
                      </span>
                    )}
                  </div>
                  <label className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary-400 text-slate-600 text-xs transition-colors">
                    <Upload size={14} className="text-primary-500 shrink-0" />
                    <span className="truncate">
                      {addressProofFile ? addressProofFile.name : 'Choose file (JPG, PNG or PDF)...'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setAddressProofFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2.5 
                  bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 
                  text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-primary-600/25 
                  transition-all duration-200 hover:shadow-primary-600/35 active:scale-[0.99] 
                  disabled:opacity-50 cursor-pointer text-sm"
              >
                <Save size={18} />
                <span>{saving ? 'Saving Profile...' : 'Save Adopter Profile'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Applications Section */}
      <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <PawPrint size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">My Adoption Applications</h2>
              <p className="text-xs text-slate-400">Track and manage your submitted animal adoption applications</p>
            </div>
          </div>
          {applications.length > 0 && (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {applications.length} Application{applications.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loadingApps ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-primary-600"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <PawPrint size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No applications yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Once you complete your adopter profile, you can browse verified rescue animals and apply directly.
            </p>
            <Link
              to="/adopt"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl mt-3 transition-colors"
            >
              Browse Adoptable Animals &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 hover:bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-4 transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300 shadow-2xs">
                    {app.primaryPhotoBase64 ? (
                      <img
                        src={app.primaryPhotoBase64}
                        alt={app.animalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PawPrint size={22} className="text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-sm truncate">
                      {app.animalName || 'Unnamed'}{' '}
                      <span className="text-slate-400 font-normal text-xs">· {app.animalCode}</span>
                    </p>
                    <p className="text-xs text-slate-500 font-medium">{app.shelterName}</p>
                    {app.submittedAt && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Applied on {new Date(app.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span
                    className={`text-[11px] font-bold uppercase px-3 py-1 rounded-full ${
                      APP_STATUS_STYLES[app.status] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {app.status.replace(/_/g, ' ')}
                  </span>
                  {WITHDRAWABLE.includes(app.status) && (
                    <button
                      type="button"
                      onClick={() => handleWithdraw(app.animalId)}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
