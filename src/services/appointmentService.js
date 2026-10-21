import api from './api';

export const appointmentService = {
  getAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  bookAppointment: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  initiateAppointmentPayment: async (data) => {
    const response = await api.post('/appointments/initiate-payment', data);
    return response.data;
  },

  verifyAppointmentPayment: async (data) => {
    const response = await api.post('/appointments/verify-payment', data);
    return response.data;
  },

  getAvailableSlots: async (veterinarianId, date) => {
    const response = await api.get('/appointments/available-slots', {
      params: { veterinarianId, date }
    });
    return response.data;
  },

  cancelAppointment: async (id) => {
    const response = await api.put(`/appointments/${id}/cancel`);
    return response.data;
  },

  getVets: async () => {
    const response = await api.get('/vets');
    return response.data;
  },

  getVetById: async (id) => {
    const response = await api.get(`/vets/${id}`);
    return response.data;
  },

  getVetAppointments: async () => {
    const response = await api.get('/appointments/vet');
    return response.data;
  },

  updateAppointmentStatus: async (id, data) => {
    const response = await api.put(`/appointments/${id}/status`, data);
    return response.data;
  },
};

export default appointmentService;
