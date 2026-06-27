import { Link } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/common/Table';
import { useFetch } from '../../hooks/useFetch';
import * as mentorApi from '../../api/mentor.api';

export default function MyStudents() {
  const { data: students, isLoading, error } = useFetch(
    mentorApi.listMyStudents,
    (res) => res.data.data.students,
    []
  );

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'rollNumber', header: 'Roll number' },
    { key: 'department', header: 'Department', render: (row) => row.department || '—' },
    { key: 'year', header: 'Year', render: (row) => (row.year ? `Year ${row.year}` : '—') },
    { key: 'section', header: 'Section', render: (row) => row.section || '—' },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <Link to={`/mentor/students/${row._id}`} className="text-xs font-medium text-mentor hover:underline">
          View profile
        </Link>
      ),
    },
  ];

  return (
    <DashboardShell pageTitle="My Students">
      <PageHeader
        title="Assigned students"
        description="You can only see students currently assigned to you by the administrator."
      />

      <div className="card">
        <Table
          columns={columns}
          rows={students}
          isLoading={isLoading}
          error={error}
          emptyTitle="No students assigned yet"
          emptyDescription="Once the administrator assigns students to you, they'll appear here."
        />
      </div>
    </DashboardShell>
  );
}
