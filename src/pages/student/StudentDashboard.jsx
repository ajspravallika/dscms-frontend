import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import * as studentApi from '../../api/student.api';

export default function StudentDashboard() {
  const [mentor, setMentor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [mentorRes, notificationsRes] = await Promise.all([
          studentApi.getMyMentor().catch((err) => {
            // 404 here means "no mentor assigned yet" — not a hard failure for the dashboard
            if (err.response?.status === 404) return { data: { data: { mentor: null } } };
            throw err;
          }),
          studentApi.listMyNotifications(),
        ]);

        if (!isMounted) return;
        setMentor(mentorRes.data.data.mentor);
        setNotifications(notificationsRes.data.data.notifications.slice(0, 5));
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Could not load your dashboard.');
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
      <PageHeader title="Welcome back" description="Here's a quick look at your counseling support." />

      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-ink">Your mentor</h3>
            {mentor ? (
              <div>
                <p className="text-sm font-medium text-ink">{mentor.name}</p>
                <p className="text-xs text-muted">{mentor.department} {mentor.designation && `· ${mentor.designation}`}</p>
                <p className="mt-2 text-sm text-muted">{mentor.email}</p>
                <Link to="/student/messages" className="mt-3 inline-block text-sm font-medium text-student hover:underline">
                  Message your mentor →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted">No mentor has been assigned to you yet. Contact the administrator.</p>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-ink">Recent notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted">No notifications yet.</p>
            ) : (
              <ul className="space-y-2">
                {notifications.map((n) => (
                  <li key={n._id} className="text-sm">
                    <p className={n.isRead ? 'text-muted' : 'font-medium text-ink'}>{n.title}</p>
                    <p className="text-xs text-muted">{new Date(n.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/student/notifications" className="mt-3 inline-block text-sm font-medium text-student hover:underline">
              View all →
            </Link>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
