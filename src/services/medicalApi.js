import api from './api';

export const chatApi = {
  sendMessage: (appointmentId, content) => api.post(`/chat/appointment/${appointmentId}`, { content }),
  getMessages: (appointmentId) => api.get(`/chat/appointment/${appointmentId}`),
  markAsRead: (appointmentId) => api.put(`/chat/appointment/${appointmentId}/read`),
  getPartnerStatus: (appointmentId) => api.get(`/chat/appointment/${appointmentId}/partner-status`)
};

export const prescriptionApi = {
  createPrescription: (data) => api.post('/prescriptions', data),
  getByPet: (petId) => api.get(`/prescriptions/pet/${petId}`),
  getByAppointment: (appointmentId) => api.get(`/prescriptions/appointment/${appointmentId}`)
};
