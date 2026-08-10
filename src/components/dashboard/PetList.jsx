import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Plus, Search, Filter, Edit2, Trash2, X, AlertTriangle, 
  ShieldCheck, ShieldAlert, Shield, Loader2, Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';

// Default presets for pet pictures based on species
const SPECIES_PRESETS = {
  Dog: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400",
  Cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400",
  Bird: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=400",
  Rabbit: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=400",
  Other: "https://images.unsplash.com/photo-1472491235688-bdc81a63246e?auto=format&fit=crop&q=80&w=400"
};

// Zod validation schema
const petSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  species: z.string().min(1, { message: "Species is required" }),
  breed: z.string().min(1, { message: "Breed is required" }),
  age: z.coerce.number().int().min(0, { message: "Age cannot be negative" }).max(100, { message: "Age must be realistic" }),
  gender: z.enum(["Male", "Female"], { errorMap: () => ({ message: "Select Male or Female" }) }),
  weight: z.coerce.number().positive({ message: "Weight must be greater than 0" }),
  vaccinationStatus: z.enum(["Up-to-date", "Needs Vaccination", "Overdue"], { 
    errorMap: () => ({ message: "Select a valid status" }) 
  }),
  photoUrl: z.string().optional(),
  dateOfBirth: z.string().optional(),
  color: z.string().optional(),
  allergies: z.string().optional(),
  medicalNotes: z.string().optional(),
});

