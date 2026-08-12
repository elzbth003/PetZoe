import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { CheckCircle, XCircle, Heart } from 'lucide-react';

export default function AdoptionReview() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [activePetId, setActivePetId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPendingAdoptionPets();
      setPets(res.data);
    } catch (err) {
      showToast("Failed to fetch pending adoption pets", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminApi.approveAdoptionPet(id);
      showToast("Pet approved for adoption", "success");
      fetchPets();
    } catch (err) {
      showToast("Failed to approve pet", "error");
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason) {
      showToast("Please provide a rejection reason", "error");
      return;
    }
    try {
      await adminApi.rejectAdoptionPet(id, rejectReason);
      showToast("Pet rejected", "success");
      setRejectReason('');
      setActivePetId(null);
      fetchPets();
    } catch (err) {
      showToast("Failed to reject pet", "error");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <Heart className="text-rose-500" /> Adoption Reviews
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-slate-400 py-12">Loading pets...</p>
        ) : pets.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Heart size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">All Caught Up!</h3>
            <p className="text-slate-500 mt-2">There are no pending adoption listings to review right now.</p>
          </div>
        ) : (
          pets.map(pet => (
            <div key={pet.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="h-48 bg-slate-100 relative">
                {pet.petImageBase64 ? (
                  <img src={pet.petImageBase64} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    No Image
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                  {pet.species} • {pet.breed}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-black text-slate-800">{pet.name}</h3>
                  <p className="text-slate-500 text-sm">{pet.ageMonths} months old • {pet.gender}</p>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 space-y-2 mb-6 flex-1">
                  <p><span className="font-bold">Health:</span> {pet.healthStatus}</p>
                  <p><span className="font-bold">Vaccination:</span> {pet.vaccinationStatus}</p>
                  {pet.shelterManager && (
                    <p className="pt-2 mt-2 border-t border-slate-200">
                      <span className="font-bold">Shelter:</span> {pet.shelterManager.name}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {activePetId === pet.id ? (
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        placeholder="Reason for rejection..." 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleReject(pet.id)}
                          className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors text-sm"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => { setActivePetId(null); setRejectReason(''); }}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleApprove(pet.id)}
                        className="flex-1 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <CheckCircle size={18}/> Approve
                      </button>
                      <button 
                        onClick={() => setActivePetId(pet.id)}
                        className="flex-1 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <XCircle size={18}/> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
