import axiosInstance from './axiosInstance';

// Matches src/routes/auth.routes.js exactly:
//   POST /auth/login        (public)
//   POST /auth/logout       (protected)
//   POST /auth/change-password (protected)
//   GET  /auth/me           (protected)

export const login = (email, password) =>
  axiosInstance.post('/auth/login', { email, password });

export const logout = () => axiosInstance.post('/auth/logout');

export const changePassword = (currentPassword, newPassword) =>
  axiosInstance.post('/auth/change-password', { currentPassword, newPassword });

export const getMe = () => axiosInstance.get('/auth/me');
