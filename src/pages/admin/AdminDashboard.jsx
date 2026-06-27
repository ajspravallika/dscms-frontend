import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import * as adminApi from '../../api/admin.api';

function StatCard({ label, value, accentClass = 'text-accent', to }) {
  const content = (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-2 font-serif text-3xl font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
  return to ? <Link to={to} className="block transition-opacity hover:opacity-80">{content}</Link> : content;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      setIsLoading(true);
      setError(null);
      try {
        // V1 has no dedicated analytics endpoint, so the dashboard
        // composes existing list endpoints into summary counts.
        const [mentorsRes, studentsRes, assignmentsRes, sessionsRes] = await Promise.all([
          adminApi.listMentors(),
          adminApi.listStudents(),
          adminApi.listAssignments(),
          adminApi.listAllSessions(),
        ]);

        if (!isMounted) return;

        const mentors = mentorsRes.data.data.mentors;
        const students = studentsRes.data.data.students;
        const assignments = assignmentsRes.data.data.assignments;
        const sessions = sessionsRes.data.data.sessions;

        const unassignedStudents = students.filter((s) => !s.mentorId).length;

        setStats({
          totalMentors: mentors.length,
          activeMentors: mentors.filter((m) => m.isActive).length,
          totalStudents: students.length,
          unassignedStudents,
          activeAssignments: assignments.length,
          totalSessions: sessions.length,
        });
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Could not load dashboard data.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardShell pageTitle="Dashboard">
      <PageHeader
        title="Overview"
        description="A snapshot of mentors, students, and counseling activity across the department."
      />

      {isLoading && <Loader label="Loading dashboard..." />}
      {error && <ErrorBanner message={error} />}

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total mentors" value={stats.totalMentors} to="/admin/mentors" />
          <StatCard label="Active mentors" value={stats.activeMentors} to="/admin/mentors" />
          <StatCard label="Total students" value={stats.totalStudents} to="/admin/students" />
          <StatCard
            label="Unassigned students"
            value={stats.unassignedStudents}
            accentClass={stats.unassignedStudents > 0 ? 'text-warn' : 'text-accent'}
            to="/admin/assignments"
          />
          <StatCard label="Active assignments" value={stats.activeAssignments} to="/admin/assignments" />
          <StatCard label="Counseling sessions logged" value={stats.totalSessions} to="/admin/sessions" />
        </div>
      )}
    </DashboardShell>
  );
}
