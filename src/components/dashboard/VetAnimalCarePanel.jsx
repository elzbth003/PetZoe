import React, { useState, useEffect } from 'react';
import { PawPrint, Stethoscope, Syringe, Upload, ShieldPlus, AlertTriangle } from 'lucide-react';
import vetAnimalService from '../../services/vetAnimalService';
import { useToast } from '../../hooks/useToast';
import AnimalMedicalHistory from './AnimalMedicalHistory';

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

const STERILIZATION_OPTIONS = ['', 'NOT_STERILIZED', 'STERILIZED', 'SCHEDULED', 'UNKNOWN'];
const MEDICAL_DOC_TYPES = [
  'VACCINATION_RECORD', 'EXAMINATION_REPORT', 'MEDICAL_CERTIFICATE', 'LAB_REPORT',
  'PRESCRIPTION', 'TREATMENT_DOCUMENT', 'STERILIZATION_RECORD', 'OTHER',
];
const REVIEW_STATUSES = ['VERIFIED', 'REJECTED', 'REQUIRES_UPDATE'];

const EMPTY_RECORD = {
  examinationDate: new Date().toISOString().slice(0, 10), weightKg: '', healthStatus: '',
  diagnosis: '', treatment: '', medication: '', labInvestigations: '', dewormingInfo: '',
  parasiteControlInfo: '', sterilizationStatus: '', veterinaryNotes: '',
  followUpRequired: false, followUpDate: '', followUpNotes: '',
};

const EMPTY_VACCINATION = {
  vaccineName: '', dateAdministered: new Date().toISOString().slice(0, 10), nextDueDate: '', batchLotNumber: '', notes: '',
};

