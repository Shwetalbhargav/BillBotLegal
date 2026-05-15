import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AppRoutes from '@/routes/AppRoutes';
import { bootstrapSessionThunk, logout } from '@/store/authSlice';


const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const hasSessionMarker =
      localStorage.getItem('token') === 'cookie-session' ||
      Boolean(localStorage.getItem('userRole'));

    if (!hasSessionMarker) return;

    dispatch(bootstrapSessionThunk())
      .unwrap()
      .catch(() => {
        dispatch(logout());
      });
  }, [dispatch]);

  return <AppRoutes />;
};

export default App;
