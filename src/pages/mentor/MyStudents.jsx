import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import EmptyState from '../../components/common/EmptyState';
import { useFetch } from '../../hooks/useFetch';
import * as mentorApi from '../../api/mentor.api';

const YEAR_LABELS = {
  1: 'Year 1 — First Year',
  2: 'Year 2 — Second Year',
  3: 'Year 3 — Third Year',
  4: 'Year 4 — Fourth Year',
};

export default function MyStudents() {
  const { data: students, isLoading, error } = useFetch(
    mentorApi.listMyStudents,
    (res) => res.data.data.students,
    []
  );

  // Group students by year. Students with no year set go into "Unassigned year".
  const grouped = useMemo(() => {
    if (!students) return {};
    const groups = {};
    for (const student of students) {
      const key = student.year || 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(student);
    }
    return groups;
  }, [students]);

  // Sort year keys: 1, 2, 3, 4, then 'unknown'
  const sortedYears = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => {
      if (a === 'unknown') return 1;
      if (b === 'unknown') return -1;
      return Number(a) - Number(b);
    });
  }, [grouped]);

  return (
    <DashboardShell pageTitle="My Students">
      <PageHeader
        title="Assigned students"
        description="Students are grouped by year. You can only see students currently assigned to you."
      />

      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}

      {students && students.length === 0 && (
        <EmptyState
          title="No students assigned yet"
          description="Once the administrator assigns students to you, they'll appear here."
        />
      )}

      <div className="space-y-6">
        {sortedYears.map((year) => (
          <div key={year} className="card">
            {/* Year header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h3 className="text-sm font-semibold text-ink">
                {year === 'unknown' ? 'Year not set' : YEAR_LABELS[year] || `Year ${year}`}
              </h3>
              <span className="text-xs text-muted">
                {grouped[year].length} student{grouped[year].length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Student table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="px-5 py-3 font-medium text-muted">Name</th>
                    <th className="px-5 py-3 font-medium text-muted">Roll number</th>
                    <th className="px-5 py-3 font-medium text-muted">Department</th>
                    <th className="px-5 py-3 font-medium text-muted">Section</th>
                    <th className="px-5 py-3 font-medium text-muted">Phone</th>
                    <th className="px-5 py-3 font-medium text-muted"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {grouped[year].map((student) => (
                    <tr key={student._id} className="hover:bg-paper/60">
                      <td className="px-5 py-3 text-ink font-medium">{student.name}</td>
                      <td className="px-5 py-3 text-muted">{student.rollNumber}</td>
                      <td className="px-5 py-3 text-muted">{student.department || '—'}</td>
                      <td className="px-5 py-3 text-muted">{student.section || '—'}</td>
                      <td className="px-5 py-3 text-muted">{student.phone || '—'}</td>
                      <td className="px-5 py-3">
                        <Link
                          to={`/mentor/students/${student._id}`}
                          className="text-xs font-medium text-mentor hover:underline"
                        >
                          View profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
