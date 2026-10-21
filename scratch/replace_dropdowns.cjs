const fs = require('fs');
const path = require('path');

// 1. AppointmentList.jsx
const apptPath = path.resolve('src/components/dashboard/AppointmentList.jsx');
let apptContent = fs.readFileSync(apptPath, 'utf8');

const oldApptPetVet = `            {/* Pet selection */}
            <div>
              {/* Custom Pet Dropdown */}
              <select
                className={\`w-full px-3 py-2.5 rounded-xl bg-slate-50 border \${errors.petId ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-semibold cursor-pointer focus:outline-none\`}
                {...register('petId')}
              >
                <option value="0">Choose registered pet...</option>
                {pets.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                ))}
              </select>
              {errors.petId && (
                <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.petId.message}</p>
              )}
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Select Veterinarian</label>
              <select
                className={\`w-full px-3 py-2.5 rounded-xl bg-slate-50 border \${errors.veterinarianId ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-semibold cursor-pointer focus:outline-none\`}
                {...register('veterinarianId')}
              >
                <option value="0">Choose certified vet...</option>
                {vets.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              {errors.veterinarianId && (
                <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.veterinarianId.message}</p>
              )}
            </div>`;

const newApptPetVet = `            {/* Pet selection */}
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

// Normalize CRLF to LF for matching
const norm = (s) => s.replace(/\r\n/g, '\n');

if (norm(apptContent).includes(norm(oldApptPetVet))) {
  apptContent = norm(apptContent).replace(norm(oldApptPetVet), norm(newApptPetVet));
  fs.writeFileSync(apptPath, apptContent, 'utf8');
  console.log('Successfully updated AppointmentList.jsx');
} else {
  console.error('Failed to match oldApptPetVet in AppointmentList.jsx');
}
