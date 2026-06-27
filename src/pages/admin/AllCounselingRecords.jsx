import { useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/common/Table';
import Select from '../../components/common/Select';
import { useFetch } from '../../hooks/useFetch';
import * as adminApi from '../../api/admin.api';

const TOPIC_OPTIONS = [
  { value: 'academic', label: 'Academic' },
  { value: 'personal', label: 'Personal' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'career', label: 'Career' },
  { value: 'other', label: 'Other' },
];

export default function AllCounselingRecords() {
  const [topicFilter, setTopicFilter] = useState('');

  const { data: sessions, isLoading, error } = useFetch(
    () => adminApi.listAllSessions(topicFilter ? { topic: topicFilter } : {}),
    (res) => res.data.data.sessions,
    [topicFilter]
  );

  const columns = [
    {
      key: 'sessionDate',
      header: 'Date',
      render: (row) => new Date(row.sessionDate).toLocaleDateString(),
    },
    { key: 'student', header: 'Student', render: (row) => row.studentId?.name || '—' },
    { key: 'mentor', header: 'Mentor', render: (row) => row.mentorId?.name || '—' },
    {
      key: 'topic',
      header: 'Topic',
      render: (row) => <span className="capitalize">{row.topic}</span>,
    },
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
    <DashboardShell pageTitle="Counseling Records">
      <PageHeader
        title="All counseling sessions"
        description="System-wide view across every mentor. Mentors see only their own students; this view is admin-only."
        action={
          <Select
            placeholder="All topics"
            options={TOPIC_OPTIONS}
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="w-44"
          />
        }
      />

      <div className="card">
        <Table
          columns={columns}
          rows={sessions}
          isLoading={isLoading}
          error={error}
          emptyTitle="No counseling sessions recorded yet"
          emptyDescription="Sessions logged by mentors will appear here."
        />
      </div>
    </DashboardShell>
  );
}
