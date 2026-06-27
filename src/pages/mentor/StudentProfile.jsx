import { useParams, Link } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import StatusBadge from '../../components/common/StatusBadge';
import { useFetch } from '../../hooks/useFetch';
import * as mentorApi from '../../api/mentor.api';

export default function StudentProfile() {
  const { id } = useParams();

  const studentFetch = useFetch(() => mentorApi.getMyStudentById(id), (res) => res.data.data.student, [id]);
  const sessionsFetch = useFetch(() => mentorApi.getSessionHistory(id), (res) => res.data.data.sessions, [id]);
  const attendanceFetch = useFetch(() => mentorApi.getAttendance(id), (res) => res.data.data.attendance, [id]);

  const student = studentFetch.data;

  return (
    <DashboardShell pageTitle="Student Profile">
      {studentFetch.isLoading && <Loader label="Loading student..." />}
      {studentFetch.error && <ErrorBanner message={studentFetch.error} />}

      {student && (
        <>
          <PageHeader
            title={student.name}
            description={`${student.rollNumber} · ${student.department || 'No department'} ${student.year ? `· Year ${student.year}` : ''}`}
            action={
              <div className="flex gap-2">
                <Link to={`/mentor/messages/${id}`} className="btn-secondary">Message student</Link>
                <Link to="/mentor/sessions" className="btn-secondary">Record session</Link>
                <Link to="/mentor/attendance" className="btn-primary">Mark attendance</Link>
              </div>
            }
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Contact card */}
            <div className="card p-5 lg:col-span-1">
              <h3 className="mb-3 text-sm font-semibold text-ink">Contact details</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted">Email</dt>
                  <dd className="text-ink">{student.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Phone</dt>
                  <dd className="text-ink">{student.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Parent contact</dt>
                  <dd className="text-ink">{student.parentContact || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Section</dt>
                  <dd className="text-ink">{student.section || '—'}</dd>
                </div>
              </dl>
            </div>

            {/* Counseling history */}
            <div className="card p-5 lg:col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-ink">Counseling history</h3>
              {sessionsFetch.isLoading && <Loader />}
              {sessionsFetch.error && <ErrorBanner message={sessionsFetch.error} />}
              {sessionsFetch.data && sessionsFetch.data.length === 0 && (
                <p className="text-sm text-muted">No counseling sessions recorded yet.</p>
              )}
              <ul className="space-y-3">
                {sessionsFetch.data?.map((session) => (
                  <li key={session._id} className="rounded-md border border-line p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink capitalize">{session.topic}</span>
                      <span className="text-xs text-muted">
                        {new Date(session.sessionDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{session.remarks}</p>
                    {session.nextFollowUpDate && (
                      <p className="mt-1 text-xs text-mentor">
                        Follow-up: {new Date(session.nextFollowUpDate).toLocaleDateString()}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Attendance */}
          <div className="card mt-6 p-5">
            <h3 className="mb-3 text-sm font-semibold text-ink">Attendance record</h3>
            {attendanceFetch.isLoading && <Loader />}
            {attendanceFetch.error && <ErrorBanner message={attendanceFetch.error} />}
            {attendanceFetch.data && attendanceFetch.data.length === 0 && (
              <p className="text-sm text-muted">No attendance marked yet.</p>
            )}
            <div className="flex flex-wrap gap-2">
              {attendanceFetch.data?.map((record) => (
                <div key={record._id} className="flex items-center gap-2 rounded-md border border-line px-3 py-2">
                  <span className="text-xs text-muted">{new Date(record.date).toLocaleDateString()}</span>
                  <StatusBadge status={record.status} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
