import api from './api';

const shelterApplicationService = {
  getApplications: () => api.get('/shelters/me/applications'),
  getApplicationDetail: (id) => api.get(`/shelters/me/applications/${id}`),
};

export default shelterApplicationService;
