import api from './api';

const adminShelterService = {
  getShelters: (status) => api.get('/admin/shelters', { params: status ? { status } : {} }),
  getShelterDetail: (id) => api.get(`/admin/shelters/${id}`),
  approve: (id) => api.put(`/admin/shelters/${id}/approve`),
  reject: (id, reason) => api.put(`/admin/shelters/${id}/reject`, null, { params: { reason } }),
  requestChanges: (id, reason) => api.put(`/admin/shelters/${id}/request-changes`, null, { params: { reason } }),
  suspend: (id, reason) => api.put(`/admin/shelters/${id}/suspend`, null, { params: { reason } }),
};

export default adminShelterService;
