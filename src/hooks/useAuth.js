// src/hooks/useAuth.js
import { useDispatch, useSelector } from 'react-redux';
import { logout as clearAuth, setAuth } from '@/store/authSlice';
import { logoutUser } from '@/services/api';

const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const token = auth.token || localStorage.getItem('token');
  const role = auth.role || auth.user?.role || localStorage.getItem('userRole');
  const user = auth.user;
  const isAuthenticated = Boolean(user || token);

  const login = (newToken, newRole) => {
    dispatch(
      setAuth({
        token: newToken || 'cookie-session',
        user: { role: newRole },
      })
    );
  };

  const logout = () => {
    logoutUser().catch(() => {}).finally(() => {
      dispatch(clearAuth());
      window.location.href = '/login';
    });
  };

  return { token, role, user, isAuthenticated, login, logout };
};

export default useAuth;
