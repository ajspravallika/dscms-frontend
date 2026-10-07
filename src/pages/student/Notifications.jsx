import { useEffect } from "react";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorBanner from "../../components/common/ErrorBanner";
import EmptyState from "../../components/common/EmptyState";
import { useFetch } from "../../hooks/useFetch";
import * as studentApi from "../../api/student.api";

export default function StudentNotifications() {
  const { data: notifications, isLoading, error, setData } = useFetch(
    studentApi.getNotifications,
    r => r.data.data.notifications,
    []
  );

  // Auto mark ALL as read when page opens
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    // Mark all unread as read silently
    Promise.all(unread.map(n => studentApi.markNotificationRead(n._id))).then(() => {
      setData(prev => (prev || []).map(n => ({ ...n, isRead: true })));
    }).catch(() => {});
  }, [notifications?.length]);

  const unread = (notifications || []).filter(n => !n.isRead).length;

  return (
    <DashboardShell pageTitle="Notifications">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread — marking all as read...` : "All caught up."}
      />
      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}
      {notifications?.length === 0 && <EmptyState title="No notifications yet" />}
      <div className="card divide-y divide-line">
        {notifications?.map(n => (
          <div key={n._id} className={"flex items-start gap-4 px-5 py-4 " + (n.isRead ? "" : "bg-student-soft/30")}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {!n.isRead && <span className="h-2 w-2 rounded-full bg-student flex-shrink-0" />}
                <p className="text-sm font-medium text-ink">{n.title}</p>
              </div>
              {n.body && <p className="mt-1 text-sm text-muted">{n.body}</p>}
              <p className="mt-1 text-xs text-muted">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}