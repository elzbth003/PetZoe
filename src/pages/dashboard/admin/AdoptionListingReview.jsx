import React, { useEffect, useState } from 'react';
import adminAdoptionListingService from '../../../services/adminAdoptionListingService';
import { useToast } from '../../../hooks/useToast';
import { CheckCircle, XCircle, PawPrint, AlertTriangle } from 'lucide-react';

const FILTERS = ['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUIRED'];

export default function AdoptionListingReview() {
  const [filter, setFilter] = useState('ALL');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [reason, setReason] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchListings();
    setSelected(null);
    setDetail(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await adminAdoptionListingService.getListings(filter === 'ALL' ? undefined : filter);
      setListings(res.data);
    } catch (err) {
      showToast('Failed to fetch adoption listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openListing = async (summary) => {
    setSelected(summary);
    setReason('');
    try {
      const res = await adminAdoptionListingService.getListingDetail(summary.id);
      setDetail(res.data);
    } catch (err) {
      showToast('Failed to load listing detail', 'error');
    }
  };

  const runAction = async (action) => {
    if (!selected) return;
    try {
      if (action === 'approve') {
        await adminAdoptionListingService.approve(selected.id);
      } else {
        if (!reason.trim()) {
          showToast('Please provide a reason', 'error');
          return;
        }
        if (action === 'reject') await adminAdoptionListingService.reject(selected.id, reason);
        else if (action === 'request-changes') await adminAdoptionListingService.requestChanges(selected.id, reason);
      }
      showToast('Updated successfully', 'success');
      setSelected(null);
      setDetail(null);
      fetchListings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Adoption Listing Review</h2>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            {f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-4 h-[650px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-slate-400 p-4">Loading...</p>
          ) : listings.length === 0 ? (
            <p className="text-center text-slate-400 p-4">No listings found.</p>
          ) : (
            <div className="space-y-3">
              {listings.map(l => (
                <div key={l.id} onClick={() => openListing(l)}
                  className={`p-3 rounded-2xl cursor-pointer border flex items-center gap-3 transition-all ${selected?.id === l.id ? 'border-slate-400 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}>
                  <div className="h-11 w-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
                    {l.primaryPhotoBase64 ? <img src={l.primaryPhotoBase64} alt={l.animalName} className="w-full h-full object-cover" /> : <PawPrint size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{l.animalName || 'Unnamed'} <span className="text-slate-400 font-normal">· {l.animalCode}</span></p>
                    <p className="text-xs text-slate-500 truncate">{l.shelterName}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {l.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 h-[650px] overflow-y-auto">
          {detail ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
                  {detail.primaryPhotoBase64 ? <img src={detail.primaryPhotoBase64} alt={detail.animalName} className="w-full h-full object-cover" /> : <PawPrint size={28} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">{detail.animalName || 'Unnamed'}</h3>
                  <p className="text-slate-500">{detail.animalCode} • {detail.species}{detail.breed ? ` • ${detail.breed}` : ''}</p>
                  <p className="text-slate-500 text-sm">{detail.shelterName}</p>
                </div>
              </div>

              {detail.missingRequirements?.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-amber-700 uppercase mb-2 flex items-center gap-1.5"><AlertTriangle size={14} /> Checklist</p>
                  <ul className="text-sm text-amber-700 list-disc list-inside space-y-0.5">
                    {detail.missingRequirements.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm">
                <p><strong>Size:</strong> {detail.size?.replace(/_/g, ' ') || '—'}</p>
                <p><strong>Adoption Fee:</strong> {detail.adoptionFee != null ? `₹${detail.adoptionFee}` : 'Free'}</p>
                {detail.personality && <p><strong>Personality:</strong> {detail.personality}</p>}
                {detail.specialCareRequirements && <p><strong>Special Care:</strong> {detail.specialCareRequirements}</p>}
                {detail.listingDescription && <p><strong>Description:</strong> {detail.listingDescription}</p>}
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800">Decision</h4>
                <textarea
                  placeholder="Reason (required for reject / request changes)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20 resize-none"
                />
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => runAction('approve')}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm">
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button onClick={() => runAction('reject')}
                    className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm">
                    <XCircle size={16} /> Reject
                  </button>
                  <button onClick={() => runAction('request-changes')}
                    className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm">
                    Request Changes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 flex-col gap-3">
              <PawPrint size={48} className="opacity-20" />
              <p>Select a listing to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
