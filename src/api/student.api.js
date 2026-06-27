import axiosInstance from './axiosInstance';

// Matches src/routes/student.routes.js exactly. All routes require
// protect + allow('student') on the backend.

export const getMyMentor = () => axiosInstance.get('/student/mentor');

export const getMySessions = () => axiosInstance.get('/student/sessions');
export const getMyAttendance = () => axiosInstance.get('/student/attendance');

export const submitConcern = (payload) => axiosInstance.post('/student/concerns', payload);
export const getMyConcerns = () => axiosInstance.get('/student/concerns');

export const getConversationWithMentor = () => axiosInstance.get('/student/messages');
export const sendMessageToMentor = (content) => axiosInstance.post('/student/messages', { content });

export const listMyNotifications = () => axiosInstance.get('/student/notifications');
export const markNotificationRead = (id) =>
  axiosInstance.patch(`/student/notifications/${id}/read`);
