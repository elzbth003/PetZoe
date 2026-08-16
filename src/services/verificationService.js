import api from './api';

const verificationService = {
  getMyVerification: () => api.get('/verifications/me'),
  submitVerification: (documentBase64, additionalDocumentsBase64) =>
    api.post('/verifications/me', { documentBase64, additionalDocumentsBase64 }),
};

export default verificationService;
