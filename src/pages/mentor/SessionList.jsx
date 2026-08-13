import { useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../components/common/Toast';
import * as mentorApi from '../../api/mentor.api';

const YEAR_OPTIONS = [
  { value: '', label: 'All years' },
  { value: '1', label: 'Year 1' },
  { value: '2', label: 'Year 2' },
  { value: '3', label: 'Year 3' },
  { value: '4', label: 'Year 4' },
];

function SessionCard({ session, onSubmit }) {
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detailFetch = useFetch(
    () => expanded ? mentorApi.getSessionDetail(session._id) : Promise.resolve({ data: { data: { studentRecords: [] } } }),
    (res) => res.data.data.studentRecords,
    [expanded]
  );

  const handleSubmitToAdmin = async () => {
    setIsSubmitting(true);
    try {
      await mentorApi.submitSession(session._id);
      showToast('Session report submitted to admin.');
      onSubmit();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not submit.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card mb-4">
      {/* Session header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-line">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-ink">
              {new Date(session.sessionDate).toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
            <span className="badge bg-paper border border-line text-muted capitalize">
              {session.topic}
            </span>
            <span className="badge bg-mentor-soft text-mentor">
              Year {session.year}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            {session.presentCount} present · {session.absentCount} absent · {session.totalStudents} total
          </p>
          {session.generalNotes && (
            <p className="text-xs text-muted mt-1 italic">"{session.generalNotes}"</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {session.submittedToAdmin ? (
            <span className="badge bg-accent-soft text-accent-dark">Submitted to admin</span>
          ) : (
            <Button
              variant="secondary"
              onClick={handleSubmitToAdmin}
              isLoading={isSubmitting}
              className="text-xs"
            >
              Submit to admin
            </Button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-medium text-mentor hover:underline ml-2"
          >
            {expanded ? 'Hide' : 'View details'}
          </button>
        </div>
      </div>

      {/* Expanded student records */}
      {expanded && (
        <div className="px-5 py-4">
          {detailFetch.isLoading && <Loader />}
          {detailFetch.error && <ErrorBanner message={detailFetch.error} />}
          {detailFetch.data && detailFetch.data.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="pb-2 font-medium text-muted">Student</th>
                  <th className="pb-2 font-medium text-muted">Roll No.</th>
                  <th className="pb-2 font-medium text-muted">Attendance</th>
                  <th className="pb-2 font-medium text-muted">Remarks</th>
                  <th className="pb-2 font-medium text-muted">Action items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {detailFetch.data.map((record) => (
                  <tr key={record._id}>
                    <td className="py-2.5 text-ink">{record.studentId?.name}</td>
                    <td className="py-2.5 text-muted">{record.studentId?.rollNumber}</td>
                    <td className="py-2.5">
                      <StatusBadge status={record.attendance} />
                    </td>
                    <td className="py-2.5 text-muted max-w-xs">
                      {record.remarks || <span className="text-muted/50 italic">—</span>}
                    </td>
                    <td className="py-2.5 text-muted max-w-xs">
                      {record.actionItems || <span className="text-muted/50 italic">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default function SessionList() {
  const [yearFilter, setYearFilter] = useState('');

  const { data: sessions, isLoading, error, refetch } = useFetch(
    () => mentorApi.listSessions(yearFilter ? { year: yearFilter } : {}),
    (res) => res.data.data.sessions,
    [yearFilter]
  );

  return (
    <DashboardShell pageTitle="Sessions">
      <PageHeader
        title="Counseling sessions"
        description="All sessions you have recorded. Click 'View details' to see individual student attendance and remarks."
        action={
          <div className="flex items-center gap-3">
            <Select
              placeholder="All years"
              options={YEAR_OPTIONS}
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-36"
            />
            <Button onClick={() => window.location.href = '/mentor/sessions/new'}>
              Record session
            </Button>
          </div>
        }
      />

      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}
      {sessions && sessions.length === 0 && (
        <EmptyState
          title="No sessions recorded yet"
          description="Use 'Record session' to log your first counseling session."
        />
      )}

      {sessions?.map((session) => (
        <SessionCard key={session._id} session={session} onSubmit={refetch} />
      ))}
    </DashboardShell>
  );
}

