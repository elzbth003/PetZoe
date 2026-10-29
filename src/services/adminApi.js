import api from './api';

export const adminApi = {
  getStats: () => api.get('/admin/dashboard/stats'),
  
  getUsers: () => api.get('/admin/users'),
  getUserSummary: () => api.get('/admin/users/summary'),
  toggleUserStatus: (id, enabled) => api.patch(`/admin/users/${id}/status?enabled=${enabled}`),
  
  getPendingVerifications: (entityType) => api.get(`/admin/verifications?entityType=${entityType}`),
  approveVerification: (id) => api.post(`/admin/verifications/${id}/approve`),
  rejectVerification: (id, reason) => api.post(`/admin/verifications/${id}/reject?reason=${encodeURIComponent(reason)}`),
  
  getPendingProducts: (page = 0, size = 10) => api.get(`/admin/products/pending?page=${page}&size=${size}`),
  approveProduct: (id) => api.put(`/admin/products/${id}/approve`),
  rejectProduct: (id, reason) => api.put(`/admin/products/${id}/reject?reason=${encodeURIComponent(reason)}`),
  
  // Veterinarians
  getVeterinarians: () => api.get('/admin/veterinarians'),
  getVeterinarianDetail: (id) => api.get(`/admin/veterinarians/${id}`),
  reviewVeterinarian: (id) => api.put(`/admin/veterinarians/${id}/review`),
  approveVeterinarianProfile: (id) => api.put(`/admin/veterinarians/${id}/approve`),
  rejectVeterinarianProfile: (id, reason) => api.put(`/admin/veterinarians/${id}/reject`, { reason }),
  requestResubmissionVeterinarian: (id, reason) => api.put(`/admin/veterinarians/${id}/request-resubmission`, { reason }),
  reviewVeterinarianDocument: (docId, status, reason) => api.put(`/admin/veterinarians/documents/${docId}/review`, null, { params: { status, reason } }),
  
  // Dashboard Activity & Analytics
  getRecentActivity: () => api.get('/admin/dashboard/activity'),
  getAnalytics: (days = 30) => api.get(`/admin/dashboard/analytics?days=${days}`),
  getSystemHealth: () => api.get('/admin/dashboard/system-health'),
  getRecentAppointments: () => api.get('/admin/dashboard/appointments/recent'),
  getRecentOrders: () => api.get('/admin/dashboard/orders/recent'),

  // Settings
  changePassword: (data) => api.put('/users/me/password', data)
};
