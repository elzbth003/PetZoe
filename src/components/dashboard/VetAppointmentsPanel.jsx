import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, MessageSquare, CheckCircle, XCircle, Loader2,
  PawPrint, Filter, Search, Stethoscope, AlertCircle, RefreshCw, FileText,
  CalendarCheck, Clock4, X
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { vetClinicalService } from '../../services/vetClinicalService';
import { useToast } from '../../hooks/useToast';
import ChatWidget from './ChatWidget';
import CreatePrescriptionModal from './CreatePrescriptionModal';
import VetPatientProfileModal from './VetPatientProfileModal';
import ConsultationModal from './ConsultationModal';
import { useAuth } from '../../hooks/useAuth';

export default function VetAppointmentsPanel({ initialFilter = 'ALL' }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);

  // Active Modals
  const [activeChat, setActiveChat] = useState(null);
  const [activePrescription, setActivePrescription] = useState(null);
  const [activePatientPetId, setActivePatientPetId] = useState(null);
  const [activeConsultationAppt, setActiveConsultationAppt] = useState(null);

  // Action Dialogs
  const [rejectDialogAppt, setRejectDialogAppt] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rescheduleDialogAppt, setRescheduleDialogAppt] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ newDate: '', newTime: '', reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();
  const { user } = useAuth();

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getVetAppointments();
      const sorted = data.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
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

  // Filter & Search Logic
  const filteredAppointments = appointments.filter((appt) => {
    // Status Filter
    const apptStatus = (appt.status || '').toUpperCase();
    if (statusFilter === 'PENDING' && apptStatus !== 'PENDING') return false;
    if (statusFilter === 'CONFIRMED' && apptStatus !== 'CONFIRMED' && apptStatus !== 'UPCOMING') return false;
    if (statusFilter === 'IN_CONSULTATION' && apptStatus !== 'IN_CONSULTATION') return false;
    if (statusFilter === 'COMPLETED' && apptStatus !== 'COMPLETED') return false;
    if (statusFilter === 'CANCELLED' && apptStatus !== 'CANCELLED' && apptStatus !== 'REJECTED') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const petMatch = appt.petName?.toLowerCase().includes(q);
      const ownerMatch = appt.ownerName?.toLowerCase().includes(q);
      const dateMatch = appt.appointmentDate?.includes(q);
      const notesMatch = appt.notes?.toLowerCase().includes(q);
      return petMatch || ownerMatch || dateMatch || notesMatch;
    }

    return true;
  });

  // Action Handlers
  const handleAccept = async (appt) => {
    setActionLoading(true);
    try {
      await vetClinicalService.acceptAppointment(appt.id);
      showToast(`Appointment for ${appt.petName} accepted!`, 'success');
      loadAppointments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept appointment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectDialogAppt) return;
    setActionLoading(true);
    try {
      await vetClinicalService.rejectAppointment(rejectDialogAppt.id, rejectReason);
      showToast(`Appointment declined`, 'info');
      setRejectDialogAppt(null);
      setRejectReason('');
      loadAppointments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to decline appointment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDialogAppt) return;
    if (!rescheduleData.newDate || !rescheduleData.newTime) {
      showToast('Please select a new date and time', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await vetClinicalService.rescheduleAppointment(
        rescheduleDialogAppt.id,
        rescheduleData.newDate,
        rescheduleData.newTime,
        rescheduleData.reason
      );
      showToast('Appointment rescheduled and client notified', 'success');
      setRescheduleDialogAppt(null);
      setRescheduleData({ newDate: '', newTime: '', reason: '' });
      loadAppointments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reschedule appointment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartConsultation = async (appt) => {
    try {
      if (appt.status !== 'IN_CONSULTATION') {
        await vetClinicalService.startConsultation(appt.id);
      }
      setActiveConsultationAppt(appt);
      loadAppointments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to start consultation', 'error');
    }
  };

  // Status counters for tabs
  const counts = {
    ALL: appointments.length,
    PENDING: appointments.filter((a) => a.status === 'PENDING').length,
    CONFIRMED: appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'UPCOMING').length,
    IN_CONSULTATION: appointments.filter((a) => a.status === 'IN_CONSULTATION').length,
    COMPLETED: appointments.filter((a) => a.status === 'COMPLETED').length,
    CANCELLED: appointments.filter((a) => a.status === 'CANCELLED' || a.status === 'REJECTED').length,
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-sky-500" size={32} />
        <p className="text-xs font-bold text-slate-500">Loading appointments schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-200/70 rounded-2xl overflow-x-auto scrollbar-none">
          {[
            { id: 'ALL', label: 'All', count: counts.ALL },
            { id: 'PENDING', label: 'Pending Requests', count: counts.PENDING, highlight: counts.PENDING > 0 },
            { id: 'CONFIRMED', label: 'Confirmed', count: counts.CONFIRMED },
            { id: 'IN_CONSULTATION', label: 'In Consultation', count: counts.IN_CONSULTATION, activePulse: counts.IN_CONSULTATION > 0 },
            { id: 'COMPLETED', label: 'Completed', count: counts.COMPLETED },
            { id: 'CANCELLED', label: 'Cancelled / Rejected', count: counts.CANCELLED },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  tab.highlight
                    ? 'bg-purple-100 text-purple-700'
                    : tab.activePulse
                    ? 'bg-amber-100 text-amber-700 animate-pulse'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative shrink-0 md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pet, owner, date..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500 shadow-sm"
          />
        </div>
      </div>

      {/* Appointments List Grid */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-800">No Appointments Found</h3>
          <p className="text-slate-500 text-xs mt-1">
            {searchQuery
              ? 'No appointments matched your search query.'
              : 'There are currently no appointments in this status category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map((appt) => {
            const isPending = appt.status === 'PENDING';
            const isConfirmed = appt.status === 'CONFIRMED' || appt.status === 'UPCOMING';
            const isInConsultation = appt.status === 'IN_CONSULTATION';
            const isCompleted = appt.status === 'COMPLETED';
            const isCancelled = appt.status === 'CANCELLED' || appt.status === 'REJECTED';

            return (
              <div
                key={appt.id}
                className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isInConsultation
                    ? 'border-amber-400/80 ring-2 ring-amber-400/20 shadow-amber-100/50'
                    : isCancelled
                    ? 'border-slate-100 opacity-75'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Status Badge & Pet ID */}
                  <div className="flex justify-between items-start">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        isPending
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : isConfirmed
                          ? 'bg-sky-50 text-sky-700 border border-sky-100'
                          : isInConsultation
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}
                    >
                      {appt.status}
                    </span>

                    <button
                      onClick={() => setActivePatientPetId(appt.petId)}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                    >
                      <FileText size={13} /> View Chart
                    </button>
                  </div>

                  {/* Pet & Owner Details */}
                  <div>
                    <h4
                      onClick={() => setActivePatientPetId(appt.petId)}
                      className="text-lg font-black text-slate-900 flex items-center gap-2 hover:text-sky-600 transition-colors cursor-pointer"
                    >
                      <PawPrint size={18} className="text-sky-500" /> {appt.petName}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Owner: <strong className="text-slate-800">{appt.ownerName || 'Pet Owner'}</strong>
                    </p>
                  </div>

                  {/* Appointment Info Box */}
                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="flex items-center gap-2 font-bold text-slate-800">
                      <Calendar size={14} className="text-slate-400" /> {appt.appointmentDate}
                    </p>
                    <p className="flex items-center gap-2 font-medium">
                      <Clock size={14} className="text-slate-400" /> {appt.appointmentTime}
                    </p>
                    <p className="flex items-start gap-2 font-medium pt-1 border-t border-slate-200/50">
                      <MessageSquare size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="italic">{appt.notes || 'Routine examination'}</span>
                    </p>
                  </div>
                </div>

                {/* Dynamic Lifecycle Actions */}
                <div className="pt-5 border-t border-slate-100 mt-5 space-y-2">
                  {/* Case 1: PENDING */}
                  {isPending && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(appt)}
                        disabled={actionLoading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <CheckCircle size={14} /> Accept Visit
                      </button>
                      <button
                        onClick={() => setRejectDialogAppt(appt)}
                        disabled={actionLoading}
                        className="px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle size={14} /> Decline
                      </button>
                    </div>
                  )}

                  {/* Case 2: CONFIRMED or UPCOMING */}
                  {isConfirmed && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleStartConsultation(appt)}
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Stethoscope size={15} /> Start Consultation
                      </button>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            setRescheduleDialogAppt(appt);
                            setRescheduleData({
                              newDate: appt.appointmentDate,
                              newTime: appt.appointmentTime,
                              reason: '',
                            });
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-[11px] transition-colors flex items-center justify-center gap-1"
                        >
                          <Clock4 size={13} /> Reschedule
                        </button>
                        <button
                          onClick={() => setActiveChat(appt)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 rounded-xl text-[11px] transition-colors flex items-center justify-center gap-1"
                        >
                          <MessageSquare size={13} /> Chat
                        </button>
                        <button
                          onClick={() => setActivePrescription(appt)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-2 rounded-xl text-[11px] transition-colors flex items-center justify-center gap-1"
                        >
                          <PawPrint size={13} /> Rx
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Case 3: IN_CONSULTATION */}
                  {isInConsultation && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveConsultationAppt(appt)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer animate-pulse"
                      >
                        <Stethoscope size={15} /> Resume Active Consultation
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveChat(appt)}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <MessageSquare size={13} /> Chat with Owner
                        </button>
                        <button
                          onClick={() => setActivePatientPetId(appt.petId)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <FileText size={13} /> Pet Chart
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Case 4: COMPLETED */}
                  {isCompleted && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActivePatientPetId(appt.petId)}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle size={14} /> Completed Chart
                      </button>
                      <button
                        onClick={() => setActiveChat(appt)}
                        className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <MessageSquare size={13} />
                      </button>
                    </div>
                  )}

                  {/* Case 5: CANCELLED / REJECTED */}
                  {isCancelled && (
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Status: {appt.status}</span>
                      <button
                        onClick={() => setActivePatientPetId(appt.petId)}
                        className="font-bold text-sky-600 hover:text-sky-700"
                      >
                        Patient Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Appointment Dialog */}
      {rejectDialogAppt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">Decline Appointment Request</h3>
            <p className="text-xs text-slate-500 mb-4">
              Provide a polite reason for declining {rejectDialogAppt.petName}'s appointment on {rejectDialogAppt.appointmentDate}.
            </p>

            <textarea
              rows="3"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. In emergency surgery at that hour. Please request an afternoon slot."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-rose-500 resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setRejectDialogAppt(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Dialog */}
      {rescheduleDialogAppt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">Reschedule Appointment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select a new date and time for {rescheduleDialogAppt.petName}'s visit.
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleData.newDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Time</label>
                <input
                  type="text"
                  required
                  value={rescheduleData.newTime}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newTime: e.target.value })}
                  placeholder="e.g. 11:30 AM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Rescheduling</label>
                <input
                  type="text"
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  placeholder="e.g. Schedule adjustment / doctor unavailable in morning"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRescheduleDialogAppt(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Profile 360 Modal */}
      {activePatientPetId && (
        <VetPatientProfileModal
          petId={activePatientPetId}
          isOpen={!!activePatientPetId}
          onClose={() => setActivePatientPetId(null)}
          onStartConsultation={(appt) => {
            setActivePatientPetId(null);
            handleStartConsultation(appt);
          }}
        />
      )}

      {/* Consultation Room Modal */}
      {activeConsultationAppt && (
        <ConsultationModal
          appointment={activeConsultationAppt}
          isOpen={!!activeConsultationAppt}
          onClose={() => setActiveConsultationAppt(null)}
          onSuccess={() => {
            loadAppointments();
          }}
        />
      )}

      {/* Chat Widget */}
      {activeChat && (
        <ChatWidget
          appointmentId={activeChat.id}
          currentUserId={user?.id}
          otherUserName={activeChat.ownerName || 'Pet Owner'}
          onClose={() => setActiveChat(null)}
        />
      )}

      {/* Prescription Modal */}
      {activePrescription && (
        <CreatePrescriptionModal
          appointment={activePrescription}
          onClose={() => setActivePrescription(null)}
          onSuccess={() => {
            showToast('Prescription issued successfully', 'success');
            setActivePrescription(null);
            loadAppointments();
          }}
        />
      )}
    </div>
  );
}
