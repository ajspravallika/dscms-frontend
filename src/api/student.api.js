import axiosInstance from "./axiosInstance";

// Dashboard
export const getDashboard = () => axiosInstance.get("/student/dashboard");

// Mentor
export const getMyMentor = () => axiosInstance.get("/student/mentor");

// Counseling history
export const getCounselingHistory = () => axiosInstance.get("/student/counseling-history");
export const getMySessions = () => axiosInstance.get("/student/counseling-history"); // alias

// Concerns
export const submitConcern = (data) => axiosInstance.post("/student/concerns", data);
export const getMyConcerns = () => axiosInstance.get("/student/concerns");

// Messages
export const getConversation = () => axiosInstance.get("/student/messages");
export const getConversationWithMentor = () => axiosInstance.get("/student/messages"); // alias
export const sendMessage = (content) => axiosInstance.post("/student/messages", { content });
export const sendMessageToMentor = (content) => axiosInstance.post("/student/messages", { content }); // alias

// Notifications
export const getNotifications = () => axiosInstance.get("/student/notifications");
export const listMyNotifications = () => axiosInstance.get("/student/notifications"); // alias
export const markNotificationRead = (id) => axiosInstance.patch("/student/notifications/" + id + "/read");
