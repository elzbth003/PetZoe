import React, { useState, useEffect } from 'react';
import {
  ScanLine, AlertTriangle, ShieldCheck, CheckCircle2, AlertCircle,
  Calendar, FileText, ChevronRight, Stethoscope, Eye, EyeOff,
  RefreshCw, Upload, Image as ImageIcon, Sparkles, Activity, Clock,
  ArrowUpRight, ArrowDownRight, Minus, HelpCircle, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import vetScanService from '../../../services/vetScanService';
import { useToast } from '../../../hooks/useToast';
import SelectDropdown from '../../ui/SelectDropdown';

export default function VetScanView({ onNavigateToAppointments, onNavigateToRecords }) {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showGradCam, setShowGradCam] = useState(true);
  const [recentScans, setRecentScans] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);

  // Structured Symptom Intake
  const [symptoms, setSymptoms] = useState({
    itching: false,
    redness: false,
    hairLoss: false,
    crusting: false,
    swelling: false,
    odor: false,
    discharge: false,
    duration: 'Less than 1 week',
    bodyLocation: 'Dorsal Trunk / Flank',
  });

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadCaninePets();
  }, []);

  const loadCaninePets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pets');
      const allPets = res.data || [];
      // Prefer dogs or allow all pets
      const dogs = allPets.filter((p) => p.species?.toLowerCase() === 'dog');
      const petList = dogs.length > 0 ? dogs : allPets;
      setPets(petList);
      if (petList.length > 0) {
        setSelectedPet(petList[0]);
        loadPetScanHistory(petList[0].id);
      }
    } catch (err) {
      showToast('Failed to load registered pets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPetScanHistory = async (petId) => {
    try {
      const history = await vetScanService.getScansByPet(petId);
      setRecentScans(history || []);
    } catch (_) {}
  };

  const handlePetChange = (val) => {
    const rawId = val?.target ? val.target.value : val;
    const petId = parseInt(rawId, 10);
    const pet = pets.find((p) => p.id === petId);
    if (pet) {
      setSelectedPet(pet);
      setScanResult(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      loadPetScanHistory(pet.id);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Invalid file format. Please upload JPEG, PNG, or WEBP.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit.', 'error');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
  };

  const handleSymptomToggle = (key) => {
    setSymptoms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedPet) {
      showToast('Please select a pet to analyze', 'error');
      return;
    }
    if (!selectedFile) {
      showToast('Please choose an image of the affected skin area', 'error');
      return;
    }

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('petId', selectedPet.id);
      formData.append('symptomsJson', JSON.stringify(symptoms));

      const result = await vetScanService.analyzeScan(formData);
      setScanResult(result);

      if (result.status === 'INSUFFICIENT_IMAGE') {
        showToast('Image quality is insufficient. Please retake the photo in good lighting.', 'warning');
      } else {
        showToast('Preliminary screening completed!', 'success');
        loadPetScanHistory(selectedPet.id);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete VetScan analysis', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleViewHistoricalScan = (scan) => {
    setScanResult(scan);
    setPreviewUrl(scan.imageReference);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left max-w-7xl mx-auto" data-testid="vetscan-view">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold border border-blue-400/30">
            <ScanLine size={14} className="text-sky-400" />
            Explainable Multimodal Decision Support
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            PetZoe VetScan AI
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Preliminary canine skin lesion screening and longitudinal progression monitoring powered by Explainable Deep Learning (Grad-CAM).
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-300/90 font-medium">
            <ShieldCheck size={14} className="text-amber-400 shrink-0" />
            <span>Decision-support system only. Does not replace professional veterinary examination or provide clinical diagnosis.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (Pet, Symptoms, Image Upload) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Stethoscope size={18} className="text-blue-600" />
              Screening Intake
            </h2>

            {/* Pet Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Patient Canine</label>
              <SelectDropdown
                value={selectedPet?.id || ''}
                onChange={handlePetChange}
                placeholder="Choose registered canine..."
                options={pets.map((pet) => ({
                  value: pet.id,
                  label: `${pet.name} (${pet.breed || pet.species})`,
                  badge: `ID: ${pet.petCode || pet.id}`
                }))}
              />
            </div>

            {/* Image Upload Zone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Skin Lesion Photograph</label>
              <div
                onClick={() => document.getElementById('vetscan-file-input').click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  previewUrl
                    ? 'border-blue-300 bg-blue-50/20'
                    : 'border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-slate-100/50'
                }`}
              >
                <input
                  id="vetscan-file-input"
                  data-testid="file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Lesion Preview"
                      className="max-h-48 mx-auto rounded-xl object-contain shadow-sm border border-slate-200"
                    />
                    <p className="text-[11px] font-bold text-blue-600">Click to change photograph</p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                      <Upload size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Upload or drag close-up image</p>
                    <p className="text-[10px] text-slate-400">JPEG, PNG, WEBP up to 10MB (Minimum 224x224 px)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Reported Symptoms */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Observed Clinical Signs</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'itching', label: 'Itching / Scratching' },
                  { key: 'redness', label: 'Erythema (Redness)' },
                  { key: 'hairLoss', label: 'Alopecia (Hair Loss)' },
                  { key: 'crusting', label: 'Crusting / Flakes' },
                  { key: 'swelling', label: 'Swelling / Edema' },
                  { key: 'discharge', label: 'Oozing / Ulcer' },
                  { key: 'odor', label: 'Foul Odor' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSymptomToggle(key)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold text-left transition-all border flex items-center justify-between cursor-pointer ${
                      symptoms[key]
                        ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{label}</span>
                    {symptoms[key] && <CheckCircle2 size={13} className="text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze Action Button */}
            <button
              data-testid="analyze-button"
              onClick={handleAnalyze}
              disabled={analyzing || !selectedFile}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw size={16} className="animate-spin text-white" />
                  <span>Evaluating Lesion Metrics & Heatmaps...</span>
                </>
              ) : (
                <>
                  <ScanLine size={16} />
                  <span>Execute Preliminary AI Screening</span>
                </>
              )}
            </button>
          </div>

          {/* Historical Scans Card */}
          {recentScans.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4" data-testid="scan-history-list">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock size={14} /> Scan History for {selectedPet?.name}
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    onClick={() => handleViewHistoricalScan(scan)}
                    className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img src={scan.imageReference} alt="Scan thumbnail" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <p className="font-bold text-slate-800">
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-slate-400">Severity: {scan.severity} • {scan.progressionStatus}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Explainable Results Screen */}
        <div className="lg:col-span-7 space-y-6">
          {scanResult ? (
            <div className="space-y-6" data-testid="result-container">
              {/* Demo Mode / Real Mode Banner */}
              {scanResult.modelMode === 'DEVELOPMENT_DEMO' && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                  <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Development Demo Mode:</span> Results are generated with calibrated simulated weights for user acceptance testing. Real model performance requires trained model artifacts.
                  </div>
                </div>
              )}

              {/* Quality Flag Warning if INSUFFICIENT_IMAGE */}
              {scanResult.status === 'INSUFFICIENT_IMAGE' && (
                <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle size={18} className="text-rose-600" />
                    <span>Insufficient Photograph Quality</span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    {scanResult.statusMessage || "The image quality is insufficient for preliminary screening. Please upload a clearer image with the affected skin area in focus."}
                  </p>
                </div>
              )}

              {scanResult.status === 'COMPLETED' && (
                <>
                  {/* Result Header Card: Confidence, Severity, Progression */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400">Screening Report</span>
                        <h3 className="text-lg font-black text-slate-900">{scanResult.petName}</h3>
                        <p className="text-xs text-slate-400">
                          ID: {scanResult.petCode} • {scanResult.breed} • {new Date(scanResult.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Confidence Badge */}
                        <div data-testid="confidence-badge" className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 ${
                          scanResult.confidenceLevel === 'HIGH'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : scanResult.confidenceLevel === 'MODERATE'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <ShieldCheck size={14} />
                          <span>{scanResult.confidenceLevel} Confidence ({Math.round((scanResult.confidence || 0) * 100)}%)</span>
                        </div>

                        {/* Severity Badge */}
                        <div data-testid="severity-badge" className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 ${
                          scanResult.severity === 'SEVERE'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : scanResult.severity === 'MODERATE'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : scanResult.severity === 'MILD'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          <AlertTriangle size={14} />
                          <span>Severity: {scanResult.severity}</span>
                        </div>

                        {/* Progression Badge */}
                        <div data-testid="progression-indicator" className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 ${
                          scanResult.progressionStatus === 'IMPROVING'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : scanResult.progressionStatus === 'WORSENING'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : scanResult.progressionStatus === 'STABLE'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {scanResult.progressionStatus === 'IMPROVING' && <ArrowDownRight size={14} />}
                          {scanResult.progressionStatus === 'WORSENING' && <ArrowUpRight size={14} />}
                          {scanResult.progressionStatus === 'STABLE' && <Minus size={14} />}
                          <span>{scanResult.progressionStatus}</span>
                        </div>
                      </div>
                    </div>

                    {/* Image & Grad-CAM Heatmap Side-by-Side / Toggle */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Eye size={15} className="text-blue-600" />
                          Explainable Visual Activation (Grad-CAM)
                        </span>
                        {scanResult.explanationImageReference && (
                          <button
                            data-testid="gradcam-toggle"
                            type="button"
                            onClick={() => setShowGradCam(!showGradCam)}
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer flex items-center gap-1"
                          >
                            {showGradCam ? <EyeOff size={13} /> : <Eye size={13} />}
                            <span>{showGradCam ? 'Show Original' : 'Show Grad-CAM Heatmap'}</span>
                          </button>
                        )}
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center min-h-64 max-h-96">
                        {showGradCam && scanResult.explanationImageReference ? (
                          <img
                            data-testid="gradcam-image"
                            src={scanResult.explanationImageReference}
                            alt="Grad-CAM Overlay"
                            className="w-full h-full object-contain max-h-96"
                          />
                        ) : (
                          <img
                            data-testid="original-image"
                            src={scanResult.imageReference}
                            alt="Original Lesion"
                            className="w-full h-full object-contain max-h-96"
                          />
                        )}
                        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-white">
                          {showGradCam && scanResult.explanationImageReference ? 'Grad-CAM Heatmap Active' : 'Original Photograph'}
                        </div>
                      </div>
                    </div>

                    {/* Multi-Label Lesion Indicators */}
                    <div className="space-y-4" data-testid="lesion-indicators">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Possible Lesion Indicators (Multi-Label)
                      </h4>
                      <div className="space-y-3">
                        {scanResult.predictions?.map((pred) => {
                          const percent = Math.round(pred.probability * 100);
                          return (
                            <div key={pred.label} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-800">{pred.displayName}</span>
                                <span className={pred.detected ? 'text-blue-700' : 'text-slate-500'}>
                                  {percent}% {pred.detected && '(Detected)'}
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    pred.detected
                                      ? percent > 75
                                        ? 'bg-rose-500'
                                        : 'bg-blue-600'
                                      : 'bg-slate-400'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                              <p className="text-[10px] text-slate-400">{pred.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Progression Notes */}
                    {scanResult.progressionNotes && (
                      <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 space-y-1">
                        <span className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-blue-700">
                          <Activity size={13} /> Visual Progression Assessment
                        </span>
                        <p>{scanResult.progressionNotes}</p>
                      </div>
                    )}

                    {/* Veterinarian Clinical Review Status if Reviewed */}
                    {scanResult.veterinarianReviewStatus && scanResult.veterinarianReviewStatus !== 'PENDING' && (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5">
                            <Stethoscope size={14} className="text-emerald-700" />
                            Clinical Review: Dr. {scanResult.veterinarianName || 'Veterinarian'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] uppercase font-black">
                            {scanResult.veterinarianReviewStatus}
                          </span>
                        </div>
                        {scanResult.veterinarianNotes && (
                          <p className="text-emerald-800 pt-1 text-[11px] italic">
                            "{scanResult.veterinarianNotes}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Clinical Disclaimer */}
                    <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500 space-y-1" data-testid="disclaimer-banner">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <HelpCircle size={13} /> Safety & Diagnostic Disclaimer
                      </span>
                      <p>{scanResult.clinicalDisclaimer}</p>
                    </div>

                    {/* Action Buttons: Connect to Existing Appointment & Medical Records */}
                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        data-testid="book-appointment-btn"
                        onClick={() => {
                          if (onNavigateToAppointments) {
                            onNavigateToAppointments();
                          } else {
                            navigate('/appointments');
                          }
                        }}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Calendar size={15} />
                        <span>Book Veterinarian Consultation</span>
                      </button>

                      <button
                        data-testid="view-records-btn"
                        onClick={() => {
                          if (onNavigateToRecords) {
                            onNavigateToRecords();
                          } else {
                            navigate('/records');
                          }
                        }}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <FileText size={15} />
                        <span>View in Medical Records</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm text-center space-y-4">
              <div className="h-16 w-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <ScanLine size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Screening Active</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Select your canine patient, upload an image of the skin lesion area, and provide any observed symptoms to generate a preliminary AI screening report.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
