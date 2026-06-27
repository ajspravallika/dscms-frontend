import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { useFetch } from '../../hooks/useFetch';
import * as studentApi from '../../api/student.api';

const TYPE_LABEL = {
  message: 'Message',
  session: 'Counseling session',
  concern: 'Concern update',
  report: 'Report',
  system: 'System',
};

export default function StudentNotifications() {
  const { data: notifications, isLoading, error, refetch, setData } = useFetch(
    studentApi.listMyNotifications,
    (res) => res.data.data.notifications,
    []
  );

  const handleMarkRead = async (id) => {
    try {
      await studentApi.markNotificationRead(id);
      // Optimistic update so the badge clears immediately without a full refetch.
      setData((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {
      refetch();
    }
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <DashboardShell pageTitle="Notifications">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.` : 'You\u2019re all caught up.'}
      />

      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}
      {notifications && notifications.length === 0 && (
        <EmptyState title="No notifications yet" description="Updates from your mentor will show up here." />
      )}

      <div className="card divide-y divide-line">
        {notifications?.map((n) => (
          <div key={n._id} className={`flex items-start justify-between gap-4 px-5 py-4 ${!n.isRead ? 'bg-student-soft/40' : ''}`}>
            <div>
              <div className="flex items-center gap-2">
                {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-student" aria-hidden="true" />}
                <p className="text-sm font-medium text-ink">{n.title}</p>
              </div>
              {n.body && <p className="mt-1 text-sm text-muted">{n.body}</p>}
              <p className="mt-1 text-xs text-muted">
                {TYPE_LABEL[n.type] || n.type} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
            {!n.isRead && (
              <Button variant="secondary" onClick={() => handleMarkRead(n._id)} className="flex-shrink-0 text-xs">
                Mark as read
              </Button>
            )}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
