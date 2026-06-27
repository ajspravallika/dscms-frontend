import { useState, useMemo } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/common/Table';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';
import Modal from '../../components/common/Modal';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../components/common/Toast';
import * as mentorApi from '../../api/mentor.api';

// Mirrors src/validators/session.validator.js createSessionValidator:
// studentId (required), sessionDate (required, ISO date), topic (optional,
// enum), remarks (required), actionItems (optional), nextFollowUpDate
// (optional, ISO date), visibility (optional, enum). mode is fixed to
// 'in-person' server-side — V1 deliberately preserves face-to-face counseling.
const TOPIC_OPTIONS = [
  { value: 'academic', label: 'Academic' },
  { value: 'personal', label: 'Personal' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'career', label: 'Career' },
  { value: 'other', label: 'Other' },
];

const VISIBILITY_OPTIONS = [
  { value: 'student-visible', label: 'Visible to student' },
  { value: 'mentor-only', label: 'Mentor-only (private note)' },
];

export default function RecordSession() {
  const { showToast } = useToast();

  const studentsFetch = useFetch(mentorApi.listMyStudents, (res) => res.data.data.students, []);
  const sessionsFetch = useFetch(mentorApi.listSessions, (res) => res.data.data.sessions, []);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    studentId: '',
    sessionDate: new Date().toISOString().slice(0, 10),
    topic: 'academic',
    remarks: '',
    actionItems: '',
    nextFollowUpDate: '',
    visibility: 'student-visible',
  });

  const studentOptions = useMemo(
    () => (studentsFetch.data || []).map((s) => ({ value: s._id, label: `${s.name} (${s.rollNumber})` })),
    [studentsFetch.data]
  );

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const resetForm = () =>
    setForm({
      studentId: '',
      sessionDate: new Date().toISOString().slice(0, 10),
      topic: 'academic',
      remarks: '',
      actionItems: '',
      nextFollowUpDate: '',
      visibility: 'student-visible',
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.studentId || !form.remarks.trim()) {
      setFormError('Select a student and enter your counseling remarks.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.nextFollowUpDate) delete payload.nextFollowUpDate;
      if (!payload.actionItems) delete payload.actionItems;

      await mentorApi.createSession(payload);
      showToast('Counseling session recorded.');
      resetForm();
      setIsFormOpen(false);
      sessionsFetch.refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not record the session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'sessionDate',
      header: 'Date',
      render: (row) => new Date(row.sessionDate).toLocaleDateString(),
    },
    { key: 'student', header: 'Student', render: (row) => row.studentId?.name || '—' },
    { key: 'topic', header: 'Topic', render: (row) => <span className="capitalize">{row.topic}</span> },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (row) => (
        <span className="block max-w-xs truncate" title={row.remarks}>
          {row.remarks}
        </span>
      ),
    },
    {
      key: 'visibility',
      header: 'Visibility',
      render: (row) => (
        <span className="text-xs text-muted">
          {row.visibility === 'mentor-only' ? 'Mentor only' : 'Student-visible'}
        </span>
      ),
    },
  ];

  return (
    <DashboardShell pageTitle="Sessions">
      <PageHeader
        title="Counseling sessions"
        description="Record a session after each face-to-face meeting. This system tracks records only — it does not replace in-person counseling."
        action={<Button onClick={() => setIsFormOpen(true)}>Record session</Button>}
      />

      <div className="card">
        <Table
          columns={columns}
          rows={sessionsFetch.data}
          isLoading={sessionsFetch.isLoading}
          error={sessionsFetch.error}
          emptyTitle="No sessions recorded yet"
          emptyDescription="Record your first counseling session using the button above."
        />
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Record a counseling session">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Select
            label="Student"
            placeholder={studentsFetch.isLoading ? 'Loading...' : 'Select a student'}
            options={studentOptions}
            value={form.studentId}
            onChange={handleChange('studentId')}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Session date"
              type="date"
              value={form.sessionDate}
              onChange={handleChange('sessionDate')}
              required
            />
            <Select label="Topic" options={TOPIC_OPTIONS} value={form.topic} onChange={handleChange('topic')} />
          </div>

          <div>
            <label className="field-label">Counseling remarks</label>
            <textarea
              className="field-input min-h-[100px]"
              value={form.remarks}
              onChange={handleChange('remarks')}
              placeholder="What was discussed during the session?"
              required
            />
          </div>

          <div>
            <label className="field-label">Action items (optional)</label>
            <textarea
              className="field-input min-h-[70px]"
              value={form.actionItems}
              onChange={handleChange('actionItems')}
              placeholder="Agreed next steps"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Next follow-up date (optional)"
              type="date"
              value={form.nextFollowUpDate}
              onChange={handleChange('nextFollowUpDate')}
            />
            <Select
              label="Visibility"
              options={VISIBILITY_OPTIONS}
              value={form.visibility}
              onChange={handleChange('visibility')}
            />
          </div>

          {formError && <ErrorBanner message={formError} />}

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Save session
          </Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
