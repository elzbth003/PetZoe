import api from './api';

const adopterProfileService = {
  getMyProfile: () => api.get('/adopters/me/profile'),
  updateMyProfile: (data) => api.put('/adopters/me/profile', data),
};

export default adopterProfileService;
