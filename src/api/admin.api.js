import axiosInstance from './axiosInstance';

// Matches src/routes/admin.routes.js exactly. All routes require
// protect + allow('admin') on the backend.

// ---- Mentors ----
export const createMentor = (payload) => axiosInstance.post('/admin/mentors', payload);
export const listMentors = () => axiosInstance.get('/admin/mentors');
export const updateMentor = (id, payload) => axiosInstance.patch(`/admin/mentors/${id}`, payload);
export const deactivateMentor = (id) => axiosInstance.delete(`/admin/mentors/${id}`);

// ---- Students ----
export const createStudent = (payload) => axiosInstance.post('/admin/students', payload);
export const listStudents = () => axiosInstance.get('/admin/students');
export const updateStudent = (id, payload) => axiosInstance.patch(`/admin/students/${id}`, payload);
export const deactivateStudent = (id) => axiosInstance.delete(`/admin/students/${id}`);

// ---- Assignments ----
export const assignStudent = (mentorId, studentId) =>
  axiosInstance.post('/admin/assignments', { mentorId, studentId });
export const listAssignments = () => axiosInstance.get('/admin/assignments');

// ---- System-wide visibility ----
// query: { mentorId?, studentId?, topic? }
export const listAllSessions = (params = {}) => axiosInstance.get('/admin/sessions', { params });
export const listAllReports = () => axiosInstance.get('/admin/reports');
