import React, { useState, useEffect } from 'react';
import {
  Users, Activity, PawPrint, Loader2, Search, Filter,
  Shield, Calendar, ChevronRight, Stethoscope, FileText,
  CheckCircle2, X
} from 'lucide-react';
import { vetClinicalService } from '../../services/vetClinicalService';
import { useToast } from '../../hooks/useToast';
import VetPatientProfileModal from './VetPatientProfileModal';

export default function VetPatientsPanel() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('ALL');
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [petCodeSearch, setPetCodeSearch] = useState('');
  const [isSearchingCode, setIsSearchingCode] = useState(false);
  const [searchedPatient, setSearchedPatient] = useState(null);

  const { showToast } = useToast();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await vetClinicalService.getAuthorizedPatients();
      setPatients(data || []);
    } catch (err) {
      showToast('Failed to load authorized patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handlePetCodeSearch = async (e) => {
    e.preventDefault();
    const code = petCodeSearch.trim();
    if (!code) return;
    setIsSearchingCode(true);
    setSearchedPatient(null);
    try {
      const result = await vetClinicalService.getPatientByPetCode(code);
      setSearchedPatient(result);
      showToast(`Found patient profile for ${result.pet?.name}!`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || `No pet found with Pet ID: ${code}`, 'error');
    } finally {
      setIsSearchingCode(false);
    }
  };

  const filteredPatients = patients.filter((pet) => {
    if (speciesFilter !== 'ALL' && pet.species?.toUpperCase() !== speciesFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = pet.name?.toLowerCase().includes(q);
      const breedMatch = pet.breed?.toLowerCase().includes(q);
      const speciesMatch = pet.species?.toLowerCase().includes(q);
      const codeMatch = pet.petCode?.toLowerCase().includes(q);
      return nameMatch || breedMatch || speciesMatch || codeMatch;
    }
    return true;
  });

  const speciesList = ['ALL', ...new Set(patients.map((p) => p.species?.toUpperCase()).filter(Boolean))];

  if (loading && patients.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-sky-500" size={32} />
        <p className="text-xs font-bold text-slate-500">Loading patient registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search by Permanent Pet ID Header */}
      <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-3xl p-5 shadow-sm border border-sky-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Stethoscope size={18} className="text-sky-400" />
            Lookup Patient by Permanent Pet ID
          </h3>
          <p className="text-xs text-sky-200">
            Access a pet's complete medical history, consultations, vaccinations, and documents across the system.
          </p>
        </div>
        <form onSubmit={handlePetCodeSearch} className="flex gap-2 shrink-0 md:w-80">
          <input
            type="text"
            value={petCodeSearch}
            onChange={(e) => setPetCodeSearch(e.target.value)}
            placeholder="e.g. PZ-PET-000001"
            className="flex-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-300/60 text-xs font-mono font-semibold focus:outline-none focus:bg-white/20"
          />
          <button
            type="submit"
            disabled={isSearchingCode || !petCodeSearch.trim()}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSearchingCode ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            Lookup
          </button>
        </form>
      </div>

      {/* Verified Patient Search Result Banner */}
      {searchedPatient && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-800 font-bold text-sm">Verified Pet ID Record:</span>
                  <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg border border-emerald-300">
                    {searchedPatient.pet?.petCode || `PZ-PET-${String(searchedPatient.pet?.id).padStart(6, '0')}`}
                  </span>
                </div>
                <p className="text-xs text-emerald-900 font-semibold mt-0.5">
                  {searchedPatient.pet?.name} ({searchedPatient.pet?.species} • {searchedPatient.pet?.breed}) — Owner: {searchedPatient.owner?.name || 'Registered Owner'} ({searchedPatient.owner?.email || ''})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setSelectedPetId(searchedPatient.pet.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                Open Medical Profile & Add Records <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setSearchedPatient(null)}
                className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Species Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-200/70 rounded-2xl overflow-x-auto scrollbar-none">
          {speciesList.map((sp) => (
            <button
              key={sp}
              onClick={() => setSpeciesFilter(sp)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                speciesFilter === sp
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {sp === 'ALL' ? 'All Species' : sp}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative shrink-0 md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient name, breed, ID..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500 shadow-sm"
          />
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <Users className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-800">No Patients Found</h3>
          <p className="text-slate-500 text-xs mt-1">
            {searchQuery
              ? 'No patients matched your search filters.'
              : 'Patients will appear here once clinical appointments are booked.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((pet) => (
            <div
              key={pet.id}
              onClick={() => setSelectedPetId(pet.id)}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    {pet.photoUrl ? (
                      <img
                        src={pet.photoUrl}
                        alt={pet.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                        <PawPrint size={26} />
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-slate-900 text-white shadow">
                      {pet.species}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                      {pet.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold truncate">
                      {pet.breed || 'Mixed Breed'} • {pet.gender || 'Unknown'}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase text-slate-400">Pet ID:</span>
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                        {pet.petCode || `PZ-PET-${String(pet.id).padStart(6, '0')}`}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {pet.vaccinationStatus || 'Status Unknown'}
                      </span>
                      {pet.weight && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                          {pet.weight} kg
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {pet.allergies && (
                  <p className="text-[11px] text-amber-700 bg-amber-50/70 p-2.5 rounded-xl font-medium border border-amber-200/60">
                    ⚠️ Allergy: {pet.allergies}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <FileText size={13} /> Complete Chart
                </span>
                <span className="font-bold text-sky-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  View Records <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Profile Modal */}
      {selectedPetId && (
        <VetPatientProfileModal
          petId={selectedPetId}
          isOpen={!!selectedPetId}
          onClose={() => setSelectedPetId(null)}
        />
      )}
    </div>
  );
}
