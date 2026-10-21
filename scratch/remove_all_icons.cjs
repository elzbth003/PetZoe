const fs = require('fs');
const path = require('path');

const norm = (s) => s.replace(/\r\n/g, '\n');

// 1. AppointmentList.jsx
{
  const filePath = path.resolve('src/components/dashboard/AppointmentList.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  const oldApptBlock = `            {/* Pet selection */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Select Patient Pet</label>
              <SelectDropdown
                value={watch('petId')}
                onChange={(val) => setValue('petId', Number(val), { shouldValidate: true })}
                placeholder="Choose registered pet..."
                icon={PawPrint}
                options={pets.map(p => ({
                  value: p.id,
                  label: \`\${p.name} (\${p.species})\`,
                  icon: p.species?.toLowerCase() === 'cat' ? '🐈' : p.species?.toLowerCase() === 'dog' ? '🐕' : '🐾'
                }))}
                error={errors.petId?.message}
              />
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Select Veterinarian</label>
              <SelectDropdown
                value={watch('veterinarianId')}
                onChange={(val) => setValue('veterinarianId', Number(val), { shouldValidate: true })}
                placeholder="Choose certified vet..."
                icon={User}
                options={vets.map(v => ({
                  value: v.id,
                  label: v.name,
                  icon: '👨‍⚕️',
                  badge: v.specialization || 'Certified Vet'
                }))}
                error={errors.veterinarianId?.message}
              />
            </div>`;

  const newApptBlock = `            {/* Pet selection */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Select Patient Pet</label>
              <SelectDropdown
                value={watch('petId')}
                onChange={(val) => setValue('petId', Number(val), { shouldValidate: true })}
                placeholder="Choose registered pet..."
                options={pets.map(p => ({
                  value: p.id,
                  label: \`\${p.name} (\${p.species})\`
                }))}
                error={errors.petId?.message}
              />
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Select Veterinarian</label>
              <SelectDropdown
                value={watch('veterinarianId')}
                onChange={(val) => setValue('veterinarianId', Number(val), { shouldValidate: true })}
                placeholder="Choose certified vet..."
                options={vets.map(v => ({
                  value: v.id,
                  label: v.name,
                  badge: v.specialization || 'Certified Vet'
                }))}
                error={errors.veterinarianId?.message}
              />
            </div>`;

  if (content.includes(oldApptBlock)) {
    content = content.replace(oldApptBlock, newApptBlock);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('1. Removed icons from AppointmentList.jsx');
  } else {
    console.error('1. Could not match oldApptBlock in AppointmentList.jsx');
  }
}

// 2. PetList.jsx
{
  const filePath = path.resolve('src/components/dashboard/PetList.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  // Species filter
  const oldSpeciesFilter = `              options={[
                { value: 'All', label: 'All Species' },
                { value: 'Dog', label: 'Dog', icon: '🐕' },
                { value: 'Cat', label: 'Cat', icon: '🐈' },
                { value: 'Bird', label: 'Bird', icon: '🦜' },
                { value: 'Rabbit', label: 'Rabbit', icon: '🐇' },
                { value: 'Other', label: 'Other', icon: '🐾' }
              ]}`;

  const newSpeciesFilter = `              options={[
                { value: 'All', label: 'All Species' },
                { value: 'Dog', label: 'Dog' },
                { value: 'Cat', label: 'Cat' },
                { value: 'Bird', label: 'Bird' },
                { value: 'Rabbit', label: 'Rabbit' },
                { value: 'Other', label: 'Other' }
              ]}`;

  if (content.includes(oldSpeciesFilter)) {
    content = content.replace(oldSpeciesFilter, newSpeciesFilter);
  }

  // Gender
  const oldGender = `                        options={[
                          { value: 'Male', label: 'Male', icon: '♂' },
                          { value: 'Female', label: 'Female', icon: '♀' }
                        ]}`;

  const newGender = `                        options={[
                          { value: 'Male', label: 'Male' },
                          { value: 'Female', label: 'Female' }
                        ]}`;

  if (content.includes(oldGender)) {
    content = content.replace(oldGender, newGender);
  }

  // Vaccination status
  const oldVacc = `                        options={[
                          { value: 'Up-to-date', label: 'Up-to-date', icon: '🟢', badge: 'Active' },
                          { value: 'Needs Vaccination', label: 'Needs Vaccination', icon: '🟡', badge: 'Due' },
                          { value: 'Overdue', label: 'Overdue', icon: '🔴', badge: 'Alert' },
                        ]}`;

  const newVacc = `                        options={[
                          { value: 'Up-to-date', label: 'Up-to-date', badge: 'Active' },
                          { value: 'Needs Vaccination', label: 'Needs Vaccination', badge: 'Due' },
                          { value: 'Overdue', label: 'Overdue', badge: 'Alert' },
                        ]}`;

  if (content.includes(oldVacc)) {
    content = content.replace(oldVacc, newVacc);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('2. Removed icons from PetList.jsx');
}

// 3. ConsultationModal.jsx
{
  const filePath = path.resolve('src/components/dashboard/ConsultationModal.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  const oldHealth = `                  options={[
                    { value: 'Under Treatment', label: 'Under Treatment', icon: '🟡', badge: 'Active' },
                    { value: 'Recovering', label: 'Recovering', icon: '🟢', badge: 'Progress' },
                    { value: 'Healthy', label: 'Healthy (Normal)', icon: '✅', badge: 'Normal' },
                    { value: 'Examined', label: 'Examined', icon: '🩺', badge: 'Done' },
                    { value: 'Critical', label: 'Critical', icon: '🚨', badge: 'Urgent' }
                  ]}`;

  const newHealth = `                  options={[
                    { value: 'Under Treatment', label: 'Under Treatment', badge: 'Active' },
                    { value: 'Recovering', label: 'Recovering', badge: 'Progress' },
                    { value: 'Healthy', label: 'Healthy (Normal)', badge: 'Normal' },
                    { value: 'Examined', label: 'Examined', badge: 'Done' },
                    { value: 'Critical', label: 'Critical', badge: 'Urgent' }
                  ]}`;

  if (content.includes(oldHealth)) {
    content = content.replace(oldHealth, newHealth);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('3. Removed icons from ConsultationModal.jsx');
  }
}

// 4. VetScanView.jsx
{
  const filePath = path.resolve('src/components/dashboard/owner/VetScanView.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  const oldVetScan = `                options={pets.map((pet) => ({
                  value: pet.id,
                  label: \`\${pet.name} (\${pet.breed || pet.species})\`,
                  icon: '🐕',
                  badge: \`ID: \${pet.petCode || pet.id}\`
                }))}`;

  const newVetScan = `                options={pets.map((pet) => ({
                  value: pet.id,
                  label: \`\${pet.name} (\${pet.breed || pet.species})\`,
                  badge: \`ID: \${pet.petCode || pet.id}\`
                }))}`;

  if (content.includes(oldVetScan)) {
    content = content.replace(oldVetScan, newVetScan);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('4. Removed icons from VetScanView.jsx');
  }
}

// 5. AdoptionListingsPage.jsx
{
  const filePath = path.resolve('src/pages/adoption/AdoptionListingsPage.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  const oldAdopt = `                  options={[
                    { value: '', label: 'All Species' },
                    ...speciesList.map(s => ({
                      value: s,
                      label: s,
                      icon: s.toLowerCase() === 'dog' ? '🐕' : s.toLowerCase() === 'cat' ? '🐈' : '🐾'
                    }))
                  ]}`;

  const newAdopt = `                  options={[
                    { value: '', label: 'All Species' },
                    ...speciesList.map(s => ({ value: s, label: s }))
                  ]}`;

  if (content.includes(oldAdopt)) {
    content = content.replace(oldAdopt, newAdopt);
  }

  const oldSex = `                  options={[
                    { value: '', label: 'Any Sex' },
                    { value: 'MALE', label: 'Male', icon: '♂' },
                    { value: 'FEMALE', label: 'Female', icon: '♀' }
                  ]}`;

  const newSex = `                  options={[
                    { value: '', label: 'Any Sex' },
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' }
                  ]}`;

  if (content.includes(oldSex)) {
    content = content.replace(oldSex, newSex);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('5. Removed icons from AdoptionListingsPage.jsx');
}

// 6. AddProductWizard.jsx
{
  const filePath = path.resolve('src/components/dashboard/AddProductWizard.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  const oldPetWizard = `                options={[
                  { value: 'All Pets', label: 'All Pets', icon: '🐾' },
                  { value: 'Dog', label: 'Dog', icon: '🐕' },
                  { value: 'Cat', label: 'Cat', icon: '🐈' },
                  { value: 'Bird', label: 'Bird', icon: '🦜' },
                  { value: 'Fish', label: 'Fish', icon: '🐠' },
                  { value: 'Small Pet', label: 'Small Pet', icon: '🐹' }
                ]}`;

  const newPetWizard = `                options={[
                  { value: 'All Pets', label: 'All Pets' },
                  { value: 'Dog', label: 'Dog' },
                  { value: 'Cat', label: 'Cat' },
                  { value: 'Bird', label: 'Bird' },
                  { value: 'Fish', label: 'Fish' },
                  { value: 'Small Pet', label: 'Small Pet' }
                ]}`;

  if (content.includes(oldPetWizard)) {
    content = content.replace(oldPetWizard, newPetWizard);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('6. Removed icons from AddProductWizard.jsx');
  }
}

// 7. ProductDetailPage.jsx
{
  const filePath = path.resolve('src/pages/marketplace/ProductDetailPage.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  const oldRating = `                              options={[
                                { value: 5, label: '5 Stars', icon: '⭐⭐⭐⭐⭐' },
                                { value: 4, label: '4 Stars', icon: '⭐⭐⭐⭐' },
                                { value: 3, label: '3 Stars', icon: '⭐⭐⭐' },
                                { value: 2, label: '2 Stars', icon: '⭐⭐' },
                                { value: 1, label: '1 Star', icon: '⭐' }
                              ]}`;

  const newRating = `                              options={[
                                { value: 5, label: '5 Stars' },
                                { value: 4, label: '4 Stars' },
                                { value: 3, label: '3 Stars' },
                                { value: 2, label: '2 Stars' },
                                { value: 1, label: '1 Star' }
                              ]}`;

  if (content.includes(oldRating)) {
    content = content.replace(oldRating, newRating);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('7. Removed icons from ProductDetailPage.jsx');
  }
}
