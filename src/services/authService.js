import api from './api';

export const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      role: userData.role,
    });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data && response.data.token) {
      sessionStorage.setItem('petzoe_token', response.data.token);
      const user = {
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        profileImage: response.data.profileImage || null,
      };
      sessionStorage.setItem('petzoe_user', JSON.stringify(user));
      return user;
    }
    throw new Error("Authentication failed. No token received.");
  },

  // Google OAuth login
  googleLogin: async (credential) => {
    const response = await api.post('/auth/google', { token: credential });
    if (response.data && response.data.token) {
      sessionStorage.setItem('petzoe_token', response.data.token);
      const user = {
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        profileImage: response.data.profileImage || null,
      };
      sessionStorage.setItem('petzoe_user', JSON.stringify(user));
      return user;
    }
    throw new Error("Google authentication failed. No token received.");
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Logout
  logout: () => {
    sessionStorage.removeItem('petzoe_token');
    sessionStorage.removeItem('petzoe_user');
  },

  // Get current user session
  getCurrentUser: () => {
    const userJson = sessionStorage.getItem('petzoe_user');
    return userJson ? JSON.parse(userJson) : null;
  }
};