const EMPTY_PREVENTIVE_CARE = {
  careType: 'DEWORMING', dateAdministered: new Date().toISOString().slice(0, 10), nextDueDate: '', product: '', notes: '',
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function VetAnimalCarePanel() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [activeForm, setActiveForm] = useState('history'); // history | record | vaccination

  const [recordForm, setRecordForm] = useState(EMPTY_RECORD);
  const [savingRecord, setSavingRecord] = useState(false);
  const [vaccForm, setVaccForm] = useState(EMPTY_VACCINATION);
  const [savingVacc, setSavingVacc] = useState(false);
  const [careForm, setCareForm] = useState(EMPTY_PREVENTIVE_CARE);
  const [savingCare, setSavingCare] = useState(false);

  const [docType, setDocType] = useState('EXAMINATION_REPORT');
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const { showToast } = useToast();

  useEffect(() => { fetchWorklist(); }, []);

  const fetchWorklist = async () => {
    try {
      setLoading(true);
      const res = await vetAnimalService.getWorklist();
      setAnimals(res.data);
    } catch (err) {
      console.error('Failed to fetch animal worklist', err);
    } finally {
      setLoading(false);
    }
  };

  const openAnimal = async (id) => {
    setSelectedId(id);
    setActiveForm('history');
    try {
      const res = await vetAnimalService.getAnimal(id);
      setDetail(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load animal detail', 'error');
    }
  };

  const refreshDetail = (data) => {
    setDetail(data);
    fetchWorklist();
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      setSavingRecord(true);
      const payload = {
        ...recordForm,
        weightKg: recordForm.weightKg === '' ? null : parseFloat(recordForm.weightKg),
        sterilizationStatus: recordForm.sterilizationStatus || null,
        followUpDate: recordForm.followUpDate || null,
      };
      const res = await vetAnimalService.addMedicalRecord(selectedId, payload);
      refreshDetail(res.data);
      setRecordForm(EMPTY_RECORD);
      setActiveForm('history');
      showToast('Veterinary assessment recorded', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record assessment', 'error');
    } finally {
      setSavingRecord(false);
    }
  };

  const handleAddVaccination = async (e) => {
    e.preventDefault();
    try {
      setSavingVacc(true);
      const payload = { ...vaccForm, nextDueDate: vaccForm.nextDueDate || null };
      const res = await vetAnimalService.addVaccination(selectedId, payload);
      refreshDetail(res.data);
      setVaccForm(EMPTY_VACCINATION);
      setActiveForm('history');
      showToast('Vaccination recorded', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record vaccination', 'error');
    } finally {
      setSavingVacc(false);
    }
  };

  const handleAddPreventiveCare = async (e) => {
    e.preventDefault();
    try {
      setSavingCare(true);
      const payload = { ...careForm, nextDueDate: careForm.nextDueDate || null };
      const res = await vetAnimalService.addPreventiveCare(selectedId, payload);
      refreshDetail(res.data);
      setCareForm(EMPTY_PREVENTIVE_CARE);
      setActiveForm('history');
      showToast('Preventive care recorded', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record preventive care', 'error');
    } finally {
      setSavingCare(false);
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
      const res = await vetAnimalService.uploadDocument(selectedId, docType, base64, '');
      refreshDetail(res.data);
      setDocFile(null);
      showToast('Document uploaded', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleReviewDocument = async (docId, status) => {
    try {
      const res = await vetAnimalService.reviewDocument(docId, status, '');
      refreshDetail(res.data);
      showToast('Document review updated', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to review document', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-4 h-[650px] overflow-y-auto">
        <h3 className="font-bold text-slate-800 mb-4 px-2">Shelter Animals</h3>
        {loading ? (
          <p className="text-center text-slate-400 p-4">Loading...</p>
        ) : animals.length === 0 ? (
          <p className="text-center text-slate-400 p-4 text-sm">No shelter animals recorded yet.</p>
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
                  {a.hasOverdueCare && (
                    <span className="inline-flex items-center gap-1 mt-1 ml-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-600">
                      <AlertTriangle size={10} /> Overdue
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 h-[650px] overflow-y-auto">
        {!detail ? (
          <div className="h-full flex items-center justify-center text-slate-400 flex-col gap-3">
            <Stethoscope size={48} className="opacity-20" />
            <p>Select a shelter animal to view or record care</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
                {detail.primaryPhotoBase64 ? <img src={detail.primaryPhotoBase64} alt={detail.name} className="w-full h-full object-cover" /> : <PawPrint size={24} />}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">{detail.name || 'Unnamed'}</h3>
                <p className="text-slate-500 text-sm">{detail.animalCode} • {detail.shelterName}</p>
                <p className="text-xs text-slate-400">{detail.species}{detail.breed ? ` • ${detail.breed}` : ''} • {detail.sex}</p>
              </div>
            </div>

            {(detail.generalCondition || detail.behaviourObservations || detail.knownAllergies) && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm space-y-1">
                <p className="text-xs font-bold text-amber-700 uppercase">Shelter's Initial Observations</p>
                {detail.generalCondition && <p><strong>Condition:</strong> {detail.generalCondition}</p>}
                {detail.behaviourObservations && <p><strong>Behaviour:</strong> {detail.behaviourObservations}</p>}
                {detail.knownAllergies && <p><strong>Allergies:</strong> {detail.knownAllergies}</p>}
                {detail.immediateMedicalConcerns && <p><strong>Concerns:</strong> {detail.immediateMedicalConcerns}</p>}
              </div>
            )}

            <div className="flex gap-2 border-b border-slate-100 pb-3">
              <button onClick={() => setActiveForm('history')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg ${activeForm === 'history' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                History
              </button>
              <button onClick={() => setActiveForm('record')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${activeForm === 'record' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Stethoscope size={12} /> New Assessment
              </button>
              <button onClick={() => setActiveForm('vaccination')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${activeForm === 'vaccination' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Syringe size={12} /> New Vaccination
              </button>
              <button onClick={() => setActiveForm('preventive-care')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${activeForm === 'preventive-care' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <ShieldPlus size={12} /> New Preventive Care
              </button>
            </div>

            {activeForm === 'history' && (
              <div>
                <AnimalMedicalHistory
                  detail={detail}
                  renderDocumentActions={(doc) => doc.verificationStatus === 'PENDING' && (
                    <div className="flex gap-2 mt-2">
                      {REVIEW_STATUSES.map(s => (
                        <button key={s} onClick={() => handleReviewDocument(doc.id, s)}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700">
                          Mark {s.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  )}
                />
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h5 className="font-bold text-slate-700 mb-2 text-sm">Upload Medical Document</h5>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select value={docType} onChange={e => setDocType(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 text-sm">
                      {MEDICAL_DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </select>
                    <input type="file" accept="image/*,.pdf" onChange={e => setDocFile(e.target.files?.[0] || null)}
                      className="text-sm text-slate-600 flex-1" />
                    <button onClick={handleUploadDocument} disabled={uploadingDoc}
                      className="flex items-center gap-2 bg-slate-800 text-white font-bold px-4 py-2 rounded-xl hover:bg-slate-900 disabled:opacity-50 text-sm">
                      <Upload size={14} /> {uploadingDoc ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeForm === 'record' && (
              <form onSubmit={handleAddRecord} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Examination Date</label>
                    <input required type="date" value={recordForm.examinationDate}
                      onChange={e => setRecordForm({ ...recordForm, examinationDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                  </div>
                  <input type="number" step="0.1" min="0" placeholder="Weight (kg)" value={recordForm.weightKg}
                    onChange={e => setRecordForm({ ...recordForm, weightKg: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                </div>
                <input required placeholder="Health status (e.g. Healthy, Under treatment)" value={recordForm.healthStatus}
                  onChange={e => setRecordForm({ ...recordForm, healthStatus: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                <textarea placeholder="Diagnosis (where applicable)" value={recordForm.diagnosis}
                  onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-16 resize-none" />
                <textarea placeholder="Treatment" value={recordForm.treatment}
                  onChange={e => setRecordForm({ ...recordForm, treatment: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-16 resize-none" />
                <textarea placeholder="Medication" value={recordForm.medication}
                  onChange={e => setRecordForm({ ...recordForm, medication: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-16 resize-none" />
                <textarea placeholder="Laboratory investigations" value={recordForm.labInvestigations}
                  onChange={e => setRecordForm({ ...recordForm, labInvestigations: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-16 resize-none" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <textarea placeholder="Deworming" value={recordForm.dewormingInfo}
                    onChange={e => setRecordForm({ ...recordForm, dewormingInfo: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-16 resize-none" />
                  <textarea placeholder="Parasite control" value={recordForm.parasiteControlInfo}
                    onChange={e => setRecordForm({ ...recordForm, parasiteControlInfo: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-16 resize-none" />
                </div>
                <select value={recordForm.sterilizationStatus}
                  onChange={e => setRecordForm({ ...recordForm, sterilizationStatus: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500">
                  {STERILIZATION_OPTIONS.map(s => <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'Sterilization status (unchanged)'}</option>)}
                </select>
                <textarea placeholder="Veterinary notes" value={recordForm.veterinaryNotes}
                  onChange={e => setRecordForm({ ...recordForm, veterinaryNotes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-16 resize-none" />
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={recordForm.followUpRequired}
                    onChange={e => setRecordForm({ ...recordForm, followUpRequired: e.target.checked })} />
                  Follow-up required
                </label>
                {recordForm.followUpRequired && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="date" value={recordForm.followUpDate}
                      onChange={e => setRecordForm({ ...recordForm, followUpDate: e.target.value })}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                    <input placeholder="Follow-up notes" value={recordForm.followUpNotes}
                      onChange={e => setRecordForm({ ...recordForm, followUpNotes: e.target.value })}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                  </div>
                )}
                <button type="submit" disabled={savingRecord}
                  className="bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50">
                  {savingRecord ? 'Saving...' : 'Save Assessment'}
                </button>
              </form>
            )}

            {activeForm === 'vaccination' && (
              <form onSubmit={handleAddVaccination} className="space-y-3">
                <input required placeholder="Vaccine name" value={vaccForm.vaccineName}
                  onChange={e => setVaccForm({ ...vaccForm, vaccineName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Date Administered</label>
                    <input required type="date" value={vaccForm.dateAdministered}
                      onChange={e => setVaccForm({ ...vaccForm, dateAdministered: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Next Due Date</label>
                    <input type="date" value={vaccForm.nextDueDate}
                      onChange={e => setVaccForm({ ...vaccForm, nextDueDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                  </div>
                </div>
                <input placeholder="Batch/Lot number" value={vaccForm.batchLotNumber}
                  onChange={e => setVaccForm({ ...vaccForm, batchLotNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                <textarea placeholder="Notes" value={vaccForm.notes}
                  onChange={e => setVaccForm({ ...vaccForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-16 resize-none" />
                <button type="submit" disabled={savingVacc}
                  className="bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50">
                  {savingVacc ? 'Saving...' : 'Save Vaccination'}
                </button>
              </form>
            )}

            {activeForm === 'preventive-care' && (
              <form onSubmit={handleAddPreventiveCare} className="space-y-3">
                <select value={careForm.careType} onChange={e => setCareForm({ ...careForm, careType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500">
                  <option value="DEWORMING">Deworming</option>
                  <option value="PARASITE_CONTROL">Parasite Control</option>
                </select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Date Administered</label>
                    <input required type="date" value={careForm.dateAdministered}
                      onChange={e => setCareForm({ ...careForm, dateAdministered: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Next Due Date</label>
                    <input type="date" value={careForm.nextDueDate}
                      onChange={e => setCareForm({ ...careForm, nextDueDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                  </div>
                </div>
                <input placeholder="Product / brand" value={careForm.product}
                  onChange={e => setCareForm({ ...careForm, product: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
                <textarea placeholder="Notes" value={careForm.notes}
                  onChange={e => setCareForm({ ...careForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 h-16 resize-none" />
                <button type="submit" disabled={savingCare}
                  className="bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50">
                  {savingCare ? 'Saving...' : 'Save Preventive Care'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
