import { useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import CreateMentorForm from '../../components/forms/CreateMentorForm';
import TempCredentialsCard from '../../components/forms/TempCredentialsCard';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../components/common/Toast';
import * as adminApi from '../../api/admin.api';

export default function ManageMentors() {
  const { showToast } = useToast();
  const { data: mentors, isLoading, error, refetch } = useFetch(
    adminApi.listMentors,
    (res) => res.data.data.mentors,
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
      const res = await adminApi.createMentor(payload);
      const { mentor, tempPassword } = res.data.data;
      setCreatedAccount({ email: mentor.email, tempPassword });
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not create mentor account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreatedAccount(null);
    setFormError('');
  };

  const handleDeactivate = async (mentor) => {
    try {
      await adminApi.deactivateMentor(mentor._id);
      showToast(`${mentor.name} has been deactivated.`);
      setConfirmDeactivate(null);
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not deactivate mentor.', 'error');
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'department', header: 'Department', render: (row) => row.department || '—' },
    { key: 'designation', header: 'Designation', render: (row) => row.designation || '—' },
    { key: 'maxStudentLoad', header: 'Capacity', render: (row) => row.maxStudentLoad ?? 30 },
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
    <DashboardShell pageTitle="Mentors">
      <PageHeader
        title="Mentor accounts"
        description="Create and manage mentor accounts who will be assigned students for counseling."
        action={<Button onClick={() => setIsCreateOpen(true)}>Add mentor</Button>}
      />

      <div className="card">
        <Table
          columns={columns}
          rows={mentors}
          isLoading={isLoading}
          error={error}
          emptyTitle="No mentors yet"
          emptyDescription="Add your first mentor account to get started."
        />
      </div>

      <Modal isOpen={isCreateOpen} onClose={closeCreateModal} title="Add a new mentor">
        {createdAccount ? (
          <div className="space-y-4">
            <TempCredentialsCard email={createdAccount.email} tempPassword={createdAccount.tempPassword} />
            <Button variant="secondary" className="w-full" onClick={closeCreateModal}>
              Done
            </Button>
          </div>
        ) : (
          <CreateMentorForm onSubmit={handleCreate} isSubmitting={isSubmitting} error={formError} />
        )}
      </Modal>

      <Modal
        isOpen={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        title="Deactivate mentor account"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-ink">
          {confirmDeactivate?.name} will no longer be able to sign in or access their assigned
          students. Reassign their students before deactivating, if needed.
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
