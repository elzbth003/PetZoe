import React, { useState, useEffect } from 'react';
import {
  Users, Activity, PawPrint, Loader2, Search, Filter,
  Shield, Calendar, ChevronRight, Stethoscope, FileText
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

  const filteredPatients = patients.filter((pet) => {
    if (speciesFilter !== 'ALL' && pet.species?.toUpperCase() !== speciesFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = pet.name?.toLowerCase().includes(q);
      const breedMatch = pet.breed?.toLowerCase().includes(q);
      const speciesMatch = pet.species?.toLowerCase().includes(q);
      return nameMatch || breedMatch || speciesMatch;
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
            placeholder="Search patient name, breed..."
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
