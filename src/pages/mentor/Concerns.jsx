import { useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../components/common/Toast';
import * as mentorApi from '../../api/mentor.api';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
];

function ConcernCard({ concern, onUpdated }) {
  const { showToast } = useToast();
  const [response, setResponse] = useState(concern.mentorResponse || '');
  const [status, setStatus] = useState(concern.status);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      await mentorApi.respondToConcern(concern._id, { mentorResponse: response, status });
      showToast('Concern updated.');
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update the concern.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">{concern.studentId?.name || 'Student'}</p>
          <p className="text-xs text-muted">
            {concern.studentId?.rollNumber} · {new Date(concern.createdAt).toLocaleDateString()} ·{' '}
            <span className="capitalize">{concern.category}</span>
          </p>
        </div>
        <StatusBadge status={concern.status} />
      </div>

      <p className="mt-3 text-sm text-ink">{concern.description}</p>

      <div className="mt-4 space-y-3 border-t border-line pt-4">
        <div>
          <label className="field-label">Your response</label>
          <textarea
            className="field-input min-h-[70px]"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Respond to this concern..."
          />
        </div>
        <div className="flex items-end gap-3">
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-44"
          />
          <Button onClick={handleSave} isLoading={isSaving}>
            Save
          </Button>
        </div>
        {error && <ErrorBanner message={error} />}
      </div>
    </div>
  );
}

export default function MentorConcerns() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: concerns, isLoading, error, refetch } = useFetch(
    () => mentorApi.listConcerns(statusFilter ? { status: statusFilter } : {}),
    (res) => res.data.data.concerns,
    [statusFilter]
  );

  return (
    <DashboardShell pageTitle="Concerns">
      <PageHeader
        title="Student concerns"
        description="Concerns submitted by your assigned students."
        action={
          <Select
            placeholder="All statuses"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44"
          />
        }
      />

      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}
      {concerns && concerns.length === 0 && (
        <EmptyState title="No concerns" description="Concerns submitted by your students will appear here." />
      )}

      <div className="space-y-4">
        {concerns?.map((concern) => (
          <ConcernCard key={concern._id} concern={concern} onUpdated={refetch} />
        ))}
      </div>
    </DashboardShell>
  );
}
