import api from './api';

const adminAdoptionListingService = {
  getListings: (status) => api.get('/admin/adoption-listings', { params: status ? { status } : {} }),
  getListingDetail: (id) => api.get(`/admin/adoption-listings/${id}`),
  approve: (id) => api.put(`/admin/adoption-listings/${id}/approve`),
  reject: (id, reason) => api.put(`/admin/adoption-listings/${id}/reject`, null, { params: { reason } }),
  requestChanges: (id, reason) => api.put(`/admin/adoption-listings/${id}/request-changes`, null, { params: { reason } }),
};

export default adminAdoptionListingService;
