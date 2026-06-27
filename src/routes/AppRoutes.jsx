import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import Login from '../pages/auth/Login';
import ForcePasswordReset from '../pages/auth/ForcePasswordReset';

import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageStudents from '../pages/admin/ManageStudents';
import ManageMentors from '../pages/admin/ManageMentors';
import AssignStudents from '../pages/admin/AssignStudents';
import AllCounselingRecords from '../pages/admin/AllCounselingRecords';
import AllReports from '../pages/admin/AllReports';

import MentorDashboard from '../pages/mentor/MentorDashboard';
import MyStudents from '../pages/mentor/MyStudents';
import StudentProfile from '../pages/mentor/StudentProfile';
import RecordSession from '../pages/mentor/RecordSession';
import Attendance from '../pages/mentor/Attendance';
import MentorMessages from '../pages/mentor/Messages';
import MentorConcerns from '../pages/mentor/Concerns';
import WeeklyReports from '../pages/mentor/WeeklyReports';

import StudentDashboard from '../pages/student/StudentDashboard';
import MyMentor from '../pages/student/MyMentor';
import CounselingHistory from '../pages/student/CounselingHistory';
import StudentAttendance from '../pages/student/StudentAttendance';
import StudentMessages from '../pages/student/Messages';
import StudentConcerns from '../pages/student/Concerns';
import StudentNotifications from '../pages/student/Notifications';

/** Sends an authenticated user to their role's default dashboard. */
function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

/** Simple 404 for unmatched paths within the app shell. */
function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 bg-paper text-center">
      <p className="font-serif text-2xl font-semibold text-ink">Page not found</p>
      <p className="text-sm text-muted">The page you're looking for doesn't exist.</p>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated, but gated on forced password reset */}
      <Route element={<ProtectedRoute />}>
        <Route path="/reset-password" element={<ForcePasswordReset />} />

        {/* Admin */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/mentors" element={<ManageMentors />} />
          <Route path="/admin/assignments" element={<AssignStudents />} />
          <Route path="/admin/sessions" element={<AllCounselingRecords />} />
          <Route path="/admin/reports" element={<AllReports />} />
        </Route>

        {/* Mentor */}
        <Route element={<RoleRoute allowedRoles={['mentor']} />}>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          <Route path="/mentor/students" element={<MyStudents />} />
          <Route path="/mentor/students/:id" element={<StudentProfile />} />
          <Route path="/mentor/sessions" element={<RecordSession />} />
          <Route path="/mentor/attendance" element={<Attendance />} />
          <Route path="/mentor/messages" element={<MentorMessages />} />
          <Route path="/mentor/messages/:studentId" element={<MentorMessages />} />
          <Route path="/mentor/concerns" element={<MentorConcerns />} />
          <Route path="/mentor/reports" element={<WeeklyReports />} />
        </Route>

        {/* Student */}
        <Route element={<RoleRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/mentor" element={<MyMentor />} />
          <Route path="/student/sessions" element={<CounselingHistory />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/messages" element={<StudentMessages />} />
          <Route path="/student/concerns" element={<StudentConcerns />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
        </Route>

        {/* Fallback: send any authenticated user to their dashboard */}
        <Route path="/" element={<RoleHome />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
