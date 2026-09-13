import React, { useEffect, useState } from 'react';
import adminShelterService from '../../../services/adminShelterService';
import { useToast } from '../../../hooks/useToast';
import { CheckCircle, XCircle, FileText, AlertTriangle, Building2 } from 'lucide-react';

const FILTERS = ['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUIRED', 'SUSPENDED'];

export default function ShelterVerificationReview() {
  const [filter, setFilter] = useState('ALL');
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [reason, setReason] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchShelters();
    setSelected(null);
    setDetail(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchShelters = async () => {
    setLoading(true);
    try {
      const res = await adminShelterService.getShelters(filter === 'ALL' ? undefined : filter);
      setShelters(res.data);
    } catch (err) {
      showToast('Failed to fetch shelters', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openShelter = async (summary) => {
    setSelected(summary);
    setReason('');
    try {
      const res = await adminShelterService.getShelterDetail(summary.id);
      setDetail(res.data);
    } catch (err) {
      showToast('Failed to load shelter detail', 'error');
    }
  };

  const runAction = async (action) => {
    if (!selected) return;
    try {
      if (action === 'approve') {
        await adminShelterService.approve(selected.id);
      } else {
        if (!reason.trim()) {
          showToast('Please provide a reason', 'error');
          return;
        }
        if (action === 'reject') await adminShelterService.reject(selected.id, reason);
        else if (action === 'request-changes') await adminShelterService.requestChanges(selected.id, reason);
        else if (action === 'suspend') await adminShelterService.suspend(selected.id, reason);
      }
      showToast('Updated successfully', 'success');
      setSelected(null);
      setDetail(null);
      fetchShelters();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Shelter Verification</h2>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            {f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-4 h-[600px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-slate-400 p-4">Loading...</p>
          ) : shelters.length === 0 ? (
            <p className="text-center text-slate-400 p-4">No shelters found.</p>
          ) : (
            <div className="space-y-3">
              {shelters.map(s => (
                <div key={s.id} onClick={() => openShelter(s)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${selected?.id === s.id ? 'border-slate-400 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}>
                  <p className="font-bold text-slate-800">{s.shelterName}</p>
                  <p className="text-xs text-slate-500">{s.managerName} • {s.managerEmail}</p>
                  <p className="text-xs text-slate-400">{s.city}{s.city && s.state ? ', ' : ''}{s.state}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {s.verificationStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 h-[600px] overflow-y-auto">
          {detail ? (
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">{detail.shelterName}</h3>
                  <p className="text-slate-500">{detail.manager?.name} • {detail.manager?.email} • {detail.manager?.phone}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm">
                <p><strong>Organization Type:</strong> {detail.organizationType || '—'}</p>
                <p><strong>Registration No:</strong> {detail.registrationNumber || '—'}</p>
                <p><strong>Address:</strong> {detail.addressLine}, {detail.city}, {detail.state} {detail.pincode}</p>
                <p><strong>Capacity:</strong> {detail.capacity ?? '—'}</p>
                <p><strong>Veterinary Care Arrangements:</strong> {detail.veterinaryCareArrangements || '—'}</p>
                {detail.description && <p className="mt-2">{detail.description}</p>}
              </div>

              {detail.primaryImageBase64 && (
                <img src={detail.primaryImageBase64} alt="Shelter" className="w-full max-h-64 object-cover rounded-xl border border-slate-100" />
              )}

              <div>
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><FileText size={18} /> Supporting Documents</h4>
                {detail.documents?.length === 0 ? (
                  <p className="text-sm text-slate-500">No documents provided.</p>
                ) : (
                  <div className="space-y-2">
                    {detail.documents.map(doc => (
                      <div key={doc.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                          {doc.documentType.replace(/_/g, ' ')}
                        </div>
                        {doc.documentBase64?.startsWith('data:image') ? (
                          <img src={doc.documentBase64} alt={doc.documentType} className="w-full h-auto max-h-72 object-contain" />
                        ) : (
                          <a href={doc.documentBase64} download className="block p-4 text-center text-sm text-primary-600 font-bold">
                            Download File
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2"><AlertTriangle size={16} /> Decision</h4>
                <textarea
                  placeholder="Reason (required for reject / request changes / suspend)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => runAction('approve')}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button onClick={() => runAction('reject')}
                    className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                    <XCircle size={16} /> Reject
                  </button>
                  <button onClick={() => runAction('request-changes')}
                    className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm">
                    Request Changes
                  </button>
                  <button onClick={() => runAction('suspend')}
                    className="py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-xl text-sm">
                    Suspend
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 flex-col gap-3">
              <Building2 size={48} className="opacity-20" />
              <p>Select a shelter to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
