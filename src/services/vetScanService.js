import api from './api';

export const vetScanService = {
  analyzeScan: async (formData) => {
    const res = await api.post('/vetscan/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getScanById: async (id) => {
    const res = await api.get(`/vetscan/${id}`);
    return res.data;
  },

  getScansByPet: async (petId) => {
    const res = await api.get(`/vetscan/pet/${petId}`);
    return res.data;
  },

  compareScans: async (currentScanId, previousScanId) => {
    const res = await api.post(`/vetscan/${currentScanId}/compare?previousScanId=${previousScanId}`);
    return res.data;
  },

  submitVeterinarianReview: async (scanId, reviewData) => {
    const res = await api.post(`/vetscan/${scanId}/veterinarian-review`, reviewData);
    return res.data;
  },
};

export default vetScanService;
