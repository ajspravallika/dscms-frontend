import { useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import CreateStudentForm from '../../components/forms/CreateStudentForm';
import TempCredentialsCard from '../../components/forms/TempCredentialsCard';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../components/common/Toast';
import * as adminApi from '../../api/admin.api';

export default function ManageStudents() {
  const { showToast } = useToast();
  const { data: students, isLoading, error, refetch } = useFetch(
    adminApi.listStudents,
    (res) => res.data.data.students,
    []
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [createdAccount, setCreatedAccount] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const handleCreate = async (payload) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      const res = await adminApi.createStudent(payload);
      const { student, tempPassword } = res.data.data;
      setCreatedAccount({ email: student.email, tempPassword });
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not create student account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreatedAccount(null);
    setFormError('');
  };

  const handleDeactivate = async (student) => {
    try {
      await adminApi.deactivateStudent(student._id);
      showToast(`${student.name} has been deactivated.`);
      setConfirmDeactivate(null);
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not deactivate student.', 'error');
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'rollNumber', header: 'Roll number' },
    { key: 'email', header: 'Email' },
    { key: 'department', header: 'Department', render: (row) => row.department || '—' },
    { key: 'year', header: 'Year', render: (row) => (row.year ? `Year ${row.year}` : '—') },
    {
      key: 'mentorId',
      header: 'Mentor assigned',
      render: (row) => (row.mentorId ? <StatusBadge status="active" /> : <StatusBadge status="open" />),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => <StatusBadge status={row.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.isActive ? (
          <button
            onClick={() => setConfirmDeactivate(row)}
            className="text-xs font-medium text-warn hover:underline"
          >
            Deactivate
          </button>
        ) : (
          <span className="text-xs text-muted">Deactivated</span>
        ),
    },
  ];

  return (
    <DashboardShell pageTitle="Students">
      <PageHeader
        title="Student accounts"
        description="Create and manage student accounts. Registration is disabled — only admin-created accounts can sign in."
        action={<Button onClick={() => setIsCreateOpen(true)}>Add student</Button>}
      />

      <div className="card">
        <Table
          columns={columns}
          rows={students}
          isLoading={isLoading}
          error={error}
          emptyTitle="No students yet"
          emptyDescription="Add your first student account to get started."
        />
      </div>

      {/* Create student modal */}
      <Modal isOpen={isCreateOpen} onClose={closeCreateModal} title="Add a new student">
        {createdAccount ? (
          <div className="space-y-4">
            <TempCredentialsCard email={createdAccount.email} tempPassword={createdAccount.tempPassword} />
            <Button variant="secondary" className="w-full" onClick={closeCreateModal}>
              Done
            </Button>
          </div>
        ) : (
          <CreateStudentForm onSubmit={handleCreate} isSubmitting={isSubmitting} error={formError} />
        )}
      </Modal>

      {/* Deactivate confirmation */}
      <Modal
        isOpen={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        title="Deactivate student account"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-ink">
          {confirmDeactivate?.name} will no longer be able to sign in. This does not delete their
          counseling history. You can keep this account inactive or contact a developer to
          reactivate it later.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDeactivate(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDeactivate(confirmDeactivate)}>
            Deactivate
          </Button>
        </div>
      </Modal>
    </DashboardShell>
  );
}
