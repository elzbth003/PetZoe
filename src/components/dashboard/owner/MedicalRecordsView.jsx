import React, { useState, useEffect } from 'react';
import { prescriptionApi } from '../../../services/medicalApi';
import api from '../../../services/api';
import { FileText, Calendar, Info, Clock } from 'lucide-react';

export default function MedicalRecordsView() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPets = async () => {
      try {
        const response = await api.get('/pets');
        setPets(response.data);
        if (response.data.length > 0) {
          setSelectedPet(response.data[0]);
        }
      } catch (error) {
        console.error("Error loading pets:", error);
      }
    };
    loadPets();
  }, []);

  useEffect(() => {
    if (selectedPet) {
      loadPrescriptions(selectedPet.id);
    }
  }, [selectedPet]);

  const loadPrescriptions = async (petId) => {
    setLoading(true);
    try {
      const response = await prescriptionApi.getByPet(petId);
      setPrescriptions(response.data);
    } catch (error) {
      console.error("Error loading prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-left">
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-blue-600" /> My Pet's Medical Records
        </h2>
        
        {pets.length === 0 ? (
          <p className="text-slate-500 text-sm">You haven't added any pets yet.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-4">
            {pets.map(pet => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors whitespace-nowrap ${
                  selectedPet?.id === pet.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {pet.photoUrl && <img src={pet.photoUrl} alt={pet.name} className="w-6 h-6 rounded-full object-cover" />}
                {pet.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPet && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-md font-bold text-slate-800 mb-4">Digital Prescriptions for {selectedPet.name}</h3>
          
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading prescriptions...</div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <FileText size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-medium">No prescriptions found for {selectedPet.name}.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map(prescription => (
                <div key={prescription.id} className="border border-slate-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all bg-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">{prescription.medicineName}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <User size={14} /> Prescribed by Dr. {prescription.veterinarianName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                        <Calendar size={12} /> {new Date(prescription.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-slate-50 p-4 rounded-xl">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Dosage</p>
                      <p className="text-sm font-medium text-slate-800">{prescription.dosage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Frequency</p>
                      <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                        <Clock size={14} className="text-slate-400" /> {prescription.frequency}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Duration</p>
                      <p className="text-sm font-medium text-slate-800">{prescription.duration}</p>
                    </div>
                  </div>
                  
                  {prescription.instructions && (
                    <div className="flex gap-2 items-start mt-4 pt-4 border-t border-slate-100">
                      <Info size={16} className="text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Special Instructions</p>
                        <p className="text-sm text-slate-700 italic">{prescription.instructions}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Ensure User icon is imported inside the component or globally
const User = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
