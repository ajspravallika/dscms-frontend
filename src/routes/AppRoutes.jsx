import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import Login from "../pages/auth/Login";
import ForcePasswordReset from "../pages/auth/ForcePasswordReset";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageStudents from "../pages/admin/ManageStudents";
import ManageMentors from "../pages/admin/ManageMentors";
import Assignments from "../pages/admin/Assignments";
import Departments from "../pages/admin/Departments";
import AllSessions from "../pages/admin/AllSessions";
import MentorDashboard from "../pages/mentor/MentorDashboard";
import MyStudents from "../pages/mentor/MyStudents";
import RecordSession from "../pages/mentor/RecordSession";
import SessionList from "../pages/mentor/SessionList";
import MentorMessages from "../pages/mentor/Messages";
import MentorConcerns from "../pages/mentor/Concerns";
import MentorReports from "../pages/mentor/Reports";
import StudentDashboard from "../pages/student/StudentDashboard";
import MyMentor from "../pages/student/MyMentor";
import CounselingHistory from "../pages/student/CounselingHistory";
import StudentMessages from "../pages/student/Messages";
import StudentConcerns from "../pages/student/Concerns";
import StudentNotifications from "../pages/student/Notifications";
function RoleHome() { const { user } = useAuth(); if (!user) return <Navigate to="/login" replace />; return <Navigate to={"/" + user.role + "/dashboard"} replace />; }
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/reset-password" element={<ForcePasswordReset />} />
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/mentors" element={<ManageMentors />} />
          <Route path="/admin/assignments" element={<Assignments />} />
          <Route path="/admin/departments" element={<Departments />} />
          <Route path="/admin/sessions" element={<AllSessions />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={["mentor"]} />}>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          <Route path="/mentor/students" element={<MyStudents />} />
          <Route path="/mentor/sessions" element={<SessionList />} />
          <Route path="/mentor/sessions/new" element={<RecordSession />} />
          <Route path="/mentor/messages" element={<MentorMessages />} />
          <Route path="/mentor/messages/:studentId" element={<MentorMessages />} />
          <Route path="/mentor/concerns" element={<MentorConcerns />} />
          <Route path="/mentor/reports" element={<MentorReports />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={["student"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/mentor" element={<MyMentor />} />
          <Route path="/student/counseling-history" element={<CounselingHistory />} />
          <Route path="/student/messages" element={<StudentMessages />} />
          <Route path="/student/concerns" element={<StudentConcerns />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
        </Route>
        <Route path="/" element={<RoleHome />} />
      </Route>
      <Route path="*" element={<div className="flex h-screen items-center justify-center"><p className="font-serif text-2xl text-ink">Page not found</p></div>} />
    </Routes>
  );
}