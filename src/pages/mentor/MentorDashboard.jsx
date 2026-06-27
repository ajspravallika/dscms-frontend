import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import * as mentorApi from '../../api/mentor.api';

function StatCard({ label, value, to, accentClass = 'text-mentor' }) {
  const content = (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-2 font-serif text-3xl font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
  return to ? <Link to={to} className="block transition-opacity hover:opacity-80">{content}</Link> : content;
}

export default function MentorDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [studentsRes, sessionsRes, concernsRes] = await Promise.all([
          mentorApi.listMyStudents(),
          mentorApi.listSessions(),
          mentorApi.listConcerns({ status: 'open' }),
        ]);

        if (!isMounted) return;

        const students = studentsRes.data.data.students;
        const sessions = sessionsRes.data.data.sessions;
        const openConcerns = concernsRes.data.data.concerns;

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const sessionsThisWeek = sessions.filter((s) => new Date(s.sessionDate) >= sevenDaysAgo);

        setStats({
          totalStudents: students.length,
          sessionsThisWeek: sessionsThisWeek.length,
          openConcerns: openConcerns.length,
        });
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Could not load dashboard data.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardShell pageTitle="Dashboard">
      <PageHeader
        title="Your mentoring overview"
        description="A summary of your assigned students and recent counseling activity."
      />

      {isLoading && <Loader label="Loading dashboard..." />}
      {error && <ErrorBanner message={error} />}

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Assigned students" value={stats.totalStudents} to="/mentor/students" />
          <StatCard label="Sessions this week" value={stats.sessionsThisWeek} to="/mentor/sessions" />
          <StatCard
            label="Open concerns"
            value={stats.openConcerns}
            accentClass={stats.openConcerns > 0 ? 'text-warn' : 'text-mentor'}
            to="/mentor/concerns"
          />
        </div>
      )}
    </DashboardShell>
  );
}
