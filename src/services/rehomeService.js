import api from './api';

export const rehomeService = {
  createListing: (data) => api.post('/rehome/listings', data),
  getActiveListings: (params) => api.get('/rehome/listings', { params }),
  getListingDetails: (id) => api.get(`/rehome/listings/${id}`),
  getMyListings: () => api.get('/rehome/listings/my'),
  cancelListing: (id) => api.delete(`/rehome/listings/${id}`),
  applyForPet: (listingId, data) => api.post(`/rehome/listings/${listingId}/apply`, data),
  getListingApplications: (listingId) => api.get(`/rehome/listings/${listingId}/applications`),
  getMyApplications: () => api.get('/rehome/applications/my'),
  cancelApplication: (appId) => api.post(`/rehome/applications/${appId}/cancel`),
  rejectApplication: (appId) => api.post(`/rehome/applications/${appId}/reject`),
  acceptApplication: (appId) => api.post(`/rehome/applications/${appId}/accept`),
};

export default rehomeService;
