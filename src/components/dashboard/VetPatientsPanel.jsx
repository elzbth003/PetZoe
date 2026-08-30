import React, { useState, useEffect } from 'react';
import { Users, Activity, PawPrint, Loader2 } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { useToast } from '../../hooks/useToast';

export default function VetPatientsPanel() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const appointments = await appointmentService.getVetAppointments();
        
        // Extract unique pets from appointments
        const patientMap = new Map();
        appointments.forEach(appt => {
          if (!patientMap.has(appt.petId)) {
            patientMap.set(appt.petId, {
              id: appt.petId,
              name: appt.petName,
              ownerId: appt.ownerId,
              appointmentCount: 1,
              latestAppointmentDate: appt.appointmentDate
            });
          } else {
            const existing = patientMap.get(appt.petId);
            existing.appointmentCount += 1;
            if (new Date(appt.appointmentDate) > new Date(existing.latestAppointmentDate)) {
              existing.latestAppointmentDate = appt.appointmentDate;
            }
          }
        });

        setPatients(Array.from(patientMap.values()));
      } catch (err) {
        showToast('Failed to load patients', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
        <Users className="mx-auto text-slate-300 mb-4" size={48} />
        <h3 className="text-xl font-bold text-slate-800">No Patients Yet</h3>
        <p className="text-slate-500">You haven't had any appointments booked yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <div key={patient.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4 cursor-pointer hover:-translate-y-1">
            <div className="h-14 w-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
              <PawPrint size={24} />
            </div>
            
            <div className="min-w-0">
              <h4 className="text-lg font-black text-slate-800 truncate">{patient.name}</h4>
              <p className="text-xs text-slate-500 font-semibold mb-1">Pet ID: {patient.id}</p>
              
              <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                <span className="flex items-center gap-1">
                  <Activity size={12} className="text-slate-300" />
                  {patient.appointmentCount} Visits
                </span>
                <span>•</span>
                <span>Last: {patient.latestAppointmentDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
