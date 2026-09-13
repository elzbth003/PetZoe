import React, { useState, useEffect } from 'react';
import {
  Shield, CheckCircle2, AlertCircle, Clock, Upload, Trash2,
  FileText, ExternalLink, RefreshCw, Send, Loader2, Award, User,
  Building, Phone, MapPin, Sparkles, AlertTriangle, XCircle, Calendar
} from 'lucide-react';
import { vetClinicalService } from '../../services/vetClinicalService';
import { useToast } from '../../hooks/useToast';

export default function VetVerificationPanel() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [schedule, setSchedule] = useState({
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
    workStartTime: '09:00 AM',
    workEndTime: '05:00 PM',
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

  const [form, setForm] = useState({
    qualification: '',
    registrationNumber: '',
    experience: '',
    specialization: '',
    bio: '',
    address: '',
    phone: '',
  });

  const [newDoc, setNewDoc] = useState({
    documentType: 'LICENSE',
    documentBase64: '',
    fileName: '',
    fileSize: '',
  });

  const { showToast } = useToast();

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await vetClinicalService.getVetProfile();
      setProfile(data);
      setForm({
        qualification: data.qualification || '',
        registrationNumber: data.registrationNumber || '',
        experience: data.experience || '',
        specialization: data.specialization || '',
        bio: data.bio || '',
        address: data.address || '',
        phone: data.phone || '',
      });
      if (data.workingDays) {
        setSchedule({
          workingDays: data.workingDays.split(',').map(d => d.trim()),
          workStartTime: data.workStartTime || '09:00 AM',
          workEndTime: data.workEndTime || '05:00 PM',
        });
      }
    } catch (err) {
      showToast('Failed to load veterinarian profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleToggleDay = (day) => {
    setSchedule(prev => {
      const days = prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays: days };
    });
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    if (schedule.workingDays.length === 0) {
      showToast('Please select at least one consultation day', 'error');
      return;
    }
    setSavingSchedule(true);
    try {
      const updated = await vetClinicalService.updateVetSchedule(schedule);
      setProfile(updated);
      showToast('Consultation schedule updated successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update schedule', 'error');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await vetClinicalService.updateVetProfile({
        ...form,
        experience: form.experience ? parseInt(form.experience, 10) : null,
      });
      setProfile(updated);
      showToast('Profile credentials saved successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('File size must be less than 8MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewDoc({
        ...newDoc,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        documentBase64: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!newDoc.documentBase64) {
      showToast('Please select a document file to upload', 'error');
      return;
    }

    setUploadingDoc(true);
    try {
      await vetClinicalService.uploadVerificationDocument(newDoc.documentType, newDoc.documentBase64);
      showToast('Verification document uploaded', 'success');
      setNewDoc({
        documentType: 'LICENSE',
        documentBase64: '',
        fileName: '',
        fileSize: '',
      });
      loadProfile();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    try {
      await vetClinicalService.deleteVerificationDocument(docId);
      showToast('Document removed', 'success');
      loadProfile();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete document', 'error');
    }
  };

  const handleSubmitVerification = async () => {
    if (!form.registrationNumber || !form.qualification) {
      showToast('Please provide your Registration Number and Medical Qualification before submitting.', 'error');
      return;
    }
    if (!profile?.documents || profile.documents.length === 0) {
      showToast('Please upload at least one verification credential document (License / Degree).', 'error');
      return;
    }

    setSubmittingVerification(true);
    try {
      const updated = await vetClinicalService.submitVerification();
      setProfile(updated);
      showToast('Credentials successfully submitted for administrator review!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit verification request', 'error');
    } finally {
      setSubmittingVerification(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-sky-500" size={32} />
        <p className="text-xs font-bold text-slate-500">Loading professional verification record...</p>
      </div>
    );
  }

  const status = profile?.verificationStatus || 'NOT_SUBMITTED';

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Verification Status Banner */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
        status === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-950' :
        status === 'UNDER_REVIEW' ? 'bg-sky-50 border-sky-200 text-sky-950' :
        status === 'RESUBMISSION_REQUIRED' ? 'bg-orange-50 border-orange-200 text-orange-950' :
        status === 'REJECTED' ? 'bg-rose-50 border-rose-200 text-rose-950' :
        'bg-slate-100 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            status === 'APPROVED' ? 'bg-emerald-600 text-white' :
            status === 'PENDING' ? 'bg-amber-500 text-white' :
            status === 'UNDER_REVIEW' ? 'bg-sky-600 text-white' :
            status === 'RESUBMISSION_REQUIRED' ? 'bg-orange-600 text-white' :
            status === 'REJECTED' ? 'bg-rose-600 text-white' :
            'bg-slate-700 text-white'
          }`}>
            {status === 'APPROVED' && <CheckCircle2 size={30} />}
            {status === 'PENDING' && <Clock size={30} />}
            {status === 'UNDER_REVIEW' && <RefreshCw size={30} className="animate-spin" />}
            {status === 'RESUBMISSION_REQUIRED' && <AlertTriangle size={30} />}
            {status === 'REJECTED' && <XCircle size={30} />}
            {status === 'NOT_SUBMITTED' && <Shield size={30} />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">Licensing Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                status === 'APPROVED' ? 'bg-emerald-200/80 text-emerald-900' :
                status === 'PENDING' ? 'bg-amber-200/80 text-amber-900' :
                status === 'UNDER_REVIEW' ? 'bg-sky-200/80 text-sky-900' :
                status === 'RESUBMISSION_REQUIRED' ? 'bg-orange-200/80 text-orange-900' :
                status === 'REJECTED' ? 'bg-rose-200/80 text-rose-900' :
                'bg-slate-200 text-slate-700'
              }`}>
                {status.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black mt-1">
              {status === 'APPROVED' && 'Officially Verified & Board Certified Veterinarian'}
              {status === 'PENDING' && 'Verification Submission Awaiting Administrator Review'}
              {status === 'UNDER_REVIEW' && 'Credentials Currently Under Clinical Board Review'}
              {status === 'RESUBMISSION_REQUIRED' && 'Action Required: Additional Information Requested'}
              {status === 'REJECTED' && 'Verification Application Rejected'}
              {status === 'NOT_SUBMITTED' && 'Verification Incomplete — Submit Credentials'}
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              {status === 'APPROVED' && 'Your medical credentials have been verified. You have full practice and consultation privileges.'}
              {status === 'PENDING' && 'Your documents are in the administrative queue. Review usually takes 24-48 business hours.'}
              {status === 'UNDER_REVIEW' && 'An administrator is actively reviewing your license and certificates.'}
              {status === 'RESUBMISSION_REQUIRED' && 'Please check review notes below, adjust your profile or documents, and resubmit.'}
              {status === 'REJECTED' && 'Your submission did not meet verification criteria. Please contact administrative support.'}
              {status === 'NOT_SUBMITTED' && 'Complete your professional profile and upload your Veterinary License to practice on PetZoe.'}
            </p>
          </div>
        </div>

        {/* Resubmit / Submit button in banner */}
        {(status === 'NOT_SUBMITTED' || status === 'RESUBMISSION_REQUIRED') && (
          <button
            onClick={handleSubmitVerification}
            disabled={submittingVerification}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
          >
            {submittingVerification && <Loader2 size={14} className="animate-spin" />}
            <Send size={14} /> Submit for Review
          </button>
        )}
      </div>

      {/* Main Grid: Profile Form & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Professional Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Award size={18} className="text-sky-600" /> Professional Credentials
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Maintain your public veterinary profile and clinical registration.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Doctor Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={profile?.name || ''}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Registered Email</label>
                  <input
                    type="text"
                    disabled
                    value={profile?.email || ''}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Medical Registration / License No. *</label>
                  <input
                    type="text"
                    required
                    value={form.registrationNumber}
                    onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                    placeholder="e.g. VET-REG-2024-8891"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Degree / Qualifications *</label>
                  <input
                    type="text"
                    required
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    placeholder="e.g. BVSc & AH, MVSc (Surgery)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Clinical Specialization</label>
                  <input
                    type="text"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    placeholder="e.g. Small Animal Surgery & Internal Medicine"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Years of Clinical Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="e.g. 7"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Clinic Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +1 555-0199"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Practice Address / Hospital</label>
                    <span className={`text-[10px] ${(form.address || '').length > 240 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                      {(form.address || '').length}/255
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={255}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. 124 Baker St, Central Pet Hospital"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Professional Bio & Practice Focus</label>
                  <span className={`text-[10px] ${(form.bio || '').length > 480 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                    {(form.bio || '').length}/500
                  </span>
                </div>
                <textarea
                  rows="3"
                  maxLength={500}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell pet owners and colleagues about your background, experience with shelter medicine, surgery, and wellness..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {savingProfile && <Loader2 size={14} className="animate-spin" />}
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>

          {/* Consultation Hours & Schedule Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Calendar size={18} className="text-sky-600" /> Consultation Hours & Schedule
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure your working days and daily shift. Inactive days are automatically disabled for pet owners during booking.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateSchedule} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Available Consultation Days</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {[
                    { id: 'MONDAY', label: 'Mon' },
                    { id: 'TUESDAY', label: 'Tue' },
                    { id: 'WEDNESDAY', label: 'Wed' },
                    { id: 'THURSDAY', label: 'Thu' },
                    { id: 'FRIDAY', label: 'Fri' },
                    { id: 'SATURDAY', label: 'Sat' },
                    { id: 'SUNDAY', label: 'Sun' }
                  ].map(day => {
                    const isSelected = schedule.workingDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleToggleDay(day.id)}
                        className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <span>{day.label}</span>
                        <span className="text-[9px] font-semibold mt-0.5">
                          {isSelected ? 'Active' : 'Off'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Shift Start Time</label>
                  <select
                    value={schedule.workStartTime}
                    onChange={(e) => setSchedule({ ...schedule, workStartTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="08:30 AM">08:30 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Shift End Time</label>
                  <select
                    value={schedule.workEndTime}
                    onChange={(e) => setSchedule({ ...schedule, workEndTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="05:30 PM">05:30 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                    <option value="07:00 PM">07:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {savingSchedule && <Loader2 size={14} className="animate-spin" />}
                  Save Schedule & Availability
                </button>
              </div>
            </form>
          </div>

          {/* Verification History Timeline */}
          {profile?.history && profile.history.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} className="text-slate-500" /> Verification Audit Log
              </h3>
              <div className="space-y-3">
                {profile.history.map((h) => (
                  <div key={h.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {h.action}
                        </span>
                        <span className="text-slate-500 text-[11px] font-semibold">
                          {h.previousStatus ? `${h.previousStatus} → ` : ''}<strong>{h.newStatus}</strong>
                        </span>
                      </div>
                      {h.reason && <p className="text-slate-700 mt-1 italic font-medium">"{h.reason}"</p>}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold shrink-0">
                      {h.createdAt?.split('T')[0]} {h.adminEmail ? `by ${h.adminEmail}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Documents Section */}
        <div className="space-y-6">
          {/* Upload Document Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Upload size={18} className="text-sky-600" /> Upload Credentials
            </h3>
            <p className="text-xs text-slate-500">Attach digital copies of your official medical license or degree certificates.</p>

            <form onSubmit={handleUploadDocument} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Category</label>
                <select
                  value={newDoc.documentType}
                  onChange={(e) => setNewDoc({ ...newDoc, documentType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-sky-500"
                >
                  <option value="LICENSE">Veterinary Medical License</option>
                  <option value="DEGREE">BVSc / MVSc Degree Certificate</option>
                  <option value="ID_PROOF">Government Identity Proof</option>
                  <option value="CLINIC_CERT">Clinic Establishment Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select File (PDF / Images)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  required
                  onChange={handleFileSelect}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                />
                {newDoc.fileName && (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1 truncate">
                    Attached: {newDoc.fileName} ({newDoc.fileSize})
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={uploadingDoc || !newDoc.documentBase64}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {uploadingDoc && <Loader2 size={14} className="animate-spin" />}
                <Upload size={14} /> Upload Credential
              </button>
            </form>
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center justify-between">
              <span>Attached Documents</span>
              <span className="text-xs font-bold text-slate-400">{profile?.documents?.length || 0}</span>
            </h3>

            {profile?.documents?.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl p-4">
                <FileText size={28} className="mx-auto mb-2 opacity-50" />
                No credentials attached yet. Upload your license above.
              </div>
            ) : (
              <div className="space-y-3">
                {profile?.documents?.map((doc) => (
                  <div key={doc.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-black text-xs text-slate-800 block uppercase tracking-wide">
                          {doc.documentType}
                        </span>
                        <span className="text-[10px] text-slate-400">Uploaded {doc.uploadedAt?.split('T')[0]}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        doc.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>

                    {doc.rejectionReason && (
                      <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg font-medium">
                        Rejection reason: {doc.rejectionReason}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                      {doc.documentBase64 ? (
                        <a
                          href={doc.documentBase64}
                          download={`${doc.documentType}_credential`}
                          className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> View File
                        </a>
                      ) : <span className="text-[10px] text-slate-400">Preview N/A</span>}

                      {doc.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
