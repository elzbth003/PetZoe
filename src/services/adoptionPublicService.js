import api from './api';

const adoptionPublicService = {
  searchAnimals: (params) => api.get('/adoption/animals', { params }),
  getDistinctSpecies: () => api.get('/adoption/animals/species'),
  getAnimalDetail: (id) => api.get(`/adoption/animals/${id}`),
};

export default adoptionPublicService;
