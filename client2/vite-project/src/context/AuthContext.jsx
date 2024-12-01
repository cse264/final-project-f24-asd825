import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/login', { email, password });
      const token = response.data.token;
      localStorage.setItem('token', token);

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const userResponse = await axios.get('/protected', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userResponse.data.user);

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { exp } = jwtDecode(token);
        if (exp * 1000 > Date.now()) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/protected');
          setUser(response.data.user);
        } else {
          logout(); // Token expired
        }
      } catch (error) {
        console.error('Authorization failed:', error);
        logout();
      }
    }
    setAuthLoading(false);
  };

  // Initial authentication check on app load
  useEffect(() => {
    checkAuth();
  }, []);

  // Monitor token expiration and log out the user automatically
  useEffect(() => {
    if (user) {
      const { exp } = jwtDecode(localStorage.getItem('token'));
      const timeout = exp * 1000 - Date.now();

      const timer = setTimeout(() => {
        logout();
        alert('Session expired. Please log in again.');
      }, timeout);

      return () => clearTimeout(timer); // Cleanup on logout or token change
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
