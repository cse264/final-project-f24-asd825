// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/login', { email, password });
      const token = response.data.token;
      localStorage.setItem('token', token);

      // Set the Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set the user state by making a request to /protected
      const userResponse = await axios.get('/protected', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userResponse.data.user);

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.get('/logout');
      setUser(null);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    console.log(token)
    if (token) {
      try {
        const response = await axios.get('/protected', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
      } catch (error) {
        console.error('Authorization failed:', error);
        setUser(null);
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
