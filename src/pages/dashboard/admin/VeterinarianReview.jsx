import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { ArrowLeft, Stethoscope, FileText, CheckCircle, XCircle, AlertCircle, Clock, Check, X, Send } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    UNDER_REVIEW: 'bg-blue-100 text-blue-700 border-blue-200',
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
    RESUBMISSION_REQUIRED: 'bg-orange-100 text-orange-700 border-orange-200',
    NOT_SUBMITTED: 'bg-slate-100 text-slate-700 border-slate-200'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.NOT_SUBMITTED}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export default function VeterinarianReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [vet, setVet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [docReviewModal, setDocReviewModal] = useState({ show: false, doc: null, type: '' });

  useEffect(() => {
    fetchVetDetail();
  }, [id]);

  const fetchVetDetail = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getVeterinarianDetail(id);
      setVet(response.data);
    } catch (err) {
      showToast('Failed to load veterinarian details', 'error');
      navigate('/dashboard/admin/veterinarians');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewProfile = async () => {
    try {
      await adminApi.reviewVeterinarian(id);
      showToast('Profile marked as UNDER REVIEW', 'success');
      fetchVetDetail();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleApproveProfile = async () => {
    try {
      await adminApi.approveVeterinarianProfile(id);
      showToast('Veterinarian approved successfully', 'success');
      fetchVetDetail();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve', 'error');
    }
  };

  const handleRejectProfile = async () => {
    try {
      await adminApi.rejectVeterinarianProfile(id, reason);
      showToast('Veterinarian rejected', 'success');
      setShowRejectModal(false);
      setReason('');
      fetchVetDetail();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject', 'error');
    }
  };

  const handleRequestResubmission = async () => {
    try {
      await adminApi.requestResubmissionVeterinarian(id, reason);
      showToast('Resubmission requested', 'success');
      setShowResubmitModal(false);
      setReason('');
      fetchVetDetail();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to request resubmission', 'error');
    }
  };

  const handleDocumentReview = async () => {
    try {
      const status = docReviewModal.type === 'approve' ? 'APPROVED' : 'REJECTED';
      await adminApi.reviewVeterinarianDocument(docReviewModal.doc.id, status, reason);
      showToast(`Document ${status.toLowerCase()}`, 'success');
      setDocReviewModal({ show: false, doc: null, type: '' });
      setReason('');
      fetchVetDetail();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to review document', 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading details...</div>;
  }

  if (!vet) return null;

  const allDocsApproved = vet.documents?.length > 0 && vet.documents.every(d => d.status === 'APPROVED');
  const canApprove = vet.verificationStatus === 'UNDER_REVIEW' && allDocsApproved;
  const canStartReview = vet.verificationStatus === 'PENDING' || vet.verificationStatus === 'RESUBMISSION_REQUIRED';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/admin/veterinarians" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            Review: {vet.name}
            <StatusBadge status={vet.verificationStatus} />
          </h1>
          <p className="text-slate-500 text-sm mt-1">{vet.email} • ID: {vet.userId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile & History */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Profile Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Specialization</p>
                <p className="text-slate-800 font-semibold">{vet.specialization || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Qualification</p>
                <p className="text-slate-800">{vet.qualification || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registration Number</p>
                <p className="text-slate-800">{vet.registrationNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                <p className="text-slate-800">{vet.experience ? `${vet.experience} Years` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                <p className="text-slate-800">{vet.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Verification History</h2>
            <div className="space-y-4">
              {vet.history?.length === 0 ? (
                <p className="text-sm text-slate-500">No history available</p>
              ) : (
                vet.history?.map((h) => (
                  <div key={h.id} className="relative pl-4 border-l-2 border-slate-200 text-sm">
                    <div className="absolute w-2 h-2 bg-slate-400 rounded-full -left-[5px] top-1.5"></div>
                    <p className="font-semibold text-slate-700">{h.action}</p>
                    {h.reason && <p className="text-slate-600 mt-0.5 text-xs">Reason: {h.reason}</p>}
                    <p className="text-xs text-slate-400 mt-1">{new Date(h.createdAt).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">By: {h.adminEmail || 'System'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Documents & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Submitted Documents</h2>
              {canStartReview && (
                <button 
                  onClick={handleReviewProfile}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Start Review
                </button>
              )}
            </div>

            <div className="space-y-4">
              {vet.documents?.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-500 border border-slate-100">
                  No documents submitted yet.
                </div>
              ) : (
                vet.documents?.map(doc => (
                  <div key={doc.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-50/50">
                    <div className="flex items-start gap-3">
                      <FileText size={24} className="text-slate-400 mt-1" />
                      <div>
                        <p className="font-bold text-slate-800">{doc.documentType}</p>
                        <p className="text-xs text-slate-500 mt-1">Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <StatusBadge status={doc.status} />
                          {doc.rejectionReason && (
                            <span className="text-xs text-rose-600">Reason: {doc.rejectionReason}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                      {doc.documentBase64 && (
                        <a 
                          href={doc.documentBase64} 
                          download={`${vet.name}_${doc.documentType}`}
                          className="flex-1 md:flex-none px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors text-center"
                        >
                          View / Download
                        </a>
                      )}
                      
                      {vet.verificationStatus === 'UNDER_REVIEW' && doc.status !== 'APPROVED' && (
                        <button 
                          onClick={() => setDocReviewModal({ show: true, doc, type: 'approve' })}
                          className="flex-1 md:flex-none px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Check size={14} /> Approve
                        </button>
                      )}
                      
                      {vet.verificationStatus === 'UNDER_REVIEW' && doc.status !== 'REJECTED' && (
                        <button 
                          onClick={() => setDocReviewModal({ show: true, doc, type: 'reject' })}
                          className="flex-1 md:flex-none px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <X size={14} /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Profile Level Actions */}
          <div className="bg-slate-900 rounded-3xl p-6 shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 overflow-hidden border border-slate-800">
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold text-lg">Final Decision</h3>
              <p className="text-slate-400 text-sm mt-1">
                {vet.verificationStatus === 'APPROVED'
                  ? 'This veterinarian profile has been verified and approved.'
                  : vet.verificationStatus === 'REJECTED'
                  ? 'This veterinarian profile has been rejected.'
                  : canStartReview
                  ? 'Profile is waiting for review. Start review to audit credentials.'
                  : !canApprove && vet.verificationStatus === 'UNDER_REVIEW'
                  ? 'All submitted documents must be approved first before approving profile.'
                  : 'Approve or reject the overall veterinarian profile.'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto shrink-0 justify-start xl:justify-end">
              {canStartReview && (
                <button 
                  onClick={handleReviewProfile}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap active:scale-95"
                >
                  <Clock size={16} /> Start Review
                </button>
              )}

              {vet.verificationStatus === 'APPROVED' ? (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold">
                  <CheckCircle size={16} /> Verified & Active
                </div>
              ) : (
                <>
                  <button 
                    disabled={!canApprove}
                    onClick={handleApproveProfile}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950/40 disabled:text-emerald-500/40 disabled:border-emerald-900/30 border border-emerald-500/30 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:cursor-not-allowed whitespace-nowrap active:scale-95"
                  >
                    <CheckCircle size={16} /> Approve Profile
                  </button>
                  
                  <button 
                    disabled={vet.verificationStatus !== 'UNDER_REVIEW'}
                    onClick={() => setShowResubmitModal(true)}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-950/40 disabled:text-amber-500/40 disabled:border-amber-900/30 border border-amber-500/30 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:cursor-not-allowed whitespace-nowrap active:scale-95"
                  >
                    <AlertCircle size={16} /> Ask Resubmit
                  </button>

                  <button 
                    disabled={vet.verificationStatus !== 'UNDER_REVIEW'}
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-950/40 disabled:text-rose-500/40 disabled:border-rose-900/30 border border-rose-500/30 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:cursor-not-allowed whitespace-nowrap active:scale-95"
                  >
                    <XCircle size={16} /> Reject Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(showRejectModal || showResubmitModal || docReviewModal.show) && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {showRejectModal ? 'Reject Profile' : showResubmitModal ? 'Request Resubmission' : `Review Document: ${docReviewModal.type === 'approve' ? 'Approve' : 'Reject'}`}
            </h3>
            
            {((showRejectModal || showResubmitModal || docReviewModal.type === 'reject')) && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Reason (Required)</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  rows="4"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why..."
                ></textarea>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                onClick={() => {
                  setShowRejectModal(false);
                  setShowResubmitModal(false);
                  setDocReviewModal({ show: false, doc: null, type: '' });
                  setReason('');
                }}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 text-white text-sm font-bold rounded-xl transition-colors ${docReviewModal.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                onClick={showRejectModal ? handleRejectProfile : showResubmitModal ? handleRequestResubmission : handleDocumentReview}
                disabled={((showRejectModal || showResubmitModal || docReviewModal.type === 'reject') && !reason.trim())}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
