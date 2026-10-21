const fs = require('fs');
const path = require('path');

const norm = (s) => s.replace(/\r\n/g, '\n');

// 1. src/index.css
{
  const filePath = path.resolve('src/index.css');
  let content = norm(fs.readFileSync(filePath, 'utf8'));
  const cssRule = `
/* Modern styling for native select elements */
select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem 1rem;
  padding-right: 2.25rem !important;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

select:focus {
  outline: none;
}
`;
  if (!content.includes('Modern styling for native select elements')) {
    content += cssRule;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('1. Updated index.css');
  } else {
    console.log('1. index.css already contains custom select styling');
  }
}

// 2. src/components/dashboard/ConsultationModal.jsx
{
  const filePath = path.resolve('src/components/dashboard/ConsultationModal.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  if (!content.includes("import SelectDropdown from '../ui/SelectDropdown';")) {
    content = content.replace(
      "import { useToast } from '../../hooks/useToast';",
      "import { useToast } from '../../hooks/useToast';\nimport SelectDropdown from '../ui/SelectDropdown';"
    );
  }

  const oldSelect = `              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Health Status</label>
                <select
                  value={formData.healthStatus}
                  onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                >
                  <option value="Under Treatment">Under Treatment</option>
                  <option value="Recovering">Recovering</option>
                  <option value="Healthy">Healthy (Normal)</option>
                  <option value="Examined">Examined</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>`;

  const newSelect = `              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Health Status</label>
                <SelectDropdown
                  value={formData.healthStatus}
                  onChange={(val) => setFormData({ ...formData, healthStatus: val })}
                  options={[
                    { value: 'Under Treatment', label: 'Under Treatment', icon: '🟡', badge: 'Active' },
                    { value: 'Recovering', label: 'Recovering', icon: '🟢', badge: 'Progress' },
                    { value: 'Healthy', label: 'Healthy (Normal)', icon: '✅', badge: 'Normal' },
                    { value: 'Examined', label: 'Examined', icon: '🩺', badge: 'Done' },
                    { value: 'Critical', label: 'Critical', icon: '🚨', badge: 'Urgent' }
                  ]}
                />
              </div>`;

  if (content.includes(oldSelect)) {
    content = content.replace(oldSelect, newSelect);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('2. Updated ConsultationModal.jsx');
  } else {
    console.error('2. ConsultationModal.jsx: target block not found');
  }
}

// 3. src/components/dashboard/owner/VetScanView.jsx
{
  const filePath = path.resolve('src/components/dashboard/owner/VetScanView.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  if (!content.includes("import SelectDropdown from '../../ui/SelectDropdown';")) {
    content = content.replace(
      "import { useToast } from '../../../hooks/useToast';",
      "import { useToast } from '../../../hooks/useToast';\nimport SelectDropdown from '../../ui/SelectDropdown';"
    );
  }

  const oldHandlePetChange = `  const handlePetChange = (e) => {
    const petId = parseInt(e.target.value, 10);
    const pet = pets.find((p) => p.id === petId);
    if (pet) {
      setSelectedPet(pet);
      setScanResult(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      loadPetScanHistory(pet.id);
    }
  };`;

  const newHandlePetChange = `  const handlePetChange = (val) => {
    const rawId = val?.target ? val.target.value : val;
    const petId = parseInt(rawId, 10);
    const pet = pets.find((p) => p.id === petId);
    if (pet) {
      setSelectedPet(pet);
      setScanResult(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      loadPetScanHistory(pet.id);
    }
  };`;

  if (content.includes(oldHandlePetChange)) {
    content = content.replace(oldHandlePetChange, newHandlePetChange);
  }

  const oldPetSelect = `            {/* Pet Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Patient Canine</label>
              <select
                data-testid="pet-selector"
                value={selectedPet?.id || ''}
                onChange={handlePetChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              >
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.breed || pet.species}) — ID: {pet.petCode || pet.id}
                  </option>
                ))}
              </select>
            </div>`;

  const newPetSelect = `            {/* Pet Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Patient Canine</label>
              <SelectDropdown
                value={selectedPet?.id || ''}
                onChange={handlePetChange}
                placeholder="Choose registered canine..."
                options={pets.map((pet) => ({
                  value: pet.id,
                  label: \`\${pet.name} (\${pet.breed || pet.species})\`,
                  icon: '🐕',
                  badge: \`ID: \${pet.petCode || pet.id}\`
                }))}
              />
            </div>`;

  if (content.includes(oldPetSelect)) {
    content = content.replace(oldPetSelect, newPetSelect);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('3. Updated VetScanView.jsx');
  } else {
    console.error('3. VetScanView.jsx: target block not found');
  }
}

