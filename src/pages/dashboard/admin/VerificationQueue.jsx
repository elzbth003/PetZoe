import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { CheckCircle, XCircle, FileText, Download } from 'lucide-react';

export default function VerificationQueue({ entityType, title }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [entityType]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPendingVerifications(entityType);
      setRequests(res.data);
    } catch (err) {
      showToast(`Failed to fetch pending ${title.toLowerCase()}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminApi.approveVerification(id);
      showToast("Approved successfully", "success");
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      showToast("Approval failed", "error");
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason) {
      showToast("Please provide a rejection reason", "error");
      return;
    }
    try {
      await adminApi.rejectVerification(id, rejectReason);
      showToast("Rejected successfully", "success");
      setSelectedRequest(null);
      setRejectReason('');
      fetchRequests();
    } catch (err) {
      showToast("Rejection failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Panel */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-4 h-[600px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-slate-400 p-4">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-slate-400 p-4">No pending requests.</p>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div 
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${selectedRequest?.id === req.id ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-purple-300'}`}
                >
                  <p className="font-bold text-slate-800">{req.user.name}</p>
                  <p className="text-xs text-slate-500">{req.user.email}</p>
                  <p className="text-[10px] uppercase text-slate-400 mt-2">{new Date(req.submittedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 h-[600px] overflow-y-auto">
          {selectedRequest ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{selectedRequest.user.name}</h3>
                <p className="text-slate-500">{selectedRequest.user.email} • {selectedRequest.user.phone}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <p className="text-sm"><strong>Role:</strong> {selectedRequest.user.role}</p>
                {selectedRequest.user.specialization && <p className="text-sm"><strong>Specialization:</strong> {selectedRequest.user.specialization}</p>}
                {selectedRequest.user.address && <p className="text-sm"><strong>Address:</strong> {selectedRequest.user.address}</p>}
                {selectedRequest.user.bio && <p className="text-sm mt-2">{selectedRequest.user.bio}</p>}
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><FileText size={18}/> Attached Documents</h4>
                {selectedRequest.documentBase64 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    {selectedRequest.documentBase64.startsWith('data:image') ? (
                      <img src={selectedRequest.documentBase64} alt="Verification Doc" className="w-full h-auto max-h-96 object-contain" />
                    ) : (
                      <div className="p-8 text-center flex flex-col items-center justify-center">
                         <FileText size={48} className="text-slate-400 mb-2"/>
                         <p className="text-slate-600 mb-4">Document available</p>
                         <a href={selectedRequest.documentBase64} download="verification_document" className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg flex items-center gap-2 text-sm font-bold">
                           <Download size={16}/> Download File
                         </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No primary document provided.</p>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800">Action</h4>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle size={18}/> Approve
                  </button>
                  <div className="flex-1 flex flex-col gap-2">
                    <input 
                      type="text" 
                      placeholder="Reason for rejection..." 
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <button 
                      onClick={() => handleReject(selectedRequest.id)}
                      className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <XCircle size={16}/> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 flex-col gap-3">
              <FileText size={48} className="opacity-20"/>
              <p>Select a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
