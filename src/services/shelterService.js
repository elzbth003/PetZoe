import api from './api';

const shelterService = {
  getMyShelter: () => api.get('/shelters/me'),
  updateMyShelter: (data) => api.put('/shelters/me', data),
  addDocument: (documentType, documentBase64) =>
    api.post('/shelters/me/documents', { documentType, documentBase64 }),
  removeDocument: (id) => api.delete(`/shelters/me/documents/${id}`),
  submitForVerification: () => api.post('/shelters/me/submit'),
};

export default shelterService;
