import api from './api';

export const adminApi = {
  getStats: () => api.get('/admin/dashboard/stats'),
  
  getUsers: () => api.get('/admin/users'),
  toggleUserStatus: (id, enabled) => api.put(`/admin/users/${id}/status?enabled=${enabled}`),
  
  getPendingVerifications: (entityType) => api.get(`/admin/verifications?entityType=${entityType}`),
  approveVerification: (id) => api.post(`/admin/verifications/${id}/approve`),
  rejectVerification: (id, reason) => api.post(`/admin/verifications/${id}/reject?reason=${encodeURIComponent(reason)}`),
  
  getPendingProducts: (page = 0, size = 10) => api.get(`/admin/products/pending?page=${page}&size=${size}`),
  approveProduct: (id) => api.put(`/admin/products/${id}/approve`),
  rejectProduct: (id, reason) => api.put(`/admin/products/${id}/reject?reason=${encodeURIComponent(reason)}`),
  
  getPendingAdoptionPets: () => api.get('/admin/adoptions/pending'),
  approveAdoptionPet: (id) => api.put(`/admin/adoptions/pets/${id}/approve`),
  rejectAdoptionPet: (id, reason) => api.put(`/admin/adoptions/pets/${id}/reject?reason=${encodeURIComponent(reason)}`),

  // Settings
  changePassword: (data) => api.put('/users/me/password', data)
};
