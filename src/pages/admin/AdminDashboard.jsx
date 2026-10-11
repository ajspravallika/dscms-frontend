import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorBanner from "../../components/common/ErrorBanner";
import StatusBadge from "../../components/common/StatusBadge";
import * as adminApi from "../../api/admin.api";

function StatCard({ label, value, to, accent = "text-accent" }) {
  const c = (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={"mt-1 font-serif text-3xl font-semibold " + accent}>{value}</p>
    </div>
  );
  return to ? <Link to={to} className="block hover:opacity-80 transition-opacity">{c}</Link> : c;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [mr, sr, ar, sesr] = await Promise.all([adminApi.listMentors(), adminApi.listStudents(), adminApi.listAssignments(), adminApi.getAllSessions()]);
        if (!mounted) return;
        const mentors = mr.data.data.mentors;
        const students = sr.data.data.students;
        const assignments = ar.data.data.assignments;
        const allSessions = sesr.data.data.sessions;
        const yearCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
        students.filter(s => !s.isPassout && s.isActive).forEach(s => { if (s.year) yearCounts[s.year] = (yearCounts[s.year] || 0) + 1; });
        setStats({ activeMentors: mentors.filter(m => m.isActive).length, activeStudents: students.filter(s => !s.isPassout && s.isActive).length, unassigned: students.filter(s => !s.isPassout && s.isActive && !s.mentorId).length, assignments: assignments.length, sessions: allSessions.length, yearCounts });
        setSessions(allSessions.slice(0, 8));
      } catch (err) { if (mounted) setError(err.response?.data?.message || "Failed to load."); }
      finally { if (mounted) setIsLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardShell pageTitle="Dashboard">
      <PageHeader title="Overview" />
      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}
      {stats && (<>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-4">
          <StatCard label="Mentors" value={stats.activeMentors} to="/admin/mentors" />
          <StatCard label="Students" value={stats.activeStudents} to="/admin/students" />
          <StatCard label="Unassigned" value={stats.unassigned} to="/admin/assignments" accent={stats.unassigned > 0 ? "text-warn" : "text-accent"} />
          <StatCard label="Assignments" value={stats.assignments} to="/admin/assignments" />
          <StatCard label="Sessions" value={stats.sessions} to="/admin/sessions" />
        </div>
        <div className="card mb-4 p-4">
          <h3 className="text-sm font-semibold text-ink mb-3">Students by Year</h3>
          <div className="grid grid-cols-4 gap-2">
            {[1,2,3,4].map(y => (
              <div key={y} className="rounded-md bg-paper border border-line p-3 text-center">
                <p className="text-xs text-muted uppercase">Year {y}</p>
                <p className="font-serif text-2xl font-semibold text-ink mt-1">{stats.yearCounts[y] || 0}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="border-b border-line px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Recent Sessions</h3>
            <Link to="/admin/sessions" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          {sessions.length === 0 ? <p className="px-4 py-8 text-center text-sm text-muted">No submitted sessions yet.</p> :
          <div className="divide-y divide-line">
            {sessions.map(s => (
              <div key={s._id} className="px-4 py-3">
                <p className="text-sm font-medium text-ink">{s.mentorName} — Year {s.year}</p>
                <p className="text-xs text-muted">{new Date(s.scheduledDate).toLocaleDateString()} · {s.presentCount} present · {s.absentCount} absent</p>
              </div>
            ))}
          </div>}
        </div>
      </>)}
    </DashboardShell>
  );
}