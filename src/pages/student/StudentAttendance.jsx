import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import { useFetch } from '../../hooks/useFetch';
import * as studentApi from '../../api/student.api';

export default function StudentAttendance() {
  const { data: attendance, isLoading, error } = useFetch(
    studentApi.getMyAttendance,
    (res) => res.data.data.attendance,
    []
  );

  const columns = [
    { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks || '—' },
  ];

  return (
    <DashboardShell pageTitle="Attendance">
      <PageHeader title="Your attendance record" />

      <div className="card">
        <Table
          columns={columns}
          rows={attendance}
          isLoading={isLoading}
          error={error}
          emptyTitle="No attendance recorded yet"
        />
      </div>
    </DashboardShell>
  );
}
