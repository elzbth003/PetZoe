import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus, Search, Filter, Edit2, Trash2, X, AlertTriangle,
  ShieldCheck, ShieldAlert, Shield, Loader2, Sparkles, Palette,
  Copy, Check, ArrowRightLeft, HeartHandshake
} from 'lucide-react';
import api from '../../services/api';
import rehomeService from '../../services/rehomeService';
import { useToast } from '../../hooks/useToast';
import ImageUpload from '../ui/ImageUpload';
import SelectDropdown from '../ui/SelectDropdown';
import RehomePetModal from '../rehoming/RehomePetModal';
import RehomeApplicationsReviewModal from '../rehoming/RehomeApplicationsReviewModal';

// Default presets for pet pictures based on species
const SPECIES_PRESETS = {
  Dog: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400",
  Cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400",
  Bird: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=400",
  Rabbit: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=400",
  Other: "https://images.unsplash.com/photo-1472491235688-bdc81a63246e?auto=format&fit=crop&q=80&w=400"
};

const todayIso = new Date().toISOString().split('T')[0];

// Zod validation schema
const petSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "Pet name must be at least 2 characters" })
    .max(50, { message: "Pet name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z0-9\s.'-]+$/, { message: "Pet name can only contain letters, numbers, spaces, hyphens, and apostrophes" }),
  species: z.enum(["Dog", "Cat", "Bird", "Rabbit", "Other"], {
    errorMap: () => ({ message: "Please select a valid species" })
  }),
  breed: z.string()
    .trim()
    .min(2, { message: "Breed must be at least 2 characters" })
    .max(50, { message: "Breed cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s.'-]+$/, { message: "Breed can only contain letters, spaces, hyphens, and apostrophes" }),
  age: z.coerce.number({ invalid_type_error: "Age must be a number" })
    .int({ message: "Age must be a whole number of years" })
    .min(0, { message: "Age cannot be negative" })
    .max(30, { message: "Age must be between 0 and 30 years" }),
  gender: z.enum(["Male", "Female"], {
    errorMap: () => ({ message: "Select Male or Female" })
  }),
  weight: z.coerce.number({ invalid_type_error: "Weight must be a number" })
    .min(0.05, { message: "Weight must be at least 0.05 kg" })
    .max(200, { message: "Weight cannot exceed 200 kg" }),
  vaccinationStatus: z.enum(["Up-to-date", "Needs Vaccination", "Overdue"], { 
    errorMap: () => ({ message: "Select a valid status" }) 
  }),
  photoUrl: z.string()
    .trim()
    .url({ message: "Must be a valid web URL (e.g. https://...)" })
    .or(z.literal(''))
    .optional(),
  dateOfBirth: z.string()
    .optional()
    .refine((val) => !val || val <= todayIso, {
      message: "Date of birth cannot be in the future"
    }),
  color: z.string()
    .trim()
    .max(50, { message: "Color cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s,.'/-]*$/, { message: "Color contains invalid characters" })
    .optional(),
  allergies: z.string()
    .trim()
    .max(200, { message: "Allergies cannot exceed 200 characters" })
    .optional(),
  medicalNotes: z.string()
    .trim()
    .max(1000, { message: "Medical notes cannot exceed 1000 characters" })
    .optional(),
});

export default function PetList({ onPetsUpdated }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("All");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('basic'); // 'basic' | 'health'
  const [editingPet, setEditingPet] = useState(null);
  const [deleteConfirmPet, setDeleteConfirmPet] = useState(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [copiedPetCode, setCopiedPetCode] = useState(null);
  const [transferPet, setTransferPet] = useState(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [isTransferSubmitting, setIsTransferSubmitting] = useState(false);

  // Rehoming states
  const [rehomeListings, setRehomeListings] = useState([]);
  const [rehomePet, setRehomePet] = useState(null);
  const [reviewListing, setReviewListing] = useState(null);
  const [reviewPet, setReviewPet] = useState(null);
  const modalFormRef = useRef(null);

  const { showToast } = useToast();

  // Hide global AI button while modal is open to prevent overlapping action buttons
  useEffect(() => {
    const isAnyModalOpen = isModalOpen || !!deleteConfirmPet || !!transferPet || !!rehomePet || !!reviewListing;
    window.dispatchEvent(new CustomEvent('petzoe:modal-state', { detail: { open: isAnyModalOpen } }));
    return () => {
      window.dispatchEvent(new CustomEvent('petzoe:modal-state', { detail: { open: false } }));
    };
  }, [isModalOpen, deleteConfirmPet, transferPet, rehomePet, reviewListing]);

  useEffect(() => {
    if (isModalOpen && modalFormRef.current) {
      modalFormRef.current.scrollTop = 0;
    }
  }, [isModalOpen, modalTab]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(petSchema),
    mode: 'onChange',
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

  // Fetch owner rehoming listings
  const fetchRehomeListings = async () => {
    try {
      const res = await rehomeService.getMyListings();
      setRehomeListings(res.data || []);
    } catch (e) {
      console.error("Failed to load rehome listings", e);
    }
  };

  const getActiveListingForPet = (petId) => {
    return rehomeListings.find(l => l.petId === petId && l.status === 'ACTIVE');
  };

  useEffect(() => {
    fetchPets();
    fetchRehomeListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingPet(null);
    setModalTab('basic');
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
    setModalTab('basic');
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

  const handleCopyPetId = (e, code) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedPetCode(code);
    showToast(`Pet ID ${code} copied to clipboard!`, "info");
    setTimeout(() => setCopiedPetCode(null), 2500);
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferPet || !transferEmail.trim()) {
      showToast("Please enter the new owner's registered email address.", "error");
      return;
    }
    setIsTransferSubmitting(true);
    try {
      await api.post(`/pets/${transferPet.id}/transfer`, { newOwnerEmail: transferEmail.trim() });
      showToast(`Ownership of ${transferPet.name} (${transferPet.petCode}) successfully transferred to ${transferEmail}!`, "success");
      setTransferPet(null);
      setTransferEmail('');
      fetchPets();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to transfer pet ownership.", "error");
    } finally {
      setIsTransferSubmitting(false);
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

          <div className="w-36 shrink-0">
            <SelectDropdown
              value={filterSpecies}
              onChange={(val) => setFilterSpecies(val)}
              icon={Filter}
              size="sm"
              options={[
                { value: 'All', label: 'All Species' },
                { value: 'Dog', label: 'Dog', icon: '🐕' },
                { value: 'Cat', label: 'Cat', icon: '🐈' },
                { value: 'Bird', label: 'Bird', icon: '🦜' },
                { value: 'Rabbit', label: 'Rabbit', icon: '🐇' },
                { value: 'Other', label: 'Other', icon: '🐾' }
              ]}
              buttonClassName="bg-white border-slate-200 shadow-xs"
            />
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
                  {pet.color && (
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Palette size={11} /> {pet.color}
                    </p>
                  )}

                  {/* Permanent Pet ID Badge */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 mt-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Pet ID:</span>
                      <span className="font-mono font-bold text-xs text-[#1E3A5F] truncate select-all">
                        {pet.petCode || `PZ-PET-${String(pet.id).padStart(6, '0')}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleCopyPetId(e, pet.petCode || `PZ-PET-${String(pet.id).padStart(6, '0')}`)}
                      className="p-1 hover:bg-slate-200/70 rounded text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                      title="Copy Pet ID"
                    >
                      {copiedPetCode === (pet.petCode || `PZ-PET-${String(pet.id).padStart(6, '0')}`) ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
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
                        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
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

                {/* Ownership Actions: Rehoming & Direct Transfer */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  {getActiveListingForPet(pet.id) ? (
                    <button
                      type="button"
                      onClick={() => {
                        setReviewListing(getActiveListingForPet(pet.id));
                        setReviewPet(pet);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <HeartHandshake size={14} className="text-amber-600" />
                      Rehoming Active ({getActiveListingForPet(pet.id).applicationCount || 0} {getActiveListingForPet(pet.id).applicationCount === 1 ? 'Applicant' : 'Applicants'})
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRehomePet(pet)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-50/60 hover:bg-amber-50 border border-amber-200/80 text-amber-900 hover:text-amber-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <HeartHandshake size={14} className="text-amber-600" /> Find a New Home
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => { setTransferPet(pet); setTransferEmail(''); }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#1E3A5F] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowRightLeft size={13} /> Transfer Ownership
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Pet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 z-[80] transition-opacity duration-200">
          <div className="bg-white w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 pt-5 pb-3 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97360]">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      {editingPet ? 'Update Pet Profile' : 'Register New Pet'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {editingPet ? `Editing ${editingPet.name} (${editingPet.petCode || 'Pet'})` : 'Add your companion to PetZoe digital health record'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Segmented Tabs */}
              <div className="flex gap-2 p-1 bg-slate-100/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setModalTab('basic')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    modalTab === 'basic'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🐾 Basic Identity</span>
                  {(errors.name || errors.breed || errors.age || errors.weight) && (
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('health')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    modalTab === 'health'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🩺 Health & Profile</span>
                  {(errors.dateOfBirth || errors.color || errors.allergies || errors.medicalNotes) && (
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Modal Body & Form */}
            <form
              id="pet-register-form"
              ref={modalFormRef}
              onSubmit={handleSubmit(onSubmit)}
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4"
            >
              {modalTab === 'basic' ? (
                <>
                  {/* Pet ID System Note */}
                  <div className="bg-sky-50/80 border border-sky-100/90 rounded-2xl p-3 flex items-start gap-2.5">
                    <span className="text-base shrink-0 mt-0.5">🆔</span>
                    <div className="text-[11px] text-sky-950 leading-relaxed">
                      {editingPet ? (
                        <>Permanent Pet ID: <strong className="font-mono text-sky-700 bg-white/70 px-1.5 py-0.5 rounded border border-sky-200">{editingPet.petCode || `PZ-PET-${String(editingPet.id).padStart(6, '0')}`}</strong> (Immutable)</>
                      ) : (
                        <>A unique, permanent <strong>Pet ID</strong> (e.g. <span className="font-mono font-bold text-sky-800">PZ-PET-000025</span>) will be automatically assigned upon creation.</>
                      )}
                    </div>
                  </div>

                  {/* Species Selector as Visual Pills */}
                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Species</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { label: 'Dog', icon: '🐕' },
                        { label: 'Cat', icon: '🐈' },
                        { label: 'Bird', icon: '🦜' },
                        { label: 'Rabbit', icon: '🐇' },
                        { label: 'Other', icon: '🐾' }
                      ].map((item) => {
                        const isSelected = watch('species') === item.label;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setValue('species', item.label, { shouldValidate: true })}
                            className={`py-2 px-1 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                              isSelected
                                ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-sm scale-102 font-bold'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                            }`}
                          >
                            <span className="text-base leading-none">{item.icon}</span>
                            <span className="text-[11px]">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Pet Name */}
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="pet-name" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Pet Name *</label>
                      <input
                        id="pet-name"
                        type="text"
                        placeholder="e.g. Milo, Bella"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border ${errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'} text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 transition-all`}
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Breed */}
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="pet-breed" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Breed *</label>
                      <input
                        id="pet-breed"
                        type="text"
                        placeholder="e.g. Golden Retriever, Persian"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border ${errors.breed ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'} text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 transition-all`}
                        {...register('breed')}
                      />
                      {errors.breed && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.breed.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Gender */}
                    <div>
                      <label htmlFor="pet-gender" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Gender</label>
                      <SelectDropdown
                        value={watch('gender')}
                        onChange={(val) => setValue('gender', val, { shouldValidate: true })}
                        options={[
                          { value: 'Male', label: 'Male', icon: '♂' },
                          { value: 'Female', label: 'Female', icon: '♀' }
                        ]}
                        error={errors.gender?.message}
                      />
                    </div>

                    {/* Age */}
                    <div>
                      <label htmlFor="pet-age" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Age (Years)</label>
                      <input
                        id="pet-age"
                        type="number"
                        min="0"
                        max="50"
                        className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border ${errors.age ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100`}
                        {...register('age')}
                      />
                      {errors.age && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.age.message}</p>
                      )}
                    </div>

                    {/* Weight */}
                    <div>
                      <label htmlFor="pet-weight" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Weight (kg)</label>
                      <input
                        id="pet-weight"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="200"
                        className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border ${errors.weight ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100`}
                        {...register('weight')}
                      />
                      {errors.weight && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.weight.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="pt-1">
                    <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">
                      Photo <span className="text-[10px] text-slate-400 font-normal">(Optional — default species image used if blank)</span>
                    </label>
                    <ImageUpload
                      value={watch('photoUrl')}
                      onChange={(url) => setValue('photoUrl', url, { shouldValidate: true })}
                      error={errors.photoUrl?.message}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Tab 2: Health & Details */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Vaccination Status */}
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="pet-vaccinationStatus" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Vaccination Status</label>
                      <SelectDropdown
                        value={watch('vaccinationStatus')}
                        onChange={(val) => setValue('vaccinationStatus', val, { shouldValidate: true })}
                        options={[
                          { value: 'Up-to-date', label: 'Up-to-date', icon: '🟢', badge: 'Active' },
                          { value: 'Needs Vaccination', label: 'Needs Vaccination', icon: '🟡', badge: 'Due' },
                          { value: 'Overdue', label: 'Overdue', icon: '🔴', badge: 'Alert' },
                        ]}
                        error={errors.vaccinationStatus?.message}
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="pet-dateOfBirth" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Date of Birth <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        id="pet-dateOfBirth"
                        type="date"
                        max={todayIso}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border ${errors.dateOfBirth ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100`}
                        {...register('dateOfBirth')}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.dateOfBirth.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Color / Markings */}
                  <div>
                    <label htmlFor="pet-color" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Color / Markings <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                    <input
                      id="pet-color"
                      type="text"
                      placeholder="e.g. Golden, Black & White, Tricolor"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border ${errors.color ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100`}
                      {...register('color')}
                    />
                    {errors.color && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.color.message}</p>
                    )}
                  </div>

                  {/* Allergies */}
                  <div>
                    <label htmlFor="pet-allergies" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Known Allergies <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                    <input
                      id="pet-allergies"
                      type="text"
                      placeholder="e.g. Pollen, Chicken, Penicillin"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border ${errors.allergies ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100`}
                      {...register('allergies')}
                    />
                    {errors.allergies && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.allergies.message}</p>
                    )}
                  </div>

                  {/* Medical Notes */}
                  <div>
                    <label htmlFor="pet-medicalNotes" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Medical Notes & Dietary Needs <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                    <textarea
                      id="pet-medicalNotes"
                      rows={3}
                      placeholder="Previous conditions, current medications, temperament, or dietary notes..."
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border ${errors.medicalNotes ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none`}
                      {...register('medicalNotes')}
                    />
                    {errors.medicalNotes && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.medicalNotes.message}</p>
                    )}
                  </div>
                </>
              )}
            </form>

            {/* Fixed Sticky Footer Actions */}
            <div className="px-5 sm:px-6 py-3.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between shrink-0 z-10 select-none">
              <div>
                {modalTab === 'health' ? (
                  <button
                    type="button"
                    onClick={() => setModalTab('basic')}
                    className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                  >
                    ← Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {modalTab === 'basic' && (
                  <button
                    type="button"
                    onClick={() => setModalTab('health')}
                    className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer items-center gap-1"
                  >
                    Next: Health Details →
                  </button>
                )}

                <button
                  form="pet-register-form"
                  type="submit"
                  disabled={isActionSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#112A46] via-[#1E3A5F] to-[#2563EB] hover:opacity-95 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-900/10 active:scale-95 disabled:opacity-50"
                >
                  {isActionSubmitting && <Loader2 size={13} className="animate-spin" />}
                  {editingPet ? 'Update Pet' : 'Register Pet'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmPet && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
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

      {/* Transfer Ownership Dialog */}
      {transferPet && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-3 text-left">
                <div className="h-10 w-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                  <ArrowRightLeft size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">Transfer Ownership</h4>
                  <p className="text-xs text-slate-500">
                    Transfer <strong>{transferPet.name}</strong> ({transferPet.petCode}) to a new registered owner.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTransferPet(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 text-[11px] text-sky-800 leading-relaxed">
              💡 <strong>Permanent Medical History:</strong> The permanent Pet ID (<strong>{transferPet.petCode}</strong>) and all historical medical consultations, vaccinations, documents, and clinical history will remain fully intact and transfer to the new owner seamlessly.
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">
                  New Owner's Registered Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="newowner@example.com"
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferPet(null)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransferSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#1E3A5F] hover:bg-[#1A3354] text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isTransferSubmitting && <Loader2 size={12} className="animate-spin" />}
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rehome Pet Modal */}
      {rehomePet && (
        <RehomePetModal
          pet={rehomePet}
          isOpen={!!rehomePet}
          onClose={() => setRehomePet(null)}
          onSuccess={() => {
            fetchPets();
            fetchRehomeListings();
          }}
          showToast={showToast}
        />
      )}

      {/* Rehome Applications Review Modal */}
      {reviewListing && (
        <RehomeApplicationsReviewModal
          listing={reviewListing}
          pet={reviewPet}
          isOpen={!!reviewListing}
          onClose={() => {
            setReviewListing(null);
            setReviewPet(null);
          }}
          onActionSuccess={() => {
            fetchPets();
            fetchRehomeListings();
          }}
          showToast={showToast}
        />
      )}

    </div>
  );
}
