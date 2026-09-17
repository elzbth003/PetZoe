import React, { useState, useEffect } from 'react';
import { prescriptionApi } from '../../../services/medicalApi';
import { vetClinicalService } from '../../../services/vetClinicalService';
import api from '../../../services/api';
import {
  FileText, Calendar, Info, Clock, Shield, Pill, Download,
  Stethoscope, AlertCircle, CheckCircle2, User as UserIcon, Loader2
} from 'lucide-react';

export default function MedicalRecordsView() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [activeTab, setActiveTab] = useState('clinical');

  const [clinicalRecords, setClinicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const [recRes, rxRes, vacRes, docRes] = await Promise.allSettled([
        vetClinicalService.getPetMedicalRecords(petId),
        prescriptionApi.getByPet(petId),
        vetClinicalService.getPetVaccinations(petId),
        vetClinicalService.getPetDocuments(petId),
      ]);

      if (recRes.status === 'fulfilled') setClinicalRecords(recRes.value || []);
      if (rxRes.status === 'fulfilled') setPrescriptions(rxRes.value.data || []);
      if (vacRes.status === 'fulfilled') setVaccinations(vacRes.value || []);
      if (docRes.status === 'fulfilled') setDocuments(docRes.value || []);
    } catch (error) {
      console.error('Error loading complete medical records:', error);
    } finally {
      setLoading(false);
    }
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
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 w-fit">
              <span className="text-[10px] font-black uppercase text-slate-400">Pet ID:</span>
              <span className="font-mono text-xs font-bold text-blue-700 select-all">
                {selectedPet.petCode || `PZ-PET-${String(selectedPet.id).padStart(6, '0')}`}
              </span>
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
          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
            {[
              { id: 'clinical', label: 'Consultations', icon: Stethoscope, count: clinicalRecords.length },
              { id: 'prescriptions', label: 'Prescriptions (Rx)', icon: Pill, count: prescriptions.length },
              { id: 'vaccines', label: 'Vaccinations', icon: Shield, count: vaccinations.length },
              { id: 'documents', label: 'Lab Reports & Docs', icon: FileText, count: documents.length },
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
