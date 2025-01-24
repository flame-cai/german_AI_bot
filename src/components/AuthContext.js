// src/components/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    // Whenever token changes, update localStorage
    if (token) {
      // console.log('Setting token in localStorage:', token); // Debugging line
      localStorage.setItem('token', token);
    } else {
      // console.log('Removing token from localStorage'); // Debugging line
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    // console.log('AuthProvider mounted, current token:', token); // Debugging line
  }, []);

  const value = { token, setToken };

  useEffect(() => {
    // console.log('AuthContext value changed:', value); // Debugging line
  }, [value]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};