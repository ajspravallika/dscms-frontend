import { useState, useMemo } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../components/common/Toast';
import * as mentorApi from '../../api/mentor.api';

// Mirrors src/validators/session.validator.js markAttendanceValidator:
// sessionId (required), studentId (required), date (required, ISO),
// status (required, enum: present/absent/excused), remarks (optional).
const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
];

export default function Attendance() {
  const { showToast } = useToast();

  const studentsFetch = useFetch(mentorApi.listMyStudents, (res) => res.data.data.students, []);
  const sessionsFetch = useFetch(mentorApi.listSessions, (res) => res.data.data.sessions, []);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [form, setForm] = useState({
    sessionId: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'present',
    remarks: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const attendanceFetch = useFetch(
    () => (selectedStudentId ? mentorApi.getAttendance(selectedStudentId) : Promise.resolve({ data: { data: { attendance: [] } } })),
    (res) => res.data.data.attendance,
    [selectedStudentId]
  );

  const studentOptions = useMemo(
    () => (studentsFetch.data || []).map((s) => ({ value: s._id, label: `${s.name} (${s.rollNumber})` })),
    [studentsFetch.data]
  );

  // Sessions for the selected student, used so attendance can be tied to a specific session record.
  const sessionOptions = useMemo(
    () =>
      (sessionsFetch.data || [])
        .filter((s) => s.studentId?._id === selectedStudentId)
        .map((s) => ({
          value: s._id,
          label: `${new Date(s.sessionDate).toLocaleDateString()} — ${s.topic}`,
        })),
    [sessionsFetch.data, selectedStudentId]
  );

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedStudentId || !form.sessionId) {
      setFormError('Select a student and the session this attendance relates to.');
      return;
    }

    setIsSubmitting(true);
    try {
      await mentorApi.markAttendance({ ...form, studentId: selectedStudentId });
      showToast('Attendance marked.');
      setForm({ sessionId: '', date: new Date().toISOString().slice(0, 10), status: 'present', remarks: '' });
      attendanceFetch.refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not mark attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell pageTitle="Attendance">
      <PageHeader
        title="Attendance tracking"
        description="Mark attendance against a recorded counseling session for each assigned student."
      />

      <div className="card mb-6 p-5">
        <Select
          label="Select student"
          placeholder={studentsFetch.isLoading ? 'Loading...' : 'Choose a student'}
          options={studentOptions}
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {selectedStudentId && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-ink">Mark attendance</h3>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Select
                label="Related session"
                placeholder={sessionOptions.length ? 'Select a session' : 'No sessions recorded for this student yet'}
                options={sessionOptions}
                value={form.sessionId}
                onChange={handleChange('sessionId')}
                disabled={sessionOptions.length === 0}
              />
              <Input label="Date" type="date" value={form.date} onChange={handleChange('date')} required />
              <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={handleChange('status')} />
              <Input
                label="Remarks (optional)"
                value={form.remarks}
                onChange={handleChange('remarks')}
                placeholder="Any notes about this attendance entry"
              />

              {formError && <ErrorBanner message={formError} />}

              <Button type="submit" isLoading={isSubmitting} className="w-full" disabled={sessionOptions.length === 0}>
                Save attendance
              </Button>
            </form>
          </div>

          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-ink">Attendance history</h3>
            {attendanceFetch.isLoading && <Loader />}
            {attendanceFetch.error && <ErrorBanner message={attendanceFetch.error} />}
            {attendanceFetch.data && attendanceFetch.data.length === 0 && (
              <EmptyState title="No attendance marked yet" description="Use the form to mark the first entry." />
            )}
            <ul className="space-y-2">
              {attendanceFetch.data?.map((record) => (
                <li key={record._id} className="flex items-center justify-between rounded-md border border-line px-3 py-2">
                  <span className="text-sm text-ink">{new Date(record.date).toLocaleDateString()}</span>
                  <StatusBadge status={record.status} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
