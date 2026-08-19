import React, { useState, useEffect } from 'react';
import { Plus, PawPrint, ClipboardList, X, Upload } from 'lucide-react';
import animalService from '../../services/animalService';
import { useToast } from '../../hooks/useToast';
import AnimalMedicalHistory from './AnimalMedicalHistory';
import AnimalStatusControl from './AnimalStatusControl';
import AdoptionListingForm from './AdoptionListingForm';

const MEDICAL_DOC_TYPES = [
  'VACCINATION_RECORD', 'EXAMINATION_REPORT', 'MEDICAL_CERTIFICATE', 'LAB_REPORT',
  'PRESCRIPTION', 'TREATMENT_DOCUMENT', 'STERILIZATION_RECORD', 'OTHER',
];

const SHELTER_SETTABLE_STATUSES = ['IN_SHELTER_CARE', 'UNDER_MEDICAL_CARE', 'MEDICAL_REVIEW', 'AWAITING_DOCUMENTS', 'ON_HOLD', 'WITHDRAWN'];
const LOCKED_ANIMAL_STATUSES = ['ADOPTION_PENDING', 'ADOPTED'];

const SEX_OPTIONS = ['MALE', 'FEMALE', 'UNKNOWN'];
const INTAKE_TYPES = ['RESCUE', 'STRAY', 'OWNER_SURRENDER', 'TRANSFER', 'ABANDONED', 'OTHER'];

const STATUS_STYLES = {
  IN_SHELTER_CARE: 'bg-sky-50 text-sky-600',
  UNDER_MEDICAL_CARE: 'bg-amber-50 text-amber-600',
  MEDICAL_REVIEW: 'bg-amber-50 text-amber-600',
  AWAITING_DOCUMENTS: 'bg-amber-50 text-amber-600',
  ADOPTION_REVIEW: 'bg-indigo-50 text-indigo-600',
  READY_FOR_ADOPTION: 'bg-emerald-50 text-emerald-600',
  ON_HOLD: 'bg-slate-100 text-slate-600',
  ADOPTION_PENDING: 'bg-indigo-50 text-indigo-600',
  ADOPTED: 'bg-emerald-50 text-emerald-600',
  WITHDRAWN: 'bg-rose-50 text-rose-600',
};

const EMPTY_INTAKE = {
  name: '', species: '', breed: '', sex: 'UNKNOWN', estimatedAgeMonths: '', color: '',
  distinguishingMarks: '', weightKg: '', microchipNumber: '',
  intakeDate: new Date().toISOString().slice(0, 10), intakeType: 'STRAY', sourceInfo: '', previousOwnershipInfo: '',
};

