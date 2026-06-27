import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/common/Table';
import { useFetch } from '../../hooks/useFetch';
import * as adminApi from '../../api/admin.api';

export default function AllReports() {
  const { data: reports, isLoading, error } = useFetch(
    adminApi.listAllReports,
    (res) => res.data.data.reports,
    []
  );

  const columns = [
    { key: 'mentor', header: 'Mentor', render: (row) => row.mentorId?.name || '—' },
    { key: 'department', header: 'Department', render: (row) => row.mentorId?.department || '—' },
    {
      key: 'week',
      header: 'Week',
      render: (row) =>
        `${new Date(row.weekStartDate).toLocaleDateString()} – ${new Date(row.weekEndDate).toLocaleDateString()}`,
    },
    { key: 'totalStudentsCounseled', header: 'Students counseled' },
    { key: 'totalSessionsHeld', header: 'Sessions held' },
    {
      key: 'attendanceSummary',
      header: 'Attendance (P / A / E)',
      render: (row) =>
        `${row.attendanceSummary?.present ?? 0} / ${row.attendanceSummary?.absent ?? 0} / ${row.attendanceSummary?.excused ?? 0}`,
    },
    { key: 'openConcerns', header: 'Open concerns' },
  ];

  return (
    <DashboardShell pageTitle="Weekly Reports">
      <PageHeader
        title="Mentor weekly reports"
        description="Reports are generated on demand by each mentor (no automated scheduling in V1)."
      />

      <div className="card">
        <Table
          columns={columns}
          rows={reports}
          isLoading={isLoading}
          error={error}
          emptyTitle="No reports submitted yet"
          emptyDescription="Reports will appear here once mentors generate their weekly summaries."
        />
      </div>
    </DashboardShell>
  );
}
