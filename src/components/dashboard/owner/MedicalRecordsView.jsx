import React, { useState, useEffect } from 'react';
import { prescriptionApi } from '../../../services/medicalApi';
import { vetClinicalService } from '../../../services/vetClinicalService';
import vetScanService from '../../../services/vetScanService';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { printPetMedicalReportPdf, downloadMedicalReportFile } from '../../../utils/medicalReportPdfGenerator';
import {
  FileText, Calendar, Info, Clock, Shield, Pill, Download,
  Stethoscope, AlertCircle, CheckCircle2, User as UserIcon, Loader2,
  ScanLine, Eye, Printer, ChevronDown
} from 'lucide-react';

export default function MedicalRecordsView() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [activeTab, setActiveTab] = useState('clinical');

  const [clinicalRecords, setClinicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [vetScanRecords, setVetScanRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const loadPets = async () => {
      try {
        const response = await api.get('/pets');
        setPets(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedPet(response.data[0]);
        }
      } catch (error) {
        console.error('Error loading pets:', error);
      }
    };
    loadPets();
  }, []);

  useEffect(() => {
    if (selectedPet) {
      loadAllPetRecords(selectedPet.id);
    }
  }, [selectedPet]);

  const loadAllPetRecords = async (petId) => {
    setLoading(true);
    try {
      const [recRes, rxRes, vacRes, docRes, scanRes] = await Promise.allSettled([
        vetClinicalService.getPetMedicalRecords(petId),
        prescriptionApi.getByPet(petId),
        vetClinicalService.getPetVaccinations(petId),
        vetClinicalService.getPetDocuments(petId),
        vetScanService.getScansByPet(petId),
      ]);

      if (recRes.status === 'fulfilled') setClinicalRecords(recRes.value || []);
      if (rxRes.status === 'fulfilled') setPrescriptions(rxRes.value.data || []);
      if (vacRes.status === 'fulfilled') setVaccinations(vacRes.value || []);
      if (docRes.status === 'fulfilled') setDocuments(docRes.value || []);
      if (scanRes.status === 'fulfilled') setVetScanRecords(scanRes.value || []);
    } catch (error) {
      console.error('Error loading complete medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!selectedPet) return;
    setDownloadingPdf(true);
    setShowExportMenu(false);
    try {
      printPetMedicalReportPdf({
        pet: selectedPet,
        owner: user,
        clinicalRecords,
        prescriptions,
        vaccinations,
        documents,
        vetScanRecords,
      });
    } catch (err) {
      console.error('Failed to generate medical report PDF:', err);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 800);
    }
  };

  const handleDownloadHtmlFile = () => {
    if (!selectedPet) return;
    setShowExportMenu(false);
    downloadMedicalReportFile({
      pet: selectedPet,
      owner: user,
      clinicalRecords,
      prescriptions,
      vaccinations,
      documents,
      vetScanRecords,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-left">
      {/* Pet Selector Header */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" /> Complete Pet Health & Clinical History
          </h2>
          {selectedPet && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 w-fit">
                <span className="text-[10px] font-black uppercase text-slate-400">Pet ID:</span>
                <span className="font-mono text-xs font-bold text-blue-700 select-all">
                  {selectedPet.petCode || `PZ-PET-${String(selectedPet.id).padStart(6, '0')}`}
                </span>
              </div>

              {/* Action: Download PDF Report */}
              <div className="relative">
                <div className="inline-flex rounded-xl shadow-xs overflow-hidden border border-blue-600">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={loading || downloadingPdf}
                    className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download and print complete medical report as PDF"
                  >
                    {downloadingPdf ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    <span>Download PDF Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExportMenu((prev) => !prev)}
                    disabled={loading || downloadingPdf}
                    className="px-2 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs border-l border-blue-500 transition-all cursor-pointer disabled:opacity-50"
                    title="More export options"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-blue-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <Printer size={15} className="text-blue-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-800">Print / Save as PDF</div>
                        <div className="text-[10px] text-slate-400">Formatted A4 clinical record</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadHtmlFile}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer border-t border-slate-100 transition-colors"
                    >
                      <Download size={15} className="text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-800">Download Raw File</div>
                        <div className="text-[10px] text-slate-400">Standalone offline HTML file</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {pets.length === 0 ? (
          <p className="text-slate-500 text-sm">You haven't added any pets yet.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all whitespace-nowrap cursor-pointer text-xs font-bold ${
                  selectedPet?.id === pet.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {pet.photoUrl && (
                  <img src={pet.photoUrl} alt={pet.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200" />
                )}
                <span>{pet.name}</span>
                <span className="text-[10px] font-semibold opacity-70">({pet.species})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPet && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          {/* Health Passport & EHR Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-md">
                  Digital Health Passport
                </span>
                <span className="text-xs text-slate-300">• Verified EHR</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {selectedPet.name}'s Medical Chart & EHR Summary
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Official clinical compilation including diagnostic examinations, active prescriptions (Rx), immunizations, and VetScan AI screenings. Printable as an authenticated veterinary report.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={loading || downloadingPdf}
              className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {downloadingPdf ? (
                <Loader2 size={15} className="animate-spin text-blue-600" />
              ) : (
                <Printer size={15} className="text-blue-600" />
              )}
              <span>Export PDF Report</span>
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
            {[
              { id: 'clinical', label: 'Consultations', icon: Stethoscope, count: clinicalRecords.length },
              { id: 'prescriptions', label: 'Prescriptions (Rx)', icon: Pill, count: prescriptions.length },
              { id: 'vaccines', label: 'Vaccinations', icon: Shield, count: vaccinations.length },
              { id: 'documents', label: 'Lab Reports & Docs', icon: FileText, count: documents.length },
              { id: 'vetscan', label: 'VetScan AI Reports', icon: ScanLine, count: vetScanRecords.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="animate-spin text-blue-500" size={28} />
              <p className="text-xs font-semibold">Retrieving medical chart for {selectedPet.name}...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: CLINICAL CONSULTATIONS */}
              {activeTab === 'clinical' && (
                <div className="space-y-4">
                  {clinicalRecords.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <Stethoscope size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-xs font-medium">No clinical consultations recorded yet for {selectedPet.name}.</p>
                    </div>
                  ) : (
                    clinicalRecords.map((rec) => (
                      <div key={rec.id} className="border border-slate-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all bg-white relative overflow-hidden space-y-3">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              {rec.healthStatus || 'Examined'}
                            </span>
                            <h4 className="font-bold text-base text-slate-900 mt-1">{rec.diagnosis}</h4>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <UserIcon size={13} className="text-slate-400" /> Examined by Dr. {rec.veterinarianName || 'Attending Vet'}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                            <Calendar size={12} /> {rec.examinationDate}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl">
                          {rec.symptoms && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Symptoms</p>
                              <p className="text-slate-700 font-medium mt-0.5">{rec.symptoms}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Treatment Plan</p>
                            <p className="text-slate-700 font-medium mt-0.5">{rec.treatment}</p>
                          </div>
                          {rec.medication && (
                            <div className="md:col-span-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Medication Notes</p>
                              <p className="text-slate-700 font-medium mt-0.5">{rec.medication}</p>
                            </div>
                          )}
                        </div>

                        {rec.followUpRequired && (
                          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1.5">
                              <AlertCircle size={14} className="text-amber-600" />
                              Follow-up Due: {rec.followUpDate}
                            </span>
                            <span className="text-amber-700">{rec.followUpNotes}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: PRESCRIPTIONS */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  {prescriptions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <Pill size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-xs font-medium">No prescriptions found for {selectedPet.name}.</p>
                    </div>
                  ) : (
                    prescriptions.map((prescription) => (
                      <div key={prescription.id} className="border border-slate-200 rounded-2xl p-5 hover:border-purple-200 hover:shadow-md transition-all bg-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-base text-slate-900">{prescription.medicineName}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <UserIcon size={13} className="text-slate-400" /> Prescribed by Dr. {prescription.veterinarianName}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
                            <Calendar size={12} /> {new Date(prescription.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Dosage</p>
                            <p className="text-slate-800 font-medium">{prescription.dosage}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Frequency</p>
                            <p className="text-slate-800 font-medium flex items-center gap-1">
                              <Clock size={12} className="text-slate-400" /> {prescription.frequency}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Duration</p>
                            <p className="text-slate-800 font-medium">{prescription.duration}</p>
                          </div>
                        </div>

                        {prescription.instructions && (
                          <div className="flex gap-2 items-start mt-3 pt-3 border-t border-slate-100 text-xs">
                            <Info size={15} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Instructions</p>
                              <p className="text-slate-700 italic">{prescription.instructions}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: VACCINATIONS */}
              {activeTab === 'vaccines' && (
                <div className="space-y-4">
                  {vaccinations.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <Shield size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-xs font-medium">No vaccination records available for {selectedPet.name}.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {vaccinations.map((vac) => {
                        const isOverdue = vac.nextDueDate && new Date(vac.nextDueDate) < new Date();
                        return (
                          <div key={vac.id} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                                <Shield size={16} className="text-teal-600" /> {vac.vaccineName}
                              </h4>
                              {vac.nextDueDate && (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  isOverdue ? 'bg-rose-50 text-rose-700' : 'bg-teal-50 text-teal-700'
                                }`}>
                                  {isOverdue ? 'Overdue' : 'Due: ' + vac.nextDueDate}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600">
                              Administered on: <strong>{vac.dateAdministered}</strong>
                            </p>
                            {vac.batchLotNumber && (
                              <p className="text-[10px] text-slate-400 font-mono">Lot: {vac.batchLotNumber}</p>
                            )}
                            <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 mt-2">
                              By Dr. {vac.veterinarianName || 'Doctor'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {documents.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <FileText size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-xs font-medium">No lab reports or documents uploaded yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {documents.map((doc) => (
                        <div key={doc.id} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                {doc.documentType}
                              </span>
                              <span className="text-[10px] text-slate-400">{doc.uploadedAt?.split('T')[0]}</span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-800 mt-2 truncate">{doc.documentName}</h4>
                            {doc.notes && <p className="text-xs text-slate-500 italic mt-1">{doc.notes}</p>}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">By {doc.uploadedByName || 'Clinic'}</span>
                            {doc.documentBase64 && (
                              <a
                                href={doc.documentBase64}
                                download={doc.documentName || 'document'}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
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

              {/* TAB 5: VETSCAN AI SCREENING REPORTS */}
              {activeTab === 'vetscan' && (
                <div className="space-y-4">
                  {vetScanRecords.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <ScanLine size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-xs font-medium">No VetScan lesion screening reports logged yet for {selectedPet.name}.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vetScanRecords.map((scan) => (
                        <div key={scan.id} className="border border-slate-200 rounded-3xl p-5 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <ScanLine size={16} />
                              </span>
                              <div>
                                <h4 className="font-bold text-sm text-slate-800">
                                  Preliminary Lesion Screening #{scan.id}
                                </h4>
                                <p className="text-[10px] text-slate-400">
                                  {new Date(scan.createdAt).toLocaleString()} • Model: {scan.modelName} ({scan.modelVersion})
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${
                                scan.severity === 'SEVERE'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : scan.severity === 'MODERATE'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {scan.severity}
                              </span>

                              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                                {scan.progressionStatus}
                              </span>

                              {scan.veterinarianReviewStatus && scan.veterinarianReviewStatus !== 'PENDING' && (
                                <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                                  Vet Reviewed: {scan.veterinarianReviewStatus}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                            {/* Images: Original & Grad-CAM */}
                            <div className="md:col-span-5 flex gap-2">
                              <div className="flex-1 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Photograph</span>
                                <img
                                  src={scan.imageReference}
                                  alt="Lesion Photograph"
                                  className="w-full h-32 object-cover rounded-xl border border-slate-200"
                                />
                              </div>
                              {scan.explanationImageReference && (
                                <div className="flex-1 space-y-1">
                                  <span className="text-[10px] font-bold text-blue-600 uppercase">Grad-CAM Heatmap</span>
                                  <img
                                    src={scan.explanationImageReference}
                                    alt="Grad-CAM Heatmap"
                                    className="w-full h-32 object-cover rounded-xl border border-blue-200"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Predictions & Findings */}
                            <div className="md:col-span-7 space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Screening Indicators</span>
                              <div className="grid grid-cols-2 gap-2">
                                {scan.predictions?.map((pred) => (
                                  <div key={pred.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                    <div className="flex justify-between font-bold">
                                      <span className="text-slate-700">{pred.displayName}</span>
                                      <span className={pred.detected ? 'text-blue-700' : 'text-slate-400'}>
                                        {Math.round(pred.probability * 100)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {scan.veterinarianNotes && (
                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 mt-2">
                                  <span className="font-bold">Dr. {scan.veterinarianName || 'Veterinarian'} Notes:</span> {scan.veterinarianNotes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
