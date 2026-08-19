import React, { useState } from 'react';
import { ArrowRightCircle } from 'lucide-react';

const STATUS_STYLES = {
  IN_SHELTER_CARE: 'bg-sky-50 text-sky-600',
  UNDER_MEDICAL_CARE: 'bg-amber-50 text-amber-600',
  MEDICAL_REVIEW: 'bg-amber-50 text-amber-600',
  AWAITING_DOCUMENTS: 'bg-amber-50 text-amber-600',
  ADOPTION_REVIEW: 'bg-indigo-50 text-indigo-600',
  READY_FOR_ADOPTION: 'bg-emerald-50 text-emerald-600',
  ON_HOLD: 'bg-slate-100 text-slate-600',
  ADOPTION_PENDING: 'bg-indigo-50 text-indigo-600',
  ADOPTED: 'bg-emerald-50 text-emerald-600',
  WITHDRAWN: 'bg-rose-50 text-rose-600',
};

export { STATUS_STYLES };

export default function AnimalStatusControl({ currentStatus, allowedStatuses, locked, onUpdate }) {
  const [status, setStatus] = useState(allowedStatuses[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onUpdate(status, notes);
      setNotes('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-bold text-slate-700 text-sm">Readiness Status</h5>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${STATUS_STYLES[currentStatus] || 'bg-slate-100 text-slate-600'}`}>
          {currentStatus.replace(/_/g, ' ')}
        </span>
      </div>
      {locked ? (
        <p className="text-xs text-slate-500">Status cannot be changed once adoption is pending, completed, or withdrawn.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150">
              {allowedStatuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <input placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors duration-150" />
            <button type="submit" disabled={saving}
              className="flex items-center justify-center gap-1.5 bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-900 disabled:opacity-50">
              <ArrowRightCircle size={14} /> {saving ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
