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
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const unassignedStudents = useMemo(
    () => (studentsFetch.data || []).filter((s) => s.isActive),
    [studentsFetch.data]
  );
  const mentorOptions = useMemo(
    () =>
      (mentorsFetch.data || [])
        .filter((m) => m.isActive)
        .map((m) => ({ value: m._id, label: `${m.name}${m.department ? ` — ${m.department}` : ''}` })),
    [mentorsFetch.data]
  );
  const toggleStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };
  const selectAll = () => {
    setSelectedStudentIds(unassignedStudents.map((s) => s._id));
  };
  const clearAll = () => setSelectedStudentIds([]);
  const handleAssign = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!selectedMentorId) {
      setFormError('Please select a mentor.');
      return;
    }
    if (selectedStudentIds.length === 0) {
      setFormError('Please select at least one student.');
      return;
    }
    setIsSubmitting(true);
    let successCount = 0;
    let failCount = 0;
    // The backend /admin/assignments endpoint handles one student at a time.
    // We call it in parallel for all selected students for speed.
    await Promise.all(
      selectedStudentIds.map((studentId) =>
        adminApi
          .assignStudent(selectedMentorId, studentId)
          .then(() => successCount++)
          .catch(() => failCount++)
      )
    );

    if (successCount > 0) {
      showToast(`${successCount} student${successCount > 1 ? 's' : ''} assigned successfully.`);
    }
    if (failCount > 0) {
      setFormError(`${failCount} student(s) could not be assigned — they may already have an active assignment.`);
    }

    setSelectedStudentIds([]);
    setSelectedMentorId('');
    assignmentsFetch.refetch();
    studentsFetch.refetch();
    setIsSubmitting(false);
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
        description="Select a mentor and one or more students, then click Assign. Re-assigning a student automatically ends their previous assignment."
      />

      <div className="card mb-6 p-5">
        <h3 className="mb-4 text-sm font-semibold text-ink">Create assignments</h3>
        <form onSubmit={handleAssign} className="space-y-4">

          {/* Mentor picker */}
          <Select
            label="Mentor"
            placeholder={mentorsFetch.isLoading ? 'Loading mentors...' : 'Select a mentor'}
            options={mentorOptions}
            value={selectedMentorId}
            onChange={(e) => setSelectedMentorId(e.target.value)}
          />

          {/* Multi-student picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="field-label mb-0">
                Students ({selectedStudentIds.length} selected)
              </label>
              <div className="flex gap-3 text-xs">
                <button type="button" onClick={selectAll} className="text-accent hover:underline">
                  Select all
                </button>
                <button type="button" onClick={clearAll} className="text-muted hover:underline">
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto rounded-md border border-line bg-surface divide-y divide-line">
              {studentsFetch.isLoading && (
                <p className="px-4 py-3 text-sm text-muted">Loading students...</p>
              )}
              {!studentsFetch.isLoading && unassignedStudents.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted">No active students found.</p>
              )}
              {unassignedStudents.map((student) => {
                const isChecked = selectedStudentIds.includes(student._id);
                return (
                  <label
                    key={student._id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-paper
                      ${isChecked ? 'bg-accent-soft' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStudent(student._id)}
                      className="h-4 w-4 rounded border-line accent-accent"
                    />
                    <span className="text-sm text-ink">{student.name}</span>
                    <span className="text-xs text-muted ml-1">({student.rollNumber})</span>
                    {student.mentorId && (
                      <span className="ml-auto text-xs text-warn">currently assigned</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {formError && <ErrorBanner message={formError} />}

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            {isSubmitting
              ? 'Assigning...'
              : `Assign ${selectedStudentIds.length > 0 ? selectedStudentIds.length : ''} student${selectedStudentIds.length !== 1 ? 's' : ''} to mentor`}
          </Button>
        </form>
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
          emptyDescription="Use the form above to assign students to a mentor."
        />
      </div>
    </DashboardShell>
  );
}
