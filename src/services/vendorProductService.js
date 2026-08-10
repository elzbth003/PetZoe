import api from './api'; // assuming standard axios instance

export const vendorProductService = {
  getVendorProducts: async (page = 0, size = 10, sortBy = 'createdAt') => {
    const response = await api.get(`/vendor/products?page=${page}&size=${size}&sortBy=${sortBy}`);
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/vendor/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/vendor/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/vendor/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/vendor/products/${id}`);
    return response.data;
  },

  submitForReview: async (id) => {
    const response = await api.post(`/vendor/products/${id}/submit`);
    return response.data;
  },

  updateStock: async (id, stock) => {
    const response = await api.put(`/vendor/products/${id}/stock?stock=${stock}`);
    return response.data;
  }
};