const EMPTY_ASSESSMENT = {
  generalCondition: '', weightKg: '', visibleInjuries: '', behaviourObservations: '',
  immediateMedicalConcerns: '', knownAllergies: '', knownMedicalHistory: '', parasiteConcerns: '', vaccinationInfoAtIntake: '',
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ShelterAnimalsPanel({ shelterVerified }) {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [intakeForm, setIntakeForm] = useState(EMPTY_INTAKE);
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [assessmentForm, setAssessmentForm] = useState(EMPTY_ASSESSMENT);
  const [savingAssessment, setSavingAssessment] = useState(false);

  const [medDocType, setMedDocType] = useState('EXAMINATION_REPORT');
  const [medDocFile, setMedDocFile] = useState(null);
  const [uploadingMedDoc, setUploadingMedDoc] = useState(false);

  const { showToast } = useToast();

  useEffect(() => { fetchAnimals(); }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const res = await animalService.getMyAnimals();
      setAnimals(res.data);
    } catch (err) {
      console.error('Failed to fetch animals', err);
    } finally {
      setLoading(false);
    }
  };

  const openAnimal = async (id) => {
    setSelectedId(id);
    setShowIntakeForm(false);
    try {
      const res = await animalService.getAnimal(id);
      setDetail(res.data);
      setAssessmentForm({
        generalCondition: res.data.generalCondition || '',
        weightKg: res.data.weightKg ?? '',
        visibleInjuries: res.data.visibleInjuries || '',
        behaviourObservations: res.data.behaviourObservations || '',
        immediateMedicalConcerns: res.data.immediateMedicalConcerns || '',
        knownAllergies: res.data.knownAllergies || '',
        knownMedicalHistory: res.data.knownMedicalHistory || '',
        parasiteConcerns: res.data.parasiteConcerns || '',
        vaccinationInfoAtIntake: res.data.vaccinationInfoAtIntake || '',
      });
    } catch (err) {
      showToast('Failed to load animal detail', 'error');
    }
  };

  const handleCreateIntake = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...intakeForm,
        estimatedAgeMonths: intakeForm.estimatedAgeMonths === '' ? null : parseInt(intakeForm.estimatedAgeMonths, 10),
        weightKg: intakeForm.weightKg === '' ? null : parseFloat(intakeForm.weightKg),
        primaryPhotoBase64: photoFile ? await fileToBase64(photoFile) : null,
      };
      const res = await animalService.createIntake(payload);
      showToast(`Animal intake recorded — ID ${res.data.animalCode}`, 'success');
      setShowIntakeForm(false);
      setIntakeForm(EMPTY_INTAKE);
      setPhotoFile(null);
      fetchAnimals();
      openAnimal(res.data.id);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record intake', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    try {
      setSavingAssessment(true);
      const payload = {
        ...assessmentForm,
        weightKg: assessmentForm.weightKg === '' ? null : parseFloat(assessmentForm.weightKg),
      };
      const res = await animalService.recordInitialAssessment(selectedId, payload);
      setDetail(res.data);
      showToast('Initial assessment recorded', 'success');
      fetchAnimals();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save assessment', 'error');
    } finally {
      setSavingAssessment(false);
    }
  };

  const handleUpdateStatus = async (status, notes) => {
    try {
      const res = await animalService.updateStatus(selectedId, status, notes);
      setDetail(res.data);
      fetchAnimals();
      showToast('Status updated', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleUploadMedicalDocument = async () => {
    if (!medDocFile) {
      showToast('Please choose a document to upload', 'error');
      return;
    }
    try {
      setUploadingMedDoc(true);
      const base64 = await fileToBase64(medDocFile);
      const res = await animalService.uploadDocument(selectedId, medDocType, base64, '');
      setDetail(res.data);
      setMedDocFile(null);
      showToast('Document uploaded', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setUploadingMedDoc(false);
    }
  };

  if (!shelterVerified) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm">
        <PawPrint size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">Verification required</h3>
        <p className="text-slate-500">Your shelter must be verified before you can record animal intakes.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-4 h-[650px] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-slate-800">Animals</h3>
          <button
            onClick={() => { setShowIntakeForm(true); setSelectedId(null); setDetail(null); }}
            className="flex items-center gap-1.5 bg-primary-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-primary-700"
          >
            <Plus size={14} /> Record Intake
          </button>
        </div>
        {loading ? (
          <p className="text-center text-slate-400 p-4">Loading...</p>
        ) : animals.length === 0 ? (
          <p className="text-center text-slate-400 p-4 text-sm">No animals recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {animals.map(a => (
              <div key={a.id} onClick={() => openAnimal(a.id)}
                className={`p-3 rounded-2xl cursor-pointer border flex items-center gap-3 transition-all ${selectedId === a.id ? 'border-slate-400 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}>
                <div className="h-11 w-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
                  {a.primaryPhotoBase64 ? <img src={a.primaryPhotoBase64} alt={a.name} className="w-full h-full object-cover" /> : <PawPrint size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{a.name || 'Unnamed'} <span className="text-slate-400 font-normal">· {a.animalCode}</span></p>
                  <p className="text-xs text-slate-500 truncate">{a.species}{a.breed ? ` • ${a.breed}` : ''}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${STATUS_STYLES[a.status] || 'bg-slate-100 text-slate-600'}`}>
                    {a.status.replace(/_/g, ' ')}
                  </span>
                  {!a.initialAssessmentRecorded && (
                    <span className="inline-block mt-1 ml-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-500">
                      Assessment Pending
                    </span>
                  )}
                  {a.hasOverdueCare && (
                    <span className="inline-block mt-1 ml-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-600">
                      Care Overdue
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 h-[650px] overflow-y-auto">
        {showIntakeForm ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Record Animal Intake</h3>
              <button onClick={() => setShowIntakeForm(false)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateIntake} className="space-y-5">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Identification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Name (if known)" value={intakeForm.name} onChange={e => setIntakeForm({ ...intakeForm, name: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150" />
                  <input required placeholder="Species (e.g. Dog, Cat)" value={intakeForm.species} onChange={e => setIntakeForm({ ...intakeForm, species: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150" />
                  <input placeholder="Breed (if known)" value={intakeForm.breed} onChange={e => setIntakeForm({ ...intakeForm, breed: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150" />
                  <select value={intakeForm.sex} onChange={e => setIntakeForm({ ...intakeForm, sex: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150">
                    {SEX_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input type="number" min="0" placeholder="Estimated age (months)" value={intakeForm.estimatedAgeMonths}
                    onChange={e => setIntakeForm({ ...intakeForm, estimatedAgeMonths: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150" />
                  <input placeholder="Colour" value={intakeForm.color} onChange={e => setIntakeForm({ ...intakeForm, color: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150" />
                  <input type="number" step="0.1" min="0" placeholder="Weight (kg)" value={intakeForm.weightKg}
                    onChange={e => setIntakeForm({ ...intakeForm, weightKg: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150" />
                  <input placeholder="Microchip number (if available)" value={intakeForm.microchipNumber}
                    onChange={e => setIntakeForm({ ...intakeForm, microchipNumber: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150" />
                </div>
                <textarea placeholder="Distinguishing marks" value={intakeForm.distinguishingMarks}
                  onChange={e => setIntakeForm({ ...intakeForm, distinguishingMarks: e.target.value })}
                  className="w-full mt-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
                <div className="mt-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Photograph</label>
                  <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} className="text-sm text-slate-600" />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Intake Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Intake Date</label>
                    <input required type="date" max={new Date().toISOString().slice(0, 10)} value={intakeForm.intakeDate} onChange={e => setIntakeForm({ ...intakeForm, intakeDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Intake Type</label>
                    <select value={intakeForm.intakeType} onChange={e => setIntakeForm({ ...intakeForm, intakeType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150">
                      {INTAKE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <textarea placeholder="Source / rescue information" value={intakeForm.sourceInfo}
                  onChange={e => setIntakeForm({ ...intakeForm, sourceInfo: e.target.value })}
                  className="w-full mt-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
                <textarea placeholder="Previous ownership information (if available)" value={intakeForm.previousOwnershipInfo}
                  onChange={e => setIntakeForm({ ...intakeForm, previousOwnershipInfo: e.target.value })}
                  className="w-full mt-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
              </div>

              <button type="submit" disabled={submitting}
                className="bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50">
                {submitting ? 'Recording...' : 'Record Intake'}
              </button>
            </form>
          </div>
        ) : detail ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
                {detail.primaryPhotoBase64 ? <img src={detail.primaryPhotoBase64} alt={detail.name} className="w-full h-full object-cover" /> : <PawPrint size={28} />}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">{detail.name || 'Unnamed'}</h3>
                <p className="text-slate-500 text-sm">{detail.animalCode} • {detail.shelterName}</p>
                <span className={`inline-block mt-2 text-xs font-bold uppercase px-2.5 py-1 rounded ${STATUS_STYLES[detail.status] || 'bg-slate-100 text-slate-600'}`}>
                  {detail.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
              <p><strong>Species:</strong> {detail.species}</p>
              <p><strong>Breed:</strong> {detail.breed || '—'}</p>
              <p><strong>Sex:</strong> {detail.sex}</p>
              <p><strong>Est. Age:</strong> {detail.estimatedAgeMonths != null ? `${detail.estimatedAgeMonths} months` : '—'}</p>
              <p><strong>Colour:</strong> {detail.color || '—'}</p>
              <p><strong>Weight:</strong> {detail.weightKg != null ? `${detail.weightKg} kg` : '—'}</p>
              <p><strong>Microchip:</strong> {detail.microchipNumber || 'Not chipped'}</p>
              {detail.distinguishingMarks && <p className="col-span-2 md:col-span-3"><strong>Marks:</strong> {detail.distinguishingMarks}</p>}
            </div>

            <AnimalStatusControl
              currentStatus={detail.status}
              allowedStatuses={SHELTER_SETTABLE_STATUSES}
              locked={LOCKED_ANIMAL_STATUSES.includes(detail.status)}
              onUpdate={handleUpdateStatus}
            />

            {detail.intakeHistory?.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><ClipboardList size={16} /> Intake Record</h4>
                {detail.intakeHistory.map(ih => (
                  <div key={ih.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm space-y-1 mb-2">
                    <p><strong>Date:</strong> {ih.intakeDate} · <strong>Type:</strong> {ih.intakeType.replace(/_/g, ' ')}</p>
                    {ih.sourceInfo && <p><strong>Source:</strong> {ih.sourceInfo}</p>}
                    {ih.previousOwnershipInfo && <p><strong>Previous Ownership:</strong> {ih.previousOwnershipInfo}</p>}
                    <p className="text-xs text-slate-400">Recorded by {ih.recordedByName}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-800">Initial Shelter Assessment</h4>
                <span className="text-[10px] font-bold uppercase text-slate-400">Observed by Shelter (not veterinarian)</span>
              </div>
              {detail.initialAssessmentRecordedAt && (
                <p className="text-xs text-emerald-600 font-bold mb-3">
                  Recorded by {detail.initialAssessmentRecordedByName} on {new Date(detail.initialAssessmentRecordedAt).toLocaleString()}
                </p>
              )}
              <form onSubmit={handleSaveAssessment} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="General condition" value={assessmentForm.generalCondition}
                    onChange={e => setAssessmentForm({ ...assessmentForm, generalCondition: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150" />
                  <input type="number" step="0.1" min="0" placeholder="Weight (kg)" value={assessmentForm.weightKg}
                    onChange={e => setAssessmentForm({ ...assessmentForm, weightKg: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150" />
                </div>
                <textarea placeholder="Visible injuries" value={assessmentForm.visibleInjuries}
                  onChange={e => setAssessmentForm({ ...assessmentForm, visibleInjuries: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
                <textarea placeholder="Behaviour observations" value={assessmentForm.behaviourObservations}
                  onChange={e => setAssessmentForm({ ...assessmentForm, behaviourObservations: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
                <textarea placeholder="Immediate medical concerns" value={assessmentForm.immediateMedicalConcerns}
                  onChange={e => setAssessmentForm({ ...assessmentForm, immediateMedicalConcerns: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <textarea placeholder="Known allergies" value={assessmentForm.knownAllergies}
                    onChange={e => setAssessmentForm({ ...assessmentForm, knownAllergies: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
                  <textarea placeholder="Known medical history" value={assessmentForm.knownMedicalHistory}
                    onChange={e => setAssessmentForm({ ...assessmentForm, knownMedicalHistory: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
                </div>
                <textarea placeholder="Parasite concerns" value={assessmentForm.parasiteConcerns}
                  onChange={e => setAssessmentForm({ ...assessmentForm, parasiteConcerns: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
                <textarea placeholder="Vaccination information (if available)" value={assessmentForm.vaccinationInfoAtIntake}
                  onChange={e => setAssessmentForm({ ...assessmentForm, vaccinationInfoAtIntake: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 h-16 resize-none" />
                <button type="submit" disabled={savingAssessment}
                  className="bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-slate-900 disabled:opacity-50">
                  {savingAssessment ? 'Saving...' : detail.initialAssessmentRecordedAt ? 'Update Assessment' : 'Save Initial Assessment'}
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 mb-3">Veterinary Care Record</h4>
              <p className="text-xs text-slate-400 mb-4">Recorded by veterinarians only — view here, add new entries from the Vet Portal.</p>
              <AnimalMedicalHistory detail={detail} />

              <div className="mt-4 pt-4 border-t border-slate-100">
                <h5 className="font-bold text-slate-700 mb-2 text-sm">Upload Medical Document</h5>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select value={medDocType} onChange={e => setMedDocType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors duration-150 text-sm">
                    {MEDICAL_DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                  <input type="file" accept="image/*,.pdf" onChange={e => setMedDocFile(e.target.files?.[0] || null)}
                    className="text-sm text-slate-600 flex-1" />
                  <button onClick={handleUploadMedicalDocument} disabled={uploadingMedDoc}
                    className="flex items-center gap-2 bg-slate-800 text-white font-bold px-4 py-2 rounded-xl hover:bg-slate-900 disabled:opacity-50 text-sm">
                    <Upload size={14} /> {uploadingMedDoc ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>

            <AdoptionListingForm
              animalId={detail.id}
              animalStatus={detail.status}
              listing={detail.listing}
              onUpdated={(data) => { setDetail(data); fetchAnimals(); }}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 flex-col gap-3">
            <PawPrint size={48} className="opacity-20" />
            <p>Select an animal, or record a new intake</p>
          </div>
        )}
      </div>
    </div>
  );
}
