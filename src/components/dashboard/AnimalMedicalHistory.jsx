import React from 'react';
import { Stethoscope, Syringe, FileText, ShieldPlus, AlertTriangle } from 'lucide-react';

const DOC_STATUS_STYLES = {
  PENDING: 'bg-amber-50 text-amber-600',
  VERIFIED: 'bg-emerald-50 text-emerald-600',
  REJECTED: 'bg-rose-50 text-rose-600',
  REQUIRES_UPDATE: 'bg-amber-50 text-amber-600',
};

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function DueBadge({ nextDueDate }) {
  if (!nextDueDate) return null;
  const overdue = isOverdue(nextDueDate);
  return (
    <span className={`ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${overdue ? 'bg-rose-50 text-rose-600' : 'bg-sky-50 text-sky-600'}`}>
      {overdue ? 'Overdue' : 'Due'} {nextDueDate}
    </span>
  );
}

export default function AnimalMedicalHistory({ detail, renderDocumentActions }) {
  return (
    <div className="space-y-6">
      {(detail.overdueVaccinationCount > 0 || detail.overduePreventiveCareCount > 0) && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center gap-2 text-rose-700 text-sm font-bold">
          <AlertTriangle size={16} />
          {detail.overdueVaccinationCount > 0 && `${detail.overdueVaccinationCount} vaccination(s) overdue`}
          {detail.overdueVaccinationCount > 0 && detail.overduePreventiveCareCount > 0 && ' · '}
          {detail.overduePreventiveCareCount > 0 && `${detail.overduePreventiveCareCount} preventive care item(s) overdue`}
        </div>
      )}

      <div>
        <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><Stethoscope size={16} /> Veterinary Assessments</h4>
        {detail.medicalRecords?.length === 0 || !detail.medicalRecords ? (
          <p className="text-sm text-slate-500">No veterinary assessments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {detail.medicalRecords.map(r => (
              <div key={r.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm space-y-1">
                <p><strong>{r.examinationDate}</strong> · {r.healthStatus} {r.weightKg != null && `· ${r.weightKg} kg`}</p>
                {r.diagnosis && <p><strong>Diagnosis:</strong> {r.diagnosis}</p>}
                {r.treatment && <p><strong>Treatment:</strong> {r.treatment}</p>}
                {r.medication && <p><strong>Medication:</strong> {r.medication}</p>}
                {r.labInvestigations && <p><strong>Lab Investigations:</strong> {r.labInvestigations}</p>}
                {r.dewormingInfo && <p><strong>Deworming:</strong> {r.dewormingInfo}</p>}
                {r.parasiteControlInfo && <p><strong>Parasite Control:</strong> {r.parasiteControlInfo}</p>}
                {r.sterilizationStatus && <p><strong>Sterilization:</strong> {r.sterilizationStatus.replace(/_/g, ' ')}</p>}
                {r.veterinaryNotes && <p><strong>Notes:</strong> {r.veterinaryNotes}</p>}
                {r.followUpRequired && <p className="text-amber-600 font-bold">Follow-up required{r.followUpDate ? ` by ${r.followUpDate}` : ''}{r.followUpNotes ? `: ${r.followUpNotes}` : ''}</p>}
                <p className="text-xs text-slate-400">Dr. {r.veterinarianName}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><Syringe size={16} /> Vaccinations</h4>
        {detail.vaccinations?.length === 0 || !detail.vaccinations ? (
          <p className="text-sm text-slate-500">No vaccinations recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {detail.vaccinations.map(v => (
              <div key={v.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                <p>
                  <strong>{v.vaccineName}</strong> — administered {v.dateAdministered}
                  {v.nextDueDate && <DueBadge nextDueDate={v.nextDueDate} />}
                </p>
                {v.batchLotNumber && <p className="text-xs text-slate-500">Batch/Lot: {v.batchLotNumber}</p>}
                {v.notes && <p className="text-xs text-slate-500">{v.notes}</p>}
                <p className="text-xs text-slate-400">Dr. {v.veterinarianName}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><ShieldPlus size={16} /> Preventive Care (Deworming / Parasite Control)</h4>
        {detail.preventiveCareRecords?.length === 0 || !detail.preventiveCareRecords ? (
          <p className="text-sm text-slate-500">No preventive care recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {detail.preventiveCareRecords.map(p => (
              <div key={p.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                <p>
                  <strong>{p.careType.replace(/_/g, ' ')}</strong> — administered {p.dateAdministered}
                  {p.nextDueDate && <DueBadge nextDueDate={p.nextDueDate} />}
                </p>
                {p.product && <p className="text-xs text-slate-500">Product: {p.product}</p>}
                {p.notes && <p className="text-xs text-slate-500">{p.notes}</p>}
                <p className="text-xs text-slate-400">Dr. {p.veterinarianName}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><FileText size={16} /> Medical Documents</h4>
        {detail.medicalDocuments?.length === 0 || !detail.medicalDocuments ? (
          <p className="text-sm text-slate-500">No medical documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {detail.medicalDocuments.map(d => (
              <div key={d.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{d.documentType.replace(/_/g, ' ')}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${DOC_STATUS_STYLES[d.verificationStatus] || 'bg-slate-100 text-slate-600'}`}>
                    {d.verificationStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Uploaded by {d.uploadedByName} on {new Date(d.uploadedAt).toLocaleDateString()}</p>
                {d.notes && <p className="text-xs text-slate-500">Note: {d.notes}</p>}
                {d.documentBase64?.startsWith('data:image') ? (
                  <img src={d.documentBase64} alt={d.documentType} className="mt-2 max-h-40 rounded-lg border border-slate-200" />
                ) : (
                  <a href={d.documentBase64} download className="mt-2 inline-block text-primary-600 font-bold text-xs">Download File</a>
                )}
                {renderDocumentActions && renderDocumentActions(d)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
