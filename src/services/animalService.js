import api from './api';

const animalService = {
  getMyAnimals: () => api.get('/shelters/me/animals'),
  getAnimal: (id) => api.get(`/shelters/me/animals/${id}`),
  createIntake: (data) => api.post('/shelters/me/animals', data),
  recordInitialAssessment: (id, data) => api.put(`/shelters/me/animals/${id}/initial-assessment`, data),
  uploadDocument: (id, documentType, documentBase64, notes) =>
    api.post(`/shelters/me/animals/${id}/documents`, { documentType, documentBase64, notes }),
  updateStatus: (id, status, notes) => api.put(`/shelters/me/animals/${id}/status`, { status, notes }),
  updateListing: (id, data) => api.put(`/shelters/me/animals/${id}/listing`, data),
  submitListing: (id) => api.post(`/shelters/me/animals/${id}/listing/submit`),
};

export default animalService;
