import axiosInstance from './axiosInstance';

// Matches src/routes/mentor.routes.js exactly. All routes require
// protect + allow('mentor') on the backend — scoped server-side to
// the mentor's own assigned students.

// ---- Students (assigned only) ----
export const listMyStudents = () => axiosInstance.get('/mentor/students');
export const getMyStudentById = (id) => axiosInstance.get(`/mentor/students/${id}`);

// ---- Counseling sessions ----
export const createSession = (payload) => axiosInstance.post('/mentor/sessions', payload);
// query: { studentId? }
export const listSessions = (params = {}) => axiosInstance.get('/mentor/sessions', { params });
export const getSessionHistory = (studentId) => axiosInstance.get(`/mentor/sessions/${studentId}`);
export const updateSession = (id, payload) => axiosInstance.patch(`/mentor/sessions/${id}`, payload);

// ---- Attendance ----
export const markAttendance = (payload) => axiosInstance.post('/mentor/attendance', payload);
export const getAttendance = (studentId) => axiosInstance.get(`/mentor/attendance/${studentId}`);

// ---- Messaging ----
export const sendMessageToStudent = (studentId, content) =>
  axiosInstance.post('/mentor/messages', { studentId, content });
export const getConversationWithStudent = (studentId) =>
  axiosInstance.get(`/mentor/messages/${studentId}`);

// ---- Concerns ----
// query: { status? }
export const listConcerns = (params = {}) => axiosInstance.get('/mentor/concerns', { params });
export const respondToConcern = (id, payload) => axiosInstance.patch(`/mentor/concerns/${id}`, payload);

// ---- Weekly reports (manually triggered — no cron) ----
export const generateWeeklyReport = (payload) => axiosInstance.post('/mentor/reports/weekly', payload);
export const listMyReports = () => axiosInstance.get('/mentor/reports');
