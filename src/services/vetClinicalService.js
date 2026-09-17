import api from './api';

export const vetClinicalService = {
  // --- Dashboard & Analytics ---
  getDashboardStats: async () => {
    const res = await api.get('/vets/dashboard/stats');
    return res.data;
  },

  // --- Patients & Clinical 360 Records ---
  getAuthorizedPatients: async () => {
    const res = await api.get('/vets/patients');
    return res.data;
  },

  getPatientDetail: async (petId) => {
    const res = await api.get(`/vets/patients/${petId}`);
    return res.data;
  },

  getPatientByPetCode: async (petCode) => {
    const res = await api.get(`/vets/patients/by-code/${petCode}`);
    return res.data;
  },

  addMedicalRecord: async (petId, recordData) => {
    const res = await api.post(`/vets/patients/${petId}/medical-records`, recordData);
    return res.data;
  },

  addMedicalRecordByPetCode: async (petCode, recordData) => {
    const res = await api.post(`/vets/patients/by-code/${petCode}/medical-records`, recordData);
    return res.data;
  },

  addVaccination: async (petId, vaccineData) => {
    const res = await api.post(`/vets/patients/${petId}/vaccinations`, vaccineData);
    return res.data;
  },

  uploadDocument: async (petId, documentData) => {
    const res = await api.post(`/vets/patients/${petId}/documents`, documentData);
    return res.data;
  },

  getFollowUps: async () => {
    const res = await api.get('/vets/follow-ups');
    return res.data;
  },

  // --- Appointment Lifecycle Transitions ---
  acceptAppointment: async (id) => {
    const res = await api.post(`/vets/appointments/${id}/accept`);
    return res.data;
  },

  rejectAppointment: async (id, reason) => {
    const res = await api.post(`/vets/appointments/${id}/reject`, { reason });
    return res.data;
  },

  rescheduleAppointment: async (id, newDate, newTime, reason) => {
    const res = await api.post(`/vets/appointments/${id}/reschedule`, {
      newDate,
      newTime,
      reason,
    });
    return res.data;
  },

  startConsultation: async (id) => {
    const res = await api.post(`/vets/appointments/${id}/consult`);
    return res.data;
  },

  completeConsultation: async (id, consultationData) => {
    const res = await api.post(`/vets/appointments/${id}/complete-consultation`, consultationData);
    return res.data;
  },

  // --- Veterinarian Profile & Verification ---
  getVetProfile: async () => {
    const res = await api.get('/vets/profile');
    return res.data;
  },

  updateVetProfile: async (data) => {
    const res = await api.put('/vets/profile', data);
    return res.data;
  },

  updateVetSchedule: async (data) => {
    const res = await api.put('/vets/profile/schedule', data);
    return res.data;
  },

  uploadVerificationDocument: async (documentType, documentBase64) => {
    const res = await api.post('/vets/profile/documents', { documentType, documentBase64 });
    return res.data;
  },

  deleteVerificationDocument: async (docId) => {
    const res = await api.delete(`/vets/profile/documents/${docId}`);
    return res.data;
  },

  submitVerification: async () => {
    const res = await api.post('/vets/profile/submit');
    return res.data;
  },

  // --- Pet Owner Clinical Access ---
  getPetClinicalHistory: async (petId) => {
    const res = await api.get(`/pets/${petId}/clinical-history`);
    return res.data;
  },

  getPetMedicalRecords: async (petId) => {
    const res = await api.get(`/pets/${petId}/medical-records`);
    return res.data;
  },

  getPetVaccinations: async (petId) => {
    const res = await api.get(`/pets/${petId}/vaccinations`);
    return res.data;
  },

  getPetDocuments: async (petId) => {
    const res = await api.get(`/pets/${petId}/documents`);
    return res.data;
  },

  getPetByCode: async (petCode) => {
    const res = await api.get(`/pets/code/${petCode}`);
    return res.data;
  },

  transferPetOwnership: async (petId, newOwnerEmail) => {
    const res = await api.post(`/pets/${petId}/transfer`, { newOwnerEmail });
    return res.data;
  },
};

export default vetClinicalService;
