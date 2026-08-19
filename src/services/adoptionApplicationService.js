import api from './api';

const adoptionApplicationService = {
  getMyApplications: () => api.get('/adopters/me/applications'),
  getMyApplication: (animalId) => api.get(`/adopters/me/applications/${animalId}`),
  saveDraft: (animalId, data) => api.put(`/adopters/me/applications/${animalId}`, data),
  submit: (animalId) => api.post(`/adopters/me/applications/${animalId}/submit`),
  withdraw: (animalId) => api.post(`/adopters/me/applications/${animalId}/withdraw`),
};

export default adoptionApplicationService;
