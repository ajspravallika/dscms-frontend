export const ICONS = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M9 21h6",
  students: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  mentors: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  assignments: "M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4",
  sessions: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  record: "M12 4v16m8-8H4",
  reports: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  messages: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  concerns: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  notifications: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  departments: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
};
export const NAV_CONFIG = {
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: ICONS.dashboard },
    { label: "Students", path: "/admin/students", icon: ICONS.students },
    { label: "Mentors", path: "/admin/mentors", icon: ICONS.mentors },
    { label: "Assignments", path: "/admin/assignments", icon: ICONS.assignments },
    { label: "Departments", path: "/admin/departments", icon: ICONS.departments },
    { label: "Counseling Records", path: "/admin/sessions", icon: ICONS.sessions },
  ],
  mentor: [
    { label: "Dashboard", path: "/mentor/dashboard", icon: ICONS.dashboard },
    { label: "My Students", path: "/mentor/students", icon: ICONS.students },
    { label: "Sessions", path: "/mentor/sessions", icon: ICONS.sessions },
    { label: "Record Session", path: "/mentor/sessions/new", icon: ICONS.record },
    { label: "Messages", path: "/mentor/messages", icon: ICONS.messages },
    { label: "Concerns", path: "/mentor/concerns", icon: ICONS.concerns },
    { label: "Reports", path: "/mentor/reports", icon: ICONS.reports },
  ],
  student: [
    { label: "Dashboard", path: "/student/dashboard", icon: ICONS.dashboard },
    { label: "My Mentor", path: "/student/mentor", icon: ICONS.mentors },
    { label: "Counseling History", path: "/student/counseling-history", icon: ICONS.sessions },
    { label: "Messages", path: "/student/messages", icon: ICONS.messages },
    { label: "My Concerns", path: "/student/concerns", icon: ICONS.concerns },
    { label: "Notifications", path: "/student/notifications", icon: ICONS.notifications },
  ],
};
export const ROLE_THEME = {
  admin: { bar: "bg-accent", soft: "bg-accent-soft", text: "text-accent-dark", label: "Administrator" },
  mentor: { bar: "bg-mentor", soft: "bg-mentor-soft", text: "text-mentor", label: "Mentor" },
  student: { bar: "bg-student", soft: "bg-student-soft", text: "text-student", label: "Student" },
};