import { useEffect, useState } from "react";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Loader from "../../components/common/Loader";
import * as studentApi from "../../api/student.api";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    studentApi.getDashboard().then(r => setData(r.data.data)).catch(() => {}).finally(() => setIsLoading(false));
  }, []);
  return (
    <DashboardShell pageTitle="Dashboard">
      <PageHeader title="Your Dashboard" />
      {isLoading && <Loader />}
      {data && (<>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="card p-4"><p className="text-xs text-muted uppercase">Notifications</p><p className="font-serif text-3xl font-semibold text-ink mt-1">{data.unreadNotifications || 0}</p></div>
          <div className="card p-4"><p className="text-xs text-muted uppercase">Concerns</p><p className={"font-serif text-3xl font-semibold mt-1 " + (data.openConcerns > 0 ? "text-warn" : "text-ink")}>{data.openConcerns || 0}</p></div>
        </div>
        {data.mentor && (
          <div className="card p-4 mb-4">
            <p className="text-xs text-muted uppercase mb-2">Your Mentor</p>
            <p className="text-sm font-semibold text-ink">{data.mentor.name}</p>
            <p className="text-xs text-muted mt-0.5">{data.mentor.department}</p>
            <p className="text-xs text-muted">{data.mentor.email}</p>
          </div>
        )}
        {data.recentHistory?.length > 0 && (
          <div className="card">
            <div className="border-b border-line px-4 py-3"><h3 className="text-sm font-semibold text-ink">Recent Sessions</h3></div>
            <div className="divide-y divide-line">
              {data.recentHistory.map((r, i) => (
                <div key={i} className="px-4 py-3">
                  <p className="text-sm font-medium text-ink">{new Date(r.scheduledDate).toLocaleDateString()} <span className="text-muted capitalize">· {r.topic}</span></p>
                  <p className="text-xs text-muted capitalize">{r.record?.attendance || "absent"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </>)}
    </DashboardShell>
  );
}