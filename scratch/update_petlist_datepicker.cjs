const fs = require('fs');
const path = require('path');

const norm = (s) => s.replace(/\r\n/g, '\n');

const filePath = path.resolve('src/components/dashboard/PetList.jsx');
let content = norm(fs.readFileSync(filePath, 'utf8'));

if (!content.includes("import DatePicker from '../ui/DatePicker';")) {
  content = content.replace(
    "import SelectDropdown from '../ui/SelectDropdown';",
    "import SelectDropdown from '../ui/SelectDropdown';\nimport DatePicker from '../ui/DatePicker';"
  );
}

const oldPetDob = `                    {/* Date of Birth */}
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="pet-dateOfBirth" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Date of Birth <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        id="pet-dateOfBirth"
                        type="date"
                        max={todayIso}
                        className={\`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border \${errors.dateOfBirth ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100\`}
                        {...register('dateOfBirth')}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.dateOfBirth.message}</p>
                      )}
                    </div>`;

const newPetDob = `                    {/* Date of Birth */}
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="pet-dateOfBirth" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Date of Birth <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                      <DatePicker
                        id="pet-dateOfBirth"
                        value={watch('dateOfBirth')}
                        onChange={(val) => setValue('dateOfBirth', val, { shouldValidate: true })}
                        max={todayIso}
                        placeholder="Select date of birth..."
                        error={errors.dateOfBirth?.message}
                      />
                    </div>`;

if (content.includes(oldPetDob)) {
  content = content.replace(oldPetDob, newPetDob);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated DatePicker in PetList.jsx');
} else {
  console.error('Failed to match oldPetDob in PetList.jsx');
}
