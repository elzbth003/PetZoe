import React, { useState, useEffect } from 'react';
import {
  X, PawPrint, Calendar, Clock, User, Phone, Mail, FileText,
  Shield, Upload, Plus, Activity, AlertCircle, CheckCircle2,
  ChevronRight, Download, Eye, Stethoscope, Pill, Loader2, Sparkles,
  ScanLine
} from 'lucide-react';
import { vetClinicalService } from '../../services/vetClinicalService';
import vetScanService from '../../services/vetScanService';
import { useToast } from '../../hooks/useToast';

export default function VetPatientProfileModal({ petId, isOpen, onClose, onStartConsultation }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Quick Action Sub-Modals
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);

  // Form States
  const [recordForm, setRecordForm] = useState({
    weightKg: '',
    healthStatus: 'Examined',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    medication: '',
    veterinaryNotes: '',
    followUpRequired: false,
    followUpDate: '',
    followUpNotes: '',
  });

  const [vaccineForm, setVaccineForm] = useState({
    vaccineName: '',
    dateAdministered: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    batchLotNumber: '',
    notes: '',
  });

  const [docForm, setDocForm] = useState({
    documentName: '',
    documentType: 'LAB_REPORT',
    documentBase64: '',
    fileSize: '',
    mimeType: '',
    notes: '',
  });

  const { showToast } = useToast();

  const [vetScanRecords, setVetScanRecords] = useState([]);
  const [reviewingScanId, setReviewingScanId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ reviewStatus: 'AGREE', veterinarianNotes: '' });

  const fetchPatient = async () => {
    if (!petId) return;
    setLoading(true);
    try {
      const [detailRes, scanRes] = await Promise.allSettled([
        vetClinicalService.getPatientDetail(petId),
        vetScanService.getScansByPet(petId),
      ]);
      if (detailRes.status === 'fulfilled') setPatientData(detailRes.value);
      if (scanRes.status === 'fulfilled') setVetScanRecords(scanRes.value || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load patient profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewScan = async (scanId) => {
    try {
      await vetScanService.submitVeterinarianReview(scanId, reviewForm);
      showToast('Clinical review recorded successfully', 'success');
      setReviewingScanId(null);
      setReviewForm({ reviewStatus: 'AGREE', veterinarianNotes: '' });
      const updatedScans = await vetScanService.getScansByPet(petId);
      setVetScanRecords(updatedScans || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit clinical review', 'error');
    }
  };

  useEffect(() => {
    if (isOpen && petId) {
      fetchPatient();
      setActiveTab('overview');
    }
  }, [isOpen, petId]);

  if (!isOpen) return null;

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!recordForm.diagnosis.trim()) {
      showToast('Please enter a clinical diagnosis', 'error');
      return;
    }
    setModalSubmitting(true);
    try {
      await vetClinicalService.addMedicalRecord(petId, {
        ...recordForm,
        weightKg: recordForm.weightKg ? parseFloat(recordForm.weightKg) : null,
        followUpDate: recordForm.followUpRequired && recordForm.followUpDate ? recordForm.followUpDate : null,
      });
      showToast('Clinical medical record saved successfully', 'success');
      setShowAddRecord(false);
      setRecordForm({
        weightKg: '',
        healthStatus: 'Examined',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        medication: '',
        veterinaryNotes: '',
        followUpRequired: false,
        followUpDate: '',
        followUpNotes: '',
      });
      fetchPatient();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add medical record', 'error');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleCreateVaccine = async (e) => {
    e.preventDefault();
    if (!vaccineForm.vaccineName.trim()) {
      showToast('Please enter vaccine name', 'error');
      return;
    }
    setModalSubmitting(true);
    try {
      await vetClinicalService.addVaccination(petId, {
        ...vaccineForm,
        nextDueDate: vaccineForm.nextDueDate || null,
      });
      showToast('Vaccination recorded successfully', 'success');
      setShowAddVaccine(false);
      setVaccineForm({
        vaccineName: '',
        dateAdministered: new Date().toISOString().split('T')[0],
        nextDueDate: '',
        batchLotNumber: '',
        notes: '',
      });
      fetchPatient();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record vaccination', 'error');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be under 10MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDocForm({
        ...docForm,
        documentName: file.name,
        documentBase64: reader.result,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDocument = async (e) => {
    e.preventDefault();
    if (!docForm.documentBase64) {
      showToast('Please select a file to upload', 'error');
      return;
    }
    setModalSubmitting(true);
    try {
      await vetClinicalService.uploadDocument(petId, docForm);
      showToast('Medical document uploaded successfully', 'success');
      setShowUploadDoc(false);
      setDocForm({
        documentName: '',
        documentType: 'LAB_REPORT',
        documentBase64: '',
        fileSize: '',
        mimeType: '',
        notes: '',
      });
      fetchPatient();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setModalSubmitting(false);
    }
  };

  const pet = patientData?.pet;
  const owner = patientData?.owner;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100">
        {/* Header Profile Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          {loading ? (
            <div className="py-6 flex items-center justify-center">
              <Loader2 className="animate-spin text-sky-400" size={28} />
            </div>
          ) : pet ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pr-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {pet.photoUrl ? (
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-sky-400/30 shadow-lg"
                    />
                  ) : (
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-sky-600/30 border border-sky-400/40 flex items-center justify-center text-sky-300">
                      <PawPrint size={32} />
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-500 text-white shadow">
                    {pet.species}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{pet.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                      {pet.breed || 'Mixed'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/20 text-white border border-white/30 flex items-center gap-1">
                      <span className="text-[10px] uppercase text-sky-200 font-bold">Pet ID:</span>
                      {pet.petCode || `PZ-PET-${String(pet.id).padStart(6, '0')}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
                    <span>{pet.gender || 'Unknown Gender'}</span>
                    <span>•</span>
                    <span>{pet.age ? `${pet.age} yrs` : 'Age N/A'}</span>
                    <span>•</span>
                    <span>{pet.weight ? `${pet.weight} kg` : 'Weight N/A'}</span>
                    <span>•</span>
                    <span className="text-sky-300 font-semibold">Owner: {owner?.name || 'Unknown'}</span>
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowAddRecord(true)}
                  className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Stethoscope size={14} /> + Record
                </button>
                <button
                  onClick={() => setShowAddVaccine(true)}
                  className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Shield size={14} /> + Vaccine
                </button>
                <button
                  onClick={() => setShowUploadDoc(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload size={14} /> + Document
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100/80 px-6 border-b border-slate-200 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: Activity, count: null },
            { id: 'history', label: 'Medical History', icon: FileText, count: patientData?.medicalRecords?.length },
            { id: 'appointments', label: 'Appointments', icon: Calendar, count: patientData?.appointments?.length },
            { id: 'prescriptions', label: 'Prescriptions', icon: Pill, count: patientData?.prescriptions?.length },
            { id: 'vaccinations', label: 'Vaccinations', icon: Shield, count: patientData?.vaccinations?.length },
            { id: 'documents', label: 'Documents', icon: Upload, count: patientData?.documents?.length },
            { id: 'followups', label: 'Follow-ups', icon: AlertCircle, count: patientData?.followUps?.length },
            { id: 'vetscan', label: 'VetScan AI Scans', icon: ScanLine, count: vetScanRecords?.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-3.5 border-b-2 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-sky-600 text-sky-700 bg-white shadow-sm rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-sky-600' : 'text-slate-400'} />
                {tab.label}
                {typeof tab.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-sky-500" size={36} />
              <p className="text-sm font-semibold text-slate-500">Loading comprehensive medical chart...</p>
            </div>
          ) : !patientData ? (
            <div className="text-center py-16 text-slate-500">No patient details available.</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pet Details Card */}
                    <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <PawPrint size={18} className="text-sky-600" /> Patient Biological Profile
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-50 p-3.5 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Vaccination</span>
                          <p className="text-sm font-black text-slate-800 mt-0.5">
                            {pet.vaccinationStatus || 'Unknown'}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Weight</span>
                          <p className="text-sm font-black text-slate-800 mt-0.5">
                            {pet.weight ? `${pet.weight} kg` : 'N/A'}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Color / Markings</span>
                          <p className="text-sm font-black text-slate-800 mt-0.5 truncate">{pet.color || 'Standard'}</p>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</span>
                          <p className="text-sm font-black text-slate-800 mt-0.5">{pet.dateOfBirth || 'Unknown'}</p>
                        </div>
                      </div>

                      {pet.allergies && (
                        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold">Known Allergies:</strong> {pet.allergies}
                          </div>
                        </div>
                      )}

                      {pet.medicalNotes && (
                        <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3.5 text-xs text-slate-700">
                          <strong className="font-bold text-sky-900 block mb-1">Permanent Medical Notes:</strong>
                          <p>{pet.medicalNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Owner Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <User size={18} className="text-sky-600" /> Pet Owner Contact
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">
                            {owner?.name?.charAt(0) || 'O'}
                          </div>
                          <div>
                            <p className="font-black text-sm text-slate-900">{owner?.name}</p>
                            <span className="text-slate-400 text-[10px] font-semibold">Registered Client</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <p className="flex items-center gap-2.5 text-slate-600 font-medium">
                            <Mail size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{owner?.email}</span>
                          </p>
                          <p className="flex items-center gap-2.5 text-slate-600 font-medium">
                            <Phone size={14} className="text-slate-400 shrink-0" />
                            <span>{owner?.phone || 'No phone recorded'}</span>
                          </p>
                          {owner?.address && (
                            <p className="flex items-start gap-2.5 text-slate-600 font-medium">
                              <span className="text-slate-400 shrink-0 text-xs">📍</span>
                              <span>{owner.address}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Consultations</span>
                        <h4 className="text-lg font-black text-slate-800">{patientData.medicalRecords?.length || 0}</h4>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <Shield size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Vaccines Given</span>
                        <h4 className="text-lg font-black text-slate-800">{patientData.vaccinations?.length || 0}</h4>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Pill size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Prescriptions</span>
                        <h4 className="text-lg font-black text-slate-800">{patientData.prescriptions?.length || 0}</h4>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Follow-ups Due</span>
                        <h4 className="text-lg font-black text-slate-800">{patientData.followUps?.length || 0}</h4>
                      </div>
                    </div>
                  </div>

                  {/* Latest Clinical Note Preview */}
                  {patientData.medicalRecords && patientData.medicalRecords.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                          <Stethoscope size={18} className="text-sky-600" /> Most Recent Consultation
                        </h3>
                        <span className="text-xs text-slate-400 font-bold">
                          {patientData.medicalRecords[0].examinationDate}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-50 p-3.5 rounded-xl space-y-1">
                          <span className="font-bold text-slate-500 uppercase text-[10px]">Diagnosis</span>
                          <p className="font-semibold text-slate-800 text-sm">{patientData.medicalRecords[0].diagnosis}</p>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-xl space-y-1">
                          <span className="font-bold text-slate-500 uppercase text-[10px]">Treatment Plan</span>
                          <p className="font-semibold text-slate-800 text-sm">{patientData.medicalRecords[0].treatment || 'No specific treatment specified'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MEDICAL HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-black text-slate-800">Clinical Examination Records</h3>
                    <button
                      onClick={() => setShowAddRecord(true)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus size={14} /> Add Record
                    </button>
                  </div>

                  {patientData.medicalRecords?.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                      <FileText size={36} className="mx-auto mb-2 opacity-50" />
                      <p className="font-bold">No clinical records found for this pet.</p>
                      <p className="text-xs mt-1">Start a consultation or add a record manually.</p>
                    </div>
                  ) : (
                    patientData.medicalRecords.map((rec) => (
                      <div key={rec.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-sky-50 text-sky-700 border border-sky-100">
                              {rec.examinationDate}
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {rec.veterinarianName ? `Attended by ${rec.veterinarianName}` : 'Veterinary Record'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {rec.weightKg && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                                {rec.weightKg} kg
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {rec.healthStatus || 'Examined'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {rec.symptoms && (
                            <div>
                              <span className="font-bold text-slate-400 uppercase text-[10px] block">Symptoms</span>
                              <p className="text-slate-800 font-medium mt-0.5">{rec.symptoms}</p>
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-400 uppercase text-[10px] block">Diagnosis</span>
                            <p className="text-slate-900 font-bold mt-0.5 text-sm">{rec.diagnosis}</p>
                          </div>
                          {rec.treatment && (
                            <div className="md:col-span-2">
                              <span className="font-bold text-slate-400 uppercase text-[10px] block">Treatment Plan</span>
                              <p className="text-slate-800 font-medium mt-0.5">{rec.treatment}</p>
                            </div>
                          )}
                          {rec.medication && (
                            <div>
                              <span className="font-bold text-slate-400 uppercase text-[10px] block">Prescribed Medication</span>
                              <p className="text-slate-800 font-medium mt-0.5">{rec.medication}</p>
                            </div>
                          )}
                          {rec.veterinaryNotes && (
                            <div>
                              <span className="font-bold text-slate-400 uppercase text-[10px] block">Veterinarian Notes</span>
                              <p className="text-slate-600 italic mt-0.5">{rec.veterinaryNotes}</p>
                            </div>
                          )}
                        </div>

                        {rec.followUpRequired && (
                          <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-xs flex items-center justify-between gap-2 text-amber-900 mt-2">
                            <span className="flex items-center gap-1.5 font-bold">
                              <AlertCircle size={14} className="text-amber-600" />
                              Follow-up Scheduled: {rec.followUpDate || 'TBD'}
                            </span>
                            <span className="text-amber-700">{rec.followUpNotes}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: APPOINTMENTS */}
              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800">Appointment History</h3>
                  {patientData.appointments?.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                      <Calendar size={36} className="mx-auto mb-2 opacity-50" />
                      <p className="font-bold">No appointments found for this pet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {patientData.appointments.map((appt) => (
                        <div key={appt.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-800">{appt.appointmentDate} at {appt.appointmentTime}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                appt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                                appt.status === 'IN_CONSULTATION' ? 'bg-amber-50 text-amber-700 animate-pulse' :
                                appt.status === 'CONFIRMED' || appt.status === 'UPCOMING' ? 'bg-sky-50 text-sky-700' :
                                appt.status === 'PENDING' ? 'bg-purple-50 text-purple-700' :
                                'bg-rose-50 text-rose-700'
                              }`}>
                                {appt.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Doctor: {appt.veterinarianName || 'Dr. Assigned'}</p>
                            {appt.notes && <p className="text-xs text-slate-600 italic">"{appt.notes}"</p>}
                          </div>

                          {(appt.status === 'UPCOMING' || appt.status === 'CONFIRMED' || appt.status === 'IN_CONSULTATION') && onStartConsultation && (
                            <button
                              onClick={() => {
                                onClose();
                                onStartConsultation(appt);
                              }}
                              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Stethoscope size={14} /> {appt.status === 'IN_CONSULTATION' ? 'Resume Consultation' : 'Start Consultation'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PRESCRIPTIONS */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800">Electronic Prescriptions</h3>
                  {patientData.prescriptions?.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                      <Pill size={36} className="mx-auto mb-2 opacity-50" />
                      <p className="font-bold">No prescriptions recorded yet.</p>
                    </div>
                  ) : (
                    patientData.prescriptions.map((rx) => (
                      <div key={rx.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-black text-sm">
                              Rx
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-slate-800">{rx.diagnosis || 'Prescription'}</h4>
                              <p className="text-[10px] text-slate-400 font-semibold">Issued on {rx.createdAt?.split('T')[0]} by {rx.veterinarianName || 'Doctor'}</p>
                            </div>
                          </div>
                        </div>

                        {rx.items && rx.items.length > 0 ? (
                          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                            {rx.items.map((item, idx) => (
                              <div key={idx} className="p-3 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                                <div>
                                  <span className="font-black text-slate-900">{item.medicationName}</span>
                                  <span className="text-slate-500 ml-2 font-semibold">({item.dosage})</span>
                                </div>
                                <div className="text-slate-600 font-medium">
                                  <span>{item.frequency}</span> • <span>{item.duration}</span>
                                </div>
                                {item.instructions && (
                                  <div className="text-[11px] text-slate-500 italic sm:text-right">
                                    {item.instructions}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">{rx.notes || 'No medication line items recorded.'}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: VACCINATIONS */}
              {activeTab === 'vaccinations' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-black text-slate-800">Immunization & Vaccine Registry</h3>
                    <button
                      onClick={() => setShowAddVaccine(true)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus size={14} /> Record Vaccine
                    </button>
                  </div>

                  {patientData.vaccinations?.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                      <Shield size={36} className="mx-auto mb-2 opacity-50" />
                      <p className="font-bold">No vaccination history recorded.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patientData.vaccinations.map((vac) => {
                        const isOverdue = vac.nextDueDate && new Date(vac.nextDueDate) < new Date();
                        return (
                          <div key={vac.id} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                                  <Shield size={16} className="text-teal-600" /> {vac.vaccineName}
                                </h4>
                                {vac.nextDueDate && (
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                    isOverdue ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-teal-50 text-teal-700'
                                  }`}>
                                    {isOverdue ? 'Overdue' : 'Due: ' + vac.nextDueDate}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-medium mt-2">
                                Administered: <strong>{vac.dateAdministered}</strong>
                              </p>
                              {vac.batchLotNumber && (
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Batch / Lot: {vac.batchLotNumber}</p>
                              )}
                              {vac.notes && <p className="text-xs text-slate-600 italic mt-2">"{vac.notes}"</p>}
                            </div>

                            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
                              Administered by {vac.veterinarianName || 'Doctor'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-black text-slate-800">Lab Results & Clinical Documents</h3>
                    <button
                      onClick={() => setShowUploadDoc(true)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload size={14} /> Upload Document
                    </button>
                  </div>

                  {patientData.documents?.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                      <Upload size={36} className="mx-auto mb-2 opacity-50" />
                      <p className="font-bold">No uploaded medical files yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {patientData.documents.map((doc) => (
                        <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-sky-50 text-sky-700">
                                {doc.documentType}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">{doc.uploadedAt?.split('T')[0]}</span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-800 mt-2 truncate">{doc.documentName}</h4>
                            {doc.fileSize && <p className="text-[11px] text-slate-400">{doc.fileSize}</p>}
                            {doc.notes && <p className="text-xs text-slate-600 italic mt-1.5">{doc.notes}</p>}
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">By {doc.uploadedByName || 'User'}</span>
                            {doc.documentBase64 && (
                              <a
                                href={doc.documentBase64}
                                download={doc.documentName || 'document'}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <Download size={12} /> Download
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: FOLLOW-UPS */}
              {activeTab === 'followups' && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800">Pending Clinical Follow-ups</h3>
                  {patientData.followUps?.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                      <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-500 opacity-80" />
                      <p className="font-bold text-slate-700">All caught up!</p>
                      <p className="text-xs mt-1">No pending follow-ups flagged for this patient.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {patientData.followUps.map((fu) => {
                        const isOverdue = fu.followUpDate && new Date(fu.followUpDate) < new Date();
                        return (
                          <div key={fu.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  isOverdue ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {isOverdue ? 'Overdue Follow-up' : 'Scheduled Follow-up'}
                                </span>
                                <span className="font-bold text-sm text-slate-900">{fu.followUpDate}</span>
                              </div>
                              <p className="text-xs text-slate-700 font-semibold mt-1">Reason / Diagnosis: {fu.diagnosis}</p>
                              {fu.followUpNotes && (
                                <p className="text-xs text-slate-500 italic">Instructions: {fu.followUpNotes}</p>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-medium shrink-0">
                              Dr. {fu.veterinarianName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: VETSCAN AI LESION SCREENING & CLINICAL REVIEW */}
              {activeTab === 'vetscan' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <ScanLine size={18} className="text-sky-600" />
                        Canine Dermal VetScan AI Reports
                      </h3>
                      <p className="text-xs text-slate-500">
                        Review preliminary skin lesion screenings, evaluate Grad-CAM feature activations, and record clinical verdicts.
                      </p>
                    </div>
                  </div>

                  {vetScanRecords.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                      <ScanLine size={36} className="mx-auto mb-2 opacity-50" />
                      <p className="font-bold">No VetScan lesion screenings logged for this patient.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vetScanRecords.map((scan) => (
                        <div key={scan.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">
                                  Screening #{scan.id}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  scan.severity === 'SEVERE'
                                    ? 'bg-rose-50 text-rose-700'
                                    : scan.severity === 'MODERATE'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  Severity: {scan.severity}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-50 text-sky-700 uppercase">
                                  {scan.progressionStatus}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Submitted: {new Date(scan.createdAt).toLocaleString()} • Model: {scan.modelName} ({scan.modelVersion})
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {scan.veterinarianReviewStatus && scan.veterinarianReviewStatus !== 'PENDING' ? (
                                <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Reviewed: {scan.veterinarianReviewStatus} by Dr. {scan.veterinarianName}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setReviewingScanId(scan.id)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition-colors cursor-pointer"
                                >
                                  Record Clinical Review
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                            {/* Lesion Photographs */}
                            <div className="md:col-span-5 flex gap-2">
                              <div className="flex-1 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Photograph</span>
                                <img
                                  src={scan.imageReference}
                                  alt="Lesion"
                                  className="w-full h-32 object-cover rounded-xl border border-slate-200"
                                />
                              </div>
                              {scan.explanationImageReference && (
                                <div className="flex-1 space-y-1">
                                  <span className="text-[10px] font-bold text-sky-600 uppercase">Grad-CAM Heatmap</span>
                                  <img
                                    src={scan.explanationImageReference}
                                    alt="Grad-CAM Heatmap"
                                    className="w-full h-32 object-cover rounded-xl border border-sky-200"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Lesion Scores */}
                            <div className="md:col-span-7 space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Model Lesion Probabilities</span>
                              <div className="grid grid-cols-2 gap-2">
                                {scan.predictions?.map((pred) => (
                                  <div key={pred.label} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                    <div className="flex justify-between font-bold">
                                      <span className="text-slate-700">{pred.displayName}</span>
                                      <span className={pred.detected ? 'text-sky-700 font-black' : 'text-slate-400'}>
                                        {Math.round(pred.probability * 100)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {scan.veterinarianNotes && (
                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 mt-2">
                                  <span className="font-bold">Clinical Notes:</span> {scan.veterinarianNotes}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Review Action Form Modal/Inline */}
                          {reviewingScanId === scan.id && (
                            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3 mt-3">
                              <h4 className="text-xs font-bold text-sky-900">Veterinarian Clinical Review</h4>
                              <div className="flex gap-2">
                                {['AGREE', 'DISAGREE', 'REQUIRES_FURTHER_EXAMINATION'].map((stat) => (
                                  <button
                                    key={stat}
                                    type="button"
                                    onClick={() => setReviewForm((f) => ({ ...f, reviewStatus: stat }))}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                      reviewForm.reviewStatus === stat
                                        ? 'bg-sky-600 text-white shadow-sm'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {stat.replace(/_/g, ' ')}
                                  </button>
                                ))}
                              </div>

                              <textarea
                                value={reviewForm.veterinarianNotes}
                                onChange={(e) => setReviewForm((f) => ({ ...f, veterinarianNotes: e.target.value }))}
                                placeholder="Enter clinical assessment notes, confirmatory diagnosis, or diagnostic cytology recommendations..."
                                rows={2}
                                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                              />

                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setReviewingScanId(null)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReviewScan(scan.id)}
                                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-colors cursor-pointer"
                                >
                                  Save Review
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close Chart
          </button>
        </div>
      </div>

      {/* SUB-MODAL: Add Medical Record */}
      {showAddRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Stethoscope size={20} className="text-sky-600" /> New Clinical Record
              </h3>
              <button onClick={() => setShowAddRecord(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={recordForm.weightKg}
                    onChange={(e) => setRecordForm({ ...recordForm, weightKg: e.target.value })}
                    placeholder="e.g. 14.5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Health Status</label>
                  <select
                    value={recordForm.healthStatus}
                    onChange={(e) => setRecordForm({ ...recordForm, healthStatus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500"
                  >
                    <option value="Examined">Examined (Normal)</option>
                    <option value="Under Treatment">Under Treatment</option>
                    <option value="Recovering">Recovering</option>
                    <option value="Critical">Critical</option>
                    <option value="Healthy">Healthy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Presenting Symptoms</label>
                <input
                  type="text"
                  value={recordForm.symptoms}
                  onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
                  placeholder="e.g. Lethargy, vomiting for 2 days, loss of appetite"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={recordForm.diagnosis}
                  onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  placeholder="e.g. Acute Gastroenteritis, Mild Dehydration"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Plan</label>
                <textarea
                  rows="2"
                  value={recordForm.treatment}
                  onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
                  placeholder="e.g. IV Fluid resuscitation, anti-emetic injection, bland diet"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medications Summary</label>
                <input
                  type="text"
                  value={recordForm.medication}
                  onChange={(e) => setRecordForm({ ...recordForm, medication: e.target.value })}
                  placeholder="e.g. Ondansetron 4mg BID x 3d, Probiotics"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Veterinarian Clinical Notes</label>
                <textarea
                  rows="2"
                  value={recordForm.veterinaryNotes}
                  onChange={(e) => setRecordForm({ ...recordForm, veterinaryNotes: e.target.value })}
                  placeholder="Additional observations, lab remarks..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {/* Follow-up Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl space-y-3 border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recordForm.followUpRequired}
                    onChange={(e) => setRecordForm({ ...recordForm, followUpRequired: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-xs font-bold text-slate-800">Schedule Follow-up Visit</span>
                </label>

                {recordForm.followUpRequired && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Follow-up Date</label>
                      <input
                        type="date"
                        value={recordForm.followUpDate}
                        onChange={(e) => setRecordForm({ ...recordForm, followUpDate: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Follow-up Instructions</label>
                      <input
                        type="text"
                        value={recordForm.followUpNotes}
                        onChange={(e) => setRecordForm({ ...recordForm, followUpNotes: e.target.value })}
                        placeholder="e.g. Suture removal / checkup"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecord(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {modalSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Save Medical Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: Add Vaccination */}
      {showAddVaccine && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Shield size={20} className="text-teal-600" /> Record Vaccination
              </h3>
              <button onClick={() => setShowAddVaccine(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVaccine} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vaccine Name *</label>
                <input
                  type="text"
                  required
                  value={vaccineForm.vaccineName}
                  onChange={(e) => setVaccineForm({ ...vaccineForm, vaccineName: e.target.value })}
                  placeholder="e.g. Rabies, DHPP, FVRCP, Bordetella"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date Administered</label>
                  <input
                    type="date"
                    required
                    value={vaccineForm.dateAdministered}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, dateAdministered: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    value={vaccineForm.nextDueDate}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, nextDueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch / Lot Number</label>
                <input
                  type="text"
                  value={vaccineForm.batchLotNumber}
                  onChange={(e) => setVaccineForm({ ...vaccineForm, batchLotNumber: e.target.value })}
                  placeholder="e.g. LOT-2024-9988X"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Reactions</label>
                <input
                  type="text"
                  value={vaccineForm.notes}
                  onChange={(e) => setVaccineForm({ ...vaccineForm, notes: e.target.value })}
                  placeholder="e.g. Well tolerated, left shoulder site"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVaccine(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {modalSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Record Vaccine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: Upload Document */}
      {showUploadDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Upload size={20} className="text-sky-600" /> Upload Medical File
              </h3>
              <button onClick={() => setShowUploadDoc(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Type</label>
                <select
                  value={docForm.documentType}
                  onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500"
                >
                  <option value="LAB_REPORT">Lab Investigation / Bloodwork</option>
                  <option value="XRAY">Radiograph (X-Ray) / Ultrasound</option>
                  <option value="PRESCRIPTION">Prescription Slip</option>
                  <option value="VACCINE_CARD">Immunization Certificate</option>
                  <option value="SURGERY_REPORT">Surgery / Discharge Summary</option>
                  <option value="OTHER">Other Clinical Record</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select File (PDF / Images)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  required
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                />
                {docForm.documentName && (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">Selected: {docForm.documentName} ({docForm.fileSize})</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Remarks / Notes</label>
                <input
                  type="text"
                  value={docForm.notes}
                  onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })}
                  placeholder="e.g. Complete Blood Count showing elevated WBC"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadDoc(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting || !docForm.documentBase64}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {modalSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
