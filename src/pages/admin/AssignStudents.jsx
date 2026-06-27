import { useState, useMemo } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/common/Table';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../components/common/Toast';
import * as adminApi from '../../api/admin.api';

export default function AssignStudents() {
  const { showToast } = useToast();

  const studentsFetch = useFetch(adminApi.listStudents, (res) => res.data.data.students, []);
  const mentorsFetch = useFetch(adminApi.listMentors, (res) => res.data.data.mentors, []);
  const assignmentsFetch = useFetch(adminApi.listAssignments, (res) => res.data.data.assignments, []);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const studentOptions = useMemo(
    () =>
      (studentsFetch.data || [])
        .filter((s) => s.isActive)
        .map((s) => ({
          value: s._id,
          label: `${s.name} (${s.rollNumber})${s.mentorId ? ' — currently assigned' : ''}`,
        })),
    [studentsFetch.data]
  );

  const mentorOptions = useMemo(
    () =>
      (mentorsFetch.data || [])
        .filter((m) => m.isActive)
        .map((m) => ({ value: m._id, label: `${m.name}${m.department ? ` — ${m.department}` : ''}` })),
    [mentorsFetch.data]
  );

  const handleAssign = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedStudentId || !selectedMentorId) {
      setFormError('Select both a mentor and a student.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.assignStudent(selectedMentorId, selectedStudentId);
      showToast('Student assigned successfully.');
      setSelectedStudentId('');
      setSelectedMentorId('');
      assignmentsFetch.refetch();
      studentsFetch.refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not complete the assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: 'student', header: 'Student', render: (row) => row.studentId?.name || '—' },
    { key: 'rollNumber', header: 'Roll number', render: (row) => row.studentId?.rollNumber || '—' },
    { key: 'mentor', header: 'Mentor', render: (row) => row.mentorId?.name || '—' },
    { key: 'department', header: 'Department', render: (row) => row.mentorId?.department || '—' },
    {
      key: 'assignedAt',
      header: 'Assigned on',
      render: (row) => new Date(row.assignedAt).toLocaleDateString(),
    },
  ];

  return (
    <DashboardShell pageTitle="Assignments">
      <PageHeader
        title="Student–mentor assignments"
        description="Assign each student to exactly one mentor. Re-assigning a student automatically ends their previous assignment."
      />

      <div className="card mb-6 p-5">
        <h3 className="mb-4 text-sm font-semibold text-ink">Create a new assignment</h3>
        <form onSubmit={handleAssign} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <Select
            label="Student"
            placeholder={studentsFetch.isLoading ? 'Loading students...' : 'Select a student'}
            options={studentOptions}
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          />
          <Select
            label="Mentor"
            placeholder={mentorsFetch.isLoading ? 'Loading mentors...' : 'Select a mentor'}
            options={mentorOptions}
            value={selectedMentorId}
            onChange={(e) => setSelectedMentorId(e.target.value)}
          />
          <Button type="submit" isLoading={isSubmitting} className="h-fit">
            Assign
          </Button>
        </form>
        {formError && <div className="mt-4"><ErrorBanner message={formError} /></div>}
      </div>

      <div className="card">
        <div className="border-b border-line px-4 py-3">
          <h3 className="text-sm font-semibold text-ink">Active assignments</h3>
        </div>
        <Table
          columns={columns}
          rows={assignmentsFetch.data}
          isLoading={assignmentsFetch.isLoading}
          error={assignmentsFetch.error}
          emptyTitle="No assignments yet"
          emptyDescription="Use the form above to assign your first student to a mentor."
        />
      </div>
    </DashboardShell>
  );
}
