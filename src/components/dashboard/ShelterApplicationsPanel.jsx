import React, { useState, useEffect } from 'react';
import { PawPrint, Home, ShieldCheck } from 'lucide-react';
import shelterApplicationService from '../../services/shelterApplicationService';
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

export default function ShelterApplicationsPanel() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const { showToast } = useToast();

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await shelterApplicationService.getApplications();
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const openApplication = async (app) => {
    setSelected(app);
    try {
      const res = await shelterApplicationService.getApplicationDetail(app.id);
      setDetail(res.data);
    } catch (err) {
      showToast('Failed to load application detail', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-4 h-[650px] overflow-y-auto">
        <h3 className="font-bold text-slate-800 mb-4 px-2">Adoption Applications</h3>
        {loading ? (
          <p className="text-center text-slate-400 p-4">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="text-center text-slate-400 p-4 text-sm">No applications received yet.</p>
        ) : (
          <div className="space-y-2">
            {applications.map(app => (
              <div key={app.id} onClick={() => openApplication(app)}
                className={`p-3 rounded-2xl cursor-pointer border flex items-center gap-3 transition-all ${selected?.id === app.id ? 'border-slate-400 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}>
                <div className="h-11 w-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
                  {app.primaryPhotoBase64 ? <img src={app.primaryPhotoBase64} alt={app.animalName} className="w-full h-full object-cover" /> : <PawPrint size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{app.animalName || 'Unnamed'} <span className="text-slate-400 font-normal">· {app.animalCode}</span></p>
                  <p className="text-xs text-slate-500 truncate">Applicant: {app.adopterName}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${STATUS_STYLES[app.status] || 'bg-slate-100 text-slate-600'}`}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 h-[650px] overflow-y-auto">
        {!detail ? (
          <div className="h-full flex items-center justify-center text-slate-400 flex-col gap-3">
            <PawPrint size={48} className="opacity-20" />
            <p>Select an application to view details</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-800">Application for {detail.animalName || 'Unnamed'}</h3>
              <p className="text-slate-500 text-sm">{detail.animalCode} • {detail.species}{detail.breed ? ` • ${detail.breed}` : ''}</p>
              <span className={`inline-block mt-2 text-xs font-bold uppercase px-2.5 py-1 rounded ${STATUS_STYLES[detail.status] || 'bg-slate-100 text-slate-600'}`}>
                {detail.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1 text-sm">
              <p className="font-bold text-slate-700 flex items-center gap-1.5 mb-2"><Home size={14} /> Applicant</p>
              <p><strong>Name:</strong> {detail.adopterName}</p>
              <p><strong>Email:</strong> {detail.adopterEmail}</p>
              <p><strong>Phone:</strong> {detail.adopterPhone}</p>
            </div>

            {detail.adopterProfile && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1 text-sm">
                <p className="font-bold text-slate-700 flex items-center gap-1.5 mb-2"><ShieldCheck size={14} /> Adopter Profile</p>
                <p><strong>Address:</strong> {detail.adopterProfile.address}</p>
                <p><strong>Housing Type:</strong> {detail.adopterProfile.housingType?.replace(/_/g, ' ')}</p>
                <p><strong>Living Arrangement:</strong> {detail.adopterProfile.livingArrangement?.replace(/_/g, ' ')}</p>
                {detail.adopterProfile.householdMembers && <p><strong>Household:</strong> {detail.adopterProfile.householdMembers}</p>}
                {detail.adopterProfile.existingPets && <p><strong>Existing Pets:</strong> {detail.adopterProfile.existingPets}</p>}
                {detail.adopterProfile.previousPetExperience && <p><strong>Experience:</strong> {detail.adopterProfile.previousPetExperience}</p>}
                {detail.adopterProfile.petCareExperience && <p><strong>Pet Care Experience:</strong> {detail.adopterProfile.petCareExperience}</p>}
                {detail.adopterProfile.veterinaryCarePlan && <p><strong>Vet Care Plan:</strong> {detail.adopterProfile.veterinaryCarePlan}</p>}
                <p><strong>Can Provide Food/Housing:</strong> {detail.adopterProfile.canProvideFoodAndHousing ? 'Yes' : 'No'}</p>
                <div className="flex gap-4 pt-2">
                  {detail.adopterProfile.governmentIdBase64 && (
                    <a href={detail.adopterProfile.governmentIdBase64} target="_blank" rel="noreferrer" className="text-primary-600 font-bold text-xs hover:underline">View Government ID</a>
                  )}
                  {detail.adopterProfile.addressProofBase64 && (
                    <a href={detail.adopterProfile.addressProofBase64} target="_blank" rel="noreferrer" className="text-primary-600 font-bold text-xs hover:underline">View Address Proof</a>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm">
              {detail.reasonForAdoption && (
                <div>
                  <p className="font-bold text-slate-700">Reason for Adoption</p>
                  <p className="text-slate-600">{detail.reasonForAdoption}</p>
                </div>
              )}
              {detail.petCarePlan && (
                <div>
                  <p className="font-bold text-slate-700">Pet-Care Plan</p>
                  <p className="text-slate-600">{detail.petCarePlan}</p>
                </div>
              )}
              {detail.veterinaryCarePlanNotes && (
                <div>
                  <p className="font-bold text-slate-700">Veterinary Care Plan Notes</p>
                  <p className="text-slate-600">{detail.veterinaryCarePlanNotes}</p>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
              Reviewing and deciding on applications (approve / reject / request info / house check) is coming in a later phase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
