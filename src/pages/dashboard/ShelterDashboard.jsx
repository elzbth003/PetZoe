import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, PawPrint, Heart, Settings, LogOut,
  CheckCircle, XCircle, Clock, FileText, Trash2, Upload
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import shelterService from '../../services/shelterService';
import { useToast } from '../../hooks/useToast';
import ShelterAnimalsPanel from '../../components/dashboard/ShelterAnimalsPanel';

const ORG_TYPES = ['NGO', 'TRUST', 'GOVERNMENT', 'INDIVIDUAL', 'COMPANY', 'OTHER'];

const STATUS_STYLES = {
  NOT_SUBMITTED: 'bg-slate-100 text-slate-600',
  PENDING: 'bg-amber-50 text-amber-600',
  UNDER_REVIEW: 'bg-amber-50 text-amber-600',
  APPROVED: 'bg-emerald-50 text-emerald-600',
  REJECTED: 'bg-rose-50 text-rose-600',
  CHANGES_REQUIRED: 'bg-rose-50 text-rose-600',
  RESUBMISSION_REQUIRED: 'bg-rose-50 text-rose-600',
  SUSPENDED: 'bg-rose-50 text-rose-600',
};

const EMPTY_FORM = {
  shelterName: '', description: '', organizationType: '', registrationNumber: '',
  addressLine: '', city: '', state: '', pincode: '', capacity: '', veterinaryCareArrangements: '',
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ShelterDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [shelter, setShelter] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [docType, setDocType] = useState('REGISTRATION_CERTIFICATE');
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [primaryImageFile, setPrimaryImageFile] = useState(null);

  useEffect(() => {
    if (user?.role !== 'Shelter Manager' && user?.role !== 'Admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchShelter();
  }, []);

  const fetchShelter = async () => {
    try {
      setLoading(true);
      const res = await shelterService.getMyShelter();
      if (res.data) {
        setShelter(res.data);
        setForm({
          shelterName: res.data.shelterName || '',
          description: res.data.description || '',
          organizationType: res.data.organizationType || '',
          registrationNumber: res.data.registrationNumber || '',
          addressLine: res.data.addressLine || '',
          city: res.data.city || '',
          state: res.data.state || '',
          pincode: res.data.pincode || '',
          capacity: res.data.capacity ?? '',
          veterinaryCareArrangements: res.data.veterinaryCareArrangements || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch shelter profile', err);
    } finally {
      setLoading(false);
    }
  };

  const status = shelter?.verificationStatus || 'NOT_SUBMITTED';
  const canEdit = ['NOT_SUBMITTED', 'REJECTED', 'CHANGES_REQUIRED', 'RESUBMISSION_REQUIRED'].includes(status);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        capacity: form.capacity === '' ? null : parseInt(form.capacity, 10),
        primaryImageBase64: primaryImageFile ? await fileToBase64(primaryImageFile) : undefined,
      };
      const res = await shelterService.updateMyShelter(payload);
      setShelter(res.data);
      setPrimaryImageFile(null);
      showToast('Shelter profile saved', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save shelter profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!docFile) {
      showToast('Please choose a document to upload', 'error');
      return;
    }
    try {
      setUploadingDoc(true);
      const base64 = await fileToBase64(docFile);
      const res = await shelterService.addDocument(docType, base64);
      setShelter(res.data);
      setDocFile(null);
      showToast('Document uploaded', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleRemoveDocument = async (id) => {
    try {
      const res = await shelterService.removeDocument(id);
      setShelter(res.data);
      showToast('Document removed', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove document', 'error');
    }
  };

  const handleSubmitForVerification = async () => {
    try {
      setSubmitting(true);
      const res = await shelterService.submitForVerification();
      setShelter(res.data);
      showToast('Shelter submitted for verification', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit for verification', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderProfileTab = () => (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Shelter Profile</h2>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-md ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
            Status: {status.replace(/_/g, ' ')}
          </span>
        </div>

        {(status === 'REJECTED' || status === 'CHANGES_REQUIRED') && shelter?.rejectionReason && (
          <div className="mb-4 text-sm text-rose-600 bg-rose-50 p-3 rounded-xl">
            Reason: {shelter.rejectionReason}
          </div>
        )}

        {loading ? (
          <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div></div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <fieldset disabled={!canEdit} className="space-y-4 disabled:opacity-60">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Shelter Name</label>
                  <input required value={form.shelterName} onChange={(e) => setForm({ ...form, shelterName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Organization Type</label>
                  <select required value={form.organizationType} onChange={(e) => setForm({ ...form, organizationType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500">
                    <option value="" disabled>Select type</option>
                    {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-24 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Registration Number</label>
                <input required value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Address</label>
                <input required value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">City</label>
                  <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">State</label>
                  <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Pincode</label>
                  <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Capacity (max animals)</label>
                <input required type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Veterinary Care Arrangements</label>
                <textarea value={form.veterinaryCareArrangements} onChange={(e) => setForm({ ...form, veterinaryCareArrangements: e.target.value })}
                  placeholder="e.g. On-call arrangement with Dr. X Clinic, in-house vet, partnership with hospital..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-20 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Shelter Image</label>
                <input type="file" accept="image/*" onChange={(e) => setPrimaryImageFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-600" />
              </div>
            </fieldset>

            {canEdit && (
              <button type="submit" disabled={saving}
                className="bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            )}
          </form>
        )}
      </div>

      {!loading && shelter && canEdit && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Supporting Documents</h3>
          <div className="space-y-2 mb-4">
            {shelter.documents?.length === 0 ? (
              <p className="text-sm text-slate-500">No documents uploaded yet.</p>
            ) : (
              shelter.documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText size={16} className="text-slate-400" />
                    <span className="font-medium text-slate-700">{doc.documentType.replace(/_/g, ' ')}</span>
                  </div>
                  <button onClick={() => handleRemoveDocument(doc.id)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={docType} onChange={(e) => setDocType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 text-sm">
              <option value="REGISTRATION_CERTIFICATE">Registration Certificate</option>
              <option value="ID_PROOF">ID Proof</option>
              <option value="ADDRESS_PROOF">Address Proof</option>
              <option value="OTHER">Other</option>
            </select>
            <input type="file" accept="image/*,.pdf" onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              className="text-sm text-slate-600 flex-1" />
            <button onClick={handleUploadDocument} disabled={uploadingDoc}
              className="flex items-center gap-2 bg-slate-800 text-white font-bold px-4 py-2 rounded-xl hover:bg-slate-900 disabled:opacity-50 text-sm">
              <Upload size={14} /> {uploadingDoc ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}

      {!loading && shelter && canEdit && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">Ready to submit?</h3>
            <p className="text-sm text-slate-500">Once submitted, your profile will be reviewed by an admin.</p>
          </div>
          <button onClick={handleSubmitForVerification} disabled={submitting}
            className="bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50 shrink-0">
            {submitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      )}

      {!loading && !shelter && (
        <p className="text-sm text-slate-500 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          Fill in your shelter details above and save to get started.
        </p>
      )}
    </div>
  );

  const renderDashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verification Status</p>
            <h3 className="text-lg font-black text-slate-800">{status.replace(/_/g, ' ')}</h3>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
            <PawPrint size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Capacity</p>
            <h3 className="text-lg font-black text-slate-800">{shelter?.capacity ?? '—'}</h3>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            {status === 'APPROVED' ? <CheckCircle size={22} /> : status === 'REJECTED' || status === 'SUSPENDED' ? <XCircle size={22} /> : <Clock size={22} />}
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shelter</p>
            <h3 className="text-lg font-black text-slate-800 truncate max-w-[10rem]">{shelter?.shelterName || 'Not created'}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center py-16">
        {status === 'APPROVED' ? (
          <>
            <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Your shelter is verified</h3>
            <p className="text-slate-500">You can now record animal intakes. Medical records and adoption listing management are coming in the next phase.</p>
            <button onClick={() => setActiveTab('Animals')}
              className="mt-6 bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700">
              Go to Animals
            </button>
          </>
        ) : (
          <>
            <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Get your shelter verified</h3>
            <p className="text-slate-500">Complete your shelter profile and submit it for admin review before you can list animals for adoption.</p>
            <button onClick={() => setActiveTab('Shelter Profile')}
              className="mt-6 bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700">
              Go to Shelter Profile
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === 'Shelter Profile') return renderProfileTab();
    if (activeTab === 'Dashboard') return renderDashboardTab();
    if (activeTab === 'Animals') return <ShelterAnimalsPanel shelterVerified={status === 'APPROVED'} />;
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm text-slate-500">
        Coming Soon
      </div>
    );
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Shelter Profile', icon: Building2 },
    { name: 'Animals', icon: PawPrint },
    { name: 'Adoptions', icon: Heart },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-1.5 select-none">
            <span className="font-display font-black text-xl text-white flex items-center">
              PetZ
              <span className="inline-block hover:rotate-12 transition-transform duration-300">
                <PawPrint size={20} className="fill-current text-[#38BDF8] mx-0.5 animate-pulse" />
              </span>
              e
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={16} /> {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 font-bold text-xs transition-all cursor-pointer text-left w-full"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <header className="sticky top-0 z-10 bg-slate-50 flex justify-between items-center border-b border-slate-200 px-8 py-5">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{activeTab}</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">
              Shelter & Adoption Hub • {user?.name}
            </p>
          </div>
        </header>

        <div className="p-8 pb-10 space-y-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
