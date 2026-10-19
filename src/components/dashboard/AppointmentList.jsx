import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar, Clock, User, MessageSquare, AlertTriangle, AlertCircle,
  Trash2, Loader2, CalendarClock, ArrowRight, ShieldAlert, PawPrint
} from 'lucide-react';
import api from '../../services/api';
import { appointmentService } from '../../services/appointmentService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import ChatWidget from './ChatWidget';

// Time slots options
const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", 
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
];

// Helper to convert "hh:mm AM/PM" to minutes from midnight
const parseSlotToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// Zod validation schema
const appointmentSchema = z.object({
  petId: z.coerce.number().positive({ message: "Select a registered pet" }),
  veterinarianId: z.coerce.number().positive({ message: "Select a veterinarian" }),
  appointmentDate: z.string()
    .min(1, { message: "Date is required" })
    .refine((val) => {
      if (!val) return true;
      const today = new Date().toISOString().split('T')[0];
      return val >= today;
    }, { message: "Appointment date cannot be in the past" }),
  appointmentTime: z.string().min(1, { message: "Select a time slot" }),
  notes: z.string().max(1000, { message: "Notes cannot exceed 1000 characters" }).optional()
}).refine((data) => {
  if (!data.appointmentDate || !data.appointmentTime) return true;
  const today = new Date().toISOString().split('T')[0];
  if (data.appointmentDate === today) {
    const slotMinutes = parseSlotToMinutes(data.appointmentTime);
    if (slotMinutes !== null) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      return slotMinutes > currentMinutes;
    }
  }
  return true;
}, {
  message: "Selected time slot has already passed today",
  path: ["appointmentTime"]
});

