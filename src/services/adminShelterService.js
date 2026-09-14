import api from './api';

const adminShelterService = {
  getShelters: (status) => api.get('/admin/shelters', { params: status ? { status } : {} }),
  getShelterDetail: (id) => api.get(`/admin/shelters/${id}`),
  approve: (id) => api.put(`/admin/shelters/${id}/approve`),
  reject: (id, reason) => api.put(`/admin/shelters/${id}/reject`, { reason }, { params: { reason } }),
  requestChanges: (id, reason) => api.put(`/admin/shelters/${id}/request-changes`, { reason }, { params: { reason } }),
  suspend: (id, reason) => api.put(`/admin/shelters/${id}/suspend`, { reason }, { params: { reason } }),
};

export default adminShelterService;
