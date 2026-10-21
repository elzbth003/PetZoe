const fs = require('fs');
const path = require('path');

const norm = (s) => s.replace(/\r\n/g, '\n');

// 1. AppointmentList.jsx
{
  const filePath = path.resolve('src/components/dashboard/AppointmentList.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  if (!content.includes("import DatePicker from '../ui/DatePicker';")) {
    content = content.replace(
      "import SelectDropdown from '../ui/SelectDropdown';",
      "import SelectDropdown from '../ui/SelectDropdown';\nimport DatePicker from '../ui/DatePicker';"
    );
  }

  const oldApptDate = `            {/* Appointment Date */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Appointment Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={\`w-full px-3 py-2.5 rounded-xl bg-slate-50 border \${errors.appointmentDate ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none\`}
                {...register('appointmentDate')}
              />
              {errors.appointmentDate && (
                <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.appointmentDate.message}</p>
              )}
            </div>`;

  const newApptDate = `            {/* Appointment Date */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Appointment Date</label>
              <DatePicker
                value={watch('appointmentDate')}
                onChange={(val) => setValue('appointmentDate', val, { shouldValidate: true })}
                min={new Date().toISOString().split('T')[0]}
                placeholder="Choose appointment date..."
                error={errors.appointmentDate?.message}
              />
            </div>`;

  if (content.includes(oldApptDate)) {
    content = content.replace(oldApptDate, newApptDate);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('1. Updated DatePicker in AppointmentList.jsx');
  } else {
    console.error('1. Could not match oldApptDate in AppointmentList.jsx');
  }
}

// 2. PetList.jsx
{
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
                      <label htmlFor="pet-dob" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Date of Birth</label>
                      <input
                        id="pet-dob"
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        className={\`w-full px-3 py-2.5 rounded-xl bg-slate-50 border \${errors.dateOfBirth ? 'border-rose-400' : 'border-slate-200'} text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100\`}
                        {...register('dateOfBirth')}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{errors.dateOfBirth.message}</p>
                      )}
                    </div>`;

  const newPetDob = `                    {/* Date of Birth */}
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="pet-dob" className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Date of Birth</label>
                      <DatePicker
                        id="pet-dob"
                        value={watch('dateOfBirth')}
                        onChange={(val) => setValue('dateOfBirth', val, { shouldValidate: true })}
                        max={new Date().toISOString().split('T')[0]}
                        placeholder="Select date of birth..."
                        error={errors.dateOfBirth?.message}
                      />
                    </div>`;

  if (content.includes(oldPetDob)) {
    content = content.replace(oldPetDob, newPetDob);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('2. Updated DatePicker in PetList.jsx');
  } else {
    console.error('2. Could not match oldPetDob in PetList.jsx');
  }
}

// 3. ConsultationModal.jsx
{
  const filePath = path.resolve('src/components/dashboard/ConsultationModal.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  if (!content.includes("import DatePicker from '../ui/DatePicker';")) {
    content = content.replace(
      "import SelectDropdown from '../ui/SelectDropdown';",
      "import SelectDropdown from '../ui/SelectDropdown';\nimport DatePicker from '../ui/DatePicker';"
    );
  }

  const oldConsultDate = `                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>`;

  const newConsultDate = `                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Follow-up Date</label>
                  <DatePicker
                    value={formData.followUpDate}
                    onChange={(val) => setFormData({ ...formData, followUpDate: val })}
                    min={new Date().toISOString().split('T')[0]}
                    placeholder="Select follow-up date..."
                  />
                </div>`;

  if (content.includes(oldConsultDate)) {
    content = content.replace(oldConsultDate, newConsultDate);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('3. Updated DatePicker in ConsultationModal.jsx');
  } else {
    console.error('3. Could not match oldConsultDate in ConsultationModal.jsx');
  }
}

// 4. VetAppointmentsPanel.jsx
{
  const filePath = path.resolve('src/components/dashboard/VetAppointmentsPanel.jsx');
  let content = norm(fs.readFileSync(filePath, 'utf8'));

  if (!content.includes("import DatePicker from '../ui/DatePicker';")) {
    content = content.replace(
      "import { useToast } from '../../hooks/useToast';",
      "import { useToast } from '../../hooks/useToast';\nimport DatePicker from '../ui/DatePicker';"
    );
  }

  const oldReschedDate = `              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleData.newDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>`;

  const newReschedDate = `              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Date</label>
                <DatePicker
                  value={rescheduleData.newDate}
                  onChange={(val) => setRescheduleData({ ...rescheduleData, newDate: val })}
                  min={new Date().toISOString().split('T')[0]}
                  placeholder="Select new appointment date..."
                />
              </div>`;

  if (content.includes(oldReschedDate)) {
    content = content.replace(oldReschedDate, newReschedDate);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('4. Updated DatePicker in VetAppointmentsPanel.jsx');
  } else {
    console.error('4. Could not match oldReschedDate in VetAppointmentsPanel.jsx');
  }
}