// 4. src/pages/adoption/AdoptionListingsPage.jsx
{
  const filePath = path.resolve('src/pages/adoption/AdoptionListingsPage.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  if (!content.includes("import SelectDropdown from '../../components/ui/SelectDropdown';")) {
    content = content.replace(
      "import AdoptionAnimalCard from '../../components/adoption/AdoptionAnimalCard';",
      "import AdoptionAnimalCard from '../../components/adoption/AdoptionAnimalCard';\nimport SelectDropdown from '../../components/ui/SelectDropdown';"
    );
  }

  const oldFilters = `              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Species</label>
                <select value={species} onChange={e => { setSpecies(e.target.value); setCurrentPage(0); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500">
                  <option value="">All</option>
                  {speciesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sex</label>
                <select value={sex} onChange={e => { setSex(e.target.value); setCurrentPage(0); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500">
                  <option value="">Any</option>
                  {SEX_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Size</label>
                <select value={size} onChange={e => { setSize(e.target.value); setCurrentPage(0); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500">
                  <option value="">Any</option>
                  {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>`;

  const newFilters = `              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Species</label>
                <SelectDropdown
                  value={species}
                  onChange={(val) => { setSpecies(val); setCurrentPage(0); }}
                  placeholder="All Species"
                  options={[
                    { value: '', label: 'All Species' },
                    ...speciesList.map(s => ({
                      value: s,
                      label: s,
                      icon: s.toLowerCase() === 'dog' ? '🐕' : s.toLowerCase() === 'cat' ? '🐈' : '🐾'
                    }))
                  ]}
                  size="sm"
                  buttonClassName="bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sex</label>
                <SelectDropdown
                  value={sex}
                  onChange={(val) => { setSex(val); setCurrentPage(0); }}
                  placeholder="Any Sex"
                  options={[
                    { value: '', label: 'Any Sex' },
                    { value: 'MALE', label: 'Male', icon: '♂' },
                    { value: 'FEMALE', label: 'Female', icon: '♀' }
                  ]}
                  size="sm"
                  buttonClassName="bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Size</label>
                <SelectDropdown
                  value={size}
                  onChange={(val) => { setSize(val); setCurrentPage(0); }}
                  placeholder="Any Size"
                  options={[
                    { value: '', label: 'Any Size' },
                    ...SIZE_OPTIONS.map(s => ({ value: s, label: s.replace(/_/g, ' ') }))
                  ]}
                  size="sm"
                  buttonClassName="bg-slate-50"
                />
              </div>`;

  if (content.includes(oldFilters)) {
    content = content.replace(oldFilters, newFilters);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('4. Updated AdoptionListingsPage.jsx');
  } else {
    console.error('4. AdoptionListingsPage.jsx: target block not found');
  }
}

// 5. src/pages/dashboard/admin/VeterinarianManagement.jsx
{
  const filePath = path.resolve('src/pages/dashboard/admin/VeterinarianManagement.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  if (!content.includes("import SelectDropdown from '../../../components/ui/SelectDropdown';")) {
    content = content.replace(
      "import { Filter, Search, CheckCircle, XCircle, AlertCircle, Eye, ShieldCheck, ChevronRight } from 'lucide-react';",
      "import { Filter, Search, CheckCircle, XCircle, AlertCircle, Eye, ShieldCheck, ChevronRight } from 'lucide-react';\nimport SelectDropdown from '../../../components/ui/SelectDropdown';"
    );
  }

  const oldAdminSelect = `          <div className="flex items-center gap-2 relative">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="RESUBMISSION_REQUIRED">Resubmission Req</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>`;

  const newAdminSelect = `          <div className="w-52 shrink-0">
            <SelectDropdown
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              icon={Filter}
              size="sm"
              buttonClassName="bg-white border-slate-200 text-xs font-semibold"
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending Review', badge: 'Pending' },
                { value: 'UNDER_REVIEW', label: 'Under Review', badge: 'Review' },
                { value: 'RESUBMISSION_REQUIRED', label: 'Resubmission Req', badge: 'Action' },
                { value: 'APPROVED', label: 'Approved', badge: 'Active' },
                { value: 'REJECTED', label: 'Rejected', badge: 'Alert' }
              ]}
            />
          </div>`;

  if (content.includes(oldAdminSelect)) {
    content = content.replace(oldAdminSelect, newAdminSelect);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('5. Updated VeterinarianManagement.jsx');
  } else {
    console.error('5. VeterinarianManagement.jsx: target block not found');
  }
}
