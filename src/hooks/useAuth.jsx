import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionUser = authService.getCurrentUser();
    setUser(sessionUser);
    setLoading(false);
  }, []);

  // Listen for 401 events from the API interceptor
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(null);
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const login = async (email, password) => {
    const sessionUser = await authService.login(email, password);
    setUser(sessionUser);
    return sessionUser;
  };

  const googleLogin = async (credential) => {
    const sessionUser = await authService.googleLogin(credential);
    setUser(sessionUser);
    return sessionUser;
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  // Heartbeat loop to keep active online status in real-time
  useEffect(() => {
    if (!user) return;
    const sendHeartbeat = () => {
      api.post('/users/heartbeat').catch(() => {});
    };
    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 25000);
    return () => clearInterval(heartbeatInterval);
  }, [user]);

  const logout = () => {
    api.post('/users/offline').catch(() => {});
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
