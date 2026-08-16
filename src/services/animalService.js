import api from './api';

const animalService = {
  getMyAnimals: () => api.get('/shelters/me/animals'),
  getAnimal: (id) => api.get(`/shelters/me/animals/${id}`),
  createIntake: (data) => api.post('/shelters/me/animals', data),
  recordInitialAssessment: (id, data) => api.put(`/shelters/me/animals/${id}/initial-assessment`, data),
  uploadDocument: (id, documentType, documentBase64, notes) =>
    api.post(`/shelters/me/animals/${id}/documents`, { documentType, documentBase64, notes }),
};

export default animalService;
