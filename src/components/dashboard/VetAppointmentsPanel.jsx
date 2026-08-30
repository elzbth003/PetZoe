import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { useToast } from '../../hooks/useToast';

export default function VetAppointmentsPanel() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [notes, setNotes] = useState('');
  const { showToast } = useToast();

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getVetAppointments();
      const sorted = data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      setAppointments(sorted);
    } catch (err) {
      showToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleUpdate = async () => {
    if (!selectedAppt) return;
    setIsUpdating(true);
    try {
      await appointmentService.updateAppointmentStatus(selectedAppt.id, {
        status: updateStatus,
        notes: notes
      });
      showToast(`Appointment marked as ${updateStatus}`, 'success');
      setSelectedAppt(null);
      setUpdateStatus('');
      setNotes('');
      loadAppointments();
    } catch (err) {
      showToast('Failed to update appointment', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const openUpdateModal = (appt, status) => {
    setSelectedAppt(appt);
    setUpdateStatus(status);
    setNotes('');
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
        <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
        <h3 className="text-xl font-bold text-slate-800">No Appointments</h3>
        <p className="text-slate-500">You don't have any appointments scheduled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appt) => {
          const isUpcoming = appt.status === 'UPCOMING';
          const isCompleted = appt.status === 'COMPLETED';
          const isCancelled = appt.status === 'CANCELLED';

          return (
            <div key={appt.id} className={`bg-white border ${isCancelled ? 'border-slate-100 opacity-75' : 'border-slate-200'} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    isUpcoming ? 'bg-sky-50 text-sky-600' :
                    isCompleted ? 'bg-emerald-50 text-emerald-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {appt.status}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    🐾 {appt.petName}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Pet ID: {appt.petId}</p>
                </div>

                <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                  <p className="flex items-center gap-2 font-medium">
                    <Calendar size={16} className="text-slate-400" /> {appt.appointmentDate}
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <Clock size={16} className="text-slate-400" /> {appt.appointmentTime}
                  </p>
                  <p className="flex items-start gap-2 font-medium">
                    <MessageSquare size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-xs">{appt.notes || 'No initial notes provided.'}</span>
                  </p>
                </div>
              </div>

              {isUpcoming && (
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => openUpdateModal(appt, 'COMPLETED')}
                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle size={14} /> Complete
                  </button>
                  <button
                    onClick={() => openUpdateModal(appt, 'CANCELLED')}
                    className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-800 mb-2">
              {updateStatus === 'COMPLETED' ? 'Complete Appointment' : 'Cancel Appointment'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Update the status for {selectedAppt.petName}'s appointment on {selectedAppt.appointmentDate}.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Consultation Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={updateStatus === 'COMPLETED' ? 'Enter diagnosis, prescriptions, or follow-up instructions...' : 'Reason for cancellation...'}
                  rows="4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                    updateStatus === 'COMPLETED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isUpdating && <Loader2 size={16} className="animate-spin" />}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
