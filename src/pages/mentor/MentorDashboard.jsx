import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorBanner from "../../components/common/ErrorBanner";
import * as mentorApi from "../../api/mentor.api";

export default function MentorDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    mentorApi.getDashboard().then(r => setData(r.data.data)).catch(e => setError(e.response?.data?.message || "Failed")).finally(() => setIsLoading(false));
  }, []);
  return (
    <DashboardShell pageTitle="Dashboard">
      <PageHeader title="Your Overview" />
      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}
      {data && (<>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
          {[1,2,3,4].map(y => (
            <div key={y} className="card p-4">
              <p className="text-xs text-muted uppercase">Year {y}</p>
              <p className="font-serif text-3xl font-semibold text-mentor mt-1">{data.studentsByYear?.[y] || 0}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="card p-4"><p className="text-xs text-muted uppercase">Drafts</p><p className="font-serif text-2xl font-semibold text-ink mt-1">{data.draftCount || 0}</p></div>
          <div className="card p-4"><p className="text-xs text-muted uppercase">Submitted</p><p className="font-serif text-2xl font-semibold text-accent mt-1">{data.submittedCount || 0}</p></div>
          <div className="card p-4"><p className="text-xs text-muted uppercase">Concerns</p><p className={"font-serif text-2xl font-semibold mt-1 " + (data.openConcerns > 0 ? "text-warn" : "text-ink")}>{data.openConcerns || 0}</p></div>
        </div>
        {data.recentSessions?.length > 0 && (
          <div className="card">
            <div className="border-b border-line px-4 py-3 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-ink">Recent Sessions</h3>
              <Link to="/mentor/sessions" className="text-xs text-mentor hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-line">
              {data.recentSessions.map(s => (
                <div key={s._id} className="px-4 py-3">
                  <p className="text-sm font-medium text-ink">{new Date(s.scheduledDate).toLocaleDateString()} — Year {s.year}</p>
                  <p className="text-xs text-muted capitalize">{s.topic} · {s.presentCount} present · {s.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </>)}
    </DashboardShell>
  );
}