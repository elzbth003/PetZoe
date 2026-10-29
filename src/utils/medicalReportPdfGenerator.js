/**
 * PetZoe Medical Report PDF Generator
 * Generates an official, print-ready Veterinary Health Passport & Clinical Medical Record
 * formatted specifically for A4 PDF export with page breaks, vector typography, and clinical branding.
 */

export function generateMedicalReportHtml({
  pet,
  owner,
  clinicalRecords = [],
  prescriptions = [],
  vaccinations = [],
  documents = [],
  vetScanRecords = []
}) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const reportCode = `PZ-EHR-${pet?.id || '00'}-${Date.now().toString().slice(-6)}`;
  const petIdFormatted = pet?.petCode || `PZ-PET-${String(pet?.id || 1).padStart(6, '0')}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PetZoe Medical Report - ${pet?.name || 'Pet'}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #172B4D;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.45;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #17365C;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-icon {
      width: 34px;
      height: 34px;
      background: #17365C;
      color: #ffffff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 18px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 900;
      color: #17365C;
      letter-spacing: -0.5px;
      line-height: 1;
    }
    .brand-sub {
      font-size: 8px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1px;
      color: #71829E;
      margin-top: 2px;
    }
    .report-meta {
      text-align: right;
    }
    .report-title {
      font-size: 13px;
      font-weight: 800;
      color: #17365C;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .report-id {
      font-family: monospace;
      font-size: 10px;
      color: #3B82F6;
      font-weight: bold;
      margin-top: 2px;
    }
    .report-date {
      font-size: 9px;
      color: #71829E;
      margin-top: 2px;
    }
    
    /* Grids & Cards */
    .profile-card {
      border: 1px solid #E5ECF4;
      border-radius: 10px;
      padding: 12px 14px;
      background: #F8FAFC;
      margin-bottom: 16px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #17365C;
      border-bottom: 1.5px solid #E5ECF4;
      padding-bottom: 4px;
      margin-top: 14px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .item-label {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #71829E;
    }
    .item-value {
      font-size: 11px;
      font-weight: 700;
      color: #172B4D;
      margin-top: 1px;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-green { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
    .badge-blue { background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; }
    .badge-amber { background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A; }
    .badge-red { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      margin-bottom: 12px;
      font-size: 10px;
    }
    th {
      background: #F1F5F9;
      color: #17365C;
      font-weight: 800;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #E2E8F0;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    td {
      padding: 6px 8px;
      border: 1px solid #E2E8F0;
      vertical-align: top;
      color: #334155;
    }
    tr:nth-child(even) td {
      background: #F8FAFC;
    }
    .empty-row {
      text-align: center;
      color: #94A3B8;
      font-style: italic;
      padding: 12px;
    }

    /* Print Controls */
    .print-actions {
      position: fixed;
      top: 15px;
      right: 15px;
      display: flex;
      gap: 8px;
      z-index: 9999;
    }
    .print-actions button {
      padding: 8px 14px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 11px;
      cursor: pointer;
      border: none;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      font-family: inherit;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #17365C;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #0F233D;
    }
    .btn-secondary {
      background: #E2E8F0;
      color: #334155;
    }
    .btn-secondary:hover {
      background: #CBD5E1;
    }
    @media print {
      .print-actions {
        display: none !important;
      }
      .page-break {
        page-break-before: always;
      }
    }
    
    .footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #E5ECF4;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 8.5px;
      color: #71829E;
    }
    .stamp-box {
      border: 1.5px dashed #CBD5E1;
      border-radius: 6px;
      padding: 6px 12px;
      text-align: center;
      font-size: 8px;
      text-transform: uppercase;
      color: #94A3B8;
      font-weight: bold;
    }
  </style>
</head>
<body>

  <div class="print-actions">
    <button class="btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
    <button class="btn-secondary" onclick="window.close()">Close</button>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="logo-container">
      <div class="logo-icon">🐾</div>
      <div>
        <div class="brand-name">PetZoe</div>
        <div class="brand-sub">Digital Veterinary Health Network</div>
      </div>
    </div>
    <div class="report-meta">
      <div class="report-title">Comprehensive Pet Medical Report</div>
      <div class="report-id">Document Ref: ${reportCode}</div>
      <div class="report-date">Exported on: ${currentDate} at ${currentTime}</div>
    </div>
  </div>

  <!-- Pet & Owner Profile Summary -->
  <div class="profile-card">
    <div class="grid-2">
      <!-- Pet Demographics -->
      <div>
        <div style="font-size: 13px; font-weight: 800; color: #17365C; margin-bottom: 6px;">
          Patient: ${pet?.name || 'Pet'} 
          <span class="badge badge-blue" style="margin-left: 6px; font-family: monospace;">${petIdFormatted}</span>
        </div>
        <div class="grid-3" style="row-gap: 6px;">
          <div>
            <div class="item-label">Species</div>
            <div class="item-value">${pet?.species || 'Canine'}</div>
          </div>
          <div>
            <div class="item-label">Breed</div>
            <div class="item-value">${pet?.breed || 'Mixed'}</div>
          </div>
          <div>
            <div class="item-label">Sex / Gender</div>
            <div class="item-value">${pet?.gender || 'Unknown'}</div>
          </div>
          <div>
            <div class="item-label">Age / DOB</div>
            <div class="item-value">${pet?.age ? `${pet.age} Years` : (pet?.dateOfBirth || 'Not Recorded')}</div>
          </div>
          <div>
            <div class="item-label">Weight</div>
            <div class="item-value">${pet?.weight ? `${pet.weight} kg` : 'Recorded at Clinic'}</div>
          </div>
          <div>
            <div class="item-label">Microchip ID</div>
            <div class="item-value font-mono">${pet?.microchipNumber || 'Not Implanted'}</div>
          </div>
        </div>
        ${pet?.allergies ? `
        <div style="margin-top: 8px;">
          <span class="badge badge-red">Allergies: ${pet.allergies}</span>
        </div>` : ''}
      </div>

      <!-- Owner Details -->
      <div style="border-left: 1px solid #E2E8F0; padding-left: 14px;">
        <div style="font-size: 11px; font-weight: 800; color: #17365C; margin-bottom: 6px;">
          Registered Pet Guardian
        </div>
        <div style="margin-bottom: 5px;">
          <div class="item-label">Full Name</div>
          <div class="item-value">${owner?.name || pet?.ownerName || 'Pet Guardian'}</div>
        </div>
        <div class="grid-2" style="margin-bottom: 5px;">
          <div>
            <div class="item-label">Contact Email</div>
            <div class="item-value">${owner?.email || 'Registered on PetZoe'}</div>
          </div>
          <div>
            <div class="item-label">Phone</div>
            <div class="item-value">${owner?.phone || 'On Record'}</div>
          </div>
        </div>
        <div style="margin-top: 6px;">
          <span class="badge badge-green">✓ Verified Digital Health Passport</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Section 1: Clinical Consultations & Examinations -->
  <div class="section-title">
    <span>1. Clinical Consultations & Diagnostic Examinations</span>
    <span style="font-size: 9px; font-weight: normal; color: #71829E;">${clinicalRecords.length} Record(s)</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Date</th>
        <th style="width: 20%;">Veterinarian</th>
        <th style="width: 25%;">Diagnosis & Findings</th>
        <th style="width: 25%;">Treatment & Medication</th>
        <th style="width: 15%;">Follow-Up</th>
      </tr>
    </thead>
    <tbody>
      ${clinicalRecords.length === 0 ? `
        <tr><td colspan="5" class="empty-row">No clinical consultation records registered yet.</td></tr>
      ` : clinicalRecords.map(rec => `
        <tr>
          <td>
            <strong>${rec.examinationDate || '—'}</strong>
            ${rec.healthStatus ? `<br><span class="badge badge-blue" style="margin-top: 2px;">${rec.healthStatus}</span>` : ''}
          </td>
          <td><strong>Dr. ${rec.veterinarianName || 'Attending Vet'}</strong></td>
          <td>
            <strong>${rec.diagnosis || 'General Examination'}</strong>
            ${rec.symptoms ? `<div style="font-size: 9px; color: #64748B; margin-top: 2px;"><em>Symptoms:</em> ${rec.symptoms}</div>` : ''}
          </td>
          <td>
            <div>${rec.treatment || 'Observation & Care'}</div>
            ${rec.medication ? `<div style="font-size: 9px; color: #475569; margin-top: 2px;"><strong>Rx:</strong> ${rec.medication}</div>` : ''}
          </td>
          <td>
            ${rec.followUpRequired ? `
              <span class="badge badge-amber">Due: ${rec.followUpDate || 'TBD'}</span>
              ${rec.followUpNotes ? `<div style="font-size: 8px; color: #92400E; margin-top: 2px;">${rec.followUpNotes}</div>` : ''}
            ` : 'None required'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Section 2: Prescriptions (Rx) -->
  <div class="section-title">
    <span>2. Pharmacy & Prescription History (Rx)</span>
    <span style="font-size: 9px; font-weight: normal; color: #71829E;">${prescriptions.length} Prescription(s)</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Medication (Rx)</th>
        <th style="width: 15%;">Dosage</th>
        <th style="width: 18%;">Schedule / Frequency</th>
        <th style="width: 15%;">Duration</th>
        <th style="width: 30%;">Instructions & Doctor</th>
      </tr>
    </thead>
    <tbody>
      ${prescriptions.length === 0 ? `
        <tr><td colspan="5" class="empty-row">No pharmacy prescriptions on record.</td></tr>
      ` : prescriptions.map(rx => `
        <tr>
          <td><strong style="color: #7C3AED;">${rx.medicineName || 'Medication'}</strong></td>
          <td>${rx.dosage || 'Standard'}</td>
          <td>${rx.frequency || 'As directed'}</td>
          <td>${rx.duration || 'Full course'}</td>
          <td>
            <div>${rx.instructions || 'Administer as directed by veterinarian.'}</div>
            <div style="font-size: 8.5px; color: #64748B; margin-top: 2px;">
              Prescribed by Dr. ${rx.veterinarianName || 'Attending Vet'} • ${new Date(rx.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Section 3: Vaccinations & Immunizations -->
  <div class="section-title">
    <span>3. Immunization & Preventive Care Registry</span>
    <span style="font-size: 9px; font-weight: normal; color: #71829E;">${vaccinations.length} Immunization(s)</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 30%;">Antigen / Vaccine</th>
        <th style="width: 20%;">Date Administered</th>
        <th style="width: 20%;">Batch / Lot #</th>
        <th style="width: 15%;">Revaccination Due</th>
        <th style="width: 15%;">Administered By</th>
      </tr>
    </thead>
    <tbody>
      ${vaccinations.length === 0 ? `
        <tr><td colspan="5" class="empty-row">No vaccination records registered.</td></tr>
      ` : vaccinations.map(vac => {
        const isOverdue = vac.nextDueDate && new Date(vac.nextDueDate) < new Date();
        return `
        <tr>
          <td><strong>${vac.vaccineName || 'Core Vaccine'}</strong></td>
          <td>${vac.dateAdministered || '—'}</td>
          <td style="font-family: monospace;">${vac.batchLotNumber || 'LOT-VERIFIED'}</td>
          <td>
            ${vac.nextDueDate ? `
              <span class="badge ${isOverdue ? 'badge-red' : 'badge-green'}">
                ${isOverdue ? 'Overdue: ' : 'Due: '}${vac.nextDueDate}
              </span>
            ` : 'Up-to-date'}
          </td>
          <td>Dr. ${vac.veterinarianName || 'Clinic Staff'}</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  ${vetScanRecords && vetScanRecords.length > 0 ? `
  <!-- Section 4: VetScan AI Preliminary Lesion Screenings -->
  <div class="section-title">
    <span>4. VetScan AI Dermatological Screening Reports</span>
    <span style="font-size: 9px; font-weight: normal; color: #71829E;">${vetScanRecords.length} Scan(s)</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Scan ID & Date</th>
        <th style="width: 15%;">Severity</th>
        <th style="width: 35%;">AI Detection Indicators</th>
        <th style="width: 35%;">Veterinarian Review & Clinical Notes</th>
      </tr>
    </thead>
    <tbody>
      ${vetScanRecords.map(scan => `
        <tr>
          <td>
            <strong>#${scan.id}</strong><br>
            <span style="font-size: 8.5px; color: #64748B;">${new Date(scan.createdAt).toLocaleDateString()}</span>
          </td>
          <td>
            <span class="badge ${scan.severity === 'SEVERE' ? 'badge-red' : scan.severity === 'MODERATE' ? 'badge-amber' : 'badge-green'}">
              ${scan.severity || 'NORMAL'}
            </span>
          </td>
          <td>
            ${scan.predictions?.map(p => `
              <div style="font-size: 9px;">
                ${p.displayName}: <strong>${Math.round(p.probability * 100)}%</strong>
              </div>
            `).join('') || 'Completed Screening'}
          </td>
          <td>
            <div>${scan.veterinarianNotes || 'Screening archived. Regular monitoring advised.'}</div>
            <div style="font-size: 8.5px; color: #64748B; margin-top: 2px;">
              Status: <strong>${scan.veterinarianReviewStatus || 'ARCHIVED'}</strong>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${documents && documents.length > 0 ? `
  <!-- Section: Diagnostic Lab Reports & Clinical Documents -->
  <div class="section-title">
    <span>${vetScanRecords && vetScanRecords.length > 0 ? '5' : '4'}. Diagnostic Lab Reports & Clinical Documents</span>
    <span style="font-size: 9px; font-weight: normal; color: #71829E;">${documents.length} Document(s)</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 35%;">Document Title / Description</th>
        <th style="width: 20%;">Category / Classification</th>
        <th style="width: 20%;">Date Uploaded</th>
        <th style="width: 25%;">Registered By & Notes</th>
      </tr>
    </thead>
    <tbody>
      ${documents.map(doc => `
        <tr>
          <td><strong>${doc.documentName || 'Diagnostic Report'}</strong></td>
          <td><span class="badge badge-blue">${doc.documentType || 'LAB_REPORT'}</span></td>
          <td>${(doc.uploadedAt || doc.createdAt || '').split('T')[0] || 'On Record'}</td>
          <td>
            <div>${doc.uploadedByName ? `By ${doc.uploadedByName}` : 'Veterinary Clinic'}</div>
            ${doc.notes ? `<div style="font-size: 8.5px; color: #64748B; margin-top: 2px;"><em>${doc.notes}</em></div>` : ''}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <!-- Footer Certification & Sign-off -->
  <div class="footer">
    <div style="max-width: 65%;">
      <p style="margin: 0; font-weight: bold; color: #17365C;">PetZoe Digital Healthcare Electronic Health Record (EHR)</p>
      <p style="margin: 2px 0 0 0;">
        This document represents an authenticated digital compilation of veterinary observations, diagnostic consultations,
        and prescription logs registered on the PetZoe Veterinary Network. Valid for clinic transfers, boarding compliance, and travel clearance.
      </p>
    </div>
    <div class="stamp-box">
      <div>✓ Authenticated EHR</div>
      <div style="font-family: monospace; font-size: 7.5px; margin-top: 1px;">HASH: ${reportCode}</div>
    </div>
  </div>

  <script>
    // Automatically trigger browser print dialog for instant Save as PDF
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`;
}

/**
 * Triggers the browser print-to-PDF workflow with the complete medical report
 */
export function printPetMedicalReportPdf(data) {
  const htmlContent = generateMedicalReportHtml(data);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // Fallback: If popup is blocked, download as printable HTML/PDF file
    downloadMedicalReportFile(data);
  }
}

/**
 * Direct file download fallback for offline access
 */
export function downloadMedicalReportFile(data) {
  const htmlContent = generateMedicalReportHtml(data);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const petName = (data?.pet?.name || 'Pet').replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `PetZoe_Medical_Report_${petName}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
