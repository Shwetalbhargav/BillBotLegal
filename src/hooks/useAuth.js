// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('userRole'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const login = (newToken, newRole) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userRole', newRole);
    setToken(newToken);
    setRole(newRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return { token, role, isAuthenticated, login, logout };
};

export default useAuth;
