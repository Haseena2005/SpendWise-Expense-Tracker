import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('spendwise_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (!parsed.currency) parsed.currency = 'INR';
        return parsed;
      } catch {}
    }
    return null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('spendwise_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('spendwise_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            const userData = res.data.data.user;
            if (!userData.currency) userData.currency = 'INR';
            setUser(userData);
            localStorage.setItem('spendwise_user', JSON.stringify(userData));
            localStorage.setItem('spendwise_currency', userData.currency);
          }
        } catch (err) {
          console.error('Session validation error:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { user: userData, token: jwtToken } = res.data.data;
      if (!userData.currency) userData.currency = 'INR';
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('spendwise_token', jwtToken);
      localStorage.setItem('spendwise_user', JSON.stringify(userData));
      localStorage.setItem('spendwise_currency', userData.currency);
      return userData;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.success) {
      const { user: userData, token: jwtToken } = res.data.data;
      if (!userData.currency) userData.currency = 'INR';
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('spendwise_token', jwtToken);
      localStorage.setItem('spendwise_user', JSON.stringify(userData));
      localStorage.setItem('spendwise_currency', userData.currency);
      return userData;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch {
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('spendwise_token');
      localStorage.removeItem('spendwise_user');
    }
  };

  const updateUser = (userData) => {
    const updated = { ...user, ...userData };
    setUser(updated);
    localStorage.setItem('spendwise_user', JSON.stringify(updated));
    if (userData.currency) {
      localStorage.setItem('spendwise_currency', userData.currency);
    }
  };

  const updateCurrency = async (newCurrency) => {
    const res = await api.put('/profile/currency', { currency: newCurrency });
    if (res.data?.success) {
      updateUser({ currency: newCurrency });
      return res.data.data;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        const userData = res.data.data.user;
        setUser(userData);
        localStorage.setItem('spendwise_user', JSON.stringify(userData));
      }
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        updateCurrency,
        refreshUser,
        currency: user?.currency || 'INR',
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
