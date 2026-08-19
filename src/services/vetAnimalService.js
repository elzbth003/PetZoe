import api from './api';

const vetAnimalService = {
  getWorklist: () => api.get('/vets/animals'),
  getAnimal: (id) => api.get(`/vets/animals/${id}`),
  addMedicalRecord: (id, data) => api.post(`/vets/animals/${id}/medical-records`, data),
  addVaccination: (id, data) => api.post(`/vets/animals/${id}/vaccinations`, data),
  addPreventiveCare: (id, data) => api.post(`/vets/animals/${id}/preventive-care`, data),
  uploadDocument: (id, documentType, documentBase64, notes) =>
    api.post(`/vets/animals/${id}/documents`, { documentType, documentBase64, notes }),
  reviewDocument: (documentId, status, notes) =>
    api.put(`/vets/animals/documents/${documentId}/review`, { status, notes }),
  updateStatus: (id, status, notes) => api.put(`/vets/animals/${id}/status`, { status, notes }),
};

export default vetAnimalService;
