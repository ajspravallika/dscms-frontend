import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import EmptyState from '../../components/common/EmptyState';
import { useFetch } from '../../hooks/useFetch';
import * as studentApi from '../../api/student.api';

export default function CounselingHistory() {
  const { data: sessions, isLoading, error } = useFetch(
    studentApi.getMySessions,
    (res) => res.data.data.sessions,
    []
  );

  return (
    <DashboardShell pageTitle="Counseling History">
      <PageHeader
        title="Your counseling history"
        description="A record of your past counseling sessions. Some mentor notes are kept private and won't appear here."
      />

      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}
      {sessions && sessions.length === 0 && (
        <EmptyState title="No counseling sessions yet" description="Your session history will appear here after your first meeting." />
      )}

      <div className="space-y-3">
        {sessions?.map((session) => (
          <div key={session._id} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink capitalize">{session.topic}</span>
              <span className="text-xs text-muted">{new Date(session.sessionDate).toLocaleDateString()}</span>
            </div>
            <p className="mt-2 text-sm text-ink">{session.remarks}</p>
            {session.actionItems && (
              <p className="mt-2 text-sm text-muted"><span className="font-medium text-ink">Next steps: </span>{session.actionItems}</p>
            )}
            {session.nextFollowUpDate && (
              <p className="mt-1 text-xs text-student">
                Follow-up: {new Date(session.nextFollowUpDate).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
