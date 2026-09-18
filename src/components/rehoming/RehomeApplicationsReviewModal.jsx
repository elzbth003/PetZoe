import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Clock, ShieldCheck, Phone, Mail, Home, Award, Loader2, AlertTriangle, AlertCircle } from 'lucide-react';
import rehomeService from '../../services/rehomeService';

export default function RehomeApplicationsReviewModal({ listing, pet, isOpen, onClose, onActionSuccess, showToast }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [confirmAcceptApp, setConfirmAcceptApp] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (isOpen && listing?.id) {
      fetchApplications();
    }
  }, [isOpen, listing?.id]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await rehomeService.getListingApplications(listing.id);
      setApplications(res.data || []);
    } catch (err) {
      showToast('Failed to load adoption applications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (appId) => {
    setProcessingId(appId);
    try {
      await rehomeService.rejectApplication(appId);
      showToast('Application declined.', 'info');
      fetchApplications();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to decline application.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAcceptConfirm = async () => {
    if (!confirmAcceptApp) return;
    setProcessingId(confirmAcceptApp.id);
    try {
      await rehomeService.acceptApplication(confirmAcceptApp.id);
      showToast(`Ownership of ${pet.name} (${pet.petCode}) successfully transferred to ${confirmAcceptApp.applicantName}!`, 'success');
      setConfirmAcceptApp(null);
      onActionSuccess?.();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept application and transfer ownership.', 'error');
      setProcessingId(null);
    }
  };

  const handleWithdrawListing = async () => {
    if (!window.confirm('Are you sure you want to withdraw this rehoming listing? Any pending applications will be cancelled.')) return;
    setIsWithdrawing(true);
    try {
      await rehomeService.cancelListing(listing.id);
      showToast('Rehoming listing withdrawn successfully.', 'info');
      onActionSuccess?.();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to withdraw listing.', 'error');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!isOpen || !listing) return null;

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Listing Active
              </span>
              <span className="font-mono text-[10px] font-bold bg-sky-100/80 text-sky-800 px-2 py-0.5 rounded-md border border-sky-200/60">
                {pet?.petCode}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mt-1.5">
              Review Applicants for {pet?.name}
            </h3>
            <p className="text-xs text-slate-500">
              {applications.length} total applications ({pendingCount} pending review)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 size={28} className="animate-spin text-amber-500" />
              <p className="text-xs font-medium">Loading applicant requests...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Clock size={36} className="mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No applications received yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Your listing is active on the community board. As soon as interested pet lovers apply, their details will appear here.
              </p>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className={`p-5 rounded-2xl border transition-all ${
                  app.status === 'ACCEPTED'
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : app.status === 'REJECTED'
                    ? 'bg-slate-50/60 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Applicant Header */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{app.applicantName}</h4>
                      {app.status === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Clock size={10} /> Pending
                        </span>
                      )}
                      {app.status === 'ACCEPTED' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Accepted (New Owner)
                        </span>
                      )}
                      {app.status === 'REJECTED' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                          <XCircle size={10} /> Declined
                        </span>
                      )}
                      {app.status === 'CANCELLED' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          Withdrawn
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" /> {app.applicantEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" /> {app.contactPhone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="mt-3.5 bg-slate-50/90 rounded-xl p-3 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block">Personal Message</span>
                  <p className="leading-relaxed whitespace-pre-wrap">{app.applicantMessage}</p>
                </div>

                {/* Details Grid */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
                    <Home size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[10px] text-slate-500 block uppercase">Living Arrangement</span>
                      <p className="text-slate-800 text-[11px] mt-0.5">{app.livingSituation}</p>
                    </div>
                  </div>
                  {app.experienceNotes && (
                    <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
                      <Award size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[10px] text-slate-500 block uppercase">Pet Experience</span>
                        <p className="text-slate-800 text-[11px] mt-0.5">{app.experienceNotes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Decision Actions (Only for PENDING applications) */}
                {app.status === 'PENDING' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                    <button
                      type="button"
                      disabled={processingId === app.id}
                      onClick={() => handleReject(app.id)}
                      className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {processingId === app.id ? <Loader2 size={12} className="animate-spin" /> : 'Decline'}
                    </button>
                    <button
                      type="button"
                      disabled={processingId === app.id}
                      onClick={() => setConfirmAcceptApp(app)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} />
                      Accept & Transfer Pet
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <button
            type="button"
            disabled={isWithdrawing}
            onClick={handleWithdrawListing}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer disabled:opacity-50"
          >
            {isWithdrawing ? 'Withdrawing...' : 'Withdraw Rehoming Listing'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Confirmation Submodal for Atomic Acceptance */}
      {confirmAcceptApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-60 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-100 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200">
                <AlertTriangle size={20} />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Confirm Ownership Transfer</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to accept <strong className="text-slate-800">{confirmAcceptApp.applicantName}</strong>?
            </p>

            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3.5 text-[11px] text-sky-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-sky-600" />
                Atomic Ownership & Medical Continuity:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-sky-800">
                <li>Legal ownership of <strong>{pet.name}</strong> will officially transfer to {confirmAcceptApp.applicantName}.</li>
                <li>The permanent Pet ID (<strong>{pet.petCode}</strong>) and all historical medical consultations, vaccinations, and documents remain 100% intact.</li>
                <li>All other pending applications will be automatically concluded.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAcceptApp(null)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processingId === confirmAcceptApp.id}
                onClick={handleAcceptConfirm}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {processingId === confirmAcceptApp.id && <Loader2 size={13} className="animate-spin" />}
                Confirm & Rehome
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
