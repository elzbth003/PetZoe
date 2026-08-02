import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Calendar, Clock, User, MessageSquare, AlertTriangle, 
  Trash2, Loader2, CalendarClock, ArrowRight, ShieldAlert 
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';

// Time slots options
const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", 
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
];

// Zod validation schema
const appointmentSchema = z.object({
  petId: z.coerce.number().positive({ message: "Select a registered pet" }),
  veterinarianId: z.coerce.number().positive({ message: "Select a veterinarian" }),
  appointmentDate: z.string().min(1, { message: "Date is required" }),
  appointmentTime: z.string().min(1, { message: "Select a time slot" }),
  notes: z.string().max(1000, { message: "Notes cannot exceed 1000 characters" }).optional()
});

export default function AppointmentList({ onAppointmentsUpdated }) {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      petId: 0,
      veterinarianId: 0,
      appointmentDate: '',
      appointmentTime: '',
      notes: ''
    }
  });

  const selectedTime = watch("appointmentTime", "");

  // Load dropdown lists and appointments
  const loadData = async () => {
    setLoading(true);
    try {
      const [petsRes, vetsRes, apptsRes] = await Promise.all([
        api.get('/pets'),
        api.get('/users/veterinarians'),
        api.get('/appointments')
      ]);
      setPets(petsRes.data);
      setVets(vetsRes.data);
      
      // Sort appointments (upcoming first)
      const sortedAppts = apptsRes.data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      setAppointments(sortedAppts);

      if (onAppointmentsUpdated) {
        const upcomingCount = sortedAppts.filter(a => a.status === 'UPCOMING').length;
        onAppointmentsUpdated(upcomingCount);
      }
    } catch (_err) {
      showToast("Error retrieving appointments data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post('/appointments', data);
      showToast("Appointment booked successfully!", "success");
      reset({
        petId: pets[0]?.id || 0,
        veterinarianId: vets[0]?.id || 0,
        appointmentDate: '',
        appointmentTime: '',
        notes: ''
      });
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to book appointment.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelTarget) return;
    setIsSubmitting(true);
    try {
      await api.put(`/appointments/${cancelTarget.id}/cancel`);
      showToast("Appointment cancelled successfully.", "success");
      setCancelTarget(null);
      loadData();
    } catch (_err) {
      showToast("Failed to cancel appointment.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* 1. Appointment Booking Form (Left Col) */}
      <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
            <CalendarClock size={18} className="text-[#38BDF8]" /> Book Consultation
          </h3>
          <p className="text-slate-400 text-[10px] font-semibold leading-relaxed">
            Fill in the details below to schedule an online or in-clinic consultation with a certified practitioner.
          </p>
        </div>

        {pets.length === 0 ? (
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-center space-y-2">
            <ShieldAlert className="mx-auto text-amber-500" size={24} />
            <p className="text-[11px] text-slate-600 font-bold">Register a pet first!</p>
            <p className="text-[10px] text-slate-400">
              You must register at least one pet in the "My Pets" tab before scheduling consultations.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            
            {/* Pet selection */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Select Patient Pet</label>
              <select
                className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border ${errors.petId ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-semibold cursor-pointer focus:outline-none`}
                {...register('petId')}
              >
                <option value="0">Choose registered pet...</option>
                {pets.map(p => (
                  <option key={p.id} value={p.id}>🐾 {p.name} ({p.species})</option>
                ))}
              </select>
              {errors.petId && (
                <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.petId.message}</p>
              )}
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Select Veterinarian</label>
              <select
                className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border ${errors.veterinarianId ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-semibold cursor-pointer focus:outline-none`}
                {...register('veterinarianId')}
              >
                <option value="0">Choose certified vet...</option>
                {vets.map(v => (
                  <option key={v.id} value={v.id}>🩺 {v.name}</option>
                ))}
              </select>
              {errors.veterinarianId && (
                <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.veterinarianId.message}</p>
              )}
            </div>

            {/* Appointment Date */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Appointment Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border ${errors.appointmentDate ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none`}
                {...register('appointmentDate')}
              />
              {errors.appointmentDate && (
                <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.appointmentDate.message}</p>
              )}
            </div>

            {/* Time Slots grid selector */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Time Slot</label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setValue("appointmentTime", slot, { shouldValidate: true })}
                    className={`py-2 text-[10px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      selectedTime === slot 
                        ? 'bg-[#38BDF8] border-[#38BDF8] text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {errors.appointmentTime && (
                <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.appointmentTime.message}</p>
              )}
            </div>

            {/* Symtoms / Notes */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Symptoms / Consult Notes</label>
              <textarea
                placeholder="Describe symptoms, e.g., fever, loss of appetite, vaccine update..."
                rows="3"
                className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border ${errors.notes ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none resize-none`}
                {...register('notes')}
              ></textarea>
              {errors.notes && (
                <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.notes.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold bg-[#1E3A5F] hover:bg-[#1A3354] text-white shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Scheduling Consultation...
                </>
              ) : (
                <>
                  Confirm Appointment <ArrowRight size={14} />
                </>
              )}
            </button>

          </form>
        )}
      </div>

      {/* 2. Appointments List (Right Col) */}
      <div className="lg:col-span-7 space-y-4">
        <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2 text-left">
          <Calendar size={18} className="text-[#1E3A5F]" /> Consultation Schedule
        </h3>

        {loading ? (
          <div className="py-20 flex items-center justify-center bg-white border border-slate-100 rounded-3xl">
            <Loader2 className="animate-spin text-[#1E3A5F]" size={28} />
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-4">
            <CalendarClock className="mx-auto text-slate-300" size={48} />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">No appointments scheduled</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Any virtual telehealth or clinic visits you book will be tracked here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => {
              const isUpcoming = appt.status === 'UPCOMING';
              const isCancelled = appt.status === 'CANCELLED';

              return (
                <div 
                  key={appt.id} 
                  className={`bg-white border ${isCancelled ? 'border-slate-100 opacity-75' : 'border-slate-100'} rounded-[16px] p-5 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-4`}
                >
                  <div className="flex gap-4 items-start text-left">
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCancelled ? 'bg-slate-100 text-slate-400' : 'bg-sky-50 text-sky-600'
                    }`}>
                      <Calendar size={20} />
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isUpcoming ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {appt.status}
                        </span>
                        <p className="text-xs font-bold text-slate-800">
                          🐾 {appt.petName}
                        </p>
                      </div>

                      <p className="text-[11px] text-slate-600 font-semibold flex items-center gap-1">
                        <User size={12} className="text-slate-400" /> {appt.veterinarianName}
                      </p>

                      <p className="text-[10px] text-slate-500 font-bold flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" /> {appt.appointmentDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" /> {appt.appointmentTime}
                        </span>
                      </p>

                      {appt.notes && (
                        <p className="text-[10px] text-slate-400 font-semibold flex items-start gap-1 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1 max-w-md">
                          <MessageSquare size={12} className="text-slate-400 mt-0.5 shrink-0" />
                          <span>{appt.notes}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (Cancel button) */}
                  {isUpcoming && (
                    <button
                      onClick={() => setCancelTarget(appt)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/60 hover:border-slate-200 text-slate-400 hover:text-rose-600 shadow-sm transition-all cursor-pointer shrink-0"
                      title="Cancel Appointment"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex gap-3 text-left">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Cancel Appointment?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to cancel the scheduled consultation for <b>{cancelTarget.petName}</b> with <b>{cancelTarget.veterinarianName}</b>?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                No, Keep
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={isSubmitting}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
