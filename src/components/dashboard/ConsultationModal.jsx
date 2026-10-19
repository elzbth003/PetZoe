import React, { useState, useEffect } from 'react';
import {
  X, Stethoscope, PawPrint, Calendar, Clock, User, Plus, Trash2,
  AlertCircle, CheckCircle2, Pill, Loader2, Sparkles, Shield,
  FileText, ScanLine, Eye, ChevronDown, ChevronUp, History
} from 'lucide-react';
import { vetClinicalService } from '../../services/vetClinicalService';
import vetScanService from '../../services/vetScanService';
import { useToast } from '../../hooks/useToast';

export default function ConsultationModal({ appointment, isOpen, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [patientDetail, setPatientDetail] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [historyTab, setHistoryTab] = useState('scans'); // 'scans', 'records', 'prescriptions'
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    weightKg: '',
    healthStatus: 'Under Treatment',
    symptoms: appointment?.notes || '',
    diagnosis: '',
    treatment: '',
    medication: '',
    labInvestigations: '',
    veterinaryNotes: '',
    followUpRequired: false,
    followUpDate: '',
    followUpNotes: '',
  });

  const [prescriptionItems, setPrescriptionItems] = useState([
    { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);

  useEffect(() => {
    if (isOpen && appointment?.petId) {
      const loadPatient = async () => {
        setPatientLoading(true);
        try {
          const data = await vetClinicalService.getPatientDetail(appointment.petId);
          setPatientDetail(data);
          if (data?.pet?.weight && !formData.weightKg) {
            setFormData(prev => ({ ...prev, weightKg: data.pet.weight }));
          }
        } catch (err) {
          console.error("Failed to load patient history in consultation room", err);
        } finally {
          setPatientLoading(false);
        }
      };
      loadPatient();
    }
  }, [isOpen, appointment?.petId]);

  if (!isOpen || !appointment) return null;

  const handleAddMedicine = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (prescriptionItems.length === 1) {
      setPrescriptionItems([{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      return;
    }
    setPrescriptionItems(prescriptionItems.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...prescriptionItems];
    updated[index][field] = value;
    setPrescriptionItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.diagnosis.trim()) {
      showToast('Please provide a clinical diagnosis', 'error');
      return;
    }
    if (!formData.treatment.trim()) {
      showToast('Please provide a treatment plan', 'error');
      return;
    }

    // Filter valid prescriptions
    const validPrescriptions = prescriptionItems.filter((p) => p.medicineName.trim() !== '');

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        followUpDate: formData.followUpRequired && formData.followUpDate ? formData.followUpDate : null,
        prescriptions: validPrescriptions,
      };

      await vetClinicalService.completeConsultation(appointment.id, payload);
      showToast('Consultation completed & records updated successfully!', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete consultation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <Stethoscope size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">Active Consultation Room</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  In Progress
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
                <span className="font-bold text-white flex items-center gap-1">
                  <PawPrint size={14} className="text-sky-400" /> {appointment.petName}
                </span>
                <span>•</span>
                <span>Owner: {appointment.ownerName || 'Client'}</span>
                <span>•</span>
                <span>Date: {appointment.appointmentDate} at {appointment.appointmentTime}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          
          {/* Patient 360 & Medical Records Banner */}
          <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
            <div 
              onClick={() => setShowHistory(!showHistory)}
              className="p-4 bg-gradient-to-r from-sky-50 to-blue-50/50 flex items-center justify-between cursor-pointer border-b border-sky-100"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center">
                  <History size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    Patient Medical History & Diagnostic Scans
                    {patientLoading && <Loader2 size={12} className="animate-spin text-sky-500" />}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Review past clinical records, prescriptions, and AI screening reports for this patient
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-sky-700 bg-white px-2.5 py-1 rounded-lg border border-sky-200">
                  {patientDetail?.medicalRecords?.length || 0} Records • {patientDetail?.vetScanRecords?.length || 0} AI Scans
                </span>
                {showHistory ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>
            </div>

            {showHistory && (
              <div className="p-4 space-y-3 bg-white">
                {/* History tabs */}
                <div className="flex gap-2 border-b border-slate-100 pb-2">
                  <button
                    type="button"
                    onClick={() => setHistoryTab('scans')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      historyTab === 'scans'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ScanLine size={13} /> AI VetScan Reports ({patientDetail?.vetScanRecords?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryTab('records')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      historyTab === 'records'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <FileText size={13} /> Past Clinical Records ({patientDetail?.medicalRecords?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryTab('prescriptions')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      historyTab === 'prescriptions'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Pill size={13} /> Prescriptions ({patientDetail?.prescriptions?.length || 0})
                  </button>
                </div>

                {/* Tab content */}
                {patientLoading ? (
                  <div className="py-8 flex justify-center items-center gap-2 text-slate-400 text-xs">
                    <Loader2 size={16} className="animate-spin text-sky-500" /> Loading patient medical records...
                  </div>
                ) : historyTab === 'scans' ? (
                  patientDetail?.vetScanRecords?.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {patientDetail.vetScanRecords.map((scan) => (
                        <div key={scan.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">
                                Scan #{scan.id} — {scan.severityDescription || scan.severity}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                scan.severity === 'SEVERE' ? 'bg-rose-100 text-rose-700' :
                                scan.severity === 'MODERATE' ? 'bg-amber-100 text-amber-700' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>
                                {scan.severity}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-700">
                                {scan.progressionStatus || 'BASELINE'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(scan.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            <div className="sm:col-span-4 flex gap-2">
                              {scan.imageReference && (
                                <img
                                  src={scan.imageReference}
                                  alt="Lesion Photo"
                                  className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                                />
                              )}
                              {scan.explanationImageReference && (
                                <img
                                  src={scan.explanationImageReference}
                                  alt="Grad-CAM Heatmap"
                                  className="w-16 h-16 object-cover rounded-lg border border-sky-300"
                                  title="Grad-CAM Heatmap"
                                />
                              )}
                            </div>
                            <div className="sm:col-span-8 space-y-1">
                              <div className="flex flex-wrap gap-1">
                                {scan.predictions?.map((pred) => (
                                  <span
                                    key={pred.label}
                                    className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                      pred.detected
                                        ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
                                        : 'bg-white border-slate-200 text-slate-500'
                                    }`}
                                  >
                                    {pred.displayName}: {Math.round(pred.probability * 100)}%
                                  </span>
                                ))}
                              </div>
                              {scan.veterinarianNotes && (
                                <p className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                                  Notes: {scan.veterinarianNotes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-3 text-center">No AI skin screening records found for this patient.</p>
                  )
                ) : historyTab === 'records' ? (
                  patientDetail?.medicalRecords?.length > 0 ? (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {patientDetail.medicalRecords.map((rec) => (
                        <div key={rec.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">
                              {rec.diagnosis} • {rec.healthStatus}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {rec.examinationDate} (Dr. {rec.veterinarianName})
                            </span>
                          </div>
                          {rec.symptoms && (
                            <p className="text-slate-600 text-[11px]"><span className="font-semibold">Symptoms:</span> {rec.symptoms}</p>
                          )}
                          {rec.treatment && (
                            <p className="text-slate-600 text-[11px]"><span className="font-semibold">Treatment:</span> {rec.treatment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-3 text-center">No previous clinical examination records on file.</p>
                  )
                ) : (
                  patientDetail?.prescriptions?.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {patientDetail.prescriptions.map((rx) => (
                        <div key={rx.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-purple-800">{rx.medicineName}</span>
                            <span className="text-slate-500 text-[11px] ml-2">({rx.dosage} • {rx.frequency} • {rx.duration})</span>
                            {rx.instructions && <p className="text-[10px] text-slate-400">{rx.instructions}</p>}
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-3 text-center">No previous prescriptions recorded.</p>
                  )
                )}
              </div>
            )}
          </div>

          {/* Section 1: Vitals & Evaluation */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <PawPrint size={16} className="text-sky-600" /> 1. Clinical Examination & Vitals
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pet Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                  placeholder="e.g. 24.5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Health Status</label>
                <select
                  value={formData.healthStatus}
                  onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                >
                  <option value="Under Treatment">Under Treatment</option>
                  <option value="Recovering">Recovering</option>
                  <option value="Healthy">Healthy (Normal)</option>
                  <option value="Examined">Examined</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Observed Symptoms / Chief Complaints</label>
              <input
                type="text"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="e.g. Coughing, high body temperature (103°F), decreased water intake"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="e.g. Canine Infectious Tracheobronchitis (Kennel Cough)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Lab / Diagnostic Tests Advised</label>
                <input
                  type="text"
                  value={formData.labInvestigations}
                  onChange={(e) => setFormData({ ...formData, labInvestigations: e.target.value })}
                  placeholder="e.g. CBC Blood Panel, Chest X-Ray"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Treatment Plan Administered *</label>
              <textarea
                rows="2"
                required
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                placeholder="e.g. Nebulization therapy administered in clinic. Prescribed oral bronchodilator and antibiotics. Humidified rest advised."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Doctor's Clinical Notes (Optional)</label>
              <textarea
                rows="2"
                value={formData.veterinaryNotes}
                onChange={(e) => setFormData({ ...formData, veterinaryNotes: e.target.value })}
                placeholder="Clinical observations for medical chart..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-colors resize-none"
              />
            </div>
          </div>

          {/* Section 2: Electronic Prescription Builder */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Pill size={16} className="text-purple-600" /> 2. Electronic Prescription (Rx)
              </h3>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {prescriptionItems.map((item, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-700">Medication #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(index)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Medication Name</label>
                      <input
                        type="text"
                        value={item.medicineName}
                        onChange={(e) => handleMedicineChange(index, 'medicineName', e.target.value)}
                        placeholder="e.g. Amoxicillin 250mg"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dosage</label>
                      <input
                        type="text"
                        value={item.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        placeholder="e.g. 1 Tablet"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Frequency</label>
                      <input
                        type="text"
                        value={item.frequency}
                        onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                        placeholder="e.g. Twice daily after food"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Duration</label>
                      <input
                        type="text"
                        value={item.duration}
                        onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                        placeholder="e.g. 7 Days"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Specific Instructions</label>
                    <input
                      type="text"
                      value={item.instructions}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                      placeholder="e.g. Give with a small amount of wet food. Complete the full antibiotic course."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Follow-up Scheduling */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} className="text-amber-600" /> 3. Follow-up Care
            </h3>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.followUpRequired}
                onChange={(e) => setFormData({ ...formData, followUpRequired: e.target.checked })}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs font-bold text-slate-800">Recommend a Follow-up Visit</span>
            </label>

            {formData.followUpRequired && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Follow-up Notes / Objective</label>
                  <input
                    type="text"
                    value={formData.followUpNotes}
                    onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                    placeholder="e.g. Recheck lung sounds and temperature"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium">
              Completing this consultation will automatically mark the appointment as completed, archive clinical notes, generate prescription records, and notify the pet owner.
            </p>
            <div className="flex gap-3 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Save & Complete Consultation
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
