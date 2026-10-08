import api from './api';

/**
 * Marketplace API service.
 * Handles all HTTP requests for products, cart, wishlist, orders, categories, and reviews.
 */
const marketplaceService = {

  // === Categories ===
  getCategories: () => api.get('/marketplace/categories'),

  // === Products ===
  getProducts: (page = 0, size = 12, sortBy = 'createdAt') =>
    api.get(`/marketplace/products?page=${page}&size=${size}&sortBy=${sortBy}`),

  getProductById: (id) => api.get(`/marketplace/products/${id}`),

  searchProducts: (query, page = 0, size = 12) =>
    api.get(`/marketplace/products/search?query=${query}&page=${page}&size=${size}`),

  getProductsByCategory: (categoryId, page = 0, size = 12) =>
    api.get(`/marketplace/products/category/${categoryId}?page=${page}&size=${size}`),

  getFeaturedProducts: () => api.get('/marketplace/products/featured'),

  getNewArrivals: () => api.get('/marketplace/products/new-arrivals'),

  // Seller endpoints
  createProduct: (data) => api.post('/marketplace/products', data),
  updateProduct: (id, data) => api.put(`/marketplace/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/marketplace/products/${id}`),
  getMyProducts: () => api.get('/marketplace/products/my-products'),

  // Admin endpoints
  getUnapprovedProducts: () => api.get('/marketplace/products/unapproved'),
  approveProduct: (id) => api.put(`/marketplace/products/${id}/approve`),
  toggleFeatured: (id) => api.put(`/marketplace/products/${id}/featured`),

  // === Cart ===
  getCart: () => api.get('/marketplace/cart'),
  addToCart: (productId, quantity = 1) => api.post('/marketplace/cart', { productId, quantity }),
  updateCartQuantity: (id, quantity) => api.put(`/marketplace/cart/${id}?quantity=${quantity}`),
  removeFromCart: (id) => api.delete(`/marketplace/cart/${id}`),
  clearCart: () => api.delete('/marketplace/cart'),

  // === Wishlist ===
  getWishlist: () => api.get('/marketplace/wishlist'),
  addToWishlist: (productId) => api.post('/marketplace/wishlist', { productId }),
  removeFromWishlist: (id) => api.delete(`/marketplace/wishlist/${id}`),
  moveToCart: (id) => api.post(`/marketplace/wishlist/${id}/move-to-cart`),

  // === Orders ===
  placeOrder: () => api.post('/marketplace/orders'),
  getOrders: () => api.get('/marketplace/orders'),
  getOrderById: (id) => api.get(`/marketplace/orders/${id}`),
  getAllOrders: () => api.get('/marketplace/orders/all'),
  updateOrderStatus: (id, status) => api.put(`/marketplace/orders/${id}/status`, { status }),

  // === Payments (Razorpay) ===
  createPayment: (orderId = null) =>
    api.post('/marketplace/payments/create', orderId ? { orderId } : {}),
  verifyPayment: (data) =>
    api.post('/marketplace/payments/verify', data),
  cancelPayment: (orderId, reason) =>
    api.post('/marketplace/payments/cancel', { orderId, reason }),
  getOrderPayments: (orderId) =>
    api.get(`/marketplace/payments/order/${orderId}`),
  getMyPayments: () =>
    api.get('/marketplace/payments/my-payments'),
  getAllPaymentsAdmin: () =>
    api.get('/marketplace/payments/admin/all'),

  // === Reviews ===
  getProductReviews: (productId) => api.get(`/marketplace/products/${productId}/reviews`),
  addReview: (productId, data) => api.post(`/marketplace/products/${productId}/reviews`, data),
};

export default marketplaceService;