export default function AppointmentList({ onAppointmentsUpdated }) {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const { showToast } = useToast();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
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
  const selectedVetId = watch("veterinarianId", 0);
  const selectedDate = watch("appointmentDate", "");

  // Load dropdown lists and appointments
  const loadData = async () => {
    setLoading(true);
    try {
      const [petsRes, vetsRes, apptsRes] = await Promise.all([
        api.get('/pets'),
        api.get('/vets'),
        api.get('/appointments')
      ]);
      setPets(petsRes.data);
      setVets(vetsRes.data);
      
      // Sort appointments (upcoming first)
      const sortedAppts = apptsRes.data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      setAppointments(sortedAppts);

      if (onAppointmentsUpdated) {
        const upcomingCount = sortedAppts.filter(a =>
          ['PENDING', 'CONFIRMED', 'UPCOMING', 'IN_CONSULTATION'].includes(a.status?.toUpperCase())
        ).length;
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

  useEffect(() => {
    if (!selectedVetId || selectedVetId == 0 || !selectedDate) {
      setScheduleData(null);
      return;
    }

    let isMounted = true;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const data = await appointmentService.getAvailableSlots(selectedVetId, selectedDate);
        if (isMounted) {
          setScheduleData(data);
          // If the currently selected time is not available in the new schedule or is in the past, clear it
          if (selectedTime) {
            const currentSlot = data.slots?.find(s => s.slot === selectedTime);
            const isToday = selectedDate === new Date().toISOString().split('T')[0];
            const slotMins = parseSlotToMinutes(selectedTime);
            const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
            const isPastTime = isToday && slotMins !== null && slotMins <= nowMins;

            if (!currentSlot || !currentSlot.available || isPastTime) {
              setValue("appointmentTime", "", { shouldValidate: true });
            }
          }
        }
      } catch (err) {
        if (isMounted) setScheduleData(null);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    };

    fetchSlots();
    return () => { isMounted = false; };
  }, [selectedVetId, selectedDate]);

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
      setScheduleData(null);
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
                  <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
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
                  <option key={v.id} value={v.id}>{v.name}</option>
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
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-slate-700 text-xs font-bold">Time Slot</label>
                {loadingSlots && (
                  <span className="text-[10px] text-[#38BDF8] font-semibold flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Checking availability...
                  </span>
                )}
                {scheduleData && !loadingSlots && (
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Hours: {scheduleData.workingHours}
                  </span>
                )}
              </div>

              {/* Off Duty Alert */}
              {scheduleData && !scheduleData.isWorkingDay && (
                <div className="p-3 mb-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-amber-800 text-xs font-semibold">
                  <AlertCircle size={16} className="text-amber-600 shrink-0" />
                  <p className="text-[11px] leading-tight">
                    {scheduleData.message || "This veterinarian does not hold consultation hours on this date."}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(slot => {
                  const slotInfo = scheduleData?.slots?.find(s => s.slot === slot);
                  const isBooked = slotInfo?.status === 'BOOKED';
                  const isOffDuty = slotInfo?.status === 'OFF_DUTY';
                  
                  // Check if slot has already passed today
                  const isToday = selectedDate === new Date().toISOString().split('T')[0];
                  const slotMins = parseSlotToMinutes(slot);
                  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
                  const isPastTime = isToday && slotMins !== null && slotMins <= nowMins;
                  const isExpired = slotInfo?.status === 'EXPIRED' || isPastTime;

                  const isAvailable = (!scheduleData || (slotInfo ? slotInfo.available : true)) && !isPastTime && !isExpired;
                  const isSelected = selectedTime === slot;

                  let buttonStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 cursor-pointer';
                  let statusBadge = null;

                  if (isSelected) {
                    buttonStyle = 'bg-[#38BDF8] border-[#38BDF8] text-white shadow-sm shadow-sky-500/30';
                  } else if (isExpired) {
                    buttonStyle = 'bg-slate-100/50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60';
                    statusBadge = <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Passed</span>;
                  } else if (isBooked) {
                    buttonStyle = 'bg-slate-100/90 border-slate-200 text-slate-400 cursor-not-allowed opacity-75';
                    statusBadge = <span className="block text-[8px] font-bold text-rose-500 uppercase tracking-wider mt-0.5">Booked</span>;
                  } else if (isOffDuty) {
                    buttonStyle = 'bg-slate-100/60 border-slate-200 text-slate-400 cursor-not-allowed opacity-60';
                    statusBadge = <span className="block text-[8px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">Off Duty</span>;
                  }

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!isAvailable || loadingSlots}
                      onClick={() => {
                        if (isAvailable) {
                          setValue("appointmentTime", slot, { shouldValidate: true });
                        }
                      }}
                      className={`py-2 px-1 text-[10px] font-bold rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[44px] ${buttonStyle}`}
                    >
                      <span className={isBooked ? 'line-through decoration-slate-400/80' : ''}>{slot}</span>
                      {statusBadge}
                    </button>
                  );
                })}
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
              const statusUpper = (appt.status || '').toUpperCase();
              const isUpcoming = ['PENDING', 'CONFIRMED', 'UPCOMING', 'IN_CONSULTATION'].includes(statusUpper);
              const isCancelled = statusUpper === 'CANCELLED' || statusUpper === 'REJECTED';
              const isCompleted = statusUpper === 'COMPLETED';
              const isInConsultation = statusUpper === 'IN_CONSULTATION';
              const isPending = statusUpper === 'PENDING';

              return (
                <div 
                  key={appt.id} 
                  className={`bg-white border ${
                    isInConsultation
                      ? 'border-amber-400/80 ring-2 ring-amber-400/20'
                      : isCancelled
                      ? 'border-slate-100 opacity-75'
                      : 'border-slate-100'
                  } rounded-[16px] p-5 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-4`}
                >
                  <div className="flex gap-4 items-start text-left">
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isInConsultation ? 'bg-amber-50 text-amber-600' :
                      isCancelled ? 'bg-slate-100 text-slate-400' :
                      isCompleted ? 'bg-emerald-50 text-emerald-600' :
                      isPending ? 'bg-purple-50 text-purple-600' :
                      'bg-sky-50 text-sky-600'
                    }`}>
                      <Calendar size={20} />
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isPending
                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                            : isInConsultation
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : isCancelled
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-sky-50 text-sky-700 border border-sky-100'
                        }`}>
                          {isPending ? 'Awaiting Doctor Confirmation' :
                           isInConsultation ? 'Consultation In Progress' :
                           appt.status}
                        </span>
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <PawPrint size={12} className="text-primary-500" /> {appt.petName}
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

                  {/* Actions (Cancel button & Chat) */}
                  {isUpcoming && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => setActiveChat(appt)}
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 hover:text-blue-700 shadow-sm transition-all cursor-pointer flex items-center justify-center"
                        title="Chat with Vet"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button
                        onClick={() => setCancelTarget(appt)}
                        className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/60 hover:border-slate-200 text-slate-400 hover:text-rose-600 shadow-sm transition-all cursor-pointer flex items-center justify-center"
                        title="Cancel Appointment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeChat && (
        <ChatWidget 
          appointmentId={activeChat.id} 
          currentUserId={user?.id}
          otherUserName={`Dr. ${activeChat.veterinarianName}`}
          onClose={() => setActiveChat(null)} 
        />
      )}

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