export default function PetList({ onPetsUpdated }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("All");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [deleteConfirmPet, setDeleteConfirmPet] = useState(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: '',
      species: 'Dog',
      breed: '',
      age: 0,
      gender: 'Male',
      weight: 5.0,
      vaccinationStatus: 'Up-to-date',
      photoUrl: '',
      dateOfBirth: '',
      color: '',
      allergies: '',
      medicalNotes: '',
    }
  });

  // Fetch pets list
  const fetchPets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pets');
      setPets(response.data);
      if (onPetsUpdated) onPetsUpdated(response.data.length);
    } catch (_err) {
      showToast("Could not load your pets.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingPet(null);
    reset({
      name: '',
      species: 'Dog',
      breed: '',
      age: 0,
      gender: 'Male',
      weight: 5.0,
      vaccinationStatus: 'Up-to-date',
      photoUrl: '',
      dateOfBirth: '',
      color: '',
      allergies: '',
      medicalNotes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pet) => {
    setEditingPet(pet);
    reset({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      weight: pet.weight,
      vaccinationStatus: pet.vaccinationStatus,
      photoUrl: pet.photoUrl || '',
      dateOfBirth: pet.dateOfBirth || '',
      color: pet.color || '',
      allergies: pet.allergies || '',
      medicalNotes: pet.medicalNotes || '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setIsActionSubmitting(true);
    try {
      const payload = {
        ...data,
        photoUrl: data.photoUrl?.trim() ? data.photoUrl.trim() : (SPECIES_PRESETS[data.species] || SPECIES_PRESETS.Other),
        dateOfBirth: data.dateOfBirth && data.dateOfBirth.trim() !== '' ? data.dateOfBirth : null,
        color: data.color?.trim() ? data.color.trim() : null,
        allergies: data.allergies?.trim() ? data.allergies.trim() : null,
        medicalNotes: data.medicalNotes?.trim() ? data.medicalNotes.trim() : null,
      };

      if (editingPet) {
        // Edit existing pet
        await api.put(`/pets/${editingPet.id}`, payload);
        showToast(`${data.name} updated successfully!`, "success");
      } else {
        // Create new pet
        await api.post('/pets', payload);
        showToast(`${data.name} added successfully!`, "success");
      }
      setIsModalOpen(false);
      fetchPets();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save pet details.", "error");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleDeletePet = async () => {
    if (!deleteConfirmPet) return;
    setIsActionSubmitting(true);
    try {
      await api.delete(`/pets/${deleteConfirmPet.id}`);
      showToast(`${deleteConfirmPet.name} removed successfully.`, "success");
      setDeleteConfirmPet(null);
      fetchPets();
    } catch (_err) {
      showToast("Failed to remove pet.", "error");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Filter and search pets
  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(search.toLowerCase()) || 
                          pet.breed.toLowerCase().includes(search.toLowerCase());
    const matchesSpecies = filterSpecies === "All" || pet.species === filterSpecies;
    return matchesSearch && matchesSpecies;
  });

  const getVaccinationBadge = (status) => {
    switch (status) {
      case 'Up-to-date':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
            <ShieldCheck size={12} /> Up-to-date
          </span>
        );
      case 'Needs Vaccination':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
            <Shield size={12} /> Needs Vaccine
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-100">
            <ShieldAlert size={12} /> Overdue
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Filters Left */}
        <div className="flex flex-1 w-full sm:w-auto gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search pets by name or breed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20 text-xs font-semibold placeholder-slate-400 shadow-sm"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <Filter size={14} />
            </span>
            <select
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 focus:border-primary-500 focus:outline-none text-xs font-semibold cursor-pointer shadow-sm appearance-none"
            >
              <option value="All">All Species</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Add Button Right */}
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#1E3A5F] hover:bg-[#1A3354] text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={16} /> Add New Pet
        </button>

      </div>

      {/* Grid of Pets */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#1E3A5F]" size={36} />
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-4">
          <Sparkles className="mx-auto text-slate-300" size={48} />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">No pets registered</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your first pet to record medical histories, track vaccinations, and book veterinary checkups.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-[#1E3A5F] font-bold text-xs border border-primary-100 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus size={14} /> Add Pet Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <div 
              key={pet.id} 
              className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              
              {/* Pet Image header */}
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                <img
                  src={pet.photoUrl || SPECIES_PRESETS.Other}
                  alt={pet.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay details */}
                <div className="absolute top-3 left-3">
                  {getVaccinationBadge(pet.vaccinationStatus)}
                </div>

                {/* Edit & Delete Action float buttons */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(pet)}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-[#1E3A5F] border border-slate-200/50 shadow-sm transition-all cursor-pointer"
                    title="Edit Pet"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmPet(pet)}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600 border border-slate-200/50 shadow-sm transition-all cursor-pointer"
                    title="Delete Pet"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-1.5">
                    {pet.name}
                    <span className="text-[10px] text-slate-400 font-bold px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full uppercase">
                      {pet.gender}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">{pet.species} • {pet.breed}</p>
                  {pet.color && <p className="text-[10px] text-slate-400 font-semibold">🎨 {pet.color}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-3 text-xs text-slate-500 font-semibold">
                  <div>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Age</span>
                    {pet.age} {pet.age === 1 ? 'Year' : 'Years'}
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Weight</span>
                    {pet.weight} kg
                  </div>
                </div>

                {(pet.allergies || pet.medicalNotes) && (
                  <div className="border-t border-slate-50 pt-3 space-y-1.5">
                    {pet.allergies && (
                      <p className="text-[10px] text-rose-600 font-semibold flex gap-1">
                        <span className="shrink-0">⚠️</span>
                        <span><strong>Allergies:</strong> {pet.allergies}</span>
                      </p>
                    )}
                    {pet.medicalNotes && (
                      <p className="text-[10px] text-slate-500 line-clamp-2">
                        <strong>Notes:</strong> {pet.medicalNotes}
                      </p>
                    )}
                  </div>
                )}

              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Pet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                <Sparkles size={16} className="text-[#F97360]" />
                {editingPet ? 'Update Pet Details' : 'Register New Pet'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Pet Name */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Pet Name</label>
                  <input
                    type="text"
                    placeholder="Milo"
                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border ${errors.name ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none`}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Species */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Species</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold cursor-pointer focus:outline-none"
                    {...register('species')}
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Breed */}
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Breed</label>
                  <input
                    type="text"
                    placeholder="Golden Retriever"
                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border ${errors.breed ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none`}
                    {...register('breed')}
                  />
                  {errors.breed && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.breed.message}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Age (Years)</label>
                  <input
                    type="number"
                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border ${errors.age ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none`}
                    {...register('age')}
                  />
                  {errors.age && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.age.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Gender */}
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Gender</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold cursor-pointer focus:outline-none"
                    {...register('gender')}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border ${errors.weight ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none`}
                    {...register('weight')}
                  />
                  {errors.weight && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.weight.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Vaccination Status */}
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Vaccination Status</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold cursor-pointer focus:outline-none"
                    {...register('vaccinationStatus')}
                  >
                    <option value="Up-to-date">Up-to-date</option>
                    <option value="Needs Vaccination">Needs Vaccination</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                {/* Photo URL */}
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">
                    Photo URL <span className="text-[10px] text-slate-400 font-normal">(Optional - default preset is used if blank)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border ${errors.photoUrl ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none`}
                    {...register('photoUrl')}
                  />
                  {errors.photoUrl && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.photoUrl.message}</p>
                  )}
                </div>

                {/* Color */}
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Color / Markings <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Golden, Black & White"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none"
                    {...register('color')}
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Date of Birth <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none"
                    {...register('dateOfBirth')}
                  />
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Known Allergies <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Pollen, Certain foods, Medications"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none"
                    {...register('allergies')}
                  />
                </div>

                {/* Medical Notes */}
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Medical Notes <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                  <textarea
                    rows={3}
                    placeholder="Previous conditions, ongoing treatments, special care instructions..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none resize-none"
                    {...register('medicalNotes')}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#1A3354] text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isActionSubmitting && <Loader2 size={12} className="animate-spin" />}
                  {editingPet ? 'Update Pet' : 'Register Pet'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmPet && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex gap-3 text-left">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Remove {deleteConfirmPet.name}?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to remove this pet? This action is permanent and will delete all associated appointments and clinical logs.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmPet(null)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                No, Keep
              </button>
              <button
                onClick={handleDeletePet}
                disabled={isActionSubmitting}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                {isActionSubmitting && <Loader2 size={12} className="animate-spin" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
